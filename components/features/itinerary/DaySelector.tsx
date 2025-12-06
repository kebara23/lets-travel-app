"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DaySelectorProps = {
  days: number[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
};

export function DaySelector({ days, selectedDay, onSelectDay }: DaySelectorProps) {
  if (days.length === 0) return null;

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-4">
        {days.map((day) => (
          <Button
            key={day}
            variant={selectedDay === day ? "default" : "outline"}
            onClick={() => onSelectDay(day)}
            className={cn(
              "min-w-[100px] font-heading",
              selectedDay === day
                ? "bg-primary text-primary-foreground"
                : "bg-card hover:bg-primary/10"
            )}
          >
            Day {day}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

