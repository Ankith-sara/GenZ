import { z } from "zod";

export const checkoutAddressSchema = z.object({
  recipientName: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  addressLine: z.string().min(5).max(250),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
});

export const checkoutPaymentSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("razorpay"),
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
  }),
  z.object({
    method: z.literal("upi_qr"),
    utr: z.string().min(6).max(30),
    payerAccount: z.string().optional(),
  }),
  z.object({
    method: z.literal("cod"),
  }),
]);

export const createCheckoutOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        quantity: z.number().int().positive().max(100),
      })
    )
    .min(1, "Items array must not be empty"),
  shippingAddress: checkoutAddressSchema,
  guestEmail: z.string().email().optional(),
  expectedTotalInr: z.number().positive().optional(),
  clientCalculatedTotal: z.number().positive().optional(),
  payment: checkoutPaymentSchema,
  notes: z.string().max(500).optional(),
});

export type CreateCheckoutOrderInput = z.infer<typeof createCheckoutOrderSchema>;
