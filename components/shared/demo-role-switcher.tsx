"use client";

import React, { useState, useEffect } from "react";
import { 
  UserCircle, 
  ShieldCheck, 
  Trash2, 
  Sparkles,
  RefreshCw,
  ChevronDown,
  Layout
} from "lucide-react";
import { useUserStore } from "@/store/use-user-store";
import { UserRole } from "@/types/database";
import { cn } from "@/lib/utils";

const ROLES: { role: UserRole; label: string; desc: string; path: string }[] = [
  { role: "admin_guardian", label: "Guardian", desc: "Property Resonance", path: "/guardian/dashboard" },
  { role: "guest_short", label: "Explorer", desc: "Daily Flow", path: "/short-term/dashboard" },
  { role: "guest_long", label: "Resident soul", desc: "Collective Hub", path: "/long-term/community" },
  { role: "tribe", label: "The Tribe", desc: "Sacred Missions", path: "/missions" },
  { role: "staff_harmony", label: "Harmony Team", desc: "Space Care", path: "/harmony/rooms" },
  { role: "staff_regeneration", label: "Regen Team", desc: "Sanctuary Maintenance", path: "/regeneration/tickets" },
];

export function DemoRoleSwitcher() {
  const { user, setUser, logout } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const switchRole = (role: UserRole, path: string) => {
    setUser({
      id: "demo-soul-123",
      email: "soul@awake.cr",
      role: role,
      organization_id: "org-awake-001",
      full_name: "Awake Soul",
      avatar_url: null,
      current_status: "active",
      created_at: new Date().toISOString()
    });
    window.location.href = path;
  };

  return (
    <div className="fixed top-8 right-8 z-[9999]">
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-4 px-6 py-3 bg-white/80 backdrop-blur-2xl border border-awake-sand/40 rounded-full shadow-awake-soft hover:scale-105 transition-all text-awake-green group"
        >
          <div className="w-10 h-10 rounded-full bg-awake-green/5 flex items-center justify-center group-hover:bg-awake-green group-hover:text-white transition-all">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-[10px] font-sans font-black uppercase tracking-[0.2em] opacity-40">Resonance</p>
            <p className="text-sm font-serif italic font-bold">
              {user?.role ? user.role.replace('_', ' ') : 'Select Perspective'}
            </p>
          </div>
          <ChevronDown className={cn("w-4 h-4 opacity-40 transition-transform duration-500", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div className="absolute top-16 right-0 w-80 bg-white/95 backdrop-blur-3xl border border-awake-sand/40 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="p-8 border-b border-awake-sand/20 bg-awake-paper/40 flex justify-between items-center">
               <h4 className="text-[10px] font-sans font-black uppercase tracking-[0.3em] text-awake-green/30">Sacred Perspectivies</h4>
               <Sparkles className="w-5 h-5 text-awake-gold animate-pulse" />
            </div>

            <div className="p-3 max-h-[60vh] overflow-y-auto space-y-1">
              {ROLES.map((r) => (
                <button
                  key={r.role}
                  onClick={() => switchRole(r.role, r.path)}
                  className={cn(
                    "w-full text-left p-4 rounded-3xl transition-all duration-500 flex items-center gap-4 group",
                    user?.role === r.role 
                      ? "bg-awake-green text-awake-paper shadow-awake-clay" 
                      : "hover:bg-awake-paper text-awake-olive/60 hover:text-awake-green"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-700",
                    user?.role === r.role ? "bg-white/10" : "bg-awake-green/5 group-hover:bg-awake-green group-hover:text-white"
                  )}>
                     <Layout className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-serif italic">{r.label}</p>
                    <p className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-40">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-awake-paper/50 flex gap-3">
               <button 
                onClick={() => { logout(); window.location.href = "/login"; }}
                className="flex-1 flex items-center justify-center gap-3 py-4 rounded-full bg-white border border-awake-sand/40 text-awake-clay text-[10px] font-sans font-black uppercase tracking-[0.2em] hover:bg-awake-clay hover:text-white transition-all duration-500"
               >
                  <Trash2 className="w-4 h-4" /> End Session
               </button>
               <button 
                onClick={() => window.location.reload()}
                className="w-16 flex items-center justify-center rounded-full bg-white border border-awake-sand/40 text-awake-green/30 hover:text-awake-green transition-all duration-500"
               >
                  <RefreshCw className="w-5 h-5" />
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
