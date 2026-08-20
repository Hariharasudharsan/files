"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewBundlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    size: 2,
    price: 0,
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        router.push("/admin/bundles");
        router.refresh();
      } else {
        alert("Failed to create bundle");
      }
    } catch (e) {
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/bundles" className="p-2 hover:bg-surface-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-surface-600" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-950">Create Bundle</h1>
          <p className="text-surface-500 mt-1">Configure a new variety bundle rule.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-surface-200 shadow-sm p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-surface-900 mb-2">Bundle Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full rounded-lg border border-surface-300 p-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g. 5-Pack Special"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-900 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-lg border border-surface-300 p-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-surface-900 mb-2">Bundle Size (Items)</label>
              <input
                type="number"
                min="2"
                required
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: parseInt(e.target.value)})}
                className="w-full rounded-lg border border-surface-300 p-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-900 mb-2">Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                className="w-full rounded-lg border border-surface-300 p-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-surface-900">Active</label>
          </div>
        </div>

        <div className="pt-6 border-t flex justify-end gap-4">
          <Link href="/admin/bundles" className="px-4 py-2 border rounded-md font-medium hover:bg-surface-50 transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-primary-600 text-white px-6 py-2 rounded-md font-medium hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Create Bundle"}
          </button>
        </div>
      </form>
    </div>
  );
}
