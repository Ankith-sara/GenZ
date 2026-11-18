import { z } from "zod";

export const searchProductsQuerySchema = z.object({
  q: z.string().max(100).optional().default(""),
  limit: z.coerce.number().int().positive().max(50).default(8),
});

export type SearchProductsQuery = z.infer<typeof searchProductsQuerySchema>;

