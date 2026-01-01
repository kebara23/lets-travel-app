"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusPill({ status, size = 'sm' }: StatusPillProps) {
  const getColors = () => {
    switch (status.toLowerCase()) {
      case 'clean':
      case 'resolved':
      case 'completed':
      case 'ready':
      case 'stable':
        return "bg-awake-sage/10 text-awake-sage border-awake-sage/20";
      case 'dirty':
      case 'open':
      case 'imbalance':
      case 'high':
        return "bg-awake-terracotta/10 text-awake-terracotta border-awake-terracotta/20";
      case 'cleaning':
      case 'in_progress':
      case 'attention':
      case 'medium':
      case 'active':
        return "bg-awake-gold/10 text-awake-gold border-awake-gold/20";
      case 'maintenance':
      case 'low':
        return "bg-awake-lavender/10 text-awake-lavender border-awake-lavender/20";
      default:
        return "bg-awake-moss/5 text-awake-moss/40 border-awake-moss/10";
    }
  };

  return (
    <span className={cn(
      "font-black uppercase tracking-widest border rounded-full inline-flex items-center justify-center transition-all duration-500",
      size === 'sm' ? "text-[8px] px-2.5 py-1" : "text-[10px] px-4 py-1.5",
      getColors()
    )}>
      {status.replace('_', ' ')}
    </span>
  );
}
