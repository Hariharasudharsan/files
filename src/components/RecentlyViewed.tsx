"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/domain/entities/product";
import ProductCard from "./ProductCard";

const RECENTLY_VIEWED_KEY = "mathuram_recently_viewed";
const MAX_RECENTLY_VIEWED = 10;

export function RecordRecentlyViewed({ product }: { product: Product }) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let items: Product[] = stored ? JSON.parse(stored) : [];
      
      // Remove if it already exists
      items = items.filter(i => i.id !== product.id);
      
      // Add to front
      items.unshift(product);
      
      // Cap at MAX
      if (items.length > MAX_RECENTLY_VIEWED) {
        items = items.slice(0, MAX_RECENTLY_VIEWED);
      }
      
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to record recently viewed:", err);
    }
  }, [product]);

  return null;
}

export default function RecentlyViewed({ currentProductId }: { currentProductId?: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        let items: Product[] = JSON.parse(stored);
        if (currentProductId) {
          items = items.filter(i => i.id !== currentProductId);
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProducts(items.slice(0, 4));
      }
    } catch (err) {
      console.error("Failed to load recently viewed:", err);
    }
  }, [currentProductId]);

  if (products.length === 0) return null;

  return (
    <section className="bg-white border-t border-surface-200">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-surface-950">
            Recently Viewed
          </h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-primary-600" />
        </div>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
