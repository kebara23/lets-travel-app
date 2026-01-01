"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Sparkles, Wind, Droplets, Zap, Waves, Settings, Clock, Check } from "lucide-react";
import { StaffNavigation } from "@/components/shared/staff-navigation";
import { cn } from "@/lib/utils";
import { CleaningChecklist } from "@/components/harmony/CleaningChecklist";
import { useUserStore } from "@/store/use-user-store";

export default function HarmonyRoomsPage() {
  const { mockSpaces, updateMockSpace } = useUserStore();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const selectedRoom = mockSpaces.find(s => s.id === selectedRoomId);

  const handleComplete = () => {
    if (selectedRoomId) {
      updateMockSpace(selectedRoomId, 'clean');
      setSelectedRoomId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "dirty": return "bg-awake-terracotta";
      case "cleaning": return "bg-awake-gold";
      case "clean": return "bg-awake-sage";
      case "maintenance": return "bg-awake-lavender";
      default: return "bg-stone-200";
    }
  };

  return (
    <div className="min-h-screen bg-awake-bone pb-32">
      <header className="px-8 pt-20 pb-12 space-y-8 animate-in">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-serif text-awake-moss italic leading-tight">Harmony Flow</h1>
            <p className="text-[11px] font-sans font-black uppercase tracking-[0.4em] text-awake-moss/30">Sanctuary Operations</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/40 backdrop-blur-md border border-stone-200/50 flex items-center justify-center text-awake-moss shadow-awake-soft">
            <Sparkles className="w-6 h-6 opacity-40" />
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-awake-moss/20 group-focus-within:text-awake-sage transition-colors" />
          <input 
            type="text"
            placeholder="Listen to the sanctuary..."
            className="w-full bg-white/40 backdrop-blur-sm border border-stone-200/50 rounded-full py-5 pl-14 pr-6 text-sm font-sans text-awake-moss placeholder:text-awake-moss/20 focus:outline-none focus:ring-4 focus:ring-awake-sage/5 transition-all"
          />
        </div>
      </header>

      <div className="px-8 flex gap-8 mb-12 overflow-x-auto no-scrollbar">
        {[
          { label: "Restore", count: mockSpaces.filter(r => r.status === 'dirty').length, color: "bg-awake-terracotta" },
          { label: "Flowing", count: mockSpaces.filter(r => r.status === 'cleaning').length, color: "bg-awake-gold" },
          { label: "Awake", count: mockSpaces.filter(r => r.status === 'clean').length, color: "bg-awake-sage" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 min-w-[80px]">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", stat.color)} />
              <span className="text-2xl font-serif italic text-awake-moss">{stat.count}</span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-awake-moss/20">{stat.label}</span>
          </div>
        ))}
      </div>

      <main className="px-6 lg:px-8 grid grid-cols-2 md:grid-cols-2 gap-6 lg:gap-8 animate-in">
        {mockSpaces.map((room) => (
          <button
            key={room.id}
            onClick={() => setSelectedRoomId(room.id)}
            className="group relative bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-4xl p-6 lg:p-10 text-left transition-all duration-700 hover:bg-white hover:shadow-awake-floating active:scale-[0.98] overflow-hidden"
          >
            <div className={cn(
              "absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-700",
              getStatusStyle(room.status)
            )} />

            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-6 lg:mb-10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-awake-lavender opacity-60">{room.type}</span>
                <h3 className="text-xl lg:text-3xl font-serif text-awake-moss leading-tight">{room.name}</h3>
              </div>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-lg",
                getStatusStyle(room.status),
                "text-white"
              )}>
                {room.status === 'dirty' && <Clock className="w-5 h-5" />}
                {room.status === 'cleaning' && <Wind className="w-5 h-5 animate-pulse" />}
                {room.status === 'clean' && <Check className="w-5 h-5" />}
                {room.status === 'maintenance' && <Settings className="w-5 h-5" />}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {room.features?.map((f) => (
                <span key={f} className="px-3 py-1.5 rounded-full bg-awake-bone border border-stone-200/30 text-[9px] font-bold text-awake-moss/40 uppercase tracking-widest transition-all group-hover:bg-white group-hover:text-awake-moss/60">
                  {f}
                </span>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-stone-100/50 flex justify-between items-center">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em]",
                room.status === 'clean' ? "text-awake-sage" : "text-awake-moss/20"
              )}>
                {room.status}
              </span>
              <span className="text-[10px] font-bold text-awake-moss/10 group-hover:text-awake-moss/30 transition-colors uppercase tracking-widest italic">
                Ritual Ready
              </span>
            </div>
          </button>
        ))}
      </main>

      {selectedRoom && (
        <CleaningChecklist 
          roomName={selectedRoom.name}
          roomType={selectedRoom}
          onClose={() => setSelectedRoomId(null)}
          onComplete={handleComplete}
        />
      )}

      <StaffNavigation />
    </div>
  );
}
