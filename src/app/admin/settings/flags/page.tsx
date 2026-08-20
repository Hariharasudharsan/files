"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2 } from "lucide-react";

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ key: "", name: "", description: "", isEnabled: false, rules: "" });

  const fetchFlagsData = useCallback(async () => {
    const res = await fetch("/api/admin/settings/flags");
    if (res.ok) {
      return await res.json();
    }
    return null;
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchFlagsData().then((data) => {
      if (mounted && data) setFlags(data);
    });
    return () => {
      mounted = false;
    };
  }, [fetchFlagsData]);

  const toggleFlag = async (id: string, currentVal: boolean) => {
    await fetch("/api/admin/settings/flags", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isEnabled: !currentVal }),
    });
    const data = await fetchFlagsData();
    if (data) setFlags(data);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ key: "", name: "", description: "", isEnabled: false, rules: "" });
    setShowModal(true);
  };

  const openEditModal = (flag: any) => {
    setEditingId(flag.id);
    setFormData({
      key: flag.key,
      name: flag.name,
      description: flag.description || "",
      isEnabled: flag.isEnabled,
      rules: flag.rules ? JSON.stringify(flag.rules, null, 2) : "",
    });
    setShowModal(true);
  };

  const saveFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    let parsedRules = null;
    if (formData.rules.trim()) {
      try {
        parsedRules = JSON.parse(formData.rules);
      } catch (err) {
        alert("Invalid JSON in rules.");
        return;
      }
    }

    if (editingId) {
      await fetch("/api/admin/settings/flags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, isEnabled: formData.isEnabled, rules: parsedRules }),
      });
    } else {
      await fetch("/api/admin/settings/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, rules: parsedRules }),
      });
    }
    
    setShowModal(false);
    const data = await fetchFlagsData();
    if (data) setFlags(data);
  };

  const filteredFlags = flags.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Feature Flags</h1>
          <p className="text-sm text-gray-500 mt-1">Safely toggle features on and off for the storefront.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium flex items-center shadow-sm hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Flag
        </button>
      </div>

      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Search flags by name or key..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-900">Name / Key</th>
              <th className="px-6 py-4 font-medium text-gray-900">Description</th>
              <th className="px-6 py-4 font-medium text-gray-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredFlags.map((flag) => (
              <tr key={flag.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{flag.name}</p>
                  <code className="text-xs text-gray-500 mt-1">{flag.key}</code>
                </td>
                <td className="px-6 py-4 text-gray-600">{flag.description}</td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-4">
                  <button onClick={() => openEditModal(flag)} className="text-gray-400 hover:text-gray-900">
                    <Edit2 className="w-4 h-4" />
                  </button>
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
            {filteredFlags.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                  No feature flags found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Feature Flag' : 'Create Feature Flag'}</h2>
            <form onSubmit={saveFlag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required type="text" className="w-full border rounded p-2" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. New Checkout Flow" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Key (Code Reference)</label>
                <input required disabled={!!editingId} type="text" className="w-full border rounded p-2 font-mono disabled:bg-gray-100" value={formData.key} onChange={(e) => setFormData({...formData, key: e.target.value})} placeholder="e.g. new_checkout_flow" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full border rounded p-2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rules (JSON)</label>
                <textarea className="w-full border rounded p-2 font-mono text-sm h-32" value={formData.rules} onChange={(e) => setFormData({...formData, rules: e.target.value})} placeholder='{"percentage": 5}' />
                <p className="text-xs text-gray-500 mt-1">Optional configuration data for the feature.</p>
              </div>
              {!editingId && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isEnabled" checked={formData.isEnabled} onChange={(e) => setFormData({...formData, isEnabled: e.target.checked})} />
                  <label htmlFor="isEnabled" className="text-sm font-medium">Enable immediately</label>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
