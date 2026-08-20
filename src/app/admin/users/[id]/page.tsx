"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isB2B, setIsB2B] = useState(false);
  const [gstin, setGstin] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/users/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setUser(data);
          setIsB2B(data.isB2B);
          setGstin(data.gstin || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resolvedParams.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    
    try {
      const res = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isB2B, gstin }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading user details...</div>;
  if (!user) return <div className="p-8 text-center text-red-500">User not found.</div>;

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name || "Unnamed User"}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-lg font-semibold border-b pb-4 mb-4">B2B & Wholesale Settings</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsB2B(!isB2B)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
                isB2B ? "bg-primary-600" : "bg-gray-200"
              }`}
            >
              <span className="sr-only">Approve B2B Wholesale</span>
              <span
                aria-hidden="true"
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isB2B ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <div>
              <label className="text-sm font-medium text-gray-900 block">Approve B2B Wholesale Pricing</label>
              <p className="text-xs text-gray-500">Allows user to see and purchase at wholesale prices (subject to minimum order value).</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN Number</label>
            <input
              type="text"
              className="w-full max-w-md border rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g. 29ABCDE1234F1Z5"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
            />
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
            {success && (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
