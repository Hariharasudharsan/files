import { getStorefrontProducts } from "@/lib/services/catalog-service";
import ProductCard from "@/components/ProductCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  const allProducts = await getStorefrontProducts();

  const products = query
    ? allProducts.filter((p) =>
        p.item_name.toLowerCase().includes(query.toLowerCase()) ||
        p.item_group.toLowerCase().includes(query.toLowerCase())
      )
    : allProducts;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-12">
        <h1 className="font-display text-4xl font-bold text-surface-950">
          {query ? `Search Results for "${query}"` : "All Products"}
        </h1>
        <p className="mt-2 text-surface-900/70">
          Found {products.length} product(s)
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
          <p className="text-surface-900/60">We couldn&apos;t find any products matching your search.</p>
        </div>
      )}
    </div>
  );
}
