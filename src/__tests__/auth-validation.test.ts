import { describe, it, expect } from "vitest";
import { z } from "zod";

const emailLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const otpLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  token: z.string().length(6, "Verification code must be 6 digits."),
});

describe("Authentication Input Schemas", () => {
  it("validates valid email and password credentials", () => {
    const validData = {
      email: "test@example.com",
      password: "password123",
    };
    const result = emailLoginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email addresses", () => {
    const invalidData = {
      email: "invalid-email-address",
      password: "password123",
    };
    const result = emailLoginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("rejects short passwords under 6 characters", () => {
    const invalidData = {
      email: "user@example.com",
      password: "123",
    };
    const result = emailLoginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("accepts valid 6-digit OTP verification tokens", () => {
    const validOtp = {
      email: "user@example.com",
      token: "123456",
    };
    const result = otpLoginSchema.safeParse(validOtp);
    expect(result.success).toBe(true);
  });

  it("rejects non-6-digit OTP tokens", () => {
    const invalidOtp = {
      email: "user@example.com",
      token: "1234",
    };
    const result = otpLoginSchema.safeParse(invalidOtp);
    expect(result.success).toBe(false);
  });
});
