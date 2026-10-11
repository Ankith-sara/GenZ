import { describe, it, expect } from "vitest";
import { PricingService } from "../pricing.service";

describe("PricingService", () => {
  it("calculates subtotal, tax, shipping, and total correctly", () => {
    const items = [
      { unitPrice: 500, quantity: 1, taxRatePercent: 5 },
      { unitPrice: 200, quantity: 2, taxRatePercent: 12 },
    ];
    const breakdown = PricingService.calculateOrderTotals(items);

    expect(breakdown.subtotal).toBe(900);
    expect(breakdown.tax).toBe(25 + 48); // 25 + 48 = 73
    expect(breakdown.shippingFee).toBe(PricingService.DEFAULT_SHIPPING_FEE); // subtotal < 999
    expect(breakdown.total).toBe(900 + 73 + 70);
  });

  it("applies free shipping when subtotal reaches the free shipping threshold", () => {
    const items = [{ unitPrice: 1200, quantity: 1, taxRatePercent: 5 }];
    const breakdown = PricingService.calculateOrderTotals(items);

    expect(breakdown.subtotal).toBe(1200);
    expect(breakdown.shippingFee).toBe(0);
    expect(breakdown.total).toBe(1200 + 60);
  });

  it("accurately converts INR to paise", () => {
    expect(PricingService.inrToPaise(149.5)).toBe(14950);
    expect(PricingService.inrToPaise(0)).toBe(0);
  });

  it("calculates seller commission and platform fee accurately", () => {
    const comm = PricingService.calculateSellerCommission(1000, 10);
    expect(comm.platformFeeAmount).toBe(100);
    expect(comm.sellerPayoutAmount).toBe(900);
  });
});
