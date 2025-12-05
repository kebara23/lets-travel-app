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
import { Badge } from "@/components/ui/badge";

// Tipo que coincide con el esquema de la base de datos
type ItineraryItemDB = {
  id: string;
  title: string;
  description: string | null;
  type: "flight" | "hotel" | "activity" | "food" | "transport";
  start_time: string | null;
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

type UnifiedItem = HookItineraryItem & {
  tripTitle: string;
  tripId: string;
  absoluteDay: number; // Día absoluto desde el primer viaje
};

export default function ItineraryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch all active trips
  useEffect(() => {
    let isMounted = true;

    async function fetchTrips() {
      try {
        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (!session?.user?.id) {
          router.push("/login");
          return;
        }

        // Fetch ALL active trips
        const { data: tripsData, error: tripsError } = await supabase
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
          .order('start_date', { ascending: true }); // Order by start date, earliest first

        if (!isMounted) return;

        if (tripsError) {
          console.error("Error fetching trips:", tripsError);
          toast({
            variant: "destructive",
            title: "Error",
            description: tripsError.message || "Failed to load itinerary details.",
          });
          setAllTrips([]);
        } else if (tripsData && tripsData.length > 0) {
          setAllTrips(tripsData as Trip[]);
        } else {
          setAllTrips([]);
        }
      } catch (error: unknown) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
          console.error("Exception fetching trips:", error);
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

    fetchTrips();

    return () => {
      isMounted = false;
    };
  }, [supabase, toast, router]);

  // Combine all trips into unified timeline
  const unifiedItems: UnifiedItem[] = useMemo(() => {
    if (allTrips.length === 0) return [];

    // Find the earliest start date across all trips
    const earliestStartDate = allTrips.reduce((earliest, trip) => {
      const tripStart = new Date(trip.start_date);
      return tripStart < earliest ? tripStart : earliest;
    }, new Date(allTrips[0].start_date));

    const unified: UnifiedItem[] = [];

    allTrips.forEach((trip) => {
      const tripStartDate = new Date(trip.start_date);
      
      // Calculate offset: how many days after the earliest trip does this trip start?
      const daysOffset = Math.floor(
        (tripStartDate.getTime() - earliestStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Process each item in this trip
      trip.itinerary_items.forEach((item) => {
        // Calculate absolute day: offset + relative day within trip
        const absoluteDay = daysOffset + item.day;

        unified.push({
          id: item.id,
          trip_id: trip.id,
          tripTitle: trip.title,
          tripId: trip.id,
          day: absoluteDay, // Use absolute day for unified view
          absoluteDay: absoluteDay,
          time: item.start_time || "TBD",
          title: item.title,
          description: item.description,
          type: item.type as "flight" | "hotel" | "activity" | "food",
          location: item.location_data 
            ? (typeof item.location_data === 'string' 
                ? item.location_data 
                : (item.location_data.name as string) || (item.location_data.address as string) || null)
            : null,
          is_completed: item.is_completed,
          created_at: item.day_date || new Date().toISOString(),
          updated_at: item.day_date || new Date().toISOString(),
        });
      });
    });

    // Sort by absolute day, then by time
    return unified.sort((a, b) => {
      if (a.absoluteDay !== b.absoluteDay) {
        return a.absoluteDay - b.absoluteDay;
      }
      const timeA = a.time || "";
      const timeB = b.time || "";
      return timeA.localeCompare(timeB);
    });
  }, [allTrips]);

  // Extract unique absolute days
  const days = useMemo(() => {
    const uniqueDays = Array.from(new Set(unifiedItems.map((item) => item.absoluteDay)))
      .filter((day) => day !== null && day !== undefined)
      .sort((a, b) => a - b);
    return uniqueDays;
  }, [unifiedItems]);

  // Auto-select first available day
  useEffect(() => {
    if (days.length > 0 && selectedDay === null) {
      setSelectedDay(days[0]);
    }
  }, [days, selectedDay]);

  // Filter items by selected day
  const filteredItems = useMemo(() => {
    if (selectedDay === null) {
      return unifiedItems;
    }
    return unifiedItems.filter((item) => item.absoluteDay === selectedDay);
  }, [unifiedItems, selectedDay]);

  // Group items by absolute day for display
  const itemsByDay = useMemo(() => {
    const grouped: Record<number, UnifiedItem[]> = {};

    filteredItems.forEach((item) => {
      const day = item.absoluteDay;
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
    
    const sortedGrouped: Record<number, UnifiedItem[]> = {};
    sortedDays.forEach((day) => {
      sortedGrouped[day] = grouped[day].sort((a, b) => {
        const timeA = a.time || "";
        const timeB = b.time || "";
        return timeA.localeCompare(timeB);
      });
    });
    
    return sortedGrouped;
  }, [filteredItems]);

  // Get trip titles for display (to show which trip each item belongs to)
  const tripTitles = useMemo(() => {
    return allTrips.map(t => ({ id: t.id, title: t.title }));
  }, [allTrips]);

  const handleToggleComplete = async (id: string, is_completed: boolean) => {
    setIsUpdating(true);
    
    // Find which trip this item belongs to
    const item = unifiedItems.find(i => i.id === id);
    if (!item) {
      setIsUpdating(false);
      return;
    }

    // Optimistic update
    setAllTrips((prevTrips) => {
      return prevTrips.map(t => {
        if (t.id === item.tripId) {
          return {
            ...t,
            itinerary_items: t.itinerary_items.map((it) =>
              it.id === id ? { ...it, is_completed } : it
            ),
          };
        }
        return t;
      });
    });

    try {
      const { error } = await supabase
        .from("itinerary_items")
        .update({ is_completed })
        .eq("id", id);
        
      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      // Revert optimistic update
      setAllTrips((prevTrips) => {
        return prevTrips.map(t => {
          if (t.id === item.tripId) {
            return {
              ...t,
              itinerary_items: t.itinerary_items.map((it) =>
                it.id === id ? { ...it, is_completed: !is_completed } : it
              ),
            };
          }
          return t;
        });
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

  // Determine main title (show all trip names if multiple)
  const mainTitle = allTrips.length === 0 
    ? "Your Journey"
    : allTrips.length === 1
    ? allTrips[0].title
    : `${allTrips.length} Active Trips`;

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="font-heading text-4xl lg:text-5xl text-primary">
              {mainTitle}
            </h1>
            {allTrips.length > 1 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {allTrips.map((trip) => (
                  <Badge key={trip.id} variant="outline" className="font-body">
                    {trip.title}
                  </Badge>
                ))}
              </div>
            )}
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
        {allTrips.length === 0 && !loading && (
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

        {/* Empty State: Trips exist but no items */}
        {allTrips.length > 0 && !loading && unifiedItems.length === 0 && (
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

        {/* Unified Timeline - Shows all trips combined */}
        {unifiedItems.length > 0 && (
          <div className="space-y-8">
            {Object.entries(itemsByDay).map(([day, dayItems]) => {
              // Group items by trip to show trip badges
              const itemsByTrip = dayItems.reduce((acc, item) => {
                if (!acc[item.tripId]) {
                  acc[item.tripId] = [];
                }
                acc[item.tripId].push(item);
                return acc;
              }, {} as Record<string, UnifiedItem[]>);

              const tripIds = Object.keys(itemsByTrip);
              const showTripBadges = allTrips.length > 1 && tripIds.length > 1;

              return (
                <div key={day} className="space-y-4">
                  {selectedDay === null && (
                    <div className="flex items-center gap-3 pb-2">
                      <h2 className="font-heading text-2xl text-primary">Day {day}</h2>
                      {showTripBadges && (
                        <div className="flex gap-2">
                          {tripIds.map(tripId => {
                            const trip = allTrips.find(t => t.id === tripId);
                            return trip ? (
                              <Badge key={tripId} variant="secondary" className="text-xs font-body">
                                {trip.title}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )}
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
              );
            })}
          </div>
        )}

        {/* Empty State: Filtered items empty */}
        {!loading && unifiedItems.length > 0 && filteredItems.length === 0 && selectedDay !== null && (
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
