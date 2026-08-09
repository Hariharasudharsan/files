"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/lib/domain/entities/order";
import type { Product, ProductVariant } from "@/lib/domain/entities/product";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  hasHydrated: boolean;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addItem: (product: Product, variant: ProductVariant, qty?: number) => void;
  removeItem: (itemCode: string) => void;
  updateQty: (itemCode: string, qty: number) => void;
  clearCart: () => void;
  setHasHydrated: (value: boolean) => void;

  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product, variant, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.item_code === variant.item_code);
          const items = existing
            ? state.items.map((i) =>
                i.item_code === variant.item_code ? { ...i, qty: i.qty + qty } : i
              )
            : [...state.items, { 
                ...variant, 
                product_id: product.id,
                product_name: product.name, 
                product_slug: product.slug, 
                product_image: product.images?.[0]?.url || "",
                product_category: product.category_id || "",
                qty 
              }];
          return { items, isOpen: true };
        }),

      removeItem: (itemCode) =>
        set((state) => ({ items: state.items.filter((i) => i.item_code !== itemCode) })),

      updateQty: (itemCode, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.item_code !== itemCode)
              : state.items.map((i) => (i.item_code === itemCode ? { ...i, qty } : i)),
        })),

      clearCart: () => set({ items: [] }),
      setHasHydrated: (value) => set({ hasHydrated: value }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      getTotalPrice: () => get().items.reduce((sum, i) => sum + i.qty * i.price, 0),
    }),
    {
      name: "mathuram-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
