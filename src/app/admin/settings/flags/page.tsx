"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newFlag, setNewFlag] = useState({ key: "", name: "", description: "", isEnabled: false });

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    const res = await fetch("/api/admin/settings/flags");
    if (res.ok) setFlags(await res.json());
  };

  const toggleFlag = async (id: string, currentVal: boolean) => {
    await fetch("/api/admin/settings/flags", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isEnabled: !currentVal }),
    });
    fetchFlags();
  };

  const createFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/settings/flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFlag),
    });
    setShowModal(false);
    setNewFlag({ key: "", name: "", description: "", isEnabled: false });
    fetchFlags();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Feature Flags</h1>
          <p className="text-sm text-gray-500 mt-1">Safely toggle features on and off for the storefront.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Flag
        </button>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-900">Name / Key</th>
              <th className="px-6 py-4 font-medium text-gray-900">Description</th>
              <th className="px-6 py-4 font-medium text-gray-900 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {flags.map((flag) => (
              <tr key={flag.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{flag.name}</p>
                  <code className="text-xs text-gray-500 mt-1">{flag.key}</code>
                </td>
                <td className="px-6 py-4 text-gray-600">{flag.description}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => toggleFlag(flag.id, flag.isEnabled)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
                      flag.isEnabled ? "bg-primary-600" : "bg-gray-200"
                    }`}
                  >
                    <span className="sr-only">Use setting</span>
                    <span
                      aria-hidden="true"
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        flag.isEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
            {flags.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                  No feature flags found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Basic Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Create Feature Flag</h2>
            <form onSubmit={createFlag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required type="text" className="w-full border rounded p-2" value={newFlag.name} onChange={(e) => setNewFlag({...newFlag, name: e.target.value})} placeholder="e.g. New Checkout Flow" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Key (Code Reference)</label>
                <input required type="text" className="w-full border rounded p-2 font-mono" value={newFlag.key} onChange={(e) => setNewFlag({...newFlag, key: e.target.value})} placeholder="e.g. new_checkout_flow" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full border rounded p-2" value={newFlag.description} onChange={(e) => setNewFlag({...newFlag, description: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
