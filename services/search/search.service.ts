import { createAdminClient } from "@genz/database/admin";
import type { SearchQueryParams, SearchResponse } from "./search.types";

export class SearchService {
  /**
   * Sanitizes input search query term by removing illegal wildcards
   */
  static sanitizeQuery(query: string): string {
    return query.replace(/[%_]/g, "").trim();
  }

  /**
   * Dynamically retrieves distinct categories from the database
   */
  static async getCategories(): Promise<string[]> {
    try {
      const { getPlatformCategories } = await import("@genz/database/categories");
      const list = await getPlatformCategories();
      if (list && list.length > 0) {
        return list.map((c) => c.name);
      }
    } catch {}

    try {
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
    } catch {
      return [];
    }
  }

  /**
   * Multi-field search for products matching name, category, or description
   */
  static async searchProducts(params: SearchQueryParams): Promise<SearchResponse> {
    const rawQ = params.query.trim();
    const dbCategories = await this.getCategories();
    if (!rawQ) {
      return {
        products: [],
        categories: dbCategories,
        totalCount: 0,
      };
    }

    const cleanQ = this.sanitizeQuery(rawQ);
    const matchingCategories = dbCategories.filter((cat) =>
      cat.toLowerCase().includes(cleanQ.toLowerCase())
    );

    const admin = createAdminClient();
    const limit = Math.min(params.limit || 8, 50);

    const { data, count, error } = await admin
      .from("products")
      .select("id, name, category, description, price_inr, cover_image_path, status, created_at", {
        count: "exact",
      })
      .eq("status", "published")
      .or(`name.ilike.%${cleanQ}%,category.ilike.%${cleanQ}%,description.ilike.%${cleanQ}%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Search query failed: ${error.message}`);
    }

    const formattedProducts = (data ?? []).map((p) => {
      let imageUrl = "/images/placeholder-product.svg";
      if (p.cover_image_path) {
        imageUrl = p.cover_image_path.startsWith("http")
          ? p.cover_image_path
          : `/storage/v1/object/public/product-media/${p.cover_image_path}`;
      }

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price_inr: p.price_inr ?? 0,
        image_url: imageUrl,
      };
    });

    return {
      products: formattedProducts,
      categories: matchingCategories,
      totalCount: count ?? formattedProducts.length,
    };
  }
}
