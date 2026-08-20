"use client";

import { useState } from "react";
import { Truck, MapPin, Loader2 } from "lucide-react";

export default function DeliveryEstimate() {
  const [pincode, setPincode] = useState("");
  const [estimate, setEstimate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDelivery = async () => {
    if (pincode.length === 6) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/shipping/calculate?pincode=${pincode}`);
        const data = await res.json();
        
        if (data.serviceable) {
          setEstimate(`Get it by ${data.eta}`);
        } else {
          setEstimate(null);
          setError("Not Serviceable at this Pincode");
        }
      } catch (err) {
        setError("Failed to check delivery estimate");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 mt-6">
      <div className="flex items-start gap-3">
        <Truck className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-surface-900">Delivery Estimate</p>
          
          {estimate ? (
            <div className="mt-2 text-sm text-green-700 font-medium flex flex-col gap-2">
              <span>{estimate}</span>
              <button onClick={() => setEstimate(null)} className="text-xs text-surface-500 underline text-left hover:text-surface-900 w-fit">
                Change Pincode
              </button>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input 
                  type="text" 
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter Pincode" 
                  className="w-full pl-9 pr-3 py-2 border border-surface-300 rounded-lg text-sm focus:border-primary-500 outline-none"
                />
              </div>
              <button 
                onClick={checkDelivery}
                disabled={pincode.length !== 6 || loading}
                className="bg-surface-900 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-surface-800 transition-colors flex items-center justify-center min-w-[70px]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
              </button>
            </div>
          )}
          
          {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
          
          <p className="text-xs text-surface-500 mt-3">Free shipping on orders over ₹999.</p>
        </div>
      </div>
    </div>
  );
}
