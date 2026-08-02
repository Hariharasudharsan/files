export interface ProductVariant {
  id: string;
  item_code: string;
  name: string;
  price: number;
  available_stock: number;
  image: string | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_id: string | null;
  ingredients: string | null;
  nutritional_info: string | null;
  shelf_life_days: number | null;
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface InventorySnapshot {
  item_code: string;
  available_qty: number;
  reserved_qty?: number;
  updated_at: string;
}
