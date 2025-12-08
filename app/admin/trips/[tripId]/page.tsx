"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Calendar, Clock, MapPin, Loader2, Trash2, Edit, FileText, Image, Upload, Download, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Trip = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
  user_id: string;
  users?: {
    full_name: string;
    email: string;
    preferences: string[] | null;
  };
};

type ItineraryItem = {
  id: string;
  trip_id: string;
  day: number;
  day_date: string;
  start_time: string;
  title: string;
  description: string | null;
  type: "flight" | "hotel" | "activity" | "food" | "transport";
  location_data: any;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

// UUID validation function
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export default function TripEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const tripId = params.tripId as string;

  // Validate UUID before proceeding
  useEffect(() => {
    if (!tripId || !isValidUUID(tripId)) {
      toast({
        variant: "destructive",
        title: "Invalid Trip ID",
        description: "The trip ID format is invalid. Redirecting to trips list.",
      });
      router.push("/admin/trips");
      return;
    }
  }, [tripId, router, toast]);

  // Trip data
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripLoading, setTripLoading] = useState(true);

  // Itinerary items
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  // Simple Form State (Controlled Inputs)
  const [formData, setFormData] = useState({
    dayDate: "",
    startTime: "",
    title: "",
    type: "activity" as "flight" | "hotel" | "activity" | "food" | "transport",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Edit Form state
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Documents state
  type Document = {
    id: string;
    trip_id: string;
    name: string;
    file_path: string;
    created_at: string;
  };
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Fetch trip data
  useEffect(() => {
    if (!tripId || !isValidUUID(tripId)) return;
    fetchTrip();
  }, [tripId]);

  // Fetch itinerary items
  useEffect(() => {
    if (!tripId || !isValidUUID(tripId)) return;
    fetchItems();
  }, [tripId]);

  // Realtime subscription for itinerary items updates
  useEffect(() => {
    if (!tripId || !isValidUUID(tripId)) return;

    console.log("🔔 Setting up Realtime subscription for trip:", tripId);

    const channel = supabase
      .channel(`itinerary_updates_${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "itinerary_items",
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          console.log("🔔 Itinerary item updated (Realtime):", payload);
          
          const updatedItem = payload.new as ItineraryItem;
          
          // Update local state: find and replace the item
          setItems((prev) => {
            const index = prev.findIndex((item) => item.id === updatedItem.id);
            if (index !== -1) {
              // Replace the item with the updated one
              const updated = [...prev];
              updated[index] = updatedItem;
              console.log("🔔 Item updated in state:", updatedItem.id);
              return updated;
            } else {
              // If item not found, it might be a new item (shouldn't happen with UPDATE, but just in case)
              console.log("🔔 Item not found in state, adding:", updatedItem.id);
              return [...prev, updatedItem];
            }
          });
        }
      )
      .subscribe((status) => {
        console.log("🔔 Itinerary subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("🔔 ✅ Successfully subscribed to itinerary updates");
        } else if (status === "CHANNEL_ERROR") {
          console.error("🔔 ❌ Error in itinerary subscription channel");
        }
      });

    return () => {
      console.log("🔔 Cleaning up itinerary subscription");
      supabase.removeChannel(channel);
    };
  }, [supabase, tripId]);

  // Fetch documents
  useEffect(() => {
    if (!tripId || !isValidUUID(tripId)) return;
    fetchDocuments();
  }, [tripId]);

  async function fetchTrip() {
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
            email,
            preferences
          )
        `)
        .eq("id", tripId)
        .single();

      if (error) throw error;

      const tripData = {
        ...data,
        users: Array.isArray(data.users) ? data.users[0] : data.users,
      };

      setTrip(tripData as Trip);
    } catch (error: any) {
      console.error("Error fetching trip:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load trip information.",
      });
      router.push("/admin/trips");
    } finally {
      setTripLoading(false);
    }
  }

  async function fetchItems() {
    try {
      const { data, error } = await supabase
        .from("itinerary_items")
        .select("*")
        .eq("trip_id", tripId)
        .order("day", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;

      setItems(data || []);
    } catch (error: any) {
      console.error("Error fetching items:", error);
      toast({
        variant: "destructive",
        title: "Error fetching items",
        description: error.message || "Failed to load itinerary items.",
      });
    } finally {
      setItemsLoading(false);
    }
  }

  async function fetchDocuments() {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast({
        variant: "destructive",
        title: "Error fetching documents",
        description: error.message || "Failed to load documents.",
      });
    } finally {
      setDocumentsLoading(false);
    }
  }

  // Calculate day number from date
  function calculateDayNumber(dateString: string): number {
    if (!trip || !dateString) return 1;

    const tripStart = new Date(trip.start_date);
    const selectedDate = new Date(dateString);

    // Reset time to compare only dates
    tripStart.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    const diffTime = selectedDate.getTime() - tripStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1;
  }

  // Toggle Trip Status
  async function toggleStatus() {
    if (!trip) return;
    setStatusUpdating(true);
    const newStatus = trip.status === "active" ? "draft" : "active";

    try {
      const { error } = await supabase
        .from("trips")
        .update({ status: newStatus })
        .eq("id", tripId);

      if (error) throw error;

      // Update local state immediately
      setTrip((prev) => prev ? { ...prev, status: newStatus } : null);

      toast({
        title: `Trip is now ${newStatus === "active" ? "Active" : "Draft"}`,
        description: newStatus === "active" 
          ? "The trip is visible to the client." 
          : "The trip is hidden from the client.",
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update trip status.",
      });
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.dayDate || !formData.startTime || !formData.title) {
        throw new Error("Please fill in all required fields (Date, Time, Title).");
      }

      // Payload Exacto Solicitado
      const newItem = {
        trip_id: tripId,
        title: formData.title.trim(),
        day_date: formData.dayDate, // string YYYY-MM-DD
        day: calculateDayNumber(formData.dayDate), // integer
        start_time: formData.startTime, // string "HH:mm"
        type: formData.type,
        description: formData.description?.trim() || null,
        location_data: {} // objeto vacío para cumplir esquema
      };

      console.log("PAYLOAD ENVIADO:", newItem);

      const { data: insertedData, error } = await supabase
        .from("itinerary_items")
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;

      console.log("Item created successfully:", insertedData);

      // Optimistic Update
      if (insertedData) {
        setItems((prev) => [...prev, insertedData]);
      } else {
        await fetchItems();
      }

      // Reset form
      setFormData({
        dayDate: "",
        startTime: "",
        title: "",
        type: "activity",
        description: "",
      });

      // Close form after successful submission
      setIsAddFormOpen(false);

      toast({
        title: "Activity added!",
        description: "The activity has been added to the itinerary.",
      });
    } catch (error: any) {
      console.error("LETS 2.0 - Create itinerary item error:", error);
      toast({
        variant: "destructive",
        title: "Error creating item",
        description: error.message || "Error creating itinerary item",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!confirm("Are you sure you want to delete this activity?")) return;

    try {
      const { error } = await supabase
        .from("itinerary_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Activity deleted",
        description: "The activity has been removed from the itinerary.",
      });

      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete activity.",
      });
    }
  }

  // Edit Logic
  function handleEditClick(item: ItineraryItem) {
    setEditingItem(item);
    setIsEditOpen(true);
  }

  async function handleUpdateItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingItem || !trip) return;

    const form = new FormData(e.currentTarget);
    const newDate = form.get("date") as string;
    const newTime = form.get("time") as string;
    
    // Calculate new day number if date changed
    let newDay = editingItem.day;
    if (newDate && newDate !== editingItem.day_date) {
      newDay = calculateDayNumber(newDate);
    }

    const updates = {
      start_time: newTime,
      day_date: newDate || editingItem.day_date,
      day: newDay,
      title: (form.get("title") as string).trim(),
      type: form.get("type") as "flight" | "hotel" | "activity" | "food" | "transport",
      description: (form.get("description") as string).trim() || null,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from("itinerary_items")
        .update(updates)
        .eq("id", editingItem.id);

      if (error) throw error;

      // Optimistic update
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...updates } : item
        )
      );

      toast({
        title: "Activity updated",
        description: "The activity has been successfully updated.",
      });

      setIsEditOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      console.error("Error updating item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update activity.",
      });
    }
  }

  // Group items by day
  const itemsByDay = useMemo(() => {
    const grouped: Record<number, ItineraryItem[]> = {};
    items.forEach((item) => {
      if (!grouped[item.day]) {
        grouped[item.day] = [];
      }
      grouped[item.day].push(item);
    });
    return grouped;
  }, [items]);

  // Get date for a specific day number
  function getDateForDay(dayNumber: number): string {
    if (!trip) return "";
    const tripStart = new Date(trip.start_date);
    tripStart.setDate(tripStart.getDate() + (dayNumber - 1));
    return tripStart.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const typeColors = {
    flight: "bg-blue-100 text-blue-700 border-blue-200",
    hotel: "bg-purple-100 text-purple-700 border-purple-200",
    activity: "bg-green-100 text-green-700 border-green-200",
    food: "bg-orange-100 text-orange-700 border-orange-200",
    transport: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  // Document upload handler
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF or image file.",
      });
      return;
    }

    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${tripId}/${fileName}`;

    try {
      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("trip-docs")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from("trip-docs")
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // 3. Insert record in documents table
      const { data: docData, error: insertError } = await supabase
        .from("documents")
        .insert({
          trip_id: tripId,
          name: file.name,
          file_path: filePath,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      setDocuments((prev) => [docData, ...prev]);

      toast({
        title: "Document uploaded!",
        description: "The document has been successfully uploaded.",
      });

      // Reset input
      e.target.value = "";
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast({
        variant: "destructive",
        title: "Error uploading document",
        description: error.message || "Failed to upload document.",
      });
    } finally {
      setUploading(false);
    }
  }

  // Document delete handler
  async function handleDeleteDocument(docId: string, filePath: string) {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      // 1. Delete from storage
      const { error: storageError } = await supabase.storage
        .from("trip-docs")
        .remove([filePath]);

      if (storageError) throw storageError;

      // 2. Delete from database
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", docId);

      if (dbError) throw dbError;

      // Update local state
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));

      toast({
        title: "Document deleted",
        description: "The document has been removed.",
      });
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete document.",
      });
    }
  }

  // Get file icon based on extension
  function getFileIcon(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return FileText;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return Image;
    return FileText;
  }

  // Get public URL for document
  function getDocumentUrl(filePath: string) {
    const { data } = supabase.storage
      .from("trip-docs")
      .getPublicUrl(filePath);
    return data?.publicUrl || "";
  }

  if (tripLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push("/admin/trips")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Trips
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600 font-body">Trip not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 font-body">{trip.title}</h1>
            <Badge 
              variant={trip.status === 'active' ? 'default' : 'secondary'} 
              className={`font-body ${trip.status === 'active' ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-200 text-slate-700'}`}
            >
              {trip.status === 'active' ? 'Active' : 'Draft'}
            </Badge>
          </div>
          <p className="text-slate-600 mt-1 font-body">
            {trip.users?.full_name || "Unknown Client"} • {trip.users?.email || "No email"}
          </p>
          
          {/* Client Context: Preferences/Tags */}
          {trip.users?.preferences && Array.isArray(trip.users.preferences) && trip.users.preferences.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500 font-body">Client Context:</span>
              {trip.users.preferences.map((pref) => {
                const prefLower = pref.toLowerCase();
                const isCritical = prefLower.includes("allergy") || 
                                  prefLower.includes("allergic") || 
                                  prefLower.includes("medical") || 
                                  prefLower.includes("emergency");
                const isVIP = prefLower.includes("vip");
                const isVegan = prefLower.includes("vegan");
                
                let badgeClass = "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100";
                if (isCritical) {
                  badgeClass = "bg-red-100 text-red-800 border-red-300 hover:bg-red-100";
                } else if (isVIP) {
                  badgeClass = "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100";
                } else if (isVegan) {
                  badgeClass = "bg-green-100 text-green-800 border-green-300 hover:bg-green-100";
                }
                
                return (
                  <Badge
                    key={pref}
                    variant="outline"
                    className={cn("font-body text-xs", badgeClass)}
                  >
                    {pref}
                  </Badge>
                );
              })}
            </div>
          )}
          
          <p className="text-sm text-slate-500 mt-1 font-body">
            {new Date(trip.start_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(trip.end_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={toggleStatus} 
            disabled={statusUpdating}
            className={`font-body ${trip.status === 'draft' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
          >
            {statusUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              trip.status === 'draft' ? (
                <>
                  <span className="mr-2">🚀</span> Publish Trip
                </>
              ) : (
                <>
                  <span className="mr-2">⏸️</span> Pause / Draft
                </>
              )
            )}
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/trips")} className="font-body">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trips
          </Button>
        </div>
      </div>

      <Separator />

      {/* Add New Item Form - Collapsable */}
      {!isAddFormOpen ? (
        // Collapsed State: Compact Button
        <Card 
          className="bg-white border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
          onClick={() => setIsAddFormOpen(true)}
        >
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-2 text-slate-700 font-body">
              <Plus className="h-5 w-5" />
              <span className="font-medium">Add New Activity</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Expanded State: Full Form
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="font-body">Add Activity</CardTitle>
            <CardDescription className="font-body">
              Add a new activity to the itinerary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dayDate" className="font-body">
                    Day Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dayDate"
                    type="date"
                    value={formData.dayDate}
                    onChange={(e) => setFormData({ ...formData, dayDate: e.target.value })}
                    min={trip.start_date}
                    max={trip.end_date}
                    disabled={isSubmitting}
                    className="font-body"
                    required
                  />
                  {formData.dayDate && (
                    <p className="text-xs text-slate-500 font-body">
                      Day {calculateDayNumber(formData.dayDate)} of the trip
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime" className="font-body">
                    Start Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    disabled={isSubmitting}
                    className="font-body"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="font-body">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Clase de Surf"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={isSubmitting}
                  className="font-body"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="font-body">
                  Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-body"
                  required
                >
                  <option value="flight">Flight</option>
                  <option value="hotel">Hotel</option>
                  <option value="activity">Activity</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-body">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the activity..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isSubmitting}
                  className="font-body"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-body"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Activity
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsAddFormOpen(false);
                    // Reset form when canceling
                    setFormData({
                      dayDate: "",
                      startTime: "",
                      title: "",
                      type: "activity",
                      description: "",
                    });
                  }}
                  disabled={isSubmitting}
                  className="font-body"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Existing Items by Day */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 font-body">Itinerary</h2>
          <Badge variant="outline" className="font-body">
            {items.length} {items.length === 1 ? "activity" : "activities"}
          </Badge>
        </div>

        {itemsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : Object.keys(itemsByDay).length === 0 ? (
          <Card className="bg-white border-slate-200">
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 font-body">
                No activities yet. Add your first activity above.
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(itemsByDay)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([day, dayItems]) => (
              <Card key={day} className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="font-body flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Day {day} - {getDateForDay(Number(day))}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dayItems
                      .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""))
                      .map((item) => {
                        const isCompleted = item.is_completed;
                        return (
                          <div
                            key={item.id}
                            className={`
                              flex items-start justify-between p-4 border rounded-lg transition-colors
                              ${isCompleted 
                                ? "opacity-70 bg-green-50/50 border-l-4 border-l-green-500 border-slate-200 hover:bg-green-50" 
                                : "border-slate-200 hover:bg-slate-50"
                              }
                            `}
                          >
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {isCompleted && (
                                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                )}
                                <h4 className={`font-semibold font-body ${isCompleted ? "text-slate-700" : "text-slate-900"}`}>
                                  {item.title}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className={`font-body text-xs ${typeColors[item.type]}`}
                                >
                                  {item.type}
                                </Badge>
                                {isCompleted && (
                                  <Badge className="bg-green-600 hover:bg-green-700 text-white font-body text-xs">
                                    Done
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-600 font-body">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{item.start_time}</span>
                                </div>
                              </div>
                              {item.description && (
                                <p className={`text-sm font-body ${isCompleted ? "text-muted-foreground" : "text-slate-600"}`}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(item)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 mr-2"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* Documents Section */}
      <Separator />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 font-body">Documents</h2>
          <Badge variant="outline" className="font-body">
            {documents.length} {documents.length === 1 ? "document" : "documents"}
          </Badge>
        </div>

        {/* Upload Document Card */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="font-body">Upload Document</CardTitle>
            <CardDescription className="font-body">
              Upload PDFs or images for this trip
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Label htmlFor="file-upload" className="font-body cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    className="font-body"
                    asChild
                  >
                    <span>
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </>
                      )}
                    </span>
                  </Button>
                </Label>
                <span className="text-sm text-slate-500 font-body">
                  PDF, JPG, PNG, GIF, WEBP
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        {documentsLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <Card className="bg-white border-slate-200">
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 font-body">
                No documents uploaded yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const FileIcon = getFileIcon(doc.name);
              const docUrl = getDocumentUrl(doc.file_path);
              
              return (
                <Card key={doc.id} className="bg-white border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <FileIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 font-body truncate">
                          {doc.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-body mt-1">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(docUrl, '_blank')}
                        className="flex-1 font-body"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal Overlay */}
      {isEditOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="mb-4 text-lg font-bold text-slate-900 font-body">Edit Activity</h3>
            <form onSubmit={handleUpdateItem} className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="font-body">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={editingItem.title}
                  className="font-body"
                  required
                />
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date" className="font-body">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-date"
                    name="date"
                    type="date"
                    defaultValue={editingItem.day_date}
                    min={trip.start_date}
                    max={trip.end_date}
                    className="font-body"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time" className="font-body">
                    Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-time"
                    name="time"
                    type="time"
                    defaultValue={editingItem.start_time}
                    className="font-body"
                    required
                  />
                </div>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="edit-type" className="font-body">
                  Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="edit-type"
                  name="type"
                  defaultValue={editingItem.type}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-body"
                  required
                >
                  <option value="flight">Flight</option>
                  <option value="hotel">Hotel</option>
                  <option value="activity">Activity</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="font-body">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingItem.description || ""}
                  className="font-body"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingItem(null);
                  }}
                  className="font-body"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-body">
                  Save changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
