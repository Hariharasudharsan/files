"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface ReviewFormProps {
  productId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!session) {
    return (
      <div className="bg-surface-50 p-6 rounded-2xl border border-surface-200">
        <p className="text-surface-700 font-medium mb-4">You must be logged in to leave a review.</p>
        <button onClick={onCancel} className="text-surface-500 hover:text-surface-900 font-medium">Close</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, comment })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit review");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm mt-8">
      <h3 className="font-display font-bold text-xl text-surface-950 mb-6">Write a Review</h3>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-semibold text-surface-900 mb-2">Overall Rating *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHoverRating(i)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  i <= (hoverRating || rating) ? "fill-accent-500 text-accent-500" : "text-surface-200"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-surface-900 mb-2">Review Title (Optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-surface-900 mb-2">Review Comment (Optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell others what you liked or disliked..."
          rows={4}
          className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-surface-950 hover:bg-surface-800 text-white px-8 py-3 rounded-full font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Review"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-surface-500 hover:text-surface-900 font-medium px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
