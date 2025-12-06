import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isServer = typeof window === "undefined";

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isServer) {
      console.warn(
        "[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is undefined during build. Using empty fallbacks so the build can continue."
      );
      return createBrowserClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
    }

    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  if (!supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://")) {
    throw new Error(
      `Invalid Supabase URL: "${supabaseUrl}". Must be a valid HTTP or HTTPS URL.`
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

