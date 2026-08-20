import { NextResponse } from 'next/server';
import { webhookQueue } from '../../../../lib/infrastructure/queue/bullmq';
import { WebhookRepository } from "@/lib/repositories/webhook-repository";
import { frappe } from "@/lib/infrastructure/erpnext/FrappeClient";
import { RateLimiter } from "@/lib/infrastructure/rate-limiter";
import { Logger } from "@/lib/infrastructure/logger";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const limit = parseInt(process.env.RATE_LIMIT_WEBHOOK_MAX || "50");
    const windowSec = parseInt(process.env.RATE_LIMIT_WEBHOOK_WINDOW_SEC || "60");
    const { success } = await RateLimiter.check(`ratelimit:webhook:erpnext:${ip}`, limit, windowSec);
    if (!success) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-frappe-webhook-signature') || '';

    if (!frappe.verifyWebhookSignature(rawBody, signature)) {
      Logger.warn('[ERP Webhook] Unauthorized request. Invalid signature.');
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

    const rawEventId = req.headers.get('x-frappe-webhook-id') || payload.name || crypto.randomUUID();
    const eventId = `erpnext:${rawEventId}`;

    // Store in WebhookEvent for audit & fast acknowledgment
    let webhookRecord;
    try {
      webhookRecord = await WebhookRepository.createEvent({
        id: eventId,
        provider: 'erpnext',
        eventType,
        payload,
        status: 'PENDING',
      });
    } catch (e: any) {
      if (e.code === 'P2002') { // Unique constraint violation
        const existing = await WebhookRepository.findEventById(eventId);
        if (existing?.status === 'PROCESSED' || existing?.status === 'COMPLETED' as any) {
          return NextResponse.json({ message: 'Webhook already processed' }, { status: 200 });
        }
        if (existing?.status === 'PENDING' || existing?.status === 'PROCESSING') {
          return NextResponse.json({ message: 'Webhook is already processing concurrently' }, { status: 409 });
        }
        // If 'failed', allow retry by updating status back to pending
        webhookRecord = await WebhookRepository.updateEventStatus(eventId, 'PENDING');
      } else {
        throw e;
      }
    }

    // Enqueue for async processing in BullMQ worker
    await webhookQueue.add('process-erp-webhook', {
      webhookId: webhookRecord.id,
      eventType,
      payload,
    });

    return NextResponse.json({ success: true, message: 'Queued for processing' }, { status: 202 });
  } catch (error: any) {
    Logger.error('ERPNext Webhook Error', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
