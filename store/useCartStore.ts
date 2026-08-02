"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StorefrontOrder, CartItem } from "@/lib/domain/entities/order";
import type { Product } from "@/lib/domain/entities/product";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /**
   * True once the persisted cart has been read back from localStorage on
   * the client. Until then, `items` is deliberately empty (matching the
   * server-rendered HTML) to avoid a hydration mismatch. UI that cares
   * about "is the cart actually empty" should wait for this flag —
   * see app/checkout/page.tsx.
   */
  hasHydrated: boolean;

  // Drawer controls
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Cart mutations
  addItem: (product: Product, qty?: number) => void;
  removeItem: (itemCode: string) => void;
  updateQty: (itemCode: string, qty: number) => void;
  clearCart: () => void;
  setHasHydrated: (value: boolean) => void;

  // Derived values — computed fresh from `items` on every read, so they
  // can never drift out of sync with the cart contents.
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

      addItem: (product, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.item_code === product.item_code);
          const items = existing
            ? state.items.map((i) =>
                i.item_code === product.item_code ? { ...i, qty: i.qty + qty } : i
              )
            : [...state.items, { ...product, qty }];
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
      getTotalPrice: () => get().items.reduce((sum, i) => sum + i.qty * i.standard_rate, 0),
    }),
    {
      name: "mathuram-cart", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the cart contents — drawer open/close state and the
      // hydration flag are transient UI state, not data worth remembering
      // across visits.
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
