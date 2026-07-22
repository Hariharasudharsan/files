"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function Navbar() {
  const toggleCart = useCartStore((s) => s.toggleCart);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-orange-50/90 backdrop-blur supports-[backdrop-filter]:bg-orange-50/75">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 font-display text-lg font-bold text-white">
            M
          </span>
          <span className="leading-tight">
            <span className="block font-display font-bold text-orange-950">Mathuram Foods</span>
            <span className="block text-[11px] font-medium uppercase tracking-wide text-orange-700/70">
              Factory-Direct Vadam &amp; Vathal
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={toggleCart}
          aria-label="Open cart"
          className="relative flex items-center gap-2 rounded-full bg-orange-600 px-4 py-2.5 text-white transition-colors hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="hidden text-sm font-medium sm:inline">Cart</span>
          {hasHydrated && totalItems > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-950 text-[11px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
