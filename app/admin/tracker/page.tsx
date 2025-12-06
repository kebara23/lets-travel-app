"use client";

import { useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useActiveUserLocations } from "@/hooks/useActiveUserLocations";
import { createAvatarMarker, isStale } from "@/components/ui/AvatarMarker";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Carga dinámica del mapa para evitar error de servidor
const Map = dynamic(
  () => import("@/components/ui/Map").then((mod) => ({ default: mod.Map })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 animate-pulse">
        <p className="text-slate-400 font-body">Loading Map...</p>
      </div>
    ),
  }
);

// Calculate center point from active users
function calculateCenter(users: { lat: number; lng: number }[]): [number, number] {
  if (users.length === 0) {
    // Default center (you can change this to your default location)
    return [9.7489, -83.7534]; // Costa Rica default
  }

  const validUsers = users.filter((u) => u.lat && u.lng);
  if (validUsers.length === 0) {
    return [9.7489, -83.7534];
  }

  const avgLat = validUsers.reduce((sum, u) => sum + u.lat, 0) / validUsers.length;
  const avgLng = validUsers.reduce((sum, u) => sum + u.lng, 0) / validUsers.length;

  return [avgLat, avgLng];
}

// Format time ago
function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
}

export default function AdminTrackerPage() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  
  // Only fetch data on client side - call hook unconditionally to maintain hook order
  const { activeUsers, loading, error, refetch } = useActiveUserLocations();

  // Ensure we're on the client before using Leaflet or any browser APIs
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);
    }
  }, []);

  // Inject custom marker styles
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const style = document.createElement("style");
    style.textContent = `
      .custom-avatar-marker {
        background: transparent !important;
        border: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Transform active users to map markers (only on client)
  const markers = useMemo(() => {
    if (!isClient || typeof window === "undefined") {
      return [];
    }

    try {
      return activeUsers.map((user) => {
        const stale = isStale(user.lastUpdated);
        const icon = createAvatarMarker(user);
        
        if (!icon) {
          // Skip if icon creation failed (SSR guard)
          return null;
        }
      
      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px;">
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #1e293b;">
            ${user.name}
          </div>
          ${user.tripName ? `
            <div style="font-size: 14px; color: #64748b; margin-bottom: 6px;">
              <strong>Trip:</strong> ${user.tripName}
            </div>
          ` : ""}
          <div style="font-size: 12px; color: ${stale ? "#ef4444" : "#10b981"}; margin-top: 8px;">
            ${stale ? "⚠️ " : "🟢 "}Last seen ${formatTimeAgo(user.lastUpdated)}
          </div>
        </div>
      `;

        return {
          lat: user.lat,
          lng: user.lng,
          popupText: popupContent,
          icon,
        };
      }).filter((marker): marker is NonNullable<typeof marker> => marker !== null);
    } catch (error) {
      console.error("Error creating markers:", error);
      return [];
    }
  }, [activeUsers, isClient]);

  // Calculate map center
  const center = useMemo(() => calculateCenter(activeUsers), [activeUsers]);
  const zoom = activeUsers.length > 1 ? 10 : 13;

  const activeCount = activeUsers.filter((u) => !isStale(u.lastUpdated)).length;
  const staleCount = activeUsers.filter((u) => isStale(u.lastUpdated)).length;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-slate-50">
      {/* Header */}
      <div className="p-6 bg-white border-b shadow-sm z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-body">Live Tracker</h1>
            <p className="text-sm text-slate-500 font-body">Monitor active client locations in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={loading}
              className="font-body"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-body">
            <Users className="h-3 w-3 mr-1" />
            {activeCount} Active
          </Badge>
          {staleCount > 0 && (
            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-body">
              <MapPin className="h-3 w-3 mr-1" />
              {staleCount} Offline
            </Badge>
          )}
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-body">
            Total: {activeUsers.length}
          </Badge>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative bg-slate-200">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8">
            <Loader2 className="w-12 h-12 mb-4 animate-spin opacity-50" />
            <p className="font-body">Loading active locations...</p>
          </div>
        ) : error ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-red-400 p-8">
            <MapPin className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-body">Error loading locations. Please try again.</p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="mt-4 font-body"
            >
              Retry
            </Button>
          </div>
        ) : activeUsers.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8">
            <MapPin className="w-16 h-16 mb-4 opacity-50" />
            <p className="font-body text-lg font-semibold mb-2">No Active Locations</p>
            <p className="font-body text-sm">No clients are currently sharing their location.</p>
          </div>
        ) : isClient ? (
          <Map 
            markers={markers} 
            center={center} 
            zoom={zoom}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8">
            <Loader2 className="w-12 h-12 mb-4 animate-spin opacity-50" />
            <p className="font-body">Initializing map...</p>
          </div>
        )}
      </div>
    </div>
  );
}

