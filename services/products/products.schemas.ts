import { z } from "zod";
import { productSchema, variantSchema } from "@genz/validation";

export const createProductSchema = productSchema;
export const updateProductSchema = productSchema.partial();
export const productVariantSchema = variantSchema;

export const productsQuerySchema = z.object({
  category: z.string().optional(),
  sellerId: z.string().uuid().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  search: z.string().max(100).optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

// Backward-compatibility alias
export const catalogQuerySchema = productsQuerySchema;
