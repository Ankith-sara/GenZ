import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  fullNameSchema,
  gstSchema,
  loginSchema,
  signupSchema,
  sellerSignupSchema,
  waitlistSchema,
  contactSchema,
  newsletterSchema,
  productSchema,
  variantSchema,
  inquirySchema,
  sellerProfileSchema,
  adminRejectSchema,
  addressSchema,
} from "@/lib/validation";

describe("Domain Validation Schemas (src/lib/validation.ts)", () => {
  describe("Core Primitive Schemas", () => {
    it("validates valid email addresses", () => {
      const result = emailSchema.safeParse("user@example.com");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("user@example.com");
      }
    });

    it("rejects malformed email addresses", () => {
      const invalidEmails = ["notanemail", "user@", "@domain.com", "user@.com"];
      invalidEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });

    it("enforces minimum 8 character password length", () => {
      expect(passwordSchema.safeParse("1234567").success).toBe(false);
      expect(passwordSchema.safeParse("12345678").success).toBe(true);
      expect(passwordSchema.safeParse("securepass123").success).toBe(true);
    });

    it("requires full name to be non-empty", () => {
      expect(fullNameSchema.safeParse("").success).toBe(false);
      expect(fullNameSchema.safeParse("John Doe").success).toBe(true);
    });
  });

  describe("GSTIN Indian Tax Identifier Schema (gstSchema)", () => {
    it("validates valid 15-character GSTIN numbers", () => {
      // Standard GSTIN format: State(2) + PAN(10) + Entity(1) + Z(1) + Checksum(1)
      const validGstins = ["27AAPCU2282M1ZR", "07AAAAA0000A1Z5", "29ABCDE1234F2Z9"];
      validGstins.forEach((gst) => {
        const result = gstSchema.safeParse(gst);
        expect(result.success).toBe(true);
      });
    });

    it("rejects invalid GSTIN formats", () => {
      const invalidGstins = [
        "INVALIDGST",
        "123456789012345",
        "27AAPCU2282M12R", // Missing Z digit
        "27AAPCU2282M1Z", // Short length (14)
        "27AAPCU2282M1ZRR", // Extra length (16)
      ];
      invalidGstins.forEach((gst) => {
        const result = gstSchema.safeParse(gst);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Auth & Registration Schemas", () => {
    it("validates login schema", () => {
      const validLogin = {
        email: "user@example.com",
        password: "securePassword123",
      };
      expect(loginSchema.safeParse(validLogin).success).toBe(true);
    });

    it("validates buyer signup schema", () => {
      const validSignup = {
        email: "buyer@example.com",
        password: "securePassword123",
        fullName: "Jane Buyer",
        role: "buyer",
      };
      expect(signupSchema.safeParse(validSignup).success).toBe(true);
    });

    it("validates seller signup schema", () => {
      const validSellerSignup = {
        email: "factory@example.com",
        password: "factoryPassword123",
        fullName: "Rajesh Kumar",
        businessType: "Toys & Handicrafts",
      };
      const result = sellerSignupSchema.safeParse(validSellerSignup);
      expect(result.success).toBe(true);
    });

    it("rejects signups with invalid roles", () => {
      const invalidRoleSignup = {
        email: "user@example.com",
        password: "password123",
        fullName: "User Name",
        role: "superhero",
      };
      expect(signupSchema.safeParse(invalidRoleSignup).success).toBe(false);
    });
  });

  describe("Public Contact & Waitlist Schemas", () => {
    it("validates waitlist submissions with optional phone number", () => {
      const validEntry = {
        name: "Alice Smith",
        email: "alice@example.com",
        city: "Mumbai",
        phone: "+91 9876543210",
        role: "retailer",
      };
      expect(waitlistSchema.safeParse(validEntry).success).toBe(true);
    });

    it("validates contact form submission with pre-defined reason categories", () => {
      const validContact = {
        name: "Bob Jones",
        email: "bob@example.com",
        reason: "Seller partnership",
        message: "We want to sell wooden toys on your platform.",
      };
      expect(contactSchema.safeParse(validContact).success).toBe(true);

      const invalidReason = {
        ...validContact,
        reason: "Random Reason",
      };
      expect(contactSchema.safeParse(invalidReason).success).toBe(false);
    });

    it("validates newsletter subscription schema", () => {
      expect(newsletterSchema.safeParse({ email: "subscriber@genz.in" }).success).toBe(
        true
      );
      expect(newsletterSchema.safeParse({ email: "invalid-email" }).success).toBe(
        false
      );
    });
  });

  describe("Product & Catalog Schemas", () => {
    it("validates product schema with materials array", () => {
      const validProduct = {
        name: "Handcrafted Wooden Stacker",
        category: "Wooden Toys",
        age_group: "2-4 years",
        description: "Eco-friendly non-toxic wooden stacker toy.",
        price_inr: 499,
        materials: ["Natural Wood", "Non-Toxic Paint"],
      };
      expect(productSchema.safeParse(validProduct).success).toBe(true);
    });

    it("rejects negative product prices", () => {
      const negativePriceProduct = {
        name: "Wooden Block Set",
        category: "Wooden Toys",
        price_inr: -150,
      };
      expect(productSchema.safeParse(negativePriceProduct).success).toBe(false);
    });

    it("validates product variant schema", () => {
      const validVariant = {
        variant_name: "Color",
        variant_value: "Natural Walnut",
        price_inr: 599,
        stock_qty: 50,
      };
      expect(variantSchema.safeParse(validVariant).success).toBe(true);
    });

    it("validates buyer inquiry submission", () => {
      const validInquiry = {
        name: "Rohan Patel",
        email: "rohan@retailer.com",
        phone: "+91 9123456789",
        message: "Requesting quote for bulk order of 500 units.",
      };
      expect(inquirySchema.safeParse(validInquiry).success).toBe(true);
    });
  });

  describe("Seller Profile & Admin Action Schemas", () => {
    it("validates complete seller profile input", () => {
      const validProfile = {
        business_name: "Channapatna Craft Works",
        gst_number: "29ABCDE1234F2Z9",
        factory_address: "Plot 42, Industrial Area",
        city: "Ramanagara",
        state: "Karnataka",
        pincode: "571511",
        description: "Traditional wooden toy sellers since 1985.",
        established_year: 1985,
      };
      expect(sellerProfileSchema.safeParse(validProfile).success).toBe(true);
    });

    it("validates admin rejection reason schema", () => {
      expect(adminRejectSchema.safeParse({ reason: "" }).success).toBe(false);
      expect(
        adminRejectSchema.safeParse({
          reason: "GST Certificate document is unreadable. Please re-upload.",
        }).success
      ).toBe(true);
    });

    it("validates shipping address schema", () => {
      const validAddress = {
        id: "addr_123",
        recipientName: "Siddharth Rao",
        phone: "+91 9988776655",
        addressLine: "123 Main Street, Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560038",
      };
      expect(addressSchema.safeParse(validAddress).success).toBe(true);
    });
  });
});
