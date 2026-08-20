"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditBundlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    size: 2,
    price: 0,
    isActive: true
  });

  useEffect(() => {
    fetch(`/api/admin/bundles/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.bundle) {
          setFormData({
            name: data.bundle.name || "",
            description: data.bundle.description || "",
            size: data.bundle.size || 2,
            price: data.bundle.price || 0,
            isActive: data.bundle.isActive ?? true
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bundles/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        router.push("/admin/bundles");
        router.refresh();
      } else {
        alert("Failed to update bundle");
      }
    } catch (e) {
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/bundles" className="p-2 hover:bg-surface-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-surface-600" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-950">Edit Bundle</h1>
          <p className="text-surface-500 mt-1">Configure variety bundle rule.</p>
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
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-900 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-lg border border-surface-300 p-2 focus:ring-primary-500 focus:border-primary-500"
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
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Update Bundle"}
          </button>
        </div>
      </form>
    </div>
  );
}
