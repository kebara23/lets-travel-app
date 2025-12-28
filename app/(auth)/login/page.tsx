"use client";

import React, { useState } from "react";
import { LogIn, Sparkles, ShieldCheck } from "lucide-react";
import { useUserStore, DUMMY_USER } from "@/store/use-user-store";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setLoading, isLoading, setUser } = useUserStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate login logic
    setTimeout(() => {
        setUser(DUMMY_USER);
        setLoading(false);
        router.push("/guardian/dashboard");
    }, 1000);
  };

  const quickEnter = (role: any, path: string) => {
    setUser({ ...DUMMY_USER, role });
    router.push(path);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-background">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Brand Logo / Header */}
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-white shadow-xl">
             <Sparkles className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-4xl font-light tracking-tight text-primary font-geist">
            AWAKE OS
          </h1>
          <p className="text-primary/60 font-light">
            Welcome back. Experience invisible technology.
          </p>
        </div>

        {/* Luxury Login Card */}
        <div className="p-8 luxury-card">
          <form onSubmit={handleLogin} className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary/70 ml-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@awake.com"
                className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary/70 ml-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Quick Access Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest text-primary/20 font-bold bg-[#F5EFE6] px-2">
              Simulation Mode
            </div>
          </div>

          {/* Direct Access Buttons */}
          <div className="grid grid-cols-2 gap-3">
             <button 
              onClick={() => quickEnter('admin_guardian', '/guardian/dashboard')}
              className="p-3 rounded-xl border border-primary/5 bg-white/30 hover:bg-white text-[10px] font-bold uppercase tracking-tight text-primary/60 transition-all flex flex-col items-center gap-2"
             >
                <ShieldCheck className="w-4 h-4 text-blue-500" /> Manager
             </button>
             <button 
              onClick={() => quickEnter('guest_short', '/short-term/dashboard')}
              className="p-3 rounded-xl border border-primary/5 bg-white/30 hover:bg-white text-[10px] font-bold uppercase tracking-tight text-primary/60 transition-all flex flex-col items-center gap-2"
             >
                <Sparkles className="w-4 h-4 text-accent" /> Guest
             </button>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-xs text-primary/40 pt-4">
          Powered by AWAKE. No database required for this demo.
        </p>
      </div>
    </div>
  );
}
