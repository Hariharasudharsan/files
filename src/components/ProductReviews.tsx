"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle } from "lucide-react";
import type { Review } from "@/lib/core/domain/entities/commerce";
import ReviewForm from "./ReviewForm";

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/v1/reviews?productId=${productId}`);
        const json = await res.json();
        
        if (json.success) {
          setReviews(json.data);
        } else {
          setError(json.error || "Failed to load reviews");
        }
      } catch (err) {
        setError("An error occurred while fetching reviews");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="mt-16 border-t border-surface-200 pt-12">
      <h2 className="text-2xl font-display font-bold text-surface-950 mb-8">Customer Reviews</h2>
      
      {isLoading ? (
        <div className="text-surface-500 py-8 text-center animate-pulse">Loading reviews...</div>
      ) : error ? (
        <div className="text-red-500 py-8 text-center">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="bg-surface-50 p-12 rounded-2xl border border-surface-100 text-center">
          <p className="text-surface-600 mb-6 text-lg">No reviews yet — be the first to review this product</p>
          {!showForm && !submitted && (
            <button onClick={() => setShowForm(true)} className="px-8 py-2.5 border-2 border-surface-900 rounded-full font-bold text-surface-900 hover:bg-surface-900 hover:text-white transition-colors">
              Write a Review
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div className="bg-surface-50 p-6 rounded-2xl border border-surface-100 text-center">
              <p className="text-5xl font-display font-bold text-surface-950 mb-2">{averageRating}</p>
              <div className="flex justify-center text-accent-500 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`w-5 h-5 ${i <= Math.round(Number(averageRating)) ? "fill-current" : "text-surface-200"}`} />
                ))}
              </div>
              <p className="text-sm text-surface-500">Based on {reviews.length} review{reviews.length === 1 ? "" : "s"}</p>
              
              {!showForm && !submitted && (
                <button onClick={() => setShowForm(true)} className="mt-6 w-full py-2.5 border-2 border-surface-900 rounded-full font-bold text-surface-900 hover:bg-surface-900 hover:text-white transition-colors">
                  Write a Review
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-8 space-y-8">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-surface-100 pb-8 last:border-0">
                <div className="flex items-center gap-1 text-accent-500 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`w-4 h-4 ${i <= review.rating ? "fill-current" : "text-surface-200"}`} />
                  ))}
                </div>
                <h4 className="font-bold text-surface-950 mb-1">{review.authorName || "Anonymous"}</h4>
                <p className="text-xs text-surface-500 mb-3">
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                </p>
                {review.title && <p className="font-semibold text-surface-800 mb-1">{review.title}</p>}
                <p className="text-surface-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && !submitted && (
        <ReviewForm 
          productId={productId} 
          onSuccess={() => {
            setShowForm(false);
            setSubmitted(true);
          }} 
          onCancel={() => setShowForm(false)} 
        />
      )}

      {submitted && (
        <div className="mt-8 bg-green-50 text-green-800 p-6 rounded-2xl border border-green-200 flex flex-col items-center text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Thank you for your review!</h3>
          <p className="text-green-700">Your review has been submitted and is pending approval.</p>
        </div>
      )}
    </div>
  );
}
