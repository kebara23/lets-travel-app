"use client";

import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Sparkles, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  Megaphone,
  ChevronRight,
  Clock,
  MapPin,
  Users
} from "lucide-react";
import { TribeNavigation } from "@/components/shared/tribe-navigation";
import { StatusPill } from "@/components/shared/StatusPill";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/use-user-store";

export default function TribeMissionsPage() {
  const { mockTribeMissions, updateTribeMission, mockAnnouncements } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleJoinMission = (id: string, currentFilled: number, slots: number) => {
    if (currentFilled < slots) {
      updateTribeMission(id, { slots_filled: currentFilled + 1 });
    }
  };

  const tribeRelevantPulses = mockAnnouncements.filter(a => a.type !== 'emergency');

  return (
    <div className="min-h-screen bg-awake-bone pb-40">
      {/* Sacred Header */}
      <header className="px-8 pt-24 pb-16 space-y-8 animate-in text-center max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-md border border-stone-200/50 flex items-center justify-center text-awake-moss shadow-awake-soft">
            <Heart className="w-8 h-8 text-awake-terracotta" />
          </div>
          <div className="space-y-3">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-awake-moss/30">The Collective Call</p>
            <h1 className="text-6xl font-serif text-awake-moss italic leading-tight tracking-tight">Tribe Service</h1>
          </div>
          <p className="text-xl font-serif italic text-awake-moss/40 max-w-xl leading-relaxed">
            Honoring our home through sacred service. Every act of devotion strengthens the mycelium.
          </p>
        </div>
      </header>

      <main className="px-8 max-w-6xl mx-auto space-y-20 animate-in">
        
        {/* Village Pulses for Tribe - SYNCED WITH GUARDIAN */}
        {tribeRelevantPulses.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-awake-moss/20">Village Pulse</h2>
              <span className="text-[9px] font-black uppercase tracking-widest text-awake-gold px-3 py-1 bg-awake-gold/5 rounded-full">Live Echoes</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {tribeRelevantPulses.slice(0, 2).map((ann) => (
                 <div key={ann.id} className="awake-card p-8 bg-white/40 border-stone-100 flex gap-6 items-start group hover:bg-white transition-all duration-700">
                    <div className="w-12 h-12 rounded-2xl bg-awake-gold/5 flex items-center justify-center text-awake-gold group-hover:scale-110 transition-transform duration-700">
                       <Megaphone className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                       <h4 className="text-xl font-serif italic text-awake-moss">{ann.title}</h4>
                       <p className="text-sm font-serif italic text-awake-moss/40 line-clamp-2">"{ann.content}"</p>
                    </div>
                 </div>
               ))}
            </div>
          </section>
        )}

        {/* Missions Grid */}
        <section className="space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-awake-moss/20">Open Missions</h2>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-awake-terracotta">
              <span className="w-1.5 h-1.5 rounded-full bg-awake-terracotta animate-pulse" /> Urgent Call
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {mockTribeMissions.filter(m => m.status === 'open').map((mission) => (
              <div 
                key={mission.id} 
                className="awake-card p-12 bg-white/60 backdrop-blur-sm border border-stone-200/50 hover:bg-white hover:shadow-awake-floating transition-all duration-1000 group flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-2xl bg-awake-bone text-awake-moss/40">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <StatusPill status={mission.energy_value} />
                       <p className="text-[8px] font-black uppercase tracking-widest text-awake-moss/20">Energy Value</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-4xl font-serif text-awake-moss italic leading-tight">{mission.title}</h3>
                    <p className="text-lg font-serif italic text-awake-moss/60 leading-relaxed">
                      "{mission.description}"
                    </p>
                  </div>
                </div>

                <div className="mt-12 space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                         <Users className="w-3 h-3 text-awake-moss/20" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Souls Called: {mission.slots_filled}/{mission.slots}</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30 italic">
                        {mission.slots - mission.slots_filled} Spaces Left
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-awake-bone rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-awake-sage transition-all duration-1000" 
                        style={{ width: `${(mission.slots_filled / mission.slots) * 100}%` }}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => handleJoinMission(mission.id, mission.slots_filled, mission.slots)}
                    disabled={mission.slots_filled >= mission.slots}
                    className={cn(
                      "w-full py-5 rounded-full font-sans font-black uppercase tracking-[0.4em] text-[10px] transition-all duration-700 flex items-center justify-center gap-4",
                      mission.slots_filled >= mission.slots
                        ? "bg-awake-bone text-awake-moss/20 cursor-not-allowed"
                        : "bg-awake-moss text-white shadow-awake-floating hover:bg-awake-moss/90 group-hover:scale-105"
                    )}
                  >
                    {mission.slots_filled >= mission.slots ? "Mission Full" : "Answer the Call"} 
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {mockTribeMissions.filter(m => m.status === 'open').length === 0 && (
              <div className="col-span-full py-32 text-center space-y-6 bg-white/20 rounded-4xl border border-dashed border-stone-200/50">
                 <Star className="w-16 h-16 text-awake-moss/10 mx-auto animate-pulse" />
                 <p className="text-2xl font-serif italic text-awake-moss/30">The Tribe is in rest. Listen for the next call.</p>
              </div>
            )}
          </div>
        </section>

        {/* Completed/Inspiration Section */}
        <section className="pt-20 border-t border-stone-100/50">
           <h2 className="text-xs font-black uppercase tracking-[0.4em] text-awake-moss/20 mb-10 text-center">Past Devotions</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000">
              {mockTribeMissions.filter(m => m.status === 'completed').map((m) => (
                <div key={m.id} className="awake-card p-8 bg-white/20 border-stone-100">
                   <CheckCircle2 className="w-5 h-5 text-awake-sage mb-4" />
                   <h4 className="text-xl font-serif italic text-awake-moss">{m.title}</h4>
                   <p className="text-xs font-bold uppercase tracking-widest text-awake-moss/30 mt-2">{m.energy_value} Honored</p>
                </div>
              ))}
           </div>
        </section>
      </main>

      <TribeNavigation />
    </div>
  );
}
