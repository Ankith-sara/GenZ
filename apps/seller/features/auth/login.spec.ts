import { describe, it, expect } from "vitest";
import { validateLoginEmail, validateLoginPassword } from "./lib/login-validation";

describe("Seller Auth Login Form Logic Specs", () => {
  describe("validateLoginEmail", () => {
    it("rejects empty or whitespace email", () => {
      expect(validateLoginEmail("")).toBe("Email address is required.");
      expect(validateLoginEmail("   ")).toBe("Email address is required.");
    });

    it("rejects invalid email formats", () => {
      expect(validateLoginEmail("invalid-email")).toBe(
        "Please enter a valid email address (e.g. user@example.com)."
      );
      expect(validateLoginEmail("user@domain")).toBe(
        "Please enter a valid email address (e.g. user@example.com)."
      );
      expect(validateLoginEmail("@missinguser.com")).toBe(
        "Please enter a valid email address (e.g. user@example.com)."
      );
    });

    it("accepts valid corporate and factory email addresses", () => {
      expect(validateLoginEmail("factory@company.com")).toBeNull();
      expect(validateLoginEmail("artisan.seller@genz.in")).toBeNull();
    });
  });

  describe("validateLoginPassword", () => {
    it("rejects empty password", () => {
      expect(validateLoginPassword("")).toBe("Password is required.");
    });

    it("enforces minimum length of 6 characters", () => {
      expect(validateLoginPassword("12345")).toBe(
        "Password must be at least 6 characters."
      );
      expect(validateLoginPassword("abc")).toBe(
        "Password must be at least 6 characters."
      );
    });

    it("accepts valid passwords with 6 or more characters", () => {
      expect(validateLoginPassword("securePass123")).toBeNull();
      expect(validateLoginPassword("123456")).toBeNull();
    });
  });
});
