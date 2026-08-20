"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Globe } from "lucide-react";

interface Dictionary {
  [key: string]: string;
}

export default function TranslationsSettingsPage() {
  const [locale, setLocale] = useState("hi");
  const [dictionary, setDictionary] = useState<Dictionary>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    const fetchTranslations = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/settings/translations?locale=${locale}`);
        const data = await res.json();
        if (data.translations) {
          setDictionary(data.translations);
        } else {
          setDictionary({});
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchTranslations();
  }, [locale]);

  const saveTranslations = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/settings/translations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, translations: dictionary }),
      });
      alert('Translations saved successfully!');
    } catch (e) {
      alert('Failed to save translations.');
    }
    setSaving(false);
  };

  const handleUpdate = (key: string, val: string) => {
    setDictionary((prev) => ({ ...prev, [key]: val }));
  };

  const handleDelete = (key: string) => {
    const newDict = { ...dictionary };
    delete newDict[key];
    setDictionary(newDict);
  };

  const handleAdd = () => {
    if (!newKey) return;
    setDictionary((prev) => ({ ...prev, [newKey]: newValue }));
    setNewKey("");
    setNewValue("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-deep">Translations</h1>
          <p className="text-sm text-brand-deep/60">Manage regional language dictionaries for the storefront.</p>
        </div>
        <button
          onClick={saveTranslations}
          disabled={saving}
          className="flex items-center gap-2 bg-accent-fry text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-fry/90 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brand-tint p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-brand-tint pb-6">
          <Globe className="w-5 h-5 text-brand-deep" />
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:border-brand-mid focus:ring-brand-mid text-sm"
          >
            <option value="hi">Hindi (hi)</option>
            <option value="ta">Tamil (ta)</option>
          </select>
          <span className="text-sm text-gray-500">
            Note: English (en) is the default base language embedded in the code.
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading translations...</div>
        ) : (
          <div className="space-y-4">
            <div className="bg-surface-50 p-4 rounded-lg flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Translation Key</label>
                <input
                  type="text"
                  placeholder="e.g. nav.home"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Translation Value ({locale})</label>
                <input
                  type="text"
                  placeholder="e.g. मुख्य पृष्ठ"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                />
              </div>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-brand-deep text-white px-4 py-2 rounded-md hover:bg-brand-mid"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(dictionary).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        No translations found for {locale}.
                      </td>
                    </tr>
                  ) : (
                    Object.entries(dictionary).map(([key, val]) => (
                      <tr key={key}>
                        <td className="px-6 py-2 font-mono text-xs text-gray-600">{key}</td>
                        <td className="px-6 py-2">
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => handleUpdate(key, e.target.value)}
                            className="w-full border-transparent focus:border-brand-mid focus:ring-0 rounded-md text-sm"
                          />
                        </td>
                        <td className="px-6 py-2 text-right">
                          <button
                            onClick={() => handleDelete(key)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
