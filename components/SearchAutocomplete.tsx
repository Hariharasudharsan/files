"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SearchAutocomplete({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      // In a real app, this would hit an API route that queries Prisma/Meilisearch
      // For now, we simulate an API call to a route we will build: /api/search?q=
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.products || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-in">
      <div className="border-b border-surface-200">
        <div className="mx-auto max-w-4xl flex items-center px-4 py-4">
          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-3">
            <Search className="w-6 h-6 text-surface-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for appalams, vadams, combos..."
              className="w-full bg-transparent text-xl font-display outline-none placeholder:text-surface-300 text-surface-950"
            />
          </form>
          <button onClick={onClose} className="p-2 text-surface-400 hover:text-surface-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-surface-50">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {!query ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Popular Searches
                </h3>
                <ul className="space-y-3">
                  {['Urad Dal Appalam', 'Rice Vadam', 'Combo Pack', 'Spicy Mango Pickle'].map(term => (
                    <li key={term}>
                      <button onClick={() => { setQuery(term); inputRef.current?.focus(); }} className="text-surface-900 font-medium hover:text-primary-600">
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Recent Searches
                </h3>
                <p className="text-sm text-surface-400">No recent searches.</p>
              </div>
            </div>
          ) : (
            <div>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {results.map(product => (
                    <Link key={product.id} href={`/product/${product.slug}`} onClick={onClose} className="group">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-100 mb-3 border border-surface-200 group-hover:border-primary-300 transition-colors">
                        {product.primaryImage ? (
                          <Image src={product.primaryImage.url} alt={product.name} fill className="object-cover" />
                        ) : null}
                      </div>
                      <h4 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors line-clamp-1">{product.name}</h4>
                      <p className="text-sm text-surface-500 mt-1">₹{product.variants?.[0]?.price}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-surface-500 text-lg">No results found for &quot;{query}&quot;</p>
                  <button onClick={() => setQuery('')} className="mt-4 text-primary-600 font-semibold underline">Clear search</button>
                </div>
              )}
              
              {results.length > 0 && (
                <div className="mt-8 text-center border-t border-surface-200 pt-8">
                  <button onClick={handleSubmit} className="bg-surface-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-surface-800 transition-colors shadow-md">
                    View all results for &quot;{query}&quot;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
