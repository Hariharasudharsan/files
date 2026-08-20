"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { createShippingZone } from "../actions";

export default function NewShippingZonePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    estimatedDays: "",
    rate: 0,
    isServiceable: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createShippingZone(form);
      router.push("/admin/shipping");
    } catch (error) {
      console.error(error);
      alert("Failed to create zone");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/shipping" className="text-surface-500 hover:text-surface-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-950">New Shipping Zone</h1>
          <p className="text-surface-500 text-sm mt-1">Create a new delivery zone</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-surface-200 p-6 space-y-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-surface-900 mb-1">Zone Name</label>
            <input 
              type="text" 
              required
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border border-surface-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary-500"
              placeholder="e.g. South India Express"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-900 mb-1">Estimated Delivery Time</label>
            <input 
              type="text" 
              required
              value={form.estimatedDays}
              onChange={e => setForm({...form, estimatedDays: e.target.value})}
              className="w-full border border-surface-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary-500"
              placeholder="e.g. 1-2 business days"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-900 mb-1">Base Shipping Rate (₹)</label>
            <input 
              type="number" 
              min={0}
              required
              value={form.rate}
              onChange={e => setForm({...form, rate: Number(e.target.value)})}
              className="w-full border border-surface-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input 
              type="checkbox"
              checked={form.isServiceable}
              onChange={e => setForm({...form, isServiceable: e.target.checked})}
              className="w-4 h-4 text-primary-600 rounded border-surface-300 focus:ring-primary-600"
            />
            <span className="text-sm font-semibold text-surface-900">Zone is currently serviceable</span>
          </label>
        </div>

        <div className="pt-4 border-t border-surface-100 flex justify-end gap-3">
          <Link href="/admin/shipping">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Create Zone
          </Button>
        </div>
      </form>
    </div>
  );
}
