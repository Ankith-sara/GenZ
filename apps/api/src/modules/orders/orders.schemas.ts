import { z } from "zod";

export const orderParamsSchema = z.object({
  orderId: z.string().min(1),
});

export const cancelOrderSchema = z.object({
  reason: z.string().max(200).optional(),
});

export const requestReturnSchema = z.object({
  reason: z.string().min(5).max(500),
});

