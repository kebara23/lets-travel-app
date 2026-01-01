"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Settings2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { AdminNavigation } from "@/components/shared/admin-navigation";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/use-user-store";

export default function InventoryManagerPage() {
  const { mockSpaces, updateMockSpace } = useUserStore();
  const [filter, setFilter] = useState("all");

  const categories = ["all", "House", "Casita", "Unique", "Suite", "Room", "Temple"];

  const filteredSpaces = filter === "all" 
    ? mockSpaces 
    : mockSpaces.filter(s => s.type === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "dirty": return "text-red-500 bg-red-50";
      case "cleaning": return "text-awake-sunset bg-awake-sunset/10";
      case "clean": return "text-emerald-600 bg-emerald-50";
      case "ready": return "text-emerald-600 bg-emerald-100";
      default: return "text-awake-violet/40 bg-awake-paper";
    }
  };

  return (
    <div className="min-h-screen bg-awake-paper flex">
      <AdminNavigation />
      
      <main className="flex-1 lg:pl-32 min-w-0">
        <div className="max-w-[1200px] mx-auto p-8 lg:p-16 space-y-12 animate-in">
          
          <header className="flex justify-between items-end border-b border-awake-violet/10 pb-8">
            <div className="space-y-2">
              <h1 className="text-5xl font-serif text-awake-heading italic">Sanctuary Inventory</h1>
              <p className="text-awake-body/60 font-sans text-sm uppercase tracking-widest">Managing the Physical Resonance</p>
            </div>
          </header>

          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
             <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={cn(
                      "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                      filter === cat ? "bg-awake-violet text-white shadow-lg" : "bg-white text-awake-violet/40 hover:bg-awake-violet/5"
                    )}
                  >
                    {cat}
                  </button>
                ))}
             </div>
             <div className="flex gap-2 w-full md:w-auto">
                <div className="flex-1 md:w-64 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-awake-violet/20" />
                  <input placeholder="Search units..." className="w-full bg-white border-none rounded-full py-2 pl-10 pr-4 text-xs font-medium" />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSpaces.map((space) => (
              <div key={space.id} className="awake-card p-8 space-y-6 group">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-awake-sunset">{space.type}</p>
                    <h3 className="text-2xl font-serif text-awake-heading">{space.name}</h3>
                  </div>
                  <div className={cn("px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest", getStatusColor(space.status))}>
                    {space.status}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-awake-violet/20">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {space.features?.map(f => (
                      <span key={f} className="text-[9px] font-bold text-awake-violet/40 bg-awake-paper px-2 py-1 rounded-sm">{f}</span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-awake-violet/5 flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-awake-violet/20" />
                      <span className="text-[10px] font-bold text-awake-violet/40">Updated 2h ago</span>
                   </div>
                   <button className="text-awake-violet/20 hover:text-awake-sunset transition-colors">
                      <Settings2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
