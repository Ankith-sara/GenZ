import { describe, it, expect } from "vitest";
import { ShippingService } from "../shipping.service";

describe("ShippingService", () => {
  it("validates valid carrier and tracking number generating carrier URL", () => {
    const res = ShippingService.validateDispatch("delhivery", "DEL12345678");
    expect(res.valid).toBe(true);
    expect(res.carrierDisplayName).toBe("Delhivery Logistics");
    expect(res.trackingUrl).toBe("https://www.delhivery.com/track/package/DEL12345678");
  });

  it("fails validation when carrier or tracking number is empty", () => {
    const res1 = ShippingService.validateDispatch("", "DEL12345");
    expect(res1.valid).toBe(false);
    expect(res1.error).toContain("Carrier partner is required");

    const res2 = ShippingService.validateDispatch("Blue Dart", "");
    expect(res2.valid).toBe(false);
    expect(res2.error).toContain("Tracking / AWB number is required");
  });
});
