import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActionDropdown, ActionItem } from "@/components/ui/molecules/action-dropdown";
import { LocationSelectGroup } from "@/components/ui/molecules/location-select";
import { PhoneInputWithCountryCode } from "@/components/ui/molecules/phone-input";
import { Edit, Trash2 } from "lucide-react";

describe("Molecular Components (Molecules)", () => {
  describe("ActionDropdown", () => {
    const mockEdit = vi.fn();
    const mockDelete = vi.fn();
    const actions: ActionItem[] = [
      { label: "Edit Item", icon: <Edit />, onClick: mockEdit },
      {
        label: "Delete Item",
        icon: <Trash2 />,
        onClick: mockDelete,
        variant: "destructive",
      },
    ];

    it("renders action menu trigger button", () => {
      render(<ActionDropdown actions={actions} />);
      expect(screen.getByLabelText("Actions menu")).toBeInTheDocument();
    });

    it("opens action options on trigger click", () => {
      render(<ActionDropdown actions={actions} />);
      fireEvent.click(screen.getByLabelText("Actions menu"));
      expect(screen.getByText("Edit Item")).toBeInTheDocument();
      expect(screen.getByText("Delete Item")).toBeInTheDocument();
    });

    it("triggers item onClick action", () => {
      render(<ActionDropdown actions={actions} />);
      fireEvent.click(screen.getByLabelText("Actions menu"));
      fireEvent.click(screen.getByText("Edit Item"));
      expect(mockEdit).toHaveBeenCalled();
    });
  });

  describe("LocationSelectGroup", () => {
    it("renders country, state, city, and pincode fields", () => {
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
  });

  describe("PhoneInputWithCountryCode", () => {
    it("renders mobile phone number input and flag trigger", () => {
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
  });
});
