import { prisma } from "@/lib/infrastructure/database/prisma";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal } from "lucide-react";

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
    whereClause.categories = {
      some: { categoryId }
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

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: orderBy,
    include: {
      primaryImage: true,
      variants: {
        take: 1
      }
    }
  });

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
          
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-surface-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-surface-950 font-bold">
                <SlidersHorizontal className="w-5 h-5" />
                <h2>Filters</h2>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-surface-900 mb-3">Category</h3>
                <div className="space-y-2">
                  {['Appalams', 'Vadams', 'Vathals', 'Combos'].map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500 bg-surface-100 border-surface-300" />
                      <span className="text-sm text-surface-700 hover:text-primary-600">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-surface-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  {['Under ₹200', '₹200 - ₹500', 'Above ₹500'].map(range => (
                    <label key={range} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500 bg-surface-100 border-surface-300" />
                      <span className="text-sm text-surface-700 hover:text-primary-600">{range}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="w-full bg-primary-50 text-primary-700 py-2 rounded-lg text-sm font-semibold hover:bg-primary-100 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-end mb-6">
              <select className="bg-white border border-surface-200 text-surface-700 text-sm rounded-lg px-4 py-2 outline-none focus:border-primary-500">
                <option value="relevance">Relevance</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
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
                <a href="/search" className="inline-block mt-4 text-primary-600 font-semibold underline">Clear all filters</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
