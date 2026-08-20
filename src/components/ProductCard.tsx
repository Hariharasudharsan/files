"use client";
import { Logger } from "@/lib/infrastructure/logger";

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

const FryGauge = ({ level }: { level: number }) => {
  const percentage = (level / 5) * 100;
  return (
    <div className="flex items-center gap-1.5" title={`Spice level: ${level}/5`}>
      <svg width="16" height="16" viewBox="0 0 24 24" className="rotate-[-90deg]">
        <circle cx="12" cy="12" r="10" fill="none" className="stroke-brand-tint" strokeWidth="4" />
        <circle 
          cx="12" cy="12" r="10" fill="none" 
          className="stroke-accent-fry" 
          strokeWidth="4" 
          strokeDasharray="62.83"
          strokeDashoffset={62.83 - (62.83 * percentage) / 100}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[10px] uppercase tracking-wider font-bold text-brand-deep/60">Spice</span>
    </div>
  );
};

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const bestValueVariant = product.variants.find((v) => v.isBestValue) || product.variants[0];
  const [selectedVariant, setSelectedVariant] = useState(bestValueVariant);

  const availableStock = selectedVariant?.inventoryLevels?.reduce((sum, il) => sum + il.available, 0) || 0;

  const wishlistIds = useWishlistStore((s) => s.itemIds);
  const addWishlistItem = useWishlistStore((s) => s.addItem);
  const removeWishlistItem = useWishlistStore((s) => s.removeItem);
  const isWishlisted = selectedVariant ? wishlistIds.includes(selectedVariant.id) : false;
  const isNew = product.created_at ? new Date().getTime() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000 : false;
  const isSale = selectedVariant?.compareAtPrice && Number(selectedVariant.compareAtPrice) > Number(selectedVariant.price);
  
  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    const previousState = isWishlisted;

    if (previousState) {
      removeWishlistItem(selectedVariant.id);
    } else {
      addWishlistItem(selectedVariant.id);
    }

    try {
      const res = await fetch("/api/v1/wishlist", {
        method: previousState ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productVariantId: selectedVariant.id }),
      });

      if (res.status === 401) {
        // Revert optimistic update and prompt sign in
        if (previousState) {
          addWishlistItem(selectedVariant.id);
        } else {
          removeWishlistItem(selectedVariant.id);
        }
        signIn();
        return;
      }
      
      if (!res.ok) {
        throw new Error("Failed to update wishlist");
      }
    } catch (err) {
      Logger.error("Failed to update wishlist:", err);
      // Revert optimistic update on failure
      if (previousState) {
        addWishlistItem(selectedVariant.id);
      } else {
        removeWishlistItem(selectedVariant.id);
      }
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsQuickViewOpen(true);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedVariant) {
      addItem(product, selectedVariant, 1);
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
    sku: selectedVariant?.item_code,
    category: businessConfig.brandName, // Assuming static or fetched category
    brand: { "@type": "Brand", name: businessConfig.brandName },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: selectedVariant?.price?.toFixed(2) || "0.00",
      availability: availableStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const discountPercent = isSale && selectedVariant?.compareAtPrice
    ? Math.round(((selectedVariant.compareAtPrice - selectedVariant.price) / selectedVariant.compareAtPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-full"
    >
      <Link href={`/product/${product.slug}`} className="group flex flex-col h-full overflow-hidden rounded-2xl bg-base shadow-sm border border-brand-tint transition-all hover:shadow-xl hover:border-brand-mid">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <div className="relative aspect-[4/5] overflow-hidden bg-brand-tint/20 shrink-0">
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
            <Package className="h-12 w-12 text-brand-tint" aria-hidden="true" />
          </div>
        )}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {availableStock <= 0 ? (
            <Badge variant="secondary" className="backdrop-blur bg-brand-deep/90 text-white shadow-sm border-white/20 border font-bold">
              Out of Stock
            </Badge>
          ) : (
            <>
              {isSale && (
                <Badge variant="accent" className="backdrop-blur bg-accent-fry/90 shadow-sm border-0 font-bold uppercase tracking-wider text-[10px] text-white">
                  {discountPercent > 0 ? `${discountPercent}% OFF` : 'Sale'}
                </Badge>
              )}
              {isNew && (
                <Badge variant="default" className="backdrop-blur bg-brand-mid/90 text-white shadow-sm border-white/20 border font-bold">
                  New
                </Badge>
              )}
              {product.isFeatured && (
                <Badge variant="default" className="backdrop-blur bg-accent-fry/90 text-white shadow-sm border-white/20 border font-bold">
                  Bestseller
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
          <button onClick={handleWishlist} aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`} className={`p-2.5 rounded-full bg-base shadow-md hover:bg-red-50 transition-colors ${isWishlisted ? 'text-red-500' : 'text-brand-deep/60 hover:text-red-500'}`}>
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
          <button onClick={handleQuickView} aria-label={`Quick view ${product.name}`} className="p-2.5 rounded-full bg-base shadow-md text-brand-deep/60 hover:text-brand-mid hover:bg-brand-tint transition-colors">
            <Eye className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display font-bold text-lg text-brand-deep group-hover:text-brand-mid transition-colors">{product.name}</h3>
        
        {/* Reviews */}
        {(product.reviewCount ?? 0) > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-brand-deep/70">
            <Star className="h-3.5 w-3.5 fill-accent-fry text-accent-fry" />
            <span className="font-bold">{product.averageRating?.toFixed(1)}</span>
            <span>|</span>
            <span>({product.reviewCount})</span>
          </div>
        )}

        {/* Badges */}
        {product.badges && product.badges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.badges.map((b: any) => (
              <span key={b.id} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm" style={{ backgroundColor: b.bgColor || '#f0f0f0', color: b.textColor || '#333' }}>
                {b.name}
              </span>
            ))}
          </div>
        )}

        {product.description && (
          <p className="mt-3 line-clamp-2 text-sm text-brand-deep/70 font-light leading-relaxed">{product.description}</p>
        )}

        {/* Pack-Size Selector */}
        {product.variants.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedVariant(v);
                }}
                className={`relative px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                  selectedVariant?.id === v.id
                    ? "bg-brand-mid text-white border-brand-mid"
                    : "bg-surface-50 text-surface-600 border-surface-200 hover:border-brand-mid"
                }`}
              >
                {v.isBestValue && (
                  <span className="absolute -top-2.5 -right-2 bg-accent-fry text-white text-[9px] px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                    Most Chosen
                  </span>
                )}
                {v.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-6">
          <div className="flex flex-col">
            <span className="text-xs text-brand-deep/50 mb-0.5 uppercase tracking-wider font-semibold">Price</span>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-brand-deep">
                ₹{selectedVariant?.price || 0}
              </span>
              {isSale && (
                <span className="text-sm text-brand-deep/40 line-through">
                  ₹{selectedVariant?.compareAtPrice}
                </span>
              )}
            </div>
          </div>
          
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!selectedVariant || availableStock <= 0}
            aria-label={`Add ${product.name} to cart`}
            className={`rounded-full h-12 w-12 p-0 shadow-sm transition-all border-none z-10 ${
              justAdded ? "bg-green-600 hover:bg-green-700 text-white" : "bg-accent-fry hover:opacity-90 text-white"
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
