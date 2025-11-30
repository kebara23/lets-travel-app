"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Send, Search, User as UserIcon, Loader2, MessageSquare } from "lucide-react";

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
};

type Message = {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string | null;
  is_read: boolean;
  created_at: string;
};

export default function AdminMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [adminId, setAdminId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // 1. Auth & Load Clients
  useEffect(() => {
    let isMounted = true;

    async function init() {
      // Check Admin Session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      if (isMounted) setAdminId(session.user.id);

      // Fetch Clients
      try {
        const { data, error } = await supabase
          .from("users") // Assuming a table mirroring auth.users or profiles exists
          .select("id, email, full_name, role")
          .eq("role", "client")
          .order("full_name", { ascending: true });

        if (isMounted) {
          if (error) {
            console.error("Error fetching clients:", error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Could not load client list.",
            });
          } else {
            setUsers(data || []);
          }
          setLoadingUsers(false);
        }
      } catch (err) {
        console.error("Exception fetching users:", err);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [supabase, router, toast]);

  // 1.5. Auto-select chat from URL parameter
  useEffect(() => {
    const chatId = searchParams.get("chatId");
    if (chatId && users.length > 0 && !selectedUser) {
      // Find user with matching ID
      const userToSelect = users.find((user) => user.id === chatId);
      if (userToSelect) {
        console.log("🔔 Auto-selecting chat from URL:", chatId);
        setSelectedUser(userToSelect);
        // Clean up URL parameter (optional)
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete("chatId");
        const newUrl = newSearchParams.toString()
          ? `${window.location.pathname}?${newSearchParams.toString()}`
          : window.location.pathname;
        router.replace(newUrl, { scroll: false });
      }
    }
  }, [searchParams, users, selectedUser, router]);

  // 2. Fetch Messages for Selected User
  useEffect(() => {
    if (!selectedUser || !adminId) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    setLoadingMessages(true);

    async function fetchChat() {
      // Fetch conversation where selected user is sender OR recipient
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${selectedUser?.id},recipient_id.eq.${selectedUser?.id}`)
        .order("created_at", { ascending: false })
        .limit(100);

      if (isMounted) {
        if (error) {
          console.error("Error fetching messages:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load conversation.",
          });
        } else {
          setMessages((data || []).reverse());

          // MARK AS READ: Mark all unread messages from this client as read
          // Only mark messages where:
          // - sender is the selected user (client sent to admin)
          // - recipient_id is null (general inbox) OR recipient_id is adminId
          // - is_read is false
          const unreadMessageIds = (data || [])
            .filter(
              (msg) =>
                msg.sender_id === selectedUser.id &&
                (msg.recipient_id === null || msg.recipient_id === adminId) &&
                msg.is_read === false
            )
            .map((msg) => msg.id);

          if (unreadMessageIds.length > 0) {
            console.log(`📖 Marking ${unreadMessageIds.length} messages as read`);
            const { error: updateError } = await supabase
              .from("messages")
              .update({ is_read: true })
              .in("id", unreadMessageIds);

            if (updateError) {
              console.error("Error marking messages as read:", updateError);
            } else {
              console.log("✅ Messages marked as read successfully");
              // Update local state to reflect read status
              setMessages((prev) =>
                prev.map((msg) =>
                  unreadMessageIds.includes(msg.id)
                    ? { ...msg, is_read: true }
                    : msg
                )
              );
            }
          }
        }
        setLoadingMessages(false);
      }
    }

    fetchChat();

    // 3. Realtime Subscription for this specific chat
    const channel = supabase
      .channel(`chat_${selectedUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          // Filter: Only add if it relates to the CURRENTLY OPEN user
          // (i.e. sender is user, or recipient is user)
          if (
            newMsg.sender_id === selectedUser.id || 
            newMsg.recipient_id === selectedUser.id ||
            (newMsg.sender_id === adminId && newMsg.recipient_id === selectedUser.id) // Admin sent (from another tab?)
          ) {
            setMessages((prev) => [...prev, newMsg]);

            // MARK AS READ: If this is a new message from the client to admin, mark it as read immediately
            if (
              newMsg.sender_id === selectedUser.id &&
              (newMsg.recipient_id === null || newMsg.recipient_id === adminId) &&
              newMsg.is_read === false
            ) {
              console.log("📖 Marking new realtime message as read:", newMsg.id);
              const { error: updateError } = await supabase
                .from("messages")
                .update({ is_read: true })
                .eq("id", newMsg.id);

              if (updateError) {
                console.error("Error marking realtime message as read:", updateError);
              } else {
                // Update local state
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === newMsg.id ? { ...msg, is_read: true } : msg
                  )
                );
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [selectedUser, adminId, supabase, toast]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 4. Send Reply
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !adminId) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage(""); // Optimistic clear

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: adminId,
        content: content,
        recipient_id: selectedUser.id, // Direct reply
      });

      if (error) throw error;
      
      // Realtime handles the UI update
    } catch (error: any) {
      console.error("Error sending reply:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send reply.",
      });
      setNewMessage(content); // Restore
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name: string | null) => {
    return (name || "Guest").slice(0, 2).toUpperCase();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-slate-50">
      {/* Sidebar: User List */}
      <div className="w-80 border-r bg-white flex flex-col hidden md:flex">
        <div className="p-4 border-b">
          <h2 className="font-heading text-lg font-semibold text-slate-800 mb-4">Inbox</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search clients..."
              className="pl-9 bg-slate-50 border-slate-200"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {loadingUsers ? (
              <div className="p-4 text-center text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <span className="text-xs">Loading clients...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                No active clients found.
              </div>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg text-left transition-colors
                    ${selectedUser?.id === user.id 
                      ? "bg-primary/10 border-primary/20 border" 
                      : "hover:bg-slate-100 border border-transparent"
                    }
                  `}
                >
                  <Avatar className="h-10 w-10 border">
                    <AvatarFallback className={selectedUser?.id === user.id ? "bg-primary text-primary-foreground" : "bg-slate-200"}>
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm truncate text-slate-900">
                        {user.full_name || "Unknown User"}
                      </span>
                      {/* Assuming active indicator logic could go here later */}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white md:bg-slate-50/50">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <header className="flex-none bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-slate-200">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(selectedUser.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold text-slate-900 leading-none">
                    {selectedUser.full_name || "Client"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">{selectedUser.email}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-slate-500 bg-slate-50">
                Client
              </Badge>
            </header>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              {loadingMessages ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col h-full items-center justify-center text-slate-400 space-y-2">
                  <MessageSquare className="h-12 w-12 opacity-20" />
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg) => {
                    // CORRECCIÓN 2: Asegurar comparación de IDs para el Admin
                    const isMe = msg.sender_id === adminId;
                    
                    // Debugging Visual (Remove in production)
                    // console.log(`AdminMsg ${msg.id}: AdminID=${adminId}, Sender=${msg.sender_id}, isMe=${isMe}`);

                    return (
                      <div
                        key={msg.id}
                        className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`
                            max-w-[70%] px-4 py-3 rounded-2xl shadow-sm text-sm
                            ${isMe 
                              ? "bg-primary text-primary-foreground rounded-tr-none ml-auto" 
                              : "bg-white text-slate-800 rounded-tl-none border mr-auto"
                            }
                          `}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                          <div className={`text-[10px] mt-1 text-right ${isMe ? "opacity-70" : "text-slate-400"}`}>
                            {formatTime(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="flex-none p-4 bg-white border-t">
              <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Reply to ${selectedUser.full_name}...`}
                  className="flex-1"
                  disabled={sending}
                  autoFocus
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || sending}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </>
        ) : (
          /* Empty State (No user selected) */
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <UserIcon className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-700">Select a conversation</h3>
            <p className="text-sm">Choose a client from the sidebar to view messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}
