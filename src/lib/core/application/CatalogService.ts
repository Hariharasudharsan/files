import "server-only";

import type { Product } from "@/lib/core/domain/entities/product";
import { listPublishedProducts, listAllCategories, listPublishedProductsByCategory, getPublishedProductBySlug } from "@/lib/repositories/catalog-repository";
import { CacheService } from "@/lib/infrastructure/cache/cache-service";
import { CachePolicy } from "@/lib/infrastructure/cache/cache-policies";
import { searchAdapter } from "@/lib/integrations/search/postgres-adapter";
import { Logger } from "@/lib/infrastructure/logger";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";

export type CreateProductDTO = {
  name: string;
  slug: string;
  description?: string;
  categoryId?: string;
  price: number;
  compareAtPrice?: number;
  itemCode: string; // SKU
  weightGrams?: number;
};

export class CatalogService {
  static async getStorefrontProducts(): Promise<Product[]> {
    // Published Catalog
    const policy = CachePolicy.Catalog.Published;
    return await CacheService.remember(policy.key(), policy.ttl, async () => {
      return await listPublishedProducts();
    });
  }

  static async getProducts(query?: string): Promise<Product[]> {
    try {
      if (query) {
        // Search is highly dynamic
        const policy = CachePolicy.Search.Query;
        return await CacheService.remember(policy.key(query), policy.ttl, async () => {
          const results = await searchAdapter.searchProducts(query);
          return results.hits;
        });
      }
      return await this.getStorefrontProducts();
    } catch (err) {
      Logger.error("Failed to fetch products", { error: err });
      return [];
    }
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    // Product details
    const policy = CachePolicy.Catalog.ProductDetail;
    return await CacheService.remember(policy.key(slug), policy.ttl, async () => {
      return await getPublishedProductBySlug(slug);
    });
  }

  static async getAllCategories() {
    const policy = CachePolicy.Catalog.Category;
    return await CacheService.remember("all_categories", policy.ttl, async () => {
      return await listAllCategories();
    });
  }

  static async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    // Categories
    const policy = CachePolicy.Catalog.Category;
    return await CacheService.remember(policy.key(categorySlug), policy.ttl, async () => {
      return await listPublishedProductsByCategory(categorySlug);
    });
  }

  /**
   * Creates a product and its default variant.
   */
  static async createProduct(data: CreateProductDTO) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create the base product
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          categoryId: data.categoryId,
        },
      });

      // 2. Create the default variant
      const variant = await tx.productVariant.create({
        data: {
          productId: product.id,
          name: "Default Title",
          itemCode: data.itemCode,
          price: new Prisma.Decimal(data.price),
          compareAtPrice: data.compareAtPrice ? new Prisma.Decimal(data.compareAtPrice) : null,
          weightGrams: data.weightGrams,
        },
      });

      return { product, variant };
    });
  }
}
