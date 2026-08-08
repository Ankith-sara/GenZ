import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkRateLimit, logRateLimitAttempt, getClientIp } from "@/lib/rate-limiter";

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: (key: string) => {
      if (key === "x-forwarded-for") return "192.168.1.100, 10.0.0.1";
      if (key === "x-real-ip") return "192.168.1.100";
      return null;
    },
  }),
}));

const mockInsert = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockImplementation(() =>
    Promise.resolve({
      from: mockFrom,
    })
  ),
}));

describe("Rate Limiter Utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getClientIp", () => {
    it("extracts client IP from x-forwarded-for header", async () => {
      const ip = await getClientIp();
      expect(ip).toBe("192.168.1.100");
    });
  });

  describe("checkRateLimit - User Endpoint", () => {
    it("returns blocked: false when identifier is missing for user endpoint", async () => {
      const result = await checkRateLimit({
        endpointType: "user",
        actionName: "test_action",
      });
      expect(result).toEqual({ blocked: false });
    });

    it("returns blocked: false when user count is below max limit", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockResolvedValue({ count: 5, error: null }),
            }),
          }),
        }),
      });

      const result = await checkRateLimit({
        endpointType: "user",
        actionName: "test_action",
        identifier: "user_123",
      });

      expect(result.blocked).toBe(false);
    });

    it("returns blocked: true when user exceeds limit", async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockResolvedValue({ count: 250, error: null }),
            }),
          }),
        }),
      });

      const result = await checkRateLimit({
        endpointType: "user",
        actionName: "test_action",
        identifier: "user_123",
      });

      expect(result.blocked).toBe(true);
      expect(result.error).toContain("Too many actions");
    });
  });

  describe("logRateLimitAttempt", () => {
    it("inserts a rate limit log record", async () => {
      mockFrom.mockReturnValue({
        insert: mockInsert.mockResolvedValue({ error: null }),
      });

      await logRateLimitAttempt({
        endpointType: "public",
        actionName: "page_view",
        identifier: "anon",
        isFailed: false,
      });

      expect(mockFrom).toHaveBeenCalledWith("rate_limit_logs");
      expect(mockInsert).toHaveBeenCalledWith({
        ip_address: "192.168.1.100",
        identifier: "anon",
        endpoint_type: "public",
        action_name: "page_view",
        is_failed: false,
      });
    });
  });
});
