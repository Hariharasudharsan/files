import type { StorefrontOrder } from "@/lib/domain/models/order";
import { ErpQueue } from "../queue";

/**
 * ERP Order Sync Architecture
 * 
 * Responsible for mapping Website Orders to ERPNext Sales Orders
 * and enqueueing them for asynchronous processing.
 */

export interface ErpSyncResult {
  success: boolean;
  jobId?: string;
  error?: string;
}

/**
 * Enqueues a storefront order to be created as a Sales Order in ERPNext.
 * This guarantees that the website frontend remains fast and the order
 * will be eventually created in the ERP even if Frappe Cloud is down.
 */
export async function queueOrderSync(order: StorefrontOrder): Promise<ErpSyncResult> {
  console.log(`[ERP Sync] Preparing to sync order ${order.id} to ERPNext.`);

  try {
    const jobId = await ErpQueue.enqueue("SYNC_ORDER", {
      orderId: order.id,
      customer: order.contact,
      items: order.items,
      total: order.total,
      timestamp: new Date().toISOString()
    });

    return { success: true, jobId };
  } catch (error) {
    console.error("[ERP Sync] Failed to enqueue order sync:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Worker Handler: Executes the actual API call to ERPNext.
 * 
 * Note: In a real implementation, this function would be called by the 
 * Queue worker (e.g., Inngest function) and would use ErpApiClient.request()
 * to create the Sales Order.
 */
export async function processOrderSyncJob(payload: unknown): Promise<void> {
  const orderId = (payload as { orderId: string }).orderId;
  // Mapping logic would go here
  // const salesOrder = mapWebsiteOrderToFrappeSalesOrder(payload);
  
  // await ErpApiClient.request("Sales Order", {
  //   method: "POST",
  //   body: JSON.stringify(salesOrder)
  // });
  
  console.log(`[ERP Worker] Mock API Call: Created Sales Order for Website Order ${orderId}`);
}
