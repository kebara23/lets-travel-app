"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Search, 
  MoreVertical, 
  ArrowLeft,
  Circle,
  Sparkles
} from "lucide-react";
import { ResidentNavigation } from "@/components/shared/resident-navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/use-user-store";

const MOCK_CHATS = [
  { id: "1", name: "Sky Lounge Residents", lastMsg: "See you there at 8!", time: "10:24 AM", online: true, type: "group" },
  { id: "2", name: "Elena M.", lastMsg: "The wine tasting was amazing.", time: "Yesterday", online: true, type: "direct" },
  { id: "3", name: "Awake Concierge", lastMsg: "Your massage is confirmed.", time: "Yesterday", online: false, type: "service" },
];

const MOCK_MESSAGES = [
  { id: "m1", sender_id: "other", text: "Hey! Are you coming to the sunset BBQ tonight?", time: "05:15 PM" },
  { id: "m2", sender_id: "me", text: "Definitely! Should I bring anything?", time: "05:20 PM" },
  { id: "m3", sender_id: "other", text: "Just your good vibes. We have everything else covered.", time: "05:21 PM" },
];

export default function ResidentChatPage() {
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useUserStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedChat]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      id: Date.now().toString(),
      sender_id: "me",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, msg]);
    setNewMessage("");
    // In real app: supabase.from('messages').insert(...)
  };

  if (selectedChat) {
    return (
      <div className="flex flex-col h-screen bg-background lg:max-w-md lg:mx-auto border-x border-primary/5">
        {/* Chat Header */}
        <header className="p-6 bg-white border-b border-primary/5 flex items-center gap-4">
          <button onClick={() => setSelectedChat(null)}>
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-slate-200" />
            {selectedChat.online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-primary">{selectedChat.name}</h2>
            <p className="text-[10px] uppercase font-bold text-primary/40 tracking-widest">
              {selectedChat.online ? "Online Now" : "Recently Active"}
            </p>
          </div>
          <MoreVertical className="w-5 h-5 text-primary/30" />
        </header>

        {/* Messages Flow */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50/30"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[80%]",
                msg.sender_id === "me" ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm font-medium shadow-sm",
                msg.sender_id === "me" 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-white text-primary rounded-tl-none border border-primary/5"
              )}>
                {msg.text}
              </div>
              <span className="text-[9px] font-bold text-primary/30 mt-1 uppercase">
                {msg.time}
              </span>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <form 
          onSubmit={sendMessage}
          className="p-6 bg-white border-t border-primary/5 flex items-center gap-4"
        >
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-primary/10 transition-all"
          />
          <button 
            type="submit"
            className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 pt-12 px-6 lg:max-w-md lg:mx-auto">
      <header className="mb-8 space-y-1">
        <h1 className="text-4xl font-light text-primary">Messages</h1>
        <p className="text-primary/40 font-medium">Connect with the Hive.</p>
      </header>

      {/* Search & Tabs */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20 w-5 h-5" />
        <input 
          type="text"
          placeholder="Search residents or groups..."
          className="w-full bg-white/50 border border-primary/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {/* Online Now Row */}
      <div className="mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 mb-4">Online Residents</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
           <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border-2 border-dashed border-accent/30 flex items-center justify-center text-accent">
                 <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-tighter text-primary/40">Status</span>
           </div>
           {[1,2,3,4,5].map(i => (
             <div key={i} className="flex flex-col items-center gap-2 min-w-[56px]">
                <div className="relative">
                   <div className="w-14 h-14 rounded-2xl bg-slate-200" />
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-tighter text-primary/40">Alex K.</span>
             </div>
           ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="space-y-4">
        {MOCK_CHATS.map((chat) => (
          <button 
            key={chat.id}
            onClick={() => setSelectedChat(chat)}
            className="w-full luxury-card p-4 flex items-center gap-4 text-left active:scale-[0.98] transition-all"
          >
            <div className="relative">
               <div className="w-12 h-12 rounded-2xl bg-slate-200" />
               {chat.online && (
                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
               )}
            </div>
            <div className="flex-1 min-w-0">
               <div className="flex justify-between items-start mb-0.5">
                  <h4 className="font-bold text-primary truncate">{chat.name}</h4>
                  <span className="text-[9px] font-bold text-primary/30 uppercase">{chat.time}</span>
               </div>
               <p className="text-xs text-primary/50 truncate pr-4">{chat.lastMsg}</p>
            </div>
          </button>
        ))}
      </div>

      <ResidentNavigation />
    </div>
  );
}



