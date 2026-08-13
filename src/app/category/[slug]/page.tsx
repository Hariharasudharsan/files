import { notFound } from "next/navigation";
import { CatalogService } from "@/lib/core/application/CatalogService";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import { Filter } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categories = await CatalogService.getAllCategories();
  const category = categories.find(c => c.slug === slug.toLowerCase());
  
  return {
    title: category ? `${category.name} | Authentic Indian Delicacies` : "Category Not Found",
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const categories = await CatalogService.getAllCategories();
  const category = categories.find(c => c.slug === slug.toLowerCase());

  if (!category) {
    notFound();
  }

  const products = await CatalogService.getProductsByCategory(category.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="font-display text-4xl font-bold text-surface-950">{category.name}</h1>
        <p className="mt-4 text-surface-900/70">
          Explore our authentic range of {category.name.toLowerCase()}, made with traditional South Indian recipes.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between border-b border-surface-200 pb-4">
          <button className="flex items-center gap-2 font-semibold text-surface-950">
            <Filter className="w-5 h-5" /> Filter & Sort
          </button>
          <span className="text-sm text-surface-500">{products.length} products</span>
        </div>

        {/* Sidebar Filters (Desktop) */}
        <ProductFilters />

        {/* Product Grid */}
        <div className="flex-1">
          <div className="hidden lg:flex items-center justify-between mb-8 pb-4 border-b border-surface-200">
            <span className="text-sm text-surface-500 font-medium">Showing {products.length} products</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-surface-500">Sort by:</span>
              <select className="bg-transparent text-sm font-semibold text-surface-950 focus:outline-none cursor-pointer">
                <option>Featured</option>
                <option>Best Selling</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrivals</option>
              </select>
            </div>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-surface-50 rounded-2xl border border-surface-100">
              <p className="text-surface-900/60 font-medium">No products found matching your criteria. Try clearing some filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
