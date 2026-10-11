import { describe, it, expect } from "vitest";
import { resolveTrustedRole, canAccessRole } from "./role-resolution";

describe("resolveTrustedRole", () => {
  it("never trusts a role the user wrote into user_metadata", () => {
    // The caller only passes trusted sources; a buyer profile stays buyer even if
    // user_metadata.role = "admin" was set from the browser.
    expect(resolveTrustedRole({ profileRole: "buyer" })).toBe("buyer");
    expect(resolveTrustedRole({})).toBe("buyer");
  });

  it("grants admin from the protected profile row or service-role app_metadata", () => {
    expect(resolveTrustedRole({ profileRole: "admin" })).toBe("admin");
    expect(resolveTrustedRole({ profileRole: "buyer", appMetadataRole: "admin" })).toBe("admin");
  });

  it("maps active employees to emp, or admin for admin-level employees", () => {
    expect(
      resolveTrustedRole({ profileRole: "buyer", employee: { status: "active", role_level: "staff" } })
    ).toBe("emp");
    expect(
      resolveTrustedRole({ profileRole: "buyer", employee: { status: "active", role_level: "admin" } })
    ).toBe("admin");
  });

  it("does not grant staff access from an emp profile without an active employee row", () => {
    expect(resolveTrustedRole({ profileRole: "emp" })).toBe("buyer");
    expect(resolveTrustedRole({ profileRole: "emp", appMetadataRole: "emp" })).toBe("buyer");
    expect(
      resolveTrustedRole({ profileRole: "emp", employee: { status: "active", role_level: "staff" } })
    ).toBe("emp");
  });

  it("ignores inactive employee records", () => {
    expect(
      resolveTrustedRole({ profileRole: "buyer", employee: { status: "inactive", role_level: "admin" } })
    ).toBe("buyer");
  });

  it("keeps verified sellers as sellers and rejects unknown role strings", () => {
    expect(resolveTrustedRole({ profileRole: "seller" })).toBe("seller");
    expect(resolveTrustedRole({ profileRole: "superuser", appMetadataRole: "root" })).toBe("buyer");
  });
});

describe("canAccessRole", () => {
  it("applies the role hierarchy", () => {
    expect(canAccessRole("admin", "seller")).toBe(true);
    expect(canAccessRole("emp", "admin")).toBe(true);
    expect(canAccessRole("emp", "seller")).toBe(false);
    expect(canAccessRole("seller", "admin")).toBe(false);
    expect(canAccessRole("seller", "buyer")).toBe(true);
    expect(canAccessRole("buyer", "seller")).toBe(false);
    expect(canAccessRole("buyer", "buyer")).toBe(true);
  });
});
