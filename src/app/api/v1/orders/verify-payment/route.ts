import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/integrations/payments/razorpay";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { Logger } from "@/lib/infrastructure/logger";
import { eventBus } from "@/lib/infrastructure/events/EventBus";
import { OrderPaidEvent } from "@/lib/core/domain/events/DomainEvent";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { getServerEnv } from "@/lib/core/config/env";

import { RateLimiter } from "@/lib/infrastructure/rate-limiter";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const key = `ratelimit:verify_payment:${ip}`;
  const limit = parseInt(process.env.RATE_LIMIT_CHECKOUT_MAX || "10");
  const windowSec = parseInt(process.env.RATE_LIMIT_CHECKOUT_WINDOW_SEC || "60");

  const { success } = await RateLimiter.check(key, limit, windowSec);
  if (!success) {
    return NextResponse.json({ error: "Too many payment verification attempts." }, { status: 429 });
  }

  try {
    const payload = await request.json();
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = payload;

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify Signature
    const isValid = verifyPaymentSignature(razorpay_payment_id, razorpay_order_id, razorpay_signature);
    
    if (!isValid) {
      Logger.error("Payment signature verification failed", { orderId, razorpay_payment_id });
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Fast path idempotency check
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { paymentStatus: true }
    });

    if (currentOrder?.paymentStatus !== PaymentStatus.PAID) {
      try {
        // 2. Wrap updates and event publication in a single transaction
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
              amount: order.total.toNumber(),
              provider: 'razorpay',
              transactionId: razorpay_payment_id,
              status: 'captured',
            },
          });

          // Update reservations to COMMITTED
          await tx.inventoryReservation.updateMany({
            where: { orderId, status: { in: ['ACTIVE', 'active'] } },
            data: { status: 'COMMITTED' }
          });

          // Emit Domain Event via Outbox inside the same transaction
          const orderPaidEvent = new OrderPaidEvent(orderId, order.total.toNumber(), razorpay_payment_id);
          await eventBus.publishWithinTransaction(tx, orderPaidEvent);
        });
      } catch (error: any) {
        if (error.code === 'P2002') {
          Logger.info("Verify payment race condition caught", { orderId, razorpay_payment_id });
        } else {
          throw error;
        }
      }
    }

    Logger.info("Payment verified and order confirmed", { orderId, razorpay_payment_id });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    Logger.error("Verify payment failed", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Could not verify payment right now. Please try again or contact support." },
      { status: 500 },
    );
  }
}
