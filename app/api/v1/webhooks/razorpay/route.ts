import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { DomainEventBus } from "@/lib/infrastructure/events/event-bus";
import { Logger } from "@/lib/infrastructure/logger";
import { PaymentStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    if (!secret) {
      Logger.error("RAZORPAY_WEBHOOK_SECRET is not defined");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      Logger.warn("Invalid webhook signature", { received: signature });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const body = JSON.parse(rawBody);

    // We only care about order.paid or payment.captured
    // Let's handle order.paid as it contains the receipt
    if (body.event === "order.paid") {
      const orderEntity = body.payload.order?.entity;
      const paymentEntity = body.payload.payment?.entity;
      
      const internalOrderId = orderEntity?.receipt;
      const razorpayPaymentId = paymentEntity?.id;

      if (!internalOrderId) {
        Logger.error("Webhook payload missing receipt (internal order id)");
        return NextResponse.json({ error: "Missing internal order id" }, { status: 400 });
      }

      // Fetch Order
      const orderRecord = await prisma.order.findUnique({
        where: { id: internalOrderId },
        include: { 
          items: true,
          user: true, 
        }
      });

      if (!orderRecord) {
        Logger.error("Order not found from webhook", { orderId: internalOrderId });
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (orderRecord.paymentStatus === PaymentStatus.PAID) {
        // Already paid, ignore safely
        return NextResponse.json({ success: true, message: "Already paid" }, { status: 200 });
      }

      // Atomically update Order and create Payment Record
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: internalOrderId },
          data: { paymentStatus: PaymentStatus.PAID }
        });

        await tx.payment.create({
          data: {
            orderId: internalOrderId,
            amount: orderRecord.total,
            currency: "INR",
            provider: "razorpay",
            transactionId: razorpayPaymentId || "webhook-unknown-tx",
            status: "captured",
          }
        });
      });

      // Publish Event to sync with ERP
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
        status: "accepted" as const,
        erp_sync_status: "queued" as const,
        created_at: orderRecord.createdAt.toISOString(),
      };

      await DomainEventBus.publish({
        eventName: "OrderCreated",
        timestamp: new Date().toISOString(),
        payload: storefrontOrder,
      });

      Logger.info("Webhook: Payment verified and order paid", { orderId: internalOrderId, transactionId: razorpayPaymentId });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    Logger.error("Webhook processing failed", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Could not process webhook" }, { status: 500 });
  }
}
