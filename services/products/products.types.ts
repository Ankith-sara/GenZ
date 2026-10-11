import type { Product, ProductStatus } from "@genz/types";

export interface CreateProductInput {
  name: string;
  category: string;
  description: string;
  price_inr: number;
  materials?: string[];
  sku?: string | null;
  seller_id: string;
  inventory_count?: number;
  low_stock_threshold?: number;
  track_inventory?: boolean;
  status?: ProductStatus;
  cover_image_path?: string | null;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  is_best_seller?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  category?: string;
  description?: string;
  price_inr?: number | null;
  materials?: string[];
  sku?: string | null;
  status?: ProductStatus;
  inventory_count?: number;
  low_stock_threshold?: number;
  track_inventory?: boolean;
  cover_image_path?: string | null;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  is_best_seller?: boolean;
}

export interface ProductQueryFilters {
  category?: string;
  sellerId?: string;
  status?: ProductStatus;
  search?: string;
  limit?: number;
  offset?: number;
}
