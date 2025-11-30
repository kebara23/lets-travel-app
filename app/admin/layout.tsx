"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "@/components/admin/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationBell } from "@/components/ui/NotificationBell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  // Initialize Supabase client safely
  useEffect(() => {
    try {
      setSupabase(createClient());
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    async function checkAdminAccess() {
      if (!supabase) return;
      
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (!session) {
          router.push("/login");
          return;
        }

        // FAILSAFE: Email-based admin detection (backup validation)
        const emailIsAdmin = session.user.email?.toLowerCase().includes("admin") || false;

        // Check if user has admin role from users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (!isMounted) return;

        // Validación Híbrida: DB check OR email failsafe
        const dbIsAdmin = userData?.role === "admin";
        const isAdmin = dbIsAdmin || emailIsAdmin;

        console.log("========== ADMIN ACCESS CHECK ==========");
        console.log("   User ID:", session.user.id);
        console.log("   User Email:", session.user.email);
        console.log("   Email contiene 'admin':", emailIsAdmin);
        console.log("   DB Profile:", userData);
        console.log("   DB Error:", userError);
        console.log("   DB dice que es admin:", dbIsAdmin);
        console.log("   DECISIÓN FINAL (DB || Email):", isAdmin);
        console.log("========================================");

        if (!isAdmin) {
          // Redirect non-admin users to dashboard
          console.log("❌ Acceso Denegado. Redirigiendo a /dashboard...");
          router.push("/dashboard");
          return;
        }

        console.log("✅ Acceso Admin Permitido (Email:", emailIsAdmin, "DB:", dbIsAdmin, ")");

        if (isMounted) {
          setIsAuthorized(true);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error checking admin access:", error);
          router.push("/dashboard");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAdminAccess();

    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Skeleton className="w-[250px] h-full" />
        <div className="flex-1 p-8 space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-100">
        {/* Admin Header */}
        <header className="h-16 border-b bg-white px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="text-sm text-muted-foreground">Admin Workspace</div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
