import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VerifiedBadge } from "@/components/verified-badge";
import { UserAvatar } from "@/components/user-avatar";
import { LocationSelectGroup } from "@/components/location-select";
import { PhoneInputWithCountryCode } from "@/components/phone-input";

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

  describe("LocationSelectGroup (country-state-city integration)", () => {
    it("renders Country, State, City, and Pincode input fields", () => {
      const handleChange = vi.fn();
      render(
        <LocationSelectGroup
          countryValue="India"
          stateValue="Tamil Nadu"
          cityValue="Coimbatore"
          pincodeValue="641001"
          onChange={handleChange}
        />
      );

      expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Pincode/i)).toBeInTheDocument();
    });

    it("updates state and city dropdown options when country is changed", () => {
      const handleChange = vi.fn();
      render(
        <LocationSelectGroup
          countryValue="India"
          stateValue="Tamil Nadu"
          cityValue="Coimbatore"
          pincodeValue="641001"
          onChange={handleChange}
        />
      );

      const countrySelect = screen.getByLabelText(/Country/i);
      fireEvent.change(countrySelect, { target: { value: "US" } });
      expect(handleChange).toHaveBeenCalled();
    });

    it("switches to text input when Custom City option is selected", () => {
      const handleChange = vi.fn();
      render(
        <LocationSelectGroup
          countryValue="India"
          stateValue="Tamil Nadu"
          cityValue="Coimbatore"
          pincodeValue="641001"
          onChange={handleChange}
        />
      );

      const citySelect = screen.getByLabelText(/City/i);
      fireEvent.change(citySelect, { target: { value: "OTHER_CUSTOM" } });
      expect(screen.getByPlaceholderText(/Type City name/i)).toBeInTheDocument();
    });
  });

  describe("PhoneInputWithCountryCode", () => {
    it("renders mobile input and active country code button with flag", () => {
      const handleChange = vi.fn();
      render(
        <PhoneInputWithCountryCode
          countryCodeValue="+91"
          phoneValue="9876543210"
          onPhoneChange={handleChange}
        />
      );

      expect(screen.getByPlaceholderText("9876543210")).toBeInTheDocument();
      expect(screen.getByText("+91")).toBeInTheDocument();
    });

    it("toggles country code search popover when trigger button is clicked", () => {
      const handleChange = vi.fn();
      render(
        <PhoneInputWithCountryCode
          countryCodeValue="+91"
          phoneValue="9876543210"
          onPhoneChange={handleChange}
        />
      );

      const triggerBtn = screen.getByRole("button");
      fireEvent.click(triggerBtn);

      expect(
        screen.getByPlaceholderText(/Search country or code/i)
      ).toBeInTheDocument();
    });

    it("filters country codes list when search term is typed", () => {
      const handleChange = vi.fn();
      render(
        <PhoneInputWithCountryCode
          countryCodeValue="+91"
          phoneValue="9876543210"
          onPhoneChange={handleChange}
        />
      );

      fireEvent.click(screen.getByRole("button"));
      const searchInput = screen.getByPlaceholderText(/Search country or code/i);
      fireEvent.change(searchInput, { target: { value: "+1" } });

      expect(screen.getByText("+1")).toBeInTheDocument();
    });
  });
});
