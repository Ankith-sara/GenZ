import dotenv from "dotenv";
import path from "path";
import fs from "fs";

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

export interface AppEnv {
  PORT: number;
  HOST: string;
  NODE_ENV: "development" | "production" | "test";
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  CORS_ORIGIN: string[];
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
}

export function loadEnv(): AppEnv {
  const port = parseInt(process.env.API_PORT || process.env.PORT || "4000", 10);
  const host = process.env.API_HOST || process.env.HOST || "0.0.0.0";
  const nodeEnv = (process.env.NODE_ENV || "development") as AppEnv["NODE_ENV"];

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://example.supabase.co";

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "dummy-anon-key";

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const rawCors =
    process.env.CORS_ORIGIN ||
    "http://localhost:3000,http://localhost:4151,http://localhost:3001,http://localhost:3002";
  const corsOrigins = rawCors
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    PORT: isNaN(port) ? 4000 : port,
    HOST: host,
    NODE_ENV: nodeEnv,
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,
    SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
    CORS_ORIGIN: corsOrigins,
    RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  };
}

export const env = loadEnv();

