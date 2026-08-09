import { NextResponse } from 'next/server';
import { webhookQueue } from '../../../../lib/infrastructure/queue/bullmq';
import { prisma } from "@/lib/infrastructure/database/prisma";
import { frappe } from "@/lib/infrastructure/erpnext/FrappeClient";

export async function POST(req: Request) {
  try {
    // Basic rate limit to prevent spam (max 50 reqs / min per IP)
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Quick in-memory store hack (resets when Edge isolate goes down)
    const globalStore = global as any;
    globalStore.webhookRateLimit = globalStore.webhookRateLimit || new Map();
    const store = globalStore.webhookRateLimit;
    
    const now = Date.now();
    const attempt = store.get(ip) || { count: 0, timestamp: now };
    
    if (now - attempt.timestamp > 60000) {
      attempt.count = 1;
      attempt.timestamp = now;
    } else {
      attempt.count += 1;
    }
    
    store.set(ip, attempt);
    
    if (attempt.count > 50) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-frappe-webhook-signature') || '';

    if (!frappe.verifyWebhookSignature(rawBody, signature)) {
      console.error('[ERP Webhook] Unauthorized request. Invalid signature.');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const docType = payload.doctype;
    let eventType = payload.event;
    if (!eventType && docType) {
      if (docType === 'Delivery Note') eventType = 'delivery_note';
      else if (docType === 'Sales Invoice') eventType = 'sales_invoice';
      else if (docType === 'Sales Order') eventType = 'sales_order';
      else eventType = 'stock_update';
    } else if (!eventType) {
      eventType = 'stock_update';
    }

    // Store in WebhookEvent for audit & fast acknowledgment
    const webhookRecord = await prisma.webhookEvent.create({
      data: {
        provider: 'erpnext',
        eventType,
        payload,
        status: 'pending',
      },
    });

    // Enqueue for async processing in BullMQ worker
    await webhookQueue.add('process-erp-webhook', {
      webhookId: webhookRecord.id,
      eventType,
      payload,
    });

    return NextResponse.json({ success: true, message: 'Queued for processing' }, { status: 202 });
  } catch (error: any) {
    console.error('ERPNext Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
