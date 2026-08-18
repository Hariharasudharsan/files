import { NextResponse } from 'next/server';
import { RazorpayAdapter } from '../../../../lib/infrastructure/adapters/payment/RazorpayAdapter';
import { prisma } from "@/lib/infrastructure/database/prisma";
import { RateLimiter } from "@/lib/infrastructure/rate-limiter";
import { OrderService } from "../../../../lib/core/application/OrderService";
import { completeRefund } from "../../../../lib/core/application/refund-service";
import { Logger } from "@/lib/infrastructure/logger";

const razorpayAdapter = new RazorpayAdapter();

export async function POST(req: Request) {
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

    // 1. Verify Webhook Signature (now constant-time)
    const verification = razorpayAdapter.verifyWebhookSignature(rawBody, signature);
    if (!verification.isValid) {
      Logger.warn("Invalid Razorpay webhook signature", { ip });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    // Idempotency key from Razorpay payload
    const rawEventId = req.headers.get('x-razorpay-event-id') || payload.id || crypto.randomUUID();
    const eventId = `razorpay:${rawEventId}`;

    // 2. Strict Idempotency Check via WebhookEvent table atomic insert
    try {
      await prisma.webhookEvent.create({
        data: {
          id: eventId,
          provider: 'razorpay',
          eventType,
          payload,
          status: 'processing',
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') { // Unique constraint violation
        const existing = await prisma.webhookEvent.findUnique({ where: { id: eventId } });
        if (existing?.status === 'processed') {
          return NextResponse.json({ message: 'Webhook already processed' }, { status: 200 });
        }
        if (existing?.status === 'processing') {
          // Could be a genuine concurrent retry from Razorpay, drop it
          return NextResponse.json({ message: 'Webhook is already processing concurrently' }, { status: 409 });
        }
        // If 'failed', we allow retry by updating status back to processing
        await prisma.webhookEvent.update({
          where: { id: eventId },
          data: { status: 'processing', error: null }
        });
      } else {
        throw e;
      }
    }

    try {
      // 3. Process the event based on type
      if (eventType === 'payment.captured' && verification.transactionId) {
        const orderId = payload.payload.payment.entity.notes?.orderId || payload.payload.payment.entity.description;

        if (!orderId) {
          throw new Error('orderId missing in payload');
        }

        const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: { total: true }
        });

        if (order) {
          const result = await OrderService.confirmPayment(orderId, order.total.toNumber(), verification.transactionId);
          if (result.message === "Duplicate processing ignored") {
            Logger.info('Webhook race condition mitigated for transaction', { transactionId: verification.transactionId });
          }
        }
      } else if (eventType === 'payment.failed') {
        const orderId = payload.payload.payment.entity.notes?.orderId;
        if (orderId) {
          await prisma.order.updateMany({
            where: { id: orderId, paymentStatus: 'CREATED' },
            data: { status: 'PAYMENT_FAILED', paymentStatus: 'FAILED' }
          });
          
          // Release inventory reservation if failed early
          await prisma.inventoryReservation.updateMany({
            where: { orderId, status: 'ACTIVE' },
            data: { status: 'RELEASED' }
          });
          Logger.info('Payment failed and reservations released', { orderId });
        }
      } else if (eventType === 'refund.processed') {
        const refundId = payload.payload.refund.entity.id;
        const amount = payload.payload.refund.entity.amount / 100;
        const paymentId = payload.payload.refund.entity.payment_id;
        
        await completeRefund(refundId, amount, paymentId);
      }

      // 4. Mark Webhook as Processed
      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: { status: 'processed', processedAt: new Date() },
      });

      return NextResponse.json({ success: true }, { status: 200 });

    } catch (innerError: any) {
      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: { status: 'failed', error: innerError.message, processedAt: new Date() },
      });
      throw innerError;
    }
  } catch (error: any) {
    Logger.error('Razorpay Webhook Error', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
