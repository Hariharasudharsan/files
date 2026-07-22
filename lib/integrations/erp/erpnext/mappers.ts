import type { StorefrontOrder } from "@/lib/domain/entities/order";
import type { Product } from "@/lib/domain/entities/product";

export interface ERPNextItem {
  name: string;
  item_name: string;
  standard_rate: number;
  image: string | null;
  description: string | null;
  item_group: string;
  actual_qty?: number;
  modified?: string;
}

export interface ERPNextSalesOrderPayload {
  customer: string;
  customer_name: string;
  contact_email: string;
  items: Array<{
    item_code: string;
    qty: number;
    rate: number;
  }>;
  custom_storefront_order_id?: string;
  [key: string]: unknown;
}

export function resolveErpImageUrl(baseUrl: string | undefined, path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${baseUrl ?? ""}${path}`;
}

export function mapErpItemToProduct(raw: ERPNextItem, baseUrl: string | undefined): Product {
  const slug = raw.item_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return {
    item_code: raw.name,
    item_name: raw.item_name,
    slug: slug,
    standard_rate: raw.standard_rate ?? 0,
    image: resolveErpImageUrl(baseUrl, raw.image),
    gallery: [],
    description: raw.description?.replace(/<[^>]*>/g, "").trim() || "",
    ingredients: "",
    item_group: raw.item_group,
    stock_qty: raw.actual_qty,
    updated_at: raw.modified,
  };
}

export function mapOrderToErpSalesOrder(order: StorefrontOrder): ERPNextSalesOrderPayload {
  return {
    customer: "Website Walk-in",
    customer_name: order.contact.name,
    contact_email: order.contact.email,
    custom_storefront_order_id: order.id,
    items: order.items.map((item) => ({
      item_code: item.item_code,
      qty: item.qty,
      rate: item.rate,
    })),
  };
}
