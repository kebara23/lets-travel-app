"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConciergeBell, X, AlertTriangle, MessageCircle, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export function ConciergeRing() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isDraggingRef = useRef(false);
  const supabase = createClient();

  // Only show if authenticated and not on public pages
  useEffect(() => {
    const publicRoutes = ["/login", "/signup", "/"];
    
    // Quick check for route first to avoid flicker
    if (publicRoutes.includes(pathname || "")) {
      setIsVisible(false);
      return;
    }

    // Check authentication
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsVisible(!!session);
    }

    checkAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const isPublic = publicRoutes.includes(window.location.pathname);
      if (isPublic) {
        setIsVisible(false);
      } else {
        setIsVisible(!!session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, supabase]);

  const toggleMenu = () => {
    if (!isDraggingRef.current) {
      setIsOpen(!isOpen);
    }
  };

  const handleAction = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  // Don't render anything if not visible
  if (!isVisible) return null;

  return (
    <motion.div 
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 touch-none"
      drag
      dragMomentum={false}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      onDragEnd={() => {
        // Small delay to prevent click from firing immediately after drag
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 100);
      }}
      // Prevent dragging from triggering clicks on children immediately
      onClickCapture={(e) => {
        if (isDraggingRef.current) {
          e.stopPropagation();
        }
      }}
    >
      {/* Satellite Buttons - Appear when menu is open */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* SOS Button (Priority) */}
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-row items-center justify-end gap-3"
            >
              <div className="text-sm font-medium text-slate-900 bg-white px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap pointer-events-none select-none">
                Emergency
              </div>
              <Button
                onClick={() => handleAction("/sos")}
                className="rounded-full h-12 w-12 p-0 bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                <AlertTriangle className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Chat Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="flex flex-row items-center justify-end gap-3"
            >
              <div className="text-sm font-medium text-slate-900 bg-white px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap pointer-events-none select-none">
                Chat
              </div>
              <Button
                onClick={() => handleAction("/messages")}
                className="rounded-full h-12 w-12 p-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Tracker Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="flex flex-row items-center justify-end gap-3"
            >
              <div className="text-sm font-medium text-slate-900 bg-white px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap pointer-events-none select-none">
                Tracker
              </div>
              <Button
                onClick={() => handleAction("/tracking")}
                className="rounded-full h-12 w-12 p-0 bg-slate-600 hover:bg-slate-700 text-white shadow-lg"
              >
                <MapPin className="h-5 w-5" />
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Ring Button */}
      <Button
        onClick={toggleMenu}
        className={`
          rounded-full h-16 w-16 p-0 shadow-2xl transition-all duration-300
          ${isOpen 
            ? "bg-slate-700 hover:bg-slate-800 text-white rotate-45" 
            : "bg-secondary hover:bg-[#b8903a] text-secondary-foreground hover:scale-105"
          }
        `}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <ConciergeBell className="h-8 w-8" />
        )}
      </Button>
    </motion.div>
  );
}
