import "server-only";

import crypto from "crypto";
import type { CreateOrderInput, StorefrontOrder } from "@/lib/domain/order";

const orders = new Map<string, StorefrontOrder>();

function createOrderId(): string {
  return `MF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto
    .randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;
}

export async function createStorefrontOrder(input: CreateOrderInput): Promise<StorefrontOrder> {
  const order: StorefrontOrder = {
    id: createOrderId(),
    items: input.items,
    contact: input.contact,
    total: input.items.reduce((sum, item) => sum + item.qty * item.rate, 0),
    status: "accepted",
    erp_sync_status: "queued",
    created_at: new Date().toISOString(),
  };

  orders.set(order.id, order);
  return order;
}

export async function markOrderErpSynced(orderId: string): Promise<void> {
  const order = orders.get(orderId);
  if (order) orders.set(orderId, { ...order, erp_sync_status: "synced" });
}

export async function markOrderErpFailed(orderId: string): Promise<void> {
  const order = orders.get(orderId);
  if (order) orders.set(orderId, { ...order, erp_sync_status: "failed" });
}
