import { prisma } from "@/lib/infrastructure/database/prisma";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SearchFilters from "@/components/SearchFilters";
import { getAllCategories } from "@/lib/services/catalog-service";
import SearchSortDesktop from "@/components/SearchSortDesktop";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; category?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";
  const sort = resolvedSearchParams.sort || "relevance";
  const categoryId = resolvedSearchParams.category;

  // Build the where clause
  let whereClause: any = {};
  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } }
    ];
  }
  if (categoryId) {
    whereClause.category = {
      slug: categoryId
    };
  }

  // Build order by
  let orderBy: any = undefined;
  if (sort === 'price_asc') {
    orderBy = { variants: { _count: 'asc' } }; // placeholder for relation sorting
  } else if (sort === 'price_desc') {
    orderBy = { variants: { _count: 'desc' } }; 
  } else if (sort === 'newest') {
    orderBy = { createdAt: 'desc' };
  }

  let products = await prisma.product.findMany({
    where: whereClause,
    orderBy: orderBy,
    include: {
      primaryImage: true,
      variants: {
        where: { isDeleted: false },
        take: 1
      }
    }
  });

  // Handle price sorting in memory since Prisma doesn't natively support sorting by relation min aggregate
  if (sort === 'price_asc') {
    products.sort((a, b) => {
      const priceA = a.variants[0]?.price?.toNumber() || 0;
      const priceB = b.variants[0]?.price?.toNumber() || 0;
      return priceA - priceB;
    });
  } else if (sort === 'price_desc') {
    products.sort((a, b) => {
      const priceA = a.variants[0]?.price?.toNumber() || 0;
      const priceB = b.variants[0]?.price?.toNumber() || 0;
      return priceB - priceA;
    });
  }

  const categories = await getAllCategories();

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
          
          <SearchFilters categories={categories} />

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
