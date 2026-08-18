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
    const refunds: any[] = await tx.$queryRaw`
      SELECT * FROM "Refund" 
      WHERE "orderId" = ${orderId} 
      FOR UPDATE
    `;

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

export async function completeRefund(refundId: string, amount: number, paymentId?: string) {
  const existingRefund = await prisma.refund.findFirst({
    where: { transactionId: refundId }
  });

  if (existingRefund) {
    if (existingRefund.status !== 'COMPLETED') {
      await prisma.$transaction(async (tx) => {
        await tx.refund.update({
          where: { id: existingRefund.id },
          data: { status: 'COMPLETED' }
        });
        
        const order = await tx.order.findUnique({
          where: { id: existingRefund.orderId },
          include: {
            payments: true,
            refunds: true
          }
        });

        if (order) {
          const totalPaid = (order as any).payments.filter((p: any) => p.status === 'CAPTURED').reduce((sum: number, p: any) => sum + Number(p.amount), 0);
          const totalRefunded = order.refunds.filter((r: any) => r.status === 'COMPLETED').reduce((sum: number, r: any) => sum + Number(r.amount), 0);
          
          if (totalRefunded >= totalPaid) {
            await tx.order.update({
              where: { id: existingRefund.orderId },
              data: { 
                status: 'REFUNDED', 
                paymentStatus: 'REFUNDED' 
              }
            });
          }
        }
        
        await (tx as any).auditLog.create({
          data: {
            action: "REFUND_WEBHOOK_PROCESSED",
            entity: "Order",
            entityId: existingRefund.orderId,
            details: { refundId, amount, partial: true } // partial status implied if not fully refunded
          }
        });
      });
    }
  } else if (paymentId) {
    // Unmatched refund (e.g. initiated via Razorpay Dashboard)
    Logger.warn("Unmatched external refund received from webhook", { refundId, amount, paymentId });
    
    await prisma.$transaction(async (tx) => {
      const payment = await tx.paymentTransaction.findUnique({
        where: { transactionId: paymentId },
        include: { order: true }
      });

      if (payment && payment.order) {
        await tx.refund.create({
          data: {
            orderId: payment.order.id,
            amount: amount,
            reason: "External Refund",
            transactionId: refundId,
            status: "COMPLETED"
          }
        });

        const order = await tx.order.findUnique({
          where: { id: payment.order.id },
          include: { payments: true, refunds: true }
        });

        if (order) {
          const totalPaid = order.payments.filter((p: any) => p.status === 'CAPTURED').reduce((sum: number, p: any) => sum + Number(p.amount), 0);
          const totalRefunded = order.refunds.filter((r: any) => r.status === 'COMPLETED').reduce((sum: number, r: any) => sum + Number(r.amount), 0);
          
          if (totalRefunded >= totalPaid) {
            await tx.order.update({
              where: { id: payment.order.id },
              data: { 
                status: 'REFUNDED', 
                paymentStatus: 'REFUNDED' 
              }
            });
          }
        }

        await (tx as any).auditLog.create({
          data: {
            action: "UNMATCHED_REFUND_PROCESSED",
            entity: "Order",
            entityId: payment.order.id,
            details: { refundId, amount, paymentId }
          }
        });
      } else {
        await (tx as any).auditLog.create({
          data: {
            action: "UNMATCHED_REFUND_ORPHAN",
            entity: "Payment",
            entityId: paymentId,
            details: { refundId, amount }
          }
        });
      }
    });
  }
}
