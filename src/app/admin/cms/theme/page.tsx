"use client";

import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";

export default function ThemeSettingsPage() {
  const [config, setConfig] = useState({
    primaryColor: "#0f766e",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.5rem",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/theme")
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) setConfig(data);
      });
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/settings/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      alert("Theme settings saved! They will be applied globally.");
    } catch (e) {
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Design System Controls</h1>
          <p className="text-sm text-gray-500 mt-1">Configure global styling, colors, and typography.</p>
        </div>
        <button 
          onClick={saveConfig}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium flex items-center shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-white border rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Brand Color</label>
          <div className="flex items-center gap-3">
            <input 
              type="color" 
              value={config.primaryColor}
              onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
              className="h-10 w-20 cursor-pointer border rounded"
            />
            <input 
              type="text" 
              value={config.primaryColor}
              onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
              className="border rounded p-2 flex-1 max-w-xs font-mono text-sm"
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Font Family</label>
          <select 
            value={config.fontFamily}
            onChange={(e) => setConfig({...config, fontFamily: e.target.value})}
            className="border rounded p-2 w-full max-w-xs"
          >
            <option value="Inter, sans-serif">Inter (Sans Serif)</option>
            <option value="Outfit, sans-serif">Outfit (Modern)</option>
            <option value="Roboto, sans-serif">Roboto (Clean)</option>
            <option value="Merriweather, serif">Merriweather (Serif)</option>
          </select>
        </div>

        <div className="pt-4 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">Global Border Radius</label>
          <select 
            value={config.borderRadius}
            onChange={(e) => setConfig({...config, borderRadius: e.target.value})}
            className="border rounded p-2 w-full max-w-xs"
          >
            <option value="0px">None (Sharp)</option>
            <option value="0.25rem">Small</option>
            <option value="0.5rem">Medium</option>
            <option value="1rem">Large</option>
            <option value="9999px">Full (Pill)</option>
          </select>
        </div>

        {/* Live Preview */}
        <div className="pt-8 border-t">
          <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Live Preview</h3>
          <div 
            className="p-6 border rounded-lg bg-gray-50"
            style={{
              '--color-primary-600': config.primaryColor,
              '--font-display': config.fontFamily,
              '--radius': config.borderRadius,
            } as any}
          >
            <div className="bg-white p-6 shadow-sm mb-4" style={{ borderRadius: 'var(--radius)', fontFamily: 'var(--font-display)' }}>
              <h4 className="text-2xl font-bold mb-2">Typography & Layout</h4>
              <p className="text-gray-600 mb-4">This is how your selected font will look across the storefront.</p>
              <button style={{ backgroundColor: 'var(--color-primary-600)', borderRadius: 'var(--radius)' }} className="text-white px-6 py-2 font-medium">
                Primary Button
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
