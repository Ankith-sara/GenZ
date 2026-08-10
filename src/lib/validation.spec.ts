import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  loginSchema,
  gstSchema,
  sellerProfileSchema,
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

  describe("gstSchema", () => {
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
});
