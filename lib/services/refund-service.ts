import "server-only";

import { prisma } from "@/lib/infrastructure/database/prisma";
import { PaymentStatus } from "@prisma/client";
import { Logger } from "@/lib/infrastructure/logger";

export async function processRefund(orderId: string, amountToRefund: number, reason?: string) {
  return await prisma.$transaction(async (tx) => {
    const order: any = await tx.order.findUnique({
      where: { id: orderId },
      include: { payments: true, refunds: true }
    } as any);

    if (!order) throw new Error("Order not found");

    const totalPaid = (order.payments || []).filter((p: any) => p.status === "captured").reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const alreadyRefunded = (order.refunds || []).filter((r: any) => r.status === "COMPLETED").reduce((sum: number, r: any) => sum + Number(r.amount), 0);
    const maximumRefundable = totalPaid - alreadyRefunded;

    if (amountToRefund > maximumRefundable) {
      throw new Error(`Cannot refund more than the maximum refundable amount (₹${maximumRefundable})`);
    }

    const refundRecord = await (tx as any).refund.create({
      data: {
        orderId: order.id,
        amount: amountToRefund,
        reason,
        status: "COMPLETED", // Assuming gateway processes it immediately for this demo
      }
    });

    const isFullRefund = (alreadyRefunded + amountToRefund) >= totalPaid;
    const newStatus = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;

    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: newStatus }
    });

    Logger.info("Processed refund", { orderId, amount: amountToRefund, isFullRefund });

    return refundRecord;
  });
}
