"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { createOrderRequest } from "@/lib/api/orders";
import { useCartStore } from "@/store/useCartStore";

type Status = "idle" | "submitting" | "success" | "error";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const clearCart = useCartStore((s) => s.clearCart);
  const total = useCartStore((s) => s.getTotalPrice());

  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      await createOrderRequest({
        items: items.map((i) => ({ item_code: i.item_code, qty: i.qty, rate: i.standard_rate })),
        contact: form,
      });

      setStatus("success");
      clearCart();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-orange-600" aria-hidden="true" />
          <h1 className="font-display text-2xl font-bold text-orange-950">Order Placed!</h1>
          <p className="mt-2 mb-8 text-orange-800/80">
            Thank you, {form.name.split(" ")[0] || "there"}. Your fresh, factory-direct order is on
            its way. A confirmation has been sent to {form.email}.
          </p>
          <Link
            href="/"
            className="inline-block rounded-full bg-orange-600 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-700"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  // Wait for the persisted cart to hydrate before deciding it's empty —
  // otherwise a real cart briefly flashes an "empty" state on page load.
  // See CartState.hasHydrated in store/useCartStore.ts.
  if (!hasHydrated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-orange-400" aria-hidden="true" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 text-center">
        <div>
          <p className="mb-4 text-lg font-medium text-orange-950">Your cart is empty.</p>
          <Link href="/" className="font-medium text-orange-600 hover:underline">
            ← Back to shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-orange-700 hover:text-orange-950"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to shop
      </Link>

      <h1 className="font-display text-3xl font-bold text-orange-950">Checkout</h1>
      <p className="mb-8 text-orange-800/70">Almost there — tell us where to send your order.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-orange-950">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-orange-950 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Priya Raman"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-orange-950">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-orange-950 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="priya@email.com"
          />
        </div>
        <div>
          <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-orange-950">
            Delivery Address
          </label>
          <textarea
            id="address"
            name="address"
            required
            rows={3}
            value={form.address}
            onChange={handleChange}
            className="w-full resize-none rounded-xl border border-orange-200 bg-white px-4 py-3 text-orange-950 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Flat / Street / City / PIN code"
          />
        </div>

        <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4">
          <div className="mb-2 flex justify-between text-sm text-orange-800">
            <span>{items.reduce((s, i) => s + i.qty, 0)} item(s)</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between border-t border-orange-200 pt-2 font-display text-base font-semibold text-orange-950">
            <span>Total</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {status === "error" && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-600 py-3.5 font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Placing your order…
            </>
          ) : (
            `Place Order — ₹${total.toLocaleString("en-IN")}`
          )}
        </button>
      </form>
    </div>
  );
}
