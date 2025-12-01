"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// --- CORRECCIÓN CRÍTICA ---
// Importamos el mapa de forma dinámica y desactivamos SSR (Server Side Rendering)
const Map = dynamic(
  () => import("@/components/ui/Map").then((mod) => ({ default: mod.Map })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-lg animate-pulse">
        <p className="text-slate-400">Loading Map...</p>
      </div>
    ),
  }
);
// ---------------------------

// Tipos simples para evitar errores
type TrackingData = {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  updated_at: string;
  users?: any;
};

export default function TrackerPage() {
  const supabase = createClient();
  const [trackingData, setTrackingData] = useState<TrackingData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Usamos objeto simple para evitar errores de Map()
  const markersRef = useRef<Record<string, any>>({});

  // Carga inicial
  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase
          .from("device_tracking")
          .select(`*, users(full_name, email)`);
        
        if (data) setTrackingData(data as any);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("tracker-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "device_tracking" },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            setTrackingData((prev) => prev.filter((i) => i.id !== payload.old.id));
            return;
          }
          // Si es insert/update, recargamos el dato completo para tener el nombre del usuario
          const { data } = await supabase
            .from("device_tracking")
            .select(`*, users(full_name, email)`)
            .eq('id', payload.new.id)
            .single();
            
          if (data) {
            setTrackingData((prev) => {
              // Eliminar si ya existe y agregar el nuevo
              const filtered = prev.filter((i) => i.user_id !== data.user_id);
              return [...filtered, data as any];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Preparar marcadores
  const markers = trackingData.map(item => ({
    lat: item.lat,
    lng: item.lng,
    popupText: item.users?.full_name || "Unknown",
    userId: item.user_id
  }));

  const defaultCenter: [number, number] = [9.7489, -83.7534]; // Costa Rica
  const mapCenter = markers.length > 0 ? [markers[0].lat, markers[0].lng] as [number, number] : defaultCenter;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-slate-100">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Tracker</h1>
          <p className="text-sm text-slate-500">Real-time GPS locations</p>
        </div>
        <Badge variant="outline">
          <Users className="w-4 h-4 mr-2" />
          {markers.length} Online
        </Badge>
      </div>

      <div className="flex-1 relative">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <Map 
            markers={markers} 
            center={mapCenter} 
            zoom={markers.length > 0 ? 12 : 7} 
          />
        )}
      </div>
    </div>
  );
}
