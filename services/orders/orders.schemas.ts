import { z } from "zod";

export const orderStatusSchema = z.enum([
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const orderItemSchema = z.object({
  productId: z.string().optional(),
  product_id: z.string().optional(),
  name: z.string().optional(),
  product_name: z.string().optional(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  sellerId: z.string().optional(),
  seller_id: z.string().optional(),
  sellerBusinessName: z.string().optional(),
  image: z.string().optional(),
});

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().default("India"),
  phone: z.string().min(10),
});
