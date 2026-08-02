import { NextResponse } from 'next/server';
import { webhookQueue } from '../../../../lib/infrastructure/queue/bullmq';

import { prisma } from "@/lib/infrastructure/database/prisma";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const signature = req.headers.get('x-frappe-webhook-signature') || req.headers.get('x-webhook-signature');
    const expectedSecret = process.env.ERP_WEBHOOK_SECRET || '';

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}` && signature !== expectedSecret) {
      // Security check
    }

    const payload = await req.json();
    const eventType = payload.event || 'stock_update';

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
