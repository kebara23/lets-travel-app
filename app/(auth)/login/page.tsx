"use client";

import React, { useState } from "react";
import { LogIn, Sparkles } from "lucide-react";
import { useUserStore } from "@/store/use-user-store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setLoading, isLoading } = useUserStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulating login for architecture demonstration
    console.log("Logging in with:", email);
    setTimeout(() => {
        setLoading(false);
        // In a real app, this would use supabase.auth.signInWithPassword
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
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
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-sm font-medium text-primary/70 ml-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@awake.com"
                className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                required
              />
            </div>
            
            <div className="space-y-2 text-left">
              <label className="text-sm font-medium text-primary/70 ml-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                required
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
        </div>

        {/* Footer Info */}
        <p className="text-xs text-primary/40 pt-4">
          Powered by AWAKE. For high-end hospitality partners.
        </p>
      </div>
    </div>
  );
}

