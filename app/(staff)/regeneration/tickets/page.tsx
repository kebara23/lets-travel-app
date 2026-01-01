"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  ChevronRight,
  Filter,
  Wrench,
  Sparkles,
  Zap
} from "lucide-react";
import { RegenerationNavigation } from "@/components/shared/regeneration-navigation";
import { RegenerationRitual } from "@/components/regeneration/RegenerationRitual";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/use-user-store";

export default function RegenerationTicketsPage() {
  const { mockTickets, mockSpaces, updateMockTicket } = useUserStore();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const selectedTicket = mockTickets.find(t => t.id === selectedTicketId);

  const handleComplete = () => {
    if (selectedTicketId) {
      updateMockTicket(selectedTicketId, 'resolved');
      setSelectedTicketId(null);
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "high": return "text-awake-terracotta";
      case "medium": return "text-awake-gold";
      case "low": return "text-awake-sage";
      default: return "text-awake-moss/20";
    }
  };

  const getSpaceName = (spaceId: string) => {
    return mockSpaces.find(s => s.id === spaceId)?.name || "Central Sanctuary";
  };

  return (
    <div className="min-h-screen bg-awake-bone pb-32">
      <header className="px-8 pt-20 pb-12 space-y-8 animate-in">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-5xl font-serif text-awake-moss italic leading-tight">Regeneration Pulse</h1>
            <p className="text-[11px] font-sans font-black uppercase tracking-[0.4em] text-awake-moss/30">Sanctuary Maintenance</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/40 backdrop-blur-md border border-stone-200/50 flex items-center justify-center text-awake-moss shadow-awake-soft">
            <Wrench className="w-6 h-6 opacity-40" />
          </div>
        </div>

        <div className="flex gap-4">
           <div className="flex-1 awake-card p-6 bg-white/40 border-stone-200/30 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-awake-terracotta flex items-center justify-center text-white shadow-lg">
                 <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-2xl font-serif italic text-awake-moss leading-none">{mockTickets.filter(t => t.status !== 'resolved').length}</p>
                 <p className="text-[9px] font-black uppercase tracking-widest text-awake-moss/20">Open Repairs</p>
              </div>
           </div>
           <div className="flex-1 awake-card p-6 bg-white/40 border-stone-200/30 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-awake-sage flex items-center justify-center text-white shadow-lg">
                 <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-2xl font-serif italic text-awake-moss leading-none">{mockTickets.filter(t => t.status === 'resolved').length}</p>
                 <p className="text-[9px] font-black uppercase tracking-widest text-awake-moss/20">Resolved</p>
              </div>
           </div>
        </div>
      </header>

      <main className="px-8 space-y-8 animate-in">
        <div className="flex items-center gap-3">
           <Zap className="w-4 h-4 text-awake-terracotta animate-pulse" />
           <h2 className="text-xs font-sans font-black uppercase tracking-[0.2em] text-awake-moss/40">Priority Stream</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mockTickets.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4">
               <Sparkles className="w-12 h-12 text-awake-moss/10 mx-auto" />
               <p className="text-serif italic text-awake-moss/40">The sanctuary is in perfect harmony.</p>
            </div>
          ) : (
            mockTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={cn(
                  "group relative bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-4xl p-10 text-left transition-all duration-700 hover:bg-white hover:shadow-awake-floating active:scale-[0.98] overflow-hidden",
                  ticket.status === 'resolved' && "opacity-40 grayscale-[0.5]"
                )}
              >
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-700",
                  getPriorityStyle(ticket.priority as string)
                )} />

                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.3em] opacity-60",
                      getPriorityStyle(ticket.priority as string)
                    )}>
                      {ticket.priority} Priority
                    </span>
                    <h3 className="text-3xl font-serif text-awake-moss leading-tight">{ticket.title}</h3>
                  </div>
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-lg text-white",
                    ticket.status === 'resolved' ? "bg-awake-sage" : "bg-awake-terracotta"
                  )}>
                    {ticket.status === 'resolved' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5 animate-pulse" />}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-awake-moss/40 mb-6">
                   <MapPin className="w-4 h-4" />
                   <span className="text-[11px] font-bold uppercase tracking-widest">{getSpaceName(ticket.space_id)}</span>
                </div>

                <div className="p-6 bg-awake-bone/40 rounded-3xl border border-stone-100/50 italic text-sm text-awake-moss/60 leading-relaxed line-clamp-2">
                   "{ticket.description}"
                </div>

                <div className="mt-8 pt-8 border-t border-stone-100/50 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-awake-moss/20">
                    ID: {ticket.id}
                  </span>
                  <div className="flex items-center gap-2 text-awake-terracotta transition-all group-hover:translate-x-1">
                     <span className="text-[10px] font-black uppercase tracking-widest">Restore Flow</span>
                     <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </main>

      {selectedTicket && (
        <RegenerationRitual 
          ticket={selectedTicket}
          onClose={() => setSelectedTicketId(null)}
          onComplete={handleComplete}
        />
      )}

      <RegenerationNavigation />
    </div>
  );
}
