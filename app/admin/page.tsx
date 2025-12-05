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
        // - is_read = false (or is_read IS NULL, as it might default to false)
        // - sender_id != adminId (exclude messages sent by admin)
        // - recipient_id = null (general inbox) OR recipient_id = adminId (direct to admin)
        const { count: unreadCount, error: unreadError } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .or("is_read.is.null,is_read.eq.false") // Handle both null and false
          .neq("sender_id", adminId) // Exclude messages sent by admin
          .or(`recipient_id.is.null,recipient_id.eq.${adminId}`); // To general inbox OR to this admin

        if (unreadError) {
          console.error("❌ Error counting unread messages:", unreadError);
          console.error("   Error details:", unreadError);
        } else {
          unreadMessages = unreadCount || 0;
          console.log("📧 Unread messages count:", unreadMessages);
        }
      } else {
        console.warn("⚠️ No adminId found, cannot count unread messages");
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

  // Fetch recent activity from multiple sources (trips, clients, messages, sos)
  async function fetchRecentActivity() {
    try {
      console.log("📊 Fetching recent activity from all sources...");
      
      // Get the current admin user ID and name
      const { data: { session } } = await supabase.auth.getSession();
      const adminId = session?.user?.id;
      
      if (!adminId) {
        console.warn("⚠️ No admin session found");
        setRecentActivity([]);
        return;
      }

      // Get admin name
      let adminName = "Admin";
      try {
        const { data: adminUser } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", adminId)
          .single();
        if (adminUser?.full_name) {
          adminName = adminUser.full_name;
        }
      } catch (e) {
        console.warn("⚠️ Failed to fetch admin name:", e);
      }

      // Fetch recent activity from multiple sources in parallel
      const [tripsResult, clientsResult, messagesResult, sosResult] = await Promise.allSettled([
        // Recent trips (created or updated in last 7 days)
        supabase
          .from("trips")
          .select(`
            id,
            title,
            updated_at,
            created_at,
            user_id,
            users:user_id(full_name)
          `)
          .order("updated_at", { ascending: false })
          .limit(5),
        
        // Recent client updates (updated in last 7 days)
        supabase
          .from("users")
          .select(`
            id,
            full_name,
            email,
            updated_at,
            created_at
          `)
          .eq("role", "client")
          .order("updated_at", { ascending: false })
          .limit(5),
        
        // Recent messages (only messages TO admin or general inbox, NOT sent by admin)
        supabase
          .from("messages")
          .select(`
            id,
            content,
            created_at,
            sender_id,
            recipient_id,
            is_read,
            users:sender_id(full_name, email)
          `)
          .or(`recipient_id.is.null,recipient_id.eq.${adminId}`) // To general inbox OR to admin
          .neq("sender_id", adminId) // Exclude messages sent by admin
          .order("created_at", { ascending: false })
          .limit(5),
        
        // Recent SOS alerts
        supabase
          .from("sos_alerts")
          .select(`
            id,
            status,
            created_at,
            user_id,
            users:user_id(full_name, email)
          `)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      // Combine all activities into a single array
      const activities: Notification[] = [];

      // Process trips
      if (tripsResult.status === "fulfilled" && tripsResult.value.data) {
        tripsResult.value.data.forEach((trip: any) => {
          const clientName = trip.users?.full_name || "Cliente";
          const isNew = new Date(trip.created_at).getTime() === new Date(trip.updated_at).getTime();
          
          activities.push({
            id: `trip-${trip.id}`,
            type: isNew ? "TRIP_CREATED" : "TRIP_UPDATE",
            title: isNew ? "Nuevo Viaje Creado" : "Viaje Actualizado",
            message: isNew 
              ? `Se creó el viaje "${trip.title}" para ${clientName}`
              : `Se actualizó el viaje "${trip.title}" para ${clientName}`,
            created_at: trip.updated_at,
            entity_type: "TRIP",
            entity_id: trip.id,
            actor_name: adminName,
            target_user_name: clientName,
            resource_id: trip.id,
            resource_type: "TRIP",
          });
        });
      }

      // Process client updates
      if (clientsResult.status === "fulfilled" && clientsResult.value.data) {
        clientsResult.value.data.forEach((client: any) => {
          const isNew = new Date(client.created_at).getTime() === new Date(client.updated_at).getTime();
          
          activities.push({
            id: `client-${client.id}`,
            type: isNew ? "CLIENT_CREATED" : "CLIENT_UPDATE",
            title: isNew ? "Nuevo Cliente" : "Cliente Actualizado",
            message: isNew
              ? `Se creó el perfil de ${client.full_name}`
              : `Se actualizó el perfil de ${client.full_name}`,
            created_at: client.updated_at,
            entity_type: "CLIENT",
            entity_id: client.id,
            actor_name: adminName,
            target_user_name: client.full_name,
            resource_id: client.id,
            resource_type: "CLIENT",
          });
        });
      }

      // Process messages
      if (messagesResult.status === "fulfilled" && messagesResult.value.data) {
        messagesResult.value.data.forEach((message: any) => {
          const senderName = message.users?.full_name || message.users?.email || "Usuario";
          
          activities.push({
            id: `message-${message.id}`,
            type: "NEW_MESSAGE",
            title: "Nuevo Mensaje",
            message: message.content?.substring(0, 50) || "Nuevo mensaje recibido",
            created_at: message.created_at,
            entity_type: "MESSAGE",
            entity_id: message.id,
            actor_name: senderName,
            target_user_name: adminName,
            resource_id: message.sender_id,
            resource_type: "MESSAGE",
          });
        });
      }

      // Process SOS alerts
      if (sosResult.status === "fulfilled" && sosResult.value.data) {
        sosResult.value.data.forEach((alert: any) => {
          const clientName = alert.users?.full_name || alert.users?.email || "Cliente";
          
          activities.push({
            id: `sos-${alert.id}`,
            type: "NEW_SOS",
            title: "Alerta SOS",
            message: `Alerta SOS de ${clientName} - Estado: ${alert.status}`,
            created_at: alert.created_at,
            entity_type: "SOS",
            entity_id: alert.id,
            actor_name: clientName,
            target_user_name: adminName,
            resource_id: alert.id,
            resource_type: "SOS",
          });
        });
      }

      // Sort by created_at (most recent first) and limit to 5
      activities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const recentActivities = activities.slice(0, 5);

      console.log("✅ Recent activity loaded:", recentActivities.length, "items");
      console.log("📋 Activities:", recentActivities.map(a => ({
        type: a.type,
        title: a.title,
        target: a.target_user_name
      })));
      
      setRecentActivity(recentActivities);
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
  const fetchDashboardData = async () => {
    console.log("🔄 Refreshing dashboard data...");
    await Promise.allSettled([
      fetchKPIs().catch((err) => {
        console.error("❌ KPIs fetch failed:", err);
      }),
      fetchRecentActivity().catch((err) => {
        console.error("❌ Recent Activity fetch failed:", err);
      }),
    ]);
  };

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

                // Build rich text display with proper fallbacks
                const actorName = activity.actor_name || activity.title?.split(" ")[0] || "Admin";
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

                // Debug: Log activity data for each item
                console.log("🔍 Rendering activity item:", {
                  id: activity.id,
                  type: activity.type,
                  resource_type: activity.resource_type,
                  resource_id: activity.resource_id,
                  entity_type: activity.entity_type,
                  entity_id: activity.entity_id,
                  actor_name: activity.actor_name,
                  target_user_name: activity.target_user_name,
                  linkUrl,
                  isClickable
                });

                // Determine the actual redirect path with fallback logic
                const getActualPath = (): string => {
                  // Priority 1: Use resource_type and resource_id
                  if (activity.resource_type && activity.resource_id) {
                    const rt = activity.resource_type.toUpperCase();
                    switch (rt) {
                      case "TRIP":
                        return `/admin/trips/${activity.resource_id}`;
                      case "CLIENT":
                        return `/admin/clients/${activity.resource_id}`;
                      case "SOS":
                        return `/admin/sos/${activity.resource_id}`;
                      case "MESSAGE":
                        return `/admin/messages?chatId=${activity.resource_id}`;
                      default:
                        break;
                    }
                  }

                  // Priority 2: Use entity_type and entity_id
                  if (activity.entity_type && activity.entity_id) {
                    const et = activity.entity_type.toUpperCase();
                    if (et.includes("TRIP")) return `/admin/trips/${activity.entity_id}`;
                    if (et.includes("CLIENT")) return `/admin/clients/${activity.entity_id}`;
                    if (et.includes("SOS")) return `/admin/sos/${activity.entity_id}`;
                    if (et.includes("MESSAGE")) return `/admin/messages?chatId=${activity.entity_id}`;
                  }

                  // Priority 3: Use type and resource_id/entity_id
                  const type = (activity.type || "").toUpperCase();
                  const id = activity.resource_id || activity.entity_id;
                  if (id) {
                    if (type.includes("TRIP") || type.includes("ITINERARY")) {
                      return `/admin/trips/${id}`;
                    }
                    if (type.includes("CLIENT")) {
                      return `/admin/clients/${id}`;
                    }
                    if (type.includes("SOS")) {
                      return `/admin/sos/${id}`;
                    }
                    if (type.includes("MESSAGE")) {
                      return `/admin/messages?chatId=${id}`;
                    }
                  }

                  return "#";
                };

                const actualPath = getActualPath();
                const canNavigate = actualPath !== "#";

                return (
                  <div
                    key={activity.id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      console.log("🖱️ CLICK DETECTED on activity:", {
                        activityId: activity.id,
                        activityType: activity.type,
                        resourceType: activity.resource_type,
                        resourceId: activity.resource_id,
                        entityType: activity.entity_type,
                        entityId: activity.entity_id,
                        actualPath,
                        canNavigate
                      });

                      if (!canNavigate) {
                        console.warn("⚠️ Cannot navigate - no valid path");
                        alert(`Error: No Resource ID found for this activity.\n\nActivity ID: ${activity.id}\nType: ${activity.type || activity.resource_type || "Unknown"}\nResource ID: ${activity.resource_id || activity.entity_id || "Missing"}`);
                        return;
                      }

                      console.log("✅ Navigating to:", actualPath);
                      
                      // Try router.push first, with window.location fallback
                      try {
                        router.push(actualPath);
                        // Fallback: if router.push doesn't work, use window.location after a short delay
                        setTimeout(() => {
                          if (window.location.pathname.includes("/admin") && !window.location.pathname.includes(actualPath.split("?")[0])) {
                            console.log("⚠️ router.push may have failed, using window.location.href");
                            window.location.href = actualPath;
                          }
                        }, 300);
                      } catch (error) {
                        console.error("❌ Error with router.push:", error);
                        window.location.href = actualPath;
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        (e.currentTarget as HTMLElement).click();
                      }
                    }}
                    className={cn(
                      "w-full text-left",
                      "flex items-start gap-3",
                      "rounded-lg border border-slate-200",
                      "px-4 py-3",
                      "transition-all",
                      "min-h-[48px]",
                      "relative z-10",
                      "touch-manipulation",
                      canNavigate
                        ? "cursor-pointer hover:bg-slate-50 active:bg-slate-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
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
                        {canNavigate && (
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
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
