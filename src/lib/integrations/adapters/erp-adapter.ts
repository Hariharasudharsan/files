import type { StorefrontOrder } from "@/lib/domain/entities/order";
import type { CustomerProfile } from "@/lib/domain/entities/customer";
import type { Product, InventorySnapshot } from "@/lib/domain/entities/product";

export interface IErpAdapter {
  createSalesOrder(order: StorefrontOrder): Promise<string>;
  upsertCustomer(customer: CustomerProfile): Promise<string>;
  fetchInventory(): Promise<InventorySnapshot[]>;
  fetchProducts(): Promise<Product[]>;
}
