"use client";

import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2, Package } from "lucide-react";
import { businessConfig } from "@/config/business.config";
import Link from "next/link";
import Script from "next/script";
import { initPaymentRequest, verifyPaymentRequest } from "@/lib/api/orders";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/Button";
import { IndianStates } from "@/lib/core/domain/value-objects/IndianState";
import { TransitProofPackaging } from "@/components/checkout/TransitProofPackaging";

type Status = "idle" | "submitting" | "success" | "error";

export default function CheckoutClient({ 
  initialUser, 
  prepaidDiscountPercent = 0,
  isB2B = false,
  b2bMinOrderValue = 0,
  b2bMinOrderQty = 0
}: { 
  initialUser?: { name: string, email: string }, 
  prepaidDiscountPercent?: number,
  isB2B?: boolean,
  b2bMinOrderValue?: number,
  b2bMinOrderQty?: number
}) {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const clearCart = useCartStore((s) => s.clearCart);
  const retailTotal = useCartStore((s) => s.totalPrice);
  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);

  // Compute B2B
  let b2bActive = isB2B;
  let b2bTotal = 0;
  items.forEach(i => {
    const rate = i.wholesalePrice ? Number(i.wholesalePrice) : Number(i.price);
    b2bTotal += rate * i.qty;
  });
  if (b2bMinOrderQty && totalQty < b2bMinOrderQty) b2bActive = false;
  if (b2bMinOrderValue && b2bTotal < b2bMinOrderValue) b2bActive = false;

  const total = b2bActive ? b2bTotal : retailTotal;

  const [dynamicShippingRate, setDynamicShippingRate] = useState<number | null>(null);
  const [isServiceable, setIsServiceable] = useState<boolean | null>(null);
  const baseShipping = dynamicShippingRate !== null ? dynamicShippingRate : 50;
  const shipping = total > 999 ? 0 : baseShipping;

  const [form, setForm] = useState({ 
    name: initialUser?.name || "", 
    email: initialUser?.email || "", 
    phone: "", flatOrHouseNumber: "", localityOrArea: "", landmark: "", city: "", state: "", pincode: "",
    whatsappOptIn: true,
    gstin: ""
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (form.pincode && form.pincode.length === 6) {
      const fetchShipping = async () => {
        try {
          const res = await fetch(`/api/shipping/calculate?pincode=${form.pincode}`);
          const data = await res.json();
          if (res.ok || data.serviceable === false) {
            if (data.serviceable) {
              setDynamicShippingRate(data.rate);
              setIsServiceable(true);
            } else {
              setDynamicShippingRate(null);
              setIsServiceable(false);
            }
          }
        } catch (error) {
          console.error("Failed to fetch dynamic shipping rate", error);
        }
      };
      fetchShipping();
    } else {
      setTimeout(() => {
        setDynamicShippingRate(null);
        setIsServiceable(null);
      }, 0);
    }
  }, [form.pincode]);
  
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number, discountType: string} | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const couponDiscountAmount = (() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'FIXED') {
      return appliedCoupon.discount;
    } else {
      return Math.min((total * appliedCoupon.discount) / 100, appliedCoupon.discount);
    }
  })();

  const prepaidDiscountAmount = paymentMethod !== "COD" && prepaidDiscountPercent > 0
    ? (total * prepaidDiscountPercent) / 100
    : 0;

  const discountAmount = couponDiscountAmount + prepaidDiscountAmount;
  const finalTotal = Math.max(0, total + shipping - discountAmount);

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
    if (form.flatOrHouseNumber.trim().length < 1) errors.flatOrHouseNumber = "Flat/House number is required.";
    if (form.localityOrArea.trim().length < 3) errors.localityOrArea = "Locality/Area must be at least 3 characters.";
    if (form.landmark && form.landmark.trim().length > 100) errors.landmark = "Landmark is too long.";
    if (form.city.trim().length < 2) errors.city = "City is required.";
    if (!IndianStates.includes(form.state as any)) errors.state = "Valid Indian state is required.";
    if (!/^[0-9]{6}$/.test(form.pincode)) errors.pincode = "Valid 6-digit Pincode is required.";
    else if (isServiceable === false) errors.pincode = "Delivery is not available at this pincode.";
    if (form.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstin)) {
      errors.gstin = "Invalid GSTIN format.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setStatus("error");
      setErrorMsg("Please fix the highlighted errors.");
      return;
    }

    try {
      const initRes = await initPaymentRequest({
        items: items.map((i) => ({ productVariantId: i.id, qty: i.qty })),
        contact: form,
        paymentMethod,
        couponCode: appliedCoupon?.code
      });

      if (initRes.isCOD) {
        setStatus("success");
        clearCart();
        return;
      }

      const options = {
        key: initRes.key,
        amount: initRes.amount,
        currency: initRes.currency,
        name: businessConfig.brandName,
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

  const applyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch(`/api/v1/coupons/validate?code=${couponCodeInput}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid coupon");
      }
      setAppliedCoupon({
        code: data.coupon.code,
        discount: data.coupon.discountValue,
        discountType: data.coupon.discountType
      });
      setCouponCodeInput("");
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Failed to apply coupon");
    } finally {
      setIsApplyingCoupon(false);
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
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
                <div>
                  <label htmlFor="gstin" className="mb-2 block text-sm font-semibold text-surface-900">
                    GSTIN (Optional for B2B)
                  </label>
                  <input
                    id="gstin"
                    name="gstin"
                    type="text"
                    value={form.gstin}
                    onChange={handleChange}
                    aria-invalid={!!validationErrors.gstin}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-surface-950 uppercase focus:outline-none focus:ring-2 transition-shadow ${validationErrors.gstin ? 'border-red-400 focus:ring-red-500' : 'border-surface-300 focus:ring-primary-500'}`}
                    placeholder="22AAAAA0000A1Z5"
                  />
                  {validationErrors.gstin && <p className="mt-1 text-xs text-red-500">{validationErrors.gstin}</p>}
                </div>
              </div>

              <div className="glass p-6 rounded-2xl border border-surface-200 space-y-5">
                <h2 className="font-display text-xl font-semibold text-surface-950 mb-4 border-b border-surface-200 pb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="flatOrHouseNumber" className="mb-2 block text-sm font-semibold text-surface-900">
                      Flat / House No. / Building
                    </label>
                    <input
                      id="flatOrHouseNumber"
                      name="flatOrHouseNumber"
                      type="text"
                      required
                      value={form.flatOrHouseNumber}
                      onChange={handleChange}
                      aria-invalid={!!validationErrors.flatOrHouseNumber}
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-surface-950 focus:outline-none focus:ring-2 transition-shadow ${validationErrors.flatOrHouseNumber ? 'border-red-400 focus:ring-red-500' : 'border-surface-300 focus:ring-primary-500'}`}
                      placeholder="E.g., Flat 201, ABC Apartments"
                    />
                    {validationErrors.flatOrHouseNumber && <p className="mt-1 text-xs text-red-500">{validationErrors.flatOrHouseNumber}</p>}
                  </div>
                  <div>
                    <label htmlFor="localityOrArea" className="mb-2 block text-sm font-semibold text-surface-900">
                      Locality / Area / Street
                    </label>
                    <input
                      id="localityOrArea"
                      name="localityOrArea"
                      type="text"
                      required
                      value={form.localityOrArea}
                      onChange={handleChange}
                      aria-invalid={!!validationErrors.localityOrArea}
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-surface-950 focus:outline-none focus:ring-2 transition-shadow ${validationErrors.localityOrArea ? 'border-red-400 focus:ring-red-500' : 'border-surface-300 focus:ring-primary-500'}`}
                      placeholder="E.g., Anna Nagar"
                    />
                    {validationErrors.localityOrArea && <p className="mt-1 text-xs text-red-500">{validationErrors.localityOrArea}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="landmark" className="mb-2 block text-sm font-semibold text-surface-900">
                    Landmark (Optional)
                  </label>
                  <input
                    id="landmark"
                    name="landmark"
                    type="text"
                    value={form.landmark}
                    onChange={handleChange}
                    aria-invalid={!!validationErrors.landmark}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-surface-950 focus:outline-none focus:ring-2 transition-shadow ${validationErrors.landmark ? 'border-red-400 focus:ring-red-500' : 'border-surface-300 focus:ring-primary-500'}`}
                    placeholder="E.g., Near Post Office"
                  />
                  {validationErrors.landmark && <p className="mt-1 text-xs text-red-500">{validationErrors.landmark}</p>}
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
                    <select
                      id="state"
                      name="state"
                      required
                      value={form.state}
                      onChange={handleChange as any}
                      aria-invalid={!!validationErrors.state}
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-surface-950 focus:outline-none focus:ring-2 transition-shadow ${validationErrors.state ? 'border-red-400 focus:ring-red-500' : 'border-surface-300 focus:ring-primary-500'}`}
                    >
                      <option value="" disabled>Select State</option>
                      {IndianStates.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
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
              
              <div className="glass p-6 rounded-2xl border border-surface-200 space-y-5">
                <h2 className="font-display text-xl font-semibold text-surface-950 mb-4 border-b border-surface-200 pb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-surface-50 transition-colors">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="RAZORPAY"
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-primary-600 accent-primary-600"
                    />
                    <span className="font-medium text-surface-950">Pay Online (Cards, UPI, NetBanking)</span>
                    {prepaidDiscountPercent > 0 && (
                      <span className="ml-2 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">Save {prepaidDiscountPercent}%</span>
                    )}
                  </label>
                  {process.env.NEXT_PUBLIC_ENABLE_COD === "true" && (
                    <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-surface-50 transition-colors">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-primary-600 accent-primary-600"
                      />
                      <span className="font-medium text-surface-950">Cash on Delivery (COD)</span>
                    </label>
                  )}
                </div>
              </div>
            </form>
            
            <div className="mt-8">
              <TransitProofPackaging />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 glass p-6 sm:p-8 rounded-3xl border border-surface-200 shadow-sm">
              <h2 className="font-display text-2xl font-bold text-surface-950 mb-6 flex items-center justify-between">
                Order Summary
                {b2bActive && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-md font-semibold ml-2">B2B Wholesale</span>}
              </h2>
              
              <ul className="space-y-4 border-b border-surface-200 pb-6 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const rate = b2bActive && item.wholesalePrice ? Number(item.wholesalePrice) : item.price;
                  return (
                  <li key={item.item_code} className="flex justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-surface-950">{item.product_name}</span>
                      <span className="text-sm text-surface-900/60">Qty: {item.qty}</span>
                    </div>
                    <span className="font-medium text-surface-950">₹{(rate * item.qty).toLocaleString("en-IN")}</span>
                  </li>
                )})}
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
                
                {prepaidDiscountAmount > 0 && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Prepaid Discount ({prepaidDiscountPercent}%)</span>
                    <span>-₹{prepaidDiscountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                
                {/* Coupon Input */}
                <div className="pt-4 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Gift card or discount code" 
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className="flex-1 bg-white border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 uppercase" 
                    />
                    <button 
                      type="button"
                      onClick={applyCoupon}
                      disabled={isApplyingCoupon || !couponCodeInput.trim()}
                      className="bg-surface-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-surface-800 transition-colors disabled:opacity-50"
                    >
                      {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                  {appliedCoupon && (
                    <div className="flex items-center justify-between bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
                      <span className="font-semibold">{appliedCoupon.code}</span>
                      <div className="flex items-center gap-2">
                        <span>-₹{couponDiscountAmount.toLocaleString("en-IN")}</span>
                        <button type="button" onClick={() => setAppliedCoupon(null)} className="text-green-800 hover:text-green-950 font-bold ml-2">✕</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between font-display text-2xl font-bold text-surface-950 pt-4 border-t border-surface-200 mt-2">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Button
                form="checkout-form"
                type="submit"
                size="lg"
                disabled={status === "submitting" || isServiceable === false}
                className="w-full text-lg shadow-xl shadow-primary-600/20"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" /> Processing...
                  </>
                ) : (
                  `Pay ₹${finalTotal.toLocaleString("en-IN")}`
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
