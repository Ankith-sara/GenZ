import { describe, it, expect } from "vitest";
import type { Role } from "@/types/database";

describe("Require Role Authorization Logic Specs", () => {
  function checkRoleAccess(role: Role, allowed: Role): boolean {
    return (
      role === "admin" ||
      (role === "seller" && (allowed === "seller" || allowed === "buyer")) ||
      (role === "buyer" && allowed === "buyer")
    );
  }

  it("grants admin role full access to buyer, seller, and admin routes", () => {
    expect(checkRoleAccess("admin", "admin")).toBe(true);
    expect(checkRoleAccess("admin", "seller")).toBe(true);
    expect(checkRoleAccess("admin", "buyer")).toBe(true);
  });
  it("grants seller role access to seller and buyer routes", () => {
    expect(checkRoleAccess("seller", "seller")).toBe(true);
    expect(checkRoleAccess("seller", "buyer")).toBe(true);
    expect(checkRoleAccess("seller", "admin")).toBe(false);
  });

  it("prevents buyer role from accessing seller or admin routes", () => {
    expect(checkRoleAccess("buyer", "admin")).toBe(false);
    expect(checkRoleAccess("buyer", "seller")).toBe(false);
    expect(checkRoleAccess("buyer", "buyer")).toBe(true);
  });
});
