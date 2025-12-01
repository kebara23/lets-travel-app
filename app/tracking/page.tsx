"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

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

export default function TrackingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [isSharing, setIsSharing] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Get current user
  useEffect(() => {
    async function getCurrentUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        }
      } catch (error) {
        console.error("Error getting user:", error);
      }
    }
    getCurrentUser();
  }, [supabase]);

  // Get initial position
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          variant: "destructive",
          title: "Location Error",
          description: "Unable to get your location. Please enable location services.",
        });
      }
    );
  }, [toast]);

  // Save position to Supabase
  const savePosition = async (lat: number, lng: number) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("device_tracking")
        .upsert(
          {
            user_id: userId,
            lat,
            lng,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      if (error) {
        console.error("Error saving position:", error);
        throw error;
      }
    } catch (error: any) {
      console.error("Failed to save position:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save location.",
      });
    }
  };

  // Start watching position
  const startTracking = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        
        setPosition(newPosition);
        savePosition(newPosition.lat, newPosition.lng);
      },
      (error) => {
        console.error("Error watching position:", error);
        toast({
          variant: "destructive",
          title: "Location Error",
          description: "Unable to track your location. Please check your permissions.",
        });
        setIsSharing(false);
      },
      options
    );

    setIsSharing(true);
    toast({
      title: "Location Sharing Enabled",
      description: "Your location is now being shared with concierge.",
    });
  };

  // Stop watching position
  const stopTracking = () => {
    if (typeof window !== "undefined" && watchIdRef.current !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsSharing(false);
    toast({
      title: "Location Sharing Disabled",
      description: "Your location is now private.",
    });
  };

  // Handle switch toggle
  const handleToggle = (checked: boolean) => {
    if (checked) {
      startTracking();
    } else {
      stopTracking();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && watchIdRef.current !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-body">Live Tracking</h1>
          <p className="text-slate-600 mt-2 font-body">
            Share your location with concierge for enhanced safety
          </p>
        </div>

        {/* Share Location Switch - Large */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="font-body">Location Sharing</CardTitle>
            <CardDescription className="font-body">
              Enable to share your real-time location with concierge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <Label htmlFor="location-switch" className="text-xl font-semibold text-slate-900 font-body cursor-pointer">
                    Share Location
                  </Label>
                  <p className="text-sm text-slate-600 font-body">
                    {isSharing 
                      ? "Your location is being shared in real-time" 
                      : "Toggle to start sharing your location"}
                  </p>
                </div>
              </div>
              <Switch
                id="location-switch"
                checked={isSharing}
                onCheckedChange={handleToggle}
                className="scale-150"
              />
            </div>
            {position && (
              <div className="flex items-center gap-2 mt-4 text-sm text-slate-600 font-body">
                <MapPin className="h-4 w-4" />
                <span>
                  Current: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-0">
            <div className="h-[600px] w-full">
              {position ? (
                <Map
                  markers={[
                    {
                      lat: position.lat,
                      lng: position.lng,
                      popupText: "Your current location",
                    },
                  ]}
                  center={[position.lat, position.lng]}
                  zoom={15}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center space-y-2">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="font-body text-muted-foreground">
                      Waiting for location...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
