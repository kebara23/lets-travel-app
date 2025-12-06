"use client";

import { ActiveUser } from "@/hooks/useActiveUserLocations";

// Check if user is stale (last updated > 1 hour ago)
export function isStale(lastUpdated: string): boolean {
  const now = new Date();
  const updated = new Date(lastUpdated);
  const diffInMs = now.getTime() - updated.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  return diffInHours > 1;
}

// Create custom marker icon with avatar
export function createAvatarMarker(user: ActiveUser): any {
  // Ensure we're on the client side - this should never be called during SSR
  if (typeof window === "undefined") {
    // Fallback for SSR (shouldn't happen with proper guards)
    return null;
  }

  // Import Leaflet dynamically only on client side
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const L = require("leaflet") as typeof import("leaflet");
  const stale = isStale(user.lastUpdated);
  const opacity = stale ? 0.5 : 1;
  const grayscale = stale ? "grayscale(100%)" : "none";

  return L.divIcon({
    className: "custom-avatar-marker",
    html: `
      <div style="
        position: relative;
        width: 48px;
        height: 48px;
        filter: ${grayscale};
        opacity: ${opacity};
      ">
        <div style="
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid ${stale ? '#6b7280' : '#3b82f6'};
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        ">
          ${user.avatarUrl 
            ? `<img src="${user.avatarUrl}" alt="${user.name}" style="width: 100%; height: 100%; object-fit: cover;" />`
            : `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">${user.name.charAt(0).toUpperCase()}</div>`
          }
        </div>
        <div style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 12px solid ${stale ? '#6b7280' : '#3b82f6'};
        "></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
  });
}

