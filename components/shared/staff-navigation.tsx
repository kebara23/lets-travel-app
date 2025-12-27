"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ClipboardList, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

const staffLinks = [
  { label: "Rooms", href: "/harmony/rooms", icon: LayoutGrid },
  { label: "Tasks", href: "/harmony/tasks", icon: ClipboardList },
  { label: "Profile", href: "/harmony/profile", icon: User },
  { label: "Settings", href: "/harmony/settings", icon: Settings },
];

export function StaffNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary text-white px-6 py-4 flex justify-between items-center z-50">
      {staffLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname.startsWith(link.href);
        
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


