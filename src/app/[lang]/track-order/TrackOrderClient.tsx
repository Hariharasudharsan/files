"use client";

import { useState } from "react";
import { Search, Package, CheckCircle2, Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function TrackOrderClient() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [orderData, setOrderData] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/v1/orders/track?orderId=${orderId}&email=${email}`);
      if (!res.ok) {
        throw new Error("Order not found or invalid email");
      }
      const data = await res.json();
      setOrderData(data.order);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Order tracking failed");
    }
  };

  return (
    <div className="bg-surface-50 min-h-screen py-16">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-surface-950 mb-4">Track Your Order</h1>
          <p className="text-surface-900/70 text-lg">Enter your order ID and email to see the real-time status of your shipment.</p>
        </div>

        <div className="glass p-8 rounded-3xl border border-surface-200 mb-12 shadow-sm">
          <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="orderId" className="sr-only">Order ID</label>
              <input
                id="orderId"
                type="text"
                placeholder="Order ID (e.g. ord_123)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-3 text-surface-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="email" className="sr-only">Email (Optional)</label>
              <input
                id="email"
                type="email"
                placeholder="Email address (Optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-3 text-surface-950 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-1">
              <Button type="submit" className="w-full h-full min-h-[48px]" disabled={status === "loading"}>
                {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : <Search className="h-5 w-5 mx-auto" />}
              </Button>
            </div>
          </form>
          {status === "error" && (
            <p className="mt-4 text-center text-red-600 font-medium">{errorMsg}</p>
          )}
        </div>

        {status === "success" && orderData && (
          <div className="glass p-8 rounded-3xl border border-surface-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-8 border-b border-surface-200 gap-4">
              <div>
                <h2 className="text-2xl font-bold font-display text-surface-950 mb-1">Order #{orderData.id.slice(-8)}</h2>
                <p className="text-surface-900/60">Placed on {new Date(orderData.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 font-semibold border border-primary-100">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                {orderData.status}
              </div>
            </div>

            <div className="relative mb-12">
              <div className="absolute left-0 top-1/2 w-full h-1 bg-surface-200 -translate-y-1/2 rounded-full z-0 hidden sm:block"></div>
              
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-4 gap-8 sm:gap-0">
                <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 text-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${orderData.status !== "PENDING" ? "bg-green-500 text-white shadow-lg shadow-green-500/30" : "bg-primary-500 text-white shadow-lg shadow-primary-500/30"}`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-surface-950">Order Placed</span>
                </div>
                
                <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 text-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${orderData.paymentStatus === "PAID" ? "bg-green-500 text-white shadow-lg shadow-green-500/30" : "bg-surface-200 text-surface-400"}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className={`font-semibold ${orderData.paymentStatus === "PAID" ? "text-surface-950" : "text-surface-400"}`}>Payment Confirmed</span>
                </div>
                
                <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 text-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${orderData.fulfillmentStatus === "SHIPPED" || orderData.fulfillmentStatus === "DELIVERED" ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30" : "bg-surface-200 text-surface-400"}`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className={`font-semibold ${orderData.fulfillmentStatus === "SHIPPED" || orderData.fulfillmentStatus === "DELIVERED" ? "text-surface-950" : "text-surface-400"}`}>Shipped</span>
                </div>
                
                <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 text-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${orderData.fulfillmentStatus === "DELIVERED" ? "bg-green-500 text-white shadow-lg shadow-green-500/30" : "bg-surface-200 text-surface-400"}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className={`font-semibold ${orderData.fulfillmentStatus === "DELIVERED" ? "text-surface-950" : "text-surface-400"}`}>Delivered</span>
                </div>
              </div>
            </div>

            {orderData.shipments && orderData.shipments.length > 0 && (
              <div className="bg-surface-100 rounded-2xl p-6">
                <h3 className="font-semibold text-lg text-surface-950 mb-3">Shipping Details</h3>
                <div className="space-y-3">
                  {orderData.shipments.map((shipment: any) => (
                    <div key={shipment.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-surface-200 shadow-sm">
                      <div>
                        <p className="font-medium text-surface-950">Courier: {shipment.courier || "Standard Shipping"}</p>
                        <p className="text-sm text-surface-900/60 font-mono mt-1">Tracking Code: {shipment.trackingCode}</p>
                      </div>
                      <span className="px-3 py-1 bg-surface-100 text-surface-900 text-xs font-bold uppercase tracking-wider rounded-lg">
                        {shipment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
