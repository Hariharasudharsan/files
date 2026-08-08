import "server-only";

import { prisma } from "@/lib/infrastructure/database/prisma";
import { Logger } from "@/lib/infrastructure/logger";
import type { Product } from "@/lib/domain/entities/product";
import type { ISearchAdapter, SearchFilters, SearchResult } from "./types";

export class PostgresSearchAdapter implements ISearchAdapter {
  async searchProducts(
    query: string,
    filters?: SearchFilters,
    page = 1,
    limit = 20,
  ): Promise<SearchResult> {
    const skip = (page - 1) * limit;

    // Build the query where clause
    const where: any = { isDeleted: false };

    // 1. Text Search (using PostgreSQL full text search natively supported by Prisma)
    if (query) {
      where.OR = [{ name: { search: query } }, { description: { search: query } }];
    }

    // 2. Filters
    if (filters?.category) {
      where.category = { slug: filters.category };
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.variants = {
        some: {
          price: {
            ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
          },
        },
      };
    }

    if (filters?.inStock) {
      where.variants = {
        ...(where.variants || {}),
        some: {
          ...(where.variants?.some || {}),
          inventoryLevels: { some: { available: { gt: 0 } } },
        },
      };
    }

    // Run query
    try {
      const [total, records] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          include: { 
            variants: {
              include: {
                inventoryLevels: true,
                images: { include: { media: true } }
              }
            } 
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
        }),
      ]);

      // Map back to Domain Product
      const hits: Product[] = records.map((p: any) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description || "",
        category_id: p.categoryId,
        ingredients: p.ingredients,
        nutritional_info: p.nutritionalInfo,
        shelf_life_days: p.shelfLifeDays,
        created_at: p.createdAt.toISOString(),
        updated_at: p.updatedAt.toISOString(),
        variants: p.variants.map((v: any) => ({
          id: v.id,
          item_code: v.itemCode,
          name: v.name,
          price: v.price.toNumber(),
          available_stock: v.inventoryLevels?.[0]?.available || 0,
          image: v.images?.[0]?.media?.url || null,
        })),
      }));

      return {
        hits,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (err) {
      Logger.error("Search query failed", { error: err });
      return { hits: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  async indexProduct(product: Product): Promise<void> {
    // For PostgreSQL, indexing happens automatically upon insert/update.
    // NOP for Postgres. Useful when we switch to Meilisearch/Elastic.
  }

  async removeProduct(id: string): Promise<void> {
    // NOP for Postgres (handled by cascading deletes or direct DB ops).
  }
}

export const searchAdapter = new PostgresSearchAdapter();
