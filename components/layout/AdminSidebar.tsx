"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Plane,
  Users,
  MapPin,
  AlertTriangle,
  LogOut,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Trips Manager",
    icon: Plane,
    href: "/admin/trips",
  },
  {
    title: "Clients",
    icon: Users,
    href: "/admin/clients",
  },
  {
    title: "Live Tracker",
    icon: MapPin,
    href: "/admin/tracker",
  },
  {
    title: "SOS Center",
    icon: AlertTriangle,
    href: "/admin/sos",
    variant: "destructive" as const,
  },
];

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        // Continue to redirect even if there's an error
      }

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Unexpected error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while signing out, but we are redirecting you.",
      });
    } finally {
      // Always redirect to login, even if there was an error
      // Use window.location to force a full page reload and clear any cached session state
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex h-screen w-[250px] flex-col bg-slate-900 border-r border-slate-800">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <h1 className="text-xl font-bold text-white font-body">LETS Admin</h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 font-body",
                  isActive
                    ? "bg-slate-800 text-white hover:bg-slate-700"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  item.variant === "destructive" && isActive && "bg-red-900/30 hover:bg-red-900/40"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer - User Profile & Logout */}
      <div className="border-t border-slate-800 p-4 space-y-2">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-800/50">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate font-body">Admin User</p>
            <p className="text-xs text-slate-400 truncate font-body">admin@lets.com</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-slate-300 hover:bg-slate-800 hover:text-white font-body"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}

