"use client";

import React, { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Basic mock state, real app would sync with URL params
  const [inStock, setInStock] = useState(false);
  const [price, setPrice] = useState("");

  const updateFilters = () => {
    // In a real app, we'd update search params and push to router
    console.log("Updating filters", { inStock, price });
  };

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-28 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-surface-950 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" /> Filters
          </h2>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-surface-950 flex items-center justify-between cursor-pointer">
            Availability <ChevronDown className="w-4 h-4" />
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-surface-700 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={inStock}
                onChange={(e) => { setInStock(e.target.checked); updateFilters(); }}
                className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-600 accent-primary-600" 
              />
              <span className="group-hover:text-primary-700 transition-colors">In Stock</span>
            </label>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-surface-100">
          <h3 className="font-semibold text-surface-950 flex items-center justify-between cursor-pointer">
            Price <ChevronDown className="w-4 h-4" />
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-surface-700 cursor-pointer group">
              <input type="radio" name="price" value="under500" onChange={(e) => { setPrice(e.target.value); updateFilters(); }} className="w-4 h-4 border-surface-300 text-primary-600 focus:ring-primary-600 accent-primary-600" />
              <span className="group-hover:text-primary-700 transition-colors">Under ₹500</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-surface-700 cursor-pointer group">
              <input type="radio" name="price" value="500-1000" onChange={(e) => { setPrice(e.target.value); updateFilters(); }} className="w-4 h-4 border-surface-300 text-primary-600 focus:ring-primary-600 accent-primary-600" />
              <span className="group-hover:text-primary-700 transition-colors">₹500 - ₹1000</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-surface-700 cursor-pointer group">
              <input type="radio" name="price" value="over1000" onChange={(e) => { setPrice(e.target.value); updateFilters(); }} className="w-4 h-4 border-surface-300 text-primary-600 focus:ring-primary-600 accent-primary-600" />
              <span className="group-hover:text-primary-700 transition-colors">Over ₹1000</span>
            </label>
          </div>
        </div>
        
        <div className="space-y-4 pt-4 border-t border-surface-100">
          <h3 className="font-semibold text-surface-950 flex items-center justify-between cursor-pointer">
            Tags <ChevronDown className="w-4 h-4" />
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Spicy", "Plain", "Garlic", "Vegan"].map(tag => (
              <span key={tag} className="px-3 py-1 bg-surface-100 text-surface-700 text-xs rounded-full hover:bg-primary-100 hover:text-primary-800 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
