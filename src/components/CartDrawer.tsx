"use client";

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
    if (isOpen && items.length > 0) {
      fetch("/api/v1/recommendations/cart-upsell")
        .then(res => res.json())
        .then(data => {
          // Filter out items already in cart
          const filtered = data.filter((p: any) => !items.some(i => i.product_id === p.id));
          setUpsells(filtered);
        })
        .catch(console.error);
    }
  }, [isOpen, items]);

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
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl sm:max-w-md border-l border-surface-200"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-surface-200 px-6 py-5">
              <h2 className="font-display text-xl font-bold text-surface-950">Your Cart</h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="rounded-full p-2 text-surface-900/50 hover:bg-surface-100 hover:text-surface-950 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="mb-6 rounded-full bg-surface-50 p-6">
                  <ShoppingBag className="h-12 w-12 text-primary-300" aria-hidden="true" />
                </div>
                <p className="font-display text-xl font-semibold text-surface-950 mb-2">Your cart is empty</p>
                <p className="text-surface-900/60 mb-8 max-w-xs">Add some premium South Indian delicacies to get started.</p>
                <Button onClick={closeCart}>Continue Shopping</Button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <ul className="space-y-6">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4 p-4 hover:bg-surface-50/50 transition-colors">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-surface-200 bg-surface-50 relative group">
                        {item.images?.[0] ? (
                          <Image
                            src={item.images[0].url}
                            alt={item.product_name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-primary-200">
                            <ShoppingBag className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-surface-950 line-clamp-2 leading-snug">
                            {item.product_name} - {item.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.item_code)}
                            aria-label={`Remove ${item.product_name}`}
                            className="shrink-0 text-surface-900/40 hover:text-red-500 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-surface-900/60 mt-1">₹{item.price}</p>

                        <div className="mt-auto pt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full border border-surface-200 bg-surface-50 p-1">
                            <button
                              type="button"
                              onClick={() => updateQty(item.item_code, item.qty - 1)}
                              aria-label="Decrease quantity"
                              className="rounded-full p-1 text-surface-900 hover:bg-white hover:shadow-sm transition"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold text-surface-950">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.item_code, item.qty + 1)}
                              aria-label="Increase quantity"
                              className="rounded-full p-1 text-surface-900 hover:bg-white hover:shadow-sm transition"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="font-semibold text-surface-950">
                            ₹{(item.price * item.qty).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {items.length > 0 && (
              <div className="border-t border-surface-200 bg-surface-50 px-6 py-6">
                
                {/* Free Shipping Progress */}
                <div className="mb-6">
                  {total >= 999 ? (
                    <div className="text-center text-sm font-semibold text-green-700 bg-green-50 py-2 rounded-lg border border-green-100">
                      🎉 You&apos;ve unlocked Free Shipping!
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-surface-900 mb-2">
                        <span>Add ₹{(999 - total).toLocaleString("en-IN")} more for Free Shipping</span>
                      </div>
                      <div className="h-2 w-full bg-surface-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 transition-all duration-500"
                          style={{ width: `${Math.min((total / 999) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-surface-900/70">
                    <span>Subtotal</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-surface-900/70">
                    <span>Shipping</span>
                    <span>{total >= 999 ? <span className="text-green-600 font-semibold">Free</span> : `₹50`}</span>
                  </div>
                  
                  {/* Coupon Input */}
                  <div className="pt-2 flex gap-2">
                    <input type="text" placeholder="Coupon Code" aria-label="Coupon Code" className="flex-1 bg-white border border-surface-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary-500" />
                    <button className="bg-surface-900 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-surface-800 transition-colors">
                      Apply
                    </button>
                  </div>

                  <div className="flex items-center justify-between font-display text-lg font-bold text-surface-950 pt-3 border-t border-surface-200">
                    <span>Total</span>
                    <span>₹{(total + (total >= 999 ? 0 : 50)).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Upsell Carousel */}
                {upsells.length > 0 && total < 999 && (
                  <div className="mb-6 bg-white border border-surface-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-sm font-bold text-surface-900">
                      <Sparkles className="w-4 h-4 text-primary-500" />
                      Add to reach Free Shipping
                    </div>
                    <div className="space-y-3">
                      {upsells.slice(0, 2).map(upsell => (
                        <div key={upsell.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-surface-100 rounded overflow-hidden relative shrink-0">
                            {upsell.primaryImage && <Image src={upsell.primaryImage.url} alt={upsell.name} fill className="object-cover" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-surface-900 line-clamp-1">{upsell.name}</p>
                            <p className="text-xs text-surface-500">₹{upsell.variants[0]?.price}</p>
                          </div>
                          <button 
                            onClick={() => addItem(upsell, upsell.variants[0], 1)}
                            className="bg-primary-50 text-primary-700 hover:bg-primary-100 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Link href="/checkout" onClick={closeCart}>
                  <Button size="lg" className="w-full text-base bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-900/20">
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-surface-500">
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
