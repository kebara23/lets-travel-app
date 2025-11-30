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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripLoading, setTripLoading] = useState(true);
  const [nextActivity, setNextActivity] = useState<ItineraryItem | null>(null);
  const [nextActivityDate, setNextActivityDate] = useState<Date | null>(null);
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
      if (isMounted) {
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: error instanceof Error ? error.message : "Supabase is not configured. Please check your environment variables.",
        });
      }
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
        const {
          data: { session },
        } = await currentSupabase.auth.getSession();

        if (!isMounted) return;

        if (!session) {
          router.push("/login");
          return;
        }

        if (isMounted) {
          setUser(session.user);
          
          // Fetch user's most recent trip
          if (session.user.id) {
            await fetchUserTrip(currentSupabase, session.user.id);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error checking session:", error);
          router.push("/login");
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
      console.log("Fetching trip for user:", userId);
      
      const { data, error } = await supabaseClient
        .from("trips")
        .select("*, itinerary_items(*)")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // If no trip found, error.code will be 'PGRST116'
        if (error.code === "PGRST116") {
          console.log("No trips found for user");
          setTrip(null);
        } else {
          console.error("Error fetching trip:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load trip information.",
          });
        }
      } else {
        console.log("Trip loaded:", data);
        
        // Transform data to handle Supabase relation format
        const transformedTrip: Trip = {
          ...data,
          itinerary_items: Array.isArray(data.itinerary_items) 
            ? data.itinerary_items 
            : data.itinerary_items 
              ? [data.itinerary_items] 
              : [],
        };
        
        setTrip(transformedTrip);
        
        // Find next activity
        if (transformedTrip.itinerary_items && transformedTrip.itinerary_items.length > 0) {
          console.log("📋 Processing", transformedTrip.itinerary_items.length, "itinerary items");
          const next = getNextActivity(transformedTrip.itinerary_items);
          if (next) {
            console.log("✅ Next Activity Found:", next.item.title, next.date);
            setNextActivity(next.item);
            setNextActivityDate(next.date);
          } else {
            console.log("❌ No next activity found");
            setNextActivity(null);
            setNextActivityDate(null);
          }
        } else {
          console.log("❌ No itinerary items to process");
          setNextActivity(null);
          setNextActivityDate(null);
        }
      }
    } catch (error) {
      console.error("Exception fetching trip:", error);
      setTrip(null);
    } finally {
      setTripLoading(false);
    }
  }

  // Find next activity from itinerary items
  function getNextActivity(items: ItineraryItem[]): { item: ItineraryItem; date: Date } | null {
    const now = new Date();
    now.setSeconds(0, 0); // Normalize to minute precision
    const upcoming: Array<{ item: ItineraryItem; date: Date }> = [];

    console.log("🔍 Finding next activity from", items.length, "items");

    // Process each item
    for (const item of items) {
      // Skip completed or missing data
      if (item.is_completed) {
        console.log("⏭️ Skipping completed item:", item.title);
        continue;
      }

      if (!item.day_date || !item.start_time) {
        console.log("⏭️ Skipping item with missing date/time:", item.title, {
          day_date: item.day_date,
          start_time: item.start_time,
        });
        continue;
      }

      try {
        // Parse day_date (expected format: YYYY-MM-DD)
        const dateParts = item.day_date.split("-");
        if (dateParts.length !== 3) {
          console.error("❌ Invalid day_date format:", item.day_date);
          continue;
        }

        // Parse start_time (expected format: HH:mm or HH:mm:ss)
        const timeParts = item.start_time.split(":");
        if (timeParts.length < 2) {
          console.error("❌ Invalid start_time format:", item.start_time);
          continue;
        }

        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
        const day = parseInt(dateParts[2], 10);
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10) || 0;

        // Create Date object with explicit values
        const activityDate = new Date(year, month, day, hours, minutes, 0, 0);

        // Validate the date
        if (isNaN(activityDate.getTime())) {
          console.error("❌ Invalid date created:", {
            year,
            month,
            day,
            hours,
            minutes,
          });
          continue;
        }

        console.log("📅 Activity:", item.title, {
          day_date: item.day_date,
          start_time: item.start_time,
          parsedDate: activityDate.toISOString(),
          isFuture: activityDate > now,
        });

        // Only include future activities
        if (activityDate > now) {
          upcoming.push({ item, date: activityDate });
        }
      } catch (error) {
        console.error("❌ Error parsing date for item:", item.id, item.title, error);
      }
    }

    // Sort by date (ascending) and return the first one
    if (upcoming.length === 0) {
      console.log("❌ No upcoming activities found");
      return null;
    }

    upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());
    const next = upcoming[0];
    console.log("✅ Next Activity Found:", {
      title: next.item.title,
      date: next.date.toISOString(),
      timeUntil: Math.round((next.date.getTime() - now.getTime()) / (1000 * 60 * 60)) + " hours",
    });

    return next;
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
        new Notification(`En 1 hora: ${nextActivity.title}`, {
          body: `Tu actividad "${nextActivity.title}" comienza en 1 hora.`,
          icon: "/favicon.ico",
        });
      }

      // Insert notification in Supabase
      const { error } = await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Actividad Próxima",
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
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to sign out. Please try again.",
        });
        return;
      }

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });

      router.push("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    }
  }

  if (loading || tripLoading) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Guest";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const quickActions = [
    {
      title: "My Itinerary",
      icon: Map,
      href: "/itinerary",
      description: "View your travel plans",
    },
    {
      title: "Documents",
      icon: FileText,
      href: "/documents",
      description: "Access your documents",
    },
    {
      title: "Insider",
      icon: Key,
      href: "/explore",
      description: "Unlock hidden gems & exclusive upgrades.",
    },
    {
      title: "Concierge",
      icon: MessageSquare,
      href: "/messages",
      description: "Chat with concierge",
    },
    {
      title: "Live Tracker",
      icon: MapPin,
      href: "/tracking",
      description: "Share location for safety",
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
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-primary/20 border-primary/20 shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="font-heading text-2xl lg:text-3xl text-primary">
                    {trip.title}
                  </CardTitle>
                  <CardDescription className="text-base font-body">
                    Your luxury adventure awaits
                  </CardDescription>
                </div>
                <Badge
                  className={`text-sm px-3 py-1 ${
                    trip.status === "active"
                      ? "bg-green-600 text-white"
                      : trip.status === "completed"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-500 text-white"
                  }`}
                >
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    Starts: {new Date(trip.start_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-muted-foreground">Trip Status</span>
                </div>
                <Progress
                  value={
                    trip.status === "completed"
                      ? 100
                      : trip.status === "active"
                      ? 50
                      : 25
                  }
                  className="h-2"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Start Date
                  </p>
                  <p className="font-semibold text-foreground">
                    {new Date(trip.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    End Date
                  </p>
                  <p className="font-semibold text-foreground">
                    {new Date(trip.end_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Duration
                  </p>
                  <p className="font-semibold text-foreground">
                    {Math.ceil(
                      (new Date(trip.end_date).getTime() -
                        new Date(trip.start_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    Days
                  </p>
                </div>
              </div>

              {/* Next Activity Section */}
              {nextActivity && nextActivityDate ? (
                <div className="mt-6 pt-6 border-t border-primary/20">
                  <div className="bg-white rounded-lg p-4 space-y-3 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <h3 className="font-heading text-lg font-semibold text-slate-900">
                        UP NEXT
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-900 font-body text-base">
                        {nextActivity.title}
                      </p>
                      <p className="text-sm text-slate-600 font-body">
                        {nextActivityDate.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                      <NextActivityCountdown targetDate={nextActivityDate} />
                      <CountdownTimer
                        targetDate={nextActivityDate}
                        on24Hours={handle24HourNotification}
                        on1Hour={handle1HourNotification}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t border-primary/20">
                  <p className="text-sm text-slate-500 font-body italic">
                    No upcoming activities scheduled
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-primary/20 border-primary/20 shadow-lg">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Map className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading text-2xl text-primary">
                    No trips planned yet
                  </h3>
                  <p className="font-body text-muted-foreground max-w-md mx-auto">
                    Contact your concierge to plan your next luxury adventure.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/messages")} // Changed to real navigation
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Concierge
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const content = (
              <Card
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-luxury/20 hover:border-luxury/40 bg-card h-full"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[160px]">
                  <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
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
        </div>
      </div>
    </div>
  );
}
