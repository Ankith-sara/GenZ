import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendResendEmail, sendSellerApprovalEmail } from "./resend";

describe("Resend Utility (sendResendEmail)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns success: false with clear error when RESEND_API_KEY is missing", async () => {
    delete process.env.RESEND_API_KEY;

    const result = await sendResendEmail({
      to: "seller@example.com",
      subject: "Test Subject",
      html: "<p>Test Content</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("RESEND_API_KEY is not configured");
  });

  it("successfully dispatches email when Resend API returns HTTP 200", async () => {
    process.env.RESEND_API_KEY = "re_test_key_123456";
    process.env.RESEND_FROM_EMAIL = "GenZ Test <test@genzonline.in>";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ id: "msg_resend_998877" }),
    } as unknown as Response);

    const result = await sendSellerApprovalEmail({
      to: "approved.seller@example.com",
      fullName: "Anita Sharma",
      businessName: "Sharma Handicrafts",
      password: "SecretPassword123!",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe("msg_resend_998877");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer re_test_key_123456",
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("returns success: false with API error message when Resend API returns HTTP error", async () => {
    process.env.RESEND_API_KEY = "re_test_key_invalid";

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: vi.fn().mockResolvedValue({ message: "Invalid API key" }),
    } as unknown as Response);

    const result = await sendResendEmail({
      to: "seller@example.com",
      subject: "Test Subject",
      html: "<p>Test Content</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid API key");
  });

  it("handles network fetch exception gracefully", async () => {
    process.env.RESEND_API_KEY = "re_test_key_123456";

    global.fetch = vi.fn().mockRejectedValue(new Error("Network connection lost"));

    const result = await sendResendEmail({
      to: "seller@example.com",
      subject: "Test Subject",
      html: "<p>Test Content</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Network connection lost");
  });
});
