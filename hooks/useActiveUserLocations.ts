import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export type ActiveUser = {
  id: string;
  name: string;
  avatarUrl: string | null;
  lat: number;
  lng: number;
  lastUpdated: string;
  tripName: string | null;
};

export function useActiveUserLocations() {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchActiveUsers();

    // Set up realtime subscription
    const channel = supabase
      .channel("active-user-locations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "device_tracking",
        },
        () => {
          // Refetch when tracking data changes
          fetchActiveUsers();
        }
      )
      .subscribe();

    // Poll every 30 seconds as backup
    const interval = setInterval(fetchActiveUsers, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  async function fetchActiveUsers() {
    try {
      setLoading(true);
      
      // Fetch all active tracking data with user info
      const { data: trackingData, error: trackingError } = await supabase
        .from("device_tracking")
        .select(`
          user_id,
          lat,
          lng,
          updated_at,
          users:user_id (
            id,
            full_name,
            email
          )
        `)
        .order("updated_at", { ascending: false });

      if (trackingError) throw trackingError;

      // Fetch active trips for each user to get trip names
      const userIds = (trackingData || []).map((t: any) => t.user_id);
      
      let tripData: any[] = [];
      if (userIds.length > 0) {
        const today = new Date().toISOString().split("T")[0];
        const { data: trips, error: tripsError } = await supabase
          .from("trips")
          .select("id, user_id, title, start_date, end_date")
          .in("user_id", userIds)
          .lte("start_date", today)
          .gte("end_date", today)
          .eq("status", "active");

        if (!tripsError) {
          tripData = trips || [];
        }
      }

      // Transform data
      const transformed: ActiveUser[] = (trackingData || []).map((track: any) => {
        const user = Array.isArray(track.users) ? track.users[0] : track.users;
        const activeTrip = tripData.find((t) => t.user_id === track.user_id);

        // Generate avatar URL (you can customize this based on your avatar storage)
        const avatarUrl = user?.email 
          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.email)}&background=random&color=fff&size=128`
          : null;

        return {
          id: track.user_id,
          name: user?.full_name || user?.email || "Unknown User",
          avatarUrl,
          lat: track.lat,
          lng: track.lng,
          lastUpdated: track.updated_at,
          tripName: activeTrip?.title || null,
        };
      });

      setActiveUsers(transformed);
      setError(null);
    } catch (err) {
      console.error("Error fetching active user locations:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch locations"));
    } finally {
      setLoading(false);
    }
  }

  return { activeUsers, loading, error, refetch: fetchActiveUsers };
}

