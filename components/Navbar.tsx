"use client";

import Link from "next/link";
import { ShoppingCart, Search, User, Menu } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function Navbar() {
  const toggleCart = useCartStore((s) => s.toggleCart);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-200 glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        
        {/* Left Side: Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button className="md:hidden text-surface-900">
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 font-display text-xl font-bold text-white shadow-md shadow-primary-600/20">
              M
            </span>
            <span className="leading-tight hidden sm:block">
              <span className="block font-display text-lg font-bold text-surface-950 tracking-tight">Mathuram Foods</span>
              <span className="block text-[10px] font-medium uppercase tracking-widest text-primary-600">
                Heritage Kitchen
              </span>
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-surface-900/80">
          <Link href="/category/appalam" className="hover:text-primary-600 transition">Appalam</Link>
          <Link href="/category/vadam" className="hover:text-primary-600 transition">Vadam</Link>
          <Link href="/category/combo-packs" className="hover:text-primary-600 transition text-accent-600">Combos</Link>
        </nav>

        {/* Right Side: Icons */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/search" className="text-surface-900 hover:text-primary-600 transition">
            <Search className="h-5 w-5" />
          </Link>
          
          <Link href="/account" className="hidden sm:block text-surface-900 hover:text-primary-600 transition">
            <User className="h-5 w-5" />
          </Link>

          <button
            type="button"
            onClick={toggleCart}
            aria-label="Open cart"
            className="relative flex items-center justify-center text-surface-900 hover:text-primary-600 transition"
          >
            <ShoppingCart className="h-5 w-5" />
            {hasHydrated && totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[11px] font-bold text-white shadow-sm">
                {totalItems}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
