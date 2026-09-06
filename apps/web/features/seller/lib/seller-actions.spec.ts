import { describe, it, expect } from "vitest";

describe("Seller Actions & Verification Business Logic Specs", () => {
  function computeTargetStatus(newStatus: "pending" | "approved" | "rejected"): string {
    return newStatus === "approved" ? "verified" : newStatus;
  }

  function mergeSellerProfileWithApplication(
    existingProfile: {
      business_name?: string | null;
      gst_number?: string | null;
      factory_address?: string | null;
      city?: string | null;
      state?: string | null;
      pincode?: string | null;
    } | null,
    application: {
      business_name?: string;
      form_data?: Record<string, any>;
    } | null
  ) {
    const formData = application?.form_data || {};
    return {
      business_name:
        existingProfile?.business_name && existingProfile.business_name !== "Factory Seller"
          ? existingProfile.business_name
          : application?.business_name || formData.business_name || "Factory Seller",
      gst_number:
        existingProfile?.gst_number && existingProfile.gst_number !== "PENDING"
          ? existingProfile.gst_number
          : formData.gst_number || formData.gstNumber || "Pending",
      factory_address:
        existingProfile?.factory_address ||
        formData.factory_address ||
        formData.address ||
        formData.street_address ||
        null,
      city: existingProfile?.city || formData.city || null,
      state: existingProfile?.state || formData.state || null,
      pincode: existingProfile?.pincode || formData.pincode || formData.pin_code || null,
    };
  }

  it("maps approved status to verified status for seller profiles", () => {
    expect(computeTargetStatus("approved")).toBe("verified");
  });

  it("preserves pending and rejected statuses directly", () => {
    expect(computeTargetStatus("pending")).toBe("pending");
    expect(computeTargetStatus("rejected")).toBe("rejected");
  });

  it("intelligently fallbacks to application signup data when seller profile is empty", () => {
    const emptyProfile = null;
    const application = {
      business_name: "Channapatna Craft Collective",
      form_data: {
        gst_number: "29AAAAA0000A1Z5",
        address: "Craft Park, Industrial Area",
        city: "Ramanagara",
        state: "Karnataka",
        pincode: "562160",
      },
    };

    const merged = mergeSellerProfileWithApplication(emptyProfile, application);
    expect(merged.business_name).toBe("Channapatna Craft Collective");
    expect(merged.gst_number).toBe("29AAAAA0000A1Z5");
    expect(merged.factory_address).toBe("Craft Park, Industrial Area");
    expect(merged.city).toBe("Ramanagara");
    expect(merged.state).toBe("Karnataka");
    expect(merged.pincode).toBe("562160");
  });

  it("preserves existing verified seller profile values over raw application defaults", () => {
    const activeProfile = {
      business_name: "Verified Toys Corp",
      gst_number: "33BBBBB1111B2Z8",
      factory_address: "Custom Factory Rd",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600001",
    };
    const application = {
      business_name: "Old Draft Name",
      form_data: {
        gst_number: "OLDGST123",
      },
    };

    const merged = mergeSellerProfileWithApplication(activeProfile, application);
    expect(merged.business_name).toBe("Verified Toys Corp");
    expect(merged.gst_number).toBe("33BBBBB1111B2Z8");
    expect(merged.city).toBe("Chennai");
  });
});
