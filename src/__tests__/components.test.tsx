import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VerifiedBadge } from "@/components/verified-badge";
import { UserAvatar } from "@/components/user-avatar";

describe("UI Components", () => {
  describe("VerifiedBadge", () => {
    it("renders VerifiedBadge component correctly with GST Verified text", () => {
      render(<VerifiedBadge />);
      expect(screen.getByText("GST Verified")).toBeInTheDocument();
    });

    it("applies custom class names to VerifiedBadge container", () => {
      const { container } = render(<VerifiedBadge className="custom-badge-class" />);
      expect(container.firstChild).toHaveClass("custom-badge-class");
    });
  });

  describe("UserAvatar", () => {
    it("renders user initials when name is provided without avatar URL", () => {
      render(<UserAvatar name="Rajesh Kumar" avatarUrl={null} size={40} />);
      expect(screen.getByText("RK")).toBeInTheDocument();
    });

    it("renders single initial for single-word names", () => {
      render(<UserAvatar name="Ankith" avatarUrl={null} size={32} />);
      expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("renders fallback icon when no name or avatarUrl is supplied", () => {
      const { container } = render(
        <UserAvatar name={null} avatarUrl={null} size={32} />
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("renders avatar img element when valid avatarUrl is provided", () => {
      const { container } = render(
        <UserAvatar
          name="John Doe"
          avatarUrl="https://example.com/avatar.jpg"
          size={32}
        />
      );
      const img = container.querySelector("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });
  });
});
