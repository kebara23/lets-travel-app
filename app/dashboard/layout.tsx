"use client";

import { NotificationBell } from "@/components/ui/NotificationBell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Client Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-heading text-xl font-bold text-primary">LETS</div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

