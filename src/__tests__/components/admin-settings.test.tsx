import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsClient } from "@/app/admin/dashboard/settings/settings-client";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Admin SettingsClient Component", () => {
  const mockAdminUser = {
    id: "admin-1",
    email: "admin@genz.in",
    fullName: "Admin User",
    avatarUrl: null,
    role: "admin" as const,
  };

  beforeEach(() => {
    localStorageMock.clear();
  });

  it("renders page header and navigation tab buttons", () => {
    render(<SettingsClient adminUser={mockAdminUser} />);
    expect(screen.getByText("Platform Settings")).toBeInTheDocument();
    expect(screen.getByText("General & Identity")).toBeInTheDocument();
    expect(screen.getByText("Seller Onboarding")).toBeInTheDocument();
    expect(screen.getByText("Security & Governance")).toBeInTheDocument();
    expect(screen.getByText("Alerts & Notifications")).toBeInTheDocument();
  });

  it("switches active tab content when tab is clicked", async () => {
    render(<SettingsClient adminUser={mockAdminUser} />);
    const onboardingTab = screen.getByRole("button", { name: /Seller Onboarding/i });

    fireEvent.click(onboardingTab);
    expect(
      await screen.findByText("Auto-Approve Seller Registrations")
    ).toBeInTheDocument();
  });

  it("updates input fields and persists settings when Save Changes is clicked", async () => {
    render(<SettingsClient adminUser={mockAdminUser} />);
    const nameInput = screen.getByDisplayValue("GenZ Enterprise Commerce Platform");

    fireEvent.change(nameInput, { target: { value: "Updated Enterprise Brand" } });
    expect(nameInput).toHaveValue("Updated Enterprise Brand");

    const saveBtn = screen.getByText("Save Settings");
    fireEvent.click(saveBtn);

    expect(
      await screen.findByText("System settings updated successfully.")
    ).toBeInTheDocument();
  });
});
