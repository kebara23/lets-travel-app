"use client";

import React, { useState } from "react";
import { Settings, Bell, Moon, Sun, Power, HelpCircle, Sparkles } from "lucide-react";
import { StaffNavigation } from "@/components/shared/staff-navigation";
import { cn } from "@/lib/utils";

export default function HarmonyFlowPage() {
  const [notifications, setNotifications] = useState(true);
  const [shiftActive, setShiftActive] = useState(true);

  return (
    <div className="min-h-screen bg-awake-paper pb-24">
      <header className="p-8 pt-16 space-y-2">
        <h1 className="text-4xl font-serif text-awake-heading italic">Flow Control</h1>
        <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-awake-violet/40">System & Resonance</p>
      </header>

      <main className="px-6 space-y-10 animate-in">
        {/* Operational Status */}
        <div className="space-y-4">
           <h2 className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-awake-sunset ml-2">Presence</h2>
           <div className="awake-card p-8 space-y-8 bg-white">
              <div className="flex justify-between items-center">
                 <div className="space-y-1">
                    <p className="text-lg font-serif text-awake-heading">Active Shift</p>
                    <p className="text-[10px] font-bold text-awake-violet/30 uppercase tracking-widest">Clock-in: 07:30 AM</p>
                 </div>
                 <button 
                  onClick={() => setShiftActive(!shiftActive)}
                  className={cn(
                    "w-14 h-8 rounded-full transition-all relative flex items-center px-1",
                    shiftActive ? "bg-awake-violet" : "bg-awake-paper"
                  )}
                 >
                    <div className={cn(
                      "w-6 h-6 rounded-full shadow-lg transition-all",
                      shiftActive ? "translate-x-6 bg-awake-sunset" : "translate-x-0 bg-white"
                    )} />
                 </button>
              </div>

              <div className="flex justify-between items-center">
                 <div className="space-y-1">
                    <p className="text-lg font-serif text-awake-heading">Pulse Notifications</p>
                    <p className="text-[10px] font-bold text-awake-violet/30 uppercase tracking-widest">Real-time room alerts</p>
                 </div>
                 <button 
                  onClick={() => setNotifications(!notifications)}
                  className={cn(
                    "w-14 h-8 rounded-full transition-all relative flex items-center px-1",
                    notifications ? "bg-awake-violet" : "bg-awake-paper"
                  )}
                 >
                    <div className={cn(
                      "w-6 h-6 rounded-full shadow-lg transition-all",
                      notifications ? "translate-x-6 bg-awake-sunset" : "translate-x-0 bg-white"
                    )} />
                 </button>
              </div>
           </div>
        </div>

        {/* System Settings */}
        <div className="space-y-4">
           <h2 className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-awake-sunset ml-2">Configuration</h2>
           <div className="grid grid-cols-2 gap-4">
              <button className="awake-card p-6 flex flex-col items-center gap-4 bg-white text-center">
                 <div className="w-10 h-10 rounded-full bg-awake-violet/5 flex items-center justify-center text-awake-violet">
                    <Moon className="w-5 h-5" />
                 </div>
                 <p className="text-xs font-bold uppercase tracking-widest text-awake-heading">Rest Mode</p>
              </button>
              <button className="awake-card p-6 flex flex-col items-center gap-4 bg-white text-center">
                 <div className="w-10 h-10 rounded-full bg-awake-violet/5 flex items-center justify-center text-awake-violet">
                    <Sun className="w-5 h-5" />
                 </div>
                 <p className="text-xs font-bold uppercase tracking-widest text-awake-heading">Light Flow</p>
              </button>
              <button className="awake-card p-6 flex flex-col items-center gap-4 bg-white text-center">
                 <div className="w-10 h-10 rounded-full bg-awake-violet/5 flex items-center justify-center text-awake-violet">
                    <Bell className="w-5 h-5" />
                 </div>
                 <p className="text-xs font-bold uppercase tracking-widest text-awake-heading">Sounds</p>
              </button>
              <button className="awake-card p-6 flex flex-col items-center gap-4 bg-white text-center">
                 <div className="w-10 h-10 rounded-full bg-awake-violet/5 flex items-center justify-center text-awake-violet">
                    <HelpCircle className="w-5 h-5" />
                 </div>
                 <p className="text-xs font-bold uppercase tracking-widest text-awake-heading">Support</p>
              </button>
           </div>
        </div>

        {/* Integrity Check */}
        <div className="pt-8 flex flex-col items-center gap-4 border-t border-awake-violet/5">
           <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-awake-gold" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-awake-violet/20">System Integrity 100%</p>
           </div>
           <p className="text-[8px] text-awake-violet/10 font-bold uppercase tracking-widest">Version 2.0.4 • Awake OS</p>
        </div>
      </main>

      <StaffNavigation />
    </div>
  );
}
