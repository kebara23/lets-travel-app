"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Hotel,
  UtensilsCrossed,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ItineraryItem } from "@/hooks/useItinerary";
import { cn } from "@/lib/utils";

type TimelineItemProps = {
  item: ItineraryItem;
  isLast: boolean;
  onToggleComplete: (id: string, is_completed: boolean) => void;
  isUpdating?: boolean;
};

const typeIcons = {
  flight: Plane,
  hotel: Hotel,
  activity: MapPin,
  food: UtensilsCrossed,
};

const typeColors = {
  flight: "bg-blue-100 text-blue-700 border-blue-200",
  hotel: "bg-purple-100 text-purple-700 border-purple-200",
  activity: "bg-primary/10 text-primary border-primary/20",
  food: "bg-luxury/20 text-luxury border-luxury/30",
};

export function TimelineItem({
  item,
  isLast,
  onToggleComplete,
  isUpdating = false,
}: TimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = typeIcons[item.type];
  const typeColor = typeColors[item.type];

  const handleToggle = (checked: boolean | "indeterminate") => {
    // Handle both boolean and "indeterminate" string from checkbox
    const isChecked = checked === true;
    onToggleComplete(item.id, isChecked);
  };

  return (
    <div className="relative flex gap-4">
      {/* Timeline Line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border-2 bg-card",
            item.is_completed
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/30"
          )}
        >
          <Icon className={cn("h-5 w-5", item.is_completed ? "text-primary" : "text-muted-foreground")} />
        </div>
        {!isLast && (
          <div
            className={cn(
              "w-0.5 flex-1",
              item.is_completed ? "bg-primary/30" : "bg-muted-foreground/20"
            )}
          />
        )}
      </div>

      {/* Content Card */}
      <div className={cn(
        "flex-1 pb-8 transition-all duration-300",
        item.is_completed && "opacity-60 grayscale"
      )}>
        <Card
          className={cn(
            "transition-all duration-300 hover:shadow-md",
            item.is_completed 
              ? "border-primary/50 bg-muted/30" 
              : "border-border bg-card"
          )}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle
                    className={cn(
                      "font-heading text-lg transition-all duration-300",
                      item.is_completed 
                        ? "line-through text-muted-foreground decoration-2 decoration-primary/60" 
                        : "text-foreground"
                    )}
                  >
                    {item.title}
                  </CardTitle>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      typeColor,
                      item.is_completed && "opacity-60"
                    )}
                  >
                    {item.type}
                  </Badge>
                </div>
                <div className={cn(
                  "flex items-center gap-2 text-sm font-body transition-all duration-300",
                  item.is_completed 
                    ? "text-muted-foreground/70 line-through" 
                    : "text-muted-foreground"
                )}>
                  <span className="font-medium">{item.time}</span>
                  {item.location && (
                    <>
                      <span>•</span>
                      <span>{item.location}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <Checkbox
                  checked={item.is_completed}
                  onCheckedChange={(checked) => {
                    handleToggle(checked as boolean | "indeterminate");
                  }}
                  disabled={isUpdating}
                  className={cn(
                    "h-6 w-6 border-2 cursor-pointer transition-all duration-200",
                    item.is_completed
                      ? "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      : "border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  )}
                  aria-label={`Mark ${item.title} as ${item.is_completed ? "incomplete" : "complete"}`}
                />
              </div>
            </div>
          </CardHeader>
          {item.description && (
            <CardContent className="pt-0">
              <p
                className={cn(
                  "text-sm font-body transition-all duration-300",
                  item.is_completed 
                    ? "text-muted-foreground/70 line-through decoration-2 decoration-primary/40" 
                    : "text-muted-foreground"
                )}
              >
                {item.description}
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

