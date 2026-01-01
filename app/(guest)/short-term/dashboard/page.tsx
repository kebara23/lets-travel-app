"use client";

import React, { useState, useEffect } from "react";
import { 
  Compass, 
  Sparkles, 
  MapPin, 
  Wind, 
  Utensils, 
  Waves, 
  ChevronRight, 
  CheckCircle2, 
  Megaphone,
  Clock,
  Zap,
  Coffee,
  Moon
} from "lucide-react";
import { GuestNavigation } from "@/components/shared/guest-navigation";
import { useUserStore } from "@/store/use-user-store";
import { cn } from "@/lib/utils";

const ICON_MAP: any = { Wind, Coffee, MapPin, Moon, Zap, Sparkles, Waves };

export default function GuestDashboardPage() {
  const { mockItinerary, toggleItineraryItem, mockAnnouncements } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const latestAnnouncement = mockAnnouncements[0];

  return (
    <div className="min-h-screen bg-awake-bone pb-40">
      {/* Journey Header */}
      <header className="px-8 pt-24 pb-16 space-y-8 animate-in text-center max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-md border border-stone-200/50 flex items-center justify-center text-awake-moss shadow-awake-soft">
            <Compass className="w-8 h-8 text-awake-sage" />
          </div>
          <div className="space-y-3">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-awake-moss/30">Your Sacred Path</p>
            <h1 className="text-6xl font-serif text-awake-moss italic leading-tight tracking-tight">The Explorer Journey</h1>
          </div>
          <p className="text-xl font-serif italic text-awake-moss/40 max-w-xl leading-relaxed">
            Welcome home, Soul. The sanctuary is breathing with you today.
          </p>
        </div>
      </header>

      {/* Daily Pulse (Announcements) - SYNCED WITH GUARDIAN */}
      {latestAnnouncement && (
        <section className="px-8 max-w-4xl mx-auto mb-16 animate-in slide-in-from-bottom-4">
           <div className="awake-card p-10 bg-awake-moss text-awake-bone overflow-hidden relative group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2000')] bg-cover bg-center opacity-30 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-4">
                    <Megaphone className="w-5 h-5 text-awake-gold animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Village Pulse</span>
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-4xl font-serif italic leading-tight">{latestAnnouncement.title}</h2>
                    <p className="text-lg font-serif italic opacity-40 leading-relaxed max-w-xl">
                       "{latestAnnouncement.content}"
                    </p>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* Daily Flow (Itinerary) - SYNCED WITH GUARDIAN */}
      <main className="px-8 max-w-4xl mx-auto space-y-12 animate-in">
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-awake-moss/20">Daily Flow</h2>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-awake-sage">
                <span className="w-1.5 h-1.5 rounded-full bg-awake-sage animate-pulse" /> Live Journey
              </div>
           </div>

           <div className="space-y-6">
              {mockItinerary.length === 0 ? (
                <div className="awake-card p-12 text-center space-y-4 bg-white/40 italic text-awake-moss/30 border-dashed">
                   <Wind className="w-10 h-10 mx-auto opacity-20" />
                   <p>A day of pure presence. No scheduled intentions.</p>
                </div>
              ) : (
                mockItinerary.map((item) => {
                  const Icon = ICON_MAP[item.icon || 'Wind'] || Wind;
                  return (
                    <button 
                      key={item.id}
                      onClick={() => toggleItineraryItem(item.id)}
                      className={cn(
                        "w-full awake-card p-8 text-left transition-all duration-700 flex items-center gap-8 group",
                        item.completed ? "bg-awake-bone/50 opacity-40 grayscale" : "bg-white/60 hover:bg-white hover:shadow-awake-floating"
                      )}
                    >
                      <div className="text-center min-w-[70px]">
                         <p className="text-sm font-sans font-black uppercase tracking-widest text-awake-moss/40 mb-1">{item.time.split(' ')[1]}</p>
                         <p className="text-2xl font-serif italic text-awake-moss leading-none">{item.time.split(' ')[0]}</p>
                      </div>
                      <div className="h-12 w-[1px] bg-stone-200/50" />
                      <div className="flex-1 flex items-center justify-between">
                         <div className="space-y-1">
                            <h3 className={cn(
                              "text-2xl font-serif transition-all duration-700",
                              item.completed ? "text-awake-moss/40 line-through" : "text-awake-moss italic"
                            )}>{item.title}</h3>
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-awake-moss/20">
                               <Icon className="w-3 h-3" /> {item.type}
                            </div>
                         </div>
                         <div className={cn(
                            "w-10 h-10 rounded-full border border-stone-200/50 flex items-center justify-center transition-all duration-700",
                            item.completed ? "bg-awake-sage border-awake-sage text-white" : "text-awake-moss/10 group-hover:text-awake-sage group-hover:border-awake-sage/30"
                         )}>
                            {item.completed ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                         </div>
                      </div>
                    </button>
                  );
                })
              )}
           </div>
        </div>

        {/* Sanctuary Highlights */}
        <div className="space-y-8 pt-12">
           <h2 className="text-xs font-black uppercase tracking-[0.4em] text-awake-moss/20">Discovery</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="awake-card p-8 bg-awake-moss text-awake-bone overflow-hidden relative group cursor-pointer">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000')] bg-cover bg-center opacity-20 group-hover:scale-110 transition-transform duration-1000" />
                 <div className="relative z-10 space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Sacred Space</p>
                    <h4 className="text-3xl font-serif italic">The River Ritual</h4>
                    <p className="text-sm font-serif italic opacity-40 mt-4 leading-relaxed">
                       A collective meditation at the river bank. Meet at the Shala.
                    </p>
                 </div>
              </div>
              <div className="awake-card p-8 bg-white/60 backdrop-blur-sm border-stone-200/50 hover:shadow-awake-floating transition-all duration-700 cursor-pointer group">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-awake-gold/10 flex items-center justify-center text-awake-gold">
                       <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="text-xl font-serif text-awake-moss italic">Ask the Oracle</h4>
                 </div>
                 <p className="text-sm font-serif italic text-awake-moss/40 leading-relaxed">
                    Need guidance on your flow? The sanctuary spirits are listening.
                 </p>
              </div>
           </div>
        </div>
      </main>

      <GuestNavigation />
    </div>
  );
}
