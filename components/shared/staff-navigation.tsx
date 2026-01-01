"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ClipboardList, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const staffLinks = [
  { label: "Rooms", href: "/harmony/rooms", icon: LayoutGrid },
  { label: "Missions", href: "/harmony/missions", icon: ClipboardList },
  { label: "Me", href: "/harmony/profile", icon: User },
  { label: "Flow", href: "/harmony/flow", icon: Settings },
];

export function StaffNavigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-awake-violet/5 px-8 py-4 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {staffLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        
        return (
          <Link 
            key={link.label} 
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-500",
              isActive ? "text-awake-violet scale-110" : "text-awake-violet/30 hover:text-awake-violet/50"
            )}
          >
            <span className={cn(
              "p-2 rounded-xl transition-all duration-500 flex items-center justify-center",
              isActive && "bg-awake-violet/5"
            )}>
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
            </span>
            <span className={cn(
              "text-[9px] font-sans font-black uppercase tracking-[0.15em]",
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
