"use client";

import React, { useEffect } from "react";

interface ThemeConfig {
  primaryColor?: string;
  fontFamily?: string;
  borderRadius?: string;
}

export function ThemeInjector({ config }: { config?: ThemeConfig }) {
  useEffect(() => {
    if (!config) return;
    
    const root = document.documentElement;
    
    if (config.primaryColor) {
      // Very naive implementation. A real system would generate shades (50-950)
      root.style.setProperty("--color-primary-600", config.primaryColor);
    }
    
    if (config.fontFamily) {
      root.style.setProperty("--font-display", config.fontFamily);
    }
    
    if (config.borderRadius) {
      root.style.setProperty("--radius", config.borderRadius);
    }
  }, [config]);

  return null;
}
