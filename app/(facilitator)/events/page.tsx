"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Plus, 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2,
  Wind,
  Coffee,
  Waves,
  Zap,
  Moon,
  ChevronRight,
  ShieldAlert,
  X
} from "lucide-react";
import { useUserStore, ItineraryItem } from "@/store/use-user-store";
import { cn } from "@/lib/utils";

const ICON_MAP: any = { Wind, Coffee, MapPin, Moon, Zap, Sparkles, Waves };

export default function FacilitatorEventsPage() {
  const { user, mockItinerary, addItineraryItem, mockUsers } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Yoga");
  const [location, setLocation] = useState("Surya Shala");
  const [time, setTime] = useState("08:00");
  const [icon, setIcon] = useState("Wind");
  const [capacity, setCapacity] = useState(20);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Permission Check
  if (!user?.is_event_leader && user?.role !== 'admin_guardian') {
    return (
      <div className="min-h-screen bg-awake-bone flex flex-col items-center justify-center p-8 text-center space-y-6">
        <ShieldAlert className="w-16 h-16 text-awake-terracotta animate-pulse" />
        <h1 className="text-4xl font-serif text-awake-moss italic">Sacred Access Denied</h1>
        <p className="text-xl font-serif italic text-awake-moss/40 max-w-md">
          Your soul has not yet been granted the permission to weave experiences. Please connect with a Guardian.
        </p>
        <a href="/" className="awake-btn bg-awake-moss text-white px-10">Return to Presence</a>
      </div>
    );
  }

  const myEvents = mockItinerary.filter(item => item.facilitator_id === user?.id || !item.facilitator_id); // Showing all for demo

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const [h, m] = time.split(':');
    const ampm = parseInt(h) >= 12 ? 'PM' : 'AM';
    const h12 = parseInt(h) % 12 || 12;

    addItineraryItem({
      id: `EV-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      title,
      type,
      time: `${h12}:${m} ${ampm}`,
      icon,
      completed: false,
      facilitator_id: user?.id
    });
    
    setIsAdding(false);
    setTitle("");
  };

  return (
    <div className="min-h-screen bg-awake-bone pb-40">
      
      {/* Facilitator Header */}
      <header className="px-8 pt-24 pb-16 space-y-8 animate-in text-center max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-awake-gold flex items-center justify-center text-white shadow-awake-floating">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-3">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-awake-moss/30">Experience Curation</p>
            <h1 className="text-6xl font-serif text-awake-moss italic leading-tight tracking-tight">Weaving the Flow</h1>
          </div>
          <p className="text-xl font-serif italic text-awake-moss/40 max-w-xl leading-relaxed">
            Welcome, Facilitator. Your role is to hold space and design moments of transformation.
          </p>
        </div>
      </header>

      <main className="px-8 max-w-5xl mx-auto space-y-16 animate-in">
        
        {/* Action Button */}
        <div className="flex justify-center">
           <button 
             onClick={() => setIsAdding(true)}
             className="awake-btn bg-awake-moss text-white flex items-center gap-4 px-12 shadow-awake-floating hover:scale-105 transition-all"
           >
              <Plus className="w-5 h-5" /> Weave Experience
           </button>
        </div>

        {/* My Events List */}
        <div className="space-y-8">
           <div className="flex items-center justify-between border-b border-stone-200/50 pb-4">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-awake-moss/20">My Active Circles</h2>
              <span className="text-[9px] font-black uppercase tracking-widest text-awake-gold px-3 py-1 bg-awake-gold/5 rounded-full">Holding Space</span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {myEvents.map((event) => {
                const Icon = ICON_MAP[event.icon || 'Wind'] || Wind;
                const attendees = Math.floor(Math.random() * 15) + 5; // Mock attendees
                return (
                  <div key={event.id} className="awake-card p-10 bg-white/60 backdrop-blur-sm border-stone-200/50 hover:bg-white transition-all duration-700 group flex flex-col justify-between h-[320px]">
                    <div className="space-y-6">
                       <div className="flex justify-between items-start">
                          <div className="w-12 h-12 rounded-2xl bg-awake-bone flex items-center justify-center text-awake-moss/20 group-hover:text-awake-moss group-hover:bg-awake-sage/10 transition-all duration-700">
                             <Icon className="w-6 h-6" />
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase tracking-widest text-awake-gold">{event.time}</p>
                             <p className="text-[10px] font-black uppercase tracking-widest text-awake-moss/20">{event.type}</p>
                          </div>
                       </div>
                       <h3 className="text-3xl font-serif text-awake-moss italic leading-tight">{event.title}</h3>
                       <div className="flex items-center gap-3 text-awake-moss/40">
                          <MapPin className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Surya Shala</span>
                       </div>
                    </div>

                    <div className="pt-8 border-t border-stone-100/50 flex justify-between items-center">
                       <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-awake-sage" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-awake-moss/40">{attendees} Souls Joined</span>
                       </div>
                       <button className="text-[9px] font-black uppercase tracking-widest text-awake-moss/20 hover:text-awake-moss transition-colors flex items-center gap-2 group">
                          Manage Circle <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                       </button>
                    </div>
                  </div>
                );
              })}

              {myEvents.length === 0 && (
                <div className="col-span-full py-20 text-center space-y-6 border-2 border-dashed border-stone-200/50 rounded-4xl bg-white/20">
                   <Clock className="w-16 h-16 text-awake-moss/10 mx-auto animate-pulse" />
                   <p className="text-2xl font-serif italic text-awake-moss/30">No experiences woven yet. Begin the creation.</p>
                </div>
              )}
           </div>
        </div>
      </main>

      {/* Creation Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-6 animate-in fade-in bg-awake-bone/40 backdrop-blur-xl">
          <div className="awake-card w-full lg:max-w-2xl bg-white overflow-hidden shadow-awake-floating rounded-t-4xl lg:rounded-4xl animate-in slide-in-from-bottom duration-500">
            
            <form onSubmit={handleCreate} className="flex flex-col h-full">
              <header className="p-6 lg:p-10 border-b border-stone-100 flex justify-between items-center bg-awake-bone/20">
                <div className="space-y-1">
                  <h2 className="text-3xl font-serif text-awake-moss italic">Weave New Experience</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-awake-moss/30">Curation Intent</p>
                </div>
                <button type="button" onClick={() => setIsAdding(false)} className="p-4 text-awake-moss/20 hover:text-awake-moss transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </header>

              <div className="p-6 lg:p-10 space-y-8 flex-1 overflow-y-auto max-h-[60vh] no-scrollbar">
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Experience Title</label>
                  <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Himalayan Kundalini Flow" className="w-full bg-awake-bone/40 border border-stone-200/50 rounded-2xl p-5 text-awake-moss font-serif italic text-xl focus:outline-none focus:ring-4 focus:ring-awake-gold/5 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Type</label>
                    <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-awake-bone/40 border border-stone-200/50 rounded-2xl p-5 text-awake-moss font-sans focus:outline-none transition-all">
                      <option>Yoga</option>
                      <option>Dance</option>
                      <option>Workshop</option>
                      <option>Ceremony</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Sacred Location</label>
                    <select value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-awake-bone/40 border border-stone-200/50 rounded-2xl p-5 text-awake-moss font-sans focus:outline-none transition-all">
                      <option>Surya Shala</option>
                      <option>The River</option>
                      <option>Oasis Deck</option>
                      <option>Beach Front</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Time Anchor</label>
                    <input required type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-awake-bone/40 border border-stone-200/50 rounded-2xl p-5 text-awake-moss font-sans focus:outline-none transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Soul Capacity</label>
                    <input type="number" value={capacity} onChange={e => setCapacity(parseInt(e.target.value))} className="w-full bg-awake-bone/40 border border-stone-200/50 rounded-2xl p-5 text-awake-moss font-sans focus:outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Visual Resonance (Icon)</label>
                  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {Object.keys(ICON_MAP).map(iconName => {
                      const Icon = ICON_MAP[iconName];
                      return (
                        <button key={iconName} type="button" onClick={() => setIcon(iconName)} className={cn("p-5 rounded-2xl transition-all duration-500 border min-w-[64px]", icon === iconName ? "bg-awake-moss text-white border-awake-moss shadow-lg" : "bg-awake-bone/40 border-stone-100 text-awake-moss/20 hover:text-awake-moss/40")}>
                          <Icon className="w-6 h-6 mx-auto" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <footer className="p-6 lg:p-10 border-t border-stone-100 bg-white">
                <button type="submit" className="awake-btn w-full flex items-center justify-center gap-4 text-white shadow-awake-floating bg-awake-moss hover:bg-awake-moss/90 py-6 rounded-full font-black uppercase tracking-[0.4em] text-xs">
                  Manifest Experience <ChevronRight className="w-4 h-4" />
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Navigation for Facilitator (Sharing Tribe Nav for now) */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-2xl px-10 py-5 rounded-full border border-stone-200/50 flex items-center gap-12 z-50 shadow-awake-floating transition-all duration-700 hover:scale-105">
          <a href="/" className="flex flex-col items-center gap-1.5 text-awake-moss/30 hover:text-awake-moss transition-all group">
             <Calendar className="w-6 h-6" />
             <span className="text-[9px] font-sans font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-40 transition-all">Exit</span>
          </a>
          <div className="flex flex-col items-center gap-1.5 text-awake-moss relative">
             <div className="absolute -top-1 w-1 h-1 bg-awake-gold rounded-full animate-pulse" />
             <Sparkles className="w-6 h-6 stroke-[2.5px]" />
             <span className="text-[9px] font-sans font-black uppercase tracking-[0.2em]">Events</span>
          </div>
      </nav>
    </div>
  );
}
