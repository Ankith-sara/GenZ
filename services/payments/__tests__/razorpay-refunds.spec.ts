import crypto from "crypto";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PaymentsService } from "../payments.service";

const SECRET = "whsec_test_secret";
const body = JSON.stringify({ event: "refund.processed", payload: { refund: { entity: { id: "rfnd_1" } } } });
const sign = (raw: string, secret = SECRET) =>
  crypto.createHmac("sha256", secret).update(raw).digest("hex");

describe("PaymentsService.verifyRazorpayWebhookSignature", () => {
  it("accepts a valid signature", () => {
    const res = PaymentsService.verifyRazorpayWebhookSignature(body, sign(body), SECRET);
    expect(res.verified).toBe(true);
  });

  it("rejects a signature made with another secret", () => {
    const res = PaymentsService.verifyRazorpayWebhookSignature(body, sign(body, "other"), SECRET);
    expect(res.verified).toBe(false);
    expect(res.misconfigured).toBeFalsy();
  });

  it("rejects a tampered body", () => {
    const res = PaymentsService.verifyRazorpayWebhookSignature(
      body.replace("rfnd_1", "rfnd_2"),
      sign(body),
      SECRET
    );
    expect(res.verified).toBe(false);
  });

  it("rejects missing, malformed and truncated signatures", () => {
    expect(PaymentsService.verifyRazorpayWebhookSignature(body, null, SECRET).verified).toBe(false);
    expect(PaymentsService.verifyRazorpayWebhookSignature(body, "not-hex!", SECRET).verified).toBe(
      false
    );
    expect(
      PaymentsService.verifyRazorpayWebhookSignature(body, sign(body).slice(0, 32), SECRET).verified
    ).toBe(false);
  });

  it("never verifies when the webhook secret is missing", () => {
    const res = PaymentsService.verifyRazorpayWebhookSignature(body, sign(body), "");
    expect(res.verified).toBe(false);
    expect(res.misconfigured).toBe(true);
  });
});

describe("PaymentsService.createRazorpayRefund", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("fails (never simulates success) when keys are missing", async () => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const res = await PaymentsService.createRazorpayRefund({
      paymentId: "pay_ABC123",
      amountInPaise: 10000,
      receipt: "refund-1",
    });

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/not configured/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts the refund in paise with basic auth and the refund id as receipt", async () => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_key";
    process.env.RAZORPAY_KEY_SECRET = "secret";
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "rfnd_9", status: "pending", amount: 10050 }), {
        status: 200,
      })
    );

    const res = await PaymentsService.createRazorpayRefund({
      paymentId: "pay_ABC123",
      amountInPaise: 10050,
      receipt: "8f14e45f-ceea-467f-a0e6-7c8d8f8e1d2a",
      notes: { refund_id: "8f14e45f-ceea-467f-a0e6-7c8d8f8e1d2a" },
    });

    expect(res).toMatchObject({ success: true, refundId: "rfnd_9", status: "pending" });
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.razorpay.com/v1/payments/pay_ABC123/refund");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      `Basic ${Buffer.from("rzp_test_key:secret").toString("base64")}`
    );
    const sent = JSON.parse(String(init.body));
    expect(sent.amount).toBe(10050);
    expect(sent.receipt).toBe("8f14e45f-ceea-467f-a0e6-7c8d8f8e1d2a");
  });

  it("reports the Razorpay error description on API failure", async () => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_key";
    process.env.RAZORPAY_KEY_SECRET = "secret";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ error: { description: "The amount is more than the captured amount" } }),
        { status: 400 }
      )
    );

    const res = await PaymentsService.createRazorpayRefund({
      paymentId: "pay_ABC123",
      amountInPaise: 999999,
      receipt: "r",
    });
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/more than the captured amount/);
  });
});

describe("PaymentsService.verifyRazorpaySignature", () => {
  const originalEnv = process.env;
  afterEach(() => {
    process.env = originalEnv;
  });

  it("fails closed in production when the key secret is missing", () => {
    process.env = { ...originalEnv, NODE_ENV: "production" };
    delete process.env.RAZORPAY_KEY_SECRET;
    const res = PaymentsService.verifyRazorpaySignature({
      orderId: "order_1",
      paymentId: "pay_1",
      signature: "x",
    });
    expect(res.verified).toBe(false);
  });

  it("verifies a correct checkout signature", () => {
    process.env = { ...originalEnv, RAZORPAY_KEY_SECRET: "secret" };
    const signature = crypto.createHmac("sha256", "secret").update("order_1|pay_1").digest("hex");
    expect(
      PaymentsService.verifyRazorpaySignature({ orderId: "order_1", paymentId: "pay_1", signature })
        .verified
    ).toBe(true);
    expect(
      PaymentsService.verifyRazorpaySignature({
        orderId: "order_1",
        paymentId: "pay_2",
        signature,
      }).verified
    ).toBe(false);
  });
});
