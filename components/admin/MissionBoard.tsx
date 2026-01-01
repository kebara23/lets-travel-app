"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Wrench, 
  Users, 
  LayoutGrid, 
  Clock,
  MapPin,
  ChevronRight,
  Filter,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/use-user-store";
import { StatusPill } from "@/components/shared/StatusPill";

type Pillar = 'harmonization' | 'regeneration' | 'tribe';

export function MissionBoard() {
  const { mockSpaces, mockTickets, mockTribeMissions } = useUserStore();
  const [activePillar, setActivePillar] = useState<Pillar>('harmonization');

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in duration-1000">
      
      {/* Pillar Tabs - Scrollable on Mobile */}
      <div className="flex gap-6 lg:gap-12 border-b border-stone-200/50 pb-4 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'harmonization', label: 'Harmonization', icon: Sparkles, count: mockSpaces.filter(s => s.status === 'dirty' || s.status === 'cleaning').length },
          { id: 'regeneration', label: 'Regeneration', icon: Wrench, count: mockTickets.filter(t => t.status !== 'resolved').length },
          { id: 'tribe', label: 'Tribe Pulse', icon: Users, count: mockTribeMissions.filter(m => m.status === 'open').length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activePillar === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActivePillar(tab.id as Pillar)}
              className={cn(
                "flex items-center gap-3 lg:gap-4 pb-4 transition-all duration-700 relative group whitespace-nowrap min-w-fit",
                isActive ? "text-awake-moss" : "text-awake-moss/30 hover:text-awake-moss/50"
              )}
            >
              <Icon className={cn("w-4 h-4 lg:w-5 lg:h-5", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] lg:text-sm font-sans font-black uppercase tracking-[0.2em]">{tab.label}</span>
              {tab.count > 0 && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[8px] lg:text-[9px] font-black tracking-widest transition-all",
                  isActive ? "bg-awake-moss text-white" : "bg-awake-moss/5 text-awake-moss/40"
                )}>
                  {tab.count}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-awake-moss animate-in fade-in" />
              )}
            </button>
          );
        })}
      </div>

      {/* Harmonization View */}
      {activePillar === 'harmonization' && (
        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-8 animate-in slide-in-from-bottom-4">
          {mockSpaces.map((space) => (
            <div key={space.id} className={cn(
              "awake-card p-4 lg:p-10 transition-all duration-700 relative overflow-hidden",
              space.status === 'clean' ? "bg-white/20 opacity-60" : "bg-white/80 lg:bg-white/60 backdrop-blur-sm border border-stone-200/50 hover:bg-white hover:shadow-awake-floating"
            )}>
               <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 transition-colors duration-700",
                  space.status === 'clean' ? "bg-awake-sage" : space.status === 'dirty' ? "bg-awake-terracotta" : "bg-awake-gold"
               )} />
               
               <div className="flex flex-col lg:flex-row justify-between items-start mb-4 lg:mb-8 gap-2">
                  <div className="space-y-0.5">
                     <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-awake-moss/40">{space.type}</p>
                     <h3 className="text-sm lg:text-3xl font-serif text-awake-moss italic leading-tight">{space.name}</h3>
                  </div>
                  <div className="scale-75 lg:scale-100 origin-left">
                    <StatusPill status={space.status} />
                  </div>
               </div>
               
               <div className="flex flex-wrap gap-1.5 pt-2">
                  {space.features?.map((f: string) => (
                    <span key={f} className="text-[7px] lg:text-[8px] font-bold text-awake-moss/50 bg-awake-bone px-1.5 py-0.5 rounded-sm uppercase tracking-widest border border-stone-200/10">
                      {f}
                    </span>
                  ))}
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Regeneration View */}
      {activePillar === 'regeneration' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-2 lg:mb-4">
             <LayoutGrid className="w-4 h-4 text-awake-terracotta" />
             <h2 className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-awake-moss/40">Active Restoration Pipeline</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8">
            {mockTickets.filter(t => t.status !== 'resolved').map((ticket) => (
              <div key={ticket.id} className="awake-card p-6 lg:p-10 bg-white/80 lg:bg-white/60 backdrop-blur-sm border border-stone-200/50 hover:bg-white hover:shadow-awake-floating transition-all duration-700 group">
                 <div className="flex justify-between items-start mb-6">
                    <StatusPill status={ticket.priority as string} />
                    <span className="text-[9px] font-black text-awake-moss/30">ID: {ticket.id}</span>
                 </div>
                 <h3 className="text-xl lg:text-3xl font-serif text-awake-moss italic mb-2 leading-tight">{ticket.title}</h3>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-awake-moss/50 uppercase tracking-widest mb-6">
                    <MapPin className="w-3.5 h-3.5 text-awake-lavender" /> {mockSpaces.find(s => s.id === ticket.space_id)?.name || 'Central'}
                 </div>
                 <div className="p-4 bg-awake-bone/40 rounded-2xl border border-stone-100 italic text-sm text-awake-moss/70 mb-8 line-clamp-2 leading-relaxed">
                    "{ticket.description}"
                 </div>
                 <div className="flex justify-between items-center pt-6 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                       <Clock className="w-3.5 h-3.5 text-awake-gold" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-awake-gold">{ticket.status}</span>
                    </div>
                    <button className="w-10 h-10 rounded-full border border-stone-200/50 flex items-center justify-center text-awake-moss/30 group-hover:text-awake-moss group-hover:border-awake-moss/30 transition-all">
                       <ChevronRight className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tribe Pulse View */}
      {activePillar === 'tribe' && (
        <div className="space-y-6 lg:space-y-8 animate-in slide-in-from-bottom-4">
           {mockTribeMissions.map((mission) => (
             <div key={mission.id} className="awake-card p-6 lg:p-12 bg-white/80 lg:bg-white/60 backdrop-blur-sm border border-stone-200/50 hover:bg-white hover:shadow-awake-floating transition-all duration-700 flex flex-col lg:flex-row justify-between gap-6 lg:gap-10">
                <div className="space-y-4 max-w-xl">
                   <div className="flex items-center gap-4">
                      <StatusPill status={mission.status} size="md" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-awake-moss/40">Exchange: {mission.energy_value}</span>
                   </div>
                   <h3 className="text-2xl lg:text-5xl font-serif text-awake-moss italic">{mission.title}</h3>
                   <p className="text-serif text-awake-moss/70 leading-relaxed text-base lg:text-xl italic">
                     "{mission.description}"
                   </p>
                </div>
                <div className="flex flex-row lg:flex-col justify-between lg:justify-center items-center lg:items-end gap-4 lg:gap-6 border-t lg:border-t-0 lg:border-l border-stone-100 pt-6 lg:pt-0 lg:pl-10">
                   <div className="text-left lg:text-right">
                      <p className="text-3xl lg:text-6xl font-serif text-awake-moss leading-none">{mission.slots_filled} / {mission.slots}</p>
                      <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-awake-moss/40 mt-2">Souls Present</p>
                   </div>
                   <div className="hidden lg:block w-full h-1.5 bg-awake-bone rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-awake-sage transition-all duration-1000" 
                        style={{ width: `${(mission.slots_filled / mission.slots) * 100}%` }}
                      />
                   </div>
                   <button className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-awake-moss/40 hover:text-awake-terracotta transition-colors flex items-center gap-2">
                      Withdraw <CheckCircle2 className="w-4 h-4 opacity-20" />
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}

    </div>
  );
}
