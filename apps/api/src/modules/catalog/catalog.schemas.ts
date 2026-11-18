import { z } from "zod";

export const getProductsQuerySchema = z.object({
  q: z.string().max(100).optional().default(""),
  category: z.string().max(100).optional().default(""),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;

export const getProductParamsSchema = z.object({
  id: z.string().min(1),
});

export type GetProductParams = z.infer<typeof getProductParamsSchema>;

