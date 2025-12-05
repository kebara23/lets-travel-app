"use client";

import { useEffect, useState } from "react";

// Force dynamic rendering
export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, FileText, Key, MessageSquare, LogOut, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { ReviewDialog } from "@/components/features/reviews/ReviewDialog";

// Simple countdown component for Next Activity
function NextActivityCountdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ hours, minutes });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <p className="text-sm font-medium text-primary font-body">
      Starts in: {timeLeft.hours} hours {timeLeft.minutes} minutes
    </p>
  );
}

type User = {
  id?: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
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
  type: string;
  is_completed: boolean;
};

type Trip = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: "active" | "draft" | "completed";
  created_at: string;
  itinerary_items?: ItineraryItem[];
};

type TripWithItems = Trip & {
  itinerary_items: ItineraryItem[];
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripLoading, setTripLoading] = useState(true);
  const [nextActivity, setNextActivity] = useState<ItineraryItem | null>(null);
  const [nextActivityDate, setNextActivityDate] = useState<Date | null>(null);
  const [nextActivityTripId, setNextActivityTripId] = useState<string | null>(null); // Track which trip the next activity belongs to
  const [nextActivityStatus, setNextActivityStatus] = useState<"happening_now" | "upcoming" | null>(null);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    try {
      const client = createClient();
      if (isMounted) {
        setSupabase(client);
      }
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error);
    }

    return () => {
      isMounted = false;
    };
  }, []); // Removed toast dependency

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;
    const currentSupabase = supabase;

    async function checkSession() {
      try {
        // Use getUser() for more reliable session check (same as login page)
        const {
          data: { user },
          error: userError,
        } = await currentSupabase.auth.getUser();

        if (!isMounted) return;

        // If no valid user or error, redirect to login using window.location to prevent loops
        if (!user || userError) {
          console.log("ℹ️ No valid session in dashboard, redirecting to login");
          if (!isMounted) return;
          // Use window.location.href to force full page reload and prevent redirect loops
          window.location.href = "/login";
          return;
        }

        if (isMounted) {
          setUser(user);
          
          // Fetch all user's active trips
          if (user.id) {
            await fetchUserTrip(currentSupabase, user.id);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error checking session:", error);
          // Use window.location.href to force full page reload and prevent redirect loops
          window.location.href = "/login";
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  async function fetchUserTrip(supabaseClient: ReturnType<typeof createClient>, userId: string) {
    // Validate userId before query
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      console.error("Invalid userId provided to fetchUserTrip");
      setTrip(null);
      setTripLoading(false);
      return;
    }

    try {
      console.log("📊 Fetching ALL trips for user:", userId);
      
      // Fetch ALL active trips (not just one)
      const { data: tripsData, error: tripsError } = await supabaseClient
        .from("trips")
        .select("*, itinerary_items(*)")
        .eq("user_id", userId)
        .in("status", ["active", "upcoming"])
        .order("start_date", { ascending: true }); // Order by start date, not created_at

      if (tripsError) {
        console.error("Error fetching trips:", tripsError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load trip information.",
        });
        setTrip(null);
        setTripLoading(false);
        return;
      }

      if (!tripsData || tripsData.length === 0) {
        console.log("No trips found for user");
        setTrip(null);
        setTripLoading(false);
        return;
      }

      console.log(`✅ Found ${tripsData.length} trip(s) for user`);

      // Collect ALL itinerary items from ALL trips
      const allItems: Array<{ item: ItineraryItem; tripId: string; tripTitle: string }> = [];
      
      tripsData.forEach((trip: any) => {
        if (trip.itinerary_items && Array.isArray(trip.itinerary_items)) {
          trip.itinerary_items.forEach((item: ItineraryItem) => {
            allItems.push({
              item,
              tripId: trip.id,
              tripTitle: trip.title,
            });
          });
        }
      });

      console.log(`📋 Total itinerary items across all trips: ${allItems.length}`);

      // Find the next activity from ALL trips
      if (allItems.length > 0) {
        const next = getNextActivityFromAllItems(allItems);
        if (next) {
          console.log("✅ Next Activity Found:", {
            title: next.item.title,
            trip: next.tripTitle,
            date: next.date.toISOString(),
          });
          setNextActivity(next.item);
          setNextActivityDate(next.date);
          setNextActivityTripId(next.tripId);
          setNextActivityStatus(next.status);
          
          // Set the trip that contains the next activity (or the first trip if no next activity)
          const tripWithNextActivity = tripsData.find((t: any) => t.id === next.tripId);
          if (tripWithNextActivity) {
            setTrip(tripWithNextActivity as Trip);
          } else {
            // Fallback: show the first trip
            setTrip(tripsData[0] as Trip);
          }
        } else {
          console.log("ℹ️ No upcoming activities found");
          // Show the first trip even if no upcoming activities
          setTrip(tripsData[0] as Trip);
          setNextActivity(null);
          setNextActivityDate(null);
          setNextActivityTripId(null);
          setNextActivityStatus(null);
        }
      } else {
        console.log("ℹ️ No itinerary items found in any trip");
        // Show the first trip even if no items
        setTrip(tripsData[0] as Trip);
        setNextActivity(null);
        setNextActivityDate(null);
        setNextActivityTripId(null);
      }
    } catch (error: any) {
      console.error("Exception fetching trips:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load trip information.",
      });
    } finally {
      setTripLoading(false);
    }
  }

  // Find next activity from ALL trips' items with priority logic:
  // Priority 1: Current Activity (Happening Now) - startDate <= CurrentTime <= endDate
  // Priority 2: Upcoming Activity (Next in future) - startDate > CurrentTime
  function getNextActivityFromAllItems(
    allItems: Array<{ item: ItineraryItem; tripId: string; tripTitle: string }>
  ): { item: ItineraryItem; date: Date; tripId: string; tripTitle: string; status: "happening_now" | "upcoming" } | null {
    const now = new Date();
    now.setSeconds(0, 0); // Normalize to minute precision
    
    // Debug: Log all activities received
    console.log("🔍 All Trip Activities:", allItems.map(({ item }) => ({
      id: item.id,
      title: item.title,
      day_date: item.day_date,
      start_time: item.start_time,
      is_completed: item.is_completed,
    })));

    const currentActivities: Array<{ item: ItineraryItem; date: Date; tripId: string; tripTitle: string }> = [];
    const upcomingActivities: Array<{ item: ItineraryItem; date: Date; tripId: string; tripTitle: string }> = [];

    console.log("🔍 Finding next activity from", allItems.length, "items across all trips");
    console.log("🕐 Current time:", now.toISOString(), "Local:", now.toLocaleString());

    for (const { item, tripId, tripTitle } of allItems) {
      if (item.is_completed) {
        console.log("⏭️ Skipping completed item:", item.title);
        continue;
      }

      if (!item.day_date || !item.start_time) {
        console.log("⏭️ Skipping item with missing date/time:", item.title);
        continue;
      }

      // Parse time and date
      try {
        const [hours, minutes] = item.start_time.split(":").map(Number);
        const startDate = new Date(item.day_date);
        startDate.setHours(hours, minutes, 0, 0);

        // Validate the date
        if (isNaN(startDate.getTime())) {
          console.error("❌ Invalid date created for item:", item.title);
          continue;
        }

        // Estimate end time: assume 2 hours duration if no end_time is provided
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 2); // Default 2-hour duration

        console.log("📅 Activity:", item.title, {
          day_date: item.day_date,
          start_time: item.start_time,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          now: now.toISOString(),
          isPast: startDate < now,
          isCurrent: startDate <= now && now <= endDate,
          isFuture: startDate > now,
        });

        // PRIORITY 1: Check if activity is happening now (startDate <= now <= endDate)
        if (startDate <= now && now <= endDate) {
          console.log("✅ CURRENT ACTIVITY FOUND:", item.title);
          currentActivities.push({ item, date: startDate, tripId, tripTitle });
        }
        // PRIORITY 2: Check if activity is upcoming (startDate > now)
        else if (startDate > now) {
          console.log("⏭️ UPCOMING ACTIVITY:", item.title);
          upcomingActivities.push({ item, date: startDate, tripId, tripTitle });
        }
      } catch (error) {
        console.warn("⚠️ Error parsing activity date/time:", item, error);
        continue;
      }
    }

    // PRIORITY 1: Return current activity if any
    if (currentActivities.length > 0) {
      // If multiple current activities, return the one that started most recently
      currentActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
      const current = currentActivities[0];
      console.log("✅ CURRENT Activity Selected:", {
        title: current.item.title,
        trip: current.tripTitle,
        date: current.date.toISOString(),
        status: "happening_now",
      });
      return { ...current, status: "happening_now" };
    }

    // PRIORITY 2: Return upcoming activity if any
    if (upcomingActivities.length > 0) {
      // Sort by date (earliest first)
      upcomingActivities.sort((a, b) => a.date.getTime() - b.date.getTime());
      const next = upcomingActivities[0];
      const timeUntil = Math.round((next.date.getTime() - now.getTime()) / (1000 * 60 * 60));
      console.log("✅ UPCOMING Activity Selected:", {
        title: next.item.title,
        trip: next.tripTitle,
        date: next.date.toISOString(),
        timeUntil: `${timeUntil} hours`,
        status: "upcoming",
      });
      return { ...next, status: "upcoming" };
    }

    // No activities found
    console.log("❌ No current or upcoming activities found");
    return null;
  }

  // Notification handlers
  async function handle24HourNotification() {
    if (!nextActivity || !user?.id || !supabase) return;

    const notificationKey = `notified_24h_${nextActivity.id}`;
    if (localStorage.getItem(notificationKey)) return; // Already notified

    try {
      // Request notification permission
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }

      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`Mañana: ${nextActivity.title}`, {
          body: `Tu actividad "${nextActivity.title}" comienza mañana.`,
          icon: "/favicon.ico",
        });
      }

      // Insert notification in Supabase
      const { error } = await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Próxima Actividad",
        message: `Mañana: ${nextActivity.title}`,
        type: "activity_reminder",
        link: "/itinerary",
      });

      if (error) throw error;

      // Mark as notified
      localStorage.setItem(notificationKey, "true");
    } catch (error) {
      console.error("Error sending 24h notification:", error);
    }
  }

  async function handle1HourNotification() {
    if (!nextActivity || !user?.id || !supabase) return;

    const notificationKey = `notified_1h_${nextActivity.id}`;
    if (localStorage.getItem(notificationKey)) return; // Already notified

    try {
      // Request notification permission
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }

      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`Próximamente: ${nextActivity.title}`, {
          body: `Tu actividad "${nextActivity.title}" comienza en 1 hora.`,
          icon: "/favicon.ico",
        });
      }

      // Insert notification in Supabase
      const { error } = await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Próxima Actividad",
        message: `En 1 hora: ${nextActivity.title}`,
        type: "activity_reminder",
        link: "/itinerary",
      });

      if (error) throw error;

      // Mark as notified
      localStorage.setItem(notificationKey, "true");
    } catch (error) {
      console.error("Error sending 1h notification:", error);
    }
  }

  async function handleSignOut() {
    if (!supabase) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        // We continue to redirect even if there's an error
        // This prevents users from being stuck if the session is already invalid
      }

      toast({
        title: "Signed out",
        description: "You have been signed out.",
      });
    } catch (error) {
      console.error("Unexpected error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while signing out, but we are redirecting you.",
      });
    } finally {
      // Always redirect to login, even if there was an error
      // Use window.location to force a full page reload and clear any cached session state
      window.location.href = "/login";
    }
  }

  if (loading || tripLoading) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Traveler";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const quickActions = [
    {
      title: "My Itinerary",
      description: "View your travel schedule",
      href: "/itinerary",
      icon: Map,
    },
    {
      title: "Documents",
      description: "Access your travel documents",
      href: "/documents",
      icon: FileText,
    },
    {
      title: "Concierge",
      description: "Chat with our team",
      href: "/messages",
      icon: MessageSquare,
    },
    {
      title: "Insider Access",
      description: "Exclusive experiences",
      href: "/explore",
      icon: Key,
    },
    {
      title: "Live Tracking",
      description: "Share location for safety",
      href: "/tracking",
      icon: MapPin,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-8 pt-16">
          <div className="space-y-2">
            <h1 className="font-heading text-4xl lg:text-5xl text-primary">
              Welcome back, {userName}
            </h1>
            <p className="font-body text-lg text-muted-foreground">
              Ready for your next adventure?
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 border-2 border-luxury">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <Separator />

        {/* Main Trip Status Card */}
        {trip ? (
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="font-heading text-2xl text-primary">
                    {trip.title}
                  </CardTitle>
                  <CardDescription className="font-body">
                    {new Date(trip.start_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(trip.end_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-body">
                  {trip.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {nextActivity && nextActivityDate ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-foreground">
                        {nextActivityStatus === "happening_now" ? "Happening Now" : "Next Activity"}
                      </h3>
                      <p className="font-body text-sm text-muted-foreground">
                        {nextActivity.title}
                      </p>
                    </div>
                    {nextActivityStatus === "happening_now" ? (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                    ) : (
                      <Clock className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="space-y-2">
                    {nextActivityStatus === "happening_now" ? (
                      <div className="text-center py-2 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-800 font-body">
                          This activity is currently in progress
                        </p>
                      </div>
                    ) : (
                      <>
                        <NextActivityCountdown targetDate={nextActivityDate} />
                        <Progress
                          value={
                            ((nextActivityDate.getTime() - new Date().getTime()) /
                              (24 * 60 * 60 * 1000)) *
                            100
                          }
                          className="h-2"
                        />
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground font-body">
                  No upcoming activities scheduled
                </div>
              )}
              <Link href="/itinerary">
                <Button className="w-full font-body" variant="default">
                  View Full Itinerary
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-primary">
                No Active Trip
              </CardTitle>
              <CardDescription className="font-body">
                You don&apos;t have an active trip at the moment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-body">
                Contact your travel concierge to plan your next adventure!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Grid */}
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-6">Quick Actions</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const content = (
                <Card
                  key={action.title}
                  className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="font-heading text-lg font-semibold text-foreground">
                        {action.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-body">
                        {action.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );

              // Logic simplified as we removed the onClick from Concierge action
              return (
                <Link key={action.title} href={action.href} className="block h-full">
                  {content}
                </Link>
              );
            })}
            
            {/* Review & Reputation Module */}
            <ReviewDialog 
              className="block h-full animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
              style={{ animationDelay: "500ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
