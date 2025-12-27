"use client";

import React, { useState } from "react";
import { Check, Clock, AlertTriangle, Search, Filter, Settings } from "lucide-react";
import { StaffNavigation } from "@/components/shared/staff-navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const MOCK_ROOMS = [
  { id: "101", name: "Cabin 01", status: "dirty", guest: "Gomez Fam." },
  { id: "102", name: "Cabin 02", status: "cleaning", guest: "Checking out" },
  { id: "103", name: "Cabin 03", status: "clean", guest: "Empty" },
  { id: "104", name: "Cabin 04", status: "dirty", guest: "Smith" },
  { id: "105", name: "Suite A", status: "maintenance", guest: "Out of order" },
  { id: "106", name: "Suite B", status: "clean", guest: "Arriving 2PM" },
];

type RoomStatus = "dirty" | "cleaning" | "clean" | "maintenance";

export default function HarmonyRoomsPage() {
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const updateRoomStatus = async (roomId: string, currentStatus: RoomStatus) => {
    const statusCycle: Record<RoomStatus, RoomStatus> = {
      "dirty": "cleaning",
      "cleaning": "clean",
      "clean": "dirty",
      "maintenance": "dirty"
    };

    const nextStatus = statusCycle[currentStatus];
    setIsUpdating(roomId);

    try {
      // In a real app, 'spaces' table would be updated
      const { error } = await supabase
        .from('spaces')
        .update({ status: nextStatus })
        .eq('id', roomId);

      if (error) {
        // Fallback for demo if table doesn't exist yet
        console.warn("Table 'spaces' not found or error, doing local update for demo.");
      }
      
      // Update local state (Optimistic)
      setRooms(prev => prev.map(r => 
        r.id === roomId ? { ...r, status: nextStatus } : r
      ));
    } catch (err) {
      console.error("Error updating room:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case "dirty": return "bg-red-500 text-white";
      case "cleaning": return "bg-amber-400 text-white";
      case "clean": return "bg-emerald-500 text-white";
      case "maintenance": return "bg-slate-700 text-white";
      default: return "bg-slate-200";
    }
  };

  const getStatusIcon = (status: RoomStatus) => {
    switch (status) {
      case "dirty": return <AlertTriangle className="w-6 h-6" />;
      case "cleaning": return <Clock className="w-6 h-6 animate-pulse" />;
      case "clean": return <Check className="w-6 h-6" />;
      case "maintenance": return <Settings className="w-6 h-6" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* High-Contrast Header */}
      <header className="bg-primary text-white p-6 pt-12 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">HARMONY</h1>
          <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            Shift: Morning
          </div>
        </div>
        
        {/* Large Search Bar for Utility */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search rooms..."
            className="w-full bg-white/10 border-none rounded-2xl py-4 pl-12 text-white placeholder:text-white/40 focus:ring-2 focus:ring-accent"
          />
        </div>
      </header>

      {/* Stats Quick-View */}
      <div className="flex p-4 gap-2 overflow-x-auto no-scrollbar">
         {[
           { label: "Dirty", count: 2, color: "bg-red-500" },
           { label: "Cleaning", count: 1, color: "bg-amber-400" },
           { label: "Clean", count: 2, color: "bg-emerald-500" },
         ].map(stat => (
           <div key={stat.label} className="bg-white rounded-2xl p-4 flex-1 shadow-sm border border-slate-100 min-w-[100px]">
              <div className={cn("w-2 h-2 rounded-full mb-2", stat.color)} />
              <div className="text-xl font-bold text-primary">{stat.count}</div>
              <div className="text-[10px] uppercase font-bold text-primary/40">{stat.label}</div>
           </div>
         ))}
      </div>

      {/* Traffic Light Grid */}
      <div className="px-4 grid grid-cols-2 gap-4">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => updateRoomStatus(room.id, room.status as RoomStatus)}
            disabled={isUpdating === room.id}
            className={cn(
                "bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-3 active:scale-95 transition-all overflow-hidden relative",
                isUpdating === room.id && "opacity-50 scale-95"
            )}
          >
            {/* Status Ribbon */}
            <div className={cn(
              "absolute top-0 right-0 left-0 h-2",
              getStatusColor(room.status as RoomStatus)
            )} />

            <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center shadow-lg",
                getStatusColor(room.status as RoomStatus)
            )}>
              {getStatusIcon(room.status as RoomStatus)}
            </div>

            <div>
              <h3 className="text-xl font-bold text-primary">{room.name}</h3>
              <p className="text-xs font-medium text-primary/40 uppercase tracking-wide truncate max-w-[120px]">
                {room.guest}
              </p>
            </div>

            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
              room.status === "clean" ? "text-emerald-600 bg-emerald-50" : "text-primary/60 bg-slate-50"
            )}>
              {room.status}
            </div>
          </button>
        ))}
      </div>

      <StaffNavigation />
    </div>
  );
}



