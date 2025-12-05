"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Componente auxiliar para recentrar el mapa cuando cambian los puntos
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

type MapProps = {
  markers: Array<{
    lat: number;
    lng: number;
    popupText: string;
    icon?: L.DivIcon | L.Icon; // Aceptamos iconos personalizados
  }>;
  center: [number, number];
  zoom: number;
  className?: string;
  style?: React.CSSProperties;
};

// Enhanced Popup component with HTML support
function EnhancedPopup({ content }: { content: string }) {
  return (
    <Popup>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </Popup>
  );
}

// Exportamos como "Map" (Named Export) para que coincida con el import dinámico
export function Map({ markers, center, zoom, className, style }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Estado de montaje: solo se ejecuta una vez cuando el componente se monta en el cliente
  useEffect(() => {
    setIsMounted(true);

    // Fix para iconos de Leaflet en Next.js (si no, no se ven los pines)
    // Solo se ejecuta en el cliente después de montar
    if (typeof window !== "undefined") {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    }
  }, []);

  // Renderizado condicional: solo renderiza el MapContainer cuando el componente está montado
  if (!isMounted) {
    return (
      <div className={className || "h-full w-full z-0"} style={style || { height: "100%", width: "100%" }}>
        <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-lg">
          <p className="text-slate-400">Loading Map...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className={className || "h-full w-full z-0"}
      style={style || { height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater center={center} zoom={zoom} />

      {markers.map((marker, idx) => (
        <Marker 
          key={idx} 
          position={[marker.lat, marker.lng]}
          icon={marker.icon} // Si es undefined, usa el default
        >
          <EnhancedPopup content={marker.popupText} />
        </Marker>
      ))}
    </MapContainer>
  );
}
