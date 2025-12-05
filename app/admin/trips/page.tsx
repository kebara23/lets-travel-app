"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Calendar, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Special UUID to represent "OPEN" trips (templates)
const OPEN_CLIENT_ID = "00000000-0000-0000-0000-000000000000";

type Trip = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: "active" | "draft" | "completed";
  user_id: string;
  created_at?: string;
  users: {
    full_name: string;
    email: string;
  } | null;
};

// Derived status based on dates
type DerivedStatus = "active" | "starting_soon" | "upcoming" | "completed";

// Calculate derived status from dates
function calculateDerivedStatus(startDate: string, endDate: string): DerivedStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  // Active: startDate <= today <= endDate
  if (start <= today && today <= end) {
    return "active";
  }
  
  // Starting Soon: today == (startDate - 1 day) - the day before the trip starts
  const dayBeforeStart = new Date(start);
  dayBeforeStart.setDate(dayBeforeStart.getDate() - 1);
  dayBeforeStart.setHours(0, 0, 0, 0);
  
  if (today.getTime() === dayBeforeStart.getTime()) {
    return "starting_soon";
  }
  
  // Completed: today > endDate
  if (today > end) {
    return "completed";
  }
  
  // Upcoming: today < (startDate - 1 day)
  return "upcoming";
}

// Get status priority for sorting (lower number = higher priority)
function getStatusPriority(status: DerivedStatus): number {
  switch (status) {
    case "active":
      return 1;
    case "starting_soon":
      return 2;
    case "upcoming":
      return 3;
    case "completed":
      return 4;
    default:
      return 5;
  }
}

// Sort trips by status priority
function sortTripsByStatus(trips: Trip[]): Trip[] {
  return [...trips].sort((a, b) => {
    const statusA = calculateDerivedStatus(a.start_date, a.end_date);
    const statusB = calculateDerivedStatus(b.start_date, b.end_date);
    const priorityA = getStatusPriority(statusA);
    const priorityB = getStatusPriority(statusB);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If same priority, sort by start date (most recent first)
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
  });
}

