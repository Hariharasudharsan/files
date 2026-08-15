import "server-only";

import { prisma } from "@/lib/infrastructure/database/prisma";
import { PaymentStatus } from "@prisma/client";
import { Logger } from "@/lib/infrastructure/logger";
import { RazorpayAdapter } from "@/lib/infrastructure/adapters/payment/RazorpayAdapter";
import crypto from "crypto";

const razorpayAdapter = new RazorpayAdapter();

export async function processRefund(orderId: string, amountToRefund: number, reason?: string) {
  return await prisma.$transaction(async (tx) => {
    const order: any = await tx.order.findUnique({
      where: { id: orderId },
      include: { payments: true }
    } as any);

    if (!order) throw new Error("Order not found");

    // Atomic lock on refunds associated with this order to prevent concurrent refunds exceeding the maximum
    const refunds: any[] = await tx.$queryRaw\`
      SELECT * FROM "Refund" 
      WHERE "orderId" = \${orderId} 
      FOR UPDATE
    \`;

    const capturedPayments = (order.payments || []).filter((p: any) => p.status === "captured" || p.status === "CAPTURED");
    const totalPaid = capturedPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const alreadyRefunded = refunds.filter((r: any) => r.status === "COMPLETED" || r.status === "PENDING").reduce((sum: number, r: any) => sum + Number(r.amount), 0);
    const maximumRefundable = totalPaid - alreadyRefunded;

    if (amountToRefund > maximumRefundable) {
      throw new Error(`Cannot refund more than the maximum refundable amount (₹${maximumRefundable})`);
    }

    if (capturedPayments.length === 0) {
      throw new Error("No captured payment found to refund against");
    }

    const primaryPayment = capturedPayments[0];

    // Generate idempotency/receipt key
    const refundReceipt = `refund_${order.id}_${crypto.randomBytes(4).toString('hex')}`;

    // Call Razorpay API
    const response = await razorpayAdapter.refundPayment(primaryPayment.transactionId, amountToRefund, { receipt: refundReceipt, orderId: order.id });
    
    if (!response.success) {
      Logger.error("Razorpay refund failed", { orderId, error: response.error });
      throw new Error(`Gateway refund failed: ${response.error}`);
    }

    // Razorpay accepted the refund request, we will wait for webhook to complete it
    const refundRecord = await (tx as any).refund.create({
      data: {
        orderId: order.id,
        amount: amountToRefund,
        reason,
        transactionId: response.id,
        status: "PENDING",
      }
    });

    await tx.order.update({
      where: { id: order.id },
      data: { 
        paymentStatus: PaymentStatus.REFUND_PENDING,
        status: "REFUND_PENDING"
      }
    });

    // Record audit
    await (tx as any).auditLog.create({
      data: {
        action: "ORDER_REFUND_INITIATED",
        entity: "Order",
        entityId: order.id,
        details: { amount: amountToRefund, transactionId: response.id }
      }
    });

    Logger.info("Initiated refund", { orderId, amount: amountToRefund });

    return refundRecord;
  });
}
