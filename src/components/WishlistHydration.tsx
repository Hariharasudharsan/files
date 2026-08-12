"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/store/useWishlistStore";

export default function WishlistHydration() {
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const hasHydrated = useWishlistStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) {
      fetchWishlist();
    }
  }, [fetchWishlist, hasHydrated]);

  return null;
}
