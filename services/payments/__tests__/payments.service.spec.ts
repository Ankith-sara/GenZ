import { describe, it, expect } from "vitest";
import { PaymentsService } from "../payments.service";

describe("PaymentsService", () => {
  it("creates simulated Razorpay order in sandbox mode", async () => {
    const res = await PaymentsService.createRazorpayOrder({
      amountInInr: 450,
      customerEmail: "buyer@example.com",
    });

    expect(res.success).toBe(true);
    expect(res.amountInPaise).toBe(45000);
    expect(res.orderId).toContain("order_");
    expect(res.currency).toBe("INR");
  });

  it("validates UPI UTR format correctly", () => {
    expect(PaymentsService.validateUpiUtr("123456789012")).toBe(true);
    expect(PaymentsService.validateUpiUtr("AXIS0987123456")).toBe(true);
    expect(PaymentsService.validateUpiUtr("bad")).toBe(false); // too short
  });
});
