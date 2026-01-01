"use client";

import React, { useState } from "react";
import { Plus, Zap, Bell, Sparkles } from "lucide-react";
import { AdminNavigation } from "@/components/shared/admin-navigation";
import { MissionBoard } from "@/components/admin/MissionBoard";
import { MissionDispatcher } from "@/components/admin/MissionDispatcher";
import { cn } from "@/lib/utils";

export default function GuardianMissionsPage() {
  const [isDispatcherOpen, setIsDispatcherOpen] = useState(false);

  return (
    <div className="min-h-screen bg-awake-bone flex">
      <AdminNavigation />

      <main className="flex-1 px-6 lg:pl-40 lg:pr-12 py-10 lg:py-20 animate-in pb-32">
        
        {/* Ceremonial Header */}
        <header className="mb-10 lg:mb-16 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 lg:gap-8">
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center gap-3">
               <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-awake-gold animate-pulse" />
               <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-awake-moss/40">Mission Control</p>
            </div>
            <h1 className="text-4xl lg:text-6xl font-serif text-awake-moss italic leading-tight">Directing the Flow</h1>
            <p className="text-base lg:text-xl font-serif italic text-awake-moss/50 leading-relaxed max-w-2xl">
              Coordinating the collective pulse of Harmonization, Regeneration, and our Tribe.
            </p>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-4 lg:gap-6">
             <button 
               onClick={() => setIsDispatcherOpen(true)}
               className="awake-btn flex items-center gap-2 lg:gap-3 px-6 lg:pr-10 py-3 lg:py-4 shadow-awake-floating hover:scale-105 transition-all text-[9px] lg:text-[10px]"
             >
                <Plus className="w-4 h-4 lg:w-5 lg:h-5" /> New Mission
             </button>
             <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/60 backdrop-blur-md border border-stone-200/50 flex items-center justify-center text-awake-moss shadow-awake-soft relative">
                <Bell className="w-5 h-5 lg:w-6 lg:h-6 opacity-60" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-awake-terracotta rounded-full border-2 border-awake-bone animate-pulse" />
             </div>
          </div>
        </header>

        {/* The Central Hub */}
        <div className="relative">
           <MissionBoard />
        </div>

        {/* Dispatcher Overlay */}
        {isDispatcherOpen && (
          <MissionDispatcher onClose={() => setIsDispatcherOpen(false)} />
        )}

      </main>
    </div>
  );
}
