import "server-only";

import type { Product } from "@/lib/domain/entities/product";
import { listPublishedProducts } from "@/lib/repositories/catalog-repository";
import { CacheService } from "@/lib/infrastructure/cache/cache-service";
import { CachePolicy } from "@/lib/infrastructure/cache/cache-policies";

export class CatalogService {
  static async getStorefrontProducts(): Promise<Product[]> {
    // Published Catalog
    const policy = CachePolicy.Catalog.Published;
    return await CacheService.remember(policy.key(), policy.ttl, async () => {
      return await listPublishedProducts();
    });
  }
}
