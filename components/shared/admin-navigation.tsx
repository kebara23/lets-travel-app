"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Users, 
  Settings, 
  Bell 
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { label: "Overview", href: "/guardian/dashboard", icon: LayoutDashboard },
  { label: "Live Map", href: "/guardian/map", icon: MapIcon },
  { label: "Directory", href: "/guardian/users", icon: Users },
  { label: "Alerts", href: "/guardian/alerts", icon: Bell },
  { label: "Global", href: "/guardian/settings", icon: Settings },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 bottom-0 w-64 bg-primary text-white p-6 hidden lg:flex flex-col border-r border-white/10">
      <div className="mb-10 px-2">
        <h1 className="text-xl font-bold tracking-tighter text-accent">AWAKE OS</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Guardian Console</p>
      </div>

      <div className="flex-1 space-y-2">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-accent text-primary font-bold shadow-lg shadow-accent/20" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-white/40 group-hover:text-white")} />
              <span className="text-sm">{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="pt-6 border-t border-white/10 flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
          AD
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate">Admin Guardian</p>
          <p className="text-[10px] text-white/40 truncate">System Manager</p>
        </div>
      </div>
    </nav>
  );
}


