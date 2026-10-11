import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildOrderConfirmationEmail,
  buildOrderStatusEmail,
  buildRefundEmail,
  sendCustomerEmail,
  type CustomerEmailOrder,
} from "./order-emails";
import { escapeHtml, safeUrl } from "./html";

const XSS = `<script>alert("x")</script>`;

function order(overrides: Partial<CustomerEmailOrder> = {}): CustomerEmailOrder {
  return {
    id: "GZ-ORD-123456",
    customerName: `Ravi ${XSS}`,
    items: [
      { name: `Kondapalli toy <img src=x onerror=alert(1)>`, quantity: 2, price: 450, sellerName: `Maker & Sons "Best"` },
    ],
    subtotal: 900,
    tax: 45,
    shippingFee: 70,
    totalAmount: 1015,
    shippingAddress: {
      recipientName: "Ravi",
      phone: "9876543210",
      addressLine: `12 <b>MG</b> Road`,
      city: "Vijayawada",
      state: "AP",
      pincode: "520001",
    },
    paymentMethod: "razorpay",
    carrier: `Delhivery<script>`,
    trackingNumber: `AWB"><svg onload=alert(1)>`,
    ...overrides,
  };
}

describe("escapeHtml / safeUrl", () => {
  it("escapes HTML metacharacters", () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;"
    );
    expect(escapeHtml(null)).toBe("");
  });

  it("only allows http(s) links", () => {
    expect(safeUrl("javascript:alert(1)")).toBe("#");
    expect(safeUrl("https://genzonline.in/orders")).toBe("https://genzonline.in/orders");
  });
});

describe("customer email builders", () => {
  it("escapes customer and seller strings in the confirmation email", () => {
    const email = buildOrderConfirmationEmail(order(), { siteUrl: "https://genzonline.in" });
    expect(email.html).not.toContain("<script>");
    expect(email.html).not.toContain("<img src=x");
    expect(email.html).not.toContain("<b>MG</b>");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.html).toContain("Maker &amp; Sons &quot;Best&quot;");
    expect(email.html).toContain("GZ-ORD-123456");
    expect(email.html).toContain("https://genzonline.in/orders");
    expect(email.subject).toContain("GZ-ORD-123456");
    expect(email.subject).toContain("GenZ Online");
    // Plain-text part keeps the raw text (no HTML rendering there).
    expect(email.text).toContain("Total: ₹1,015");
  });

  it("escapes tracking details and blocks unsafe tracking links in shipped emails", () => {
    const email = buildOrderStatusEmail(order(), "shipped", {
      trackingUrl: "javascript:alert(1)",
    });
    expect(email.html).not.toContain("<svg");
    expect(email.html).not.toContain("javascript:");
    expect(email.html).toContain("Delhivery&lt;script&gt;");
  });

  it("escapes the admin note in refund rejection emails", () => {
    const email = buildRefundEmail(
      order(),
      { id: "r1", amount: 1015, method: "manual", adminNote: `<iframe src="x">` },
      "rejected"
    );
    expect(email.html).not.toContain("<iframe");
    expect(email.html).toContain("&lt;iframe");
  });

  it("includes the UTR in processed manual refund emails", () => {
    const email = buildRefundEmail(
      order(),
      { id: "r1", amount: 500.5, method: "manual", manualReference: "425689123456" },
      "processed"
    );
    expect(email.text).toContain("425689123456");
    expect(email.text).toContain("₹500.5");
  });
});

describe("sendCustomerEmail", () => {
  const originalEnv = process.env;
  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("skips without throwing when RESEND_API_KEY is missing", async () => {
    delete process.env.RESEND_API_KEY;
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const res = await sendCustomerEmail("a@example.com", buildOrderConfirmationEmail(order()), "t");
    expect(res).toMatchObject({ success: false, skipped: true });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("skips invalid recipients", async () => {
    process.env.RESEND_API_KEY = "re_test";
    const res = await sendCustomerEmail("not-an-email", buildOrderConfirmationEmail(order()), "t");
    expect(res.skipped).toBe(true);
  });

  it("returns a failure instead of throwing when the network errors", async () => {
    process.env.RESEND_API_KEY = "re_test";
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
    const res = await sendCustomerEmail("a@example.com", buildOrderConfirmationEmail(order()), "t");
    expect(res.success).toBe(false);
  });

  it("sends html and text parts", async () => {
    process.env.RESEND_API_KEY = "re_test";
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ id: "em_1" }), { status: 200 }));
    const res = await sendCustomerEmail("a@example.com", buildOrderConfirmationEmail(order()), "t");
    expect(res.success).toBe(true);
    const sent = JSON.parse(String((fetchSpy.mock.calls[0] as [string, RequestInit])[1].body));
    expect(sent.to).toBe("a@example.com");
    expect(sent.text).toContain("GZ-ORD-123456");
    expect(sent.html).toContain("GZ-ORD-123456");
  });
});
