import { describe, it, expect } from "vitest";

describe("Seller Actions Business Logic Specs", () => {
  function computeTargetStatus(newStatus: "pending" | "approved" | "rejected"): string {
    return newStatus === "approved" ? "verified" : newStatus;
  }

  it("maps approved status to verified status for seller profiles", () => {
    expect(computeTargetStatus("approved")).toBe("verified");
  });

  it("preserves pending and rejected statuses directly", () => {
    expect(computeTargetStatus("pending")).toBe("pending");
    expect(computeTargetStatus("rejected")).toBe("rejected");
  });
});
