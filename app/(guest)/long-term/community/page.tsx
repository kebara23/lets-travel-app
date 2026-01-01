"use client";

import React, { useState, useEffect } from "react";
import { Users, Calendar, Sparkles, MapPin, Wind, Star, ChevronRight, Clock, Megaphone } from "lucide-react";
import { GuestNavigation } from "@/components/shared/guest-navigation";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/use-user-store";

export default function CommunityPage() {
  const { mockAnnouncements, mockItinerary } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const featuredAnnouncement = mockAnnouncements[0];

  return (
    <div className="min-h-screen bg-awake-bone pb-40">
      <header className="px-8 pt-24 pb-16 space-y-8 animate-in text-center max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-md border border-stone-200/50 flex items-center justify-center text-awake-moss shadow-awake-soft">
            <Users className="w-8 h-8 text-awake-gold" />
          </div>
          <div className="space-y-3">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-awake-moss/30">The Collective Breath</p>
            <h1 className="text-6xl font-serif text-awake-moss italic leading-tight tracking-tight">Village Pulse</h1>
          </div>
          <p className="text-xl font-serif italic text-awake-moss/40 max-w-xl leading-relaxed">
            Synchronizing our hearts. Discover upcoming gatherings and community flows.
          </p>
        </div>
      </header>

      <main className="px-8 max-w-5xl mx-auto space-y-12 animate-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           
           {/* Dynamic Featured Announcement */}
           {featuredAnnouncement ? (
             <div className="awake-card p-10 bg-awake-moss text-awake-bone col-span-full overflow-hidden relative group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2000')] bg-cover bg-center opacity-30 group-hover:scale-110 transition-transform duration-1000" />
                <div className="relative z-10 space-y-6">
                   <div className="flex items-center gap-4">
                      <Megaphone className="w-6 h-6 text-awake-gold animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Live Pulse</span>
                   </div>
                   <h2 className="text-5xl font-serif italic max-w-2xl leading-tight">{featuredAnnouncement.title}</h2>
                   <p className="text-lg font-serif italic opacity-40 leading-relaxed max-w-xl">
                      "{featuredAnnouncement.content}"
                   </p>
                </div>
             </div>
           ) : (
             <div className="awake-card p-10 bg-awake-bone border-dashed border-awake-moss/10 col-span-full text-center">
                <p className="text-xl font-serif italic text-awake-moss/20">The village is in silent observation.</p>
             </div>
           )}

           {/* Event List from Itinerary */}
           <div className="space-y-8 col-span-full">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-awake-moss/20">Upcoming Circles</h2>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-awake-sage">
                  <span className="w-1.5 h-1.5 rounded-full bg-awake-sage animate-pulse" /> Live Itinerary
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {mockItinerary.map((event) => (
                  <button 
                    key={event.id}
                    className="awake-card p-8 bg-white/60 backdrop-blur-sm border-stone-200/50 hover:bg-white hover:shadow-awake-floating transition-all duration-700 text-left flex flex-col justify-between h-72 group"
                  >
                    <div className="space-y-4">
                       <div className="flex justify-between items-start">
                          <span className="text-[9px] font-black uppercase tracking-widest text-awake-gold px-3 py-1 bg-awake-gold/5 rounded-full">{event.type}</span>
                          <Calendar className="w-4 h-4 text-awake-moss/20 group-hover:text-awake-moss transition-colors" />
                       </div>
                       <h4 className="text-2xl font-serif text-awake-moss italic leading-tight">{event.title}</h4>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30 flex items-center gap-2">
                             <Clock className="w-3 h-3 text-awake-sage" /> {event.time}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30 flex items-center gap-2">
                             <MapPin className="w-3 h-3 text-awake-lavender" /> Sacred Space
                          </p>
                       </div>
                    </div>
                    <div className="pt-6 border-t border-stone-100/50 flex justify-between items-center group-hover:translate-x-1 transition-transform">
                       <span className="text-[9px] font-bold text-awake-moss/20 uppercase tracking-widest italic">Open for Harmony</span>
                       <ChevronRight className="w-4 h-4 text-awake-moss/20" />
                    </div>
                  </button>
                ))}
              </div>
           </div>

           {/* Historical Pulses */}
           {mockAnnouncements.length > 1 && (
             <div className="space-y-8 col-span-full pt-12">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-awake-moss/20">Previous Echoes</h2>
                <div className="space-y-4">
                  {mockAnnouncements.slice(1).map((ann) => (
                    <div key={ann.id} className="p-6 border-b border-stone-100/50 flex justify-between items-center group cursor-pointer hover:bg-white/40 transition-colors rounded-2xl">
                      <div className="space-y-1">
                         <h4 className="text-xl font-serif italic text-awake-moss group-hover:text-awake-sage transition-colors">{ann.title}</h4>
                         <p className="text-[9px] font-black uppercase tracking-widest text-awake-moss/20">{new Date(ann.created_at).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-awake-moss/20 group-hover:text-awake-moss transition-transform" />
                    </div>
                  ))}
                </div>
             </div>
           )}

        </div>
      </main>

      <GuestNavigation />
    </div>
  );
}
