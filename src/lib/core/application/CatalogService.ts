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
  
  // New Fields
  fryingTemp?: string;
  airFryerSetting?: string;
  microwaveTime?: string;
  spiceLevel?: string;
  dietType?: string;
  region?: string;
  mealPairing?: string;
  isSubscribable?: boolean;
  subscriptionDiscountPercent?: number;
  badgeIds?: string[];
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
          fryingTemp: data.fryingTemp,
          airFryerSetting: data.airFryerSetting,
          microwaveTime: data.microwaveTime,
          spiceLevel: data.spiceLevel,
          dietType: data.dietType,
          region: data.region,
          mealPairing: data.mealPairing,
          isSubscribable: data.isSubscribable,
          subscriptionDiscountPercent: data.subscriptionDiscountPercent,
          ...(data.badgeIds?.length ? {
            badges: {
              create: data.badgeIds.map(id => ({ badgeId: id }))
            }
          } : {})
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

  static async getFeaturedReviews() {
    const policy = CachePolicy.Catalog.Published;
    return await CacheService.remember("featured_reviews", policy.ttl, async () => {
      return await prisma.review.findMany({
        where: { isFeatured: true, isApproved: true },
        include: { user: { select: { name: true } }, product: { select: { name: true, slug: true } } },
        orderBy: { createdAt: "desc" }
      });
    });
  }

  static async getPromotedCoupon() {
    const policy = CachePolicy.Catalog.Published;
    return await CacheService.remember("promoted_coupon", policy.ttl, async () => {
      const now = new Date();
      const coupon = await prisma.coupon.findFirst({
        where: { 
          isPromoted: true, 
          isActive: true,
          validUntil: { gte: now }
        },
        orderBy: { createdAt: "desc" }
      });

      if (!coupon) return null;

      let product = null;
      if (coupon.promotedProductId) {
        product = await prisma.product.findUnique({
          where: { id: coupon.promotedProductId },
          include: { 
            primaryImage: true,
            variants: true
          }
        });
      }

      return { coupon, product };
    });
  }
}
