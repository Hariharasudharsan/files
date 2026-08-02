import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Package } from "lucide-react";
import { getProductBySlug } from "@/lib/services/catalog-service";
import AddToCartButton from "@/components/AddToCartButton";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.name,
    description: product.description?.slice(0, 160) || `Buy ${product.name} online at Mathuram Foods.`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.variants[0]?.image ? [{ url: product.variants[0].image }] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.variants[0]?.image,
    "description": product.description || `Buy ${product.name} online at Mathuram Foods.`,
    "sku": product.variants[0]?.item_code,
    "offers": {
      "@type": "Offer",
      "url": `https://www.mathuramfoods.com/product/${product.slug}`,
      "priceCurrency": "INR",
      "price": product.variants[0]?.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.variants[0]?.available_stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image Gallery placeholder */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface-100">
            {product.variants[0]?.image ? (
              <Image src={product.variants[0]?.image} alt={product.name} fill className="object-cover" />
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
            {product.name}
          </h1>
          <p className="mt-2 text-lg text-primary-600 font-medium">{"Category"}</p>
          
          <div className="mt-4 text-3xl font-bold text-surface-950">
            ₹{product.variants[0]?.price}
          </div>

          <div className="mt-6 prose text-surface-900/80">
            <p>{product.description}</p>
          </div>

          {/* Schema removed ingredients and shelfLife as they are part of description */}

          <div className="mt-10">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
