"use client";
import React, { useEffect, useState } from "react";
import { 
  Users, 
  Home, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  MapPin,
  CheckCircle2,
  AlertCircle,
  Bell,
  Calendar,
  Megaphone,
  Sparkles,
  X
} from "lucide-react";
import { AdminNavigation } from "@/components/shared/admin-navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/use-user-store";

const STATS = [
  { label: "Total Occupancy", value: "84%", icon: Home, trend: "+2.4%", color: "text-awake-lavender" },
  { label: "Active Guests", value: "142", icon: Users, trend: "+12", color: "text-awake-sage" },
  { label: "SOS Alerts", value: "0", icon: ShieldAlert, trend: "Stable", color: "text-awake-terracotta" },
  { label: "RevPAR", value: "$420", icon: TrendingUp, trend: "+15%", color: "text-awake-gold" },
];

export default function GuardianDashboardPage() {
  const { mockSpaces, mockSOS, updateMockSOS, mockAnnouncements, mockItinerary } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [showSOSOverlay, setShowSOSOverlay] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeSOS = mockSOS.filter(s => s.status === 'active');

  return (
    <div className="min-h-screen bg-awake-bone flex">
      <AdminNavigation />

      <main className="flex-1 px-6 lg:pl-40 lg:pr-12 py-10 lg:py-20 animate-in pb-32">
        {/* Top Header */}
        <header className="mb-16 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <MapPin className="w-5 h-5 text-awake-lavender" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-awake-moss/30">Guardian Command Center</p>
            </div>
            <h1 className="text-4xl lg:text-6xl font-serif text-awake-moss italic leading-tight">Property Resonance</h1>
            <p className="text-xl font-serif italic text-awake-moss/40 leading-relaxed max-w-2xl">
              Real-time pulse of the entire Awake OS Ecosystem.
            </p>
          </div>
          <div className="flex items-center gap-6">
             <div className="awake-card px-6 py-3 flex items-center gap-2 text-sm font-sans font-bold text-awake-moss/60 shadow-awake-soft">
                <Clock className="w-4 h-4 text-awake-gold" /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </div>
             {activeSOS.length > 0 && (
               <button 
                onClick={() => setShowSOSOverlay(true)}
                className="bg-awake-terracotta text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-[10px] animate-pulse shadow-lg"
               >
                 {activeSOS.length} SOS Active
               </button>
             )}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-20">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            const isAlert = stat.label === "SOS Alerts" && activeSOS.length > 0;
            return (
              <div key={stat.label} className="awake-card p-8 flex flex-col justify-between h-40">
                <div className="flex justify-between items-start">
                  <div className={cn(
                    "p-3 rounded-2xl border border-stone-200/50",
                    isAlert ? "bg-awake-terracotta text-white animate-pulse" : "bg-awake-bone/40 text-awake-moss"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={cn(
                    "text-[9px] font-black px-3 py-1 rounded-full bg-awake-bone/40 uppercase tracking-widest",
                    isAlert ? "text-awake-terracotta" : stat.color
                  )}>
                    {isAlert ? "CRITICAL" : stat.trend}
                  </span>
                </div>
                <div>
                  <p className="text-4xl font-serif text-awake-moss italic">{isAlert ? activeSOS.length : stat.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30 mt-1">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          
          {/* Global Map Preview */}
          <div className="xl:col-span-2 awake-card overflow-hidden flex flex-col h-[600px]">
             <div className="p-8 border-b border-stone-100/50 flex justify-between items-center bg-white/50">
                <h3 className="font-serif text-xl text-awake-moss italic flex items-center gap-3">
                   <MapPin className="w-5 h-5 text-awake-terracotta" /> Live Property Map
                </h3>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2 text-[10px] font-black text-awake-moss/30 uppercase tracking-widest">
                      <div className="w-2.5 h-2.5 rounded-full bg-awake-sage" /> {mockSpaces.filter(s => s.status === 'clean').length} Stable
                   </div>
                   {activeSOS.length > 0 && (
                     <div className="flex items-center gap-2 text-[10px] font-black text-awake-terracotta uppercase tracking-widest ml-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-awake-terracotta animate-ping" /> {activeSOS.length} Alert
                     </div>
                   )}
                </div>
             </div>
             <div className="flex-1 bg-stone-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=2000')] bg-cover bg-center opacity-40 grayscale" />
                
                {/* Simulated Pins */}
                {mockSpaces.slice(0, 10).map((room, i) => (
                  <div 
                    key={room.id}
                    className={cn(
                      "absolute w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-1000",
                      room.status === 'clean' ? 'bg-awake-sage' : room.status === 'dirty' ? 'bg-awake-terracotta' : 'bg-awake-gold'
                    )}
                    style={{ 
                      top: `${20 + (i * 7)}%`, 
                      left: `${15 + (i * 8)}%` 
                    }}
                  />
                ))}

                {/* SOS Pins */}
                {activeSOS.map((sos, i) => (
                  <div 
                    key={sos.id}
                    className="absolute w-12 h-12 bg-awake-terracotta rounded-full flex items-center justify-center text-white border-4 border-white shadow-2xl animate-bounce"
                    style={{ top: `${40 + (i * 5)}%`, left: `${50 + (i * 5)}%` }}
                  >
                     <ShieldAlert className="w-6 h-6" />
                  </div>
                ))}
             </div>
          </div>

          {/* Intelligence Feed */}
          <div className="awake-card flex flex-col h-[600px]">
            <div className="p-8 border-b border-stone-100/50 bg-white/50">
              <h3 className="font-serif text-xl text-awake-moss italic flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-awake-gold" /> Intelligence Feed
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              
              {/* SOS Alerts in Feed */}
              {activeSOS.map(sos => (
                <div key={sos.id} className="flex gap-4 group p-4 bg-awake-terracotta/5 rounded-2xl border border-awake-terracotta/10 animate-pulse">
                   <div className="w-1 h-12 rounded-full bg-awake-terracotta group-hover:w-1.5 transition-all" />
                   <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                         <span className="text-[9px] font-black text-awake-terracotta uppercase tracking-widest">ACTIVE SOS</span>
                         <span className="text-[8px] text-awake-terracotta/40 font-black uppercase">Just now</span>
                      </div>
                      <p className="text-base font-serif italic text-awake-moss">Emergency Signal</p>
                      <p className="text-[11px] text-awake-moss/40 italic flex items-center gap-2">
                         <MapPin className="w-3 h-3" /> {sos.location}
                      </p>
                      <button 
                        onClick={() => updateMockSOS(sos.id, 'resolved')}
                        className="text-[8px] font-black uppercase tracking-widest text-awake-sage mt-2 hover:underline"
                      >
                         Mark as Resolved
                      </button>
                   </div>
                </div>
              ))}

              {/* Latest Announcements */}
              {mockAnnouncements.map(ann => (
                <div key={ann.id} className="flex gap-4 group">
                   <div className="w-1 h-12 rounded-full bg-awake-gold/40 group-hover:bg-awake-gold transition-all" />
                   <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                         <span className="text-[9px] font-black text-awake-gold uppercase tracking-widest">Village Pulse</span>
                         <span className="text-[8px] text-awake-moss/20 font-black uppercase">Recent</span>
                      </div>
                      <p className="text-base font-serif italic text-awake-moss">{ann.title}</p>
                      <p className="text-[11px] text-awake-moss/40 line-clamp-1 italic">"{ann.content}"</p>
                   </div>
                </div>
              ))}

              {/* Today's Events */}
              {mockItinerary.map(event => (
                <div key={event.id} className="flex gap-4 group">
                   <div className="w-1 h-12 rounded-full bg-awake-sage/40 group-hover:bg-awake-sage transition-all" />
                   <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                         <span className="text-[9px] font-black text-awake-sage uppercase tracking-widest">Journey: {event.time}</span>
                         <Calendar className="w-3 h-3 text-awake-moss/10" />
                      </div>
                      <p className="text-base font-serif italic text-awake-moss">{event.title}</p>
                   </div>
                </div>
              ))}

              {activeSOS.length === 0 && mockAnnouncements.length === 0 && mockItinerary.length === 0 && (
                <div className="py-20 text-center text-awake-moss/20 italic font-serif">
                   Silent resonance...
                </div>
              )}
            </div>
          </div>

        </div>

        {/* SOS Resolution Overlay */}
        {showSOSOverlay && activeSOS.length > 0 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-awake-bone/40 backdrop-blur-xl p-6">
             <div className="awake-card w-full max-w-lg bg-white p-10 space-y-8 animate-in zoom-in duration-500">
                <div className="flex justify-between items-center">
                   <h2 className="text-3xl font-serif italic text-awake-terracotta">Active Signals</h2>
                   <button onClick={() => setShowSOSOverlay(false)}>
                      <X className="w-6 h-6 text-awake-moss/20" />
                   </button>
                </div>
                <div className="space-y-6">
                   {activeSOS.map(sos => (
                     <div key={sos.id} className="p-6 bg-awake-terracotta/5 rounded-3xl border border-awake-terracotta/20 flex justify-between items-center">
                        <div>
                           <p className="text-lg font-serif italic text-awake-moss">{sos.location}</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30 mt-1">ID: {sos.id}</p>
                        </div>
                        <button 
                          onClick={() => updateMockSOS(sos.id, 'resolved')}
                          className="bg-awake-sage text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                        >
                           Resolve
                        </button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
