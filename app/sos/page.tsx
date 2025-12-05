"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// WhatsApp number for hotel concierge (Costa Rica)
const HOTEL_WHATSAPP_NUMBER = "50688318381"; // Format for wa.me: country code + number without + or spaces
const HOLD_DURATION = 3000; // 3 seconds

export default function SOSPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const supabase = createClient();

  // Get current user
  useEffect(() => {
    async function getCurrentUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        }
      } catch (error) {
        console.error("Error getting user:", error);
      }
    }
    getCurrentUser();
  }, [supabase]);

  // Hold button logic
  const startHold = () => {
    if (isLoading) return;

    setIsHolding(true);
    startTimeRef.current = Date.now();

    // Update progress every 16ms for smooth animation
    progressTimerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
        setProgress(newProgress);

        if (newProgress >= 100) {
          completeHold();
        }
      }
    }, 16);

    // Fallback timer
    holdTimerRef.current = setTimeout(() => {
      completeHold();
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setIsHolding(false);
    setProgress(0);
    startTimeRef.current = null;
  };

  const completeHold = () => {
    cancelHold();
    triggerSOS();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelHold();
    };
  }, []);

  // SOS Protocol
  const triggerSOS = async () => {
    setIsLoading(true);

    try {
      // 1. Vibration
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }

      // 2. Get GPS position
      let lat: number | null = null;
      let lng: number | null = null;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              { timeout: 5000, maximumAge: 0, enableHighAccuracy: true }
            );
          });

          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch (error) {
          console.error("Error getting location:", error);
          // Continue anyway - emergency takes priority
        }
      }

      // 3. Save to Supabase
      if (userId) {
        try {
          const { error: dbError } = await supabase
            .from("sos_alerts")
            .insert({
              user_id: userId,
              lat,
              lng,
              status: "pending",
              created_at: new Date().toISOString(),
            });

          if (dbError) {
            console.error("Error saving SOS alert:", dbError);
            // Continue anyway - emergency takes priority
          }
        } catch (error) {
          console.error("Error inserting SOS alert:", error);
          // Continue anyway - emergency takes priority
        }
      }

      // 4. Generate WhatsApp link
      let whatsappMessage = "SOS! I need help.";
      
      if (lat !== null && lng !== null) {
        const googleMapsLink = `https://maps.google.com/?q=${lat},${lng}`;
        whatsappMessage += ` My location: ${googleMapsLink}`;
      } else {
        whatsappMessage += " Location unavailable - please check my last known location in the app.";
      }

      const whatsappUrl = `https://wa.me/${HOTEL_WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

      // 5. Open WhatsApp
      window.open(whatsappUrl, "_blank");

      // 6. Show success state
      setIsActivated(true);

      // Show toast
      toast({
        title: "SOS Alert Sent!",
        description: "Help is on the way. Stay calm.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error activating SOS:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send SOS alert. Please try again or call emergency services directly.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Post-activation screen
  if (isActivated) {
    return (
      <div className="min-h-screen bg-red-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-900/50 p-8 border-4 border-red-500">
                <CheckCircle2 className="h-20 w-20 text-red-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-5xl lg:text-6xl text-red-400 font-bold">
                ALERTA ENVIADA
              </h1>
              <h2 className="font-heading text-3xl lg:text-4xl text-red-300 font-bold">
                ALERT SENT
              </h2>
            </div>
            <p className="font-body text-xl text-red-200">
              Stay calm, help is on the way.
            </p>
          </div>

          <div className="bg-red-900/30 border-2 border-red-800 rounded-lg p-6 space-y-4 backdrop-blur-sm">
            <div className="space-y-3">
              <h2 className="font-heading text-2xl text-red-200">
                What to do now:
              </h2>
              <ul className="text-left space-y-3 text-red-100 font-body text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold text-xl">•</span>
                  <span>Stay where you are if it&apos;s safe</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold text-xl">•</span>
                  <span>Keep your phone accessible</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold text-xl">•</span>
                  <span>Help will arrive shortly</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold text-xl">•</span>
                  <span>Check WhatsApp for updates</span>
                </li>
              </ul>
            </div>
          </div>

          <Button
            onClick={() => {
              setIsActivated(false);
              router.push("/dashboard");
            }}
            className="w-full bg-red-800 hover:bg-red-700 text-white border-red-700"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Main SOS screen
  const circumference = 2 * Math.PI * 100; // radius = 100 (for 200px button)
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-red-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.5),transparent_70%)]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl space-y-8 text-center">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="font-heading text-5xl lg:text-6xl text-red-400 drop-shadow-2xl font-bold">
            EMERGENCY SOS
          </h1>
          <p className="font-body text-lg text-red-300">
            Hold the button for 3 seconds to send an emergency alert
          </p>
        </div>

        {/* SOS Button with Progress Ring */}
        <div className="flex justify-center py-8">
          <div className="relative flex items-center justify-center">
            {/* Progress Ring */}
            <svg
              className={cn(
                "absolute w-[200px] h-[200px] -rotate-90 transition-opacity duration-200",
                isHolding ? "opacity-100" : "opacity-0"
              )}
            >
              <circle
                cx="100"
                cy="100"
                r="95"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-red-900/50"
              />
              <circle
                cx="100"
                cy="100"
                r="95"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-red-500 transition-all duration-75"
                strokeLinecap="round"
              />
            </svg>

            {/* Button */}
            <Button
              onMouseDown={startHold}
              onMouseUp={cancelHold}
              onMouseLeave={cancelHold}
              onTouchStart={startHold}
              onTouchEnd={cancelHold}
              disabled={isLoading}
              className={cn(
                "relative w-[200px] h-[200px] rounded-full",
                "bg-red-600 hover:bg-red-700 active:bg-red-800",
                "text-white border-4 border-red-400",
                "shadow-2xl hover:shadow-red-500/50",
                "transition-all duration-200",
                isHolding && "scale-95 ring-4 ring-red-500/50 ring-offset-4 ring-offset-red-950",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col items-center gap-3">
                <AlertTriangle className="h-16 w-16" />
                <span className="text-2xl font-heading font-bold">HOLD FOR</span>
                <span className="text-4xl font-heading font-bold">HELP</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-red-900/30 backdrop-blur-sm border-2 border-red-800 rounded-lg p-6 space-y-4">
          <div className="space-y-3">
            <h2 className="font-heading text-xl text-red-200">
              How it works:
            </h2>
            <ul className="text-left space-y-2 text-red-100 font-body">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">1.</span>
                <span>Press and hold the SOS button for 3 seconds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">2.</span>
                <span>Your location will be sent to concierge</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">3.</span>
                <span>WhatsApp will open automatically with your location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">4.</span>
                <span>Help will be dispatched immediately</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Back Button */}
        <Button
          onClick={() => router.push("/dashboard")}
          variant="ghost"
          className="text-red-300 hover:text-red-200 hover:bg-red-900/30"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
