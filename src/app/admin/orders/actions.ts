"use server";

import { z } from "zod";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { AuditLogService } from "@/lib/core/application/AuditLogService";
import { OutboxService } from "@/lib/infrastructure/events/OutboxService";
import { OrderStatus } from "@prisma/client";

const statusUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus)
});

// A strict state machine definition
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ["PAYMENT_PENDING", "PAID", "PAYMENT_FAILED", "CANCELLED"],
  PAYMENT_PENDING: ["PAID", "PAYMENT_FAILED", "CANCELLED"],
  PAID: ["CONFIRMED", "CANCELLED", "REFUND_PENDING"],
  CONFIRMED: ["PACKED", "CANCELLED", "REFUND_PENDING"],
  PACKED: ["SHIPPED", "CANCELLED", "REFUND_PENDING"],
  SHIPPED: ["DELIVERED", "REFUND_PENDING"],
  DELIVERED: ["REFUND_PENDING"],
  PAYMENT_FAILED: ["CANCELLED"],
  CANCELLED: [],
  REFUND_PENDING: ["REFUNDED"],
  REFUNDED: [],
};

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const user = await requirePermission("orders", "manage");
  
  const parsed = statusUpdateSchema.parse({ status: newStatus });

  const order = await prisma.$transaction(async (tx) => {
    const currentOrder = await tx.order.findUnique({ where: { id: orderId } });
    
    if (!currentOrder) {
      throw new Error(`Order ${orderId} not found`);
    }

    const validNextStates = VALID_TRANSITIONS[currentOrder.status] || [];
    if (!validNextStates.includes(parsed.status)) {
      throw new Error(`Invalid status transition from ${currentOrder.status} to ${parsed.status}`);
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: parsed.status }
    });

    await OutboxService.publish(tx, orderId, "Order", "OrderStatusChanged", { 
      orderId, 
      oldStatus: currentOrder.status, 
      newStatus: parsed.status 
    });

    return updated;
  });

  await AuditLogService.log(
    user.id, 
    "ORDER_STATUS_UPDATED", 
    "Order", 
    orderId, 
    { newStatus: parsed.status }
  );

  return order;
}

export async function processRefund(orderId: string, amount: number, reason: string) {
  const user = await requirePermission("orders", "manage");

  if (amount <= 0) {
    throw new Error("Refund amount must be positive");
  }

  const order = await prisma.$transaction(async (tx) => {
    const currentOrder = await tx.order.findUnique({ 
      where: { id: orderId },
      include: { payments: true }
    });
    
    if (!currentOrder) throw new Error("Order not found");
    if (currentOrder.paymentStatus !== "CAPTURED") {
      throw new Error("Cannot refund an order that is not paid");
    }

    // In a real scenario, we would call Razorpay here, but we just update local state
    
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { 
        status: "REFUND_PENDING",
        paymentStatus: "REFUND_PENDING" 
      }
    });

    await OutboxService.publish(tx, orderId, "Order", "OrderRefundRequested", { 
      orderId, 
      amount,
      reason 
    });

    return updated;
  });

  await AuditLogService.log(
    user.id, 
    "ORDER_REFUND_REQUESTED", 
    "Order", 
    orderId, 
    { amount, reason }
  );

  return order;
}
