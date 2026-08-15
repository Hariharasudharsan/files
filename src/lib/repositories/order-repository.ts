import "server-only";

import crypto from "crypto";
import type { CreateOrderInput, StorefrontOrder } from "@/lib/core/domain/entities/order";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { OrderStatus, PaymentStatus, FulfillmentStatus, Prisma } from "@prisma/client";
import { OutboxService } from "@/lib/infrastructure/events/OutboxService";

function createOrderId(): string {
  return `MF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto
    .randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;
}

export async function findAllStorefrontOrders(page: number = 1, limit: number = 50) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        items: true,
      },
    }),
    prisma.order.count(),
  ]);

  return { items, total, page, totalPages: Math.ceil(total / limit) };
}

export async function findOrdersByUserId(userId: string) {
  return await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { productVariant: true } } },
  });
}

export async function findOrderByIdForUser(id: string, userId: string) {
  return await prisma.order.findFirst({
    where: { id, userId },
    include: {
      items: {
        include: {
          productVariant: {
            include: {
              product: true,
              images: { include: { media: true } }
            }
          }
        }
      }
    }
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return await prisma.order.update({
    where: { id },
    data: { status },
  });
}

export async function findOrderByIdWithItemsAndUser(id: string) {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: true,
    }
  });
}

export async function markOrderAsPaidAndCreateTransaction(
  orderId: string, 
  total: any, 
  transactionId: string
) {
  return await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.CAPTURED }
    });

    await tx.paymentTransaction.create({
      data: {
        orderId: orderId,
        amount: total,
        currency: "INR",
        provider: "razorpay",
        transactionId: transactionId,
        status: "captured",
      }
    });

    await OutboxService.publish(
      tx,
      orderId,
      "Order",
      "OrderPaid",
      { orderId, transactionId, amount: total }
    );
    
    return updatedOrder;
  });
}

export async function createStorefrontOrder(input: CreateOrderInput): Promise<StorefrontOrder> {
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

  let subTotal = 0;

  const itemsForCreation = await Promise.all(
    input.items.map(async (item) => {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.productVariantId }
      });
      if (!variant) {
        throw new Error(`Variant with productVariantId ${item.productVariantId} not found`);
      }
      
      const rate = variant.price.toNumber();
      subTotal += item.qty * rate;

      return {
        productVariantId: variant.id,
        qty: item.qty,
        rate: rate,
        taxRate: 0,
        taxAmount: 0,
        total: item.qty * rate,
      };
    })
  );

  const taxTotal = 0; 
  const shippingTotal = 0;
  const discountTotal = 0;
  const total = subTotal + taxTotal + shippingTotal - discountTotal;

  const orderRecord = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        id,
        userId: user.id,
        subTotal,
        taxTotal,
        shippingTotal,
        discountTotal,
        total,
        status: OrderStatus.CREATED,
        paymentStatus: PaymentStatus.CREATED,
        fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
        items: {
          create: itemsForCreation,
        }
      }
    });

    await OutboxService.publish(
      tx,
      order.id,
      "Order",
      "OrderCreated",
      { orderId: order.id }
    );
    
    // Also explicitly create the ERPSync record here in PENDING state 
    // so it's visible in the dashboard immediately as pending sync
    await OutboxService.queueERPSync(tx, "Order", order.id, order.id);
    
    return order;
  });

  const order: StorefrontOrder = {
    id: orderRecord.id,
    items: itemsForCreation.map(i => ({ ...i, productVariantId: i.productVariantId })),
    contact: input.contact,
    total: orderRecord.total.toNumber(),
    status: "CREATED", 
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
