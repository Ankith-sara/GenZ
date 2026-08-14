export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:4151");

export const SELLER_URL = process.env.NEXT_PUBLIC_SELLER_URL || "http://localhost:4252";

export const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:4353";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
