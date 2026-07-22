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

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.item_name,
    description:
      product.description || `${product.item_name} — authentic, factory-direct from Mathuram Foods.`,
    image: product.image || undefined,
    sku: product.item_code,
    category: product.item_group || undefined,
    brand: { "@type": "Brand", name: "Mathuram Foods" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.standard_rate.toFixed(2),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <Link href={`/product/${product.slug}`} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-surface-200 transition-all hover:shadow-xl hover:border-primary-300">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative aspect-[4/5] overflow-hidden bg-surface-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.item_name}
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
            {product.item_group}
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
        
        <h3 className="font-display font-bold text-lg text-surface-950 group-hover:text-primary-700 transition-colors">{product.item_name}</h3>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm text-surface-900/60 font-light leading-relaxed">{product.description}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-6">
          <div className="flex flex-col">
            <span className="text-xs text-surface-900/50 mb-0.5 uppercase tracking-wider font-semibold">Price</span>
            <span className="font-display text-2xl font-bold text-surface-950">
              ₹{product.standard_rate}
            </span>
          </div>
          
          <Button
            size="sm"
            onClick={handleAdd}
            aria-label={`Add ${product.item_name} to cart`}
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
