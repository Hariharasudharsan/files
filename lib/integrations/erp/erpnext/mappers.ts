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
  item_tax_template?: string;
  taxes?: Array<{ tax_type: string, tax_rate: number }>;
  weight_per_unit?: number;
  custom_length?: number;
  custom_width?: number;
  custom_height?: number;
  end_of_life?: string;
  custom_wholesale_rate?: number;
  custom_carton_rate?: number;
  custom_carton_weight?: number;
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
  coupon_code?: string;
  additional_discount_percentage?: number;
  additional_discount_amount?: number;
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
  
  const product: Product = {
    id: raw.name,
    name: raw.item_name,
    slug: slug,
    description: raw.description?.replace(/<[^>]*>/g, "").trim() || "",
    category_id: raw.item_group || null, // Mapped from item_group for ProductService to resolve
    ingredients: null,
    nutritional_info: null,
    shelf_life_days: raw.end_of_life ? Math.max(0, Math.floor((new Date(raw.end_of_life).getTime() - new Date().getTime()) / (1000 * 3600 * 24))) : null,
    gstRate: raw.taxes && raw.taxes.length > 0 ? raw.taxes[0].tax_rate : (raw.item_tax_template ? 18 : 0), // Simplified tax fallback
    isFeatured: false,
    primaryImage: resolvedImage ? {
      id: `erp-img-${raw.name}`,
      url: resolvedImage,
      alt: raw.item_name,
      type: "IMAGE"
    } : null,
    created_at: raw.modified || new Date().toISOString(),
    updated_at: raw.modified || new Date().toISOString(),
    variants: []
  };

  const standardVariant = {
    id: raw.name, // Usually erp item code
    item_code: raw.name,
    name: "Standard Pack",
    price: raw.standard_rate ?? 0,
    wholesalePrice: raw.custom_wholesale_rate ?? null,
    weightGrams: raw.weight_per_unit ? raw.weight_per_unit * 1000 : null, // Assuming ERP uses KG
    length: raw.custom_length ?? null,
    width: raw.custom_width ?? null,
    height: raw.custom_height ?? null,
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
  };
  product.variants.push(standardVariant as any);

  if (raw.custom_carton_rate) {
    const cartonVariant = {
      id: `${raw.name}-CARTON`,
      item_code: `${raw.name}-CARTON`,
      name: "Carton Box",
      price: raw.custom_carton_rate,
      wholesalePrice: raw.custom_carton_rate, // Carton rate is usually already wholesale
      weightGrams: raw.custom_carton_weight ? raw.custom_carton_weight * 1000 : null,
      length: raw.custom_length ? raw.custom_length * 2 : null, // Rough estimation if not provided
      width: raw.custom_width ? raw.custom_width * 2 : null,
      height: raw.custom_height ? raw.custom_height * 2 : null,
      inventoryLevels: [{
        warehouseId: "default",
        available: raw.actual_qty ? Math.floor(raw.actual_qty / 10) : 0, // Assuming 10 packs per carton if not strictly tracked
        reserved: 0,
        committed: 0,
        sold: 0,
        damaged: 0,
        returned: 0
      }],
      images: resolvedImage ? [{
        id: `erp-img-${raw.name}-carton`,
        url: resolvedImage,
        alt: `${raw.item_name} Carton`,
        type: "IMAGE"
      }] : [],
    };
    product.variants.push(cartonVariant as any);
  }

  return product;
}

export function mapOrderToErpSalesOrder(order: StorefrontOrder, customerId: string = "Website Walk-in"): ERPNextSalesOrderPayload {
  return {
    customer: customerId,
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

export function mapPrismaOrderToErpSalesOrder(
  order: any, // Prisma Order with items and user
  customerId: string
): ERPNextSalesOrderPayload {
  return {
    customer: customerId,
    customer_name: order.user?.name || order.user?.email || "Guest",
    contact_email: order.user?.email || "guest@example.com",
    custom_storefront_order_id: order.id,
    items: order.items.map((item: any) => ({
      item_code: item.productVariantId,
      qty: item.qty,
      rate: Number(item.rate),
    })),
    taxes_and_charges: [
      {
        charge_type: "Actual",
        account_head: "Tax Account - Default", 
        description: "Tax",
        tax_amount: Number(order.taxTotal)
      },
      {
        charge_type: "Actual",
        account_head: "Shipping - Default",
        description: "Shipping",
        tax_amount: Number(order.shippingTotal)
      }
    ],
    ...(order.coupon ? { coupon_code: order.coupon.code } : {}),
    ...(order.discountTotal > 0 ? { additional_discount_amount: Number(order.discountTotal) } : {})
  };
}
