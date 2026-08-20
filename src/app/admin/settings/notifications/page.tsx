"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2 } from "lucide-react";

export default function NotificationTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", type: "WHATSAPP", subject: "", body: "", isActive: true });

  const fetchTemplates = useCallback(async () => {
    const res = await fetch("/api/admin/settings/notifications");
    if (res.ok) {
      return await res.json();
    }
    return null;
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchTemplates().then((data) => {
      if (mounted && data) setTemplates(data);
    });
    return () => {
      mounted = false;
    };
  }, [fetchTemplates]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: "", type: "WHATSAPP", subject: "", body: "", isActive: true });
    setShowModal(true);
  };

  const openEditModal = (tpl: any) => {
    setEditingId(tpl.id);
    setFormData({
      name: tpl.name,
      type: tpl.type,
      subject: tpl.subject || "",
      body: tpl.body,
      isActive: tpl.isActive,
    });
    setShowModal(true);
  };

  const saveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch("/api/admin/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...formData }),
      });
    } else {
      await fetch("/api/admin/settings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }
    setShowModal(false);
    const data = await fetchTemplates();
    if (data) setTemplates(data);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notification Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Manage message templates for WhatsApp, Email, etc.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium flex items-center shadow-sm hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </button>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-900">Name / Type</th>
              <th className="px-6 py-4 font-medium text-gray-900">Body Preview</th>
              <th className="px-6 py-4 font-medium text-gray-900 text-right">Status</th>
              <th className="px-6 py-4 font-medium text-gray-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {templates.map((tpl) => (
              <tr key={tpl.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{tpl.name}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                    {tpl.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  <p className="truncate max-w-xs">{tpl.body}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tpl.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {tpl.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEditModal(tpl)} className="text-gray-400 hover:text-gray-900">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No notification templates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Template' : 'Create Template'}</h2>
            <form onSubmit={saveTemplate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name (Internal ID)</label>
                <input required disabled={!!editingId} type="text" className="w-full border rounded p-2 disabled:bg-gray-100" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. whatsapp_order_shipped" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="w-full border rounded p-2" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <div className="flex items-center mt-2">
                    <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="mr-2" />
                    <label htmlFor="isActive">Active</label>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject (Optional)</label>
                <input type="text" className="w-full border rounded p-2" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} placeholder="For emails" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Body</label>
                <textarea required className="w-full border rounded p-2 h-32" value={formData.body} onChange={(e) => setFormData({...formData, body: e.target.value})} placeholder="Hi {{1}}, your order {{2}} has shipped." />
                <p className="text-xs text-gray-500 mt-1">For WhatsApp, match the exact body of your approved Meta template.</p>
              </div>
              
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
