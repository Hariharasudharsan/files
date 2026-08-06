"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Package, Plus, Star } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import type { Product } from "@/lib/domain/entities/product";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);

  const defaultVariant = product.variants[0];
  const availableStock = defaultVariant?.inventoryLevels?.reduce((sum, il) => sum + il.available, 0) || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (defaultVariant) {
      addItem(product, defaultVariant, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description || `${product.name} — authentic, factory-direct from Mathuram Foods.`,
    image: product.primaryImage?.url || undefined,
    sku: defaultVariant?.item_code,
    category: "Mathuram Foods", // Assuming static or fetched category
    brand: { "@type": "Brand", name: "Mathuram Foods" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: defaultVariant?.price?.toFixed(2) || "0.00",
      availability: availableStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <Link href={`/product/${product.slug}`} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-surface-200 transition-all hover:shadow-xl hover:border-primary-300">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative aspect-[4/5] overflow-hidden bg-surface-100">
        {product.primaryImage ? (
          <Image
            src={product.primaryImage.url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-primary-200" aria-hidden="true" />
          </div>
        )}
        <div className="absolute left-4 top-4">
          <Badge variant="secondary" className="backdrop-blur bg-white/90 shadow-sm border-white/50 border">
            {defaultVariant?.name || "Standard Pack"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex gap-1 mb-3 text-accent-500">
          <Star className="w-3.5 h-3.5 fill-current" />
          <Star className="w-3.5 h-3.5 fill-current" />
          <Star className="w-3.5 h-3.5 fill-current" />
          <Star className="w-3.5 h-3.5 fill-current" />
          <Star className="w-3.5 h-3.5 fill-current" />
        </div>
        
        <h3 className="font-display font-bold text-lg text-surface-950 group-hover:text-primary-700 transition-colors">{product.name}</h3>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm text-surface-900/60 font-light leading-relaxed">{product.description}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-6">
          <div className="flex flex-col">
            <span className="text-xs text-surface-900/50 mb-0.5 uppercase tracking-wider font-semibold">Price</span>
            <span className="font-display text-2xl font-bold text-surface-950">
              ₹{defaultVariant?.price || 0}
            </span>
          </div>
          
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!defaultVariant || availableStock <= 0}
            aria-label={`Add ${product.name} to cart`}
            className={`rounded-full h-12 w-12 p-0 shadow-sm transition-all ${
              justAdded ? "bg-green-600 hover:bg-green-700" : ""
            }`}
          >
            {justAdded ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </Link>
  );
}
