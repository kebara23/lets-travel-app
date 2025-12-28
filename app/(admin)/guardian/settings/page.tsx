"use client";

import React, { useState } from "react";
import { 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Save, 
  RotateCcw,
  Sparkles,
  Layout
} from "lucide-react";
import { AdminNavigation } from "@/components/shared/admin-navigation";
import { useUserStore } from "@/store/use-user-store";
import { cn } from "@/lib/utils";

export default function BrandingSettingsPage() {
  const { branding, setBranding, organization } = useUserStore();
  
  // Local state for the editor
  const [localBranding, setLocalBranding] = useState(branding || {
    primary_color: "#1B4734",
    accent_color: "#C9A24E",
    bg_color: "#F5EFE6",
    logo_url: null,
    font_family: "Geist"
  });

  const handleSave = () => {
    setBranding(localBranding);
    // In a real app, you would also update the 'organizations' table in Supabase
    alert("Branding applied globally!");
  };

  const resetBranding = () => {
    const defaultBranding = {
      primary_color: "#1B4734",
      accent_color: "#C9A24E",
      bg_color: "#F5EFE6",
      logo_url: null,
      font_family: "Geist"
    };
    setLocalBranding(defaultBranding);
    setBranding(defaultBranding);
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      <AdminNavigation />

      <main className="p-8 max-w-5xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-light text-primary tracking-tight">White-Labeling</h1>
            <p className="text-primary/40 font-medium italic">Transform AWAKE OS into your brand's experience.</p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={resetBranding}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-primary/40 hover:text-primary transition-all"
             >
                <RotateCcw className="w-4 h-4" /> Reset
             </button>
             <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
             >
                <Save className="w-4 h-4" /> Save Branding
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Settings Column */}
          <div className="space-y-6">
            
            {/* Palette Section */}
            <section className="luxury-card p-8 space-y-6">
              <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                <Palette className="w-5 h-5 text-accent" /> Signature Palette
              </h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-primary/30">Primary Color (Forest Green)</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color" 
                      value={localBranding.primary_color}
                      onChange={(e) => setLocalBranding({...localBranding, primary_color: e.target.value})}
                      className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                    <input 
                      type="text" 
                      value={localBranding.primary_color}
                      onChange={(e) => setLocalBranding({...localBranding, primary_color: e.target.value})}
                      className="flex-1 bg-slate-50 border border-primary/5 rounded-xl px-4 py-3 text-sm font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-primary/30">Accent Color (Gold)</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color" 
                      value={localBranding.accent_color}
                      onChange={(e) => setLocalBranding({...localBranding, accent_color: e.target.value})}
                      className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                    <input 
                      type="text" 
                      value={localBranding.accent_color}
                      onChange={(e) => setLocalBranding({...localBranding, accent_color: e.target.value})}
                      className="flex-1 bg-slate-50 border border-primary/5 rounded-xl px-4 py-3 text-sm font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-primary/30">Background Color (Cream)</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color" 
                      value={localBranding.bg_color}
                      onChange={(e) => setLocalBranding({...localBranding, bg_color: e.target.value})}
                      className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                    <input 
                      type="text" 
                      value={localBranding.bg_color}
                      onChange={(e) => setLocalBranding({...localBranding, bg_color: e.target.value})}
                      className="flex-1 bg-slate-50 border border-primary/5 rounded-xl px-4 py-3 text-sm font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Typography Section */}
            <section className="luxury-card p-8 space-y-6">
              <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                <Type className="w-5 h-5 text-accent" /> Typography & Assets
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-primary/30">Font Family</label>
                  <select 
                    value={localBranding.font_family}
                    onChange={(e) => setLocalBranding({...localBranding, font_family: e.target.value})}
                    className="w-full bg-slate-50 border border-primary/5 rounded-xl px-4 py-3 text-sm"
                  >
                    <option value="Geist">Geist (Modern Minimalist)</option>
                    <option value="Inter">Inter (Clean Sans)</option>
                    <option value="Playfair">Playfair (Luxury Serif)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-primary/30">Brand Logo URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="https://yourbrand.com/logo.png"
                      value={localBranding.logo_url || ""}
                      onChange={(e) => setLocalBranding({...localBranding, logo_url: e.target.value})}
                      className="w-full bg-slate-50 border border-primary/5 rounded-xl pl-12 pr-4 py-3 text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Preview Column */}
          <div className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary/30 ml-2">Live Preview</h2>
            
            <div 
              className="rounded-[2.5rem] border-[12px] border-[#1e293b] overflow-hidden shadow-2xl aspect-[9/16] relative max-w-[320px] mx-auto"
              style={{ 
                backgroundColor: localBranding.bg_color, 
                fontFamily: localBranding.font_family,
                color: localBranding.primary_color 
              }}
            >
              {/* Inner Preview Content */}
              <div className="p-8 space-y-8">
                 <div className="flex justify-between items-center">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                       <Layout className="w-4 h-4" style={{ color: localBranding.primary_color }} />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200" />
                 </div>

                 <div className="space-y-2">
                    <h3 className="text-2xl font-light leading-tight">Welcome to <br/><span className="font-bold">Aura Cabin</span></h3>
                    <div className="w-12 h-1 bg-accent rounded-full" style={{ backgroundColor: localBranding.accent_color }} />
                 </div>

                 {/* Simulated Card */}
                 <div className="p-6 rounded-3xl bg-white/50 backdrop-blur-sm shadow-sm space-y-4 border border-white/20">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-accent" style={{ color: localBranding.accent_color }}>Itinerary</span>
                       <Sparkles className="w-4 h-4 opacity-20" />
                    </div>
                    <div className="space-y-3">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-accent" style={{ backgroundColor: localBranding.accent_color }} />
                          <div className="h-2 flex-1 bg-primary/5 rounded-full" />
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary/10" />
                          <div className="h-2 w-2/3 bg-primary/5 rounded-full" />
                       </div>
                    </div>
                 </div>

                 {/* Simulated Button */}
                 <button 
                  className="w-full py-4 rounded-2xl text-white text-sm font-bold shadow-lg"
                  style={{ backgroundColor: localBranding.primary_color }}
                 >
                    Book Experience
                 </button>
              </div>

              {/* Simulated Tab Bar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-12 bg-white/70 backdrop-blur-xl rounded-full border border-white/20 shadow-xl flex justify-around items-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary" style={{ backgroundColor: localBranding.primary_color }} />
                 <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                 <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                 <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              </div>
            </div>

            <div className="p-4 luxury-card flex items-center gap-4 text-center justify-center">
               <Sparkles className="w-5 h-5 text-accent" />
               <p className="text-xs font-medium text-primary/60 italic">Your brand, your rules, our technology.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}



