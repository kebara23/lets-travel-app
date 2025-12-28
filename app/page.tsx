"use client";

import React from "react";
import { 
  ShieldCheck, 
  Users, 
  Heart, 
  LayoutGrid, 
  Wrench, 
  Compass,
  Sparkles
} from "lucide-react";
import { useUserStore } from "@/store/use-user-store";
import { cn } from "@/lib/utils";

const ROLES = [
  { role: "admin_guardian", label: "Admin Guardian", desc: "Global Control & SOS", path: "/guardian/dashboard", icon: ShieldCheck, color: "bg-blue-500" },
  { role: "guest_short", label: "Guest Short-Term", desc: "Itinerary & SOS", path: "/short-term/dashboard", icon: Compass, color: "bg-emerald-500" },
  { role: "guest_long", label: "Guest Resident", desc: "Community & Chat", path: "/long-term/community", icon: Users, color: "bg-purple-500" },
  { role: "tribe", label: "The Tribe", desc: "Missions & Perks", path: "/missions", icon: Heart, color: "bg-red-500" },
  { role: "staff_harmony", label: "Staff Harmony", desc: "Housekeeping", path: "/harmony/rooms", icon: LayoutGrid, color: "bg-amber-500" },
  { role: "staff_regeneration", label: "Staff Regeneration", desc: "Maintenance", path: "/regeneration/tickets", icon: Wrench, color: "bg-slate-700" },
];

export default function RootPage() {
  const { setUser } = useUserStore();

  const handleRoleSetup = (role: any) => {
    // Set the user in the store so the dashboard has context
    setUser({
      id: "demo-user-123",
      email: "demo@awake.com",
      role: role,
      organization_id: "org-awake-001",
      full_name: "Demo User",
      avatar_url: null,
      current_status: "active",
      created_at: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-[#F5EFE6] p-8 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-4 h-4 text-accent" /> Simulation Portal
          </div>
          <h1 className="text-6xl font-light text-primary tracking-tight">AWAKE OS</h1>
          <p className="text-primary/40 text-xl font-medium italic">Select your perspective to enter the ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <a
                key={r.role}
                href={r.path}
                onClick={() => handleRoleSetup(r.role)}
                className="luxury-card p-8 text-left hover:scale-[1.02] active:scale-95 transition-all group flex flex-col gap-6 no-underline"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", r.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors">{r.label}</h3>
                  <p className="text-sm text-primary/40 font-medium mt-1">{r.desc}</p>
                </div>
              </a>
            );
          })}
        </div>

        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-primary/20 pt-12">
          Invisible Technology • Human Connection
        </p>
      </div>
    </div>
  );
}
