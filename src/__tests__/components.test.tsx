import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/ui/atoms/status-badge";
import { UserAvatar } from "@/components/ui/atoms/user-avatar";
import { VerifiedBadge } from "@/components/ui/atoms/verified-badge";
import { LocationSelectGroup } from "@/components/ui/molecules/location-select";
import { PhoneInputWithCountryCode } from "@/components/ui/molecules/phone-input";

describe("Component Tests", () => {
  describe("StatusBadge", () => {
    it("renders Pending badge correctly", () => {
      render(<StatusBadge status="pending" />);
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("renders Approved badge correctly", () => {
      render(<StatusBadge status="approved" />);
      expect(screen.getByText("Approved")).toBeInTheDocument();
    });

    it("renders Rejected badge correctly", () => {
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
    it("renders GST Verified label", () => {
      render(<VerifiedBadge />);
      expect(screen.getByText("GST Verified")).toBeInTheDocument();
    });
  });

  describe("LocationSelectGroup", () => {
    it("renders location input fields", () => {
      render(
        <LocationSelectGroup
          countryValue="India"
          stateValue="Karnataka"
          cityValue="Bengaluru"
          pincodeValue="560001"
          onChange={() => {}}
        />
      );
      expect(screen.getByDisplayValue(/India/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue("Karnataka")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Bengaluru")).toBeInTheDocument();
      expect(screen.getByDisplayValue("560001")).toBeInTheDocument();
    });
  });

  describe("PhoneInputWithCountryCode", () => {
    it("renders country code and phone number inputs", () => {
      render(
        <PhoneInputWithCountryCode
          countryCodeValue="+91"
          phoneValue="9876543210"
          onCountryCodeChange={() => {}}
          onPhoneChange={() => {}}
        />
      );
      expect(screen.getByDisplayValue("+91")).toBeInTheDocument();
      expect(screen.getByDisplayValue("9876543210")).toBeInTheDocument();
    });
  });
});
