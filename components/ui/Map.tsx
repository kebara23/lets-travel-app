"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix para iconos de Leaflet en Next.js (si no, no se ven los pines)
// Solo se ejecuta en el cliente
if (typeof window !== "undefined") {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

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

// Exportamos como "Map" (Named Export) para que coincida con el import dinámico
export function Map({ markers, center, zoom, className, style }: MapProps) {
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
          <Popup>
            <div className="font-sans text-sm font-medium">
              {marker.popupText.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
