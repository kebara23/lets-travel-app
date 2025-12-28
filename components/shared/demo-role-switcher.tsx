"use client";

import React from "react";
import { 
  UserCircle, 
  ShieldCheck, 
  Trash2, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import { useUserStore } from "@/store/use-user-store";
import { UserRole } from "@/types/database";
import { cn } from "@/lib/utils";

const ROLES: { role: UserRole; label: string; desc: string; path: string }[] = [
  { role: "admin_guardian", label: "Guardian (Manager)", desc: "Global Control, Map & SOS", path: "/guardian/dashboard" },
  { role: "guest_short", label: "Guest (Short-Term)", desc: "Itinerary, Dopamine & SOS", path: "/short-term/dashboard" },
  { role: "guest_long", label: "Guest (Resident)", desc: "Community, Chat & Events", path: "/long-term/community" },
  { role: "tribe", label: "The Tribe (Volunteer)", desc: "Missions & Contributions", path: "/missions" },
  { role: "staff_harmony", label: "Staff (Housekeeping)", desc: "Traffic Light Room Status", path: "/harmony/rooms" },
  { role: "staff_regeneration", label: "Staff (Maintenance)", desc: "Ticket System & Repair", path: "/regeneration/tickets" },
];

export function DemoRoleSwitcher() {
  const { user, setUser, logout } = useUserStore();

  const switchRole = (role: UserRole, path: string) => {
    console.log("Switching role to:", role, "Path:", path);
    
    // 1. Update Global State
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
    
    // 2. Immediate Hard Redirection
    // We use window.location.href to bypass any router hydration issues in the demo
    window.location.href = path;
  };

  return (
    <div className="fixed top-6 right-6 z-[200]">
      <div className="group relative">
        <button className="w-12 h-12 bg-white/80 backdrop-blur-xl border border-primary/10 rounded-full shadow-2xl flex items-center justify-center text-primary hover:scale-110 transition-all">
          <ShieldCheck className="w-6 h-6" />
        </button>

        <div className="absolute top-0 right-14 w-80 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 translate-x-4 group-hover:translate-x-0">
          <div className="luxury-card p-6 bg-white/90 backdrop-blur-2xl border border-primary/10">
            <div className="flex justify-between items-center mb-6">
               <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-primary">Simulator</h4>
                  <p className="text-[10px] text-primary/40 font-bold uppercase">Role-Based Previews</p>
               </div>
               <Sparkles className="w-4 h-4 text-accent" />
            </div>

            <div className="space-y-2">
              {ROLES.map((r) => (
                <button
                  key={r.role}
                  onClick={() => switchRole(r.role, r.path)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3",
                    user?.role === r.role 
                      ? "bg-primary text-white border-primary" 
                      : "bg-white border-primary/5 hover:border-accent/50 text-primary/70"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    user?.role === r.role ? "bg-white/10" : "bg-primary/5"
                  )}>
                     <UserCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{r.label}</p>
                    <p className="text-[9px] opacity-60 font-medium uppercase tracking-tighter">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-primary/5 flex gap-2">
               <button 
                onClick={() => { logout(); window.location.href = "/login"; }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest"
               >
                  <Trash2 className="w-3 h-3" /> Clear Session
               </button>
               <button 
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 text-primary/40 text-[10px] font-black uppercase tracking-widest"
               >
                  <RefreshCw className="w-3 h-3" /> Reload
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
