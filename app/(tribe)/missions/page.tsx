"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Trophy, Flame, Users } from "lucide-react";
import { TribeNavigation } from "@/components/shared/tribe-navigation";
import { cn } from "@/lib/utils";
import { DopamineEffect } from "@/components/shared/dopamine-effect";

const MOCK_MISSIONS = [
  { id: "1", title: "Morning Community Garden", time: "08:00 AM", status: "done" },
  { id: "2", title: "Assist Guest Check-in", time: "11:00 AM", status: "pending" },
  { id: "3", title: "Afternoon Yoga Session Support", time: "04:30 PM", status: "pending" },
];

export default function TribeMissionsPage() {
  const [missions, setMissions] = useState(MOCK_MISSIONS);
  const [showDopamine, setShowDopamine] = useState(false);

  const toggleMission = (id: string) => {
    const mission = missions.find(m => m.id === id);
    if (mission && mission.status !== "done") {
      setShowDopamine(true);
    }
    setMissions(prev => prev.map(m => 
      m.id === id ? { ...m, status: m.status === "done" ? "pending" : "done" } : m
    ));
  };

  const completedCount = missions.filter(m => m.status === "done").length;
  const progress = (completedCount / missions.length) * 100;

  return (
    <div className="min-h-screen pb-32 pt-8 px-6">
      <DopamineEffect active={showDopamine} onComplete={() => setShowDopamine(false)} />
      {/* Header Section */}
      <header className="mb-8 space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-light text-primary">Namaste, Tribe</h1>
            <p className="text-primary/60">Your contribution today keeps our heart beating.</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-accent p-0.5">
            <div className="w-full h-full rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-primary font-bold">
              JK
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="luxury-card p-4 flex flex-col items-center justify-center gap-2">
          <Flame className="text-accent w-6 h-6" />
          <span className="text-2xl font-semibold">12</span>
          <span className="text-[10px] uppercase tracking-widest text-primary/40">Day Streak</span>
        </div>
        <div className="luxury-card p-4 flex flex-col items-center justify-center gap-2">
          <Trophy className="text-accent w-6 h-6" />
          <span className="text-2xl font-semibold">2.4k</span>
          <span className="text-[10px] uppercase tracking-widest text-primary/40">Awake Points</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 space-y-3">
        <div className="flex justify-between items-end">
          <h2 className="text-lg font-medium">Daily Missions</h2>
          <span className="text-sm font-medium text-accent">{completedCount}/{missions.length} Done</span>
        </div>
        <div className="w-full h-2 bg-primary/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Missions List */}
      <div className="space-y-4">
        {missions.map((mission) => (
          <button
            key={mission.id}
            onClick={() => toggleMission(mission.id)}
            className={cn(
              "w-full text-left p-5 luxury-card flex items-center justify-between transition-all duration-300",
              mission.status === "done" && "opacity-60 bg-white/30"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                mission.status === "done" ? "bg-accent/20" : "bg-primary/5"
              )}>
                {mission.status === "done" ? (
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                ) : (
                  <Circle className="w-6 h-6 text-primary/20" />
                )}
              </div>
              <div>
                <h3 className={cn(
                  "font-medium transition-all",
                  mission.status === "done" && "line-through text-primary/40"
                )}>
                  {mission.title}
                </h3>
                <p className="text-xs text-primary/40 uppercase tracking-wider">{mission.time}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Community Insight */}
      <div className="mt-8 p-6 bg-primary text-white rounded-3xl shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-white/60 uppercase tracking-widest">Community Peak</p>
          <p className="text-lg font-light">14 others are helping now</p>
        </div>
        <div className="flex -space-x-2">
          {[1,2,3].map(i => (
             <div key={i} className="w-8 h-8 rounded-full border-2 border-primary bg-white/20" />
          ))}
        </div>
      </div>

      <TribeNavigation />
    </div>
  );
}

