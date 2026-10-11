import { describe, it, expect, vi } from "vitest";
import { SellersService } from "../sellers.service";
import { SellersRepository } from "../sellers.repository";

describe("SellersService", () => {
  it("prevents duplicate pending seller application submissions", async () => {
    vi.spyOn(SellersRepository, "getApplicationByEmail").mockResolvedValue({
      id: "app-123",
      email: "artisan@example.com",
      full_name: "Artisan Kumar",
      phone: null,
      business_name: "Kumar Crafts",
      business_type: "individual",
      form_data: {},
      status: "pending",
      rejection_reason: null,
      reviewed_at: null,
      reviewed_by: null,
      created_at: new Date().toISOString(),
    });

    await expect(
      SellersService.submitApplication({
        fullName: "Artisan Kumar",
        email: "artisan@example.com",
        businessName: "Kumar Crafts",
      })
    ).rejects.toThrow("already pending review");

    vi.restoreAllMocks();
  });

  it("resolves intelligent profile fallback when seller profile is sparse", async () => {
    vi.spyOn(SellersRepository, "getSellerProfile").mockResolvedValue(null);
    vi.spyOn(SellersRepository, "getApplicationByEmail").mockResolvedValue({
      id: "app-123",
      email: "artisan@example.com",
      full_name: "Artisan Kumar",
      phone: null,
      business_name: "Kumar Crafts",
      business_type: "individual",
      form_data: {
        gst_number: "29AAAAA0000A1Z5",
        city: "Channapatna",
        state: "Karnataka",
      },
      status: "approved",
      rejection_reason: null,
      reviewed_at: null,
      reviewed_by: null,
      created_at: new Date().toISOString(),
    });

    const profile = await SellersService.getSellerProfileWithFallback(
      "seller-123",
      "artisan@example.com"
    );

    expect(profile).toBeDefined();
    expect(profile?.business_name).toBe("Kumar Crafts");
    expect(profile?.gst_number).toBe("29AAAAA0000A1Z5");
    expect(profile?.city).toBe("Channapatna");

    vi.restoreAllMocks();
  });
});
