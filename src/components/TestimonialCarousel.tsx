"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

export default function TestimonialCarousel({ reviews }: { reviews: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews]);

  if (!reviews || reviews.length === 0) return null;

  const currentReview = reviews[currentIndex];

  const next = () => setCurrentIndex((prev) => (prev + 1) % reviews.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  return (
    <div className="relative w-full max-w-4xl mx-auto overflow-hidden px-12 py-8">
      <div className="flex items-center justify-between absolute inset-y-0 left-0 right-0 z-10">
        <button onClick={prev} className="p-2 text-brand-deep/50 hover:text-brand-deep transition-colors bg-white/50 hover:bg-white rounded-full shadow-sm backdrop-blur-sm">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={next} className="p-2 text-brand-deep/50 hover:text-brand-deep transition-colors bg-white/50 hover:bg-white rounded-full shadow-sm backdrop-blur-sm">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      
      <div className="relative min-h-[160px] flex items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl mx-auto"
          >
            <div className="flex justify-center gap-1 mb-4 text-accent-fry">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < currentReview.rating ? 'fill-current' : 'text-surface-300'}`} />
              ))}
            </div>
            
            <p className="text-xl sm:text-2xl font-medium text-brand-deep leading-relaxed mb-6 italic">
              &quot;{currentReview.comment}&quot;
            </p>
            
            <div className="flex flex-col items-center justify-center">
              <p className="font-bold text-brand-deep">{currentReview.user?.name || "Anonymous Customer"}</p>
              {currentReview.product && (
                <p className="text-sm text-brand-deep/60 mt-1">
                  On {currentReview.product.name}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="flex justify-center gap-2 mt-6">
        {reviews.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-accent-fry w-6' : 'bg-surface-300 hover:bg-surface-400'}`}
          />
        ))}
      </div>
    </div>
  );
}
