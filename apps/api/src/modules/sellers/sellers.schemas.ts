import { z } from "zod";

export const sellerParamsSchema = z.object({
  id: z.string().min(1),
});

export const productParamsSchema = z.object({
  id: z.string().min(1),
});

export const variantParamsSchema = z.object({
  id: z.string().min(1),
  variantId: z.string().min(1),
});

export const orderParamsSchema = z.object({
  orderId: z.string().min(1),
});

export const documentParamsSchema = z.object({
  id: z.string().min(1),
});

export const updateSellerProfileSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  gst_number: z.string().optional().default("PENDING"),
  factory_address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  established_year: z.number().int().optional().nullable(),
});

export const updateStudioSchema = z.object({
  maker_name: z.string().optional(),
  craft_title: z.string().optional(),
  bio: z.string().optional(),
  how_it_started: z.string().optional(),
  materials_and_technique: z.string().optional(),
  vision: z.string().optional(),
  milestones: z
    .array(
      z.object({
        year: z.string(),
        title: z.string(),
        desc: z.string(),
      })
    )
    .optional(),
});

export const uploadDocumentSchema = z.object({
  document_type: z.string().min(1, "Document type is required"),
  file_url: z.string().min(1, "File URL is required"),
  document_number: z.string().optional().nullable(),
  file_name: z.string().optional().nullable(),
  file_size: z.number().optional().nullable(),
});

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  category: z.string().default("toys"),
  description: z.string().optional().default(""),
  price_inr: z.number().nonnegative("Price cannot be negative"),
  materials: z.array(z.string()).optional().default([]),
  sku: z.string().optional().nullable(),
  inventory_count: z.number().int().nonnegative().optional().default(0),
  low_stock_threshold: z.number().int().nonnegative().optional().default(5),
  track_inventory: z.boolean().optional().default(true),
  is_featured: z.boolean().optional().default(false),
  is_new_arrival: z.boolean().optional().default(true),
  is_best_seller: z.boolean().optional().default(false),
  primary_image_url: z.string().optional().nullable(),
  image_urls: z.array(z.string()).optional().default([]),
  variants: z
    .array(
      z.object({
        title: z.string(),
        sku: z.string().optional().nullable(),
        price_inr: z.number().nonnegative().optional().nullable(),
        inventory_count: z.number().int().nonnegative().optional().default(0),
        attributes: z.record(z.string(), z.unknown()).optional().default({}),
      })
    )
    .optional()
    .default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const updateProductStatusSchema = z.object({
  status: z.enum(["draft", "published", "archived"]),
});

export const quickUpdateProductSchema = z.object({
  price_inr: z.number().nonnegative().optional(),
  inventory_count: z.number().int().nonnegative().optional(),
  is_featured: z.boolean().optional(),
  is_new_arrival: z.boolean().optional(),
  is_best_seller: z.boolean().optional(),
});

export const addVariantSchema = z.object({
  title: z.string().min(1, "Variant title is required"),
  sku: z.string().optional().nullable(),
  price_inr: z.number().nonnegative().optional().nullable(),
  inventory_count: z.number().int().nonnegative().optional().default(0),
  attributes: z.record(z.string(), z.unknown()).optional().default({}),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["placed", "processing", "shipped", "delivered", "cancelled"]),
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  note: z.string().optional(),
});

export const createReelSchema = z.object({
  product_id: z.string().optional().nullable(),
  video_url: z.string().min(1, "Video URL is required"),
  thumbnail_url: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
});

export const sellerProductsQuerySchema = z.object({
  status: z.enum(["draft", "published", "archived", "all"]).optional().default("all"),
  search: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const sellerOrdersQuerySchema = z.object({
  status: z.enum(["placed", "processing", "shipped", "delivered", "cancelled", "all"]).optional().default("all"),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type SellerParams = z.infer<typeof sellerParamsSchema>;
export type ProductParams = z.infer<typeof productParamsSchema>;
export type VariantParams = z.infer<typeof variantParamsSchema>;
export type OrderParams = z.infer<typeof orderParamsSchema>;
export type DocumentParams = z.infer<typeof documentParamsSchema>;
export type UpdateSellerProfileInput = z.infer<typeof updateSellerProfileSchema>;
export type UpdateStudioInput = z.infer<typeof updateStudioSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type QuickUpdateProductInput = z.infer<typeof quickUpdateProductSchema>;
export type AddVariantInput = z.infer<typeof addVariantSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CreateReelInput = z.infer<typeof createReelSchema>;
export type SellerProductsQuery = z.infer<typeof sellerProductsQuerySchema>;
export type SellerOrdersQuery = z.infer<typeof sellerOrdersQuerySchema>;

