"use client";

import React, { useState, useEffect } from "react";
import { Star, Zap, Coffee, Wind, Sparkles, ChevronRight } from "lucide-react";
import { TribeNavigation } from "@/components/shared/tribe-navigation";
import { cn } from "@/lib/utils";

const ENERGY_PERKS = [
  { id: 1, title: "Morning Flow Ceremony", desc: "Private Yoga & Sound Healing session.", cost: "10 Energy", icon: Wind },
  { id: 2, title: "Cafe Cora Alchemy", desc: "Specialty coffee or ceremonial cacao of choice.", cost: "3 Energy", icon: Coffee },
  { id: 3, title: "Sanctuary Spa Flow", desc: "60-minute therapeutic jungle massage.", cost: "25 Energy", icon: Sparkles },
  { id: 4, title: "Private Temazcal", desc: "Ancestral steam ritual for rebirth.", cost: "15 Energy", icon: Zap },
];

export default function TribePerksPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-awake-bone pb-40">
      {/* Exchange Header */}
      <header className="px-8 pt-24 pb-16 space-y-8 animate-in text-center max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-md border border-stone-200/50 flex items-center justify-center text-awake-moss shadow-awake-soft">
            <Star className="w-8 h-8 text-awake-gold" />
          </div>
          <div className="space-y-3">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-awake-moss/30">The Alchemical Exchange</p>
            <h1 className="text-6xl font-serif text-awake-moss italic leading-tight tracking-tight">Energy Tokens</h1>
          </div>
          <p className="text-xl font-serif italic text-awake-moss/40 max-w-xl leading-relaxed">
            Every mission completed returns energy to you. Exchange your devotion for sanctuary experiences.
          </p>
        </div>

        {/* Energy Balance Card */}
        <div className="awake-card p-10 max-w-sm mx-auto bg-white/60 backdrop-blur-sm border-stone-200/50 mt-12 flex flex-col items-center gap-4">
           <span className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Your Current Resonance</span>
           <div className="flex items-center gap-4">
              <Zap className="w-8 h-8 text-awake-gold" />
              <span className="text-5xl font-serif text-awake-moss">12</span>
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest text-awake-gold">Energy Credits</span>
        </div>
      </header>

      {/* Perks Grid */}
      <main className="px-8 max-w-6xl mx-auto space-y-10 animate-in">
        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-awake-moss/20 text-center">Available Alchemy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ENERGY_PERKS.map((perk) => {
            const Icon = perk.icon;
            return (
              <button 
                key={perk.id} 
                className="awake-card p-10 text-left bg-white/40 border-stone-200/30 hover:bg-white hover:shadow-awake-floating transition-all duration-700 group flex justify-between items-center"
              >
                <div className="flex gap-8 items-center">
                  <div className="w-16 h-16 rounded-3xl bg-awake-bone flex items-center justify-center text-awake-moss/30 group-hover:text-awake-moss group-hover:bg-awake-gold/10 transition-all duration-700">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-serif text-awake-moss italic">{perk.title}</h3>
                    <p className="text-sm font-serif italic text-awake-moss/40">"{perk.desc}"</p>
                    <div className="pt-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-awake-gold px-3 py-1 bg-awake-gold/5 rounded-full">{perk.cost}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-awake-moss/10 group-hover:text-awake-moss group-hover:translate-x-2 transition-all duration-700" />
              </button>
            );
          })}
        </div>
      </main>

      <TribeNavigation />
    </div>
  );
}
