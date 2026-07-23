import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    const realIp = headerList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  } catch (e) {
    console.error("Failed to read headers for IP:", e);
  }
  return "127.0.0.1";
}

function handleDbError(
  err: { code?: string; message?: string } | null | undefined,
  label: string
) {
  if (err?.code === "PGRST205" || err?.message?.includes("rate_limit_logs")) {
    // Table not yet migrated in database — fail open silently without error spam
    return;
  }
  console.error(`${label}:`, err);
}

// Config thresholds
const AUTH_IP_MAX = Number(process.env.RATE_LIMIT_AUTH_IP_MAX || "30");
const AUTH_IP_WINDOW = Number(process.env.RATE_LIMIT_AUTH_IP_WINDOW || "600"); // 10 mins
const AUTH_ACCOUNT_MAX = Number(process.env.RATE_LIMIT_AUTH_ACCOUNT_MAX || "5");
const AUTH_ACCOUNT_WINDOW = Number(process.env.RATE_LIMIT_AUTH_ACCOUNT_WINDOW || "600"); // 10 mins
const AUTH_BACKOFF_BASE = Number(process.env.RATE_LIMIT_AUTH_BACKOFF_BASE || "2"); // 2 seconds
const AUTH_BACKOFF_MAX = Number(process.env.RATE_LIMIT_AUTH_BACKOFF_MAX || "300"); // 5 mins

const PUBLIC_IP_MAX = Number(process.env.RATE_LIMIT_PUBLIC_IP_MAX || "60");
const PUBLIC_IP_WINDOW = Number(process.env.RATE_LIMIT_PUBLIC_IP_WINDOW || "60"); // 1 min

const USER_MAX = Number(process.env.RATE_LIMIT_USER_MAX || "200");
const USER_WINDOW = Number(process.env.RATE_LIMIT_USER_WINDOW || "60"); // 1 min

export interface RateLimitCheckResult {
  blocked: boolean;
  error?: string;
  retryAfterSeconds?: number;
}

