import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ItineraryItem = {
  id: string;
  trip_id: string;
  day: number;
  time: string;
  title: string;
  description: string | null;
  type: "flight" | "hotel" | "activity" | "food";
  location: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

export function useItinerary(tripId: string = "default-trip") {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Initialize Supabase client - ensure it's created properly
  const supabase = createClient();

  // Fetch itinerary items - Get ALL items without date filtering
  const { data, isLoading, error } = useQuery({
    queryKey: ["itinerary", tripId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("itinerary_items")
          .select("*")
          .eq("trip_id", tripId)
          .order("day", { ascending: true })
          .order("time", { ascending: true });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        // If no data, return empty array (no mock data)
        if (!data || data.length === 0) {
          console.log("No itinerary items found for trip:", tripId);
          return [];
        }

        console.log(`Loaded ${data.length} itinerary items`);
        return data as ItineraryItem[];
      } catch (err) {
        console.error("Error fetching itinerary:", err);
        // Return empty array on error (no mock data)
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Only retry once
  });

  // Mutation to update completion status with OPTIMISTIC UPDATES
  const updateCompletionMutation = useMutation({
    mutationFn: async ({
      id,
      is_completed,
    }: {
      id: string;
      is_completed: boolean;
    }) => {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      const { data, error } = await supabase
        .from("itinerary_items")
        .update({ is_completed, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      return { id, is_completed };
    },
    // OPTIMISTIC UPDATE: Update UI immediately before server responds
    onMutate: async ({ id, is_completed }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["itinerary", tripId] });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData<ItineraryItem[]>([
        "itinerary",
        tripId,
      ]);

      // Optimistically update the cache
      if (previousItems) {
        queryClient.setQueryData<ItineraryItem[]>(["itinerary", tripId], (old) => {
          if (!old) return old;
          return old.map((item) =>
            item.id === id ? { ...item, is_completed, updated_at: new Date().toISOString() } : item
          );
        });
      }

      // Return context with the snapshotted value
      return { previousItems };
    },
    // If mutation succeeds, invalidate to refetch and confirm with server
    onSuccess: (data, variables) => {
      // Invalidate queries to ensure UI is in sync with server
      queryClient.invalidateQueries({ queryKey: ["itinerary", tripId] });
      
      // Show success toast
      toast({
        title: variables.is_completed ? "Activity completed!" : "Activity unmarked",
        description: "Your itinerary has been updated.",
      });
    },
    // If mutation fails, rollback to previous state
    onError: (error, variables, context) => {
      // Rollback to previous state
      if (context?.previousItems) {
        queryClient.setQueryData(["itinerary", tripId], context.previousItems);
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update activity. Please try again.",
      });
    },
  });

  return {
    items: data || [],
    isLoading,
    error,
    updateCompletion: updateCompletionMutation.mutate,
    isUpdating: updateCompletionMutation.isPending,
  };
}

