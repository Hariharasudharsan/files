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
  | "CREATED" | "PAYMENT_PENDING" | "PAID" | "PAYMENT_FAILED" 
  | "CONFIRMED" | "PACKED" | "SHIPPED" | "DELIVERED" 
  | "CANCELLED" | "REFUND_PENDING" | "REFUNDED";

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
  paymentMethod?: string;
  couponCode?: string;
}

export interface CreateOrderResult {
  order: StorefrontOrder;
}
