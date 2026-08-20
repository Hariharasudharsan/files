"use client";

import React, { useState } from "react";
import { Truck, MapPin, Loader2, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ShippingCalculator() {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{serviceable: boolean, rate?: number, eta?: string} | null>(null);
  const [error, setError] = useState("");

  const calculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pincode || pincode.length !== 6) {
      setError("Please enter a valid 6-digit Indian pincode.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/shipping/calculate?pincode=${pincode}`);
      const data = await res.json();
      if (!res.ok && !data.serviceable && !data.error) throw new Error("Failed to calculate");
      setResult(data);
    } catch (err) {
      setError("Could not fetch shipping details for this pincode.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-50 border border-surface-200 rounded-xl p-5 mt-6 max-w-sm w-full">
      <div className="flex items-center gap-2 mb-3 text-surface-900">
        <Truck className="w-5 h-5 text-primary-600" />
        <h4 className="font-semibold text-sm">Delivery Estimate</h4>
      </div>
      
      <form onSubmit={calculate} className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input 
            type="text" 
            placeholder="Enter Pincode"
            aria-label="Enter 6-digit pincode for delivery estimate"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="w-full pl-9 pr-3 py-2 text-sm border border-surface-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <Button type="submit" disabled={loading || pincode.length !== 6} className="shrink-0" size="sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
        </Button>
      </form>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      
      {result && (
        <div className="mt-3 text-sm bg-white p-3 rounded border border-surface-100 flex flex-col gap-2">
          {result.serviceable ? (
            <>
              <div className="flex items-center gap-1.5 text-green-700 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Serviceable
              </div>
              <div className="flex justify-between border-t border-surface-100 pt-2 mt-1">
                <span className="text-surface-600">Standard Delivery:</span>
                <span className="font-semibold text-surface-900">{result.eta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600">Shipping Fee:</span>
                <span className="font-semibold text-surface-900">
                  {result.rate === 0 ? <span className="text-green-600">FREE</span> : `₹${result.rate}`}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-red-600 font-medium">
              <XCircle className="w-4 h-4" /> Not Serviceable at this Pincode
            </div>
          )}
        </div>
      )}
    </div>
  );
}
