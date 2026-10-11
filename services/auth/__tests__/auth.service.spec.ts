import { describe, it, expect } from "vitest";
import { AuthService } from "../auth.service";

describe("AuthService", () => {
  it("generates a secure random password with requested length", () => {
    const password = AuthService.generateSecurePassword(16);
    expect(password).toBeDefined();
    expect(password.length).toBe(16);
  });

  it("generates non-identical passwords on consecutive invocations", () => {
    const pwd1 = AuthService.generateSecurePassword(14);
    const pwd2 = AuthService.generateSecurePassword(14);
    expect(pwd1).not.toBe(pwd2);
  });
});
