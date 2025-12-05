"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Initialize Supabase client only on client side
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    let isMounted = true;
    
    try {
      const client = createClient();
      
      // Verify client is properly initialized
      if (!client) {
        throw new Error("Failed to create Supabase client");
      }
      
      if (isMounted) {
        setSupabase(client);
      }
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error);
      if (isMounted) {
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: error instanceof Error ? error.message : "Supabase is not configured. Please check your environment variables.",
        });
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [toast]);

  // Check if user is already logged in (non-blocking)
  // Add a small delay to allow signOut to complete if user was just logged out
  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;
    const currentSupabase = supabase;

    async function checkSession() {
      try {
        // Small delay to allow signOut to complete if user was just logged out
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isMounted) return;
        
        const {
          data: { session },
        } = await currentSupabase.auth.getSession();

        if (isMounted && session) {
          // User is already logged in, redirect to dashboard
          router.push("/dashboard");
        }
      } catch (error) {
        // If there's an error checking session, just show the login form
        if (isMounted) {
          console.error("Error checking session:", error);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Validate form before submission
  const validateForm = (data: LoginFormValues): boolean => {
    if (!data.email || !data.email.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter your email address.",
      });
      return false;
    }

    if (!data.password || !data.password.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter your password.",
      });
      return false;
    }

    if (data.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Password must be at least 6 characters long.",
      });
      return false;
    }

    return true;
  };

  async function onSubmit(data: LoginFormValues) {
    console.log("🚀 onSubmit called with data:", { email: data.email, passwordLength: data.password?.length });
    
    // Validate form data
    if (!validateForm(data)) {
      console.log("❌ Form validation failed");
      return;
    }

    if (!supabase) {
      console.error("❌ Supabase client not initialized");
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Supabase client is not initialized. Please refresh the page.",
      });
      return;
    }
    
    console.log("✅ Starting login process...");
    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      if (error) {
        console.error("Login error:", error);
        
        // Provide more specific error messages
        let errorMessage = "Invalid email or password. Please try again.";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please verify your email address before signing in.";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Too many login attempts. Please wait a moment and try again.";
        } else if (error.status === 400) {
          errorMessage = "Invalid request. Please check your email and password format.";
        } else {
          errorMessage = error.message || errorMessage;
        }
        
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: errorMessage,
        });
        setIsLoading(false);
        return;
      }

      // Check if we got a session
      if (!authData?.session) {
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: "No session was created. Please try again.",
        });
        setIsLoading(false);
        return;
      }

      // Get current user to check role
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get user information.",
        });
        return;
      }

      // DEBUGGING: Log user info
      console.log("========== LOGIN DEBUG ==========");
      console.log("🔐 Usuario Autenticado:", user.id);
      console.log("📧 Email del Usuario:", user.email);
      console.log("================================");

      // Get user role from database for role-based redirect
      let profile = null;
      try {
        console.log("🔍 Consultando perfil en BD para user.id:", user.id);
        
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        // DEBUGGING: Log profile data (EXACTLY as requested)
        console.log("========== PERFIL BD ==========");
        console.log("Usuario Autenticado:", user.id);
        console.log("Perfil BD:", profile || data);
        console.log("Error BD:", error);
        console.log("================================");

        if (error) {
          console.error("❌ ERROR DETECTADO al obtener perfil:");
          console.error("   Error code:", error.code);
          console.error("   Error message:", error.message);
          console.error("   Error details:", error.details);
          console.error("   Error hint:", error.hint);
          
          // If user doesn't exist in users table, try to get role from user_metadata
          if (error.code === "PGRST116") {
            console.warn("⚠️ Usuario no encontrado en tabla 'users'. Verificando user_metadata...");
            const roleFromMetadata = user.user_metadata?.role;
            console.log("   Role desde metadata:", roleFromMetadata);
            
            if (roleFromMetadata === "admin") {
              console.log("✅ Rol 'admin' encontrado en metadata. Redirigiendo a /admin");
              toast({
                title: "Welcome back!",
                description: "You have been successfully logged in.",
              });
              router.push("/admin");
              setIsLoading(false);
              return;
            }
          }
          
          // Default to dashboard if role fetch fails
          profile = null;
        } else {
          profile = data;
          console.log("✅ Perfil cargado exitosamente:", profile);
          console.log("🔑 Rol obtenido:", profile?.role);
        }
      } catch (error) {
        console.error("💥 EXCEPTION al obtener rol:", error);
        profile = null;
      }

      // FAILSAFE: Email-based admin detection (backup validation)
      const emailIsAdmin = user.email?.toLowerCase().includes("admin") || false;
      const dbIsAdmin = profile?.role === "admin";
      const isAdmin = dbIsAdmin || emailIsAdmin;

      // DEBUGGING: Log redirect decision BEFORE toast
      console.log("========== REDIRECCIÓN ==========");
      console.log("   Profile completo:", profile);
      console.log("   Role extraído:", profile?.role);
      console.log("   Tipo de role:", typeof profile?.role);
      console.log("   Email del usuario:", user.email);
      console.log("   Email contiene 'admin':", emailIsAdmin);
      console.log("   DB dice que es admin:", dbIsAdmin);
      console.log("   DECISIÓN FINAL (DB || Email):", isAdmin);
      console.log("================================");

      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });

      // Redirect based on role (DB check OR email failsafe)
      if (isAdmin) {
        console.log("➡️ REDIRIGIENDO A /admin");
        console.log("   Razón:", dbIsAdmin ? "Rol 'admin' en BD" : "Email contiene 'admin' (failsafe)");
        router.push("/admin");
      } else {
        console.log("➡️ REDIRIGIENDO A /dashboard (Cliente)");
        console.log("   Razón: profile?.role =", profile?.role, "| Email admin =", emailIsAdmin);
        router.push("/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Desktop: Split Screen - Left Side (Image) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        </div>
      </div>

      {/* Right Side: Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-background min-h-screen pb-24 lg:pb-8">
        {/* Mobile: Card with shadow and border */}
        <Card className="w-full max-w-md lg:shadow-none lg:border-0 lg:bg-transparent shadow-xl border-luxury/20 bg-card relative z-0">
          <CardHeader className="space-y-1 text-center lg:text-left">
            <CardTitle className="font-heading text-4xl lg:text-5xl text-primary mb-2">
              Welcome back
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base font-body">
              Enter your details to access your itinerary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="space-y-6 w-full"
                noValidate
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-foreground font-body">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          {...field}
                          disabled={isLoading}
                          className="h-11 w-full bg-background text-foreground border-input"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-foreground font-body">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          disabled={isLoading}
                          className="h-11 w-full bg-background text-foreground border-input"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className={cn(
                    "w-full h-12 min-h-[48px]",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90 active:bg-primary/80 active:scale-[0.98]",
                    "transition-all duration-200",
                    "font-body font-semibold text-base",
                    "touch-manipulation", // Optimize touch handling
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "relative z-10" // Ensure button is above other elements
                  )}
                  disabled={isLoading}
                  onClick={(e) => {
                    // Debug logging for mobile
                    console.log("📱 Button clicked:", {
                      isLoading,
                      formValid: form.formState.isValid,
                      formErrors: form.formState.errors,
                      email: form.getValues("email"),
                      passwordLength: form.getValues("password")?.length,
                      supabaseReady: !!supabase
                    });
                    
                    // If form is not valid but has values, try to submit anyway
                    // This helps with mobile touch events that might not trigger form validation properly
                    if (!isLoading && supabase) {
                      const values = form.getValues();
                      if (values.email && values.password) {
                        console.log("📱 Attempting direct submission with values");
                        // Trigger form submission directly
                        onSubmit(values).catch((error) => {
                          console.error("📱 Direct submission error:", error);
                        });
                      }
                    }
                  }}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

