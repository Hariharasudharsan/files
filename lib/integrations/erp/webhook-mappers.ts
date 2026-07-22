import type { CustomerProfile } from "@/lib/domain/customer";
import type { InventorySnapshot, Product } from "@/lib/domain/product";
import type { ErpWebhookEvent } from "@/lib/validation/webhooks";

function readString(payload: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function readNumber(payload: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = Number(payload[key]);
    if (Number.isFinite(value)) return value;
  }
  return fallback;
}

export function mapWebhookToProduct(event: ErpWebhookEvent): Product {
  return {
    item_code: readString(event.payload, ["item_code", "name"]),
    item_name: readString(event.payload, ["item_name", "title", "name"]),
    standard_rate: readNumber(event.payload, ["standard_rate", "rate", "price"]),
    image: readString(event.payload, ["image"]) || null,
    description: readString(event.payload, ["description"]),
    item_group: readString(event.payload, ["item_group", "category"]),
    stock_qty: readNumber(event.payload, ["actual_qty", "available_qty", "stock_qty"]),
    updated_at: event.occurred_at,
  };
}

export function mapWebhookToInventory(event: ErpWebhookEvent): InventorySnapshot {
  return {
    item_code: readString(event.payload, ["item_code", "name"]),
    available_qty: readNumber(event.payload, ["available_qty", "actual_qty", "stock_qty"]),
    reserved_qty: readNumber(event.payload, ["reserved_qty"], 0),
    updated_at: event.occurred_at,
  };
}

export function mapWebhookToCustomer(event: ErpWebhookEvent): CustomerProfile {
  return {
    id: readString(event.payload, ["customer_id", "name"]) || undefined,
    name: readString(event.payload, ["customer_name", "name"]),
    email: readString(event.payload, ["email", "contact_email"]).toLowerCase(),
    address: readString(event.payload, ["address", "customer_address"]) || undefined,
    updated_at: event.occurred_at,
  };
}
