import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  loginSchema,
  gstSchema,
  validateGstOrTradeId,
  sellerSignupSchema,
  sellerProfileSchema,
  productSchema,
  variantSchema,
  adminRejectSchema,
  addressSchema,
} from "./validation";

describe("Business & Input Validation Specs", () => {
  describe("emailSchema", () => {
    it("validates correct email addresses", () => {
      expect(emailSchema.parse("test@example.com")).toBe("test@example.com");
    });

    it("rejects malformed email addresses", () => {
      expect(() => emailSchema.parse("invalid-email")).toThrow();
    });
  });

  describe("passwordSchema", () => {
    it("accepts valid passwords >= 8 chars", () => {
      expect(passwordSchema.parse("securepassword123")).toBe("securepassword123");
    });

    it("rejects short passwords < 8 chars", () => {
      expect(() => passwordSchema.parse("12347")).toThrow();
    });
  });

  describe("gstSchema & validateGstOrTradeId", () => {
    it("validates standard 15-character GSTIN", () => {
      const validGst = "22AAAAA0000A1Z5";
      expect(gstSchema.parse(validGst)).toBe(validGst);
    });

    it("accepts valid Trade ID format", () => {
      const validTradeId = "TRD-99887766";
      expect(gstSchema.parse(validTradeId)).toBe(validTradeId);
    });

    it("rejects invalid GSTIN / Trade ID strings", () => {
      expect(() => gstSchema.parse("A")).toThrow();
    });

    it("validateGstOrTradeId returns type and validity for GSTIN", () => {
      const result = validateGstOrTradeId("22AAAAA0000A1Z5");
      expect(result.isValid).toBe(true);
      expect(result.type).toBe("GSTIN");
    });

    it("validateGstOrTradeId returns type and validity for Trade ID", () => {
      const result = validateGstOrTradeId("TRD-998877");
      expect(result.isValid).toBe(true);
      expect(result.type).toBe("Trade ID");
    });

    it("validateGstOrTradeId handles empty input", () => {
      const result = validateGstOrTradeId("");
      expect(result.isValid).toBe(false);
      expect(result.type).toBe("empty");
    });

    it("validateGstOrTradeId handles invalid input", () => {
      const result = validateGstOrTradeId("XYZ");
      expect(result.isValid).toBe(false);
      expect(result.type).toBe("invalid");
    });
  });

  describe("loginSchema", () => {
    it("parses valid login payloads", () => {
      const payload = {
        email: "admin@aharyas.com",
        password: "adminpassword123",
      };
      expect(loginSchema.parse(payload)).toEqual(payload);
    });
  });

  describe("sellerSignupSchema", () => {
    it("validates valid prospective seller signup data", () => {
      const signupData = {
        email: "maker@crafts.in",
        fullName: "Raghavendra Rao",
        businessType: "manufacturer",
        gstNumber: "22AAAAA0000A1Z5",
      };
      const parsed = sellerSignupSchema.parse(signupData);
      expect(parsed.email).toBe("maker@crafts.in");
      expect(parsed.fullName).toBe("Raghavendra Rao");
    });

    it("allows optional password or empty string during prospective application", () => {
      const signupData = {
        email: "artisan@gi.in",
        fullName: "Lakshmi Devi",
        businessType: "artisan",
      };
      const parsed = sellerSignupSchema.parse(signupData);
      expect(parsed.email).toBe("artisan@gi.in");
    });
  });

  describe("sellerProfileSchema", () => {
    it("validates complete seller profile inputs", () => {
      const sellerData = {
        business_name: "Aharyas Crafts",
        gst_number: "22AAAAA0000A1Z5",
        city: "Coimbatore",
        state: "Tamil Nadu",
      };
      const parsed = sellerProfileSchema.parse(sellerData);
      expect(parsed.business_name).toBe("Aharyas Crafts");
    });
  });

  describe("productSchema & variantSchema", () => {
    it("validates well-formed product payload", () => {
      const productData = {
        name: "Channapatna Wooden Stacking Ring",
        category: "Wooden Toys",
        price_inr: 450,
        materials: ["Ivory Wood", "Vegetable Dyes"],
      };
      const parsed = productSchema.parse(productData);
      expect(parsed.name).toBe("Channapatna Wooden Stacking Ring");
      expect(parsed.materials).toHaveLength(2);
    });

    it("rejects negative product prices", () => {
      expect(() =>
        productSchema.parse({
          name: "Invalid Toy",
          category: "Wooden Toys",
          price_inr: -50,
        })
      ).toThrow();
    });

    it("validates variant with stock quantity and price override", () => {
      const variantData = {
        variant_name: "Size",
        variant_value: "Large (10 inches)",
        price_inr: 650,
        stock_qty: 25,
      };
      const parsed = variantSchema.parse(variantData);
      expect(parsed.variant_value).toBe("Large (10 inches)");
      expect(parsed.stock_qty).toBe(25);
    });
  });

  describe("adminRejectSchema", () => {
    it("accepts valid rejection reason", () => {
      const parsed = adminRejectSchema.parse({
        reason: "Factory address does not match GSTIN registered state.",
      });
      expect(parsed.reason).toContain("Factory address");
    });

    it("rejects empty rejection reason", () => {
      expect(() => adminRejectSchema.parse({ reason: "" })).toThrow();
    });
  });

  describe("addressSchema", () => {
    it("validates customer shipping address", () => {
      const addr = {
        id: "addr-1",
        recipientName: "Suresh Kumar",
        phone: "+91 9876543210",
        addressLine: "Plot 42, Hitech City Road",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500081",
      };
      const parsed = addressSchema.parse(addr);
      expect(parsed.city).toBe("Hyderabad");
      expect(parsed.pincode).toBe("500081");
    });
  });
});
