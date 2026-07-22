import "server-only";

import type { Product } from "@/lib/domain/product";
import { listPublishedProducts } from "@/lib/repositories/catalog-repository";

export async function getStorefrontProducts(): Promise<Product[]> {
  return listPublishedProducts();
}
