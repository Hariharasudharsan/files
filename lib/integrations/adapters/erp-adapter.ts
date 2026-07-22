import type { StorefrontOrder } from "@/lib/domain/models/order";
import type { CustomerProfile } from "@/lib/domain/models/customer";
import type { Product, InventorySnapshot } from "@/lib/domain/models/product";

export interface IErpAdapter {
  createSalesOrder(order: StorefrontOrder): Promise<string>;
  upsertCustomer(customer: CustomerProfile): Promise<string>;
  fetchInventory(): Promise<InventorySnapshot[]>;
  fetchProducts(): Promise<Product[]>;
}
