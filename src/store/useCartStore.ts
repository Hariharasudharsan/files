"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/lib/core/domain/entities/order";
import type { Product, ProductVariant } from "@/lib/core/domain/entities/product";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  hasHydrated: boolean;
  totalItems: number;
  totalPrice: number;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addItem: (product: Product, variant: ProductVariant, qty?: number, isSubscription?: boolean) => void;
  addBundle: (bundleRuleId: string, items: {product: Product, variant: ProductVariant, qty: number}[]) => void;
  removeItem: (itemCode: string) => void;
  updateQty: (itemCode: string, qty: number) => void;
  clearCart: () => void;
  setHasHydrated: (value: boolean) => void;
}

const calculateTotals = (items: CartItem[]) => {
  return {
    totalItems: items.reduce((sum, i) => sum + i.qty, 0),
    totalPrice: items.reduce((sum, i) => sum + i.qty * i.price, 0),
  };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,
      totalItems: 0,
      totalPrice: 0,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  addItem: (product, variant, qty = 1, isSubscription = false) =>
    set((state) => {
      // Create a unique key for cart items that differentiate between subscription and one-time
      const cartItemCode = isSubscription ? `${variant.item_code}_sub` : variant.item_code;
      
      const existing = state.items.find((i) => 
        (i as any).cartItemCode ? (i as any).cartItemCode === cartItemCode : i.item_code === cartItemCode
      );

      const items = existing
        ? state.items.map((i) =>
            ((i as any).cartItemCode ? (i as any).cartItemCode === cartItemCode : i.item_code === cartItemCode)
              ? { ...i, qty: i.qty + qty } 
              : i
          )
        : [...state.items, { 
            ...variant, 
            price: isSubscription ? Number(variant.price) * (1 - (product.subscriptionDiscountPercent || 0) / 100) : Number(variant.price),
            product_id: product.id,
            product_name: product.name, 
            product_slug: product.slug, 
            product_image: product.images?.[0]?.url || "",
            product_category: product.category_id || "",
            qty,
            isSubscription,
            subscriptionDiscountPercent: product.subscriptionDiscountPercent || 0,
            cartItemCode // non-standard field just to track unique cart items
          } as any];
      return { items, isOpen: true, ...calculateTotals(items) };
    }),

  addBundle: (bundleRuleId, bundleItems) =>
    set((state) => {
      let currentItems = [...state.items];
      
      bundleItems.forEach(({ product, variant, qty }) => {
        // Generate a unique item code for bundle items so they don't mix with regular items
        const cartItemCode = `${variant.item_code}_bundle_${bundleRuleId}`;
        
        const existingIndex = currentItems.findIndex((i) => 
          (i as any).cartItemCode ? (i as any).cartItemCode === cartItemCode : i.item_code === cartItemCode
        );

        if (existingIndex >= 0) {
          currentItems[existingIndex] = {
            ...currentItems[existingIndex],
            qty: currentItems[existingIndex].qty + qty
          };
        } else {
          currentItems.push({
            ...variant,
            product_id: product.id,
            product_name: product.name,
            product_slug: product.slug,
            product_image: product.images?.[0]?.url || "",
            product_category: product.category_id || "",
            qty,
            bundleRuleId,
            cartItemCode
          } as any);
        }
      });

      return { items: currentItems, isOpen: true, ...calculateTotals(currentItems) };
    }),

      removeItem: (itemCode) =>
        set((state) => {
          const items = state.items.filter((i) => i.item_code !== itemCode);
          return { items, ...calculateTotals(items) };
        }),

      updateQty: (itemCode, qty) =>
        set((state) => {
          const items = qty <= 0
            ? state.items.filter((i) => i.item_code !== itemCode)
            : state.items.map((i) => (i.item_code === itemCode ? { ...i, qty } : i));
          return { items, ...calculateTotals(items) };
        }),

      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
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
