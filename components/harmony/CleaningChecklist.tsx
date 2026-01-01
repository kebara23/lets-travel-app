"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getChecklistForSpace, HarmonyTask } from "@/lib/checklist-logic";

interface CleaningChecklistProps {
  roomName: string;
  roomType: any;
  onClose: () => void;
  onComplete: () => void;
}

export function CleaningChecklist({ roomName, roomType, onClose, onComplete }: CleaningChecklistProps) {
  const tasks = getChecklistForSpace(roomType);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const toggleTask = (id: string) => {
    setCompletedIds(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const progress = (completedIds.length / tasks.length) * 100;
  const allDone = completedIds.length === tasks.length;

  return (
    <div className="fixed inset-0 z-[100] bg-awake-bone flex flex-col animate-in">
      {/* Mycelium Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-stone-200/30 z-[110]" />
      <div 
        className="fixed top-0 left-0 h-2 bg-awake-sage z-[111] transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(143,168,122,0.5)]" 
        style={{ width: `${progress}%` }}
      />

      <header className="p-10 pt-20 flex justify-between items-center border-b border-stone-200/30">
        <button onClick={onClose} className="p-4 -ml-4 text-awake-moss hover:bg-white/40 rounded-full transition-all active:scale-95">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center space-y-1">
          <h2 className="text-4xl font-serif text-awake-moss italic leading-tight">{roomName}</h2>
          <p className="text-[10px] font-sans font-black uppercase tracking-[0.4em] text-awake-moss/30">
            Harmonization Ritual • {roomType.type}
          </p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {tasks.map((task) => {
          const isDone = completedIds.includes(task.id);
          const Icon = task.icon;

          return (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={cn(
                "w-full text-left p-8 rounded-4xl border transition-all duration-700 flex items-center gap-8 group",
                isDone 
                  ? "bg-awake-sage/5 border-awake-sage/20 opacity-60" 
                  : "bg-white border-stone-200/50 shadow-awake-soft hover:shadow-awake-floating"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-1000",
                isDone ? "bg-awake-sage text-white shadow-lg rotate-[360deg]" : "bg-awake-bone text-awake-moss/20 border border-stone-200/50 group-hover:border-awake-sage/30"
              )}>
                {isDone ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
              </div>

              <div className="flex-1 space-y-1">
                <p className={cn(
                  "text-[10px] font-sans font-black uppercase tracking-[0.2em] transition-colors",
                  isDone ? "text-awake-sage" : "text-awake-moss/30"
                )}>
                  {task.category}
                </p>
                <p className={cn(
                  "text-xl font-sans font-semibold transition-all duration-700",
                  isDone ? "text-awake-moss/40 line-through decoration-awake-sage/30" : "text-awake-moss"
                )}>
                  {task.label}
                </p>
              </div>
              
              <Icon className={cn(
                "w-6 h-6 transition-all duration-700",
                isDone ? "text-awake-sage scale-110" : "text-awake-moss/10 group-hover:text-awake-moss/30"
              )} />
            </button>
          );
        })}
      </div>

      <div className="p-10 bg-awake-bone/80 backdrop-blur-xl border-t border-stone-200/30">
        <button
          disabled={!allDone}
          onClick={onComplete}
          className={cn(
            "w-full py-6 rounded-full font-sans font-black uppercase tracking-[0.4em] text-xs transition-all duration-1000 flex items-center justify-center gap-4",
            allDone 
              ? "bg-awake-moss text-white shadow-awake-floating scale-100 hover:bg-awake-moss/90" 
              : "bg-stone-200 text-awake-moss/20 scale-95 opacity-50 cursor-not-allowed"
          )}
        >
          {allDone ? (
            <>
              Complete Harmonization <Sparkles className="w-4 h-4 text-awake-sage animate-pulse" />
            </>
          ) : (
            `Listening... ${completedIds.length} / ${tasks.length}`
          )}
        </button>
      </div>
    </div>
  );
}
