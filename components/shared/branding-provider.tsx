"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useUserStore } from "@/store/use-user-store";

interface BrandingContextType {
  primaryColor: string;
  accentColor: string;
}

const BrandingContext = createContext<BrandingContextType>({
  primaryColor: "#544356", // Default Awake Soul Violet
  accentColor: "#E09F6D",  // Default Awake Soul Sunset
});

export const useBranding = () => useContext(BrandingContext);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { branding } = useUserStore();

  const value = {
    primaryColor: branding?.primaryColor || "#544356",
    accentColor: branding?.accentColor || "#E09F6D",
  };

  return (
    <BrandingContext.Provider value={value}>
      <div 
        style={{ 
          // @ts-ignore
          "--awake-violet": value.primaryColor,
          "--awake-sunset": value.accentColor,
        }}
      >
        {children}
      </div>
    </BrandingContext.Provider>
  );
}
