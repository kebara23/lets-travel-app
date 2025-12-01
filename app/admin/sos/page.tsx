"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Phone, CheckCircle, MapPin, Clock } from "lucide-react";
import L from "leaflet";

// Dynamically import Map component with SSR disabled
const Map = dynamic(
  () => import("@/components/ui/Map").then((mod) => ({ default: mod.Map })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <Skeleton className="w-full h-full" />
      </div>
    ),
  }
);

type SOSAlert = {
  id: string;
  user_id: string;
  lat: number | null;
  lng: number | null;
  status: "pending" | "acknowledged" | "resolved" | "false_alarm";
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  notes: string | null;
  users?: {
    full_name: string;
    phone: string | null;
    email: string;
  };
};

export default function SOSCenterPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  // Play alert sound
  const playAlertSound = () => {
    try {
      const audio = new Audio("/sounds/alert.mp3"); // Ensure this file exists in public/sounds/
      audio.volume = 0.7;
      audio.play().catch((e) => console.log("Audio play failed (user interaction needed first)", e));
    } catch (e) {
      console.error("Error playing alert sound", e);
    }
  };

  // Fetch SOS alerts with user data
  async function fetchAlerts() {
    try {
      const { data, error } = await supabase
        .from("sos_alerts")
        .select(`
          id,
          user_id,
          lat,
          lng,
          status,
          created_at,
          updated_at,
          resolved_at,
          notes,
          users:user_id (
            full_name,
            phone,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data structure (users might be an array)
      const transformedData = (data || []).map((item) => ({
        ...item,
        users: Array.isArray(item.users) ? item.users[0] : item.users,
      })) as SOSAlert[];

      setAlerts(transformedData);
      
      // Auto-select first pending alert if available
      if (transformedData.length > 0 && !selectedAlert) {
        const firstPending = transformedData.find((a) => a.status === "pending");
        if (firstPending) {
          setSelectedAlert(firstPending);
        } else {
          setSelectedAlert(transformedData[0]);
        }
      }
    } catch (error: any) {
      console.error("Error fetching alerts:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load SOS alerts.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchAlerts();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("sos_alerts_updates")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "sos_alerts",
        },
        async (payload) => {
          console.log("SOS Alert update:", payload);

          if (payload.eventType === "INSERT") {
            // Play alert sound for new pending alerts
            if (payload.new.status === "pending") {
              playAlertSound();
              toast({
                variant: "destructive",
                title: "🚨 New Emergency Alert!",
                description: "A new SOS alert has been received.",
              });
            }

            // Fetch user data for new alert
            const { data: userData } = await supabase
              .from("users")
              .select("full_name, phone, email")
              .eq("id", payload.new.user_id)
              .single();

            const newAlert: SOSAlert = {
              id: payload.new.id,
              user_id: payload.new.user_id,
              lat: payload.new.lat,
              lng: payload.new.lng,
              status: payload.new.status,
              created_at: payload.new.created_at,
              updated_at: payload.new.updated_at,
              resolved_at: payload.new.resolved_at,
              notes: payload.new.notes,
              users: userData || undefined,
            };

            setAlerts((prev) => [newAlert, ...prev]);
            
            // Auto-select new pending alert
            if (newAlert.status === "pending") {
              setSelectedAlert(newAlert);
            }
          } else if (payload.eventType === "UPDATE") {
            // Fetch user data if needed
            let userData = null;
            const existingAlert = alerts.find((a) => a.id === payload.new.id);
            if (!existingAlert?.users) {
              const { data } = await supabase
                .from("users")
                .select("full_name, phone, email")
                .eq("id", payload.new.user_id)
                .single();
              userData = data;
            }

            const updatedAlert: SOSAlert = {
              id: payload.new.id,
              user_id: payload.new.user_id,
              lat: payload.new.lat,
              lng: payload.new.lng,
              status: payload.new.status,
              created_at: payload.new.created_at,
              updated_at: payload.new.updated_at,
              resolved_at: payload.new.resolved_at,
              notes: payload.new.notes,
              users: userData || existingAlert?.users,
            };

            setAlerts((prev) =>
              prev.map((alert) => (alert.id === updatedAlert.id ? updatedAlert : alert))
            );

            // Update selected alert if it's the one being updated
            if (selectedAlert?.id === updatedAlert.id) {
              setSelectedAlert(updatedAlert);
            }
          } else if (payload.eventType === "DELETE") {
            setAlerts((prev) => prev.filter((alert) => alert.id !== payload.old.id));
            if (selectedAlert?.id === payload.old.id) {
              setSelectedAlert(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, alerts, selectedAlert]);

  // Resolve alert
  async function resolveAlert(alertId: string) {
    setResolving(alertId);
    try {
      const { error } = await supabase
        .from("sos_alerts")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) throw error;

      toast({
        title: "Alert Resolved",
        description: "The SOS alert has been marked as resolved.",
      });

      // Refresh alerts
      await fetchAlerts();
    } catch (error: any) {
      console.error("Error resolving alert:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to resolve alert.",
      });
    } finally {
      setResolving(null);
    }
  }

  // Open WhatsApp
  function openWhatsApp(phone: string | null) {
    if (!phone) {
      toast({
        variant: "destructive",
        title: "No Phone Number",
        description: "This user doesn't have a phone number registered.",
      });
      return;
    }

    // Format phone number (remove any non-digit characters except +)
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    window.open(whatappUrl, "_blank");
  }

  // Get status badge variant
  function getStatusBadge(status: SOSAlert["status"]) {
    switch (status) {
      case "pending":
        return "destructive";
      case "acknowledged":
        return "default";
      case "resolved":
        return "outline";
      case "false_alarm":
        return "secondary";
      default:
        return "outline";
    }
  }

  // Format time
  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Count active alerts
  const activeAlertsCount = alerts.filter((a) => a.status === "pending").length;

  if (loading) {
    return (
      <div className="h-screen w-full p-4 lg:p-8">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-body flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              Emergency Center
            </h1>
            <p className="text-slate-600 mt-1 font-body">
              Real-time SOS alert management
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-red-600 font-body">
              {activeAlertsCount}
            </div>
            <p className="text-sm text-slate-600 font-body mt-1">
              Active {activeAlertsCount === 1 ? "Alert" : "Alerts"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Alerts List */}
        <div className="w-96 border-r bg-white overflow-y-auto flex-shrink-0">
          <div className="p-4 space-y-3">
            {alerts.length === 0 ? (
              <Card className="bg-white border-slate-200">
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-body">
                    No SOS alerts yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => {
                const isPending = alert.status === "pending";
                const isSelected = selectedAlert?.id === alert.id;
                
                return (
                  <Card
                    key={alert.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary shadow-lg"
                        : isPending
                        ? "border-red-500 bg-red-50/50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 font-body truncate">
                              {alert.users?.full_name || "Unknown User"}
                            </h3>
                            <p className="text-xs text-slate-500 font-body flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(alert.created_at)}
                            </p>
                          </div>
                          <Badge
                            variant={getStatusBadge(alert.status)}
                            className="font-body text-xs flex-shrink-0"
                          >
                            {alert.status}
                          </Badge>
                        </div>
                        {alert.lat && alert.lng && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 font-body">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column - Map and Actions */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedAlert ? (
            <>
              {/* Map */}
              <div className="flex-1 relative">
                {selectedAlert.lat && selectedAlert.lng ? (
                  <Map
                    markers={[
                      {
                        lat: selectedAlert.lat,
                        lng: selectedAlert.lng,
                        popupText: `${selectedAlert.users?.full_name || "Unknown User"}\nSOS Alert`,
                      },
                    ]}
                    center={[selectedAlert.lat, selectedAlert.lng]}
                    zoom={15}
                    className="rounded-none"
                    style={{ height: "100%", width: "100%" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Card className="bg-white border-slate-200">
                      <CardContent className="py-12 text-center">
                        <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2 font-body">
                          No Location Data
                        </h3>
                        <p className="text-slate-600 font-body">
                          This alert doesn&apos;t have location coordinates.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 lg:p-6 border-t bg-white flex-shrink-0">
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="font-body">
                      {selectedAlert.users?.full_name || "Unknown User"}
                    </CardTitle>
                    <CardDescription className="font-body">
                      {selectedAlert.users?.email || "No email"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 font-body">Status:</span>
                        <Badge
                          variant={getStatusBadge(selectedAlert.status)}
                          className="font-body"
                        >
                          {selectedAlert.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 font-body">Created:</span>
                        <span className="text-slate-900 font-body">
                          {formatTime(selectedAlert.created_at)}
                        </span>
                      </div>
                      {selectedAlert.notes && (
                        <div className="space-y-1">
                          <span className="text-slate-600 font-body text-sm">Notes:</span>
                          <p className="text-slate-900 font-body text-sm bg-slate-50 p-2 rounded">
                            {selectedAlert.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => openWhatsApp(selectedAlert.users?.phone || null)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-body"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Open WhatsApp
                      </Button>
                      {selectedAlert.status !== "resolved" && (
                        <Button
                          onClick={() => resolveAlert(selectedAlert.id)}
                          disabled={resolving === selectedAlert.id}
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-body"
                        >
                          {resolving === selectedAlert.id ? (
                            <>
                              <span className="mr-2">⏳</span> Resolving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Resolved
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted">
              <Card className="bg-white border-slate-200">
                <CardContent className="py-16 text-center">
                  <AlertTriangle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2 font-body">
                    No Alert Selected
                  </h3>
                  <p className="text-slate-600 font-body">
                    Select an alert from the list to view details
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

