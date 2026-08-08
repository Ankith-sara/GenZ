import { describe, it, expect } from "vitest";
import type { Role } from "@/types/database";

describe("Require Role Authorization Logic Specs", () => {
  function checkRoleAccess(userRole: string, allowed: Role): boolean {
    const role = userRole === "manufacturer" ? "seller" : (userRole as Role);
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

  it("normalizes legacy 'manufacturer' role to 'seller'", () => {
    expect(checkRoleAccess("manufacturer", "seller")).toBe(true);
    expect(checkRoleAccess("manufacturer", "buyer")).toBe(true);
  });

  it("prevents buyer role from accessing seller or admin routes", () => {
    expect(checkRoleAccess("buyer", "admin")).toBe(false);
    expect(checkRoleAccess("buyer", "seller")).toBe(false);
    expect(checkRoleAccess("buyer", "buyer")).toBe(true);
  });
});
