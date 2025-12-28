"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/use-user-store";

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const branding = useUserStore((state) => state.branding);

  useEffect(() => {
    if (branding) {
      const root = document.documentElement;
      
      // Inject primary color
      if (branding.primary_color) {
        root.style.setProperty("--primary", hexToHsl(branding.primary_color));
      }
      
      // Inject accent/gold color
      if (branding.accent_color) {
        root.style.setProperty("--accent", hexToHsl(branding.accent_color));
      }

      // Inject background color
      if (branding.bg_color) {
        root.style.setProperty("--background", hexToHsl(branding.bg_color));
      }
    }
  }, [branding]);

  return <>{children}</>;
}

/**
 * Helper to convert HEX to HSL for Tailwind CSS variables
 * Tailwind expects HSL values without the hsl() wrapper: "h s% l%"
 */
function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}



