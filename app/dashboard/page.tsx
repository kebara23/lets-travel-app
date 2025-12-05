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
        setTrip(data as Trip);
        
        // Calculate next activity
        if (data.itinerary_items && data.itinerary_items.length > 0) {
          const next = getNextActivity(data.itinerary_items as ItineraryItem[]);
          if (next) {
            setNextActivity(next.item);
            setNextActivityDate(next.date);
          }
        }
      }
    } catch (error: any) {
      console.error("Exception fetching trip:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load trip information.",
      });
    } finally {
      setTripLoading(false);
    }
  }

  // Find next activity from itinerary items
  function getNextActivity(items: ItineraryItem[]): { item: ItineraryItem; date: Date } | null {
    const now = new Date();
    const upcoming: { item: ItineraryItem; date: Date }[] = [];

    for (const item of items) {
      if (item.is_completed) continue;

      const [hours, minutes] = item.start_time.split(":").map(Number);
      const activityDate = new Date(item.day_date);
      activityDate.setHours(hours, minutes, 0, 0);

      if (activityDate > now) {
        upcoming.push({ item, date: activityDate });
      }
    }

    if (upcoming.length === 0) {
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
                        Next Activity
                      </h3>
                      <p className="font-body text-sm text-muted-foreground">
                        {nextActivity.title}
                      </p>
                    </div>
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <NextActivityCountdown targetDate={nextActivityDate} />
                    <Progress
                      value={
                        ((nextActivityDate.getTime() - new Date().getTime()) /
                          (24 * 60 * 60 * 1000)) *
                        100
                      }
                      className="h-2"
                    />
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
  );
}
