import type { ProductVariant } from "@/lib/core/domain/entities/product";

export interface CheckoutContact {
  name: string;
  email: string;
  phone: string;
  flatOrHouseNumber: string;
  localityOrArea: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  whatsappOptIn?: boolean;
}

export interface OrderItemInput {
  productVariantId: string;
  qty: number;
  rate: number;
}

export interface CartItem extends ProductVariant {
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image?: string;
  product_category?: string;
  qty: number;
}

export type OrderStatusEnum = 
  | "DRAFT" | "PENDING" | "AWAITING_PAYMENT" | "AUTHORIZED" 
  | "PAID" | "CONFIRMED" | "PACKED" | "READY_TO_SHIP" 
  | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED" 
  | "REFUNDED" | "EXPIRED";

export interface StorefrontOrder {
  id: string;
  items: OrderItemInput[];
  contact: CheckoutContact;
  total: number;
  status: OrderStatusEnum;
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
