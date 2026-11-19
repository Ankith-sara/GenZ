import { z } from "zod";

const isPlaceholder = (val?: string | null): boolean => {
  if (!val) return true;
  const lower = val.toLowerCase().trim();
  return (
    lower.includes("placeholder") ||
    lower.includes("example.supabase.co") ||
    lower.includes("dummy") ||
    lower.includes("51abcdefghijkl") ||
    lower === "pending" ||
    lower === "todo"
  );
};

export const sellerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  API_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
});

export function validateSellerEnv() {
  const nodeEnv = process.env.NODE_ENV || "development";

  if (nodeEnv === "production") {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.API_URL ||
      process.env.API_INTERNAL_URL;

    const errors: string[] = [];
    if (!supabaseUrl || isPlaceholder(supabaseUrl)) {
      errors.push("NEXT_PUBLIC_SUPABASE_URL is missing or a placeholder");
    }
    if (!anonKey || isPlaceholder(anonKey)) {
      errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or a placeholder");
    }
    if (!apiUrl || isPlaceholder(apiUrl) || apiUrl.includes("localhost")) {
      errors.push(
        "API_URL / NEXT_PUBLIC_API_URL must be a real production URL (localhost not allowed in production)"
      );
    }

    if (errors.length > 0) {
      throw new Error(
        `[CRITICAL] Seller App Production Environment Validation Failed:\n  - ${errors.join("\n  - ")}`
      );
    }
  }

  return {
    NODE_ENV: nodeEnv,
    SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      (nodeEnv === "test" ? "https://test.supabase.co" : "http://127.0.0.1:54321"),
    SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      (nodeEnv === "test" ? "test-anon-key" : "dev-anon-key"),
    API_URL:
      process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://127.0.0.1:4000",
  };
}

export const env = validateSellerEnv();
