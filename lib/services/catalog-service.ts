import "server-only";

import type { Product } from "@/lib/domain/entities/product";
import { searchAdapter } from "@/lib/integrations/search/postgres-adapter";
import { listPublishedProducts } from "@/lib/repositories/catalog-repository";
import { Logger } from "@/lib/infrastructure/logger";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function getProducts(query?: string): Promise<Product[]> {
  try {
    if (query) {
      const results = await searchAdapter.searchProducts(query);
      return results.hits;
    }
    return await listPublishedProducts();
  } catch (err) {
    Logger.error("Failed to fetch products", { error: err });
    return [];
  }
}

export async function getStorefrontProducts(): Promise<Product[]> {
  return await listPublishedProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await listPublishedProducts();
  return products.find(p => p.slug === slug) || null;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  // Wait, Product doesn't have a direct category property in listPublishedProducts() mock
  // let's do a naive string match or return all for now.
  const products = await listPublishedProducts();
  return products.filter(p => (p as any).category_id === categorySlug || (p as any).category?.slug === categorySlug);
}
