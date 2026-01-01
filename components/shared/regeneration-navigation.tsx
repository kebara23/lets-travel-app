"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, Wrench, CheckCircle2, User } from "lucide-react";
import { cn } from "@/lib/utils";

const maintenanceLinks = [
  { label: "Inbox", href: "/regeneration/tickets", icon: Inbox },
  { label: "Active", href: "/regeneration/active", icon: Wrench },
  { label: "Resolved", href: "/regeneration/resolved", icon: CheckCircle2 },
  { label: "Me", href: "/regeneration/profile", icon: User },
];

export function RegenerationNavigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav className="fixed bottom-6 left-4 right-6 bg-white/90 backdrop-blur-2xl px-6 py-4 rounded-[2.5rem] border border-stone-200/50 flex justify-between items-center z-50 shadow-awake-floating gap-4">
      {maintenanceLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        
        return (
          <Link 
            key={link.label} 
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-500 relative",
              isActive ? "text-awake-moss scale-110" : "text-awake-moss/30"
            )}
          >
            {isActive && (
              <div className="absolute -top-1 w-1 h-1 bg-awake-terracotta rounded-full animate-pulse" />
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
  );
}
