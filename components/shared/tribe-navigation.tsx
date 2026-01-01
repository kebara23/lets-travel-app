"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Star, User, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const tribeLinks = [
  { label: "Missions", href: "/tribe/missions", icon: Heart },
  { label: "Exchange", href: "/tribe/missions/perks", icon: Star },
  { label: "Soul", href: "/tribe/profile", icon: User },
];

export function TribeNavigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-2xl px-10 py-5 rounded-full border border-stone-200/50 flex items-center gap-12 z-50 shadow-awake-floating transition-all duration-700 hover:scale-105">
      {tribeLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        
        return (
          <Link 
            key={link.label} 
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-500 relative group",
              isActive ? "text-awake-moss scale-110" : "text-awake-moss/30 hover:text-awake-moss/50"
            )}
          >
            {isActive && (
              <div className="absolute -top-1 w-1 h-1 bg-awake-gold rounded-full animate-pulse" />
            )}
            <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
            <span className={cn(
              "text-[9px] font-sans font-black uppercase tracking-[0.2em] transition-all",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
            )}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