export async function checkRateLimit(options: {
  endpointType: "auth" | "public" | "user";
  actionName: string;
  identifier?: string; // e.g. email or userId
}): Promise<RateLimitCheckResult> {
  const ip = await getClientIp();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;
  const now = new Date();

  // 1. Authenticated User Rate Limiting
  if (options.endpointType === "user") {
    const userId = options.identifier;
    if (!userId) {
      return { blocked: false };
    }
    const windowStart = new Date(now.getTime() - USER_WINDOW * 1000).toISOString();

    // Count attempts in the window
    const { count, error } = await supabase
      .from("rate_limit_logs")
      .select("id", { count: "exact", head: true })
      .eq("endpoint_type", "user")
      .eq("identifier", userId)
      .gte("created_at", windowStart);

    if (error) {
      handleDbError(error, "Rate limiter user check db error");
      return { blocked: false }; // Fail-open
    }

    if (count !== null && count >= USER_MAX) {
      return {
        blocked: true,
        error: "Too many actions. Please slow down.",
        retryAfterSeconds: USER_WINDOW,
      };
    }
    return { blocked: false };
  }

  // 2. Public Route Rate Limiting
  if (options.endpointType === "public") {
    const windowStart = new Date(now.getTime() - PUBLIC_IP_WINDOW * 1000).toISOString();

    const { count, error } = await supabase
      .from("rate_limit_logs")
      .select("id", { count: "exact", head: true })
      .eq("endpoint_type", "public")
      .eq("ip_address", ip)
      .gte("created_at", windowStart);

    if (error) {
      handleDbError(error, "Rate limiter public check db error");
      return { blocked: false }; // Fail-open
    }

    if (count !== null && count >= PUBLIC_IP_MAX) {
      return {
        blocked: true,
        error: "Too many requests. Please try again in a minute.",
        retryAfterSeconds: PUBLIC_IP_WINDOW,
      };
    }
    return { blocked: false };
  }

  // 3. Authentication Route Rate Limiting (Strictest)
  // Per-IP threshold check
  const ipWindowStart = new Date(now.getTime() - AUTH_IP_WINDOW * 1000).toISOString();
  const { count: ipCount, error: ipErr } = await supabase
    .from("rate_limit_logs")
    .select("id", { count: "exact", head: true })
    .eq("endpoint_type", "auth")
    .eq("ip_address", ip)
    .gte("created_at", ipWindowStart);

  if (ipErr) {
    handleDbError(ipErr, "Rate limiter IP check db error");
  } else if (ipCount !== null && ipCount >= AUTH_IP_MAX) {
    return {
      blocked: true,
      error: "Too many login attempts from this IP address. Please try again later.",
      retryAfterSeconds: AUTH_IP_WINDOW,
    };
  }

  // Per-Account threshold check
  if (options.identifier) {
    const accountWindowStart = new Date(
      now.getTime() - AUTH_ACCOUNT_WINDOW * 1000
    ).toISOString();
    const { count: accountCount, error: accountErr } = await supabase
      .from("rate_limit_logs")
      .select("id", { count: "exact", head: true })
      .eq("endpoint_type", "auth")
      .eq("identifier", options.identifier)
      .gte("created_at", accountWindowStart);

    if (accountErr) {
      handleDbError(accountErr, "Rate limiter account check db error");
    } else if (accountCount !== null && accountCount >= AUTH_ACCOUNT_MAX) {
      return {
        blocked: true,
        error: "Too many attempts for this account. Please try again later.",
        retryAfterSeconds: AUTH_ACCOUNT_WINDOW,
      };
    }
  }

  // Exponential backoff check (per IP & per account combined)
  let query = supabase
    .from("rate_limit_logs")
    .select("is_failed, created_at")
    .eq("endpoint_type", "auth")
    .eq("action_name", options.actionName);

  if (options.identifier) {
    query = query.or(`ip_address.eq.${ip},identifier.eq.${options.identifier}`);
  } else {
    query = query.eq("ip_address", ip);
  }

  const { data: logs, error: logsErr } = await query
    .order("created_at", { ascending: false })
    .limit(10);

  if (logsErr) {
    handleDbError(logsErr, "Rate limiter backoff logs db error");
    return { blocked: false };
  }

  if (logs && logs.length > 0) {
    let consecutiveFailures = 0;
    for (const log of logs) {
      if (log.is_failed) {
        consecutiveFailures++;
      } else {
        break;
      }
    }

    if (consecutiveFailures > 0) {
      const delaySeconds = Math.min(
        AUTH_BACKOFF_BASE * Math.pow(2, consecutiveFailures - 1),
        AUTH_BACKOFF_MAX
      );

      const lastFailureTime = new Date(logs[0].created_at).getTime();
      const nextAllowedTime = lastFailureTime + delaySeconds * 1000;
      const remainingMs = nextAllowedTime - now.getTime();

      if (remainingMs > 0) {
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        return {
          blocked: true,
          error: `Too many failed attempts. Please wait ${remainingSeconds} second(s) before trying again.`,
          retryAfterSeconds: remainingSeconds,
        };
      }
    }
  }

  return { blocked: false };
}

export async function logRateLimitAttempt(options: {
  endpointType: "auth" | "public" | "user";
  actionName: string;
  identifier?: string;
  isFailed?: boolean;
}) {
  try {
    const ip = await getClientIp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;
    const { error } = await supabase.from("rate_limit_logs").insert({
      ip_address: ip,
      identifier: options.identifier || null,
      endpoint_type: options.endpointType,
      action_name: options.actionName,
      is_failed: options.isFailed ?? false,
    });
    if (error) {
      handleDbError(error, "Failed to log rate limit attempt");
    }
  } catch {
    // Fail silent
  }
}
