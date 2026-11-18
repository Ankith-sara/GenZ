import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env";

let anonClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return anonClient;
}

export function getSupabaseAdminClient(): SupabaseClient {
  if (!adminClient) {
    const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    adminClient = createClient(env.SUPABASE_URL, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return adminClient;
}

