"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, fetch from /api/reviews?productId=...
    setReviews([
      { id: 1, author: "Sunita M.", rating: 5, date: "2 months ago", text: "Tastes exactly like how my grandmother used to make. Very authentic and fresh!" },
      { id: 2, author: "Ramesh K.", rating: 5, date: "1 month ago", text: "The crispiness is perfect. Definitely ordering again." },
    ]);
  }, [productId]);

  return (
    <div className="mt-16 border-t border-surface-200 pt-12">
      <h2 className="text-2xl font-display font-bold text-surface-950 mb-8">Customer Reviews</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <div className="bg-surface-50 p-6 rounded-2xl border border-surface-100 text-center">
            <p className="text-5xl font-display font-bold text-surface-950 mb-2">5.0</p>
            <div className="flex justify-center text-accent-500 mb-2">
              {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-5 h-5 fill-current" />)}
            </div>
            <p className="text-sm text-surface-500">Based on {reviews.length} reviews</p>
            
            <button className="mt-6 w-full py-2.5 border-2 border-surface-900 rounded-full font-bold text-surface-900 hover:bg-surface-900 hover:text-white transition-colors">
              Write a Review
            </button>
          </div>
        </div>

        <div className="md:col-span-8 space-y-8">
          {reviews.map(review => (
            <div key={review.id} className="border-b border-surface-100 pb-8 last:border-0">
              <div className="flex items-center gap-1 text-accent-500 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`w-4 h-4 ${i <= review.rating ? "fill-current" : "text-surface-200"}`} />
                ))}
              </div>
              <h4 className="font-bold text-surface-950 mb-1">{review.author}</h4>
              <p className="text-xs text-surface-500 mb-3">{review.date}</p>
              <p className="text-surface-700">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
