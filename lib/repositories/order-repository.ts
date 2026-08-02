import "server-only";

import crypto from "crypto";
import type { CreateOrderInput, StorefrontOrder } from "@/lib/domain/entities/order";
import { prisma } from "@/lib/infrastructure/database/prisma";

function createOrderId(): string {
  return `MF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto
    .randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;
}

export async function createStorefrontOrder(input: CreateOrderInput): Promise<StorefrontOrder> {
  const total = input.items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const id = createOrderId();

  // Create customer or connect if they exist
  const user = await prisma.user.upsert({
    where: { email: input.contact.email },
    update: { 
      phone: input.contact.phone, 
      name: input.contact.name 
    },
    create: { 
      email: input.contact.email, 
      phone: input.contact.phone, 
      name: input.contact.name 
    },
  });

  const orderRecord = await prisma.order.create({
    data: {
      id,
      userId: user.id,
      total,
      status: "accepted",
      paymentStatus: "unpaid",
      fulfillmentStatus: "unfulfilled",
      items: {
        create: input.items.map(item => ({
          productId: item.item_code, // assuming product itemCode is used as relation ID or we need to find it
          qty: item.qty,
          rate: item.rate
        }))
      }
    }
  });

  const order: StorefrontOrder = {
    id: orderRecord.id,
    items: input.items,
    contact: input.contact,
    total: orderRecord.total,
    status: orderRecord.status as any,
    erp_sync_status: "queued" as any, // Mocked for backward compatibility in legacy code
    created_at: orderRecord.createdAt.toISOString(),
  };

  return order;
}

export async function markOrderErpSynced(orderId: string): Promise<void> {
  await prisma.syncLog.create({
    data: {
      entityType: "Order",
      entityId: orderId,
      orderId: orderId,
      targetSystem: "erpnext",
      status: "success"
    }
  });
}

export async function markOrderErpFailed(orderId: string): Promise<void> {
  await prisma.syncLog.create({
    data: {
      entityType: "Order",
      entityId: orderId,
      orderId: orderId,
      targetSystem: "erpnext",
      status: "failed"
    }
  });
}
