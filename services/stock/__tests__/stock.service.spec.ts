import { describe, it, expect } from "vitest";
import { StockService } from "../stock.service";

describe("StockService", () => {
  it("evaluates stock status properly across tiers", () => {
    expect(StockService.evaluateStock(0, 5, true)).toEqual({
      status: "out_of_stock",
      available: false,
    });

    expect(StockService.evaluateStock(3, 5, true)).toEqual({
      status: "low_stock",
      available: true,
    });

    expect(StockService.evaluateStock(25, 5, true)).toEqual({
      status: "in_stock",
      available: true,
    });

    // Untracked inventory is always available
    expect(StockService.evaluateStock(0, 5, false)).toEqual({
      status: "in_stock",
      available: true,
    });
  });
});
