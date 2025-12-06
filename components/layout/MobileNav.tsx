"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Map, Key, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Home",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "Itinerary",
    icon: Map,
    href: "/itinerary",
  },
  {
    label: "Insider",
    icon: Key,
    href: "/explore",
  },
  {
    label: "Chat",
    icon: MessageCircle,
    href: "/messages",
  },
];

export function MobileNav() {
  const pathname = usePathname();

  // Hide navigation on these routes
  const hiddenRoutes = [
    "/login",
    "/signup",
    "/",
  ];

  // Hide if current route is in hiddenRoutes or starts with /admin
  const shouldHide = 
    hiddenRoutes.includes(pathname) || 
    pathname.startsWith("/admin");

  if (shouldHide) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full h-16 bg-background/80 backdrop-blur-md border-t border-slate-200 z-40">
      <div className="flex justify-around items-center h-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                "hover:bg-slate-50 active:bg-slate-100 rounded-t-lg"
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium transition-colors font-body",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

