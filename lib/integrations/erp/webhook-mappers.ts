import type { CustomerProfile } from "@/lib/domain/entities/customer";
import type { InventorySnapshot, Product } from "@/lib/domain/entities/product";
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
  const itemName = readString(event.payload, ["item_name", "title", "name"]);
  const itemCode = readString(event.payload, ["item_code", "name"]);
  const imageUrl = readString(event.payload, ["image"]) || null;
  
  return {
    id: itemCode,
    name: itemName,
    slug: itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    description: readString(event.payload, ["description"]),
    category_id: null,
    ingredients: null,
    nutritional_info: null,
    shelf_life_days: null,
    gstRate: 0,
    isFeatured: false,
    primaryImage: imageUrl ? {
      id: `wh-img-${itemCode}`,
      url: imageUrl,
      alt: itemName,
      type: "IMAGE"
    } : null,
    created_at: event.occurred_at,
    updated_at: event.occurred_at,
    variants: [{
      id: itemCode,
      item_code: itemCode,
      name: "Standard Pack",
      price: readNumber(event.payload, ["standard_rate", "rate", "price"]),
      inventoryLevels: [{
        warehouseId: "default",
        available: readNumber(event.payload, ["actual_qty", "available_qty", "stock_qty"]),
        reserved: 0,
        committed: 0,
        sold: 0,
        damaged: 0,
        returned: 0
      }],
      images: imageUrl ? [{
        id: `wh-img-${itemCode}`,
        url: imageUrl,
        alt: itemName,
        type: "IMAGE"
      }] : [],
    }]
  };
}

export function mapWebhookToInventory(event: ErpWebhookEvent): InventorySnapshot {
  return {
    item_code: readString(event.payload, ["item_code", "name"]),
    warehouseId: readString(event.payload, ["warehouse_id", "warehouse", "warehouseId"]) || "default",
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
