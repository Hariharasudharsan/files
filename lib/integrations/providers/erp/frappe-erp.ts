import type { IErpAdapter } from "../../adapters/erp-adapter";
import type { StorefrontOrder } from "@/lib/domain/entities/order";
import type { CustomerProfile } from "@/lib/domain/entities/customer";
import type { Product, InventorySnapshot } from "@/lib/domain/entities/product";
import { ErpApiClient } from "@/lib/integrations/erp/client";

export class FrappeErpProvider implements IErpAdapter {
  async createSalesOrder(order: StorefrontOrder): Promise<string> {
    // Adapter mapping logic here
    // return await ErpApiClient.request("Sales Order", { ... })
    return "MOCK_SALES_ORDER_ID";
  }

  async upsertCustomer(customer: CustomerProfile): Promise<string> {
    // Adapter mapping logic here
    return "MOCK_CUSTOMER_ID";
  }

  async fetchInventory(): Promise<InventorySnapshot[]> {
    return [];
  }

  async fetchProducts(): Promise<Product[]> {
    return [];
  }
}
