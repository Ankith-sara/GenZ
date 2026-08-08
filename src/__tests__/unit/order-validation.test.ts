import { describe, it, expect } from "vitest";
import { addressSchema, gstSchema } from "@/lib/validation";

describe("Order & Checkout Validation Schemas", () => {
  describe("addressSchema (Order Delivery)", () => {
    it("validates a complete order delivery address", () => {
      const validAddress = {
        id: "addr_101",
        recipientName: "Ankith Sharma",
        phone: "+919876543210",
        addressLine: "Plot 42, Hitech City Main Rd",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500081",
      };

      const result = addressSchema.safeParse(validAddress);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.city).toBe("Hyderabad");
        expect(result.data.pincode).toBe("500081");
      }
    });

    it("fails when recipient name is missing", () => {
      const invalidAddress = {
        id: "addr_102",
        recipientName: "",
        phone: "+919876543210",
        addressLine: "Industrial Area Phase II",
        city: "Tiruppur",
        state: "Tamil Nadu",
        pincode: "641602",
      };

      const result = addressSchema.safeParse(invalidAddress);
      expect(result.success).toBe(false);
    });

    it("fails when phone format is invalid", () => {
      const invalidAddress = {
        id: "addr_103",
        recipientName: "Vinod Kumar",
        phone: "invalid-phone",
        addressLine: "Textile Hub 5th Cross",
        city: "Surat",
        state: "Gujarat",
        pincode: "395002",
      };

      const result = addressSchema.safeParse(invalidAddress);
      expect(result.success).toBe(false);
    });
  });

  describe("gstSchema (Seller B2B Order Filing)", () => {
    it("validates valid 15-character Indian GSTIN format", () => {
      const validGst = "29ABCDE1234F1Z5";
      const result = gstSchema.safeParse(validGst);
      expect(result.success).toBe(true);
    });

    it("rejects invalid GSTIN strings", () => {
      const invalidGst = "INVALID_GST_NUM";
      const result = gstSchema.safeParse(invalidGst);
      expect(result.success).toBe(false);
    });
  });
});
