"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, Loader2, Phone, MoreVertical } from "lucide-react";

type Message = {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string | null;
  created_at: string;
  isOptimistic?: boolean; // Flag for temporary messages
};

export default function MessagesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Auth & Initial Fetch
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      
      const currentUserId = session.user.id;
      // Ensure userId is set immediately for local logic
      if (isMounted) setUserId(currentUserId);

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (isMounted) {
        if (error) {
          console.error("Error fetching messages:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load message history.",
          });
        } else {
          setMessages((data || []).reverse());
        }
        setLoading(false);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [supabase, router, toast]);

  // 2. Realtime Subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Security filter: show only if related to me
          if (newMsg.sender_id === userId || newMsg.recipient_id === userId) {
            // Deduplication: Check if message already exists (by ID or by content + sender + timestamp)
            setMessages((prev) => {
              // Check if we already have this message (real one replacing optimistic)
              const existsById = prev.some((m) => m.id === newMsg.id);
              if (existsById) return prev;

              // Check if we have an optimistic message with same content from same sender
              const optimisticIndex = prev.findIndex(
                (m) =>
                  m.isOptimistic &&
                  m.content === newMsg.content &&
                  m.sender_id === newMsg.sender_id &&
                  Math.abs(
                    new Date(m.created_at).getTime() - new Date(newMsg.created_at).getTime()
                  ) < 5000 // Within 5 seconds
              );

              if (optimisticIndex !== -1) {
                // Replace optimistic message with real one
                const updated = [...prev];
                updated[optimisticIndex] = newMsg;
                return updated;
              }

              // Add new message
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || sending) return;

    const content = newMessage.trim();
    setNewMessage(""); // Clear input immediately

    // Create optimistic message
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: content,
      sender_id: userId,
      recipient_id: null,
      created_at: new Date().toISOString(),
      isOptimistic: true,
    };

    // Add optimistic message immediately
    setMessages((prev) => [...prev, tempMessage]);

    // Scroll to bottom
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);

    setSending(true);

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: userId,
        content: content,
        recipient_id: null, // To Admin Pool
      });

      if (error) throw error;
      
      // The real message will be added via Realtime subscription
      // and will replace the optimistic one
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message.",
      });
      setNewMessage(content); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background w-full">
      {/* Header */}
      <header className="flex-none border-b bg-background/95 backdrop-blur px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src="/images/concierge-avatar.png" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-lg leading-none text-foreground">
              Concierge Service
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 lg:pb-4">
        {/* Welcome Badge */}
        <div className="flex justify-center">
          <span className="bg-muted text-muted-foreground text-xs py-1 px-3 rounded-full">
            Today
          </span>
        </div>

        {messages.map((msg, index) => {
          // CORRECCIÓN 1: Asegurar comparación de IDs
          const isMine = userId === msg.sender_id;
          
          return (
            <div
              key={msg.id}
              className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}
            >
              {!isMine && (
                <Avatar className="h-8 w-8 mr-2 mt-1 hidden sm:flex">
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">CS</AvatarFallback>
                </Avatar>
              )}

              <div
                className={`
                  relative max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm
                  ${isMine 
                    ? "bg-primary text-primary-foreground rounded-tr-none ml-auto" 
                    : "bg-muted text-foreground rounded-tl-none mr-auto"
                  }
                  ${msg.isOptimistic ? "opacity-70" : ""}
                `}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </p>
                <div 
                  className={`text-[10px] mt-1 text-right opacity-70`}
                >
                  {formatTime(msg.created_at)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 bg-background border-t">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-h-[44px]"
            disabled={sending}
            autoFocus
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!newMessage.trim() || sending}
            className="h-11 w-11 rounded-full shrink-0"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5 ml-0.5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
