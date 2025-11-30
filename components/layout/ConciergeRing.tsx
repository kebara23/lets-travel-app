"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell, X, AlertTriangle, MessageCircle, MapPin } from "lucide-react";

export function ConciergeRing() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleAction = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Satellite Buttons - Appear when menu is open */}
      {isOpen && (
        <>
          {/* SOS Button (Priority) */}
          <div className="flex flex-row items-center justify-end gap-3">
            <div className="text-sm font-medium text-slate-900 bg-white px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
              Emergency
            </div>
            <Button
              onClick={() => handleAction("/sos")}
              className={`
                rounded-full h-12 w-12 p-0 bg-red-600 hover:bg-red-700 text-white shadow-lg
                transition-all duration-300
                ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
              `}
              style={{
                transform: isOpen ? "translateY(0)" : "translateY(1rem)",
              }}
            >
              <AlertTriangle className="h-5 w-5" />
            </Button>
          </div>

          {/* Chat Button */}
          <div className="flex flex-row items-center justify-end gap-3">
            <div className="text-sm font-medium text-slate-900 bg-white px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
              Chat
            </div>
            <Button
              onClick={() => handleAction("/messages")}
              className={`
                rounded-full h-12 w-12 p-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg
                transition-all duration-300
                ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
              `}
              style={{
                transform: isOpen ? "translateY(0)" : "translateY(1rem)",
                transitionDelay: isOpen ? "50ms" : "0ms",
              }}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>

          {/* Tracker Button */}
          <div className="flex flex-row items-center justify-end gap-3">
            <div className="text-sm font-medium text-slate-900 bg-white px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
              Tracker
            </div>
            <Button
              onClick={() => handleAction("/tracking")}
              className={`
                rounded-full h-12 w-12 p-0 bg-slate-600 hover:bg-slate-700 text-white shadow-lg
                transition-all duration-300
                ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
              `}
              style={{
                transform: isOpen ? "translateY(0)" : "translateY(1rem)",
                transitionDelay: isOpen ? "100ms" : "0ms",
              }}
            >
              <MapPin className="h-5 w-5" />
            </Button>
          </div>
        </>
      )}

      {/* Main Ring Button */}
      <Button
        onClick={toggleMenu}
        className={`
          rounded-full h-16 w-16 p-0 shadow-2xl transition-all duration-300
          ${isOpen 
            ? "bg-slate-700 hover:bg-slate-800 text-white rotate-45" 
            : "bg-secondary hover:bg-[#b8903a] text-secondary-foreground hover:scale-105"
          }
        `}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Bell className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
