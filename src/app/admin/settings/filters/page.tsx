"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Filter } from "lucide-react";

interface FilterConfig {
  spiceLevel: string[];
  dietType: string[];
  region: string[];
  mealPairing: string[];
}

export default function FiltersSettingsPage() {
  const [config, setConfig] = useState<FilterConfig>({
    spiceLevel: [],
    dietType: [],
    region: [],
    mealPairing: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newOptions, setNewOptions] = useState<Record<keyof FilterConfig, string>>({
    spiceLevel: "",
    dietType: "",
    region: "",
    mealPairing: ""
  });

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/settings/filters`);
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/settings/filters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      alert('Filter configuration saved successfully!');
    } catch (e) {
      alert('Failed to save configuration.');
    }
    setSaving(false);
  };

  const handleAdd = (key: keyof FilterConfig) => {
    const val = newOptions[key].trim();
    if (!val || config[key].includes(val)) return;
    
    setConfig(prev => ({
      ...prev,
      [key]: [...prev[key], val]
    }));
    
    setNewOptions(prev => ({ ...prev, [key]: "" }));
  };

  const handleRemove = (key: keyof FilterConfig, valToRemove: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: prev[key].filter(v => v !== valToRemove)
    }));
  };

  const renderSection = (title: string, key: keyof FilterConfig) => (
    <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6 space-y-4">
      <h2 className="text-lg font-bold text-surface-900 border-b border-surface-100 pb-2">{title}</h2>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {config[key]?.map((opt) => (
          <div key={opt} className="flex items-center gap-2 bg-surface-100 px-3 py-1.5 rounded-md border border-surface-200">
            <span className="text-sm font-medium text-surface-800">{opt}</span>
            <button onClick={() => handleRemove(key, opt)} className="text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {(!config[key] || config[key].length === 0) && (
          <span className="text-sm text-surface-400 py-1.5">No options configured.</span>
        )}
      </div>

      <div className="flex gap-2 max-w-sm">
        <input
          type="text"
          placeholder={`Add new ${title.toLowerCase()}`}
          value={newOptions[key]}
          onChange={(e) => setNewOptions(prev => ({ ...prev, [key]: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd(key)}
          className="flex-1 rounded-md border-surface-300 shadow-sm text-sm focus:border-primary-500 focus:ring-primary-500"
        />
        <button
          onClick={() => handleAdd(key)}
          className="bg-surface-800 text-white px-3 py-2 rounded-md hover:bg-surface-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <div className="p-8 text-center text-surface-500">Loading configuration...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-deep flex items-center gap-2">
            <Filter className="w-6 h-6" /> Storefront Filters
          </h1>
          <p className="text-sm text-brand-deep/60">Configure the allowed values for dynamic product filters.</p>
        </div>
        <button
          onClick={saveConfig}
          disabled={saving}
          className="flex items-center gap-2 bg-accent-fry text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-fry/90 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSection("Spice Level", "spiceLevel")}
        {renderSection("Diet Type", "dietType")}
        {renderSection("Region", "region")}
        {renderSection("Meal Pairing", "mealPairing")}
      </div>
    </div>
  );
}
