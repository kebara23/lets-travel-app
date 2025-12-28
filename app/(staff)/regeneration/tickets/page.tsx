"use client";

import React, { useState } from "react";
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Image as ImageIcon,
  ChevronRight,
  Filter
} from "lucide-react";
import { RegenerationNavigation } from "@/components/shared/regeneration-navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const MOCK_TICKETS = [
  { 
    id: "T-1001", 
    title: "AC Leakage", 
    location: "Cabin 04", 
    priority: "high", 
    status: "open", 
    time: "12m ago",
    description: "Water dripping from the main unit in the bedroom area."
  },
  { 
    id: "T-1002", 
    title: "Loose Deck Plank", 
    location: "Main Pool Area", 
    priority: "medium", 
    status: "in_progress", 
    time: "45m ago",
    description: "Plank near the shallow end is loose, potential trip hazard."
  },
  { 
    id: "T-1003", 
    title: "Wi-Fi Connectivity", 
    location: "Staff Hub", 
    priority: "low", 
    status: "open", 
    time: "2h ago",
    description: "Router in the staff hub needs a restart or firmware check."
  },
];

export default function RegenerationTicketsPage() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const updateTicketStatus = async (ticketId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "open" ? "in_progress" : "resolved";
    setIsUpdating(ticketId);

    try {
      // In a real app, update the 'tickets' table
      const { error } = await supabase
        .from('tickets')
        .update({ status: nextStatus })
        .eq('id', ticketId);

      if (error) {
        console.warn("Table 'tickets' not found or error, doing local update.");
      }

      // Optimistic update
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, status: nextStatus } : t
      ));
    } catch (err) {
      console.error("Error updating ticket:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-500";
      case "medium": return "bg-amber-500/10 text-amber-500";
      case "low": return "bg-blue-500/10 text-blue-500";
      default: return "bg-slate-500/10 text-slate-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "in_progress": return <Clock className="w-5 h-5 text-amber-500 animate-pulse" />;
      case "resolved": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Rugged Header */}
      <header className="bg-[#1e293b] text-white p-6 pt-12 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-primary">
                <AlertCircle className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-xl font-bold tracking-tight uppercase">Regeneration</h1>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Maintenance Core</p>
             </div>
          </div>
          <button className="p-2 bg-white/5 rounded-lg">
             <Filter className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="flex gap-4">
           <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-2xl font-bold text-accent">3</p>
              <p className="text-[10px] uppercase font-bold text-white/40">Active Jobs</p>
           </div>
           <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-2xl font-bold text-emerald-400">12</p>
              <p className="text-[10px] uppercase font-bold text-white/40">Done Today</p>
           </div>
        </div>
      </header>

      {/* Tickets List */}
      <div className="p-4 space-y-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2">
          Priority Inbox
        </h2>

        {tickets.map((ticket) => (
          <div 
            key={ticket.id}
            onClick={() => ticket.status !== 'resolved' && updateTicketStatus(ticket.id, ticket.status)}
            className={cn(
              "bg-white rounded-3xl p-6 shadow-sm border border-slate-100 active:scale-[0.98] transition-all cursor-pointer group relative",
              ticket.status === 'resolved' && "opacity-60",
              isUpdating === ticket.id && "animate-pulse"
            )}
          >
            <div className="flex justify-between items-start mb-4">
               <div className={cn(
                 "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                 getPriorityColor(ticket.priority)
               )}>
                 {ticket.priority} Priority
               </div>
               <span className="text-[10px] font-bold text-slate-400 uppercase">{ticket.time}</span>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-1">{ticket.title}</h3>
            
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
               <MapPin className="w-4 h-4 text-accent" />
               <span className="font-medium">{ticket.location}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
               <p className="text-sm text-slate-600 leading-relaxed">
                 {ticket.description}
               </p>
            </div>

            <div className="flex justify-between items-center pt-2">
               <div className="flex items-center gap-2">
                  {getStatusIcon(ticket.status)}
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {ticket.status.replace("_", " ")}
                  </span>
               </div>
               
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                     <ImageIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg group-hover:translate-x-1 transition-transform">
                     <ChevronRight className="w-5 h-5" />
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <RegenerationNavigation />
    </div>
  );
}


