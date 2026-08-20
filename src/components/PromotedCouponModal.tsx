"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function PromotedCouponModal({ coupon, product }: { coupon: any, product: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem(`dismissed_coupon_${coupon?.id}`);
    if (!dismissed && coupon) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [coupon]);

  useEffect(() => {
    if (!coupon?.validUntil) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(coupon.validUntil) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setIsOpen(false);
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();
    return () => clearInterval(timer);
  }, [coupon]);

  const dismiss = () => {
    setIsOpen(false);
    setHasDismissed(true);
    if (coupon) {
      sessionStorage.setItem(`dismissed_coupon_${coupon.id}`, "true");
    }
  };

  const handleAdd = () => {
    if (product) {
      const variant = product.variants?.[0]; // default to first variant
      if (variant) {
        addItem(product, variant, quantity);
        setJustAdded(true);
        setTimeout(() => {
          setJustAdded(false);
          dismiss();
        }, 1500);
      }
    }
  };

  if (!coupon || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden bg-white rounded-3xl shadow-2xl"
          >
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 p-2 z-10 rounded-full bg-white/80 hover:bg-white text-surface-500 hover:text-surface-900 shadow-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row">
              {product?.primaryImage?.url && (
                <div className="relative w-full sm:w-2/5 h-48 sm:h-auto bg-surface-100">
                  <Image
                    src={product.primaryImage.url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:hidden" />
                </div>
              )}
              
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center bg-brand-tint/10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-fry text-white text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                  <Clock className="w-3.5 h-3.5" /> Limited Time Offer
                </div>
                
                <h2 className="font-display text-2xl font-bold text-brand-deep leading-tight mb-2">
                  {coupon.promotedTitle || `Special Offer: ${coupon.code}`}
                </h2>
                
                <p className="text-surface-600 text-sm mb-6">
                  {coupon.discountType === "PERCENTAGE" 
                    ? `Get ${coupon.discountValue}% off instantly.` 
                    : `Get ₹${coupon.discountValue} off instantly.`}
                </p>

                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-surface-200 mb-6 shadow-sm">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-brand-deep">{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] uppercase font-bold text-surface-400">Hours</span>
                  </div>
                  <span className="text-xl font-bold text-brand-deep/30">:</span>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-brand-deep">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] uppercase font-bold text-surface-400">Mins</span>
                  </div>
                  <span className="text-xl font-bold text-brand-deep/30">:</span>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-brand-deep">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] uppercase font-bold text-surface-400">Secs</span>
                  </div>
                </div>

                {product && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-t border-surface-200 pt-4">
                      <span className="text-sm font-semibold text-brand-deep">{product.name}</span>
                      <span className="font-bold text-brand-deep">₹{product.variants?.[0]?.price}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-surface-100 rounded-lg p-1">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white shadow-sm text-surface-600"
                        >-</button>
                        <span className="w-8 text-center font-bold text-sm text-brand-deep">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white shadow-sm text-surface-600"
                        >+</button>
                      </div>
                      <Button
                        onClick={handleAdd}
                        disabled={justAdded}
                        className={`flex-1 h-10 ${justAdded ? "bg-green-600 hover:bg-green-700" : "bg-accent-fry hover:bg-accent-fry/90"} text-white border-none shadow-lg`}
                      >
                        {justAdded ? <><Check className="w-4 h-4 mr-2" /> Added</> : <><ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart</>}
                      </Button>
                    </div>
                  </div>
                )}
                {!product && (
                  <div className="bg-surface-100 border border-surface-200 rounded-xl p-4 text-center">
                    <p className="text-sm font-medium text-surface-600">Use code at checkout:</p>
                    <p className="text-2xl font-mono font-bold text-brand-deep mt-1 tracking-wider">{coupon.code}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
