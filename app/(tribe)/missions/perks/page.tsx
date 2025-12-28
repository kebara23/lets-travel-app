"use client";

import React from "react";
import { Gift, Star, Coffee, Zap, ChevronRight, Heart } from "lucide-react";
import { TribeNavigation } from "@/components/shared/tribe-navigation";
import { cn } from "@/lib/utils";

const PERKS = [
  { id: "p1", title: "Sunrise Coffee", cost: "500 pts", description: "Specialty blend at the main hub.", icon: Coffee, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "p2", title: "Yoga Session", cost: "1200 pts", description: "Private 1-on-1 session with a master.", icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "p3", title: "Community Dinner", cost: "2500 pts", description: "Join the elders for a sacred feast.", icon: Heart, color: "text-red-600", bg: "bg-red-50" },
];

export default function TribePerksPage() {
  return (
    <div className="min-h-screen pb-32 pt-8 px-6">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-light text-primary">Your Rewards</h1>
        <p className="text-primary/40">Gratitude from the community for your energy.</p>
      </header>

      {/* Points Balance */}
      <div className="luxury-card p-8 bg-primary text-white mb-10 relative overflow-hidden">
         <div className="relative z-10">
            <p className="text-xs uppercase tracking-widest text-white/60 mb-1">Current Balance</p>
            <h2 className="text-5xl font-bold mb-4">2,450 <span className="text-xl font-light opacity-60 text-accent">pts</span></h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-tighter">
               <Star className="w-3 h-3 fill-accent text-accent" /> Elite Contributor
            </div>
         </div>
         <Gift className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 -rotate-12" />
      </div>

      {/* Perks List */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 ml-2 mb-4">Available Perks</h3>
        {PERKS.map((perk) => {
          const Icon = perk.icon;
          return (
            <button
              key={perk.id}
              className="w-full text-left p-5 luxury-card flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl", perk.bg, perk.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-primary">{perk.title}</h4>
                  <p className="text-xs text-primary/40 leading-tight mt-0.5">{perk.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <span className="text-sm font-black text-accent">{perk.cost}</span>
                 <ChevronRight className="w-4 h-4 text-primary/20 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      <TribeNavigation />
    </div>
  );
}



