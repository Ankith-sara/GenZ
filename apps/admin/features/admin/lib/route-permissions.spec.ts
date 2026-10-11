import { describe, it, expect } from "vitest";
import { canOpenHref, permissionForHref } from "./route-permissions";

describe("admin route permissions", () => {
  it("maps routes to the most specific permission", () => {
    expect(permissionForHref("/dashboard/crm/settings")).toBe("crm:admin");
    expect(permissionForHref("/dashboard/crm/leads")).toBe("crm:read");
    expect(permissionForHref("/dashboard/operations/settings")).toBe("system:write");
    expect(permissionForHref("/dashboard/operations")).toBe("orders:read");
    expect(permissionForHref("/dashboard/finance?tab=ledger")).toBe("system:read");
    expect(permissionForHref("/dashboard?view=analytics")).toBe("system:read");
  });

  it("does not match a route that merely shares a prefix", () => {
    expect(permissionForHref("/dashboard/ordersx")).toBeNull();
  });

  it("lets any staff member open the overview", () => {
    expect(permissionForHref("/dashboard")).toBeNull();
    expect(canOpenHref({ isAdmin: false, permissions: [] }, "/dashboard")).toBe(true);
  });

  it("limits emp staff to their permissions and lets admins open everything", () => {
    const crmOnly = { isAdmin: false, permissions: ["crm:read" as const] };
    expect(canOpenHref(crmOnly, "/dashboard/crm/contacts")).toBe(true);
    expect(canOpenHref(crmOnly, "/dashboard/verifications")).toBe(false);
    expect(canOpenHref(crmOnly, "/dashboard/finance")).toBe(false);
    expect(canOpenHref({ isAdmin: true, permissions: [] }, "/dashboard/finance")).toBe(true);
  });
});
