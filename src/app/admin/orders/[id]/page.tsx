"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const STATUSES = [
  "DRAFT", "PENDING", "AWAITING_PAYMENT", "AUTHORIZED", "PAID", 
  "CONFIRMED", "PACKED", "READY_TO_SHIP", "SHIPPED", "DELIVERED", 
  "CANCELLED", "RETURNED", "REFUNDED", "EXPIRED"
];

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("PENDING");

  // In a real app, you would fetch the order details here.
  // For MVP, we'll just show the status update form.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/orders/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update order status");
      }

      router.push("/admin/orders");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="p-2 hover:bg-surface-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-surface-600" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Order {resolvedParams.id.slice(0,8)}</h1>
          <p className="text-surface-500 mt-1">Manage order fulfillment and status.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-surface-900">Order Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/orders">
            <Button type="button" variant="outline" className="px-6">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="px-8 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Update Status
          </Button>
        </div>
      </form>
    </div>
  );
}
