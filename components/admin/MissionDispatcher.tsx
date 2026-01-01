"use client";

import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  Wrench, 
  Users, 
  Send, 
  ChevronRight,
  Home,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore, TribeMission } from "@/store/use-user-store";
import { Ticket } from "@/types/database";

interface MissionDispatcherProps {
  onClose: () => void;
}

type DispatchType = 'harmony' | 'regeneration' | 'tribe';

export function MissionDispatcher({ onClose }: MissionDispatcherProps) {
  const { mockSpaces, updateMockSpace, addMockTicket, addTribeMission } = useUserStore();
  const [activeType, setActiveType] = useState<DispatchType>('harmony');
  const [isSuccess, setIsSuccess] = useState(false);

  // Form States
  const [selectedSpaceId, setSelectedSpaceId] = useState("");
  const [priority, setPriority] = useState<'dirty' | 'cleaning' | 'clean' | 'ready'>('dirty');
  const [regenTitle, setRegenTitle] = useState("");
  const [regenDesc, setRegenDesc] = useState("");
  const [regenPriority, setRegenPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [tribeTitle, setTribeTitle] = useState("");
  const [tribeDesc, setTribeDesc] = useState("");
  const [tribeSlots, setTribeSlots] = useState(1);
  const [tribeEnergy, setTribeEnergy] = useState("2 Hours");

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeType === 'harmony') {
      updateMockSpace(selectedSpaceId, priority);
    } else if (activeType === 'regeneration') {
      const spaceName = mockSpaces.find(s => s.id === selectedSpaceId)?.name || 'Unknown';
      const newTicket: Ticket = {
        id: `T-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        organization_id: "org-awake-001",
        space_id: selectedSpaceId,
        creator_id: "guardian-001",
        assigned_to: null,
        type: 'maintenance',
        title: `${regenTitle} • ${spaceName}`,
        description: regenDesc,
        status: 'open',
        priority: regenPriority,
        created_at: new Date().toISOString(),
        image_url: null
      };
      addMockTicket(newTicket);
    } else if (activeType === 'tribe') {
      const newMission: TribeMission = {
        id: `M-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        title: tribeTitle,
        description: tribeDesc,
        slots: tribeSlots,
        slots_filled: 0,
        energy_value: tribeEnergy,
        status: 'open',
        created_at: new Date().toISOString()
      };
      addTribeMission(newMission);
    }

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  // Group spaces by type for the dropdown
  const groupedSpaces = mockSpaces.reduce((acc, space) => {
    if (!acc[space.type]) acc[space.type] = [];
    acc[space.type].push(space);
    return acc;
  }, {} as Record<string, typeof mockSpaces>);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-6 animate-in fade-in bg-awake-bone/40 backdrop-blur-xl">
      <div className="awake-card w-full w-full lg:max-w-2xl bg-white overflow-hidden shadow-awake-floating animate-in zoom-in duration-500">
        
        {isSuccess ? (
          <div className="p-20 text-center space-y-6 flex flex-col items-center justify-center">
             <div className="w-24 h-24 rounded-full bg-awake-sage flex items-center justify-center text-white shadow-lg animate-bounce">
                <Sparkles className="w-10 h-10" />
             </div>
             <h2 className="text-4xl font-serif text-awake-moss italic">Flow Directed</h2>
             <p className="text-awake-moss/40 font-sans font-black uppercase tracking-widest text-xs">
                The sanctuary is responding to your intent.
             </p>
          </div>
        ) : (
          <form onSubmit={handleDispatch} className="flex flex-col h-full">
            <header className="p-6 lg:p-10 border-b border-stone-100 flex justify-between items-center bg-awake-bone/20">
              <div className="space-y-1">
                <h2 className="text-3xl font-serif text-awake-moss italic">Mission Dispatcher</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-awake-moss/30">Directing the Pulse</p>
              </div>
              <button type="button" onClick={onClose} className="p-4 text-awake-moss/20 hover:text-awake-moss transition-colors">
                <X className="w-6 h-6" />
              </button>
            </header>

            {/* Pillar Selector */}
            <div className="p-4 flex gap-4 bg-awake-bone/10 border-b border-stone-100">
              {[
                { id: 'harmony', label: 'Harmony', icon: Sparkles, color: 'text-awake-sage' },
                { id: 'regeneration', label: 'Regeneration', icon: Wrench, color: 'text-awake-terracotta' },
                { id: 'tribe', label: 'Tribe', icon: Users, color: 'text-awake-gold' },
              ].map((pill) => {
                const Icon = pill.icon;
                const isActive = activeType === pill.id;
                
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setActiveType(pill.id as DispatchType)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl transition-all duration-500 border",
                      isActive 
                        ? cn("bg-white shadow-awake-soft border-stone-200/50", pill.color)
                        : "bg-transparent border-transparent text-awake-moss/20 hover:text-awake-moss/40"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{pill.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-6 lg:p-10 space-y-8 flex-1 overflow-y-auto max-h-[60vh] no-scrollbar">
              
              {/* Common: Space Selector for Harmony/Regen */}
              {activeType !== 'tribe' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30 flex items-center gap-2">
                    <Home className="w-3 h-3" /> Target Sanctuary (Full Inventory)
                  </label>
                  <select 
                    required
                    value={selectedSpaceId}
                    onChange={(e) => setSelectedSpaceId(e.target.value)}
                    className="w-full bg-awake-bone/40 border border-stone-200/50 rounded-2xl p-5 text-awake-moss font-serif italic text-xl focus:outline-none focus:ring-4 focus:ring-awake-sage/5 transition-all appearance-none"
                  >
                    <option value="">Choose a Space...</option>
                    {Object.entries(groupedSpaces).map(([type, spaces]) => (
                      <optgroup key={type} label={type} className="font-sans font-bold text-xs uppercase tracking-widest text-awake-moss/40">
                        {spaces.map(s => (
                          <option key={s.id} value={s.id} className="font-serif italic text-lg text-awake-moss">{s.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}

              {/* Harmony Specific */}
              {activeType === 'harmony' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Set Resonance Level
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'dirty', label: 'Deep Cleanse', color: 'bg-awake-terracotta' },
                      { id: 'cleaning', label: 'In Flow', color: 'bg-awake-gold' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPriority(opt.id as any)}
                        className={cn(
                          "p-6 rounded-3xl border text-left transition-all duration-500 flex flex-col gap-2",
                          priority === opt.id ? "bg-white border-awake-sage shadow-awake-soft" : "bg-awake-bone/20 border-stone-100 opacity-40 hover:opacity-60"
                        )}
                      >
                        <div className={cn("w-3 h-3 rounded-full", opt.color)} />
                        <span className="text-sm font-serif italic text-awake-moss">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Regeneration Specific */}
              {activeType === 'regeneration' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30 flex items-center gap-2">
                      <Wrench className="w-3 h-3" /> Restoration Focus
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Water Flow Restoration"
                      value={regenTitle}
                      onChange={(e) => setRegenTitle(e.target.value)}
                      className="w-full bg-awake-bone/40 border border-stone-200/50 rounded-2xl p-5 text-awake-moss font-serif italic text-xl focus:outline-none focus:ring-4 focus:ring-awake-terracotta/5 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Detailed Description</label>
                    <textarea 
                      required
                      placeholder="Describe the imbalance..."
                      value={regenDesc}
                      onChange={(e) => setRegenDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-awake-bone/40 border border-stone-200/50 rounded-2xl p-5 text-awake-moss font-sans text-sm focus:outline-none focus:ring-4 focus:ring-awake-terracotta/5 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Tribe Specific */}
              {activeType === 'tribe' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30 flex items-center gap-2">
                      <Users className="w-3 h-3" /> Mission Title
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Seed Sowing Ceremony"
                      value={tribeTitle}
                      onChange={(e) => setTribeTitle(e.target.value)}
                      className="w-full bg-awake-bone/40 border border-stone-200/50 rounded-2xl p-5 text-awake-moss font-serif italic text-xl focus:outline-none focus:ring-4 focus:ring-awake-gold/5 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Open Souls (Slots)</label>
                      <input 
                        type="number"
                        min={1}
                        value={tribeSlots}
                        onChange={(e) => setTribeSlots(parseInt(e.target.value))}
                        className="w-full bg-awake-bone/40 border border-stone-200/50 rounded-2xl p-5 text-awake-moss font-sans focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Energy Exchange</label>
                      <input 
                        type="text"
                        value={tribeEnergy}
                        onChange={(e) => setTribeEnergy(e.target.value)}
                        className="w-full bg-awake-bone/40 border border-stone-200/50 rounded-2xl p-5 text-awake-moss font-sans focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <footer className="p-6 lg:p-10 border-t border-stone-100 bg-white">
              <button
                type="submit"
                className={cn(
                  "w-full py-6 rounded-full font-sans font-black uppercase tracking-[0.4em] text-xs transition-all duration-1000 flex items-center justify-center gap-4 text-white shadow-awake-floating",
                  activeType === 'harmony' && "bg-awake-sage hover:bg-awake-sage/90",
                  activeType === 'regeneration' && "bg-awake-terracotta hover:bg-awake-terracotta/90",
                  activeType === 'tribe' && "bg-awake-moss hover:bg-awake-moss/90"
                )}
              >
                Dispatch Intent <Send className="w-4 h-4" />
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}
