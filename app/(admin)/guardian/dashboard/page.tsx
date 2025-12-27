"use client";

import React from "react";
import { 
  Users, 
  Home, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  MapPin,
  CheckCircle2,
  AlertCircle,
  Bell
} from "lucide-react";
import { AdminNavigation } from "@/components/shared/admin-navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const STATS = [
  { label: "Total Occupancy", value: "84%", icon: Home, trend: "+2.4%", color: "text-blue-600" },
  { label: "Active Guests", value: "142", icon: Users, trend: "+12", color: "text-emerald-600" },
  { label: "SOS Alerts", value: "1", icon: ShieldAlert, trend: "Active", color: "text-red-500" },
  { label: "RevPAR", value: "$420", icon: TrendingUp, trend: "+15%", color: "text-accent" },
];

export default function GuardianDashboardPage() {
  const [alerts, setAlerts] = useState([
    { id: "1", type: "SOS", user: "Marco Rossi", location: "Sector 4 - Cabin 12", time: "2m ago", status: "active" },
    { id: "2", type: "MAINTENANCE", user: "Harmony Team", location: "Main Pool", time: "15m ago", status: "pending" },
    { id: "3", type: "CHECK-IN", user: "Sarah Jenkins", location: "Reception", time: "45m ago", status: "completed" },
  ]);

  useEffect(() => {
    // 1. Listen for new SOS Alerts in Realtime
    const sosSubscription = supabase
      .channel('sos-updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'sos_alerts' 
      }, (payload) => {
        console.log('New SOS Alert!', payload);
        const newAlert = {
          id: payload.new.id,
          type: "SOS",
          user: "New SOS Alert", // We would fetch user details here
          location: "Unknown Location", 
          time: "Just now",
          status: "active"
        };
        setAlerts(prev => [newAlert, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sosSubscription);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      <AdminNavigation />

      <main className="p-8">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-light text-primary">Guardian Overview</h1>
            <p className="text-primary/40">Real-time status of Awake OS Ecosystem.</p>
          </div>
          <div className="flex gap-4">
             <div className="luxury-card px-4 py-2 flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-accent" /> Dec 26, 14:32
             </div>
             <button className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20">
                Download Report
             </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="luxury-card p-6 flex flex-col justify-between h-40">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-2xl bg-slate-50 text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={cn("text-xs font-bold px-2 py-1 rounded-full bg-slate-50", stat.color)}>
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/40 mt-1">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Global SOS Map Preview */}
          <div className="xl:col-span-2 luxury-card overflow-hidden flex flex-col h-[500px]">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
                <h3 className="font-bold text-primary flex items-center gap-2">
                   <MapPin className="w-4 h-4 text-red-500" /> Live Property Map
                </h3>
                <div className="flex gap-2">
                   <div className="flex items-center gap-1.5 text-xs font-bold text-primary/40">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" /> 141 Stable
                   </div>
                   <div className="flex items-center gap-1.5 text-xs font-bold text-primary/40 ml-4">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> 1 Alert
                   </div>
                </div>
             </div>
             <div className="flex-1 bg-slate-200 relative">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=2000')] bg-cover bg-center opacity-40 grayscale" />
                
                {/* SOS Pulse Pin */}
                <div className="absolute top-[40%] left-[60%] -translate-x-1/2 -translate-y-1/2">
                   <div className="relative">
                      <div className="absolute inset-0 w-12 h-12 bg-red-500 rounded-full animate-ping opacity-30" />
                      <div className="relative w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                         <ShieldAlert className="w-4 h-4 text-white" />
                      </div>
                   </div>
                </div>
                
                {/* Other Static Pins */}
                <div className="absolute top-[20%] left-[30%] w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-md" />
                <div className="absolute top-[70%] left-[20%] w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-md" />
                <div className="absolute top-[80%] left-[80%] w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-md" />
             </div>
          </div>

          {/* Activity / Alerts Feed */}
          <div className="luxury-card flex flex-col h-[500px]">
            <div className="p-6 border-b border-slate-100 bg-white/50">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <Bell className="w-4 h-4 text-accent" /> Intelligence Feed
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex gap-4 group cursor-pointer">
                   <div className={cn(
                     "w-1 h-12 rounded-full transition-all group-hover:w-1.5",
                     alert.type === "SOS" ? "bg-red-500" : alert.status === "completed" ? "bg-emerald-500" : "bg-amber-400"
                   )} />
                   <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                         <p className="text-sm font-bold text-primary uppercase tracking-tighter">{alert.type}</p>
                         <span className="text-[10px] text-primary/30 font-bold">{alert.time}</span>
                      </div>
                      <p className="text-sm font-medium text-primary/80">{alert.user}</p>
                      <p className="text-xs text-primary/40 flex items-center gap-1">
                         <MapPin className="w-3 h-3" /> {alert.location}
                      </p>
                   </div>
                </div>
              ))}
            </div>
            <button className="p-4 text-xs font-bold text-primary/40 uppercase tracking-widest border-t border-slate-100 hover:text-primary transition-colors">
              View All Intelligence
            </button>
          </div>

        </div>

        {/* Global Operational Status */}
        <div className="mt-10 luxury-card p-8 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                 <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                 <h4 className="text-xl font-bold text-primary">System Integrity: 100%</h4>
                 <p className="text-primary/40">All 6 operational modules are communicating with the Hive.</p>
              </div>
           </div>
           <div className="flex gap-4">
              <div className="flex flex-col items-end">
                 <span className="text-[10px] uppercase font-black text-primary/30 tracking-widest">Network Latency</span>
                 <span className="font-bold">24ms</span>
              </div>
              <div className="flex flex-col items-end ml-8">
                 <span className="text-[10px] uppercase font-black text-primary/30 tracking-widest">Global Sync</span>
                 <span className="font-bold">Active</span>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}


