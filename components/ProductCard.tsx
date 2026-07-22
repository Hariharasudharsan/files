"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Package, Plus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import type { Product } from "@/lib/domain/product";

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  // Product structured data so Google can show price/availability directly
  // in search results (Merchant Listing rich results). Price is a plain
  // numeric string per Google's spec — never "₹120" or "1,200".
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
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative aspect-square overflow-hidden bg-orange-50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.item_name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-10 w-10 text-orange-200" aria-hidden="true" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-orange-700 backdrop-blur">
          {product.item_group}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display font-semibold text-orange-950">{product.item_name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-orange-800/60">{product.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-display text-lg font-bold text-orange-950">
            ₹{product.standard_rate}
          </span>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${product.item_name} to cart`}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-white transition-colors ${
              justAdded ? "bg-green-600" : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {justAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {justAdded ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
