import { OrderStatusEnum } from "@/lib/domain/entities/order";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { verifyPaymentSignature } from "@/lib/integrations/payments/razorpay";
import { DomainEventBus } from "@/lib/infrastructure/events/event-bus";
import { Logger } from "@/lib/infrastructure/logger";
import { PaymentStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = payload;

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment verification payload" }, { status: 400 });
    }

    // 1. Verify Signature
    const isValid = verifyPaymentSignature(razorpay_payment_id, razorpay_order_id, razorpay_signature);
    if (!isValid) {
      Logger.warn("Invalid payment signature detected", { orderId, razorpay_payment_id });
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Fetch Order
    const orderRecord = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: true,
        user: true, // Need user for contact details
      }
    });

    if (!orderRecord) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (orderRecord.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json({ success: true, message: "Order already marked as paid" }, { status: 200 });
    }

    // 3. Atomically update Order and create Payment Record
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: PaymentStatus.PAID }
      });

      await tx.paymentTransaction.create({
        data: {
          orderId: orderId,
          amount: orderRecord.total,
          currency: "INR",
          provider: "razorpay",
          transactionId: razorpay_payment_id,
          status: "captured",
        }
      });
    });

    // 4. Publish Event
    // We map back to the StorefrontOrder interface expected by Domain Events
    const storefrontOrder = {
      id: orderRecord.id,
      items: orderRecord.items.map(i => ({ 
        productVariantId: i.productVariantId, 
        qty: i.qty, 
        rate: Number(i.rate)
      })),
      contact: { 
        name: orderRecord.user?.name || "", 
        email: orderRecord.user?.email || "", 
        phone: orderRecord.user?.phone || "", 
        address: "", 
        city: "", 
        state: "", 
        pincode: "" 
      },
      total: Number(orderRecord.total),
      status: "PENDING" as const,
      erp_sync_status: "queued" as const,
      created_at: orderRecord.createdAt.toISOString(),
    };

    await DomainEventBus.publish({
      eventName: "OrderCreated",
      timestamp: new Date().toISOString(),
      payload: storefrontOrder,
    });

    Logger.info("Payment verified and order paid", { orderId, transactionId: razorpay_payment_id });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    Logger.error("Payment verification failed", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Could not verify payment." },
      { status: 500 },
    );
  }
}
