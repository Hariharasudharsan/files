"use client";
import { Logger } from "@/lib/infrastructure/logger";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/Button";

export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore((s) => s.totalPrice);
  const addItem = useCartStore((s) => s.addItem);

  const [upsells, setUpsells] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/v1/recommendations/cart-upsell")
        .then(res => res.json())
        .then(data => {
          setUpsells(data);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const filteredUpsells = upsells.filter((p: any) => !items.some(i => i.product_id === p.id));

  const shipping = total > 500 ? 0 : 50;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-surface-950/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-base shadow-2xl sm:max-w-md border-l border-brand-tint"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-brand-tint px-6 py-5">
              <h2 className="font-display text-xl font-bold text-brand-deep">Your Pantry</h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="rounded-full p-2 text-brand-deep/50 hover:bg-brand-tint hover:text-brand-deep transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="mb-6 rounded-full bg-brand-tint/20 p-6">
                  <ShoppingBag className="h-12 w-12 text-brand-mid" aria-hidden="true" />
                </div>
                <p className="font-display text-xl font-semibold text-brand-deep mb-2">Your pantry is empty</p>
                <p className="text-brand-deep/70 mb-8 max-w-xs">Stock up on sun-dried papadams, crisp vadams, and traditional thokku.</p>
                <Button onClick={closeCart} className="bg-brand-mid hover:opacity-90 text-white border-none">Browse Collection</Button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <ul className="space-y-6">
                  <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.li 
                      key={item.item_code} 
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-4 p-4 hover:bg-brand-tint/10 transition-colors rounded-xl"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-brand-tint bg-brand-tint/20 relative group">
                        {item.images?.[0] ? (
                          <Image
                            src={item.images[0].url}
                            alt={item.product_name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-brand-tint">
                            <ShoppingBag className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-brand-deep line-clamp-2 leading-snug">
                            {item.product_name} - {item.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.item_code)}
                            aria-label={`Remove ${item.product_name}`}
                            className="shrink-0 text-brand-deep/40 hover:text-red-500 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-brand-deep/60 mt-1">₹{item.price}</p>

                        <div className="mt-auto pt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full border border-brand-tint bg-base p-1">
                            <button
                              type="button"
                              onClick={() => updateQty(item.item_code, item.qty - 1)}
                              aria-label="Decrease quantity"
                              className="rounded-full p-1 text-brand-deep hover:bg-brand-tint transition"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold text-brand-deep">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.item_code, item.qty + 1)}
                              aria-label="Increase quantity"
                              className="rounded-full p-1 text-brand-deep hover:bg-brand-tint transition"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="font-semibold text-brand-deep">
                            ₹{(item.price * item.qty).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                  </AnimatePresence>
                </ul>
              </div>
            )}

            {items.length > 0 && (
              <div className="border-t border-brand-tint bg-brand-tint/10 px-6 py-6">
                
                {/* Free Shipping Progress */}
                <div className="mb-6">
                  {total >= 999 ? (
                    <div className="text-center text-sm font-semibold text-brand-mid bg-brand-tint/30 py-2 rounded-lg border border-brand-tint">
                      🎉 You&apos;ve unlocked Free Shipping!
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-brand-deep/80 mb-2">
                        <span>Add ₹{(999 - total).toLocaleString("en-IN")} more for Free Shipping</span>
                      </div>
                      <div className="h-2 w-full bg-brand-tint/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-mid transition-all duration-500"
                          style={{ width: `${Math.min((total / 999) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-brand-deep/70">
                    <span>Subtotal</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-brand-deep/70">
                    <span>Shipping</span>
                    <span>{total >= 999 ? <span className="text-brand-mid font-semibold">Free</span> : `₹50`}</span>
                  </div>
                  
                  {/* Coupon Input */}
                  <div className="pt-2 flex gap-2">
                    <input type="text" placeholder="Coupon Code" aria-label="Coupon Code" className="flex-1 bg-base border border-brand-tint rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-mid" />
                    <button className="bg-brand-deep text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-brand-deep/90 transition-colors">
                      Apply
                    </button>
                  </div>

                  <div className="flex items-center justify-between font-display text-lg font-bold text-brand-deep pt-3 border-t border-brand-tint">
                    <span>Total</span>
                    <span>₹{(total + (total >= 999 ? 0 : 50)).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Upsell Carousel */}
                {filteredUpsells.length > 0 && total < 999 && (
                  <div className="mb-6 bg-base border border-brand-tint rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-sm font-bold text-brand-deep">
                      <Sparkles className="w-4 h-4 text-accent-fry" />
                      Add to reach Free Shipping
                    </div>
                    <div className="space-y-3">
                      {filteredUpsells.slice(0, 2).map(upsell => (
                        <div key={upsell.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-brand-tint/20 rounded overflow-hidden relative shrink-0">
                            {upsell.primaryImage && <Image src={upsell.primaryImage.url} alt={upsell.name} fill className="object-cover" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-brand-deep line-clamp-1">{upsell.name}</p>
                            <p className="text-xs text-brand-deep/60">₹{upsell.variants[0]?.price}</p>
                          </div>
                          <button 
                            onClick={() => addItem(upsell, upsell.variants[0], 1)}
                            className="bg-brand-tint/50 text-brand-deep hover:bg-brand-tint px-3 py-1.5 rounded text-xs font-bold transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Link href="/checkout" onClick={closeCart}>
                  <Button size="lg" className="w-full text-base bg-accent-fry hover:opacity-90 text-white shadow-lg shadow-accent-fry/20 border-none">
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-brand-deep/50">
                  <ShoppingBag className="w-4 h-4" /> Secure SSL Checkout
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
