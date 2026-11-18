import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  city: z.string().max(50).optional(),
});

export const addressSchema = z.object({
  id: z.string().optional(),
  recipientName: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  addressLine: z.string().min(5).max(250),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = addressSchema.partial();

export const addressParamsSchema = z.object({
  addressId: z.string().min(1),
});

