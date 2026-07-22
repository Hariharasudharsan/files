export interface Product {
  item_code: string;
  item_name: string;
  standard_rate: number;
  image: string | null;
  description: string;
  item_group: string;
  stock_qty?: number;
  updated_at?: string;
}

export interface InventorySnapshot {
  item_code: string;
  available_qty: number;
  reserved_qty?: number;
  updated_at: string;
}
