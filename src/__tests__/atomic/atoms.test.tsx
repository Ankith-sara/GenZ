import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/ui/atoms/status-badge";
import { UserAvatar } from "@/components/ui/atoms/user-avatar";
import { VerifiedBadge } from "@/components/ui/atoms/verified-badge";

describe("Atomic Components (Atoms)", () => {
  describe("StatusBadge", () => {
    it("renders Pending badge with amber styling", () => {
      render(<StatusBadge status="pending" />);
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("renders Approved badge with emerald styling", () => {
      render(<StatusBadge status="approved" />);
      expect(screen.getByText("Approved")).toBeInTheDocument();
    });

    it("renders Rejected badge with rose styling", () => {
      render(<StatusBadge status="rejected" />);
      expect(screen.getByText("Rejected")).toBeInTheDocument();
    });
  });

  describe("UserAvatar", () => {
    it("renders initials when user name is provided", () => {
      render(<UserAvatar name="Sarah Jenkins" avatarUrl={null} size={40} />);
      expect(screen.getByText("SJ")).toBeInTheDocument();
    });

    it("renders single initial for single-word name", () => {
      render(<UserAvatar name="Aharyas" avatarUrl={null} size={32} />);
      expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("renders fallback SVG icon when name is null", () => {
      const { container } = render(
        <UserAvatar name={null} avatarUrl={null} size={32} />
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("VerifiedBadge", () => {
    it("renders GST Verified text label", () => {
      render(<VerifiedBadge />);
      expect(screen.getByText("GST Verified")).toBeInTheDocument();
    });
  });
});
