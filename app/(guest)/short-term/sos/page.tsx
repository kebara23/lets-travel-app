"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, MapPin, X, PhoneCall } from "lucide-react";
import { GuestNavigation } from "@/components/shared/guest-navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/use-user-store";

export default function SOSPage() {
  const [isAlerting, setIsAlerting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const { user } = useUserStore();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAlerting && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isAlerting && countdown === 0) {
      triggerSOS();
    }
    return () => clearTimeout(timer);
  }, [isAlerting, countdown]);

  const triggerSOS = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.from('sos_alerts').insert({
        user_id: user.id,
        organization_id: user.organization_id!,
        lat: 0, // In Capacitor, use Geolocation.getCurrentPosition()
        lng: 0,
        status: 'active'
      });

      if (error) throw error;
      console.log("SOS TRIGGERED IN DB");
    } catch (err) {
      console.error("Failed to trigger SOS:", err);
    }
  };

  const toggleAlert = () => {
    if (!isAlerting) {
        setIsAlerting(true);
        setCountdown(5);
        // Haptic Feedback would be triggered here via Capacitor
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
    } else {
        setIsAlerting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 pb-32">
      <div className="w-full max-w-md space-y-12 text-center">
        
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-light text-primary">Safety First</h1>
          <p className="text-primary/60 text-lg">
            Immediate assistance is just a hold away.
          </p>
        </div>

        {/* SOS Button Area */}
        <div className="relative flex items-center justify-center h-80">
          
          {/* Animated Ripples */}
          {isAlerting && (
            <>
              <div className="absolute w-64 h-64 bg-red-400/20 rounded-full animate-ping" />
              <div className="absolute w-80 h-80 bg-red-400/10 rounded-full animate-ping [animation-delay:0.5s]" />
            </>
          )}

          {/* Main Button */}
          <button
            onMouseDown={toggleAlert}
            onTouchStart={toggleAlert}
            className={cn(
              "relative z-10 w-60 h-60 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 active:scale-95",
              isAlerting 
                ? "bg-red-500 text-white scale-110" 
                : "bg-white text-red-500 border-8 border-red-50"
            )}
          >
            {isAlerting ? (
              <div className="space-y-2">
                <span className="text-6xl font-bold">{countdown}</span>
                <p className="text-xs font-bold uppercase tracking-widest">Hold to Cancel</p>
              </div>
            ) : (
              <>
                <ShieldAlert className="w-20 h-20 mb-4" />
                <span className="text-xl font-bold uppercase tracking-widest">SOS</span>
              </>
            )}
          </button>
        </div>

        {/* Location Preview */}
        <div className="luxury-card p-6 flex items-center gap-4 text-left">
           <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
              <MapPin className="w-6 h-6" />
           </div>
           <div>
              <p className="text-xs text-primary/40 uppercase tracking-widest font-bold">Your Location</p>
              <p className="text-sm font-medium">Aura Cabin, Sector 4 • Shared with Guardian</p>
           </div>
        </div>

        {/* Quick Contacts */}
        <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 p-4 luxury-card text-primary font-medium">
                <PhoneCall className="w-4 h-4 text-accent" /> Concierge
            </button>
            <button className="flex items-center justify-center gap-2 p-4 luxury-card text-primary font-medium">
                <X className="w-4 h-4 text-red-400" /> Medical
            </button>
        </div>

      </div>

      <GuestNavigation />
    </div>
  );
}


