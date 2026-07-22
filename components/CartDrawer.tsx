"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";

export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore((s) => s.getTotalPrice());

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
            className="fixed inset-0 z-50 bg-black/40"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl sm:max-w-md"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-orange-100 px-5 py-4">
              <h2 className="font-display text-lg font-bold text-orange-950">Your Cart</h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="rounded-full p-1.5 text-orange-700 hover:bg-orange-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <ShoppingBag className="mb-3 h-12 w-12 text-orange-200" aria-hidden="true" />
                <p className="font-medium text-orange-950">Your cart is empty</p>
                <p className="mt-1 text-sm text-orange-700/70">Add some crispy vadams to get started.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.item_code} className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-orange-50">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.item_name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-orange-300">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug text-orange-950">
                            {item.item_name}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.item_code)}
                            aria-label={`Remove ${item.item_name}`}
                            className="shrink-0 text-orange-300 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-orange-700/60">₹{item.standard_rate} each</p>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full border border-orange-200">
                            <button
                              type="button"
                              onClick={() => updateQty(item.item_code, item.qty - 1)}
                              aria-label="Decrease quantity"
                              className="p-1.5 text-orange-700 hover:text-orange-950"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-5 text-center text-sm font-medium text-orange-950">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.item_code, item.qty + 1)}
                              aria-label="Increase quantity"
                              className="p-1.5 text-orange-700 hover:text-orange-950"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-orange-950">
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
              <div className="border-t border-orange-100 px-5 py-4">
                <div className="mb-4 flex items-center justify-between font-display text-base font-semibold text-orange-950">
                  <span>Total</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full rounded-full bg-orange-600 py-3.5 text-center font-semibold text-white transition-colors hover:bg-orange-700"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
