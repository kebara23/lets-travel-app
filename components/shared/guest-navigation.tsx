"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Calendar, Utensils, ShieldAlert, User } from "lucide-react";
import { cn } from "@/lib/utils";

const guestLinks = [
  { label: "Explore", href: "/short-term/dashboard", icon: Compass },
  { label: "Plan", href: "/short-term/itinerary", icon: Calendar },
  { label: "Dining", href: "/short-term/dining", icon: Utensils },
  { label: "SOS", href: "/short-term/sos", icon: ShieldAlert, alert: true },
  { label: "Me", href: "/short-term/profile", icon: User },
];

export function GuestNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-white/70 backdrop-blur-2xl border border-white/30 rounded-[2.5rem] px-6 py-3 shadow-2xl flex justify-between items-center z-50">
      {guestLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        
        return (
          <Link 
            key={link.href} 
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-500 relative",
              isActive ? "text-primary" : "text-primary/30 hover:text-primary/50",
              link.alert && "text-red-400"
            )}
          >
            <div className={cn(
              "p-2 rounded-2xl transition-all duration-500",
              isActive && "bg-primary/5 shadow-inner scale-110"
            )}>
              <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
            </div>
            {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full animate-pulse" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}


