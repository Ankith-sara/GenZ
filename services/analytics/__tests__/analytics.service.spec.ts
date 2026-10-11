import { describe, it, expect } from "vitest";
import { AnalyticsService } from "../analytics.service";

describe("AnalyticsService", () => {
  it("tracks valid analytics events with timestamps", () => {
    const event = AnalyticsService.trackEvent(
      "order_placed",
      { orderId: "ord-1", totalAmount: 499 },
      "user-1"
    );

    expect(event.event).toBe("order_placed");
    expect(event.properties?.orderId).toBe("ord-1");
    expect(event.timestamp).toBeDefined();
  });
});
