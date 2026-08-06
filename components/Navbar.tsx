"use client";

import Link from "next/link";
import { ShoppingCart, Search, User, Menu } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useState } from "react";
import SearchAutocomplete from "./SearchAutocomplete";

export default function Navbar() {
  const toggleCart = useCartStore((s) => s.toggleCart);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <SearchAutocomplete isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      {/* Announcement Bar */}
      <div className="bg-primary-950 px-4 py-2 text-center text-xs font-semibold tracking-wide text-primary-50">
        <span className="inline-block animate-fade-in">
          Free Shipping on all orders above ₹999! &mdash; <button onClick={() => setIsSearchOpen(true)} className="underline hover:text-white transition-colors">Shop Now</button>
        </span>
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-surface-200 glass transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          
          {/* Left Side: Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button className="md:hidden text-surface-900 hover:text-primary-600 transition-colors">
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 font-display text-xl font-bold text-white shadow-md shadow-primary-600/20 group-hover:bg-primary-700 transition-colors">
                M
              </span>
              <span className="leading-tight hidden sm:block">
                <span className="block font-display text-lg font-bold text-surface-950 tracking-tight group-hover:text-primary-700 transition-colors">Mathuram Foods</span>
                <span className="block text-[10px] font-medium uppercase tracking-widest text-primary-600">
                  Heritage Kitchen
                </span>
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-surface-900">
            <Link href="/category/appalam" className="hover:text-primary-600 transition-colors">Appalams</Link>
            <Link href="/category/vadam" className="hover:text-primary-600 transition-colors">Vadams</Link>
            <Link href="/category/vathal" className="hover:text-primary-600 transition-colors">Vathals</Link>
            <Link href="/category/combo-packs" className="hover:text-primary-600 transition-colors text-accent-600 flex items-center gap-1">
              Combos
              <span className="bg-accent-100 text-accent-700 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm">Save 15%</span>
            </Link>
          </nav>

          {/* Right Side: Icons */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button onClick={() => setIsSearchOpen(true)} className="text-surface-900 hover:text-primary-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            <Link href="/account" className="hidden sm:block text-surface-900 hover:text-primary-600 transition-colors">
              <User className="h-5 w-5" />
            </Link>

            <button
              type="button"
              onClick={toggleCart}
              aria-label="Open cart"
              className="relative flex items-center justify-center text-surface-900 hover:text-primary-600 transition-colors group"
            >
              <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {hasHydrated && totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[11px] font-bold text-white shadow-sm animate-fade-in ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>
    </>
  );
}
