"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { TimelineItem } from "@/components/features/itinerary/TimelineItem";
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

export default function ItineraryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch all active/completed trips
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
          // Allow both active and completed trips to appear in history
          .in('status', ['active', 'completed']) 
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
  }, [supabase]); // Removed toast and router from dependencies to prevent unnecessary re-renders

  const handleToggleComplete = async (id: string, is_completed: boolean) => {
    setIsUpdating(true);
    
    // Find which trip this item belongs to
    let targetTripId = "";
    allTrips.forEach(t => {
        if (t.itinerary_items.some(i => i.id === id)) {
            targetTripId = t.id;
        }
    });

    if (!targetTripId) {
        setIsUpdating(false);
        return;
    }

    // Optimistic update
    setAllTrips((prevTrips) => {
      return prevTrips.map(t => {
        if (t.id === targetTripId) {
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
          if (t.id === targetTripId) {
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

  // Helper to group items by day for a specific trip
  const getItemsByDay = (trip: Trip) => {
    const mappedItems: HookItineraryItem[] = trip.itinerary_items.map((item) => ({
      id: item.id,
      trip_id: trip.id,
      day: item.day,
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
    }));

    const grouped: Record<number, HookItineraryItem[]> = {};
    mappedItems.forEach((item) => {
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
      
    // Sort items within each day by time
    sortedDays.forEach(day => {
        grouped[day].sort((a, b) => {
            const timeA = a.time || "";
            const timeB = b.time || "";
            return timeA.localeCompare(timeB);
        });
    });

    return { sortedDays, groupedItems: grouped };
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

  // Determine main title logic
  const mainTitle = allTrips.length === 0 
    ? "Your Journey"
    : allTrips.length === 1
    ? allTrips[0].title
    : "Your Journey";

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 pb-24 lg:pb-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="font-heading text-4xl lg:text-5xl text-primary">
              {mainTitle}
            </h1>
            {allTrips.length > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-body">
                  {allTrips.length} Leg{allTrips.length !== 1 ? 's' : ''} in total
                </span>
              </div>
            )}
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

        {/* Sequential Trip Rendering */}
        <div className="space-y-12">
          {allTrips.map((trip, tripIndex) => {
            const { sortedDays, groupedItems } = getItemsByDay(trip);
            const isFirstTrip = tripIndex === 0;
            
            return (
              <div key={trip.id} className="space-y-6">
                {/* Trip Divider / Header */}
                {!isFirstTrip && (
                  <div className="relative py-8">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-primary/20 border-dashed" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-4 text-sm text-muted-foreground flex items-center gap-2 border border-border rounded-full py-1 shadow-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        Next Leg: <span className="font-medium text-foreground">{trip.title}</span>
                        <span className="text-xs mx-1">•</span>
                        Starting {new Date(trip.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Trip Title (First trip only, or simplified) */}
                <div className="space-y-2">
                   {isFirstTrip && (
                     <div className="flex items-center justify-between">
                        <h2 className="font-heading text-2xl text-primary">{trip.title}</h2>
                        <Badge variant="secondary" className="font-body">
                          {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                        </Badge>
                     </div>
                   )}
                </div>

                {/* Days */}
                {sortedDays.length > 0 ? (
                  <div className="space-y-8 pl-2 lg:pl-4 border-l-2 border-slate-100 ml-2">
                    {sortedDays.map((day) => (
                      <div key={day} className="space-y-4 relative">
                        {/* Day Marker */}
                        <div className="absolute -left-[25px] lg:-left-[33px] top-0 flex flex-col items-center">
                            <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-sm ring-4 ring-background">
                                {day}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pb-2">
                          <h3 className="font-heading text-xl text-primary ml-2">Day {day}</h3>
                        </div>
                        
                        <div className="space-y-4">
                          {groupedItems[day].map((item, index) => (
                            <TimelineItem
                              key={item.id}
                              item={item}
                              isLast={index === groupedItems[day].length - 1}
                              onToggleComplete={handleToggleComplete}
                              isUpdating={isUpdating}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic pl-4">No activities scheduled for this leg yet.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
