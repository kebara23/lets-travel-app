"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, Inbox, CheckCircle2, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const maintenanceLinks = [
  { label: "Inbox", href: "/regeneration/tickets", icon: Inbox },
  { label: "Active", href: "/regeneration/active", icon: Wrench },
  { label: "Resolved", href: "/regeneration/resolved", icon: CheckCircle2 },
  { label: "Me", href: "/regeneration/profile", icon: User },
];

export function RegenerationNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1e293b] text-white px-6 py-4 flex justify-between items-center z-50">
      {maintenanceLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        
        return (
          <Link 
            key={link.href} 
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              isActive ? "text-accent scale-110" : "text-white/40"
            )}
          >
            <Icon className="w-7 h-7" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}


