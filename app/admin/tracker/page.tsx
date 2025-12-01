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

// Importación dinámica del Mapa para evitar errores de servidor (SSR)
// IMPORTANTE: Asume que el componente Map se exporta como { Map } (Named Export)
const Map = dynamic(
  () => import("@/components/ui/Map").then((mod) => ({ default: mod.Map })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg animate-pulse">
        <p className="text-muted-foreground">Loading Map...</p>
      </div>
    ),
  }
);

// Tipos de datos
type TrackingData = {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  updated_at: string;
  users?: {
    full_name: string;
    email: string;
  } | null; // Puede ser null si el join falla
};

export type MapMarker = {
  lat: number;
  lng: number;
  popupText: string;
  userId: string;
  icon?: L.DivIcon;
};

export default function TrackerPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [trackingData, setTrackingData] = useState<TrackingData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // SOLUCIÓN AL ERROR: Usamos un Objeto Plano ({}) en lugar de Map()
  const markersRef = useRef<Record<string, MapMarker>>({});

  // Función para crear iconos de colores según el nombre
  function createUserIcon(userName: string): L.DivIcon {
    // Si estamos en el servidor (no window), retornamos algo básico o nada
    if (typeof window === 'undefined') return L.divIcon({});

    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
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

  // Convertir datos de DB a marcadores de Mapa
  function trackingDataToMarkers(data: TrackingData[]): MapMarker[] {
    return data.map((item) => {
      // Manejo seguro de datos de usuario (puede venir como array o objeto)
      const userObj = Array.isArray(item.users) ? item.users[0] : item.users;
      const userName = userObj?.full_name || "Unknown";
      const userId = item.user_id;
      
      // Lógica de caché de iconos
      let icon: L.DivIcon;
      // ACCESO SEGURO: Usamos corchetes [] en lugar de .get()
      if (markersRef.current[userId]) {
        icon = markersRef.current[userId].icon || createUserIcon(userName);
      } else {
        icon = createUserIcon(userName);
      }
      
      const marker: MapMarker = {
        lat: item.lat,
        lng: item.lng,
        popupText: `${userName}`,
        userId: userId,
        icon,
      };

      // GUARDADO SEGURO: Usamos asignación directa
      markersRef.current[userId] = marker;
      
      return marker;
    });
  }

  // Carga inicial de datos
  async function fetchTrackingData() {
    try {
      const { data, error } = await supabase
        .from("device_tracking")
        .select(`
          id, user_id, lat, lng, updated_at,
          users ( full_name, email )
        `);

      if (error) throw error;

      // Forzamos el tipo para evitar errores de TS con el Join
      const typedData = data as unknown as TrackingData[];
      setTrackingData(typedData);
    } catch (error: any) {
      console.error("Error loading tracker:", error);
    } finally {
      setLoading(false);
    }
  }

  // Efecto de carga inicial
  useEffect(() => {
    fetchTrackingData();
  }, []);

  // Efecto Realtime
  useEffect(() => {
    const channel = supabase
      .channel("live-tracker")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "device_tracking" },
        async (payload) => {
          console.log("📡 Señal de Tracker recibida:", payload);

          if (payload.eventType === "DELETE") {
            setTrackingData((prev) => prev.filter((i) => i.id !== payload.old.id));
            if (payload.old.user_id) delete markersRef.current[payload.old.user_id];
            return;
          }

          // Si es INSERT o UPDATE, necesitamos el nombre del usuario
          const userId = payload.new.user_id;
          const { data: userData } = await supabase
            .from("users")
            .select("full_name, email")
            .eq("id", userId)
            .single();

          const newItem: TrackingData = {
            id: payload.new.id,
            user_id: userId,
            lat: payload.new.lat,
            lng: payload.new.lng,
            updated_at: payload.new.updated_at,
            users: userData,
          };

          setTrackingData((prev) => {
            // Si ya existe, actualizamos. Si no, agregamos.
            const exists = prev.find((i) => i.user_id === userId);
            if (exists) {
              return prev.map((i) => (i.user_id === userId ? newItem : i));
            }
            return [...prev, newItem];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markers = trackingDataToMarkers(trackingData);
  // Centro aproximado (Panamá/Costa Rica por defecto si no hay datos)
  const defaultCenter: [number, number] = [9.7489, -83.7534]; 
  const mapCenter = markers.length > 0 ? [markers[0].lat, markers[0].lng] as [number, number] : defaultCenter;

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] w-full bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Tracker</h1>
          <p className="text-sm text-slate-500">Real-time GPS locations</p>
        </div>
        <Badge variant={markers.length > 0 ? "default" : "secondary"}>
          <Users className="w-4 h-4 mr-2" />
          {markers.length} Online
        </Badge>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <Map 
          markers={markers} 
          center={mapCenter} 
          zoom={markers.length > 0 ? 10 : 7} 
        />
      </div>
    </div>
  );
}
