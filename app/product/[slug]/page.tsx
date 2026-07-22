import { notFound } from "next/navigation";
import Image from "next/image";
import { Package } from "lucide-react";
import { getProductBySlug } from "@/lib/services/catalog-service";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image Gallery placeholder */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface-100">
            {product.image ? (
              <Image src={product.image} alt={product.item_name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-16 w-16 text-primary-200" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="font-display text-4xl font-bold text-surface-950">
            {product.item_name}
          </h1>
          <p className="mt-2 text-lg text-primary-600 font-medium">{product.item_group}</p>
          
          <div className="mt-4 text-3xl font-bold text-surface-950">
            ₹{product.standard_rate}
          </div>

          <div className="mt-6 prose text-surface-900/80">
            <p>{product.description}</p>
          </div>

          <div className="mt-10 border-t border-surface-200 pt-8">
            <h3 className="font-semibold text-surface-950">Ingredients</h3>
            <p className="mt-2 text-sm text-surface-900/70">{product.ingredients || "N/A"}</p>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-surface-950">Shelf Life</h3>
            <p className="mt-2 text-sm text-surface-900/70">{product.shelfLife || "N/A"}</p>
          </div>

          <div className="mt-10">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
