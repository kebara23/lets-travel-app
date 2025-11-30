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

type ItineraryItem = {
  id: string;
  trip_id: string;
  day: number;
  day_date: string;
  start_time: string; // REQUISITO 1: usar start_time
  title: string;
  description: string | null;
  type: "flight" | "hotel" | "activity" | "food" | "transport";
  is_completed: boolean;
};

export default function ItineraryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [tripId, setTripId] = useState<string | null>(null);
  const [tripIdLoading, setTripIdLoading] = useState(true);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // REQUISITO 2: Obtener usuario y viaje ACTIVO
  useEffect(() => {
    let isMounted = true;

    async function fetchActiveTripId() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (!session?.user?.id) {
          router.push("/login");
          return;
        }

        const { data: trip, error: tripError } = await supabase
          .from("trips")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("status", "active") // REQUISITO 2: status = 'active'
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!isMounted) return;

        if (tripError) {
          if (tripError.code === "PGRST116") {
            console.log("No active trips found for user");
            setTripId(null);
          } else {
            console.error("Error fetching trip ID:", tripError);
            toast({
              variant: "destructive",
              title: "Error",
              description: tripError.message || "Failed to load your trip information.",
            });
            setTripId(null);
          }
        } else if (trip?.id) {
          setTripId(trip.id);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Exception fetching trip ID:", error);
        }
      } finally {
        if (isMounted) {
          setTripIdLoading(false);
        }
      }
    }

    fetchActiveTripId();

    return () => {
      isMounted = false;
    };
  }, [supabase, toast, router]);

  // REQUISITO 1: Consulta Exacta
  useEffect(() => {
    let isMounted = true;

    async function fetchItems() {
      if (!tripId) return;

      setItemsLoading(true);
      try {
        const { data: itemsData, error: itemsError } = await supabase
          .from("itinerary_items")
          // REQUISITO 1: Select explícito, sin 'location' ni 'time', usando 'start_time'
          .select("id, title, description, type, start_time, day, is_completed, day_date")
          .eq("trip_id", tripId)
          .order("day", { ascending: true })
          .order("start_time", { ascending: true }); // Usar start_time para ordenar

        if (!isMounted) return;

        if (itemsError) {
          // REQUISITO 3: Manejo de Errores Visible
          console.error("Supabase Error:", itemsError);
          toast({
            variant: "destructive",
            title: "Error fetching items",
            description: itemsError.message || "Failed to load itinerary details.",
          });
        } else {
          setItems(itemsData || []);
        }
      } catch (error: any) {
        if (isMounted) {
          console.error("Exception fetching items:", error);
          toast({
            variant: "destructive",
            title: "Unexpected Error",
            description: error.message || "An unexpected error occurred.",
          });
        }
      } finally {
        if (isMounted) {
          setItemsLoading(false);
        }
      }
    }

    if (!tripIdLoading && tripId) {
      fetchItems();
    } else if (!tripIdLoading && !tripId) {
      setItemsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [tripId, tripIdLoading, supabase, toast]);


  // Extract unique days from items
  const days = useMemo(() => {
    const uniqueDays = Array.from(new Set(items.map((item) => item.day)))
      .filter((day) => day !== null && day !== undefined)
      .sort((a, b) => a - b);
    return uniqueDays;
  }, [items]);

  // Auto-select first available day
  useEffect(() => {
    if (days.length > 0 && selectedDay === null) {
      setSelectedDay(days[0]);
    }
  }, [days, selectedDay]);

  // Filter items by selected day
  const filteredItems = useMemo(() => {
    if (selectedDay === null) {
      return items;
    }
    return items.filter((item) => item.day === selectedDay);
  }, [items, selectedDay]);

  // Group items by day for display
  const itemsByDay = useMemo(() => {
    const grouped: Record<number, ItineraryItem[]> = {};
    
    // REQUISITO 4: Renderizado - Muestra hora usando start_time
    // Mapeo seguro para el renderizado
    const safeItems = filteredItems.map(item => ({
      ...item,
      // Adaptar TimelineItem si espera 'time', o usar start_time directamente
      // Aquí asumimos que TimelineItem puede necesitar 'time' prop o lo pasamos como start_time
      // Si TimelineItem espera 'time', lo mapeamos:
      time: item.start_time || "--:--", 
      title: item.title || "(Untitled)",
      type: (item.type || "activity") as ItineraryItem["type"]
    }));

    safeItems.forEach((item) => {
      const day = item.day;
      if (day !== null && day !== undefined) {
        if (!grouped[day]) {
          grouped[day] = [];
        }
        grouped[day].push(item as any); // Type assertion para compatibilidad con TimelineItem si es estricto
      }
    });

    const sortedDays = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b);
    
    const sortedGrouped: Record<number, ItineraryItem[]> = {};
    sortedDays.forEach((day) => {
      sortedGrouped[day] = grouped[day];
    });
    
    return sortedGrouped;
  }, [filteredItems]);

  const handleToggleComplete = async (id: string, is_completed: boolean) => {
    setIsUpdating(true);
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, is_completed } : item
    ));

    try {
      const { error } = await supabase
        .from("itinerary_items")
        .update({ is_completed })
        .eq("id", id);
        
      if (error) {
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, is_completed: !is_completed } : item
        ));
        console.error("Error updating completion status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update status: " + error.message,
        });
      }
    } catch (err: any) {
       setItems(prev => prev.map(item => 
        item.id === id ? { ...item, is_completed: !is_completed } : item
      ));
      console.error("Exception updating completion status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (tripIdLoading || (tripId && itemsLoading)) {
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
              Your Journey
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
        {!tripId && !tripIdLoading && (
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
        {tripId && !itemsLoading && items.length === 0 && (
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
        {items.length > 0 && (
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
                        item={item} // TimelineItem should accept the mapped item structure
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
        {!itemsLoading && items.length > 0 && filteredItems.length === 0 && selectedDay !== null && (
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
