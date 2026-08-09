import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/integrations/payments/razorpay";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { Logger } from "@/lib/infrastructure/logger";
import { eventBus } from "@/lib/infrastructure/events/EventBus";
import { OrderPaidEvent } from "@/lib/core/domain/events/DomainEvent";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
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

    // 2. Wrap updates and event publication in a single transaction
    await prisma.$transaction(async (tx) => {
      // Update local Order & Payment state
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
        },
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

      // Emit Domain Event via Outbox inside the same transaction
      const orderPaidEvent = new OrderPaidEvent(orderId, order.total.toNumber(), razorpay_payment_id);
      await eventBus.publishWithinTransaction(tx, orderPaidEvent);
    });

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
