import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VerifiedBadge } from "@/components/verified-badge";

describe("UI Components", () => {
  it("renders VerifiedBadge component correctly", () => {
    render(<VerifiedBadge />);
    expect(screen.getByText("GST Verified")).toBeInTheDocument();
  });
});
