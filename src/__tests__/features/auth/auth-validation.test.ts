import { describe, it, expect } from "vitest";
import {
  loginSchema,
  signupSchema,
  sellerSignupSchema,
  emailSchema,
  passwordSchema,
} from "@/lib/validation";

describe("Auth Feature Validation Schemas", () => {
  describe("emailSchema", () => {
    it("validates valid email address", () => {
      const result = emailSchema.safeParse("user@example.com");
      expect(result.success).toBe(true);
    });

    it("rejects invalid email address format", () => {
      const result = emailSchema.safeParse("not-an-email");
      expect(result.success).toBe(false);
    });
  });

  describe("passwordSchema", () => {
    it("validates passwords with 8+ characters", () => {
      const result = passwordSchema.safeParse("SecurePass123!");
      expect(result.success).toBe(true);
    });

    it("rejects passwords under 8 characters", () => {
      const result = passwordSchema.safeParse("short");
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("validates correct login credentials payload", () => {
      const payload = {
        email: "admin@genz.in",
        password: "SuperSecretPassword123!",
      };
      const result = loginSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe("signupSchema & sellerSignupSchema", () => {
    it("validates valid buyer/admin signup payload", () => {
      const payload = {
        email: "newbuyer@genz.in",
        password: "StrongPassword123!",
        fullName: "Buyer Name",
        role: "buyer" as const,
      };
      const result = signupSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("validates valid seller onboarding signup payload", () => {
      const payload = {
        email: "factory@genz.in",
        password: "FactoryPassword123!",
        fullName: "Manufacturer HQ",
        businessType: "Garments Manufacturer",
      };
      const result = sellerSignupSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });
});
