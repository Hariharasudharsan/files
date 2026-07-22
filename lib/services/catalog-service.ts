import "server-only";

import type { Product } from "@/lib/domain/models/product";
import { listPublishedProducts } from "@/lib/repositories/catalog-repository";

export async function getStorefrontProducts(): Promise<Product[]> {
  return listPublishedProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await listPublishedProducts();
  return products.find(p => p.slug === slug);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await listPublishedProducts();
  return products.filter(p => p.item_group.toLowerCase() === category.toLowerCase());
}
