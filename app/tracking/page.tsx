"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

type Position = {
  lat: number;
  lng: number;
};

export default function TrackingPage() {
  const { toast } = useToast();
  const supabase = createClient();
  
  // State
  const [isSharing, setIsSharing] = useState(false);
  const [isToggling, setIsToggling] = useState(false); // For loading state during toggle
  const [position, setPosition] = useState<Position | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  
  const watchIdRef = useRef<number | null>(null);

  // Get current user and initial tracking state
  useEffect(() => {
    async function initialize() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          
          // Check persistent state in DB
          const { data: trackingData } = await supabase
            .from("device_tracking")
            .select("is_active, lat, lng")
            .eq("user_id", session.user.id)
            .single();
            
          if (trackingData) {
            setIsSharing(!!trackingData.is_active); // Ensure boolean
            if (trackingData.lat && trackingData.lng) {
              setPosition({ lat: trackingData.lat, lng: trackingData.lng });
            }
          }
        }
      } catch (error) {
        console.error("Error initializing tracking:", error);
      } finally {
        setIsLoadingInitial(false);
      }
    }
    initialize();
  }, [supabase]);

  // Effect to handle Geolocation API based on isSharing state
  // This ensures the browser API matches our React/DB state
  useEffect(() => {
    // Cleanup function to stop watching
    const stopWatching = () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };

    if (isSharing) {
      if (!("geolocation" in navigator)) {
        toast({
          variant: "destructive",
          title: "Not Supported",
          description: "Geolocation is not supported by your browser.",
        });
        setIsSharing(false); // Revert state if not supported
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      // Start watching
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newPosition: Position = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          
          setPosition(newPosition);
          
          // Background save (fire and forget)
          if (userId) {
            supabase.from("device_tracking").upsert({
              user_id: userId,
              lat: newPosition.lat,
              lng: newPosition.lng,
              is_active: true,
              updated_at: new Date().toISOString(),
            }).then(({ error }) => {
              if (error) console.error("Background save error:", error);
            });
          }
        },
        (error) => {
          console.error("Error watching position:", error);
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Unable to track your location. Please check permissions.",
          });
          // Don't necessarily disable sharing here to avoid UI flickering on temporary errors,
          // but in a strict app you might want to.
        },
        options
      );
    } else {
      // Stop watching if sharing is disabled
      stopWatching();
    }

    return stopWatching;
  }, [isSharing, userId, supabase, toast]);

  // Toggle function with Optimistic UI + Persistence
  const toggleSharing = async () => {
    if (!userId) return;
    
    setIsToggling(true);
    const newState = !isSharing;
    
    // Optimistic update
    setIsSharing(newState);

    try {
      // Persist to DB
      const updateData: any = {
        user_id: userId,
        is_active: newState,
        updated_at: new Date().toISOString(),
      };

      // If turning on, try to get current position immediately to save with it
      if (newState && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            updateData.lat = pos.coords.latitude;
            updateData.lng = pos.coords.longitude;
            setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            
            // Perform upsert with position
            supabase.from("device_tracking").upsert(updateData).then(({ error }) => {
               if (error) throw error;
            });
          },
          () => {
            // On error getting immediate position, just save status
            supabase.from("device_tracking").upsert(updateData);
          },
          { timeout: 5000 }
        );
      } else {
        // Just save status change
        const { error } = await supabase.from("device_tracking").upsert(updateData);
        if (error) throw error;
      }

      toast({
        title: newState ? "Location Sharing Enabled" : "Location Sharing Disabled",
        description: newState 
          ? "Your location is now being shared with concierge." 
          : "Your location is now private.",
      });

    } catch (error) {
      console.error("Error toggling sharing:", error);
      setIsSharing(!newState); // Revert on error
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update location settings.",
      });
    } finally {
      setIsToggling(false);
    }
  };

  // Memoize markers to prevent unnecessary re-renders in Map component
  const markers = useMemo(() => {
    if (!position) return [];
    return [
      {
        lat: position.lat,
        lng: position.lng,
        popupText: "Your current location",
      },
    ];
  }, [position]);

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
                    {isLoadingInitial ? "Loading settings..." : (
                      isSharing 
                        ? "Your location is being shared in real-time" 
                        : "Toggle to start sharing your location"
                    )}
                  </p>
                </div>
              </div>
              
              {/* Custom Toggle Switch for smoother animation */}
              <div className="flex items-center gap-2">
                {isToggling && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                <button
                  id="location-switch"
                  role="switch"
                  aria-checked={isSharing}
                  onClick={toggleSharing}
                  disabled={isLoadingInitial || isToggling}
                  className={cn(
                    "relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                    isSharing ? "bg-primary" : "bg-slate-200"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none block h-7 w-7 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
                      isSharing ? "translate-x-7" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>
            {position && isSharing && (
              <div className="flex items-center gap-2 mt-4 text-sm text-slate-600 font-body animate-in fade-in slide-in-from-top-2">
                <MapPin className="h-4 w-4 text-green-600" />
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
            <div className="h-[600px] w-full relative">
              {!isSharing && !position ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/80 backdrop-blur-sm rounded-lg">
                  <div className="text-center space-y-2 p-6">
                    <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <p className="font-body text-slate-600 font-medium">Location Sharing is Off</p>
                    <p className="font-body text-slate-500 text-sm">Turn on sharing to see your live location on the map.</p>
                  </div>
                </div>
              ) : null}
              
              {position ? (
                <Map
                  markers={markers}
                  center={[position.lat, position.lng]}
                  zoom={15}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center space-y-2">
                    <Loader2 className="h-8 w-8 text-muted-foreground mx-auto animate-spin" />
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
