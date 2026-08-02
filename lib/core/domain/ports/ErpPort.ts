import { Order, User } from "@/generated/prisma/client";

export interface SyncResult {
  success: boolean;
  erpId?: string;
  error?: string;
}

export interface ErpPort {
  syncOrder(order: Order): Promise<SyncResult>;
  syncCustomer(user: User): Promise<SyncResult>;
  checkInventory(sku: string): Promise<number>;
}
