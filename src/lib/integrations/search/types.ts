import type { Product } from "@/lib/core/domain/entities/product";

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  spiceLevel?: string[];
  dietType?: string[];
  region?: string[];
  mealPairing?: string[];
}

export interface SearchResult {
  hits: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ISearchAdapter {
  searchProducts(
    query: string,
    filters?: SearchFilters,
    page?: number,
    limit?: number,
  ): Promise<SearchResult>;
  indexProduct(product: Product): Promise<void>;
  removeProduct(id: string): Promise<void>;
}
