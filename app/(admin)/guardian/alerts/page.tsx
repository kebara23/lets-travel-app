"use client";

import React, { useState, useEffect } from "react";
import { Bell, ShieldAlert, Zap, Wrench, Sparkles, Filter, MoreHorizontal, ChevronRight, Clock } from "lucide-react";
import { AdminNavigation } from "@/components/shared/admin-navigation";
import { StatusPill } from "@/components/shared/StatusPill";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/use-user-store";

export default function GuardianAlertsPage() {
  const { mockSOS, mockTickets } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-awake-bone flex">
      <AdminNavigation />

      <main className="flex-1 px-6 lg:pl-40 lg:pr-12 py-10 lg:py-20 animate-in pb-32">
        <header className="mb-16 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <Bell className="w-5 h-5 text-awake-terracotta animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-awake-terracotta/40">Intelligence Stream</p>
            </div>
            <h1 className="text-4xl lg:text-6xl font-serif text-awake-moss italic leading-tight">Sanctuary Alerts</h1>
            <p className="text-xl font-serif italic text-awake-moss/40 leading-relaxed max-w-2xl">
              Monitoring the energetic and physical shifts of our ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="awake-card px-6 py-3 bg-white/40 border border-stone-200/50 flex gap-8">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-awake-terracotta" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-awake-moss/40">{mockSOS.length} Critical</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-awake-gold" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-awake-moss/40">{mockTickets.filter(t => t.status !== 'resolved').length} Attention</span>
                </div>
             </div>
             <button className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-md border border-stone-200/50 flex items-center justify-center text-awake-moss shadow-awake-soft">
                <Filter className="w-5 h-5 opacity-40" />
             </button>
          </div>
        </header>

        {/* Intelligence Stream */}
        <div className="space-y-8 max-w-5xl">
           
           {/* Critical Signals (SOS) */}
           {mockSOS.length > 0 && (
             <div className="space-y-6">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-awake-terracotta/40 ml-4">Critical Signals</h2>
                {mockSOS.map((sos) => (
                  <div key={sos.id} className="awake-card p-10 bg-white border border-awake-terracotta/20 shadow-awake-floating flex gap-10 items-center group">
                     <div className="w-20 h-20 rounded-full bg-awake-terracotta/10 flex items-center justify-center text-awake-terracotta relative">
                        <div className="absolute inset-0 bg-awake-terracotta rounded-full animate-ping opacity-10" />
                        <ShieldAlert className="w-10 h-10" />
                     </div>
                     <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                           <StatusPill status="High Priority" />
                           <span className="text-[10px] font-black text-awake-moss/20">SIGNAL: {sos.id}</span>
                        </div>
                        <h3 className="text-3xl font-serif text-awake-moss italic">Soul Emergency Signal</h3>
                        <p className="text-lg font-serif italic text-awake-moss/60 leading-relaxed">
                          Imbalance detected at <span className="text-awake-moss font-bold">{sos.location}</span>. Immediate assistance requested.
                        </p>
                        <div className="pt-4 flex items-center gap-6">
                           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-awake-moss/30">
                              <Clock className="w-3.5 h-3.5" /> Just Now
                           </div>
                           <button className="bg-awake-terracotta text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                              Dispatch Guardian
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}

           {/* Attention Needed (Tickets) */}
           <div className="space-y-6 pt-12">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-awake-moss/20 ml-4">Operational Attention</h2>
              {mockTickets.filter(t => t.status !== 'resolved').map((ticket) => (
                <div key={ticket.id} className="awake-card p-8 bg-white/60 backdrop-blur-sm border border-stone-200/50 hover:bg-white hover:shadow-awake-floating transition-all duration-700 flex items-center justify-between group">
                   <div className="flex gap-8 items-center">
                      <div className={cn(
                        "w-14 h-14 rounded-3xl flex items-center justify-center transition-all duration-700",
                        ticket.priority === 'high' ? "bg-awake-terracotta/10 text-awake-terracotta" : "bg-awake-gold/10 text-awake-gold"
                      )}>
                         <Zap className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-3">
                            <h4 className="text-2xl font-serif text-awake-moss italic">{ticket.title}</h4>
                            <StatusPill status={ticket.priority as string} />
                         </div>
                         <p className="text-sm font-serif italic text-awake-moss/40 leading-relaxed max-w-md">
                            "{ticket.description}"
                         </p>
                      </div>
                   </div>
                   <div className="flex items-center gap-10">
                      <div className="text-right">
                         <p className="text-[9px] font-black uppercase tracking-widest text-awake-moss/20">Status</p>
                         <p className="text-xs font-black uppercase tracking-widest text-awake-gold mt-1">{ticket.status}</p>
                      </div>
                      <button className="w-12 h-12 rounded-full border border-stone-200/50 flex items-center justify-center text-awake-moss/20 group-hover:text-awake-moss group-hover:border-awake-moss/30 transition-all">
                         <ChevronRight className="w-6 h-6" />
                      </button>
                   </div>
                </div>
              ))}
           </div>

           {mockSOS.length === 0 && mockTickets.filter(t => t.status !== 'resolved').length === 0 && (
             <div className="py-32 text-center space-y-6">
                <Sparkles className="w-16 h-16 text-awake-sage/20 mx-auto animate-pulse" />
                <p className="text-3xl font-serif italic text-awake-moss/20">The sanctuary is breathing in complete silence.</p>
             </div>
           )}

        </div>
      </main>
    </div>
  );
}
