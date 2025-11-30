"use client";

import { useState, useEffect } from "react";
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
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Trip = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: "active" | "draft" | "completed";
  user_id: string;
  users: {
    full_name: string;
    email: string;
  } | null;
};

export default function TripsManagerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-700 border-green-200",
      draft: "bg-slate-100 text-slate-700 border-slate-200",
      completed: "bg-blue-100 text-blue-700 border-blue-200",
    };

    return (
      <Badge variant="outline" className={cn("font-body", variants[status as keyof typeof variants])}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
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

      {/* Trips Table */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="font-body">All Trips</CardTitle>
          <CardDescription className="font-body">
            {trips.length} trip{trips.length !== 1 ? "s" : ""} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 font-body">No trips found. Create your first trip!</p>
              <Button
                onClick={() => router.push("/admin/trips/new")}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Trip
              </Button>
            </div>
          ) : (
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
                {trips.map((trip) => (
                  <TableRow key={trip.id} className="border-slate-200">
                    <TableCell className="font-medium font-body">{trip.title}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-body text-slate-900">
                          {trip.users?.full_name || "Unknown Client"}
                        </p>
                        <p className="text-xs text-slate-500 font-body">
                          {trip.users?.email || "No email"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600 font-body">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(trip.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/trips/${trip.id}`)}
                          className="h-8 w-auto px-2 font-body text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          View/Edit Itinerary
                        </Button>
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

