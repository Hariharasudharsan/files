"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2, Package } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { initPaymentRequest, verifyPaymentRequest } from "@/lib/api/orders";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";

export default function CheckoutClient({ initialUser }: { initialUser?: { name: string, email: string } }) {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const clearCart = useCartStore((s) => s.clearCart);
  const total = useCartStore((s) => s.getTotalPrice());

  const shipping = total > 999 ? 0 : 50;

  const [form, setForm] = useState({ 
    name: initialUser?.name || "", 
    email: initialUser?.email || "", 
    phone: "", address: "", city: "", state: "", pincode: "",
    whatsappOptIn: true
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((f) => ({ ...f, [e.target.name]: value }));
    // Clear individual error when user types
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setStatus("submitting");
    setErrorMsg("");
    setValidationErrors({});

    // Basic frontend real-time validation before API call
    const errors: Record<string, string> = {};
    if (!/^[A-Za-z\s]{3,50}$/.test(form.name)) errors.name = "Name must be 3-50 characters (letters only).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Valid email is required.";
    if (!/^[0-9]{10}$/.test(form.phone)) errors.phone = "Valid 10-digit phone number is required.";
    if (form.address.trim().length < 10) errors.address = "Address must be at least 10 characters.";
    if (form.city.trim().length < 2) errors.city = "City is required.";
    if (form.state.trim().length < 2) errors.state = "State is required.";
    if (!/^[0-9]{6}$/.test(form.pincode)) errors.pincode = "Valid 6-digit Pincode is required.";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setStatus("error");
      setErrorMsg("Please fix the highlighted errors.");
      return;
    }

    try {
      const initRes = await initPaymentRequest({
        items: items.map((i) => ({ productVariantId: i.id, qty: i.qty, rate: i.price })),
        contact: form,
      });

      const options = {
        key: initRes.key,
        amount: initRes.amount,
        currency: initRes.currency,
        name: "Sridha's Store",
        description: "Order Payment",
        order_id: initRes.razorpayOrderId,
        handler: async function (response: any) {
          try {
            await verifyPaymentRequest({
              orderId: initRes.orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            setStatus("success");
            clearCart();
          } catch (err) {
            setStatus("error");
            setErrorMsg("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: "#4f46e5", // Indigo-600
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        setStatus("error");
        setErrorMsg(`Payment Failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong initializing checkout.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 bg-surface-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center glass p-10 rounded-3xl"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-600">
            <CheckCircle2 className="h-12 w-12" aria-hidden="true" />
          </div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Order Confirmed!</h1>
          <p className="mt-4 mb-8 text-surface-900/70 leading-relaxed">
            Thank you, {form.name.split(" ")[0] || "there"}. Your fresh, factory-direct order is being prepared. A confirmation email has been sent to <span className="font-medium text-surface-950">{form.email}</span>.
          </p>
          <Link href="/">
            <Button size="lg" className="w-full">Continue Shopping</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" aria-hidden="true" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 text-center">
        <div>
          <Package className="mx-auto h-16 w-16 text-primary-200 mb-4" />
          <p className="mb-6 text-xl font-medium text-surface-950 font-display">Your cart is empty.</p>
          <Link href="/">
            <Button variant="outline">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="bg-surface-50 min-h-screen pb-24">
        <div className="mx-auto max-w-5xl px-4 pt-10 sm:pt-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-surface-900/60 hover:text-surface-950 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Continue Shopping
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-7">
            <h1 className="font-display text-3xl font-bold text-surface-950 mb-2">Checkout</h1>
            <p className="mb-8 text-surface-900/60 font-medium">Please enter your shipping details.</p>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="glass p-6 rounded-2xl border border-surface-200 space-y-5">
                <h2 className="font-display text-xl font-semibold text-surface-950 mb-4 border-b border-surface-200 pb-4">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-semibold text-surface-900">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      aria-invalid={!!validationErrors.name}
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-surface-950 focus:outline-none focus:ring-2 transition-shadow ${validationErrors.name ? 'border-red-400 focus:ring-red-500' : 'border-surface-300 focus:ring-primary-500'}`}
                      placeholder="E.g., Priya Raman"
                    />
                    {validationErrors.name && <p className="mt-1 text-xs text-red-500">{validationErrors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-surface-900">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      maxLength={10}
                      value={form.phone}
                      onChange={handleChange}
                      aria-invalid={!!validationErrors.phone}
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-surface-950 focus:outline-none focus:ring-2 transition-shadow ${validationErrors.phone ? 'border-red-400 focus:ring-red-500' : 'border-surface-300 focus:ring-primary-500'}`}
                      placeholder="10-digit mobile number"
                    />
                    {validationErrors.phone && <p className="mt-1 text-xs text-red-500">{validationErrors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-surface-900">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    aria-invalid={!!validationErrors.email}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-surface-950 focus:outline-none focus:ring-2 transition-shadow ${validationErrors.email ? 'border-red-400 focus:ring-red-500' : 'border-surface-300 focus:ring-primary-500'}`}
                    placeholder="priya@example.com"
                  />
                  {validationErrors.email && <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>}
                </div>
                
                <div className="pt-2">
                  <label className="flex items-center gap-3 text-sm text-surface-700 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="whatsappOptIn"
                      checked={form.whatsappOptIn}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-surface-300 text-green-600 focus:ring-green-600 accent-green-600" 
                    />
                    <span className="group-hover:text-surface-950 transition-colors font-medium">Get order updates and offers on WhatsApp</span>
                  </label>
                </div>
              </div>

              <div className="glass p-6 rounded-2xl border border-surface-200 space-y-5">
                <h2 className="font-display text-xl font-semibold text-surface-950 mb-4 border-b border-surface-200 pb-4">Shipping Address</h2>
                <div>
                  <label htmlFor="address" className="mb-2 block text-sm font-semibold text-surface-900">
                    Complete Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    required
                    rows={3}
                    value={form.address}
                    onChange={handleChange}
                    aria-invalid={!!validationErrors.address}
                    className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-surface-950 focus:outline-none focus:ring-2 transition-shadow ${validationErrors.address ? 'border-red-400 focus:ring-red-500' : 'border-surface-300 focus:ring-primary-500'}`}
                    placeholder="House/Flat No., Street Name, Area"
                  />
                  {validationErrors.address && <p className="mt-1 text-xs text-red-500">{validationErrors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="city" className="mb-2 block text-sm font-semibold text-surface-900">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={form.city}
                      onChange={handleChange}
                      aria-invalid={!!validationErrors.city}
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-surface-950 focus:outline-none focus:ring-2 transition-shadow ${validationErrors.city ? 'border-red-400 focus:ring-red-500' : 'border-surface-300 focus:ring-primary-500'}`}
                    />
                    {validationErrors.city && <p className="mt-1 text-xs text-red-500">{validationErrors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="state" className="mb-2 block text-sm font-semibold text-surface-900">
                      State
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      required
                      value={form.state}
                      onChange={handleChange}
                      aria-invalid={!!validationErrors.state}
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-surface-950 focus:outline-none focus:ring-2 transition-shadow ${validationErrors.state ? 'border-red-400 focus:ring-red-500' : 'border-surface-300 focus:ring-primary-500'}`}
                    />
                    {validationErrors.state && <p className="mt-1 text-xs text-red-500">{validationErrors.state}</p>}
                  </div>
                  <div>
                    <label htmlFor="pincode" className="mb-2 block text-sm font-semibold text-surface-900">
                      Pincode
                    </label>
                    <input
                      id="pincode"
                      name="pincode"
                      type="text"
                      required
                      maxLength={6}
                      value={form.pincode}
                      onChange={handleChange}
                      aria-invalid={!!validationErrors.pincode}
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-surface-950 focus:outline-none focus:ring-2 transition-shadow ${validationErrors.pincode ? 'border-red-400 focus:ring-red-500' : 'border-surface-300 focus:ring-primary-500'}`}
                    />
                    {validationErrors.pincode && <p className="mt-1 text-xs text-red-500">{validationErrors.pincode}</p>}
                  </div>
                </div>
              </div>

              {status === "error" && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium">
                  {errorMsg}
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 glass p-6 sm:p-8 rounded-3xl border border-surface-200 shadow-sm">
              <h2 className="font-display text-2xl font-bold text-surface-950 mb-6">Order Summary</h2>
              
              <ul className="space-y-4 border-b border-surface-200 pb-6 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.item_code} className="flex justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-surface-950">{item.product_name}</span>
                      <span className="text-sm text-surface-900/60">Qty: {item.qty}</span>
                    </div>
                    <span className="font-medium text-surface-950">₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-surface-900/80">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-surface-900/80">
                  <span>Shipping Estimate</span>
                  <span>{shipping === 0 ? <span className="text-green-600 font-semibold">Free</span> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-surface-900/80">
                  <span>Taxes</span>
                  <span>Included</span>
                </div>
                
                {/* Coupon Input */}
                <div className="pt-4 flex gap-2">
                  <input type="text" placeholder="Gift card or discount code" className="flex-1 bg-white border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" />
                  <button className="bg-surface-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-surface-800 transition-colors">
                    Apply
                  </button>
                </div>

                <div className="flex items-center justify-between font-display text-2xl font-bold text-surface-950 pt-4 border-t border-surface-200 mt-2">
                  <span>Total</span>
                  <span>₹{(total + shipping).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Button
                form="checkout-form"
                type="submit"
                size="lg"
                disabled={status === "submitting"}
                className="w-full text-lg shadow-xl shadow-primary-600/20"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" /> Processing...
                  </>
                ) : (
                  `Pay ₹${(total + shipping).toLocaleString("en-IN")}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