export default function TripsManagerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"trips" | "defaults">("trips");
  const supabase = createClient();

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select(`
          id,
          title,
          start_date,
          end_date,
          status,
          user_id,
          created_at,
          users:user_id (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to handle Supabase's relation format
      const transformedTrips = (data || []).map((trip: any) => ({
        ...trip,
        users: Array.isArray(trip.users) ? trip.users[0] || null : trip.users,
      }));

      setTrips(transformedTrips as Trip[]);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load trips. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Separate trips into regular trips and OPEN (templates)
  const { regularTrips, openTrips } = useMemo(() => {
    const regular: Trip[] = [];
    const open: Trip[] = [];
    
    trips.forEach((trip) => {
      if (trip.user_id === OPEN_CLIENT_ID || trip.user_id === null) {
        open.push(trip);
      } else {
        regular.push(trip);
      }
    });
    
    return {
      regularTrips: sortTripsByStatus(regular),
      openTrips: open.sort((a, b) => 
        new Date(b.created_at || b.start_date).getTime() - new Date(a.created_at || a.start_date).getTime()
      ),
    };
  }, [trips]);

  // Handle duplicate trip
  async function handleDuplicate(trip: Trip) {
    try {
      // Fetch full trip data including itinerary items
      const { data: tripData, error: tripError } = await supabase
        .from("trips")
        .select("*")
        .eq("id", trip.id)
        .single();

      if (tripError) {
        console.error("Error fetching trip data:", tripError);
        throw tripError;
      }

      if (!tripData) {
        throw new Error("Trip data not found");
      }

      // Fetch itinerary items
      const { data: itemsData, error: itemsError } = await supabase
        .from("itinerary_items")
        .select("*")
        .eq("trip_id", trip.id);

      if (itemsError) throw itemsError;

      // Create new trip - use OPEN as default if original was OPEN, otherwise keep same client
      // User can change it in the editor
      const newUserId = tripData.user_id === OPEN_CLIENT_ID 
        ? OPEN_CLIENT_ID 
        : tripData.user_id; // Keep original client, user can change in editor

      const { data: newTrip, error: insertError } = await supabase
        .from("trips")
        .insert({
          title: `${tripData.title} (Copy)`,
          user_id: newUserId, // Keep original client or OPEN, user can change in editor
          start_date: tripData.start_date, // Keep dates but user can change
          end_date: tripData.end_date,
          status: "draft",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Duplicate itinerary items if they exist
      if (itemsData && itemsData.length > 0) {
        const newItems = itemsData.map((item: any) => ({
          trip_id: newTrip.id,
          day: item.day,
          day_date: item.day_date,
          start_time: item.start_time,
          title: item.title,
          description: item.description,
          type: item.type,
          location_data: item.location_data,
          is_completed: false, // Reset completion status
        }));

        const { error: itemsInsertError } = await supabase
          .from("itinerary_items")
          .insert(newItems);

        if (itemsInsertError) throw itemsInsertError;
      }

      toast({
        title: "Trip Duplicated",
        description: newUserId === OPEN_CLIENT_ID
          ? "Template duplicated. You can edit and assign a client if needed."
          : "Trip duplicated. You can edit the client and dates as needed.",
      });

      // Navigate to edit the new trip
      router.push(`/admin/trips/${newTrip.id}`);
    } catch (error: any) {
      console.error("Error duplicating trip:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to duplicate trip. Please try again.",
      });
    }
  }

  async function handleDelete(tripId: string) {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    try {
      const { error } = await supabase.from("trips").delete().eq("id", tripId);

      if (error) throw error;

      toast({
        title: "Trip deleted",
        description: "The trip has been successfully deleted.",
      });

      fetchTrips();
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete trip. Please try again.",
      });
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDerivedStatusBadge = (trip: Trip) => {
    const derivedStatus = calculateDerivedStatus(trip.start_date, trip.end_date);
    
    const variants = {
      active: "bg-green-100 text-green-700 border-green-200",
      starting_soon: "bg-yellow-100 text-yellow-700 border-yellow-200",
      upcoming: "bg-blue-100 text-blue-700 border-blue-200",
      completed: "bg-slate-100 text-slate-500 border-slate-200",
    };

    const labels = {
      active: "Active",
      starting_soon: "Starting Soon",
      upcoming: "Upcoming",
      completed: "Completed",
    };

    return (
      <Badge variant="outline" className={cn("font-body", variants[derivedStatus])}>
        {labels[derivedStatus]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const renderTripsTable = (tripsToRender: Trip[], isCompleted: boolean = false) => {
    if (tripsToRender.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-slate-600 font-body">
            {activeTab === "defaults" 
              ? "No templates found. Create your first template!" 
              : "No trips found. Create your first trip!"}
          </p>
          <Button
            onClick={() => router.push("/admin/trips/new")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Trip
          </Button>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200">
            <TableHead className="font-body">Trip Title</TableHead>
            <TableHead className="font-body">Client</TableHead>
            <TableHead className="font-body">Dates</TableHead>
            <TableHead className="font-body">Status</TableHead>
            <TableHead className="font-body text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tripsToRender.map((trip) => {
            const derivedStatus = calculateDerivedStatus(trip.start_date, trip.end_date);
            const isCompletedTrip = derivedStatus === "completed";
            
            return (
              <TableRow 
                key={trip.id} 
                className={cn(
                  "border-slate-200",
                  isCompletedTrip && "opacity-60"
                )}
              >
                <TableCell className={cn("font-medium font-body", isCompletedTrip && "text-slate-500")}>
                  {trip.title}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className={cn("font-body", isCompletedTrip ? "text-slate-500" : "text-slate-900")}>
                      {trip.user_id === OPEN_CLIENT_ID || trip.user_id === null
                        ? "OPEN (Template)"
                        : trip.users?.full_name || "Unknown Client"}
                    </p>
                    {trip.user_id !== OPEN_CLIENT_ID && trip.user_id !== null && (
                      <p className="text-xs text-slate-500 font-body">
                        {trip.users?.email || "No email"}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={cn("flex items-center gap-2 font-body", isCompletedTrip && "text-slate-500")}>
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getDerivedStatusBadge(trip)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/trips/${trip.id}`)}
                      className="h-8 w-auto px-2 font-body text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      View/Edit
                    </Button>
                    {activeTab === "trips" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(trip)}
                        className="h-8 w-auto px-2 font-body text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        title="Duplicate trip"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicate
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(trip.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-body">Trips Manager</h1>
          <p className="text-slate-600 mt-1 font-body">Manage all client trips and itineraries</p>
        </div>
        <Button
          onClick={() => router.push("/admin/trips/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Trip
        </Button>
      </div>

      {/* Tabs for Trips and Defaults */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "trips" | "defaults")} className="w-full">
        <TabsList className="font-body">
          <TabsTrigger value="trips">
            Trips ({regularTrips.length})
          </TabsTrigger>
          <TabsTrigger value="defaults">
            Defaults ({openTrips.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="mt-6">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="font-body">All Trips</CardTitle>
              <CardDescription className="font-body">
                {regularTrips.length} trip{regularTrips.length !== 1 ? "s" : ""} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                renderTripsTable(regularTrips)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defaults" className="mt-6">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="font-body">Trip Templates (Defaults)</CardTitle>
              <CardDescription className="font-body">
                {openTrips.length} template{openTrips.length !== 1 ? "s" : ""} total. These are reusable trip templates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                renderTripsTable(openTrips)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

