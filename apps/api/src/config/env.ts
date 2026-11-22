import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Load environment variables with fallback resolution across monorepo locations
const potentialEnvPaths = [
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "../../.env.local"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(process.cwd(), "../../.env.local"),
  path.resolve(process.cwd(), "apps/web/.env.local"),
  path.resolve(process.cwd(), "../web/.env.local"),
];

for (const envPath of potentialEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}
dotenv.config();

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

// Zod Schema for Environment Variables
const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  CORS_ORIGIN: z
    .array(z.string())
    .default([
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:4151",
    ]),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(): AppEnv {
  const nodeEnv = (process.env.NODE_ENV || "development") as
    "development" | "production" | "test";

  const rawPort = process.env.API_PORT || process.env.PORT || "4000";
  const rawHost = process.env.API_HOST || process.env.HOST || "0.0.0.0";
  const rawSupabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawAnonKey =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const rawServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const rawKeyId =
    process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET;
  const rawWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const rawCors = process.env.CORS_ORIGIN;

  const corsOrigins = rawCors
    ? rawCors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:4151",
      ];

  // In production, strictly enforce no missing or placeholder credentials
  if (nodeEnv === "production") {
    const errors: string[] = [];

    if (!rawSupabaseUrl || isPlaceholder(rawSupabaseUrl)) {
      errors.push("SUPABASE_URL is missing or contains placeholder values");
    }
    if (!rawAnonKey || isPlaceholder(rawAnonKey)) {
      errors.push("SUPABASE_ANON_KEY is missing or contains placeholder values");
    }
    if (!rawServiceRoleKey || isPlaceholder(rawServiceRoleKey)) {
      errors.push(
        "SUPABASE_SERVICE_ROLE_KEY is missing or contains placeholder values"
      );
    }
    if (!rawKeyId || isPlaceholder(rawKeyId)) {
      errors.push("RAZORPAY_KEY_ID is missing or contains placeholder values");
    }
    if (!rawKeySecret || isPlaceholder(rawKeySecret)) {
      errors.push("RAZORPAY_KEY_SECRET is missing or contains placeholder values");
    }
    if (!rawWebhookSecret || isPlaceholder(rawWebhookSecret)) {
      errors.push("RAZORPAY_WEBHOOK_SECRET is missing or contains placeholder values");
    }
    if (
      !rawCors ||
      corsOrigins.length === 0 ||
      corsOrigins.some((origin) => origin.includes("localhost"))
    ) {
      errors.push(
        "CORS_ORIGIN must be explicitly set to production domains (localhost not allowed in production)"
      );
    }

    if (errors.length > 0) {
      throw new Error(
        `[CRITICAL] Production Environment Startup Check Failed:\n  - ${errors.join("\n  - ")}`
      );
    }
  }

  const parsed = envSchema.safeParse({
    PORT: rawPort,
    HOST: rawHost,
    NODE_ENV: nodeEnv,
    SUPABASE_URL:
      rawSupabaseUrl ||
      (nodeEnv === "test" ? "https://test.supabase.co" : "http://127.0.0.1:54321"),
    SUPABASE_ANON_KEY:
      rawAnonKey || (nodeEnv === "test" ? "test-anon-key" : "dev-anon-key"),
    SUPABASE_SERVICE_ROLE_KEY: rawServiceRoleKey,
    CORS_ORIGIN: corsOrigins,
    RAZORPAY_KEY_ID: rawKeyId,
    RAZORPAY_KEY_SECRET: rawKeySecret,
    RAZORPAY_WEBHOOK_SECRET: rawWebhookSecret,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${JSON.stringify(parsed.error.format())}`
    );
  }

  return parsed.data;
}

export const env = loadEnv();
