"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Search, User, Menu } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import MarqueeBanner from "./MarqueeBanner";
import { businessConfig } from "@/config/business.config";

const SearchAutocomplete = dynamic(() => import("./SearchAutocomplete"), { ssr: false });
const LanguageToggle = dynamic(() => import("./LanguageToggle"), { ssr: false });

export default function Navbar() {
  const toggleCart = useCartStore((s) => s.toggleCart);
  const totalItems = useCartStore((s) => s.totalItems);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Extract locale from pathname (e.g. /en/about -> en)
  const pathParts = pathname.split('/');
  const currentLocale = ['en', 'hi', 'ta'].includes(pathParts[1]) ? pathParts[1] : 'en';

  // Close mobile menu when route changes
  useEffect(() => {
    // eslint-disable-next-line
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/checkout")) return null;

  return (
    <>
      <SearchAutocomplete isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      <MarqueeBanner />

      <header className="sticky top-0 z-40 w-full border-b border-brand-tint bg-base/80 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          
          {/* Left Side: Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-brand-deep hover:text-brand-mid transition-colors">
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border border-brand-tint shadow-sm transition-transform group-hover:scale-105">
                <Image src="/logo.png" alt="Sridha's Store Logo" fill sizes="48px" priority className="object-cover" />
              </div>
              <div className="hidden sm:block">
                <span className="block font-display text-xl font-bold text-brand-deep tracking-tight group-hover:text-brand-mid transition-colors">{businessConfig.brandName}</span>
                <span className="block text-[10px] font-medium uppercase tracking-widest text-brand-mid">
                  Heritage Kitchen
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation (Mega Menu) */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-brand-deep">
            <div className="group relative">
              <button className="flex items-center gap-1 hover:text-brand-mid transition-colors py-4">
                Shop By Category
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {/* Mega Menu Dropdown */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-max opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pt-2">
                <div className="bg-base rounded-2xl shadow-xl border border-brand-tint p-8 grid grid-cols-4 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-brand-deep text-base border-b border-brand-tint pb-2">Appalams</h3>
                    <ul className="space-y-3 text-brand-deep/80">
                      <li><Link href="/category/appalam?tag=plain" className="hover:text-brand-mid hover:underline">Plain Urad</Link></li>
                      <li><Link href="/category/appalam?tag=masala" className="hover:text-brand-mid hover:underline">Masala Pepper</Link></li>
                      <li><Link href="/category/appalam?tag=garlic" className="hover:text-brand-mid hover:underline">Garlic Appalam</Link></li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-brand-deep text-base border-b border-brand-tint pb-2">Vadams & Vathals</h3>
                    <ul className="space-y-3 text-brand-deep/80">
                      <li><Link href="/category/vadam?tag=onion" className="hover:text-brand-mid hover:underline">Onion Vadam</Link></li>
                      <li><Link href="/category/vadam?tag=tomato" className="hover:text-brand-mid hover:underline">Tomato Vadam</Link></li>
                      <li><Link href="/category/vathal?tag=sundaikai" className="hover:text-brand-mid hover:underline">Sundaikai Vathal</Link></li>
                      <li><Link href="/category/vathal?tag=manathakkali" className="hover:text-brand-mid hover:underline">Manathakkali Vathal</Link></li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-brand-deep text-base border-b border-brand-tint pb-2">Pickles & Thokku</h3>
                    <ul className="space-y-3 text-brand-deep/80">
                      <li><Link href="/category/pickles?tag=mango" className="hover:text-brand-mid hover:underline">Mango Pickle</Link></li>
                      <li><Link href="/category/pickles?tag=lemon" className="hover:text-brand-mid hover:underline">Lemon Pickle</Link></li>
                      <li><Link href="/category/pickles?tag=tomato-thokku" className="hover:text-brand-mid hover:underline">Tomato Thokku</Link></li>
                    </ul>
                  </div>
                  <div className="bg-brand-tint/20 -my-8 -mr-8 p-8 rounded-r-2xl border-l border-brand-tint flex flex-col justify-center">
                    <div className="aspect-square bg-brand-tint rounded-xl mb-4 flex items-center justify-center">
                      <span className="font-display font-bold text-brand-deep text-lg">Featured</span>
                    </div>
                    <Link href="/bundles" className="font-bold text-brand-deep hover:text-brand-mid hover:underline">
                      View Combo Packs &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/search?sort=newest" className="hover:text-brand-mid transition-colors">New Arrivals</Link>
            <Link href="/search" className="hover:text-brand-mid transition-colors">Bestsellers</Link>
            <Link href="/bundles" className="hover:text-brand-mid transition-colors text-accent-fry flex items-center gap-1">
              Combos
              <span className="bg-accent-fry text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm">Save 15%</span>
            </Link>
          </nav>

          {/* Right Side: Icons */}
          <div className="flex items-center gap-4 sm:gap-6">
            <LanguageToggle currentLocale={currentLocale} />
            <button onClick={() => setIsSearchOpen(true)} aria-label="Open search" className="text-brand-deep hover:text-brand-mid transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            <Link href="/account" className="hidden sm:block text-brand-deep hover:text-brand-mid transition-colors">
              <User className="h-5 w-5" />
            </Link>

            <button
              type="button"
              onClick={toggleCart}
              aria-label="Open cart"
              className="relative flex items-center justify-center text-brand-deep hover:text-brand-mid transition-colors group"
            >
              <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {hasHydrated && totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent-fry text-[11px] font-bold text-white shadow-sm animate-fade-in ring-2 ring-base">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="relative flex w-4/5 max-w-sm flex-col bg-base shadow-xl h-full animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-brand-tint">
              <span className="font-display font-bold text-lg text-brand-deep">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-brand-deep/60 hover:text-brand-deep"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="space-y-3">
                <h3 className="font-display font-bold text-brand-deep text-lg">Categories</h3>
                <ul className="space-y-3 pl-2 border-l-2 border-brand-tint">
                  <li><Link href="/category/appalam" className="block text-brand-deep/80 hover:text-brand-mid">Appalams</Link></li>
                  <li><Link href="/category/vadam" className="block text-brand-deep/80 hover:text-brand-mid">Vadams</Link></li>
                  <li><Link href="/category/vathal" className="block text-brand-deep/80 hover:text-brand-mid">Vathals</Link></li>
                  <li><Link href="/category/pickles" className="block text-brand-deep/80 hover:text-brand-mid">Pickles & Thokku</Link></li>
                  <li><Link href="/bundles" className="block text-brand-mid font-medium">Combo Packs</Link></li>
                </ul>
              </div>

              <div className="space-y-3 border-t border-brand-tint pt-6">
                <ul className="space-y-4">
                  <li><Link href="/search?sort=newest" className="block font-medium text-brand-deep">New Arrivals</Link></li>
                  <li><Link href="/search" className="block font-medium text-brand-deep">Bestsellers</Link></li>
                  <li><Link href="/account" className="block font-medium text-brand-deep">My Account</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
