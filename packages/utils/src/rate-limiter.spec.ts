import { describe, it, expect, vi, beforeEach } from "vitest";

const headerStore = new Map<string, string>();
vi.mock("next/headers", () => ({
  headers: async () => ({ get: (name: string) => headerStore.get(name) ?? null }),
}));

type QueryResult = { count?: number | null; data?: unknown[]; error?: { message: string } | null };
let nextResult: QueryResult = { count: 0, data: [], error: null };
const inserts: unknown[] = [];

function makeQuery() {
  const query: Record<string, unknown> = {};
  for (const method of ["select", "eq", "gte", "order", "limit"]) {
    query[method] = () => query;
  }
  query.then = (resolve: (value: QueryResult) => void) => resolve(nextResult);
  return query;
}

let adminClientAvailable = true;
vi.mock("@genz/database/admin", () => ({
  createAdminClient: () => {
    if (!adminClientAvailable) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    return {
      from: () => ({
        ...makeQuery(),
        insert: async (row: unknown) => {
          inserts.push(row);
          return { error: null };
        },
      }),
    };
  },
}));

import { checkRateLimit, computeBackoff, resolveClientIp, withRateLimit } from "./rate-limiter";

beforeEach(() => {
  headerStore.clear();
  inserts.length = 0;
  nextResult = { count: 0, data: [], error: null };
  adminClientAvailable = true;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("resolveClientIp", () => {
  const from = (h: Record<string, string>) => (name: string) => h[name] ?? null;

  it("ignores a spoofed cf-connecting-ip unless Cloudflare is the trusted proxy", () => {
    const h = { "cf-connecting-ip": "6.6.6.6", "x-forwarded-for": "6.6.6.6, 10.0.0.9" };
    expect(resolveClientIp(from(h), "none")).toBe("10.0.0.9");
    expect(resolveClientIp(from(h), "cloudflare")).toBe("6.6.6.6");
  });

  it("uses the Vercel header on Vercel and the rightmost forwarded hop otherwise", () => {
    expect(resolveClientIp(from({ "x-vercel-forwarded-for": "1.2.3.4" }), "vercel")).toBe("1.2.3.4");
    expect(resolveClientIp(from({ "x-forwarded-for": "evil, 9.9.9.9" }), "none")).toBe("9.9.9.9");
    expect(resolveClientIp(from({}), "none")).toBe("127.0.0.1");
  });
});

describe("computeBackoff", () => {
  const now = Date.parse("2026-10-11T10:00:00Z");
  const at = (secondsAgo: number, isFailed: boolean) => ({
    is_failed: isFailed,
    created_at: new Date(now - secondsAgo * 1000).toISOString(),
  });

  it("returns 0 when the latest attempt succeeded", () => {
    expect(computeBackoff([at(1, false), at(2, true)], now, 2, 300)).toBe(0);
  });

  it("doubles the wait for each consecutive failure, capped at the max", () => {
    // 3 failures => 2 * 2^2 = 8s after the latest failure (1s ago) => 7s left
    expect(computeBackoff([at(1, true), at(5, true), at(9, true)], now, 2, 300)).toBe(7);
    const many = Array.from({ length: 10 }, (_, i) => at(i + 1, true));
    expect(computeBackoff(many, now, 2, 300)).toBe(299);
  });
});

describe("checkRateLimit", () => {
  it("blocks auth requests once the per-IP cap is reached", async () => {
    nextResult = { count: 30, data: [], error: null };
    const result = await checkRateLimit({ endpointType: "auth", actionName: "login" });
    expect(result.blocked).toBe(true);
  });

  it("fails closed for auth when the database errors", async () => {
    nextResult = { count: null, error: { message: "permission denied for table rate_limit_logs" } };
    const result = await checkRateLimit({ endpointType: "auth", actionName: "login", identifier: "a@b.co" });
    expect(result.blocked).toBe(true);
  });

  it("fails closed for auth when no service-role client is configured", async () => {
    adminClientAvailable = false;
    const result = await checkRateLimit({ endpointType: "auth", actionName: "login" });
    expect(result.blocked).toBe(true);
  });

  it("fails open for public endpoints when the database errors", async () => {
    nextResult = { count: null, error: { message: "timeout" } };
    const result = await checkRateLimit({ endpointType: "public", actionName: "search" });
    expect(result.blocked).toBe(false);
  });
});

describe("withRateLimit", () => {
  it("logs every attempt through the service-role client", async () => {
    const result = await withRateLimit({ endpointType: "public", actionName: "newsletter" }, async () => ({
      error: "bad email",
    }));
    expect(result).toEqual({ error: "bad email" });
    expect(inserts).toHaveLength(1);
    expect(inserts[0]).toMatchObject({ action_name: "newsletter", is_failed: true });
  });

  it("does not run the action when blocked", async () => {
    nextResult = { count: 999, data: [], error: null };
    const fn = vi.fn();
    const result = await withRateLimit({ endpointType: "public", actionName: "search" }, fn);
    expect(fn).not.toHaveBeenCalled();
    expect(result).toHaveProperty("error");
  });
});
