import { describe, it, expect } from "vitest";
import type { AnalyticsSummary } from "./vercel-analytics";

describe("Admin Analytics Logic Specs", () => {
  it("defines valid AnalyticsSummary structure", () => {
    const summary: AnalyticsSummary = {
      dailyData: [
        {
          date: "Aug 7",
          fullDate: "Aug 07 · Fri",
          pageViews: 120,
          uniqueVisitors: 85,
        },
      ],
      totalPageViews: 120,
      totalVisitors: 85,
      topPages: [{ path: "/products/1", views: 120 }],
      topReferrers: [{ source: "google.com", count: 50 }],
    };

    expect(summary.totalPageViews).toBe(120);
    expect(summary.topPages.length).toBe(1);
    expect(summary.topReferrers[0].source).toBe("google.com");
  });
});
