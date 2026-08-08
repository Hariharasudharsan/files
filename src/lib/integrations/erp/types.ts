import type { StorefrontOrder } from "@/lib/domain/entities/order";
import type { CustomerProfile } from "@/lib/domain/entities/customer";
import type { InventorySnapshot, Product } from "@/lib/domain/entities/product";
import type { ErpWebhookEvent } from "@/lib/validation/webhooks";

export type ErpSyncJobType =
  | "order.created"
  | "product.webhook"
  | "inventory.webhook"
  | "customer.webhook"
  | "order.webhook";

export type ErpSyncPayload =
  | StorefrontOrder
  | Product
  | InventorySnapshot
  | CustomerProfile
  | ErpWebhookEvent;

export interface ErpSyncJob {
  id: string;
  type: ErpSyncJobType;
  payload: ErpSyncPayload;
  attempts: number;
  queued_at: string;
}
