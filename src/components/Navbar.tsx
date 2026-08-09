"use client";

import Link from "next/link";
import { ShoppingCart, Search, User, Menu } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import MarqueeBanner from "./MarqueeBanner";

const SearchAutocomplete = dynamic(() => import("./SearchAutocomplete"), { ssr: false });

export default function Navbar() {
  const toggleCart = useCartStore((s) => s.toggleCart);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  if (pathname.startsWith("/checkout")) return null;

  return (
    <>
      <SearchAutocomplete isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      <MarqueeBanner />

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

          {/* Center: Desktop Navigation (Mega Menu) */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-surface-900">
            <div className="group relative">
              <button className="flex items-center gap-1 hover:text-primary-600 transition-colors py-4">
                Shop By Category
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {/* Mega Menu Dropdown */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-max opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pt-2">
                <div className="bg-white rounded-2xl shadow-xl border border-surface-100 p-8 grid grid-cols-4 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-surface-950 text-base border-b border-surface-100 pb-2">Appalams</h3>
                    <ul className="space-y-3 text-surface-600">
                      <li><Link href="/category/appalam?tag=plain" className="hover:text-primary-600 hover:underline">Plain Urad</Link></li>
                      <li><Link href="/category/appalam?tag=masala" className="hover:text-primary-600 hover:underline">Masala Pepper</Link></li>
                      <li><Link href="/category/appalam?tag=garlic" className="hover:text-primary-600 hover:underline">Garlic Appalam</Link></li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-surface-950 text-base border-b border-surface-100 pb-2">Vadams & Vathals</h3>
                    <ul className="space-y-3 text-surface-600">
                      <li><Link href="/category/vadam?tag=onion" className="hover:text-primary-600 hover:underline">Onion Vadam</Link></li>
                      <li><Link href="/category/vadam?tag=tomato" className="hover:text-primary-600 hover:underline">Tomato Vadam</Link></li>
                      <li><Link href="/category/vathal?tag=sundaikai" className="hover:text-primary-600 hover:underline">Sundaikai Vathal</Link></li>
                      <li><Link href="/category/vathal?tag=manathakkali" className="hover:text-primary-600 hover:underline">Manathakkali Vathal</Link></li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-surface-950 text-base border-b border-surface-100 pb-2">Pickles & Thokku</h3>
                    <ul className="space-y-3 text-surface-600">
                      <li><Link href="/category/pickles?tag=mango" className="hover:text-primary-600 hover:underline">Mango Pickle</Link></li>
                      <li><Link href="/category/pickles?tag=lemon" className="hover:text-primary-600 hover:underline">Lemon Pickle</Link></li>
                      <li><Link href="/category/pickles?tag=tomato-thokku" className="hover:text-primary-600 hover:underline">Tomato Thokku</Link></li>
                    </ul>
                  </div>
                  <div className="bg-surface-50 -my-8 -mr-8 p-8 rounded-r-2xl border-l border-surface-100 flex flex-col justify-center">
                    <div className="aspect-square bg-primary-100 rounded-xl mb-4 flex items-center justify-center">
                      <span className="font-display font-bold text-primary-800 text-lg">Featured</span>
                    </div>
                    <Link href="/category/combo-packs" className="font-bold text-primary-700 hover:underline">
                      View Combo Packs &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/category/new-arrivals" className="hover:text-primary-600 transition-colors">New Arrivals</Link>
            <Link href="/category/bestsellers" className="hover:text-primary-600 transition-colors">Bestsellers</Link>
            <Link href="/category/combo-packs" className="hover:text-primary-600 transition-colors text-accent-600 flex items-center gap-1">
              Combos
              <span className="bg-accent-100 text-accent-700 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm">Save 15%</span>
            </Link>
          </nav>

          {/* Right Side: Icons */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button onClick={() => setIsSearchOpen(true)} aria-label="Open search" className="text-surface-900 hover:text-primary-600 transition-colors">
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
