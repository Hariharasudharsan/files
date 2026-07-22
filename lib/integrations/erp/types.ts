import type { StorefrontOrder } from "@/lib/domain/models/order";
import type { CustomerProfile } from "@/lib/domain/models/customer";
import type { InventorySnapshot, Product } from "@/lib/domain/models/product";
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
