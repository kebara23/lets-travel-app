"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export type MapMarker = {
  lat: number;
  lng: number;
  popupText?: string;
  icon?: L.Icon | L.DivIcon;
};

type MapProps = {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
};

// Component to update map center when center prop changes
function MapCenterUpdater({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
}

// Default custom marker icon
function createDefaultIcon() {
  return L.divIcon({
    className: "custom-marker",
    html: '<div style="font-size: 32px;">📍</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export function Map({ markers, center, zoom = 13, className = "", style }: MapProps) {
  // Calculate center from markers if not provided
  const mapCenter: [number, number] = center || (markers.length > 0 
    ? [markers[0].lat, markers[0].lng]
    : [0, 0]);

  return (
    <div className={`w-full h-full ${className}`} style={style}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {center && <MapCenterUpdater center={center} zoom={zoom} />}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={[marker.lat, marker.lng]}
            icon={marker.icon || createDefaultIcon()}
          >
            {marker.popupText && <Popup>{marker.popupText}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

