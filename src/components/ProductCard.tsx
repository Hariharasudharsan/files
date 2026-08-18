"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Package, Plus, Star, Heart, Eye } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { signIn } from "next-auth/react";
import type { Product } from "@/lib/core/domain/entities/product";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import QuickViewModal from "@/components/QuickViewModal";
import { businessConfig } from "@/config/business.config";
import { generateImageAlt } from "@/lib/image";

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const defaultVariant = product.variants[0];
  const availableStock = defaultVariant?.inventoryLevels?.reduce((sum, il) => sum + il.available, 0) || 0;

  const wishlistIds = useWishlistStore((s) => s.itemIds);
  const addWishlistItem = useWishlistStore((s) => s.addItem);
  const removeWishlistItem = useWishlistStore((s) => s.removeItem);
  const isWishlisted = defaultVariant ? wishlistIds.includes(defaultVariant.id) : false;
  const isNew = product.created_at ? new Date().getTime() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000 : false;
  const isSale = defaultVariant?.compareAtPrice && Number(defaultVariant.compareAtPrice) > Number(defaultVariant.price);
  
  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!defaultVariant) return;

    const previousState = isWishlisted;

    if (previousState) {
      removeWishlistItem(defaultVariant.id);
    } else {
      addWishlistItem(defaultVariant.id);
    }

    try {
      const res = await fetch("/api/v1/wishlist", {
        method: previousState ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productVariantId: defaultVariant.id }),
      });

      if (res.status === 401) {
        // Revert optimistic update and prompt sign in
        if (previousState) {
          addWishlistItem(defaultVariant.id);
        } else {
          removeWishlistItem(defaultVariant.id);
        }
        signIn();
        return;
      }
      
      if (!res.ok) {
        throw new Error("Failed to update wishlist");
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
      // Revert optimistic update on failure
      if (previousState) {
        addWishlistItem(defaultVariant.id);
      } else {
        removeWishlistItem(defaultVariant.id);
      }
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsQuickViewOpen(true);
  };

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
      product.description || `${product.name} — authentic, factory-direct from ${businessConfig.brandName}.`,
    image: product.primaryImage?.url || undefined,
    sku: defaultVariant?.item_code,
    category: businessConfig.brandName, // Assuming static or fetched category
    brand: { "@type": "Brand", name: businessConfig.brandName },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: defaultVariant?.price?.toFixed(2) || "0.00",
      availability: availableStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link href={`/product/${product.slug}`} className="group flex flex-col h-full overflow-hidden rounded-2xl bg-white shadow-sm border border-surface-200 transition-all hover:shadow-xl hover:border-primary-300">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <div className="relative aspect-[4/5] overflow-hidden bg-surface-100">
        {product.primaryImage ? (
          <Image
            src={product.primaryImage.url}
            alt={generateImageAlt(product.name)}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-primary-200" aria-hidden="true" />
          </div>
        )}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {availableStock <= 0 ? (
            <Badge variant="secondary" className="backdrop-blur bg-surface-900/90 text-white shadow-sm border-white/20 border font-bold">
              Out of Stock
            </Badge>
          ) : (
            <>
              {isSale && (
                <Badge variant="accent" className="backdrop-blur bg-red-600/90 shadow-sm border-0 font-bold uppercase tracking-wider text-[10px] text-white">
                  Sale
                </Badge>
              )}
              {isNew && (
                <Badge variant="default" className="backdrop-blur bg-accent-600/90 shadow-sm border-white/20 border font-bold">
                  New
                </Badge>
              )}
              {product.isFeatured && (
                <Badge variant="default" className="backdrop-blur bg-yellow-500/90 text-yellow-950 shadow-sm border-white/20 border font-bold">
                  Bestseller
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
          <button onClick={handleWishlist} aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`} className={`p-2.5 rounded-full bg-white shadow-md hover:bg-red-50 transition-colors ${isWishlisted ? 'text-red-500' : 'text-surface-600 hover:text-red-500'}`}>
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
          <button onClick={handleQuickView} aria-label={`Quick view ${product.name}`} className="p-2.5 rounded-full bg-white shadow-md text-surface-600 hover:text-primary-600 hover:bg-primary-50 transition-colors">
            <Eye className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display font-bold text-lg text-surface-950 group-hover:text-primary-700 transition-colors">{product.name}</h3>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm text-surface-900/60 font-light leading-relaxed">{product.description}</p>
        )}
        <p className="mt-1 text-xs font-semibold text-surface-500 uppercase tracking-wider">Manufacturer: {businessConfig.brandName}</p>

        <div className="mt-auto flex items-end justify-between pt-6">
          <div className="flex flex-col">
            <span className="text-xs text-surface-900/50 mb-0.5 uppercase tracking-wider font-semibold">Price</span>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-surface-950">
                ₹{defaultVariant?.price || 0}
              </span>
              {isSale && (
                <span className="text-sm text-surface-400 line-through">
                  ₹{defaultVariant?.compareAtPrice}
                </span>
              )}
            </div>
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
      
      <QuickViewModal 
        product={product} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </motion.div>
  );
}
