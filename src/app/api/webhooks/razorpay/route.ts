import { NextResponse } from 'next/server';
import { RazorpayAdapter } from '../../../../lib/infrastructure/adapters/payment/RazorpayAdapter';
import { eventBus } from '../../../../lib/infrastructure/events/EventBus';
import { OrderPaidEvent } from '../../../../lib/core/domain/events/DomainEvent';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { getServerEnv } from '../../../../lib/core/config/env';

const razorpayAdapter = new RazorpayAdapter();

import { prisma } from "@/lib/infrastructure/database/prisma";

import { RateLimiter } from "@/lib/infrastructure/rate-limiter";
import { OrderService } from "../../../../lib/core/application/OrderService";

export async function POST(req: Request) {
  // Try to get IP, fallback to a global ratelimit if we can't extract IP from standard Request
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const key = `ratelimit:webhook:razorpay:${ip}`;
  const limit = parseInt(process.env.RATE_LIMIT_WEBHOOK_MAX || "100");
  const windowSec = parseInt(process.env.RATE_LIMIT_WEBHOOK_WINDOW_SEC || "60");

  const { success } = await RateLimiter.check(key, limit, windowSec);
  if (!success) {
    return NextResponse.json({ error: "Too many webhook requests." }, { status: 429 });
  }

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
    // Idempotency key from Razorpay payload
    const eventId = req.headers.get('x-razorpay-event-id') || payload.id || crypto.randomUUID();

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

      if (!orderId) {
        console.error('Razorpay Webhook Error: orderId missing in payload', JSON.stringify(payload));
        await prisma.webhookEvent.update({
          where: { id: eventId },
          data: { status: 'failed', processedAt: new Date() },
        });
        return NextResponse.json({ success: true }, { status: 200 });
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { total: true }
      });

      if (order) {
        const result = await OrderService.confirmPayment(orderId, order.total.toNumber(), verification.transactionId);
        if (result.message === "Race condition mitigated") {
          console.log('Webhook race condition caught for transaction', verification.transactionId);
        }
      }
    } else if (eventType === 'refund.processed') {
      const refundId = payload.payload.refund.entity.id;
      const amount = payload.payload.refund.entity.amount / 100;
      
      const existingRefund = await prisma.refund.findFirst({
        where: { transactionId: refundId }
      });
      
      if (existingRefund) {
        await prisma.refund.update({
          where: { id: existingRefund.id },
          data: { status: 'COMPLETED' }
        });
        
        await prisma.auditLog.create({
          data: {
            action: "REFUND_WEBHOOK_PROCESSED",
            entity: "Order",
            entityId: existingRefund.orderId,
            details: { refundId, amount }
          }
        });
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
