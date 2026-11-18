import { z } from "zod";

export const createRazorpayOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        quantity: z.number().int().positive().max(100),
      })
    )
    .min(1, "Items array must not be empty"),
  receipt: z.string().max(40).optional(),
  notes: z.record(z.string()).optional(),
});

export type CreateRazorpayOrderInput = z.infer<typeof createRazorpayOrderSchema>;

export const verifyRazorpayPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export type VerifyRazorpayPaymentInput = z.infer<typeof verifyRazorpayPaymentSchema>;

