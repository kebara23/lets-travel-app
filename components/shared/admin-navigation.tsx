"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Users, 
  Settings, 
  Bell,
  Sparkles,
  Zap,
  Calendar,
  Star,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { label: "Overview", href: "/guardian/dashboard", icon: LayoutDashboard },
  { label: "Missions", href: "/guardian/missions", icon: Zap },
  { label: "Experiences", href: "/guardian/experiences", icon: Calendar },
  { label: "Facilitators", href: "/guardian/facilitators", icon: Star },
  { label: "Live Map", href: "/guardian/map", icon: MapIcon },
  { label: "Souls", href: "/guardian/users", icon: Users },
  { label: "Alerts", href: "/guardian/alerts", icon: Bell },
  { label: "Identity", href: "/guardian/settings", icon: Settings },
];

export function AdminNavigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* DESKTOP SIDEBAR (Visible only on LG screens) */}
      <aside className="fixed left-8 top-8 bottom-8 w-24 bg-white/80 backdrop-blur-2xl rounded-4xl border border-stone-200/50 shadow-awake-floating hidden lg:flex flex-col items-center py-12 z-50">
        <div className="mb-12">
          <div className="w-12 h-12 rounded-full bg-awake-moss flex items-center justify-center text-awake-bone shadow-lg shadow-awake-moss/20">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <nav className="flex-1 w-full px-4 flex flex-col items-center gap-6 overflow-y-auto no-scrollbar">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-500 group relative w-full",
                  isActive 
                    ? "text-awake-moss" 
                    : "text-awake-moss/30 hover:text-awake-moss/60 hover:bg-white/50"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-awake-sage/5 rounded-2xl -z-10 animate-in fade-in" />
                )}
                <Icon className={cn(
                  "w-6 h-6 transition-transform duration-500 group-hover:scale-110",
                  isActive && "stroke-[2.5px]"
                )} />
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest text-center leading-tight transition-all",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                )}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <button className="w-12 h-12 rounded-full border border-stone-200/50 flex items-center justify-center overflow-hidden hover:border-awake-moss/30 transition-colors">
            <div className="w-full h-full bg-awake-lavender/10 flex items-center justify-center text-awake-moss font-bold text-xs">
              AD
            </div>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV (Visible only on small screens) */}
      <nav className="fixed bottom-6 left-4 right-6 bg-white/90 backdrop-blur-2xl px-6 py-4 rounded-[2.5rem] border border-stone-200/50 flex lg:hidden justify-between items-center z-50 shadow-awake-floating overflow-x-auto no-scrollbar gap-4">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link 
              key={link.label} 
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-500 relative min-w-[50px]",
                isActive ? "text-awake-moss scale-110" : "text-awake-moss/30"
              )}
            >
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-awake-sage rounded-full animate-pulse" />
              )}
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
              <span className={cn(
                "text-[8px] font-sans font-black uppercase tracking-[0.1em]",
                isActive ? "opacity-100" : "opacity-40"
              )}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
