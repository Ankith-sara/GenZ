import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@genz/types";

/**
 * Supabase client for use in Server Components, Route Handlers, and
 * Server Actions. Must be created fresh on every request.
 */
export async function createClient(customCookieName?: string) {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder";
  const cookieName =
    customCookieName || process.env.NEXT_PUBLIC_COOKIE_NAME || "sb-genz-auth-token";

  return createServerClient<Database>(url, key, {
    cookieOptions: {
      name: cookieName,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Can be ignored if middleware handles session refresh
        }
      },
    },
  });
}

export * from "./admin";
export * from "./auth";
export * from "./authorization";
