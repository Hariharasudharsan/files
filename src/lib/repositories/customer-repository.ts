import "server-only";

import type { CustomerProfile } from "@/lib/core/domain/entities/customer";

const customers = new Map<string, CustomerProfile>();

export async function upsertCustomerProfile(customer: CustomerProfile): Promise<void> {
  customers.set(customer.email, customer);
}
