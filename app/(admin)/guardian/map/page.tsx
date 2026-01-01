"use client";

import React, { useState, useEffect } from "react";
import { Map as MapIcon, MapPin, ShieldAlert, Sparkles, Navigation, Layers, ZoomIn, ZoomOut } from "lucide-react";
import { AdminNavigation } from "@/components/shared/admin-navigation";
import { useUserStore } from "@/store/use-user-store";
import { cn } from "@/lib/utils";

export default function GuardianMapPage() {
  const { mockSpaces, mockSOS } = useUserStore();
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
               <MapIcon className="w-5 h-5 text-awake-moss opacity-40" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-awake-moss/30">Geospatial Resonance</p>
            </div>
            <h1 className="text-4xl lg:text-6xl font-serif text-awake-moss italic leading-tight">Live Property Map</h1>
            <p className="text-xl font-serif italic text-awake-moss/40 leading-relaxed max-w-2xl">
              Visualizing the energetic flow across the sanctuary grounds.
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="awake-card p-2 flex gap-2 bg-white/40">
                <button className="p-3 rounded-xl bg-white text-awake-moss shadow-awake-soft">
                   <Layers className="w-5 h-5" />
                </button>
                <button className="p-3 rounded-xl hover:bg-white/50 text-awake-moss/40 transition-all">
                   <Navigation className="w-5 h-5" />
                </button>
             </div>
          </div>
        </header>

        {/* The Map Interface */}
        <div className="awake-card h-[500px] lg:h-[700px] bg-awake-bone border border-stone-200/50 relative overflow-hidden shadow-awake-floating">
           {/* Conceptual Map Background */}
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=2000')] bg-cover bg-center opacity-[0.05] grayscale" />
           
           {/* Grid Pattern Overlay */}
           <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4A5D44 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

           {/* SOS Pulse Markers */}
           {mockSOS.map((sos, i) => (
             <div 
               key={sos.id}
               className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
               style={{ top: `${45 + (i * 8)}%`, left: `${55 - (i * 12)}%` }}
             >
                <div className="relative">
                   <div className="absolute inset-0 w-32 h-32 bg-awake-terracotta rounded-full animate-ping opacity-[0.05]" />
                   <div className="relative w-12 h-12 bg-awake-terracotta rounded-full flex items-center justify-center border-4 border-awake-bone shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      <ShieldAlert className="w-6 h-6 text-white" />
                   </div>
                   <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-awake-terracotta/20 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-y-2">
                      <p className="text-[10px] font-black uppercase text-awake-terracotta">Emergency Signal</p>
                      <p className="text-sm font-serif italic text-awake-moss">{sos.location}</p>
                   </div>
                </div>
             </div>
           ))}

           {/* Sanctuary Status Nodes */}
           {mockSpaces.map((room, i) => {
             // Generate conceptual coordinates
             const positions = [
               { t: 20, l: 30 }, { t: 25, l: 60 }, { t: 15, l: 80 },
               { t: 40, l: 20 }, { t: 50, l: 45 }, { t: 45, l: 75 },
               { t: 70, l: 35 }, { t: 80, l: 15 }, { t: 75, l: 65 },
               { t: 85, l: 85 }, { t: 30, l: 10 }, { t: 10, l: 45 },
               { t: 60, l: 90 }, { t: 90, l: 50 }, { t: 5, l: 20 },
               { t: 65, l: 10 }, { t: 35, l: 95 }, { t: 95, l: 30 }
             ];
             const pos = positions[i % positions.length];

             return (
               <div 
                 key={room.id}
                 className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                 style={{ top: `${pos.t}%`, left: `${pos.l}%` }}
               >
                  <div className={cn(
                    "w-6 h-6 rounded-full border-4 border-awake-bone shadow-lg transition-all duration-700 group-hover:scale-150",
                    room.status === 'clean' ? "bg-awake-sage" : room.status === 'dirty' ? "bg-awake-terracotta" : "bg-awake-gold"
                  )}>
                     {room.status === 'cleaning' && (
                       <div className="absolute inset-0 bg-inherit rounded-full animate-ping opacity-40" />
                     )}
                  </div>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-stone-200/50 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:-translate-y-2">
                     <p className="text-[9px] font-black uppercase text-awake-moss/30">{room.type}</p>
                     <p className="text-sm font-serif italic text-awake-moss">{room.name}</p>
                  </div>
               </div>
             );
           })}

           {/* Map Controls */}
           <div className="absolute bottom-8 right-8 flex flex-col gap-3">
              <button className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-stone-200/50 flex items-center justify-center text-awake-moss shadow-lg hover:bg-white transition-all">
                 <ZoomIn className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-stone-200/50 flex items-center justify-center text-awake-moss shadow-lg hover:bg-white transition-all">
                 <ZoomOut className="w-5 h-5" />
              </button>
           </div>

           {/* Legend */}
           <div className="absolute bottom-8 left-8 awake-card px-6 py-4 bg-white/80 backdrop-blur-md border border-stone-200/50 flex gap-8 items-center">
              <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-awake-sage" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-awake-moss/40">Stable</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-awake-terracotta" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-awake-moss/40">Restore</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-awake-gold" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-awake-moss/40">In Flow</span>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
