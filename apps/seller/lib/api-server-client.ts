import { GenZApiClient } from "@genz/api-client";
import { createClient } from "@genz/database/server";

export async function getAuthenticatedSellerApiClient(): Promise<GenZApiClient> {
  let token: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token || null;
  } catch {
    // Unauthenticated or SSR error fallback
  }

  const apiUrl =
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:4000";

  return new GenZApiClient({
    baseUrl: apiUrl,
    token,
  });
}

// Convenient alias
export { getAuthenticatedSellerApiClient as getAuthenticatedApiClient };

