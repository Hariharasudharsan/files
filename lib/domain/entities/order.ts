import type { Product, ProductVariant } from "@/lib/domain/entities/product";

export interface CheckoutContact {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItemInput {
  productVariantId: string;
  qty: number;
  rate: number;
}

export interface CartItem extends ProductVariant {
  product_name: string;
  product_slug: string;
  qty: number;
}

export interface StorefrontOrder {
  id: string;
  items: OrderItemInput[];
  contact: CheckoutContact;
  total: number;
  status: "accepted" | "cancelled" | "fulfilled";
  erp_sync_status: "queued" | "synced" | "failed";
  created_at: string;
}

export interface CreateOrderInput {
  items: OrderItemInput[];
  contact: CheckoutContact;
}

export interface CreateOrderResult {
  order: StorefrontOrder;
}
