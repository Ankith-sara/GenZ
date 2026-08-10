import { z } from "zod";

// --- Custom Patterns ---
const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,20}$/;
const pincodeRegex = /^[a-zA-Z0-9\s\-]{3,10}$/; // Multi-country postal code safety

// --- Auth Schemas ---
export const emailSchema = z.string().email("Invalid email address").max(255).trim();
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72)
  .trim();
export const fullNameSchema = z.string().min(1, "Name is required").max(100).trim();
export const publicRoleSchema = z.enum(["buyer", "seller"]);
export const roleSchema = publicRoleSchema;
export const tokenSchema = z
  .string()
  .min(6, "Verification code must be at least 6 characters")
  .max(10)
  .trim();

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const otpLoginSchema = z.object({
  email: emailSchema,
  token: tokenSchema,
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  role: roleSchema,
});

// --- GSTIN / Trade ID Verification Schemas ---
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const TRADE_ID_REGEX = /^[A-Z0-9\-\/]{5,20}$/;

export const gstSchema = z
  .string()
  .min(1, "GSTIN / Trade ID is required")
  .trim()
  .transform((val) => val.toUpperCase())
  .refine(
    (val) => GSTIN_REGEX.test(val) || TRADE_ID_REGEX.test(val),
    "Invalid GSTIN or Trade ID (15-character GSTIN e.g. 22AAAAA0000A1Z5 or valid Trade ID required)"
  );

export function validateGstOrTradeId(val: string): {
  isValid: boolean;
  type: "GSTIN" | "Trade ID" | "invalid" | "empty";
  message: string;
} {
  const trimmed = val.trim().toUpperCase();
  if (!trimmed) {
    return { isValid: false, type: "empty", message: "GSTIN is required" };
  }
  if (GSTIN_REGEX.test(trimmed)) {
    return { isValid: true, type: "GSTIN", message: "Valid 15-character GSTIN" };
  }
  if (TRADE_ID_REGEX.test(trimmed)) {
    return {
      isValid: true,
      type: "Trade ID",
      message: "Valid Business Registration ID",
    };
  }
  return {
    isValid: false,
    type: "invalid",
    message: "Invalid format. Expected 15-character GSTIN (e.g. 22AAAAA0000A1Z5)",
  };
}

export const sellerSignupSchema = z.object({
  email: emailSchema,
  password: passwordSchema.optional().or(z.literal("")),
  fullName: fullNameSchema,
  businessType: z.string().max(100).trim().default("seller"),
  gstNumber: gstSchema.optional().or(z.literal("")),
});

// --- Public Form Schemas ---
export const waitlistSchema = z.object({
  name: fullNameSchema,
  email: emailSchema,
  city: z.string().max(100).trim().nullable().optional(),
  phone: z
    .string()
    .regex(PHONE_PATTERN, "Invalid phone number format")
    .nullable()
    .optional()
    .or(z.literal("")),
  role: z.string().max(50).trim(),
});

export const contactSchema = z.object({
  name: fullNameSchema,
  email: emailSchema,
  reason: z.enum(["General", "Seller partnership", "Investor / Incubator", "Press"]),
  message: z
    .string()
    .min(1, "Message is required")
    .max(5000, "Message is too long")
    .trim(),
});

export const newsletterSchema = z.object({
  email: emailSchema,
});

// --- Product & Catalog Schemas ---
export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(100),
  category: z.string().min(1, "Category is required").max(50).trim(),
  age_group: z.string().max(50).trim().nullable().optional(),
  description: z.string().max(2000).trim().nullable().optional(),
  price_inr: z
    .number()
    .nonnegative("Price must be a positive number")
    .nullable()
    .optional(),
  materials: z.array(z.string().max(50)).max(10).default([]),
});

export const variantSchema = z.object({
  variant_name: z.string().min(1, "Variant name is required").max(50).trim(),
  variant_value: z.string().min(1, "Variant value is required").max(50).trim(),
  price_inr: z
    .number()
    .nonnegative("Price must be a positive number")
    .nullable()
    .optional(),
  stock_qty: z
    .number()
    .int()
    .nonnegative("Stock must be a non-negative integer")
    .nullable()
    .optional(),
});

export const inquirySchema = z.object({
  name: fullNameSchema,
  email: emailSchema,
  phone: z
    .string()
    .regex(PHONE_PATTERN, "Invalid phone number format")
    .nullable()
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .min(1, "Message is required")
    .max(2000, "Message is too long")
    .trim(),
});

// --- Profile & Address Schemas ---
export const profileSchema = z.object({
  fullName: fullNameSchema,
  phone: z.string().regex(PHONE_PATTERN, "Invalid phone number format").max(20).trim(),
  city: z.string().min(1, "City is required").max(100).trim(),
});

export const addressSchema = z.object({
  id: z.string().max(100),
  recipientName: fullNameSchema,
  phone: z.string().regex(PHONE_PATTERN, "Invalid phone number format").max(20).trim(),
  addressLine: z.string().min(1, "Address is required").max(200).trim(),
  city: z.string().min(1, "City is required").max(100).trim(),
  state: z.string().min(1, "State is required").max(100).trim(),
  pincode: z.string().regex(pincodeRegex, "Invalid postal code").trim(),
});

export const addressesSchema = z.array(addressSchema);

// --- Seller Verification Profile Schemas ---

export const sellerProfileSchema = z.object({
  business_name: z.string().min(1, "Business name is required").max(200).trim(),
  gst_number: gstSchema,
  factory_address: z.string().max(500).trim().nullable().optional(),
  city: z.string().max(100).trim().nullable().optional(),
  state: z.string().max(100).trim().nullable().optional(),
  pincode: z
    .string()
    .regex(pincodeRegex, "Invalid PIN code")
    .nullable()
    .optional()
    .or(z.literal("")),
  description: z.string().max(1000).trim().nullable().optional(),
  established_year: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .nullable()
    .optional(),
});

export const adminRejectSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required").max(1000).trim(),
});
