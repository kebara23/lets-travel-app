"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Send, Sparkles, ArrowLeft, Heart, AlertCircle } from "lucide-react";
import { GuestNavigation } from "@/components/shared/guest-navigation";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/use-user-store";

export default function SOSPage() {
  const { addMockSOS } = useUserStore();
  const [isSent, setIsSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignal = () => {
    addMockSOS({
      id: `SOS-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      organization_id: "org-awake-001",
      user_id: "demo-soul-001",
      location: "Explorer Journey Path",
      status: "active",
      created_at: new Date().toISOString(),
    });
    setIsSent(true);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-awake-bone flex flex-col items-center justify-center p-8 animate-in">
      <div className="max-w-md w-full space-y-12 text-center">
        
        {isSent ? (
          <div className="space-y-8 animate-in zoom-in duration-1000">
            <div className="w-32 h-32 rounded-full bg-awake-sage/10 flex items-center justify-center mx-auto relative">
               <div className="absolute inset-0 bg-awake-sage rounded-full animate-ping opacity-10" />
               <div className="w-20 h-20 rounded-full bg-awake-sage flex items-center justify-center text-white shadow-awake-floating">
                  <Heart className="w-10 h-10" />
               </div>
            </div>
            <div className="space-y-4">
               <h1 className="text-5xl font-serif text-awake-moss italic">Signal Received</h1>
               <p className="text-xl font-serif italic text-awake-moss/40 leading-relaxed">
                  The Guardians are holding space for you. Someone is already on their way.
               </p>
            </div>
            <button 
              onClick={() => setIsSent(false)}
              className="text-[10px] font-black uppercase tracking-[0.4em] text-awake-moss/20 hover:text-awake-moss transition-colors pt-8"
            >
               Return to Presence
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="w-24 h-24 rounded-full bg-white/40 backdrop-blur-md border border-stone-200/50 flex items-center justify-center text-awake-terracotta mx-auto shadow-awake-soft">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <div className="space-y-3">
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-awake-terracotta/40">The Guardian Signal</p>
                <h1 className="text-6xl font-serif text-awake-moss italic leading-tight tracking-tight">Need Support?</h1>
              </div>
              <p className="text-xl font-serif italic text-awake-moss/40 max-w-sm mx-auto leading-relaxed">
                If your flow is interrupted or you feel an imbalance, the Guardians are always here to restore harmony.
              </p>
            </div>

            <button 
              onClick={handleSignal}
              className="w-full bg-awake-terracotta text-white py-8 rounded-full font-sans font-black uppercase tracking-[0.6em] text-xs shadow-awake-floating hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 group"
            >
              Send Signal <Send className="w-5 h-5 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
            </button>

            <div className="flex flex-col gap-4 text-left">
               <div className="awake-card p-6 bg-white/40 border-stone-200/30 flex items-center gap-6">
                  <div className="w-10 h-10 rounded-full bg-awake-gold/10 flex items-center justify-center text-awake-gold">
                     <AlertCircle className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-serif italic text-awake-moss/60">
                     Immediate assistance for physical or emotional needs.
                  </p>
               </div>
            </div>
          </div>
        )}

      </div>
      <GuestNavigation />
    </div>
  );
}
