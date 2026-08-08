import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { MetricCard } from "@/components/ui/organisms/metric-card";
import { Button } from "@/components/ui/atoms/button";
import { Users } from "lucide-react";

describe("Organism Components (Organisms)", () => {
  describe("PageHeader", () => {
    it("renders page title, description, and breadcrumbs", () => {
      render(
        <PageHeader
          title="Seller Directory"
          description="Browse and manage active verified manufacturers"
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Sellers" },
          ]}
        />
      );

      expect(screen.getByText("Seller Directory")).toBeInTheDocument();
      expect(
        screen.getByText("Browse and manage active verified manufacturers")
      ).toBeInTheDocument();
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("Sellers")).toBeInTheDocument();
    });

    it("renders action slot elements", () => {
      render(
        <PageHeader title="Orders Overview" actions={<Button>Export Orders</Button>} />
      );

      expect(screen.getByText("Export Orders")).toBeInTheDocument();
    });
  });

  describe("MetricCard", () => {
    it("renders metric title, value, change indicator, and icon", () => {
      render(
        <MetricCard
          title="Total Active Sellers"
          value="1,240"
          change="+12.5% this month"
          changeType="increase"
          icon={<Users data-testid="users-icon" />}
        />
      );

      expect(screen.getByText("Total Active Sellers")).toBeInTheDocument();
      expect(screen.getByText("1,240")).toBeInTheDocument();
      expect(screen.getByText("+12.5% this month")).toBeInTheDocument();
      expect(screen.getByTestId("users-icon")).toBeInTheDocument();
    });
  });
});
