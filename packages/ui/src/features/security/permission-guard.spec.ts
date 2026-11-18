import { describe, it, expect } from "vitest";
import { hasRolePermission } from "./permission-guard";

describe("PermissionGuard helper hasRolePermission", () => {
  it("returns true when currentRole is in allowedRoles", () => {
    expect(hasRolePermission("admin", ["admin", "seller"])).toBe(true);
    expect(hasRolePermission("seller", ["seller"])).toBe(true);
    expect(hasRolePermission("buyer", ["buyer", "customer"])).toBe(true);
  });

  it("returns false when currentRole is not in allowedRoles", () => {
    expect(hasRolePermission("buyer", ["admin", "seller"])).toBe(false);
    expect(hasRolePermission("customer", ["admin"])).toBe(false);
    expect(hasRolePermission("seller", ["admin"])).toBe(false);
  });
});
