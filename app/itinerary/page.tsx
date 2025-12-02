"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { TimelineItem } from "@/components/features/itinerary/TimelineItem";
import { DaySelector } from "@/components/features/itinerary/DaySelector";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { ItineraryItem as HookItineraryItem } from "@/hooks/useItinerary";

// Tipo que coincide con el esquema de la base de datos
type ItineraryItemDB = {
  id: string;
  title: string;
  description: string | null;
  type: "flight" | "hotel" | "activity" | "food" | "transport";
  start_time: string;
  day: number;
  day_date: string;
  is_completed: boolean;
  location_data: Record<string, unknown> | null;
};

type Trip = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
  itinerary_items: ItineraryItemDB[];
};

export default function ItineraryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Consulta exacta según el esquema de la base de datos
  useEffect(() => {
    let isMounted = true;

    async function fetchTrip() {
      try {
        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (!session?.user?.id) {
          router.push("/login");
          return;
        }

        // REQUISITO: Query exacta con relación anidada
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select(`
            id, title, start_date, end_date, status,
            itinerary_items (
              id, title, description, type, 
              start_time, day, day_date, 
              is_completed, location_data
            )
          `)
          .eq('status', 'active')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!isMounted) return;

        if (tripError) {
          if (tripError.code === "PGRST116") {
            // No active trips found
            setTrip(null);
          } else {
            console.error("Error fetching trip:", tripError);
            toast({
              variant: "destructive",
              title: "Error",
              description: tripError.message || "Failed to load itinerary details.",
            });
            setTrip(null);
          }
        } else if (tripData) {
          setTrip(tripData as Trip);
        }
      } catch (error: unknown) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
          console.error("Exception fetching trip:", error);
          toast({
            variant: "destructive",
            title: "Unexpected Error",
            description: errorMessage,
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchTrip();

    return () => {
      isMounted = false;
    };
  }, [supabase, toast, router]);

  // Mapear items de DB a formato esperado por TimelineItem
  const mappedItems: HookItineraryItem[] = useMemo(() => {
    if (!trip?.itinerary_items) return [];

    return trip.itinerary_items.map((item) => ({
      id: item.id,
      trip_id: trip.id,
      day: item.day,
      time: item.start_time, // Mapear start_time a time
      title: item.title,
      description: item.description,
      type: item.type as "flight" | "hotel" | "activity" | "food",
      location: item.location_data 
        ? (typeof item.location_data === 'string' 
            ? item.location_data 
            : item.location_data.name || item.location_data.address || null)
        : null,
      is_completed: item.is_completed,
      created_at: item.day_date || new Date().toISOString(),
      updated_at: item.day_date || new Date().toISOString(),
    }));
  }, [trip]);

  // Extract unique days from items
  const days = useMemo(() => {
    const uniqueDays = Array.from(new Set(mappedItems.map((item) => item.day)))
      .filter((day) => day !== null && day !== undefined)
      .sort((a, b) => a - b);
    return uniqueDays;
  }, [mappedItems]);

  // Auto-select first available day
  useEffect(() => {
    if (days.length > 0 && selectedDay === null) {
      setSelectedDay(days[0]);
    }
  }, [days, selectedDay]);

  // Filter items by selected day
  const filteredItems = useMemo(() => {
    if (selectedDay === null) {
      return mappedItems;
    }
    return mappedItems.filter((item) => item.day === selectedDay);
  }, [mappedItems, selectedDay]);

  // Group items by day for display
  const itemsByDay = useMemo(() => {
    const grouped: Record<number, HookItineraryItem[]> = {};

    filteredItems.forEach((item) => {
      const day = item.day;
      if (day !== null && day !== undefined) {
        if (!grouped[day]) {
          grouped[day] = [];
        }
        grouped[day].push(item);
      }
    });

    const sortedDays = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b);
    
    const sortedGrouped: Record<number, HookItineraryItem[]> = {};
    sortedDays.forEach((day) => {
      sortedGrouped[day] = grouped[day].sort((a, b) => {
        // Sort by time within each day
        return a.time.localeCompare(b.time);
      });
    });
    
    return sortedGrouped;
  }, [filteredItems]);

  const handleToggleComplete = async (id: string, is_completed: boolean) => {
    setIsUpdating(true);
    
    // Optimistic update
    setTrip((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        itinerary_items: prev.itinerary_items.map((item) =>
          item.id === id ? { ...item, is_completed } : item
        ),
      };
    });

    try {
      const { error } = await supabase
        .from("itinerary_items")
        .update({ is_completed })
        .eq("id", id);
        
      if (error) {
        // Revert optimistic update
        setTrip((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            itinerary_items: prev.itinerary_items.map((item) =>
              item.id === id ? { ...item, is_completed: !is_completed } : item
            ),
          };
        });
        console.error("Error updating completion status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update status: " + error.message,
        });
      }
    } catch (err: unknown) {
      // Revert optimistic update
      setTrip((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          itinerary_items: prev.itinerary_items.map((item) =>
            item.id === id ? { ...item, is_completed: !is_completed } : item
          ),
        };
      });
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      console.error("Exception updating completion status:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32 w-full" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="font-heading text-4xl lg:text-5xl text-primary">
              {trip?.title || "Your Journey"}
            </h1>
            <p className="font-body text-muted-foreground">
              Track your travel itinerary day by day
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Separator />

        {/* Empty State: No Trips */}
        {!trip && !loading && (
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-heading text-2xl text-primary">
              No Active Trips
            </h3>
            <p className="font-body text-muted-foreground text-lg max-w-md mx-auto">
              You don&apos;t have any active trips at the moment.
            </p>
            <Button
              variant="default"
              onClick={() => router.push("/dashboard")}
              className="font-body mt-4 bg-primary text-primary-foreground"
            >
              Back to Dashboard
            </Button>
          </div>
        )}

        {/* Empty State: Trip exists but no items */}
        {trip && !loading && mappedItems.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <p className="font-body text-muted-foreground text-lg">
              Your itinerary has no activities yet.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="font-body"
            >
              Back to Dashboard
            </Button>
          </div>
        )}

        {/* Day Selector */}
        {days.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
              <Calendar className="h-4 w-4" />
              <span>Select a day to view activities</span>
            </div>
            <DaySelector
              days={days}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          </div>
        )}

        {/* Timeline */}
        {mappedItems.length > 0 && (
          <div className="space-y-8">
            {Object.entries(itemsByDay).map(([day, dayItems]) => (
              <div key={day} className="space-y-4">
                {selectedDay === null && (
                  <div className="flex items-center gap-3 pb-2">
                    <h2 className="font-heading text-2xl text-primary">Day {day}</h2>
                    <Separator className="flex-1" />
                  </div>
                )}
                <div className="space-y-4">
                  {dayItems.map((item, index) => (
                    <TimelineItem
                      key={item.id}
                      item={item}
                      isLast={index === dayItems.length - 1}
                      onToggleComplete={handleToggleComplete}
                      isUpdating={isUpdating}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State: Filtered items empty */}
        {!loading && mappedItems.length > 0 && filteredItems.length === 0 && selectedDay !== null && (
          <div className="text-center py-12 space-y-4">
            <p className="font-body text-muted-foreground text-lg">
              No activities found for Day {selectedDay}.
            </p>
            <Button
              variant="outline"
              onClick={() => setSelectedDay(null)}
              className="font-body"
            >
              View All Days
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
