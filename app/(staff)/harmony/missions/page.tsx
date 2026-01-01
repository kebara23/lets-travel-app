"use client";

import React from "react";
import { ClipboardList, CheckCircle2, Clock, MapPin, Sparkles } from "lucide-react";
import { StaffNavigation } from "@/components/shared/staff-navigation";
import { cn } from "@/lib/utils";

const MY_MISSIONS = [
  { id: "m1", title: "Premium Reset", space: "Casa Oasis", time: "08:00 AM", status: "completed", urgent: false },
  { id: "m2", title: "Daily Harmony", space: "Ananda Bus", time: "10:30 AM", status: "in_progress", urgent: true },
  { id: "m3", title: "Shared Flow", space: "Casa Cora Bathrooms", time: "01:00 PM", status: "pending", urgent: false },
  { id: "m4", title: "Evening Smudge", space: "Surya Shala", time: "05:00 PM", status: "pending", urgent: false },
];

export default function HarmonyMissionsPage() {
  return (
    <div className="min-h-screen bg-awake-paper pb-24">
      <header className="bg-awake-violet text-white p-8 pt-16 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-serif italic tracking-tight">Missions</h1>
            <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] opacity-60 text-awake-sunset">Your Sacred Path</p>
          </div>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10">
            <ClipboardList className="w-7 h-7 text-awake-sunset" />
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6 animate-in">
        <div className="flex items-center gap-3 mb-2">
           <Sparkles className="w-4 h-4 text-awake-sunset animate-pulse" />
           <h2 className="text-xs font-sans font-black uppercase tracking-[0.2em] text-awake-violet/40">Active Assignments</h2>
        </div>

        {MY_MISSIONS.map((mission) => (
          <div 
            key={mission.id}
            className={cn(
              "awake-card p-6 flex items-center justify-between border-l-4 transition-all duration-500",
              mission.status === 'completed' ? "border-l-green-500 bg-green-50/20 opacity-60" : 
              mission.urgent ? "border-l-awake-sunset animate-pulse" : "border-l-awake-violet bg-white"
            )}
          >
            <div className="flex gap-5 items-center">
               <div className={cn(
                 "w-12 h-12 rounded-full flex items-center justify-center",
                 mission.status === 'completed' ? "bg-green-100 text-green-600" : "bg-awake-paper text-awake-violet/20"
               )}>
                  {mission.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
               </div>
               <div className="space-y-1">
                  <h3 className="text-xl font-serif text-awake-heading">{mission.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-awake-violet/40 uppercase tracking-widest">
                     <MapPin className="w-3 h-3" /> {mission.space}
                  </div>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-awake-violet/20 uppercase tracking-tighter mb-1">Schedule</p>
               <p className="text-sm font-sans font-bold text-awake-violet">{mission.time}</p>
            </div>
          </div>
        ))}
      </main>

      <StaffNavigation />
    </div>
  );
}
