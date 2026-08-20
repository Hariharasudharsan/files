"use client";

import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";

export default function ThemeSettingsPage() {
  const [config, setConfig] = useState({
    brandDeep: "#3368A0",
    brandMid: "#66A3BF",
    brandTint: "#C8DFDB",
    baseBg: "#F2EFE7",
    accentFry: "#C97A2B",
    fontFamily: "var(--font-fraunces)",
    borderRadius: "0.5rem",
    packagingEnabled: true,
    packagingTitle: "Transit-Proof Packaging",
    packagingCopy: "Your order arrives in multi-layered corrugated boxes with air-cushioning for maximum protection.",
    packagingImage: "/images/packaging-demo.jpg",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/theme")
      .then(res => res.json())
      .then(data => {
        if (data && !data.error && Object.keys(data).length > 0) {
          // Merge with defaults so old DB entries missing new fields don't break the UI
          setConfig(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => { /* keep defaults */ });
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Deep (Primary)</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={config.brandDeep}
                onChange={(e) => setConfig({...config, brandDeep: e.target.value})}
                className="h-10 w-20 cursor-pointer border rounded"
              />
              <input 
                type="text" 
                value={config.brandDeep}
                onChange={(e) => setConfig({...config, brandDeep: e.target.value})}
                className="border rounded p-2 flex-1 font-mono text-sm uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Mid (Secondary)</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={config.brandMid}
                onChange={(e) => setConfig({...config, brandMid: e.target.value})}
                className="h-10 w-20 cursor-pointer border rounded"
              />
              <input 
                type="text" 
                value={config.brandMid}
                onChange={(e) => setConfig({...config, brandMid: e.target.value})}
                className="border rounded p-2 flex-1 font-mono text-sm uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Tint (Backgrounds/Borders)</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={config.brandTint}
                onChange={(e) => setConfig({...config, brandTint: e.target.value})}
                className="h-10 w-20 cursor-pointer border rounded"
              />
              <input 
                type="text" 
                value={config.brandTint}
                onChange={(e) => setConfig({...config, brandTint: e.target.value})}
                className="border rounded p-2 flex-1 font-mono text-sm uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Background (Paper tone)</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={config.baseBg}
                onChange={(e) => setConfig({...config, baseBg: e.target.value})}
                className="h-10 w-20 cursor-pointer border rounded"
              />
              <input 
                type="text" 
                value={config.baseBg}
                onChange={(e) => setConfig({...config, baseBg: e.target.value})}
                className="border rounded p-2 flex-1 font-mono text-sm uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Accent Fry (CTAs/Price)</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={config.accentFry}
                onChange={(e) => setConfig({...config, accentFry: e.target.value})}
                className="h-10 w-20 cursor-pointer border rounded"
              />
              <input 
                type="text" 
                value={config.accentFry}
                onChange={(e) => setConfig({...config, accentFry: e.target.value})}
                className="border rounded p-2 flex-1 font-mono text-sm uppercase"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Font Family</label>
          <select 
            value={config.fontFamily}
            onChange={(e) => setConfig({...config, fontFamily: e.target.value})}
            className="border rounded p-2 w-full max-w-xs"
          >
            <option value="var(--font-fraunces)">Fraunces (Display Serif)</option>
            <option value="var(--font-inter)">Inter (Sans Serif)</option>
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

        <div className="pt-8 border-t">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transit-Proof Packaging Section</h2>
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="packagingEnabled"
                checked={config.packagingEnabled}
                onChange={(e) => setConfig({...config, packagingEnabled: e.target.checked})}
                className="w-4 h-4 text-primary-600 rounded border-gray-300"
              />
              <label htmlFor="packagingEnabled" className="text-sm font-medium text-gray-700">Enable Packaging Section</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
              <input 
                type="text" 
                value={config.packagingTitle}
                onChange={(e) => setConfig({...config, packagingTitle: e.target.value})}
                className="border rounded p-2 w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description Copy</label>
              <textarea 
                value={config.packagingCopy}
                onChange={(e) => setConfig({...config, packagingCopy: e.target.value})}
                className="border rounded p-2 w-full h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input 
                type="text" 
                value={config.packagingImage}
                onChange={(e) => setConfig({...config, packagingImage: e.target.value})}
                className="border rounded p-2 w-full"
                placeholder="/images/packaging.jpg"
              />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="pt-8 border-t">
          <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Live Preview</h3>
          <div 
            className="p-6 border rounded-lg bg-gray-50"
            style={{
              '--color-brand-deep': config.brandDeep,
              '--color-brand-mid': config.brandMid,
              '--color-brand-tint': config.brandTint,
              '--color-base': config.baseBg,
              '--color-accent-fry': config.accentFry,
              '--font-display': config.fontFamily,
              '--radius': config.borderRadius,
            } as any}
          >
            <div className="p-6 shadow-sm mb-4" style={{ backgroundColor: 'var(--color-base)', borderRadius: 'var(--radius)', fontFamily: 'var(--font-display)', color: 'var(--color-brand-deep)' }}>
              <h4 className="text-2xl font-bold mb-2">Typography & Layout</h4>
              <p className="mb-4" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-brand-mid)' }}>This is how your selected font and colors will look across the storefront.</p>
              <button style={{ backgroundColor: 'var(--color-accent-fry)', borderRadius: 'var(--radius)' }} className="text-white px-6 py-2 font-medium">
                Primary Button
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
