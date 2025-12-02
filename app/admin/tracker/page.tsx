"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { LocateFixed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Importación dinámica del Mapa
const Map = dynamic(
  () => import("@/components/ui/Map").then((mod) => ({ default: mod.Map })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-lg animate-pulse">
        <p className="text-slate-400">Cargando Mapa...</p>
      </div>
    ),
  }
);

// Tipos de datos flexibles
type TrackingData = {
  user_id: string;
  lat: number;
  lng: number;
  updated_at?: string;
  is_active?: boolean;
};

export default function TrackerPage() {
  const [isSharing, setIsSharing] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<TrackingData | null>(null);
  const { toast } = useToast();
  const supabase = createClient();
  const watchIdRef = useRef<number | null>(null);

  // Función para guardar posición
  const upsertLocation = useCallback(async (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const payload = {
        user_id: user.id,
        lat: latitude,
        lng: longitude,
        is_active: true,
      };

      const { error } = await supabase
        .from('device_tracking')
        .upsert(payload, { onConflict: 'user_id' });

      if (!error) {
        setCurrentPosition(payload);
      } else {
        console.error("Tracking save error:", error);
      }
    }
  }, [supabase]);

  // --- LÓGICA DE GEOLOCALIZACIÓN ---
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;

    if (isSharing) {
      if (watchIdRef.current === null) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          upsertLocation,
          (error) => {
            console.error("GPS Error:", error);
            toast({
              title: "GPS Error",
              description: "Please allow location access.",
              variant: "destructive"
            });
            setIsSharing(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isSharing, upsertLocation, toast]);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50">
      <div className="p-6 bg-white border-b shadow-sm z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Location Sharing</h1>
            <p className="text-sm text-slate-500">Real-time safety tracking</p>
          </div>
          <Badge variant={isSharing ? "default" : "secondary"} className={isSharing ? "bg-green-600" : ""}>
            {isSharing ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Switch Manual (Sin dependencia de componente Label) */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border cursor-pointer" onClick={() => setIsSharing(!isSharing)}>
          <div className="flex-1">
             <span className="font-medium block text-slate-900">Enable GPS</span>
             <span className="text-xs text-slate-500">Allow concierge to see your location.</span>
          </div>
          
          {/* Toggle Visual */}
          <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${isSharing ? 'bg-green-600' : 'bg-gray-300'}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${isSharing ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-200">
        {currentPosition ? (
          <Map
            markers={[
              {
                lat: currentPosition.lat,
                lng: currentPosition.lng,
                popupText: "You",
              },
            ]}
            center={[currentPosition.lat, currentPosition.lng]}
            zoom={15}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8">
            <LocateFixed className="w-16 h-16 mb-4 opacity-50" />
            <p>Waiting for GPS...</p>
          </div>
        )}
      </div>
    </div>
  );
}