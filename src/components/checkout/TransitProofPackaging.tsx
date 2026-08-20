"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Package } from "lucide-react";

interface PackagingConfig {
  packagingEnabled: boolean;
  packagingTitle: string;
  packagingCopy: string;
  packagingImage: string;
}

const DEFAULTS: PackagingConfig = {
  packagingEnabled: true,
  packagingTitle: "Transit-Proof Packaging",
  packagingCopy: "Your order arrives in multi-layered corrugated boxes with air-cushioning for maximum protection.",
  packagingImage: "/images/packaging-demo.jpg",
};

export function TransitProofPackaging() {
  const [config, setConfig] = useState<PackagingConfig | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/storefront/theme")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setConfig({
            packagingEnabled: data.packagingEnabled ?? DEFAULTS.packagingEnabled,
            packagingTitle: data.packagingTitle || DEFAULTS.packagingTitle,
            packagingCopy: data.packagingCopy || DEFAULTS.packagingCopy,
            packagingImage: data.packagingImage || DEFAULTS.packagingImage,
          });
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Use defaults on error so the section still renders
          setConfig(DEFAULTS);
          setLoaded(true);
        }
      });
    return () => { cancelled = true; };
  }, []);

  // Don't render until we know the config; if disabled, render nothing
  if (!loaded || !config) return null;
  if (!config.packagingEnabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="my-8 bg-[var(--theme-base)] rounded-[var(--theme-radius)] overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row"
    >
      <div className="md:w-1/2 bg-gray-200 relative min-h-[250px]">
        {/* Fallback icon if image is missing/broken */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <Package className="w-16 h-16 opacity-50" />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={config.packagingImage} 
          alt="Transit proof packaging" 
          className="absolute inset-0 w-full h-full object-cover z-10"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-3 text-[var(--theme-brand-deep)]">
          <ShieldCheck className="w-6 h-6" />
          <h3 className="text-xl font-bold font-[family-name:var(--theme-font-display)]">{config.packagingTitle}</h3>
        </div>
        <p className="text-gray-700 leading-relaxed text-sm md:text-base">
          {config.packagingCopy}
        </p>
      </div>
    </motion.div>
  );
}
