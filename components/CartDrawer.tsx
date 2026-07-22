"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/Button";

export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore((s) => s.getTotalPrice());

  // Assume standard shipping logic for preview
  const shipping = total > 500 ? 0 : 50;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-surface-950/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer */}
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
                    <li key={item.item_code} className="flex gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-100 border border-surface-200">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.item_name}
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
                            {item.item_name}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.item_code)}
                            aria-label={`Remove ${item.item_name}`}
                            className="shrink-0 text-surface-900/40 hover:text-red-500 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-surface-900/60 mt-1">₹{item.standard_rate}</p>

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
                            ₹{(item.standard_rate * item.qty).toLocaleString("en-IN")}
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
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-surface-900/70">
                    <span>Subtotal</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-surface-900/70">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                  <div className="flex items-center justify-between font-display text-lg font-bold text-surface-950 pt-3 border-t border-surface-200">
                    <span>Total</span>
                    <span>₹{(total + shipping).toLocaleString("en-IN")}</span>
                  </div>
                </div>
                
                <Link href="/checkout" onClick={closeCart}>
                  <Button size="lg" className="w-full text-base">
                    Proceed to Checkout
                  </Button>
                </Link>
                
                {shipping > 0 && (
                  <p className="text-center text-xs text-surface-900/50 mt-4">
                    Add ₹{(500 - total).toLocaleString("en-IN")} more for free shipping.
                  </p>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
