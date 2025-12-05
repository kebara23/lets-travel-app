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
import { Send, Search, User as UserIcon, Loader2, MessageSquare, Mail, MailOpen, MoreVertical, ArrowLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
  sender?: {
    full_name: string | null;
    email: string;
  };
};

type MessageListItem = {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string | null;
  is_read: boolean;
  created_at: string;
  sender_name: string;
  sender_email: string;
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
  const [messageList, setMessageList] = useState<MessageListItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMessageList, setLoadingMessageList] = useState(true);
  const [sending, setSending] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "chat">("list");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 1. Auth & Load Clients & Message List
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
          .from("users")
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

      // Fetch Message List (all messages to admin or general inbox)
      if (isMounted && session) {
        fetchMessageList(session.user.id);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [supabase, router, toast]);

  // Fetch all messages for the inbox list
  async function fetchMessageList(adminId: string) {
    try {
      setLoadingMessageList(true);
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          content,
          sender_id,
          recipient_id,
          is_read,
          created_at,
          sender:users!sender_id (
            full_name,
            email
          )
        `)
        .or(`recipient_id.is.null,recipient_id.eq.${adminId}`)
        .neq("sender_id", adminId) // Exclude messages sent by admin
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Transform data for list view
      const transformedMessages = (data || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        recipient_id: msg.recipient_id,
        is_read: msg.is_read,
        created_at: msg.created_at,
        sender_name: msg.sender?.full_name || "Unknown",
        sender_email: msg.sender?.email || "",
      }));

      // Sort: unread first, then by date
      const sorted = transformedMessages.sort((a, b) => {
        if (a.is_read !== b.is_read) {
          return a.is_read ? 1 : -1; // Unread first
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setMessageList(sorted);
    } catch (error: any) {
      console.error("Error fetching message list:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load messages.",
      });
    } finally {
      setLoadingMessageList(false);
    }
  }

  // Toggle read/unread status
  async function toggleReadStatus(messageId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: !currentStatus })
        .eq("id", messageId);

      if (error) throw error;

      // Update local state
      setMessageList((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, is_read: !currentStatus } : msg
        )
      );

      // Also update chat messages if open
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, is_read: !currentStatus } : msg
        )
      );

      toast({
        title: currentStatus ? "Marked as Unread" : "Marked as Read",
        description: "Message status updated.",
      });

      // Re-fetch to maintain sort order
      if (adminId) {
        fetchMessageList(adminId);
      }
    } catch (error: any) {
      console.error("Error toggling read status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update message status.",
      });
    }
  }

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
              // Also update message list
              setMessageList((prev) =>
                prev.map((msg) =>
                  unreadMessageIds.includes(msg.id)
                    ? { ...msg, is_read: true }
                    : msg
                )
              );
              // Re-fetch to maintain sort order
              if (adminId) {
                fetchMessageList(adminId);
              }
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
                // Also update message list
                setMessageList((prev) =>
                  prev.map((msg) =>
                    msg.id === newMsg.id ? { ...msg, is_read: true } : msg
                  )
                );
                // Re-fetch to maintain sort order
                if (adminId) {
                  fetchMessageList(adminId);
                }
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

  // Render Conversation List Component (reusable)
  const renderConversationList = () => (
    <div className="w-full md:w-80 border-r bg-white flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-heading text-lg font-semibold text-slate-800 mb-4">Inbox</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search messages..."
            className="pl-9 bg-slate-50 border-slate-200"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="flex flex-col p-2">
          {loadingMessageList ? (
            <div className="p-4 text-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <span className="text-xs">Loading messages...</span>
            </div>
          ) : messageList.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">
              No messages found.
            </div>
          ) : (
            messageList.map((msg) => {
              const isUnread = !msg.is_read;
              const senderUser = users.find((u) => u.id === msg.sender_id);
              
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "group relative flex items-start gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer border",
                    isUnread
                      ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                      : "bg-white border-transparent hover:bg-slate-50",
                    selectedUser?.id === msg.sender_id && "bg-primary/5 border-primary/20"
                  )}
                  onClick={() => {
                    if (senderUser) {
                      setSelectedUser(senderUser);
                      setViewMode("chat");
                    }
                  }}
                >
                  <Avatar className="h-10 w-10 border shrink-0">
                    <AvatarFallback className={isUnread ? "bg-blue-200 text-blue-700" : "bg-slate-200"}>
                      {getInitials(senderUser?.full_name || msg.sender_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              "text-sm truncate",
                              isUnread ? "font-bold text-slate-900" : "font-medium text-slate-700"
                            )}
                          >
                            {senderUser?.full_name || msg.sender_name}
                          </span>
                          {isUnread && (
                            <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </div>
                        <p
                          className={cn(
                            "text-xs truncate mb-1",
                            isUnread ? "text-slate-700 font-medium" : "text-slate-500"
                          )}
                        >
                          {msg.sender_email}
                        </p>
                        <p
                          className={cn(
                            "text-sm line-clamp-2",
                            isUnread ? "text-slate-800 font-medium" : "text-slate-600"
                          )}
                        >
                          {msg.content}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleReadStatus(msg.id, msg.is_read);
                            }}
                            className="font-body"
                          >
                            {msg.is_read ? (
                              <>
                                <Mail className="h-4 w-4 mr-2" />
                                Mark as Unread
                              </>
                            ) : (
                              <>
                                <MailOpen className="h-4 w-4 mr-2" />
                                Mark as Read
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-slate-50 relative">
      {/* Conversation List */}
      {/* Mobile: Show only when no conversation selected */}
      {/* Desktop: Always show (side-by-side) */}
      {(!isMobile || !selectedUser) && (
        <div className={cn(
          "w-full md:w-80",
          isMobile && selectedUser ? "hidden" : "flex"
        )}>
          {renderConversationList()}
        </div>
      )}

      {/* Main Chat Area */}
      {/* Mobile: Show only when conversation selected */}
      {/* Desktop: Always show (side-by-side) */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 bg-white md:bg-slate-50/50",
        selectedUser ? "flex" : "hidden md:flex"
      )}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <header className="flex-none bg-white border-b px-4 md:px-6 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                {/* Back Button - Mobile Only */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedUser(null)}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
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
          /* Empty State (No user selected) - Desktop Only */
          !isMobile && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-700">Select a conversation</h3>
              <p className="text-sm">Choose a client from the sidebar to view messages.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
