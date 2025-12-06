"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

type HoldButtonProps = {
  onActivate: () => void;
  disabled?: boolean;
};

const HOLD_DURATION = 3000; // 3 seconds

export function HoldButton({ onActivate, disabled = false }: HoldButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startHold = () => {
    if (disabled) return;

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
    onActivate();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelHold();
    };
  }, []);

  const circumference = 2 * Math.PI * 120; // radius = 120
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Progress Ring */}
      <svg
        className={cn(
          "absolute w-64 h-64 -rotate-90 transition-opacity duration-200",
          isHolding ? "opacity-100" : "opacity-0"
        )}
      >
        <circle
          cx="128"
          cy="128"
          r="120"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-destructive/20"
        />
        <circle
          cx="128"
          cy="128"
          r="120"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-destructive transition-all duration-75"
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
        disabled={disabled}
        className={cn(
          "relative w-64 h-64 rounded-full text-2xl font-heading font-bold",
          "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
          "shadow-2xl hover:shadow-destructive/50",
          "transition-all duration-200",
          "active:scale-95",
          isHolding && "ring-4 ring-destructive/50 ring-offset-4 ring-offset-background",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <AlertTriangle className="h-12 w-12" />
          <span className="text-lg">HOLD FOR</span>
          <span className="text-3xl">SOS</span>
        </div>
      </Button>
    </div>
  );
}

