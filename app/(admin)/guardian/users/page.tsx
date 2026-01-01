"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Filter, Mail, MapPin, Star, MoreVertical, Sparkles } from "lucide-react";
import { AdminNavigation } from "@/components/shared/admin-navigation";
import { StatusPill } from "@/components/shared/StatusPill";
import { cn } from "@/lib/utils";

const MOCK_SOULS = [
  { id: "1", name: "Marco Rossi", role: "Explorer", email: "marco@example.com", location: "Casa Oasis", status: "flowing", energy: 12 },
  { id: "2", name: "Elena Martinez", role: "Resident", email: "elena@example.com", location: "East River House", status: "stable", energy: 45 },
  { id: "3", name: "John Doe", role: "Tribe", email: "john@example.com", location: "Staff Hub", status: "active", energy: 8 },
  { id: "4", name: "Sarah Jenkins", role: "Explorer", email: "sarah@example.com", location: "Casita River 1", status: "flowing", energy: 15 },
  { id: "5", name: "Yendry Quesada", role: "Guardian", email: "yendry@awake.cr", location: "Central Office", status: "stable", energy: 100 },
];

export default function GuardianUsersPage() {
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
               <Users className="w-5 h-5 text-awake-moss opacity-40" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-awake-moss/30">Soul Directory</p>
            </div>
            <h1 className="text-4xl lg:text-6xl font-serif text-awake-moss italic leading-tight">Connected Souls</h1>
            <p className="text-xl font-serif italic text-awake-moss/40 leading-relaxed max-w-2xl">
              Nurturing the human mycelium of our sanctuary.
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-awake-moss/20 group-focus-within:text-awake-sage transition-colors" />
                <input 
                  type="text"
                  placeholder="Search souls..."
                  className="bg-white/40 backdrop-blur-sm border border-stone-200/50 rounded-full py-3 pl-12 pr-6 text-sm font-sans text-awake-moss placeholder:text-awake-moss/20 focus:outline-none focus:ring-4 focus:ring-awake-sage/5 transition-all w-full lg:w-64"
                />
             </div>
             <button className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-md border border-stone-200/50 flex items-center justify-center text-awake-moss shadow-awake-soft">
                <Filter className="w-5 h-5 opacity-40" />
             </button>
          </div>
        </header>

        {/* Souls Table */}
        <div className="awake-card bg-white/60 backdrop-blur-sm border border-stone-200/50 overflow-x-auto shadow-awake-soft no-scrollbar">
           <table className="w-full text-left">
              <thead>
                 <tr className="border-b border-stone-100/50">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-awake-moss/20">Soul</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-awake-moss/20">Path / Role</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-awake-moss/20">Current Anchor</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-awake-moss/20">Resonance</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-awake-moss/20 text-right">Energy</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                 {MOCK_SOULS.map((soul) => (
                   <tr key={soul.id} className="group hover:bg-white/40 transition-colors duration-500">
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-awake-bone flex items-center justify-center text-awake-moss/30 border border-stone-100 group-hover:border-awake-sage/30 transition-all">
                               <span className="text-sm font-bold">{soul.name.split(' ').map(n => n[0]).join('')}</span>
                            </div>
                            <div>
                               <p className="font-serif italic text-xl text-awake-moss">{soul.name}</p>
                               <p className="text-[10px] text-awake-moss/30 font-sans font-bold flex items-center gap-1">
                                  <Mail className="w-3 h-3" /> {soul.email}
                               </p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className={cn(
                           "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                           soul.role === 'Guardian' ? "bg-awake-moss text-awake-bone" : "bg-awake-bone text-awake-moss/40"
                         )}>
                            {soul.role}
                         </span>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2 text-awake-moss/60">
                            <MapPin className="w-3.5 h-3.5 text-awake-lavender" />
                            <span className="text-sm font-serif italic">{soul.location}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <StatusPill status={soul.status} />
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex items-center justify-end gap-2 text-awake-gold">
                            <span className="text-xl font-serif">{soul.energy}</span>
                            <Sparkles className="w-4 h-4 opacity-40" />
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>

        <div className="mt-12 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-awake-moss/10">
             End of Directory • Total Souls: {MOCK_SOULS.length}
           </p>
        </div>
      </main>
    </div>
  );
}
