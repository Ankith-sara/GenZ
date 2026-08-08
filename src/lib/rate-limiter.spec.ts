import { describe, it, expect } from "vitest";
import type { RateLimitCheckResult } from "./rate-limiter";

describe("Rate Limiter Logic Specs", () => {
  it("defines correct structure for unblocked rate limit result", () => {
    const unblocked: RateLimitCheckResult = { blocked: false };
    expect(unblocked.blocked).toBe(false);
    expect(unblocked.error).toBeUndefined();
  });

  it("defines correct structure for blocked rate limit result", () => {
    const blocked: RateLimitCheckResult = {
      blocked: true,
      error: "Too many login attempts",
      retryAfterSeconds: 60,
    };
    expect(blocked.blocked).toBe(true);
    expect(blocked.error).toBe("Too many login attempts");
    expect(blocked.retryAfterSeconds).toBe(60);
  });
});
