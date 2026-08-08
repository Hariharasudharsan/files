import { notFound } from "next/navigation";
import { getProductsByCategory } from "@/lib/services/catalog-service";
import ProductCard from "@/components/ProductCard";
import { Filter, SlidersHorizontal, ChevronDown } from "lucide-react";

// Categories available mapping
const CATEGORIES = ["Appalam", "Papadam", "Vadam", "Combo Packs", "Masala", "Rice Products", "Gift Boxes", "Snacks", "Chips"];

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Convert slug back to readable category, e.g., combo-packs -> Combo Packs
  const categoryName = CATEGORIES.find(c => c.toLowerCase().replace(" ", "-") === slug.toLowerCase());

  if (!categoryName) {
    notFound();
  }

  const products = await getProductsByCategory(categoryName);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="font-display text-4xl font-bold text-surface-950">{categoryName}</h1>
        <p className="mt-4 text-surface-900/70">
          Explore our authentic range of {categoryName.toLowerCase()}, made with traditional South Indian recipes.
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
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-28 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-surface-950 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" /> Filters
              </h2>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-surface-950 flex items-center justify-between cursor-pointer">
                Availability <ChevronDown className="w-4 h-4" />
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm text-surface-700 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-600 accent-primary-600" />
                  <span className="group-hover:text-primary-700 transition-colors">In Stock</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-surface-700 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-600 accent-primary-600" />
                  <span className="group-hover:text-primary-700 transition-colors">Out of Stock</span>
                </label>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-surface-100">
              <h3 className="font-semibold text-surface-950 flex items-center justify-between cursor-pointer">
                Price <ChevronDown className="w-4 h-4" />
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm text-surface-700 cursor-pointer group">
                  <input type="radio" name="price" className="w-4 h-4 border-surface-300 text-primary-600 focus:ring-primary-600 accent-primary-600" />
                  <span className="group-hover:text-primary-700 transition-colors">Under ₹500</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-surface-700 cursor-pointer group">
                  <input type="radio" name="price" className="w-4 h-4 border-surface-300 text-primary-600 focus:ring-primary-600 accent-primary-600" />
                  <span className="group-hover:text-primary-700 transition-colors">₹500 - ₹1000</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-surface-700 cursor-pointer group">
                  <input type="radio" name="price" className="w-4 h-4 border-surface-300 text-primary-600 focus:ring-primary-600 accent-primary-600" />
                  <span className="group-hover:text-primary-700 transition-colors">Over ₹1000</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-surface-100">
              <h3 className="font-semibold text-surface-950 flex items-center justify-between cursor-pointer">
                Tags <ChevronDown className="w-4 h-4" />
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-surface-100 text-surface-700 text-xs rounded-full hover:bg-primary-100 hover:text-primary-800 cursor-pointer transition-colors">Spicy</span>
                <span className="px-3 py-1 bg-surface-100 text-surface-700 text-xs rounded-full hover:bg-primary-100 hover:text-primary-800 cursor-pointer transition-colors">Plain</span>
                <span className="px-3 py-1 bg-surface-100 text-surface-700 text-xs rounded-full hover:bg-primary-100 hover:text-primary-800 cursor-pointer transition-colors">Garlic</span>
                <span className="px-3 py-1 bg-surface-100 text-surface-700 text-xs rounded-full hover:bg-primary-100 hover:text-primary-800 cursor-pointer transition-colors">Vegan</span>
              </div>
            </div>
          </div>
        </aside>

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
