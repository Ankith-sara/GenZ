import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@genz/database/admin";

/**
 * Database-backed rate limiter for server actions and route handlers.
 *
 * - Reads and writes `rate_limit_logs` with the service-role client. The table
 *   has no end-user INSERT policy (migration 0019), so the user-scoped client
 *   silently failed every write and every check counted zero.
 * - Fails CLOSED for `auth` endpoints (login, OTP, password reset) when the
 *   limiter cannot reach the database, and fails open with a loud error for
 *   `public` / `user` endpoints so an outage does not take the site down.
 */

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export type EndpointType = "auth" | "public" | "user";

export interface RateLimitCheckResult {
  blocked: boolean;
  error?: string;
  retryAfterSeconds?: number;
}

export interface RateLimitOptions {
  endpointType: EndpointType;
  actionName: string;
  identifier?: string;
}

const AUTH_IP_MAX = Number(process.env.RATE_LIMIT_AUTH_IP_MAX || "30");
const AUTH_IP_WINDOW = Number(process.env.RATE_LIMIT_AUTH_IP_WINDOW || "600");
const AUTH_ACCOUNT_MAX = Number(process.env.RATE_LIMIT_AUTH_ACCOUNT_MAX || "5");
const AUTH_ACCOUNT_WINDOW = Number(process.env.RATE_LIMIT_AUTH_ACCOUNT_WINDOW || "600");
const AUTH_BACKOFF_BASE = Number(process.env.RATE_LIMIT_AUTH_BACKOFF_BASE || "2");
const AUTH_BACKOFF_MAX = Number(process.env.RATE_LIMIT_AUTH_BACKOFF_MAX || "300");

const PUBLIC_IP_MAX = Number(process.env.RATE_LIMIT_PUBLIC_IP_MAX || "60");
const PUBLIC_IP_WINDOW = Number(process.env.RATE_LIMIT_PUBLIC_IP_WINDOW || "60");

const USER_MAX = Number(process.env.RATE_LIMIT_USER_MAX || "200");
const USER_WINDOW = Number(process.env.RATE_LIMIT_USER_WINDOW || "60");

const UNAVAILABLE_ERROR =
  "We couldn't verify this request right now. Please try again in a moment.";

/**
 * Resolves the client IP from headers set by the platform in front of the app.
 * Client-supplied headers are only honoured when a proxy is configured to set
 * them, via RATE_LIMIT_TRUSTED_PROXY = "vercel" | "cloudflare" | "none".
 * Defaults to "vercel" when running on Vercel, otherwise "none".
 */
export function resolveClientIp(
  get: (name: string) => string | null,
  trustedProxy = process.env.RATE_LIMIT_TRUSTED_PROXY || (process.env.VERCEL ? "vercel" : "none")
): string {
  if (trustedProxy === "cloudflare") {
    const cfIp = get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();
  }

  if (trustedProxy === "vercel") {
    const vercelIp = get("x-vercel-forwarded-for") || get("x-real-ip");
    if (vercelIp) return vercelIp.split(",")[0].trim();
  }

  // The rightmost entry is appended by the nearest proxy; leftmost entries are
  // client-controlled and must not be used for limiting.
  const forwarded = get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded
      .split(",")
      .map((ip) => ip.trim())
      .filter(Boolean);
    if (ips.length > 0) return ips[ips.length - 1];
  }

  return "127.0.0.1";
}

export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    return resolveClientIp((name) => headerList.get(name));
  } catch (e) {
    console.error("[RATE_LIMIT] Failed to read headers for IP:", e);
    return "127.0.0.1";
  }
}

function reportDbError(err: { message?: string } | null | undefined, label: string) {
  console.error(
    IS_PRODUCTION ? `[RATE_LIMIT_DEGRADED] ${label}: ${err?.message ?? err}` : `${label}:`,
    IS_PRODUCTION ? "" : err
  );
}

/** Exponential backoff after consecutive failures, newest log first. */
export function computeBackoff(
  logs: { is_failed: boolean; created_at: string }[],
  nowMs: number,
  base = AUTH_BACKOFF_BASE,
  max = AUTH_BACKOFF_MAX
): number {
  let consecutiveFailures = 0;
  for (const log of logs) {
    if (!log.is_failed) break;
    consecutiveFailures++;
  }
  if (consecutiveFailures === 0) return 0;

  const delaySeconds = Math.min(base * Math.pow(2, consecutiveFailures - 1), max);
  const nextAllowed = new Date(logs[0].created_at).getTime() + delaySeconds * 1000;
  const remainingMs = nextAllowed - nowMs;
  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
}

type AdminClient = ReturnType<typeof createAdminClient>;

async function countSince(
  supabase: AdminClient,
  filters: Record<string, string>,
  windowSeconds: number,
  nowMs: number
) {
  let query = supabase
    .from("rate_limit_logs")
    .select("id", { count: "exact", head: true })
    .gte("created_at", new Date(nowMs - windowSeconds * 1000).toISOString());
  for (const [column, value] of Object.entries(filters)) {
    query = query.eq(column, value);
  }
  return query;
}

