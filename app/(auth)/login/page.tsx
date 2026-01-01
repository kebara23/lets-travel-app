"use client";

import React, { useState } from "react";
import { LogIn, Sparkles, ShieldCheck, Compass } from "lucide-react";
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
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-awake-paper">
      <div className="awake-gradient-bar fixed top-0 left-0 right-0" />
      
      <div className="w-full max-w-md space-y-12 text-center animate-in">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-awake-violet rounded-full flex items-center justify-center text-white shadow-2xl">
             <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-serif text-awake-heading italic tracking-tight">
              AWAKE OS
            </h1>
            <p className="text-awake-body/60 font-serif italic text-lg">
              Welcome back to the sanctuary.
            </p>
          </div>
        </div>

        <div className="p-10 awake-card border-none bg-white">
          <form onSubmit={handleLogin} className="space-y-8 text-left">
            <div className="space-y-3">
              <label className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-awake-violet/40 ml-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="soul@awake.cr"
                className="w-full bg-awake-paper/50 border-b border-awake-violet/10 py-3 px-4 focus:border-awake-sunset outline-none transition-all font-sans text-sm"
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-awake-violet/40 ml-1">Secret Key</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-awake-paper/50 border-b border-awake-violet/10 py-3 px-4 focus:border-awake-sunset outline-none transition-all font-sans text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="awake-btn w-full py-4 flex justify-center items-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Enter Sanctuary <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-awake-violet/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-sans font-black uppercase tracking-[0.3em] text-awake-violet/20 bg-white px-4">
              Quick Perspective
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button 
              onClick={() => quickEnter('admin_guardian', '/guardian/dashboard')}
              className="p-4 rounded-sm border border-awake-violet/5 hover:bg-awake-paper transition-all flex flex-col items-center gap-3 group"
             >
                <ShieldCheck className="w-5 h-5 text-awake-violet/40 group-hover:text-awake-violet transition-colors" />
                <span className="text-[10px] font-sans font-black uppercase tracking-widest text-awake-violet/40 group-hover:text-awake-violet">Guardian</span>
             </button>
             <button 
              onClick={() => quickEnter('guest_short', '/short-term/dashboard')}
              className="p-4 rounded-sm border border-awake-violet/5 hover:bg-awake-paper transition-all flex flex-col items-center gap-3 group"
             >
                <Compass className="w-5 h-5 text-awake-violet/40 group-hover:text-awake-sunset transition-colors" />
                <span className="text-[10px] font-sans font-black uppercase tracking-widest text-awake-violet/40 group-hover:text-awake-sunset">Explorer</span>
             </button>
          </div>
        </div>

        <p className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-awake-violet/20">
          Transformational Experiences • Uvita, Costa Rica
        </p>
      </div>
    </div>
  );
}
