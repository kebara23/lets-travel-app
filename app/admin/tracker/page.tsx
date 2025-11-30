"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin } from "lucide-react";
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

type TrackingData = {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  updated_at: string;
  users?: {
    full_name: string;
    email: string;
  };
};

type MapMarker = {
  lat: number;
  lng: number;
  popupText: string;
  userId: string;
  icon?: L.Icon | L.DivIcon;
};

export default function TrackerPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [trackingData, setTrackingData] = useState<TrackingData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use plain object instead of Map
  const markersRef = useRef<Record<string, MapMarker>>({});

  // Create custom icon for each user
  function createUserIcon(userName: string): L.DivIcon {
    const colors = [
      "#3B82F6", // blue
      "#10B981", // green
      "#F59E0B", // orange
      "#EF4444", // red
      "#8B5CF6", // purple
      "#EC4899", // pink
    ];
    const colorIndex = userName.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];

    return L.divIcon({
      className: "custom-user-marker",
      html: `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">
          ${userName.charAt(0).toUpperCase()}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  }

  // Convert tracking data to markers array
  function trackingDataToMarkers(data: TrackingData[]): MapMarker[] {
    return data.map((item) => {
      const userName = item.users?.full_name || "Unknown User";
      const userId = item.user_id;
      
      // Check if marker exists in ref using plain object access
      let icon: L.DivIcon;
      if (markersRef.current[userId]) {
        // Reuse existing icon if available
        icon = markersRef.current[userId].icon || createUserIcon(userName);
      } else {
        // Create new icon
        icon = createUserIcon(userName);
      }
      
      const marker: MapMarker = {
        lat: item.lat,
        lng: item.lng,
        popupText: `${userName}${item.users?.email ? `\n${item.users.email}` : ""}`,
        userId: userId,
        icon,
      };

      // Store in ref using plain object assignment
      markersRef.current[userId] = marker;
      
      return marker;
    });
  }

  // Fetch initial tracking data
  async function fetchTrackingData() {
    try {
      const { data, error } = await supabase
        .from("device_tracking")
        .select(`
          id,
          user_id,
          lat,
          lng,
          updated_at,
          users:user_id (
            full_name,
            email
          )
        `);

      if (error) throw error;

      // Transform the data structure (users might be an array)
      const transformedData = (data || []).map((item) => ({
        ...item,
        users: Array.isArray(item.users) ? item.users[0] : item.users,
      })) as TrackingData[];

      setTrackingData(transformedData);
    } catch (error: any) {
      console.error("Error fetching tracking data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load tracking data.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchTrackingData();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("tracking_updates")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "device_tracking",
        },
        async (payload) => {
          console.log("Tracking update:", payload);

          if (payload.eventType === "DELETE") {
            // Remove from state
            setTrackingData((prev) => prev.filter((item) => item.id !== payload.old.id));
            // Delete from ref using plain object delete
            if (payload.old?.user_id) {
              delete markersRef.current[payload.old.user_id];
            }
            return;
          }

          // For INSERT or UPDATE, fetch user data and update state
          const userId = payload.new.user_id;
          
          // Fetch user data
          const { data: userData } = await supabase
            .from("users")
            .select("full_name, email")
            .eq("id", userId)
            .single();

          const updatedItem: TrackingData = {
            id: payload.new.id,
            user_id: userId,
            lat: payload.new.lat,
            lng: payload.new.lng,
            updated_at: payload.new.updated_at,
            users: userData || undefined,
          };

          if (payload.eventType === "INSERT") {
            setTrackingData((prev) => [...prev, updatedItem]);
          } else if (payload.eventType === "UPDATE") {
            setTrackingData((prev) =>
              prev.map((item) => (item.user_id === userId ? updatedItem : item))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Convert tracking data to markers array for rendering
  const markers = trackingDataToMarkers(trackingData);

  // Calculate center from all markers
  const mapCenter: [number, number] | undefined = markers.length > 0
    ? [
        markers.reduce((sum, m) => sum + m.lat, 0) / markers.length,
        markers.reduce((sum, m) => sum + m.lng, 0) / markers.length,
      ]
    : undefined;

  if (loading) {
    return (
      <div className="h-screen w-full p-4 lg:p-8">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-body">Live Tracker</h1>
            <p className="text-slate-600 mt-1 font-body">
              Real-time location tracking of all clients
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="font-body">
              <Users className="h-4 w-4 mr-2" />
              {trackingData.length} {trackingData.length === 1 ? "client" : "clients"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Map - Full Screen */}
      <div className="flex-1 relative">
        {markers.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Card className="bg-white border-slate-200">
              <CardContent className="py-16 text-center">
                <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2 font-body">
                  No Active Tracking
                </h3>
                <p className="text-slate-600 font-body">
                  No clients are currently sharing their location.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Map
            markers={markers}
            center={mapCenter}
            zoom={mapCenter ? 12 : 2}
            className="rounded-none"
            style={{ height: "100%", width: "100%" }}
          />
        )}
      </div>
    </div>
  );
}
