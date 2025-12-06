"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
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
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { nanoid } from "nanoid";

// Common countries list with ISO codes
const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "PA", name: "Panama", flag: "🇵🇦" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
].sort((a, b) => a.name.localeCompare(b.name));

const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  country: z.string().length(2, "Please select a country"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

// Function to remove accents and special characters
function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");
}

// Generate readable username: FirstNameLastNameCOUNTRY + random 3 digits
function generateUsername(firstName: string, lastName: string, countryCode: string): string {
  const cleanFirst = removeAccents(firstName);
  const cleanLast = removeAccents(lastName);
  const randomDigits = Math.floor(100 + Math.random() * 900); // 3 digits
  return `${cleanFirst}${cleanLast}${countryCode.toUpperCase()}${randomDigits}`;
}

// Generate internal code: LTS-XXXXXX
function generateInternalCode(): string {
  const code = nanoid(6).toUpperCase();
  return `LTS-${code}`;
}

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Initialize Supabase client only on client side
  useEffect(() => {
    let isMounted = true;
    let redirectTimeout: NodeJS.Timeout | null = null;

    try {
      const client = createClient();
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
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [toast]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      country: "",
      phone: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignupFormValues) {
    if (!supabase) return;

    setIsLoading(true);
    try {
      // Generate double identity
      const generatedUsername = generateUsername(data.firstName, data.lastName, data.country);
      const internalCode = generateInternalCode();
      const fullName = `${data.firstName} ${data.lastName}`;

      // Register in Supabase Auth with all metadata
      // The database trigger will automatically create the user profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: fullName,
            username: generatedUsername,
            country_code: data.country,
            phone: data.phone,
            internal_code: internalCode,
          },
        },
      });

      if (authError) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: authError.message || "Failed to create account. Please try again.",
        });
        return;
      }

      if (!authData.user) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: "User was not created. Please try again.",
        });
        return;
      }

      // Wait a moment for the trigger to create the user profile
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get user role from database for role-based redirect
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      toast({
        title: "Account created!",
        description: "Welcome! Redirecting...",
      });

      // Redirect based on role with cleanup
      const redirectTimeout = setTimeout(() => {
        if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }, 1000);

      // Store timeout for cleanup (handled by component unmount)
      return () => {
        clearTimeout(redirectTimeout);
      };
    } catch (error) {
      console.error("Error during signup:", error);
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-background min-h-screen">
        {/* Mobile: Card with shadow and border */}
        <Card className="w-full max-w-md lg:shadow-none lg:border-0 lg:bg-transparent shadow-xl border-luxury/20 bg-card">
          <CardHeader className="space-y-1 text-center lg:text-left">
            <CardTitle className="font-heading text-4xl lg:text-5xl text-primary mb-2">
              Create Account
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base font-body">
              Join us for an exclusive travel experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-foreground font-body">First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John"
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
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-foreground font-body">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Doe"
                            {...field}
                            disabled={isLoading}
                            className="h-11 w-full bg-background text-foreground border-input"
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-foreground font-body">Country</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={isLoading}
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select a country</option>
                          {COUNTRIES.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.flag} {country.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-foreground font-body">Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          {...field}
                          international
                          defaultCountry="US"
                          disabled={isLoading}
                          className="h-11 w-full"
                          numberInputProps={{
                            className:
                              "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

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
                      <p className="text-xs text-muted-foreground font-body">
                        Must be at least 8 characters with uppercase, lowercase, and number
                      </p>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 hover:brightness-110 transition-all duration-200 font-body"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

