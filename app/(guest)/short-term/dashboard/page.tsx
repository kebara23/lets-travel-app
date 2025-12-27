"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  Circle,
  Wind,
  Coffee,
  Moon
} from "lucide-react";
import { GuestNavigation } from "@/components/shared/guest-navigation";
import { cn } from "@/lib/utils";

const MOCK_ITINERARY = [
  { id: "1", title: "Sunrise Meditation", type: "Wellness", time: "07:00 AM", completed: true, icon: Wind },
  { id: "2", title: "Artisan Breakfast", type: "Gastronomy", time: "09:30 AM", completed: false, icon: Coffee },
  { id: "3", title: "Secret Cove Hike", type: "Activity", time: "02:00 PM", completed: false, icon: MapPin },
  { id: "4", title: "Stargazing & Wine", type: "Wellness", time: "09:00 PM", completed: false, icon: Moon },
];

export default function GuestDashboardPage() {
  const [items, setItems] = useState(MOCK_ITINERARY);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = items.filter(i => i.completed).length;

  return (
    <div className="min-h-screen bg-background pb-32 pt-12 px-6">
      {/* Dynamic Header */}
      <header className="mb-10 space-y-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-1">
              Currently in Paradise
            </p>
            <h1 className="text-4xl font-light text-primary">Aura Cabin</h1>
          </div>
          <div className="luxury-card p-3 rounded-2xl flex flex-col items-center">
             <span className="text-xl font-bold">24°</span>
             <span className="text-[10px] text-primary/40 uppercase">Sunny</span>
          </div>
        </div>
      </header>

      {/* Hero "Dopamine" Card */}
      <div className="relative overflow-hidden mb-10 p-8 rounded-[2rem] bg-primary text-white shadow-2xl">
        <div className="relative z-10">
          <h2 className="text-2xl font-light mb-2">Today's Journey</h2>
          <div className="flex items-end gap-2 mb-6">
             <span className="text-5xl font-bold">{completedCount}</span>
             <span className="text-xl text-white/60 mb-1">/ {items.length}</span>
          </div>
          <p className="text-sm text-white/80 max-w-[200px] leading-relaxed">
            Every step is a moment of reconnection. Enjoy your flow.
          </p>
        </div>
        <Sparkles className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12" />
        
        {/* Progress Dots */}
        <div className="absolute top-8 right-8 flex gap-1.5">
          {items.map((item) => (
            <div 
              key={item.id}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-500",
                item.completed ? "bg-accent w-6" : "bg-white/20"
              )}
            />
          ))}
        </div>
      </div>

      {/* Vertical Itinerary Flow */}
      <div className="space-y-8 relative">
        {/* Connection Line */}
        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-primary/5" />

        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex gap-6 items-start group">
              {/* Timeline Marker */}
              <button 
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm",
                  item.completed 
                    ? "bg-accent text-white rotate-[360deg]" 
                    : "bg-white text-primary hover:scale-105"
                )}
              >
                {item.completed ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
              </button>

              {/* Content Card */}
              <div 
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "flex-1 p-5 luxury-card transition-all duration-500 cursor-pointer",
                  item.completed && "opacity-40 translate-x-2 grayscale"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] uppercase tracking-widest text-accent font-bold">
                    {item.type}
                  </span>
                  <span className="text-xs text-primary/40">{item.time}</span>
                </div>
                <h3 className="text-lg font-medium text-primary mb-2">{item.title}</h3>
                <div className="flex items-center text-xs text-primary/40 font-medium">
                  Details <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* "Invisible" Upsell / Scarcity Component */}
      <div className="mt-12 p-6 rounded-3xl border-2 border-dashed border-accent/20 flex flex-col items-center text-center space-y-4">
         <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <Sparkles className="w-6 h-6" />
         </div>
         <div>
            <h4 className="font-medium text-primary">Wellness Exclusive</h4>
            <p className="text-sm text-primary/60">Only 2 slots left for Sunset Massage</p>
         </div>
         <button className="px-6 py-2 bg-accent text-white rounded-full text-sm font-semibold shadow-lg shadow-accent/20 active:scale-95 transition-all">
            Reserve Now
         </button>
      </div>

      <GuestNavigation />
    </div>
  );
}


