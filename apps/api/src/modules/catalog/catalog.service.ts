import { getSupabaseAdminClient, getSupabaseClient } from "../../integrations/supabase";
import type { GetProductsQuery } from "./catalog.schemas";
import { NotFoundError } from "../../common/errors";

export class CatalogService {
  static async listProducts(query: GetProductsQuery) {
    const supabase = getSupabaseClient();
    const { q, category, minPrice, maxPrice, page, limit } = query;

    let dbQuery = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("status", "published");

    if (q) {
      const sanitized = q.trim().replace(/[%_]/g, "");
      if (sanitized) {
        dbQuery = dbQuery.or(
          `name.ilike.%${sanitized}%,category.ilike.%${sanitized}%,description.ilike.%${sanitized}%`
        );
      }
    }

    if (category) {
      dbQuery = dbQuery.eq("category", category);
    }

    if (minPrice !== undefined) {
      dbQuery = dbQuery.gte("price_inr", minPrice);
    }

    if (maxPrice !== undefined) {
      dbQuery = dbQuery.lte("price_inr", maxPrice);
    }

    const from = page * limit;
    const to = from + limit - 1;

    const { data, count, error } = await dbQuery
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to query catalog: ${error.message}`);
    }

    const products = data || [];
    const totalCount = count ?? products.length;
    const hasMore = from + products.length < totalCount;

    return {
      products,
      totalCount,
      page,
      limit,
      hasMore,
    };
  }

  static async getProductDetails(productId: string) {
    const supabase = getSupabaseAdminClient();

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("status", "published")
      .maybeSingle();

    if (error || !product) {
      throw new NotFoundError(`Product with id "${productId}" was not found or is unavailable.`);
    }

    // Parallel fetch: variants, images, reels, seller summary
    const [variantsRes, imagesRes, reelsRes, sellerRes] = await Promise.all([
      supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: true }),
      supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("position", { ascending: true }),
      supabase
        .from("reels")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false }),
      supabase
        .from("seller_profiles")
        .select("id, business_name, city, state, established_year, description")
        .eq("id", product.seller_id)
        .maybeSingle(),
    ]);

    let sellerSummary = null;
    if (sellerRes.data) {
      let bName = sellerRes.data.business_name;
      if (sellerRes.data.description && sellerRes.data.description.startsWith("{")) {
        try {
          const meta = JSON.parse(sellerRes.data.description);
          bName = (meta.business_name as string) || (meta.owner_name as string) || bName;
        } catch {}
      }
      sellerSummary = {
        id: sellerRes.data.id,
        businessName: bName,
        city: sellerRes.data.city,
        state: sellerRes.data.state,
        establishedYear: sellerRes.data.established_year,
      };
    }

    return {
      product,
      seller: sellerSummary,
      variants: variantsRes.data || [],
      images: imagesRes.data || [],
      reels: reelsRes.data || [],
    };
  }

  static async getFeatured() {
    const admin = getSupabaseAdminClient();

    const [productsRes, sellersRes] = await Promise.all([
      admin
        .from("products")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(20),
      admin
        .from("seller_profiles")
        .select("id, business_name, city, state, established_year, description")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const sellers = (sellersRes.data || []).map((s) => {
      let bName = s.business_name;
      if (s.description && s.description.startsWith("{")) {
        try {
          const meta = JSON.parse(s.description);
          bName = (meta.business_name as string) || (meta.owner_name as string) || bName;
        } catch {}
      }
      return {
        id: s.id,
        businessName: bName,
        city: s.city,
        state: s.state,
        establishedYear: s.established_year,
      };
    });

    return {
      products: productsRes.data || [],
      sellers,
    };
  }
}

