import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import type { Database } from "@genz/types";

/**
 * Supabase client for use in Client Components ("use client").
 * Employs safe fallback environment values to allow Next.js static prerendering without build failures.
 */
export function createBrowserClient(customCookieName?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder";
  const cookieName =
    customCookieName || process.env.NEXT_PUBLIC_COOKIE_NAME || "sb-genz-auth-token";

  return createSupabaseBrowserClient<Database>(url, key, {
    cookieOptions: {
      name: cookieName,
    },
  });
}

export function createClient(customCookieName?: string) {
  return createBrowserClient(customCookieName);
}
