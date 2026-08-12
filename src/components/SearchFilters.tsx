"use client";

import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SearchFiltersProps {
  categories: Category[];
}

export default function SearchFilters({ categories }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const selectedCategory = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "relevance";

  const updateFilters = (cat: string, newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (cat) params.set("category", cat);
    else params.delete("category");
    
    if (newSort !== "relevance") params.set("sort", newSort);
    else params.delete("sort");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (slug: string) => {
    const nextCat = selectedCategory === slug ? "" : slug;
    updateFilters(nextCat, sort);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    updateFilters(selectedCategory, newSort);
  };

  return (
    <div className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
      {/* Mobile Sort Dropdown (Desktop renders its own or we render it here) */}
      <div className="flex justify-end lg:hidden">
        <select 
          value={sort}
          onChange={handleSortChange}
          className="bg-white border border-surface-200 text-surface-700 text-sm rounded-lg px-4 py-2 outline-none focus:border-primary-500 w-full"
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Sidebar Filters */}
      <div className="bg-white rounded-xl border border-surface-200 p-6 sticky top-24 hidden lg:block">
        <div className="flex items-center gap-2 mb-6 text-surface-950 font-bold">
          <SlidersHorizontal className="w-5 h-5" />
          <h2>Filters</h2>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-surface-900 mb-3">Category</h3>
          <div className="space-y-2">
            {categories.map(cat => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedCategory === cat.slug}
                  onChange={() => handleCategoryChange(cat.slug)}
                  className="rounded text-primary-600 focus:ring-primary-500 bg-surface-100 border-surface-300" 
                />
                <span className="text-sm text-surface-700 hover:text-primary-600">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
