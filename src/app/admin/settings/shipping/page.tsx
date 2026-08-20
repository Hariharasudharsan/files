"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ShippingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    freeShippingThreshold: 500,
    flatRate: 50,
    shippingZones: "Domestic India"
  });

  useEffect(() => {
    fetch("/api/admin/settings/shipping")
      .then(res => res.json())
      .then(data => {
        if (data.config) {
          setConfig(data.config);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        alert("Shipping configuration saved!");
      } else {
        alert("Failed to save shipping configuration");
      }
    } catch (e) {
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold text-surface-950">Shipping Configuration</h1>
        <p className="text-surface-500 mt-1">Manage domestic shipping rates and free shipping thresholds.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-surface-500" /> Domestic Rates (India)
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-900">Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={config.freeShippingThreshold}
                  onChange={(e) => setConfig({...config, freeShippingThreshold: Number(e.target.value)})}
                  className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <p className="text-xs text-surface-500">Orders above this amount get free shipping.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-900">Flat Rate Shipping (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={config.flatRate}
                  onChange={(e) => setConfig({...config, flatRate: Number(e.target.value)})}
                  className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <p className="text-xs text-surface-500">Cost applied to orders below the free threshold.</p>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-surface-100">
              <label className="text-sm font-semibold text-surface-900">Active Shipping Zones</label>
              <input
                type="text"
                disabled
                value={config.shippingZones}
                className="w-full rounded-xl border border-surface-300 bg-surface-50 px-4 py-2 text-surface-500 cursor-not-allowed"
              />
              <p className="text-xs text-surface-500">International shipping is currently paused. Only domestic shipping is supported.</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-surface-100 flex justify-end">
          <Button type="submit" disabled={saving} className="flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Shipping Rules
          </Button>
        </div>
      </form>
    </div>
  );
}
