"use client";
import { Logger } from "@/lib/infrastructure/logger";

import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WishlistList({ initialItems }: { initialItems: any[] }) {
  const addItem = useCartStore((s) => s.addItem);
  const removeWishlistItem = useWishlistStore((s) => s.removeItem);
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const handleRemove = async (productVariantId: string) => {
    setIsRemoving(productVariantId);
    try {
      const res = await fetch("/api/v1/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productVariantId }),
      });
      if (res.ok) {
        removeWishlistItem(productVariantId);
        router.refresh();
      }
    } catch (e: any) {
      Logger.error("Failed to remove wishlist item", e);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleAddToCart = (item: any) => {
    const { productVariant } = item;
    const { product } = productVariant;
    addItem(product, productVariant, 1);
  };

  if (initialItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
        <div className="mb-6 rounded-full bg-surface-50 p-6">
          <ShoppingCart className="h-12 w-12 text-primary-200" aria-hidden="true" />
        </div>
        <p className="font-display text-xl font-semibold text-surface-950 mb-2">Your wishlist is empty</p>
        <p className="text-surface-900/60 mb-8 max-w-xs">Save items you love and buy them later.</p>
        <Link href="/">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {initialItems.map((item) => {
        const variant = item.productVariant;
        const product = variant.product;
        const image = product.primaryImage?.url;

        return (
          <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-surface-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-surface-100 bg-surface-50 relative">
              {image ? (
                <Image src={image} alt={product.name} fill sizes="96px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-primary-200">
                  <ShoppingCart className="h-8 w-8" />
                </div>
              )}
            </div>
            
            <div className="flex flex-1 flex-col justify-center">
              <Link href={`/product/${product.slug}`} className="font-bold text-surface-950 hover:text-primary-600 transition-colors">
                {product.name}
              </Link>
              <p className="text-sm text-surface-500 mt-1">{variant.name}</p>
              <p className="font-bold text-lg text-surface-950 mt-2">₹{variant.price}</p>
            </div>
            
            <div className="flex sm:flex-col items-center justify-end gap-3 sm:w-40 border-t sm:border-t-0 sm:border-l border-surface-100 pt-4 sm:pt-0 sm:pl-4 mt-4 sm:mt-0">
              <Button 
                onClick={() => handleAddToCart(item)} 
                className="w-full flex gap-2"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full flex gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => handleRemove(variant.id)}
                disabled={isRemoving === variant.id}
              >
                <Trash2 className="w-4 h-4" /> Remove
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
