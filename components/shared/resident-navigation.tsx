"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Users, Calendar, Home, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const residentLinks = [
  { label: "Feed", href: "/long-term/community", icon: Home },
  { label: "Connect", href: "/long-term/directory", icon: Users },
  { label: "Chat", href: "/long-term/chat", icon: MessageSquare },
  { label: "Events", href: "/long-term/events", icon: Calendar },
  { label: "Me", href: "/long-term/profile", icon: Search },
];

export function ResidentNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-white/80 backdrop-blur-2xl border border-white/30 rounded-full px-6 py-4 shadow-2xl flex justify-between items-center z-50">
      {residentLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        
        return (
          <Link 
            key={link.href} 
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              isActive ? "text-primary scale-110" : "text-primary/30 hover:text-primary/60"
            )}
          >
            <Icon className={cn("w-6 h-6", isActive && "fill-primary/5")} />
            <span className="text-[10px] font-bold uppercase tracking-tight">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}


