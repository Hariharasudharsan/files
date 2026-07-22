import { notFound } from "next/navigation";
import { getProductsByCategory } from "@/lib/services/catalog-service";
import ProductCard from "@/components/ProductCard";

// Categories available mapping
const CATEGORIES = ["Appalam", "Papadam", "Vadam", "Pickles", "Combo Packs", "Masala", "Rice Products", "Gift Boxes"];

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  // Convert slug back to readable category, e.g., combo-packs -> Combo Packs
  const categoryName = CATEGORIES.find(c => c.toLowerCase().replace(" ", "-") === params.slug.toLowerCase());

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

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.item_code} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-surface-900/60">No products found in this category yet. Please check back later.</p>
        </div>
      )}
    </div>
  );
}
