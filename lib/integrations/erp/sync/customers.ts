import type { CheckoutContact } from "@/lib/domain/order";
import { ErpQueue } from "../queue";

/**
 * ERP Customer Sync Architecture
 * 
 * Responsible for syncing Website Customers/Contacts to ERPNext Customers
 * when they checkout or update their profile.
 */

export async function queueCustomerSync(contact: CheckoutContact): Promise<void> {
  console.log(`[ERP Sync] Enqueueing customer sync for ${contact.email}`);

  try {
    await ErpQueue.enqueue("SYNC_CUSTOMER", {
      email: contact.email,
      name: contact.name,
      phone: contact.phone,
      address: contact.address,
      city: contact.city,
      state: contact.state,
      pincode: contact.pincode,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[ERP Sync] Failed to enqueue customer sync:", error);
  }
}

export async function processCustomerSyncJob(payload: unknown): Promise<void> {
  // Mapping logic would go here
  // const customerData = mapWebsiteContactToFrappeCustomer(payload);
  
  // await ErpApiClient.request("Customer", {
  //   method: "POST", // Or PUT if updating
  //   body: JSON.stringify(customerData)
  // });
  
  const email = (payload as { email: string }).email;
  console.log(`[ERP Worker] Mock API Call: Upserted ERPNext Customer for ${email}`);
}
