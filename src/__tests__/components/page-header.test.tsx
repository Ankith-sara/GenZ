import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { StatusBadge } from "@/components/ui/atoms/status-badge";
import { Button } from "@/components/ui/atoms/button";

describe("Admin Layout Primitives", () => {
  describe("PageHeader Component", () => {
    it("renders page title and description", () => {
      render(
        <PageHeader
          title="Product Catalog"
          description="Manage inventory items and pricing specs"
        />
      );

      expect(screen.getByText("Product Catalog")).toBeInTheDocument();
      expect(
        screen.getByText("Manage inventory items and pricing specs")
      ).toBeInTheDocument();
    });

    it("renders breadcrumbs when provided", () => {
      render(
        <PageHeader
          title="Verifications"
          breadcrumbs={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Audit" },
          ]}
        />
      );

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Audit")).toBeInTheDocument();
    });

    it("renders actions slot content when provided", () => {
      render(<PageHeader title="Sellers" actions={<Button>Add Seller</Button>} />);

      expect(screen.getByText("Add Seller")).toBeInTheDocument();
    });
  });

  describe("StatusBadge Component", () => {
    it("renders correct label and styles for pending status", () => {
      render(<StatusBadge status="pending" />);
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("renders correct label for approved/verified status", () => {
      render(<StatusBadge status="approved" />);
      expect(screen.getByText("Approved")).toBeInTheDocument();
    });

    it("renders correct label for rejected status", () => {
      render(<StatusBadge status="rejected" />);
      expect(screen.getByText("Rejected")).toBeInTheDocument();
    });
  });
});
