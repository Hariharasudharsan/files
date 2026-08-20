import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SearchFilters from "@/components/SearchFilters";
import { CatalogService } from "@/lib/core/application/CatalogService";
import { searchAdapter } from "@/lib/integrations/search/postgres-adapter";
import SearchSortDesktop from "@/components/SearchSortDesktop";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; category?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";
  const sort = resolvedSearchParams.sort || "relevance";
  const categoryId = resolvedSearchParams.category as string | undefined;
  const page = parseInt(resolvedSearchParams.page as string || "1", 10);
  const limit = 20;

  // Extract dynamic filters (can be comma-separated or single values depending on how SearchFilters serializes them)
  const extractFilterArray = (key: string) => {
    const val = (resolvedSearchParams as any)[key] as string | undefined;
    if (!val) return undefined;
    return val.split(',').map(v => v.trim()).filter(Boolean);
  };

  const searchResult = await searchAdapter.searchProducts(
    query,
    { 
      category: categoryId,
      spiceLevel: extractFilterArray("spiceLevel"),
      dietType: extractFilterArray("dietType"),
      region: extractFilterArray("region"),
      mealPairing: extractFilterArray("mealPairing"),
    },
    page,
    limit
  );

  let products = searchResult.hits;

  // In-memory sort is applied ONLY to the current page if price sort is requested.
  // For true global price sorting, a minPrice field should be denormalized on the Product model.
  if (sort === 'price_asc') {
    products.sort((a, b) => {
      const priceA = a.variants[0]?.price || 0;
      const priceB = b.variants[0]?.price || 0;
      return priceA - priceB;
    });
  } else if (sort === 'price_desc') {
    products.sort((a, b) => {
      const priceA = a.variants[0]?.price || 0;
      const priceB = b.variants[0]?.price || 0;
      return priceB - priceA;
    });
  }

  const categories = await CatalogService.getAllCategories();

  // Fetch filter config from settings
  let filterConfig = {};
  try {
    const { prisma } = await import('@/lib/infrastructure/database/prisma');
    const setting = await prisma.settings.findUnique({
      where: { key: "SEARCH_FILTERS_CONFIG" }
    });
    if (setting?.value) {
      filterConfig = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    }
  } catch (e) {
    // Ignore and use empty config
  }

  return (
    <div className="bg-surface-50 min-h-screen pb-20">
      <div className="bg-white border-b border-surface-200">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="font-display text-4xl font-bold text-surface-950">
            {query ? `Search Results for "${query}"` : "All Products"}
          </h1>
          <p className="mt-2 text-surface-900/70">
            Found {products.length} product(s)
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <SearchFilters categories={categories} filterConfig={filterConfig} />

          {/* Main Content */}
          <div className="flex-1">
            <div className="hidden lg:flex justify-end mb-6">
              <SearchSortDesktop currentSort={sort} />
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-surface-200">
                <p className="text-surface-900/60 text-lg">We couldn&apos;t find any products matching your search.</p>
                <Link href="/search" className="inline-block mt-4 text-primary-600 font-semibold underline">Clear all filters</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
