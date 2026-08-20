"use client";
import { Logger } from "@/lib/infrastructure/logger";

import { create } from "zustand";

interface WishlistState {
  itemIds: string[]; // array of productVariantIds
  isLoading: boolean;
  hasHydrated: boolean;
  setItems: (items: string[]) => void;
  addItem: (productVariantId: string) => void;
  removeItem: (productVariantId: string) => void;
  fetchWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  itemIds: [],
  isLoading: false,
  hasHydrated: false,

  setItems: (items) => set({ itemIds: items, hasHydrated: true }),
  
  addItem: (id) => set((state) => ({ 
    itemIds: state.itemIds.includes(id) ? state.itemIds : [...state.itemIds, id] 
  })),
  
  removeItem: (id) => set((state) => ({ 
    itemIds: state.itemIds.filter((i) => i !== id) 
  })),
  
  fetchWishlist: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const res = await fetch("/api/v1/wishlist");
      if (res.ok) {
        const data = await res.json();
        set({ itemIds: data.items.map((i: any) => i.productVariantId), hasHydrated: true });
      } else {
        set({ hasHydrated: true }); // e.g. 401 Unauthorized
      }
    } catch (e) {
      Logger.error("Failed to fetch wishlist", e);
      set({ hasHydrated: true });
    } finally {
      set({ isLoading: false });
    }
  }
}));
