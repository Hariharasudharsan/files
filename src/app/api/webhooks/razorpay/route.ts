import { NextResponse } from 'next/server';
import { RazorpayAdapter } from '../../../../lib/infrastructure/adapters/payment/RazorpayAdapter';
import { eventBus } from '../../../../lib/infrastructure/events/EventBus';
import { OrderPaidEvent } from '../../../../lib/core/domain/events/DomainEvent';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { getServerEnv } from '../../../../lib/core/config/env';

const razorpayAdapter = new RazorpayAdapter();

import { prisma } from "@/lib/infrastructure/database/prisma";

import { RateLimiter } from "@/lib/infrastructure/rate-limiter";

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

      if (!orderId) {
        console.error('Razorpay Webhook Error: orderId missing in payload', JSON.stringify(payload));
        await prisma.webhookEvent.update({
          where: { id: eventId },
          data: { status: 'failed', processedAt: new Date() },
        });
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // Fast path idempotency check
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { paymentStatus: true }
      });

      if (order?.paymentStatus !== PaymentStatus.PAID) {
        try {
          // 5. Wrap updates, inserts, and event publication in a single database transaction
          await prisma.$transaction(async (tx) => {
            // Update local Order & Payment state
            const order = await tx.order.update({
              where: { id: orderId },
              data: {
                status: OrderStatus.CONFIRMED,
                paymentStatus: PaymentStatus.PAID,
              },
              include: {
                items: {
                  include: { productVariant: true }
                },
                user: true,
              }
            });

            const env = getServerEnv();
            const count = await tx.invoice.count();
            const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

            await tx.invoice.create({
              data: {
                orderId,
                invoiceNumber,
                sellerGstin: env.sellerGstin || null,
                buyerDetails: {
                  name: order.user?.name,
                  email: order.user?.email,
                  phone: order.user?.phone,
                  shippingAddress: order.shippingAddress,
                  billingAddress: order.billingAddress,
                },
                lineItems: order.items.map(item => ({
                  productName: item.productVariant.name,
                  qty: item.qty,
                  rate: item.rate.toNumber(),
                  taxRate: item.taxRate.toNumber(),
                  taxAmount: item.taxAmount.toNumber(),
                  cgstAmount: item.cgstAmount.toNumber(),
                  sgstAmount: item.sgstAmount.toNumber(),
                  igstAmount: item.igstAmount.toNumber(),
                  total: item.total.toNumber(),
                })),
                taxTotals: {
                  taxTotal: order.taxTotal.toNumber(),
                  cgstTotal: order.cgstTotal.toNumber(),
                  sgstTotal: order.sgstTotal.toNumber(),
                  igstTotal: order.igstTotal.toNumber(),
                }
              }
            });

            await tx.paymentTransaction.create({
              data: {
                orderId,
                amount: verification.amount || 0,
                provider: 'razorpay',
                transactionId: verification.transactionId!,
                status: 'captured',
              },
            });

            // Update reservations to COMMITTED
            await tx.inventoryReservation.updateMany({
              where: { orderId, status: { in: ['ACTIVE', 'active'] } },
              data: { status: 'COMMITTED' }
            });

            // Emit Domain Event via Outbox inside the same transaction
            const orderPaidEvent = new OrderPaidEvent(orderId, verification.amount || 0, verification.transactionId!);
            await eventBus.publishWithinTransaction(tx, orderPaidEvent);
          });
        } catch (error: any) {
          if (error.code === 'P2002') {
            console.log('Webhook race condition caught for transaction', verification.transactionId);
          } else {
            throw error;
          }
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
