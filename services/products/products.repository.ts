import { createAdminClient } from "@genz/database/admin";
import type { Product, ProductStatus } from "@genz/types";
import type {
  CreateProductInput,
  ProductQueryFilters,
  UpdateProductInput,
} from "./products.types";

export class ProductsRepository {
  /**
   * Retrieves a product by its ID
   */
  static async getById(productId: string): Promise<Product | null> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (error || !data) return null;
    return data as unknown as Product;
  }

  /**
   * Queries products with optional filters
   */
  static async list(filters: ProductQueryFilters = {}): Promise<{
    products: Product[];
    totalCount: number;
  }> {
    const admin = createAdminClient();
    let query = admin.from("products").select("*", { count: "exact" });

    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.category) {
      query = query.eq("category", filters.category);
    }
    if (filters.sellerId) {
      query = query.eq("seller_id", filters.sellerId);
    }
    if (filters.search) {
      const sanitized = filters.search.replace(/[%_]/g, "");
      query = query.or(
        `name.ilike.%${sanitized}%,category.ilike.%${sanitized}%,description.ilike.%${sanitized}%`
      );
    }

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      throw new Error(`Failed to list products: ${error.message}`);
    }

    return {
      products: (data || []) as unknown as Product[],
      totalCount: count ?? (data?.length || 0),
    };
  }

  /**
   * Inserts a new product record
   */
  static async create(input: CreateProductInput): Promise<Product> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("products")
      .insert({
        ...input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create product: ${error?.message || "Unknown error"}`);
    }

    return data as unknown as Product;
  }

  /**
   * Updates an existing product record
   */
  static async update(
    productId: string,
    input: UpdateProductInput
  ): Promise<Product> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("products")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update product: ${error?.message || "Unknown error"}`);
    }

    return data as unknown as Product;
  }

  /**
   * Updates product status
   */
  static async setStatus(
    productId: string,
    status: ProductStatus
  ): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin
      .from("products")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", productId);

    if (error) {
      throw new Error(`Failed to update product status: ${error.message}`);
    }
  }

  /**
   * Retrieves all distinct product categories from the database
   */
  static async getCategories(): Promise<string[]> {
    try {
      const { getPlatformCategories } = await import("@genz/database/categories");
      const list = await getPlatformCategories();
      if (list && list.length > 0) {
        return list.map((c) => c.name);
      }
    } catch {}

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("products")
      .select("category")
      .eq("status", "published");

    if (error || !data) return [];
    const set = new Set<string>();
    for (const row of data) {
      if (row.category && typeof row.category === "string" && row.category.trim()) {
        set.add(row.category.trim());
      }
    }
    return Array.from(set).sort();
  }
}

// Backward-compatibility alias
export { ProductsRepository as CatalogRepository };