export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitCheckResult> {
  const failClosed = options.endpointType === "auth";
  const unavailable: RateLimitCheckResult = failClosed
    ? { blocked: true, error: UNAVAILABLE_ERROR, retryAfterSeconds: 30 }
    : { blocked: false };

  let supabase: AdminClient;
  try {
    supabase = createAdminClient();
  } catch (err) {
    reportDbError(err as Error, "Rate limiter has no service-role client");
    return unavailable;
  }

  const ip = await getClientIp();
  const nowMs = Date.now();

  if (options.endpointType === "user") {
    if (!options.identifier) return { blocked: false };
    const { count, error } = await countSince(
      supabase,
      { endpoint_type: "user", identifier: options.identifier },
      USER_WINDOW,
      nowMs
    );
    if (error) {
      reportDbError(error, "Rate limiter user check failed");
      return unavailable;
    }
    return (count ?? 0) >= USER_MAX
      ? { blocked: true, error: "Too many actions. Please slow down.", retryAfterSeconds: USER_WINDOW }
      : { blocked: false };
  }

  if (options.endpointType === "public") {
    const { count, error } = await countSince(
      supabase,
      { endpoint_type: "public", ip_address: ip },
      PUBLIC_IP_WINDOW,
      nowMs
    );
    if (error) {
      reportDbError(error, "Rate limiter public check failed");
      return unavailable;
    }
    return (count ?? 0) >= PUBLIC_IP_MAX
      ? {
          blocked: true,
          error: "Too many requests. Please try again in a minute.",
          retryAfterSeconds: PUBLIC_IP_WINDOW,
        }
      : { blocked: false };
  }

  // --- auth: per-IP cap, per-account cap, then exponential backoff ---
  const ipCheck = await countSince(
    supabase,
    { endpoint_type: "auth", ip_address: ip },
    AUTH_IP_WINDOW,
    nowMs
  );
  if (ipCheck.error) {
    reportDbError(ipCheck.error, "Rate limiter auth IP check failed");
    return unavailable;
  }
  if ((ipCheck.count ?? 0) >= AUTH_IP_MAX) {
    return {
      blocked: true,
      error: "Too many login attempts from this IP address. Please try again later.",
      retryAfterSeconds: AUTH_IP_WINDOW,
    };
  }

  if (options.identifier) {
    const accountCheck = await countSince(
      supabase,
      { endpoint_type: "auth", identifier: options.identifier },
      AUTH_ACCOUNT_WINDOW,
      nowMs
    );
    if (accountCheck.error) {
      reportDbError(accountCheck.error, "Rate limiter auth account check failed");
      return unavailable;
    }
    if ((accountCheck.count ?? 0) >= AUTH_ACCOUNT_MAX) {
      return {
        blocked: true,
        error: "Too many attempts for this account. Please try again later.",
        retryAfterSeconds: AUTH_ACCOUNT_WINDOW,
      };
    }
  }

  // Two parameterised queries instead of an interpolated `.or()` filter, which
  // let commas or parentheses in an email inject extra PostgREST conditions.
  const recentFor = (column: "ip_address" | "identifier", value: string) =>
    supabase
      .from("rate_limit_logs")
      .select("is_failed, created_at")
      .eq("endpoint_type", "auth")
      .eq("action_name", options.actionName)
      .eq(column, value)
      .order("created_at", { ascending: false })
      .limit(10);

  const results = await Promise.all([
    recentFor("ip_address", ip),
    options.identifier ? recentFor("identifier", options.identifier) : null,
  ]);
  const failed = results.find((r) => r?.error);
  if (failed?.error) {
    reportDbError(failed.error, "Rate limiter backoff lookup failed");
    return unavailable;
  }

  const logs = results
    .flatMap((r) => r?.data ?? [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  const waitSeconds = computeBackoff(logs, nowMs);
  if (waitSeconds > 0) {
    return {
      blocked: true,
      error: `Too many failed attempts. Please wait ${waitSeconds} second(s) before trying again.`,
      retryAfterSeconds: waitSeconds,
    };
  }

  return { blocked: false };
}

export async function logRateLimitAttempt(options: RateLimitOptions & { isFailed?: boolean }) {
  try {
    const ip = await getClientIp();
    const supabase = createAdminClient();
    const { error } = await supabase.from("rate_limit_logs").insert({
      ip_address: ip,
      identifier: options.identifier || null,
      endpoint_type: options.endpointType,
      action_name: options.actionName,
      is_failed: options.isFailed ?? false,
    });
    if (error) reportDbError(error, "Failed to log rate limit attempt");
  } catch (err) {
    reportDbError(err as Error, "Failed to log rate limit attempt");
  }
}

function isNextRedirectError(err: unknown): boolean {
  if (typeof err === "object" && err !== null) {
    const digest = (err as { digest?: string }).digest;
    if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
      return true;
    }
  }
  return err instanceof Error && err.message.includes("NEXT_REDIRECT");
}

export async function withRateLimit<T>(
  options: RateLimitOptions | (() => Promise<RateLimitOptions>),
  fn: () => Promise<T>
): Promise<T | { error: string }> {
  const resolvedOptions = typeof options === "function" ? await options() : options;

  const rateLimit = await checkRateLimit(resolvedOptions);
  if (rateLimit.blocked) {
    return {
      error: rateLimit.error || "Too many requests. Please try again later.",
    } as T | { error: string };
  }

  try {
    const result = await fn();
    const isFailed =
      typeof result === "object" &&
      result !== null &&
      "error" in result &&
      Boolean((result as { error?: unknown }).error);

    await logRateLimitAttempt({ ...resolvedOptions, isFailed });
    return result;
  } catch (err: unknown) {
    await logRateLimitAttempt({ ...resolvedOptions, isFailed: !isNextRedirectError(err) });
    throw err;
  }
}
