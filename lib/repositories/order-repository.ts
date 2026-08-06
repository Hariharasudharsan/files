import "server-only";

import crypto from "crypto";
import type { CreateOrderInput, StorefrontOrder } from "@/lib/domain/entities/order";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { OrderStatus, PaymentStatus, FulfillmentStatus } from "@prisma/client";

function createOrderId(): string {
  return `MF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto
    .randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;
}

export async function createStorefrontOrder(input: CreateOrderInput): Promise<StorefrontOrder> {
  const subTotal = input.items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const taxTotal = 0; 
  const shippingTotal = 0;
  const discountTotal = 0;
  const total = subTotal + taxTotal + shippingTotal - discountTotal;
  
  const id = createOrderId();

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

  const itemsForCreation = await Promise.all(
    input.items.map(async (item) => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.productVariantId }
      });
      if (!variant) {
        throw new Error(`Variant with productVariantId ${item.productVariantId} not found`);
      }
      return {
        productVariantId: variant.id,
        qty: item.qty,
        rate: item.rate,
        taxRate: 0,
        taxAmount: 0,
        total: item.qty * item.rate,
      };
    })
  );

  const orderRecord = await prisma.order.create({
    data: {
      id,
      userId: user.id,
      subTotal,
      taxTotal,
      shippingTotal,
      discountTotal,
      total,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
      items: {
        create: itemsForCreation,
      }
    }
  });

  const order: StorefrontOrder = {
    id: orderRecord.id,
    items: input.items,
    contact: input.contact,
    total: orderRecord.total.toNumber(),
    status: "PENDING", 
    erp_sync_status: "queued",
    created_at: orderRecord.createdAt.toISOString(),
  };

  return order;
}

export async function markOrderErpSynced(orderId: string): Promise<void> {
  await prisma.eRPSync.create({
    data: {
      entityType: "Order",
      entityId: orderId,
      orderId: orderId,
      targetSystem: "erpnext",
      status: "SUCCESS"
    }
  });
}

export async function markOrderErpFailed(orderId: string): Promise<void> {
  await prisma.eRPSync.create({
    data: {
      entityType: "Order",
      entityId: orderId,
      orderId: orderId,
      targetSystem: "erpnext",
      status: "FAILED"
    }
  });
}
