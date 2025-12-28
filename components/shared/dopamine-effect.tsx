"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  velocity: number;
}

export function DopamineEffect({ active, onComplete }: { active: boolean; onComplete?: () => void }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const colors = ["#C9A24E", "#1B4734", "#F5EFE6", "#FFFFFF"];

  useEffect(() => {
    if (active) {
      // Trigger Haptic Feedback (Capacitor/Native feel)
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }

      // Generate Particles
      const newParticles: Particle[] = Array.from({ length: 30 }).map((_, i) => ({
        id: Date.now() + i,
        x: 50, // Center X percentage
        y: 50, // Center Y percentage
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        velocity: 2 + Math.random() * 4,
      }));

      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        if (onComplete) onComplete();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full animate-explosion"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            "--angle": `${p.angle}rad`,
            "--velocity": `${p.velocity}`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}



