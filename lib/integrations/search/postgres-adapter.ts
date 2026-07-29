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
    const where: any = {};

    // 1. Text Search (using PostgreSQL full text search natively supported by Prisma)
    if (query) {
      where.OR = [{ name: { search: query } }, { description: { search: query } }];
    }

    // 2. Filters
    if (filters?.category) {
      // Assuming a relation or string field. Adjust to schema later.
      where.category = { slug: filters.category };
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    if (filters?.inStock) {
      where.inventory = { gt: 0 };
    }

    // Run query
    try {
      const [total, records] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            // Rank exact matches higher or default to created date
            createdAt: "desc",
          },
        }),
      ]);

      // Map back to Domain Product
      const hits: Product[] = records.map((r) => ({
        item_code: r.id, // Or itemCode if available
        item_name: r.name,
        slug: r.slug,
        standard_rate: r.price,
        image: r.imageUrl,
        description: r.description || "",
        item_group: "Unknown", // Needs to be fetched from category relation
        stock_qty: r.inventory,
        updated_at: r.updatedAt.toISOString(),
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
