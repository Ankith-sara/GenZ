import { describe, it, expect } from "vitest";
import {
  COMPANY,
  COMPANY_DETAILS_PENDING,
  HAS_PENDING_COMPANY_DETAILS,
  POLICY,
  findPlaceholderFields,
  formatAddress,
} from "./company";

describe("company config", () => {
  it("lists every placeholder field still containing '[' in COMPANY_DETAILS_PENDING", () => {
    expect([...COMPANY_DETAILS_PENDING].sort()).toEqual(
      findPlaceholderFields(COMPANY).sort()
    );
    expect(HAS_PENDING_COMPANY_DETAILS).toBe(COMPANY_DETAILS_PENDING.length > 0);
  });

  it("keeps the real, already-published contact channels", () => {
    expect(COMPANY.supportPhone).toBe("+91 77948 93768");
    expect(COMPANY.supportPhoneHref).toBe("+917794893768");
    expect(COMPANY.supportEmail).toMatch(/^[^\s@[\]]+@[^\s@[\]]+\.[a-z]+$/i);
    expect(COMPANY.domain).toBe("genzonline.in");
  });

  it("encodes the policy timelines required by the E-Commerce Rules", () => {
    expect(POLICY.grievanceAcknowledgementHours).toBe(48);
    expect(POLICY.grievanceResolutionDays).toBeLessThanOrEqual(31);
    expect(POLICY.returnWindowDays).toBe(7);
    expect(POLICY.cancellationAllowedUntilStatus).toBe("shipped");
    expect(POLICY.refundTimelineBusinessDays.min).toBeLessThanOrEqual(
      POLICY.refundTimelineBusinessDays.max
    );
  });

  it("formats addresses on a single line", () => {
    expect(
      formatAddress({
        line1: "1 MG Road",
        city: "Vijayawada",
        state: "Andhra Pradesh",
        pincode: "520001",
        country: "India",
      })
    ).toBe("1 MG Road, Vijayawada, Andhra Pradesh 520001, India");
  });

  it("finds nested placeholder paths", () => {
    expect(findPlaceholderFields({ a: "ok", b: { c: "[todo]" } })).toEqual(["b.c"]);
  });
});
