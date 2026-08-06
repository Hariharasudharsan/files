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
  const resolvedImage = resolveErpImageUrl(baseUrl, raw.image);
  
  return {
    id: raw.name,
    name: raw.item_name,
    slug: slug,
    description: raw.description?.replace(/<[^>]*>/g, "").trim() || "",
    category_id: null, // To be mapped separately
    ingredients: null,
    nutritional_info: null,
    shelf_life_days: null,
    gstRate: 0,
    isFeatured: false,
    primaryImage: resolvedImage ? {
      id: `erp-img-${raw.name}`,
      url: resolvedImage,
      alt: raw.item_name,
      type: "IMAGE"
    } : null,
    created_at: raw.modified || new Date().toISOString(),
    updated_at: raw.modified || new Date().toISOString(),
    variants: [{
      id: raw.name, // Usually erp item code
      item_code: raw.name,
      name: "Standard Pack",
      price: raw.standard_rate ?? 0,
      inventoryLevels: [{
        warehouseId: "default",
        available: raw.actual_qty ?? 0,
        reserved: 0,
        committed: 0,
        sold: 0,
        damaged: 0,
        returned: 0
      }],
      images: resolvedImage ? [{
        id: `erp-img-${raw.name}`,
        url: resolvedImage,
        alt: raw.item_name,
        type: "IMAGE"
      }] : [],
    }]
  };
}

export function mapOrderToErpSalesOrder(order: StorefrontOrder): ERPNextSalesOrderPayload {
  return {
    customer: "Website Walk-in",
    customer_name: order.contact.name,
    contact_email: order.contact.email,
    custom_storefront_order_id: order.id,
    items: order.items.map((item) => ({
      item_code: item.productVariantId,
      qty: item.qty,
      rate: item.rate,
    })),
  };
}
