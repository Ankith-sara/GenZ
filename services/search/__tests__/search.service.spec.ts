import { describe, it, expect } from "vitest";
import { SearchService } from "../search.service";

describe("SearchService", () => {
  it("sanitizes query by removing SQL wildcard characters", () => {
    const raw = "wooden%toy_car";
    const cleaned = SearchService.sanitizeQuery(raw);
    expect(cleaned).toBe("woodentoycar");
  });

  it("returns empty results for blank search queries", async () => {
    const result = await SearchService.searchProducts({ query: "   " });
    expect(result.products).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(Array.isArray(result.categories)).toBe(true);
  });
});
