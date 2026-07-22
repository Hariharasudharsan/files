/**
 * ERPNext Orders Integration Service Stub
 * 
 * This file serves as the architectural boundary for future ERPNext syncing.
 */

import type { StorefrontOrder } from "@/lib/domain/order";

export interface ErpSyncResult {
  success: boolean;
  erpOrderId?: string;
  error?: string;
}

/**
 * Mocks pushing a storefront order to ERPNext as a Sales Order.
 * @todo Implement actual ERPNext REST API call here.
 */
export async function syncOrderToErp(order: StorefrontOrder): Promise<ErpSyncResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  console.log(`[ERP Sync] Simulating sync for order: ${order.id}`);
  
  return {
    success: true,
    erpOrderId: `SALES-ORD-${Date.now()}`
  };
}
