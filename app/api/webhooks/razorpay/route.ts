import { NextResponse } from 'next/server';
import { RazorpayAdapter } from '../../../../lib/infrastructure/adapters/payment/RazorpayAdapter';
import { eventBus } from '../../../../lib/infrastructure/events/EventBus';
import { OrderPaidEvent } from '../../../../lib/core/domain/events/DomainEvent';

const razorpayAdapter = new RazorpayAdapter();

import { prisma } from "@/lib/infrastructure/database/prisma";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    // 1. Verify Webhook Signature
    const verification = razorpayAdapter.verifyWebhookSignature(rawBody, signature);
    if (!verification.isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    const eventId = payload.payload?.payment?.entity?.id || crypto.randomUUID();

    // 2. Idempotency Check via WebhookEvent table
    const existingWebhook = await prisma.webhookEvent.findFirst({
      where: {
        provider: 'razorpay',
        id: eventId,
      },
    });

    if (existingWebhook && existingWebhook.status === 'processed') {
      return NextResponse.json({ message: 'Webhook already processed' }, { status: 200 });
    }

    // 3. Log Webhook Receipt
    await prisma.webhookEvent.create({
      data: {
        id: eventId,
        provider: 'razorpay',
        eventType,
        payload,
        status: 'processing',
      },
    });

    // 4. Process Payment Captured Event
    if (eventType === 'payment.captured' && verification.transactionId) {
      const orderId = payload.payload.payment.entity.notes?.orderId || payload.payload.payment.entity.description;

      if (orderId) {
        // Update local Order & Payment state
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'confirmed',
            paymentStatus: 'paid',
          },
        });

        await prisma.payment.create({
          data: {
            orderId,
            amount: verification.amount || 0,
            provider: 'razorpay',
            transactionId: verification.transactionId,
            status: 'captured',
          },
        });

        // 5. Emit Domain Event (writes to Outbox table automatically)
        const orderPaidEvent = new OrderPaidEvent(orderId, verification.amount || 0, verification.transactionId);
        await eventBus.publish(orderPaidEvent);
      }
    }

    // Mark Webhook as Processed
    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { status: 'processed', processedAt: new Date() },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
