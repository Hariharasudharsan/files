import "server-only";

import { prisma } from "@/lib/infrastructure/database/prisma";
import { PaymentStatus } from "@prisma/client";
import { Logger } from "@/lib/infrastructure/logger";

import { createRefund } from "@/lib/integrations/payments/razorpay";

export async function processRefund(orderId: string, amountToRefund: number, reason?: string) {
  return await prisma.$transaction(async (tx) => {
    const order: any = await tx.order.findUnique({
      where: { id: orderId },
      include: { payments: true, refunds: true }
    } as any);

    if (!order) throw new Error("Order not found");

    const capturedPayments = (order.payments || []).filter((p: any) => p.status === "captured" || p.status === "CAPTURED");
    const totalPaid = capturedPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const alreadyRefunded = (order.refunds || []).filter((r: any) => r.status === "COMPLETED").reduce((sum: number, r: any) => sum + Number(r.amount), 0);
    const maximumRefundable = totalPaid - alreadyRefunded;

    if (amountToRefund > maximumRefundable) {
      throw new Error(`Cannot refund more than the maximum refundable amount (₹${maximumRefundable})`);
    }

    if (capturedPayments.length === 0) {
      throw new Error("No captured payment found to refund against");
    }

    const primaryPayment = capturedPayments[0];

    // Call Razorpay API
    let razorpayRefundId;
    try {
      const razorpayResponse = await createRefund(primaryPayment.transactionId, amountToRefund, `refund_${order.id}`);
      razorpayRefundId = razorpayResponse.id;
    } catch (err: any) {
      Logger.error("Razorpay refund failed", { orderId, error: err.message });
      throw new Error(`Gateway refund failed: ${err.message}`);
    }

    const refundRecord = await (tx as any).refund.create({
      data: {
        orderId: order.id,
        amount: amountToRefund,
        reason,
        transactionId: razorpayRefundId,
        status: "COMPLETED",
      }
    });

    const isFullRefund = (alreadyRefunded + amountToRefund) >= totalPaid;
    const newStatus = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;

    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: newStatus }
    });

    // Record audit
    await (tx as any).auditLog.create({
      data: {
        action: "ORDER_REFUNDED",
        entity: "Order",
        entityId: order.id,
        details: { amount: amountToRefund, isFullRefund, transactionId: razorpayRefundId }
      }
    });

    Logger.info("Processed refund", { orderId, amount: amountToRefund, isFullRefund });

    return refundRecord;
  });
}
