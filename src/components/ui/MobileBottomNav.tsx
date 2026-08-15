"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, User, LayoutGrid } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const toggleCart = useCartStore(s => s.toggleCart);
  const totalItems = useCartStore(s => s.totalItems);
  const hasHydrated = useCartStore(s => s.hasHydrated);

  // Hide on checkout
  if (pathname.startsWith("/checkout")) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <nav className="flex justify-around items-center h-16">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === "/" ? "text-primary-600" : "text-surface-500"}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        
        <Link 
          href="/search" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname.startsWith("/search") ? "text-primary-600" : "text-surface-500"}`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-medium">Shop</span>
        </Link>

        <button 
          onClick={toggleCart}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-surface-500 relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {hasHydrated && totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-primary-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>

        <Link 
          href="/account" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname.startsWith("/account") ? "text-primary-600" : "text-surface-500"}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Account</span>
        </Link>
      </nav>
    </div>
  );
}
