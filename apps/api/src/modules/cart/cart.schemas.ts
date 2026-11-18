import { z } from "zod";

export const cartItemInputSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().positive().max(100),
});

export const validateCartSchema = z.object({
  items: z.array(cartItemInputSchema).min(1, "Cart cannot be empty"),
});

export type ValidateCartInput = z.infer<typeof validateCartSchema>;

