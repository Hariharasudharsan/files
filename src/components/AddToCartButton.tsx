"use client";

import { useState } from "react";
import { ShoppingCart, Check, CreditCard, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { signIn } from "next-auth/react";
import type { Product } from "@/lib/core/domain/entities/product";

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);
  const defaultVariant = product.variants?.[0];
  const availableStock = defaultVariant?.inventoryLevels?.reduce((sum, il) => sum + il.available, 0) || 0;

  const addWishlistItem = useWishlistStore((s) => s.addItem);
  const removeWishlistItem = useWishlistStore((s) => s.removeItem);
  const wishlistIds = useWishlistStore((s) => s.itemIds);
  const isWishlisted = defaultVariant ? wishlistIds.includes(defaultVariant.id) : false;

  const handleAdd = () => {
    if (defaultVariant) {
      addItem(product as any, defaultVariant as any, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

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
        if (previousState) addWishlistItem(defaultVariant.id);
        else removeWishlistItem(defaultVariant.id);
        signIn();
        return;
      }
      
      if (!res.ok) throw new Error("Failed to update wishlist");
    } catch (err) {
      console.error("Failed to update wishlist:", err);
      if (previousState) addWishlistItem(defaultVariant.id);
      else removeWishlistItem(defaultVariant.id);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2 w-full">
        <Button
          size="lg"
          className={`flex-1 text-base font-semibold transition-all ${
            justAdded ? "bg-green-600 hover:bg-green-700" : ""
          }`}
          onClick={handleAdd}
          disabled={!defaultVariant || availableStock <= 0}
        >
          {justAdded ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-5 w-5" /> Added to Cart
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </span>
          )}
        </Button>

        <button
          onClick={handleWishlist}
          disabled={!defaultVariant}
          className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-md border transition-colors ${
            isWishlisted
              ? "border-red-200 bg-red-50 text-red-500"
              : "border-surface-300 bg-white text-surface-600 hover:bg-surface-50 hover:text-red-500"
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Dynamic Checkout Buttons (Stubs) */}
      <div className="flex gap-2 w-full">
        <button 
          type="button" 
          className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white rounded-md py-3 text-sm font-semibold transition-colors border border-transparent"
        >
          <svg className="w-10 h-4 fill-current" viewBox="0 0 46 19"><path d="M19.166 18.006c-1.636 0-2.316-.27-3.411-.845-1.125-.595-1.745-.615-2.915-.615-1.18 0-1.725.01-2.905.625-1.105.58-1.92.865-3.46.865-3.32 0-6.195-2.7-7.945-5.745C-4.144 2.87 2.015-1.42 5.285.4c1.1.625 1.765 1.01 2.945 1.01 1.25 0 1.98-.445 3.12-1.05 1.545-.815 3.32-.98 4.96-.325 2.14.865 3.345 2.215 4.095 3.255-3.36 1.735-2.825 6.015.42 7.235-1.045 2.5-2.6 4.935-4.885 5.095L19.166 18.006zM13.606.316c-.22 3.18-2.655 5.61-5.465 5.43-.375-3.235 2.15-5.61 5.465-5.43z"/></svg>
        </button>
        <button 
          type="button" 
          className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-surface-50 text-surface-900 rounded-md py-3 text-sm font-semibold transition-colors border border-surface-300 shadow-sm"
        >
          <CreditCard className="w-5 h-5 text-blue-600" />
          <span className="font-display">GPay</span>
        </button>
      </div>
    </div>
  );
}
