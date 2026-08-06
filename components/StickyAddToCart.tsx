"use client";

import { useEffect, useState } from "react";
import AddToCartButton from "./AddToCartButton";

interface StickyAddToCartProps {
  product: any; // We'll pass the whole product object
}

export default function StickyAddToCart({ product }: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky cart after scrolling past the main add to cart button (roughly 600px)
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] p-4 sm:hidden animate-slide-up">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 truncate">
          <p className="text-sm font-bold text-surface-950 truncate">{product.name}</p>
          <p className="text-xs text-primary-600 font-semibold">₹{product.variants[0]?.price}</p>
        </div>
        <div className="w-32 shrink-0">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
