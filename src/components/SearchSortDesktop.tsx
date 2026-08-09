"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function SearchSortDesktop({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (newSort !== "relevance") params.set("sort", newSort);
    else params.delete("sort");

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select 
      value={currentSort}
      onChange={handleSortChange}
      className="bg-white border border-surface-200 text-surface-700 text-sm rounded-lg px-4 py-2 outline-none focus:border-primary-500"
    >
      <option value="relevance">Relevance</option>
      <option value="newest">Newest Arrivals</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  );
}
