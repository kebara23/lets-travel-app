"use client";

import React, { useState } from "react";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus, 
  Calendar, 
  MapPin,
  Sparkles,
  Users
} from "lucide-react";
import { ResidentNavigation } from "@/components/shared/resident-navigation";
import { cn } from "@/lib/utils";

const MOCK_POSTS = [
  {
    id: "1",
    author: "Elena M.",
    role: "Resident",
    content: "Just hosted a small wine tasting at the Sky Lounge. Thanks to everyone who came! 🍷",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1000",
    likes: 24,
    comments: 8,
    time: "2h ago"
  },
  {
    id: "2",
    author: "Awake Wellness",
    role: "Official",
    content: "New Yoga class starting tomorrow at 7:00 AM. Who's joining? 🙏",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000",
    likes: 56,
    comments: 12,
    time: "4h ago"
  }
];

const UPCOMING_EVENTS = [
  { id: "e1", title: "Sunset BBQ", date: "Tomorrow, 6PM", attendees: 14, type: "Community" },
  { id: "e2", title: "Tech Meetup", date: "Friday, 10AM", attendees: 8, type: "Professional" },
  { id: "e3", title: "Wine Tasting", date: "Saturday, 8PM", attendees: 22, type: "Gastronomy" },
];

export default function CommunityPage() {
  const [posts] = useState(MOCK_POSTS);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background pb-32 pt-12 px-6 lg:max-w-2xl lg:mx-auto relative">
      {/* Event Booking Modal Simulation */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div 
            className="absolute inset-0 bg-primary/20 backdrop-blur-md"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
             <div className="w-12 h-1 bg-primary/10 rounded-full mx-auto mb-8 sm:hidden" />
             <div className="flex justify-between items-start mb-6">
                <div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-accent mb-1 block">
                      Booking Event
                   </span>
                   <h2 className="text-3xl font-light text-primary">{selectedEvent.title}</h2>
                </div>
                <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                   <Calendar className="w-6 h-6" />
                </div>
             </div>
             
             <div className="space-y-6 mb-10">
                <div className="flex gap-4">
                   <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-primary/5">
                      <p className="text-[9px] font-bold text-primary/30 uppercase tracking-widest mb-1">Date</p>
                      <p className="text-sm font-bold">{selectedEvent.date}</p>
                   </div>
                   <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-primary/5">
                      <p className="text-[9px] font-bold text-primary/30 uppercase tracking-widest mb-1">Going</p>
                      <p className="text-sm font-bold">{selectedEvent.attendees} Residents</p>
                   </div>
                </div>
                <p className="text-sm text-primary/60 leading-relaxed italic">
                   "Join us for an evening of connection and high-end gastronomy. Every moment is designed to be invisible and profound."
                </p>
             </div>

             <button 
              onClick={() => setSelectedEvent(null)}
              className="w-full py-5 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all"
             >
                Confirm Attendance
             </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-light text-primary tracking-tight">Community</h1>
          <p className="text-primary/40 font-medium">Life at Awake Residentia</p>
        </div>
        <button className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all">
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {/* Community Pulse (Stories-like) */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar mb-8 pb-2">
         <div className="flex flex-col items-center gap-2 min-w-[70px]">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center">
               <Plus className="text-primary/40 w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40">You</span>
         </div>
         {[1,2,3,4,5].map(i => (
           <div key={i} className="flex flex-col items-center gap-2 min-w-[70px]">
              <div className="w-16 h-16 rounded-full border-2 border-accent p-0.5">
                 <div className="w-full h-full rounded-full bg-slate-200" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Resident</span>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Events Quick-View */}
        <section className="space-y-4">
           <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-accent" /> Upcoming
              </h2>
              <span className="text-xs text-accent font-bold uppercase tracking-widest">View All</span>
           </div>
           <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {UPCOMING_EVENTS.map(event => (
                <div 
                  key={event.id} 
                  onClick={() => setSelectedEvent(event)}
                  className="luxury-card p-4 min-w-[200px] space-y-3 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                >
                   <div className="flex justify-between items-start">
                      <div className="p-2 bg-primary/5 rounded-xl text-primary">
                         <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-primary/40 uppercase tracking-tighter">
                         <Users className="w-3 h-3" /> {event.attendees}
                      </div>
                   </div>
                   <div>
                      <h4 className="font-bold text-primary">{event.title}</h4>
                      <p className="text-xs text-primary/40 font-medium">{event.date}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Community Feed */}
        <section className="space-y-6">
           <h2 className="text-lg font-bold text-primary">The Hive</h2>
           {posts.map(post => (
             <article key={post.id} className="luxury-card overflow-hidden">
                {/* Author Info */}
                <div className="p-4 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200" />
                      <div>
                         <p className="text-sm font-bold text-primary">{post.author}</p>
                         <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{post.role}</p>
                      </div>
                   </div>
                   <span className="text-[10px] text-primary/30 font-bold uppercase">{post.time}</span>
                </div>

                {/* Content */}
                <div className="px-4 pb-4">
                   <p className="text-sm text-primary/80 leading-relaxed italic mb-4">
                      "{post.content}"
                   </p>
                </div>

                {/* Media */}
                <div className="h-64 bg-slate-100 relative">
                   <img 
                    src={post.image} 
                    alt="Post media" 
                    className="w-full h-full object-cover"
                   />
                </div>

                {/* Actions */}
                <div className="p-4 flex items-center gap-6 border-t border-slate-50">
                   <button className="flex items-center gap-1.5 text-xs font-bold text-primary/40 hover:text-red-400 transition-colors">
                      <Heart className="w-5 h-5" /> {post.likes}
                   </button>
                   <button className="flex items-center gap-1.5 text-xs font-bold text-primary/40 hover:text-primary transition-colors">
                      <MessageCircle className="w-5 h-5" /> {post.comments}
                   </button>
                   <button className="flex items-center gap-1.5 text-xs font-bold text-primary/40 ml-auto">
                      <Share2 className="w-5 h-5" />
                   </button>
                </div>
             </article>
           ))}
        </section>
      </div>

      <ResidentNavigation />
    </div>
  );
}


