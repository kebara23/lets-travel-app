"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string;
  is_read: boolean;
  created_at: string;
  user_id: string;
};

export function NotificationBell({ className }: { className?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  // Play sound helper
  const playSound = () => {
    try {
      const audio = new Audio("/sounds/ding.mp3"); // Ensure this file exists in public/sounds/
      audio.volume = 0.7;
      audio.play().catch((e) => console.log("Audio play failed (user interaction needed first)", e));
    } catch (e) {
      console.error("Error playing sound", e);
    }
  };

  // 1. Initial Fetch - Get userId and load notifications
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          console.log("🔔 NotificationBell: No session found");
          return;
        }
        
        const currentUserId = session.user.id;
        console.log("🔔 NotificationBell: User ID set:", currentUserId);
        
        if (isMounted) {
          setUserId(currentUserId);

          // Fetch initial notifications
          const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", currentUserId)
            .order("created_at", { ascending: false })
            .limit(20);

          if (error) {
            console.error("🔔 Error fetching notifications:", error);
          } else if (isMounted && data) {
            setNotifications(data);
            // Count unread notifications
            const unread = data.filter((n) => !n.is_read).length;
            setUnreadCount(unread);
            console.log("🔔 Initial notifications loaded:", data.length, "Unread:", unread);
          }
        }
      } catch (error) {
        console.error("🔔 Error in init:", error);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // 2. Realtime Subscription - BROAD LISTEN (No Filter)
  useEffect(() => {
    // GUARDIA: Si no hay userId, no te suscribas
    if (!userId) {
      console.log("🔔 NotificationBell: No userId, skipping subscription");
      return;
    }

    console.log("🔔 Iniciando suscripción BROAD LISTEN para userId:", userId);

    // Clean up any existing channel first
    if (channelRef.current) {
      console.log("🔔 NotificationBell: Cleaning up existing channel");
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create unique channel name
    const channelName = `realtime-notifications-${userId}`;
    console.log("🔔 NotificationBell: Creating channel:", channelName);

    // SUSCRIPCIÓN SIN FILTRO - Escucha TODOS los INSERT
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          // NO USAR FILTRO AQUÍ - Escuchamos todo
        },
        (payload) => {
          console.log("🔔 ALERTA RECIBIDA (BROAD):", payload);
          
          const newNotification = payload.new as Notification;
          
          // FILTRADO MANUAL: Verificar si la notificación es para este usuario
          if (newNotification.user_id !== userId) {
            console.log("🔔 Notificación ignorada (no es para este usuario):", newNotification.user_id, "vs", userId);
            return; // Si no es para mí, ignorar
          }
          
          // Si es para mí, ejecutar sonido y actualizar estado
          console.log("🔔 ALERTA EN VIVO:", newNotification);
          
          // Actualizar contador primero
          setUnreadCount((prev) => {
            const newCount = prev + 1;
            console.log("🔔 Contador actualizado:", prev, "->", newCount);
            return newCount;
          });
          
          // Deduplication: Check if notification already exists
          setNotifications((prev) => {
            const exists = prev.some((n) => n.id === newNotification.id);
            if (exists) {
              console.log("🔔 Notificación ya existe, omitiendo duplicado");
              return prev;
            }
            console.log("🔔 Agregando nueva notificación a la lista");
            return [newNotification, ...prev];
          });
          
          // Reproducir sonido
          playSound();
          
          // Mostrar Toast con acción clickeable
          toast({
            title: newNotification.title,
            description: newNotification.message,
            action: newNotification.link ? (
              <ToastAction
                altText="View"
                onClick={() => {
                  router.push(newNotification.link);
                }}
              >
                View
              </ToastAction>
            ) : undefined,
            onClick: newNotification.link ? () => {
              router.push(newNotification.link);
            } : undefined,
          });
        }
      )
      .subscribe((status) => {
        console.log("🔔 Estado de conexión:", status);
        if (status === "SUBSCRIBED") {
          console.log("🔔 ✅ Suscripción exitosa al canal de notificaciones (BROAD LISTEN)");
        } else if (status === "CHANNEL_ERROR") {
          console.error("🔔 ❌ Error en el canal de suscripción");
        } else if (status === "TIMED_OUT") {
          console.error("🔔 ⏱️ Timeout en la suscripción");
        } else if (status === "CLOSED") {
          console.log("🔔 🔒 Canal cerrado");
        }
      });

    // Store channel reference for cleanup
    channelRef.current = channel;

    // CLEANUP: Remover canal al desmontar o cuando cambie userId
    return () => {
      console.log("🔔 NotificationBell: Limpiando suscripción");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [supabase, userId, toast]); // Dependencias estrictas

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      // Mark as read in DB
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id);

      if (!error) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
        // Update unread count using previous state
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    }

    // Redirect
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    
    // Optimistic update
    const previousNotifications = [...notifications];
    const previousCount = unreadCount;
    
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all as read", error);
      // Revert
      setNotifications(previousNotifications);
      setUnreadCount(previousCount);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark all as read.",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto py-1 px-2"
              onClick={(e) => {
                e.preventDefault();
                handleMarkAllRead();
              }}
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                  !notification.is_read ? "bg-muted/50 font-medium" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex w-full justify-between items-start">
                  <span className="text-sm font-semibold">{notification.title}</span>
                  {!notification.is_read && (
                    <span className="h-2 w-2 rounded-full bg-blue-500 mt-1" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
                <span className="text-[10px] text-muted-foreground self-end mt-1">
                  {new Date(notification.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
