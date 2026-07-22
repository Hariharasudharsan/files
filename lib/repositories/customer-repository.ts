import "server-only";

import type { CustomerProfile } from "@/lib/domain/models/customer";

const customers = new Map<string, CustomerProfile>();

export async function upsertCustomerProfile(customer: CustomerProfile): Promise<void> {
  customers.set(customer.email, customer);
}
