"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Helper to recenter map
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
    icon?: any;
  }>;
  center: [number, number];
  zoom: number;
  className?: string;
  style?: React.CSSProperties;
};

function EnhancedPopup({ content }: { content: string }) {
  return (
    <Popup>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </Popup>
  );
}

export function Map({ markers, center, zoom, className, style }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [LeafletLib, setLeafletLib] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initLeaflet = async () => {
      try {
        const L = await import("leaflet");
        
        // Fix default icons
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        setLeafletLib(L);
        setIsMounted(true);
      } catch (error) {
        console.error("Error loading Leaflet:", error);
      }
    };

    initLeaflet();
  }, []);

  // Create default icon once Leaflet is loaded
  const defaultIcon = useMemo(() => {
    if (!LeafletLib) return null;
    return new LeafletLib.Icon.Default();
  }, [LeafletLib]);

  if (!isMounted || !LeafletLib) {
    return (
      <div className={className || "h-full w-full"} style={style || { height: "100%", width: "100%" }}>
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
      className={className || "h-full w-full"}
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
          icon={marker.icon || defaultIcon} 
        >
          <EnhancedPopup content={marker.popupText} />
        </Marker>
      ))}
    </MapContainer>
  );
}
