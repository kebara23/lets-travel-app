"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: Date;
  on24Hours?: () => void;
  on1Hour?: () => void;
}

export function CountdownTimer({ targetDate, on24Hours, on1Hour }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [hasNotified24h, setHasNotified24h] = useState(false);
  const [hasNotified1h, setHasNotified1h] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });

      // Calculate total hours and minutes until target
      const totalHours = diff / (1000 * 60 * 60);
      const totalMinutes = diff / (1000 * 60);

      // Check for 24-hour notification (between 24h and 23h 30m)
      if (!hasNotified24h && totalHours <= 24 && totalHours > 23.5) {
        setHasNotified24h(true);
        on24Hours?.();
      }

      // Check for 1-hour notification (between 60m and 59m)
      if (!hasNotified1h && totalMinutes <= 60 && totalMinutes > 59) {
        setHasNotified1h(true);
        on1Hour?.();
      }
    }, 1000);

    return () => clearInterval(interval);
    // Removed on24Hours and on1Hour from dependencies to prevent unnecessary re-renders
    // These callbacks are stable and don't need to be in dependencies
  }, [targetDate, hasNotified24h, hasNotified1h]);

  return (
    <div className="flex items-center gap-2 text-sm font-medium font-body">
      <Clock className="h-4 w-4 text-primary" />
      <span className="text-foreground">
        Starts in:{" "}
        <span className="font-semibold text-primary">
          {String(timeLeft.days).padStart(2, "0")}d {String(timeLeft.hours).padStart(2, "0")}h{" "}
          {String(timeLeft.minutes).padStart(2, "0")}m {String(timeLeft.seconds).padStart(2, "0")}s
        </span>
      </span>
    </div>
  );
}

