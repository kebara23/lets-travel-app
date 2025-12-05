"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Users, MessageCircle, AlertTriangle, Bell, Calendar, MessageSquare, Siren, RefreshCcw, FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getActivityLink, getNotificationIcon, getRedirectPath } from "@/components/admin/ActivityUtils";
import { useRouter } from "next/navigation";

type KPI = {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isSOS?: boolean;
};

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  entity_type?: string;
  entity_id?: string;
  // New rich metadata fields
  actor_name?: string | null;
  target_user_name?: string | null;
  resource_id?: string | null;
  resource_type?: 'TRIP' | 'CLIENT' | 'SOS' | 'MESSAGE' | 'INVOICE' | 'OTHER' | null;
};

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [recentActivity, setRecentActivity] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const channelRef = useRef<any>(null);

  // Fetch all KPIs simultaneously
  async function fetchKPIs() {
    try {
      // First, get the current admin user ID
      const { data: { session } } = await supabase.auth.getSession();
      const adminId = session?.user?.id;

      const [activeTripsResult, totalClientsResult, pendingSOSResult] = await Promise.all([
        // A. Active Trips
        supabase
          .from("trips")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        
        // B. Total Clients
        supabase
          .from("users")
          .select("id", { count: "exact", head: true })
          .eq("role", "client"),
        
        // D. Pending SOS
        supabase
          .from("sos_alerts")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      // C. Unread Messages (PRECISE: messages NOT sent by admin, NOT read, and TO admin or general inbox)
      let unreadMessages = 0;
      if (adminId) {
        // Count messages where:
        // - is_read = false
        // - sender_id != adminId (exclude messages sent by admin)
        // - recipient_id = null (general inbox) OR recipient_id = adminId (direct to admin)
        const { count: unreadCount, error: unreadError } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("is_read", false)
          .neq("sender_id", adminId) // Exclude messages sent by admin
          .or(`recipient_id.is.null,recipient_id.eq.${adminId}`); // To general inbox OR to this admin

        if (unreadError) {
          console.error("Error counting unread messages:", unreadError);
        } else {
          unreadMessages = unreadCount || 0;
        }
      } else {
        // Fallback: if no admin session, count only general inbox messages not sent by any admin
        // This is a safety fallback, but ideally adminId should always exist
        const { count: unreadCount, error: unreadError } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("is_read", false)
          .is("recipient_id", null);

        if (unreadError) {
          console.error("Error counting unread messages:", unreadError);
        } else {
          unreadMessages = unreadCount || 0;
        }
      }

      const activeTrips = activeTripsResult.count || 0;
      const totalClients = totalClientsResult.count || 0;
      const pendingSOS = pendingSOSResult.count || 0;

      setKpis([
        {
          title: "Active Trips",
          value: activeTrips,
          icon: Plane,
          color: "text-blue-600",
        },
        {
          title: "Total Clients",
          value: totalClients,
          icon: Users,
          color: "text-green-600",
        },
        {
          title: "Unread Messages",
          value: unreadMessages,
          icon: MessageCircle,
          color: "text-purple-600",
        },
        {
          title: "Pending SOS",
          value: pendingSOS,
          icon: AlertTriangle,
          color: pendingSOS > 0 ? "text-red-600" : "text-green-600",
          isSOS: true,
        },
      ]);
    } catch (error: any) {
      console.error("Error fetching KPIs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard metrics.",
      });
    }
  }

  // Fetch recent notifications (Tolerante a fallos)
  async function fetchRecentActivity() {
    try {
      console.log("📊 Fetching recent activity...");
      
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("❌ ERROR DASHBOARD (Notifications Query):", error);
        console.error("   Error Code:", error.code);
        console.error("   Error Message:", error.message);
        console.error("   Error Details:", error.details);
        console.error("   Error Hint:", error.hint);
        
        // NO romper la página: establecer array vacío
        setRecentActivity([]);
        return;
      }

      // Validar que los datos sean un array válido
      if (!Array.isArray(data)) {
        console.warn("⚠️ Notifications data is not an array:", data);
        setRecentActivity([]);
        return;
      }

      console.log("✅ Recent activity loaded:", data.length, "items");
      setRecentActivity(data);
    } catch (error: any) {
      console.error("💥 ERROR DASHBOARD (Exception in fetchRecentActivity):", error);
      console.error("   Error Type:", error?.constructor?.name);
      console.error("   Error Stack:", error?.stack);
      
      // NO romper la página: establecer array vacío y continuar
      setRecentActivity([]);
      
      // Toast opcional (no crítico, solo informativo)
      // Comentado para no molestar si es un error recurrente
      // toast({
      //   variant: "destructive",
      //   title: "Warning",
      //   description: "Could not load recent activity. Dashboard metrics are still available.",
      // });
    }
  }

  // Combined fetch function for dashboard data
  async function fetchDashboardData() {
    await Promise.allSettled([
      fetchKPIs().catch((err) => {
        console.error("❌ KPIs fetch failed:", err);
      }),
      fetchRecentActivity().catch((err) => {
        console.error("❌ Recent Activity fetch failed:", err);
      }),
    ]);
  }

  // Manual refresh handler
  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await fetchDashboardData();
      toast({
        title: "Data Updated",
        description: "Dashboard data has been refreshed successfully.",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh data. Please try again.",
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  // Format time ago
  function formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }

  // Initial fetch (Tolerante a fallos individuales)
  useEffect(() => {
    async function initialFetch() {
      setIsLoading(true);
      
      // Ejecutar ambos fetches en paralelo, pero manejar errores individualmente
      // Si uno falla, el otro continúa
      await Promise.allSettled([
        fetchKPIs().catch((err) => {
          console.error("❌ KPIs fetch failed (non-blocking):", err);
        }),
        fetchRecentActivity().catch((err) => {
          console.error("❌ Recent Activity fetch failed (non-blocking):", err);
        }),
      ]);
      
      setIsLoading(false);
    }
    initialFetch();
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    if (!supabase) return;

    // Clean up previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel for all tables
    const channel = supabase
      .channel("admin-dashboard-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trips" },
        () => {
          console.log("🔄 Trips updated, refetching dashboard data...");
          fetchDashboardData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => {
          console.log("🔄 Users updated, refetching dashboard data...");
          fetchDashboardData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          console.log("🔄 Messages updated, refetching dashboard data...");
          fetchDashboardData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sos_alerts" },
        () => {
          console.log("🔄 SOS alerts updated, refetching dashboard data...");
          fetchDashboardData();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => {
          console.log("🔄 New notification (INSERT), refetching dashboard data...");
          fetchDashboardData();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        () => {
          console.log("🔄 Notification updated (UPDATE), refetching dashboard data...");
          fetchDashboardData();
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notifications" },
        () => {
          console.log("🔄 Notification deleted (DELETE), refetching dashboard data...");
          fetchDashboardData();
        }
      )
      .subscribe((status) => {
        console.log("📡 Realtime subscription status:", status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [supabase]);

  const pendingSOS = kpis.find((k) => k.isSOS)?.value || 0;
  const hasSOSAlerts = typeof pendingSOS === "number" && pendingSOS > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-body">Dashboard</h1>
          <p className="text-slate-600 mt-1 font-body">Welcome back, here&apos;s what&apos;s happening today.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="font-body"
        >
          <RefreshCcw
            className={cn(
              "h-4 w-4 mr-2",
              isRefreshing && "animate-spin"
            )}
          />
          Refresh Data
        </Button>
      </div>

      {/* KPIs Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const isSOS = kpi.isSOS;
            const hasAlerts = isSOS && hasSOSAlerts;

            // Map KPI titles to routes
            const routeMap: Record<string, string> = {
              "Active Trips": "/admin/trips",
              "Total Clients": "/admin/clients",
              "Unread Messages": "/admin/messages",
              "Pending SOS": "/admin/sos",
            };

            const href = routeMap[kpi.title] || "#";

            return (
              <Link key={kpi.title} href={href}>
                <Card
                  className={cn(
                    "bg-white border-slate-200 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1",
                    hasAlerts && "bg-red-50 border-red-200"
                  )}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle
                      className={cn(
                        "text-sm font-medium font-body",
                        hasAlerts ? "text-red-700" : "text-slate-600"
                      )}
                    >
                      {kpi.title}
                    </CardTitle>
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        hasAlerts ? "text-red-600" : kpi.color
                      )}
                    />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={cn(
                        "text-2xl font-bold font-body",
                        hasAlerts ? "text-red-700" : "text-slate-900"
                      )}
                    >
                      {kpi.value}
                    </div>
                    {isSOS && (
                      <Badge
                        variant={hasAlerts ? "destructive" : "default"}
                        className={cn(
                          "mt-2 font-body",
                          !hasAlerts && "bg-green-600 hover:bg-green-700"
                        )}
                      >
                        {hasAlerts ? "Action Required" : "All Clear"}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Recent Activity Table */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl font-body">Recent Activity</CardTitle>
          <CardDescription className="font-body">
            Latest notifications and system updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground font-body">
              No recent activity
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((activity) => {
                const Icon = getNotificationIcon(activity.type);
                // Determine deep link path based on activity payload
                const linkUrl = getRedirectPath(activity);
                const isClickable = linkUrl !== "#";

                // Build rich text display
                const actorName = activity.actor_name || "Admin";
                const targetName = activity.target_user_name || "Cliente";
                const resourceLabel = (() => {
                  const rt = activity.resource_type?.toUpperCase();
                  if (rt === "TRIP") return "Itinerary";
                  if (rt === "CLIENT") return "Perfil";
                  if (rt === "SOS") return "SOS";
                  if (rt === "MESSAGE") return "Mensaje";
                  if (rt === "INVOICE") return "Factura";
                  // Fallback to type-based label
                  if (activity.type?.includes("TRIP") || activity.type?.includes("ITINERARY")) return "Itinerary";
                  if (activity.type?.includes("CLIENT")) return "Perfil";
                  if (activity.type?.includes("SOS")) return "SOS";
                  if (activity.type?.includes("MESSAGE")) return "Mensaje";
                  return "Item";
                })();

                return (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={(e) => {
                      if (isClickable) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Clicked item:", activity.type, activity.id, "->", linkUrl);
                        router.push(linkUrl);
                      }
                    }}
                    disabled={!isClickable}
                    className={cn(
                      "w-full text-left",
                      "flex items-start gap-3",
                      "rounded-lg border border-slate-200",
                      "px-4 py-3",
                      "transition-colors",
                      "min-h-[48px]",
                      "relative z-10",
                      isClickable
                        ? "cursor-pointer hover:bg-slate-50 active:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
                        : "cursor-default opacity-60"
                    )}
                    aria-label={`${actorName} actualizó ${resourceLabel} para ${targetName}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-sm text-slate-900 font-body">
                        <span className="font-bold">{actorName}</span>{" "}
                        <span className="font-normal">actualizó</span>{" "}
                        <span className="font-bold">{resourceLabel}</span>{" "}
                        <span className="font-normal">para</span>{" "}
                        <span className="font-bold">{targetName}</span>
                        {isClickable && (
                          <ExternalLink className="h-3 w-3 ml-2 inline-block opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                        )}
                      </div>
                      {activity.message && (
                        <div className="text-xs text-slate-500 font-body line-clamp-2">
                          {activity.message}
                        </div>
                      )}
                      <div className="text-xs text-slate-400 font-body">
                        {formatTimeAgo(activity.created_at)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
