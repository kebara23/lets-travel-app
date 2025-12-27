"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Calendar, Gift, User, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const tribeLinks = [
  { label: "Missions", href: "/missions", icon: Heart },
  { label: "Calendar", href: "/missions/calendar", icon: Calendar },
  { label: "Perks", href: "/missions/perks", icon: Gift },
  { label: "Profile", href: "/missions/profile", icon: User },
];

export function TribeNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-xl border border-white/20 rounded-full px-6 py-4 shadow-2xl flex justify-between items-center z-50">
      {tribeLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        
        return (
          <Link 
            key={link.href} 
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              isActive ? "text-primary scale-110" : "text-primary/40 hover:text-primary/60"
            )}
          >
            <Icon className={cn("w-6 h-6", isActive && "fill-primary/10")} />
            <span className="text-[10px] font-medium tracking-wide uppercase">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}


