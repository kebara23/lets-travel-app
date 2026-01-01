"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Palette, 
  Type, 
  Layout, 
  Check,
  RefreshCw,
  Zap,
  Globe
} from "lucide-react";
import { AdminNavigation } from "@/components/shared/admin-navigation";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/use-user-store";

const PRESET_PALETTES = [
  { name: "Awake Soul", primary: "#544356", accent: "#E09F6D", desc: "Plum & Sunset" },
  { name: "Ancestral Jungle", primary: "#14382C", accent: "#C9A24E", desc: "Deep Green & Gold" },
  { name: "Oceanic Flow", primary: "#1A3C34", accent: "#B85C38", desc: "Teal & Terracotta" },
];

export default function IdentitySettingsPage() {
  const { branding, setBranding } = useUserStore();
  const [currentColors, setCurrentColors] = useState({
    primary: branding?.primaryColor || "#544356",
    accent: branding?.accentColor || "#E09F6D"
  });

  const handleApply = () => {
    setBranding({
      primaryColor: currentColors.primary,
      accentColor: currentColors.accent
    });
    // For the demo, we'll reload to apply CSS variables if they're not reactive
    // window.location.reload(); 
  };

  return (
    <div className="min-h-screen bg-awake-paper flex">
      <AdminNavigation />
      
      <main className="flex-1 lg:pl-32 min-w-0">
        <div className="max-w-4xl mx-auto p-8 lg:p-16 space-y-12 animate-in">
          
          <header className="flex justify-between items-end border-b border-awake-violet/10 pb-8">
            <div className="space-y-2">
              <h1 className="text-5xl font-serif text-awake-heading italic">Identity Center</h1>
              <p className="text-awake-body/60 font-sans text-sm uppercase tracking-widest">White-Labeling & Resonance</p>
            </div>
            <button 
              onClick={handleApply}
              className="awake-btn flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Save Identity
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Palette Selection */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-awake-violet/40">
                <Palette className="w-5 h-5" />
                <h3 className="text-xs font-black uppercase tracking-widest">Vibrational Palettes</h3>
              </div>
              
              <div className="space-y-4">
                {PRESET_PALETTES.map(p => (
                  <button
                    key={p.name}
                    onClick={() => setCurrentColors({ primary: p.primary, accent: p.accent })}
                    className={cn(
                      "w-full text-left p-6 awake-card transition-all flex items-center gap-6",
                      currentColors.primary === p.primary ? "border-awake-sunset" : "border-transparent"
                    )}
                  >
                    <div className="flex -space-x-4">
                       <div className="w-12 h-12 rounded-full border-4 border-white shadow-lg" style={{ backgroundColor: p.primary }} />
                       <div className="w-12 h-12 rounded-full border-4 border-white shadow-lg" style={{ backgroundColor: p.accent }} />
                    </div>
                    <div>
                       <p className="font-serif italic text-xl text-awake-heading">{p.name}</p>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-awake-violet/30">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Configuration */}
            <div className="space-y-12">
              <div className="space-y-8">
                <div className="flex items-center gap-3 text-awake-violet/40">
                  <Globe className="w-5 h-5" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Manual Calibration</h3>
                </div>

                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <div className="space-y-1">
                         <p className="text-sm font-bold text-awake-heading">Primary Essence</p>
                         <p className="text-[10px] text-awake-violet/30 font-medium">Buttons, Nav, Headings</p>
                      </div>
                      <input 
                        type="color" 
                        value={currentColors.primary}
                        onChange={e => setCurrentColors({...currentColors, primary: e.target.value})}
                        className="w-12 h-12 rounded-full border-none p-0 overflow-hidden cursor-pointer"
                      />
                   </div>

                   <div className="flex justify-between items-center">
                      <div className="space-y-1">
                         <p className="text-sm font-bold text-awake-heading">Accent Spirit</p>
                         <p className="text-[10px] text-awake-violet/30 font-medium">Gradients, Highlights, SOS</p>
                      </div>
                      <input 
                        type="color" 
                        value={currentColors.accent}
                        onChange={e => setCurrentColors({...currentColors, accent: e.target.value})}
                        className="w-12 h-12 rounded-full border-none p-0 overflow-hidden cursor-pointer"
                      />
                   </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-awake-violet/20">Live Preview</p>
                 <div className="p-8 rounded-sm shadow-2xl space-y-4" style={{ backgroundColor: '#FFFEFA' }}>
                    <div className="h-2 w-full" style={{ background: `linear-gradient(to right, ${currentColors.primary}, ${currentColors.accent})` }} />
                    <h4 className="text-2xl font-serif italic" style={{ color: currentColors.primary }}>Sanctuary View</h4>
                    <button className="w-full py-3 rounded-sm text-[10px] font-black uppercase tracking-widest text-white shadow-lg" style={{ backgroundColor: currentColors.primary }}>
                       Enter Resonance
                    </button>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
