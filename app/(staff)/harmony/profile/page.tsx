"use client";

import React from "react";
import { User, ShieldCheck, Zap, History, LogOut, Heart } from "lucide-react";
import { StaffNavigation } from "@/components/shared/staff-navigation";
import { useUserStore } from "@/store/use-user-store";

export default function HarmonyProfilePage() {
  const { user, logout } = useUserStore();

  return (
    <div className="min-h-screen bg-awake-paper pb-24">
      {/* Top Background Pattern */}
      <div className="h-48 bg-awake-violet relative overflow-hidden">
         <div className="absolute inset-0 bg-awake-gradient opacity-20" />
         <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-awake-sunset/10 rounded-full blur-3xl" />
      </div>

      <main className="px-6 -mt-20 relative z-10 space-y-8 animate-in">
        {/* Profile Card */}
        <div className="awake-card p-10 text-center space-y-6 bg-white shadow-2xl">
           <div className="mx-auto w-24 h-24 rounded-full border-4 border-awake-paper bg-awake-violet/5 flex items-center justify-center relative">
              <User className="w-12 h-12 text-awake-violet" />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-awake-sunset rounded-full border-4 border-white flex items-center justify-center">
                 <ShieldCheck className="w-4 h-4 text-white" />
              </div>
           </div>
           <div className="space-y-1">
              <h2 className="text-3xl font-serif text-awake-heading italic">{user?.full_name || "Harmony Soul"}</h2>
              <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-awake-violet/30">Space Care Specialist</p>
           </div>
           <div className="grid grid-cols-3 gap-4 border-t border-awake-violet/5 pt-8">
              <div>
                 <p className="text-xl font-serif text-awake-violet">12</p>
                 <p className="text-[8px] font-black uppercase tracking-widest text-awake-violet/20">Cleaned</p>
              </div>
              <div>
                 <p className="text-xl font-serif text-awake-violet">4.9</p>
                 <p className="text-[8px] font-black uppercase tracking-widest text-awake-violet/20">Vibration</p>
              </div>
              <div>
                 <p className="text-xl font-serif text-awake-violet">8h</p>
                 <p className="text-[8px] font-black uppercase tracking-widest text-awake-violet/20">Flow</p>
              </div>
           </div>
        </div>

        {/* Menu Actions */}
        <div className="space-y-3">
           {[
             { label: "Harmonization History", icon: History, color: "text-awake-violet" },
             { label: "Collective Chat", icon: Heart, color: "text-awake-sunset" },
             { label: "My Energy Stats", icon: Zap, color: "text-awake-gold" },
           ].map((item) => (
             <button key={item.label} className="awake-card w-full p-6 flex justify-between items-center bg-white group hover:bg-awake-paper transition-all">
                <div className="flex items-center gap-4">
                   <item.icon className={cn("w-5 h-5", item.color)} />
                   <span className="text-sm font-sans font-bold text-awake-heading">{item.label}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-awake-paper flex items-center justify-center group-hover:translate-x-1 transition-transform">
                   <Zap className="w-3 h-3 text-awake-violet/20" />
                </div>
             </button>
           ))}
        </div>

        {/* Logout */}
        <button 
          onClick={() => { logout(); window.location.href = "/login"; }}
          className="w-full py-5 flex items-center justify-center gap-3 text-red-400 font-sans font-black uppercase tracking-[0.2em] text-[10px] hover:text-red-600 transition-colors"
        >
           <LogOut className="w-4 h-4" /> End Sanctuary Shift
        </button>
      </main>

      <StaffNavigation />
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
