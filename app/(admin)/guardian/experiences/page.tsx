"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Sparkles,
  ChevronRight,
  Wind,
  Coffee,
  MapPin,
  Moon,
  Zap,
  Bell,
  Megaphone,
  X,
  Waves
} from "lucide-react";
import { AdminNavigation } from "@/components/shared/admin-navigation";
import { cn } from "@/lib/utils";
import { useUserStore, ItineraryItem, Announcement } from "@/store/use-user-store";

const ICON_MAP: any = { Wind, Coffee, MapPin, Moon, Zap, Sparkles, Waves };

type TabType = 'events' | 'announcements';

export default function ExperienceManagerPage() {
  const { 
    mockItinerary, addItineraryItem, removeItineraryItem,
    mockAnnouncements, addAnnouncement, removeAnnouncement
  } = useUserStore();
  
  const [activeTab, setActivePillar] = useState<TabType>('events');
  const [isAdding, setIsAdding] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form States
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("Ceremony");
  const [eventTime, setEventTime] = useState("08:00");
  const [eventIcon, setEventIcon] = useState("Wind");

  const [announcementTitle, setAnnTitle] = useState("");
  const [announcementContent, setAnnContent] = useState("");
  const [announcementType, setAnnType] = useState<Announcement['type']>('general');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const [h, m] = eventTime.split(':');
    const ampm = parseInt(h) >= 12 ? 'PM' : 'AM';
    const h12 = parseInt(h) % 12 || 12;
    
    addItineraryItem({
      id: `EV-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      title: eventTitle,
      type: eventType,
      time: `${h12}:${m} ${ampm}`,
      icon: eventIcon,
      completed: false
    });
    resetForms();
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    addAnnouncement({
      id: `AN-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      title: announcementTitle,
      content: announcementContent,
      type: announcementType,
      created_at: new Date().toISOString()
    });
    resetForms();
  };

  const resetForms = () => {
    setIsAdding(false);
    setEventTitle("");
    setAnnTitle("");
    setAnnContent("");
  };

  return (
    <div className="min-h-screen bg-awake-bone flex">
      <AdminNavigation />
      
      <main className="flex-1 px-6 lg:pl-40 lg:pr-12 py-10 lg:py-20 animate-in pb-32">
        
        {/* Ceremonial Header */}
        <header className="mb-16 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <Calendar className="w-5 h-5 text-awake-gold animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-awake-moss/30">Experience & Pulse Manager</p>
            </div>
            <h1 className="text-4xl lg:text-6xl font-serif text-awake-moss italic leading-tight">Curating the Sanctuary</h1>
            <p className="text-xl font-serif italic text-awake-moss/40 leading-relaxed max-w-2xl">
              Designing the rhythm of the day and broadcasting the pulse of our community.
            </p>
          </div>

          <button 
            onClick={() => setIsAdding(true)}
            className="awake-btn flex items-center gap-3 pr-10 shadow-awake-floating hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" /> {activeTab === 'events' ? 'New Event' : 'New Pulse'}
          </button>
        </header>

        {/* Pillar Tabs */}
        <div className="flex gap-12 border-b border-stone-200/50 pb-4 mb-12">
          {[
            { id: 'events', label: 'Daily Journey', icon: Wind, count: mockItinerary.length },
            { id: 'announcements', label: 'Village Pulse', icon: Megaphone, count: mockAnnouncements.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => { setActivePillar(tab.id as TabType); setIsAdding(false); }}
                className={cn(
                  "flex items-center gap-4 pb-4 transition-all duration-700 relative group",
                  isActive ? "text-awake-moss" : "text-awake-moss/30 hover:text-awake-moss/50"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                <span className="text-sm font-sans font-black uppercase tracking-[0.2em]">{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-awake-moss animate-in fade-in" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content View */}
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          
          {activeTab === 'events' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mockItinerary.map((item) => {
                const Icon = ICON_MAP[item.icon || "Wind"] || Wind;
                return (
                  <div key={item.id} className="awake-card p-8 bg-white/60 backdrop-blur-sm border border-stone-200/50 hover:bg-white hover:shadow-awake-floating transition-all duration-700 group flex justify-between items-center">
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 rounded-3xl bg-awake-bone flex items-center justify-center text-awake-moss/30 group-hover:text-awake-moss group-hover:bg-awake-sage/10 transition-all duration-700">
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black uppercase tracking-widest text-awake-gold">{item.time}</span>
                           <span className="text-awake-moss/10 text-xs">•</span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">{item.type}</span>
                        </div>
                        <h3 className="text-2xl font-serif text-awake-moss italic leading-tight">{item.title}</h3>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeItineraryItem(item.id)}
                      className="p-4 text-awake-moss/10 hover:text-awake-terracotta transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              {mockAnnouncements.map((ann) => (
                <div key={ann.id} className="awake-card p-10 bg-white/60 backdrop-blur-sm border border-stone-200/50 hover:bg-white hover:shadow-awake-floating transition-all duration-700 group flex justify-between items-start">
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center gap-4">
                       <span className={cn(
                         "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                         ann.type === 'emergency' ? "bg-awake-terracotta text-white" : "bg-awake-gold/10 text-awake-gold"
                       )}>
                         {ann.type}
                       </span>
                       <span className="text-[9px] font-black uppercase tracking-widest text-awake-moss/20">Broadcasted: {new Date(ann.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-4xl font-serif text-awake-moss italic leading-tight">{ann.title}</h3>
                    <p className="text-serif text-awake-moss/60 leading-relaxed text-lg italic">
                      "{ann.content}"
                    </p>
                  </div>
                  <button 
                    onClick={() => removeAnnouncement(ann.id)}
                    className="p-4 text-awake-moss/10 hover:text-awake-terracotta transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty States */}
          {((activeTab === 'events' && mockItinerary.length === 0) || (activeTab === 'announcements' && mockAnnouncements.length === 0)) && (
            <div className="py-32 text-center space-y-6">
               <Sparkles className="w-16 h-16 text-awake-sage/20 mx-auto animate-pulse" />
               <p className="text-2xl font-serif italic text-awake-moss/30">The sanctuary is in silent observation.</p>
            </div>
          )}
        </div>

        {/* Modal Dispatcher for Events/Announcements */}
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-6 animate-in fade-in bg-awake-bone/40 backdrop-blur-xl">
            <div className="awake-card w-full lg:max-w-2xl bg-white overflow-hidden shadow-awake-floating rounded-t-4xl lg:rounded-4xl animate-in slide-in-from-bottom duration-500">
              
              <form onSubmit={activeTab === 'events' ? handleAddEvent : handleAddAnnouncement} className="flex flex-col h-full">
                <header className="p-6 lg:p-10 border-b border-stone-100 flex justify-between items-center bg-awake-bone/20">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-serif text-awake-moss italic">{activeTab === 'events' ? 'Design Journey' : 'Broadcast Pulse'}</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-awake-moss/30">Guardian Intent</p>
                  </div>
                  <button type="button" onClick={() => setIsAdding(false)} className="p-4 text-awake-moss/20 hover:text-awake-moss transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </header>

                <div className="p-6 lg:p-10 space-y-8 flex-1 overflow-y-auto max-h-[60vh] no-scrollbar">
                  
                  {activeTab === 'events' ? (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Event Title</label>
                        <input required type="text" value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="e.g. Ancestral Sound Healing" className="w-full bg-awake-bone/40 border border-stone-200/50 rounded-2xl p-5 text-awake-moss font-serif italic text-xl focus:outline-none focus:ring-4 focus:ring-awake-gold/5 transition-all" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Intent Category</label>
                          <select value={eventType} onChange={e => setEventType(e.target.value)} className="w-full bg-awake-bone/40 border border-stone-200/50 rounded-2xl p-5 text-awake-moss font-sans focus:outline-none transition-all">
                            <option>Ceremony</option>
                            <option>Wellness</option>
                            <option>Nourishment</option>
                            <option>Connection</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Time Anchor</label>
                          <input required type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} className="w-full bg-awake-bone/40 border border-stone-200/50 rounded-2xl p-5 text-awake-moss font-sans focus:outline-none transition-all" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Visual Resonance (Icon)</label>
                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                          {Object.keys(ICON_MAP).map(iconName => {
                            const Icon = ICON_MAP[iconName];
                            return (
                              <button key={iconName} type="button" onClick={() => setEventIcon(iconName)} className={cn("p-5 rounded-2xl transition-all duration-500 border min-w-[64px]", eventIcon === iconName ? "bg-awake-moss text-white border-awake-moss shadow-lg" : "bg-awake-bone/40 border-stone-100 text-awake-moss/20 hover:text-awake-moss/40")}>
                                <Icon className="w-6 h-6 mx-auto" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Pulse Title</label>
                        <input required type="text" value={announcementTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="e.g. Garden Mycelium Update" className="w-full bg-awake-bone/40 border border-stone-200/50 rounded-2xl p-5 text-awake-moss font-serif italic text-xl focus:outline-none focus:ring-4 focus:ring-awake-gold/5 transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Broadcast Message</label>
                        <textarea required value={announcementContent} onChange={e => setAnnContent(e.target.value)} placeholder="Describe the pulse..." rows={4} className="w-full bg-awake-bone/40 border border-stone-200/50 rounded-2xl p-5 text-awake-moss font-sans text-sm focus:outline-none focus:ring-4 focus:ring-awake-gold/5 transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-awake-moss/30">Pulse Urgency</label>
                        <div className="grid grid-cols-3 gap-4">
                          {['general', 'ceremony', 'emergency'].map(type => (
                            <button key={type} type="button" onClick={() => setAnnType(type as any)} className={cn("p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all duration-500", announcementType === type ? "bg-awake-moss text-white shadow-lg" : "bg-awake-bone/40 border-stone-100 text-awake-moss/20")}>
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <footer className="p-6 lg:p-10 border-t border-stone-100 bg-white">
                  <button type="submit" className="awake-btn w-full flex items-center justify-center gap-4 text-white shadow-awake-floating bg-awake-moss hover:bg-awake-moss/90 py-6 rounded-full font-black uppercase tracking-[0.4em] text-xs">
                    {activeTab === 'events' ? 'Manifest Experience' : 'Broadcast to Village'} <ChevronRight className="w-4 h-4" />
                  </button>
                </footer>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
