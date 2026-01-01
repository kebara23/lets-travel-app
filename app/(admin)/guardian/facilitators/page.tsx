"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  UserPlus,
  Star,
  Check,
  X
} from "lucide-react";
import { AdminNavigation } from "@/components/shared/admin-navigation";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/use-user-store";

export default function CircleOfFacilitatorsPage() {
  const { mockUsers, toggleEventLeader } = useUserStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredUsers = mockUsers.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const eventLeaders = mockUsers.filter(u => u.is_event_leader);

  return (
    <div className="min-h-screen bg-awake-bone flex">
      <AdminNavigation />

      <main className="flex-1 px-6 lg:pl-40 lg:pr-12 py-10 lg:py-20 animate-in pb-32">
        
        {/* Ceremonial Header */}
        <header className="mb-16 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <Star className="w-5 h-5 text-awake-gold animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-awake-moss/30">Permissions & Presence</p>
            </div>
            <h1 className="text-4xl lg:text-6xl font-serif text-awake-moss italic leading-tight">Circle of Facilitators</h1>
            <p className="text-xl font-serif italic text-awake-moss/40 leading-relaxed max-w-2xl">
              Granting the sacred duty of event curation to the souls ready to lead.
            </p>
          </div>

          <div className="awake-card px-8 py-4 flex items-center gap-4 bg-white/40 border-stone-200/30">
             <div className="text-right">
                <p className="text-2xl font-serif italic text-awake-moss leading-none">{eventLeaders.length}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-awake-moss/30">Active Leaders</p>
             </div>
             <div className="w-12 h-12 rounded-full bg-awake-gold/10 flex items-center justify-center text-awake-gold">
                <ShieldCheck className="w-6 h-6" />
             </div>
          </div>
        </header>

        {/* Search & Filter */}
        <div className="mb-12 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-awake-moss/20 group-focus-within:text-awake-sage transition-colors" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/40 backdrop-blur-sm border border-stone-200/50 rounded-full py-5 pl-14 pr-6 text-sm font-sans text-awake-moss placeholder:text-awake-moss/20 focus:outline-none focus:ring-4 focus:ring-awake-sage/5 transition-all"
          />
        </div>

        {/* The Roster */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredUsers.map((user) => (
            <div 
              key={user.id}
              className={cn(
                "awake-card p-8 transition-all duration-700 relative overflow-hidden group",
                user.is_event_leader 
                  ? "bg-white border-awake-gold/30 shadow-awake-floating ring-2 ring-awake-gold/5" 
                  : "bg-white/40 border-stone-200/50 hover:bg-white/60"
              )}
            >
              {user.is_event_leader && (
                <div className="absolute top-0 right-0 p-4">
                   <Sparkles className="w-4 h-4 text-awake-gold animate-pulse" />
                </div>
              )}

              <div className="flex items-center gap-6 mb-8">
                 <div className="relative">
                    <img 
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=random`} 
                      alt={user.full_name || ""} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-awake-bone shadow-md"
                    />
                    {user.is_event_leader && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-awake-gold rounded-full flex items-center justify-center text-white border-2 border-white">
                         <Star className="w-3 h-3 fill-current" />
                      </div>
                    )}
                 </div>
                 <div>
                    <h3 className="text-xl font-serif text-awake-moss italic leading-tight">{user.full_name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-awake-moss/20 mt-1">{user.role}</p>
                    <p className="text-[10px] font-medium text-awake-moss/40 lowercase mt-0.5">{user.email}</p>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-stone-100/50">
                 <span className={cn(
                   "text-[9px] font-black uppercase tracking-widest transition-colors",
                   user.is_event_leader ? "text-awake-gold" : "text-awake-moss/20"
                 )}>
                   {user.is_event_leader ? "Event Facilitator" : "Awaiting Initiation"}
                 </span>
                 
                 {/* Organic Toggle Switch */}
                 <button
                   onClick={() => toggleEventLeader(user.id)}
                   className={cn(
                     "relative w-14 h-7 rounded-full transition-all duration-700 p-1 flex items-center",
                     user.is_event_leader ? "bg-awake-gold shadow-inner" : "bg-awake-bone border border-stone-200"
                   )}
                 >
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-white shadow-md transition-all duration-700 transform flex items-center justify-center",
                      user.is_event_leader ? "translate-x-7" : "translate-x-0"
                    )}>
                      {user.is_event_leader ? (
                        <Check className="w-3 h-3 text-awake-gold" />
                      ) : (
                        <X className="w-3 h-3 text-awake-moss/20" />
                      )}
                    </div>
                 </button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="col-span-full py-32 text-center space-y-6">
               <Users className="w-16 h-16 text-awake-moss/10 mx-auto" />
               <p className="text-2xl font-serif italic text-awake-moss/30">No souls found in the current vibration.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
