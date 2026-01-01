"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Users, 
  Heart, 
  LayoutGrid, 
  Wrench, 
  Compass,
  Sparkles,
  Star
} from "lucide-react";
import { useUserStore } from "@/store/use-user-store";
import { cn } from "@/lib/utils";

const ROLES = [
  { role: "admin_guardian", label: "Guardian", desc: "Sacred Property Oversight", path: "/guardian/dashboard", icon: ShieldCheck, color: "bg-awake-moss" },
  { role: "facilitator", label: "Facilitator", desc: "Experience Curation", path: "/events", icon: Star, color: "bg-awake-gold" },
  { role: "guest_short", label: "Explorer", desc: "Short-term Pilgrimage", path: "/short-term/dashboard", icon: Compass, color: "bg-awake-sage" },
  { role: "guest_long", label: "Resident", desc: "Community Harmony", path: "/long-term/community", icon: Users, color: "bg-awake-lavender" },
  { role: "tribe", label: "Tribe", desc: "Missions & Perks", path: "/tribe/missions", icon: Heart, color: "bg-awake-terracotta" },
  { role: "staff_harmony", label: "Harmony", desc: "Housekeeping Rituals", path: "/harmony/rooms", icon: LayoutGrid, color: "bg-awake-sage" },
  { role: "staff_regeneration", label: "Regeneration", desc: "Restoration & Repairs", path: "/regeneration/tickets", icon: Wrench, color: "bg-awake-terracotta" },
];

export default function RootPage() {
  const { setUser } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRoleSetup = (role: any) => {
    setUser({
      id: "demo-soul-001",
      email: "soul@awake.cr",
      role: role === 'facilitator' ? 'tribe' : role,
      organization_id: "org-awake-001",
      full_name: "Demo Soul",
      avatar_url: null,
      current_status: "active",
      is_event_leader: role === 'facilitator' || role === 'admin_guardian',
      created_at: new Date().toISOString()
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-awake-bone p-10 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Organic Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-awake-sage/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-awake-terracotta/5 rounded-full blur-[120px]" />

      <div className="max-w-6xl w-full space-y-20 relative z-10 animate-in">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/40 backdrop-blur-md border border-stone-200/50 text-awake-moss text-[10px] font-black uppercase tracking-[0.4em] shadow-awake-soft">
            <Sparkles className="w-4 h-4 text-awake-gold animate-pulse" /> Simulation Portal
          </div>
          <h1 className="text-5xl lg:text-8xl font-serif text-awake-moss italic leading-tight tracking-tight">AWAKE OS</h1>
          <p className="text-awake-moss/40 text-2xl font-serif italic max-w-2xl mx-auto">
            Entering the sanctuary. Select your perspective to begin the flow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <a
                key={r.role}
                href={r.path}
                onClick={() => handleRoleSetup(r.role)}
                className="awake-card p-12 text-left hover:bg-white hover:shadow-awake-floating active:scale-95 transition-all group flex flex-col gap-8 no-underline"
              >
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-transform duration-700 group-hover:scale-110", r.color)}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-serif text-awake-moss group-hover:text-awake-moss/60 transition-colors italic">{r.label}</h3>
                  <p className="text-sm text-awake-moss/30 font-sans font-bold uppercase tracking-widest leading-relaxed">{r.desc}</p>
                </div>
              </a>
            );
          })}
        </div>

        <div className="pt-16 text-center">
           <p className="text-[11px] font-black uppercase tracking-[0.6em] text-awake-moss/20">
             Invisible Technology • Human Connection
           </p>
        </div>
      </div>
    </div>
  );
}
