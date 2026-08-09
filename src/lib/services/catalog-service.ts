import "server-only";

import type { Product } from "@/lib/domain/entities/product";
import { searchAdapter } from "@/lib/integrations/search/postgres-adapter";
import { listPublishedProducts, listAllCategories, listPublishedProductsByCategory } from "@/lib/repositories/catalog-repository";
import { Logger } from "@/lib/infrastructure/logger";
import { CacheService } from "@/lib/infrastructure/cache/cache-service";
import { CachePolicy } from "@/lib/infrastructure/cache/cache-policies";

export async function getProducts(query?: string): Promise<Product[]> {
  try {
    if (query) {
      // Search is highly dynamic
      const policy = CachePolicy.Search.Query;
      return await CacheService.remember(policy.key(query), policy.ttl, async () => {
        const results = await searchAdapter.searchProducts(query);
        return results.hits;
      });
    }
    
    return await getStorefrontProducts();
  } catch (err) {
    Logger.error("Failed to fetch products", { error: err });
    return [];
  }
}

export async function getStorefrontProducts(): Promise<Product[]> {
  // Published Catalog
  const policy = CachePolicy.Catalog.Published;
  return await CacheService.remember(policy.key(), policy.ttl, async () => {
    return await listPublishedProducts();
  });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // Product details
  const policy = CachePolicy.Catalog.ProductDetail;
  return await CacheService.remember(policy.key(slug), policy.ttl, async () => {
    const products = await listPublishedProducts(); // In a real app, use a specific findBySlug repo method
    return products.find(p => p.slug === slug) || null;
  });
}

export async function getAllCategories() {
  const policy = CachePolicy.Catalog.Category;
  return await CacheService.remember("all_categories", policy.ttl, async () => {
    return await listAllCategories();
  });
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  // Categories
  const policy = CachePolicy.Catalog.Category;
  return await CacheService.remember(policy.key(categorySlug), policy.ttl, async () => {
    return await listPublishedProductsByCategory(categorySlug);
  });
}
