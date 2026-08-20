export interface Media {
  id: string;
  url: string;
  alt: string | null;
  type: string;
}

export interface InventoryLevel {
  warehouseId: string;
  available: number;
  reserved: number;
  committed: number;
  sold: number;
  damaged: number;
  returned: number;
}

export interface ProductVariant {
  id: string;
  item_code: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  wholesalePrice?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  weightGrams?: number | null;
  inventoryLevels?: InventoryLevel[];
  images?: Media[];
  isBestValue?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_id: string | null;
  categoryName?: string;
  ingredients: string | null;
  nutritional_info: string | null;
  shelf_life_days: number | null;
  gstRate?: number;
  hsnCode?: string | null;
  fssaiLicense?: string | null;
  isFeatured?: boolean;
  isDeleted?: boolean;
  searchKeywords?: string[];
  primaryImage?: Media | null;
  images?: Media[];
  tags?: string[];
  collections?: string[];
  variants: ProductVariant[];
  isSubscribable?: boolean;
  subscriptionDiscountPercent?: number | null;
  fryingTemp?: string | null;
  airFryerSetting?: string | null;
  microwaveTime?: string | null;
  spiceLevel?: string | null;
  dietType?: string | null;
  region?: string | null;
  mealPairing?: string | null;
  badges?: any[];
  reviewCount?: number;
  averageRating?: number;
  created_at: string;
  updated_at: string;
}

export interface InventorySnapshot {
  item_code: string;
  warehouseId: string;
  available_qty: number;
  reserved_qty?: number;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount?: number;
}
