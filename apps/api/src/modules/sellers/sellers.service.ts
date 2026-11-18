import { getSupabaseAdminClient } from "../../integrations/supabase";
import { NotFoundError, ForbiddenError, ValidationError } from "../../common/errors";
import { OrdersService } from "@genz/services/orders";
import type { OrderStatus } from "@genz/types";
import type {
  UpdateSellerProfileInput,
  UpdateStudioInput,
  UploadDocumentInput,
  CreateProductInput,
  UpdateProductInput,
  QuickUpdateProductInput,
  AddVariantInput,
  UpdateOrderStatusInput,
  CreateReelInput,
  SellerProductsQuery,
  SellerOrdersQuery,
} from "./sellers.schemas";

interface OrderLineItemLike {
  sellerId?: string;
  seller_id?: string;
  price?: number;
  quantity?: number;
  [key: string]: unknown;
}

// Curated artisan profiles for master craft clusters
const POLUMURI_NAGESWARA_RAO_PROFILE = {
  id: "etikoppaka-lacquer-crafts",
  business_name: "Etikoppaka Heritage Lacquer Toys",
  maker_name: "Polumuri Nageswara Rao",
  craft_title: "Second-Generation Master Artisan & GI Craft Custodian",
  city: "Etikoppaka",
  state: "Andhra Pradesh",
  established_year: 1984,
  avatar_url: "/polumuri_nageswara_rao.jpg",
  cover_url: "/machine_work.png",
  description:
    "Born in Etikoppaka. Shaped by generations. Along the Varaha River in Andhra Pradesh, second-generation artisan Polumuri Nageswara Rao carries forward 400-year-old GI-certified turned-wood lacquer craft using native Ankudi Karra wood and non-toxic natural dyes.",
  story: {
    how_it_started:
      "Along the banks of the Varaha River in Andhra Pradesh lies the village of Etikoppaka, a place where turned-wood lacquer craft has been passed from one generation to the next for more than 400 years. Polumuri Nageswara Rao is a second-generation artisan, born into a family deeply connected to the craft as the son of senior artisan Polumuri Talla Chari.",
    generations_heritage:
      "Preserving an ancient craft doesn't mean freezing it in the past. Nageswara Rao represents artisans who innovate with new forms—from traditional dolls and animal figurines to educational STEM toys, games, and contemporary lifestyle products. He was an artisan participant in The India Toy Fair 2021 and conducted toy-making masterclasses at FDDI Hyderabad.",
    materials_and_technique:
      "Turned exclusively from soft Ankudi Karra wood on a traditional lathe. Pure lac is applied by hand while the wood turns, using natural friction heat to melt and bind the lacquer. Vibrant, lead-free colors derived from seeds, bark, roots, and leaves give the toys their distinctive non-toxic character.",
    vision:
      "To build a direct bridge from the artisan's workshop in Etikoppaka to homes across the world via GenZ—ensuring the maker receives fair value for lifelong heritage knowledge without intermediary markups.",
    milestones: [
      {
        year: "1984",
        title: "Ancestral Inheritance",
        desc: "Trained under father & senior artisan Polumuri Talla Chari.",
      },
      {
        year: "2017",
        title: "Official GI Registration",
        desc: "Etikoppaka Toys granted Geographical Indication (GI) registration by Government of India.",
      },
      {
        year: "2021",
        title: "The India Toy Fair",
        desc: "Artisan participant representing Etikoppaka in the national toy-figure category.",
      },
      {
        year: "2023",
        title: "FDDI Hyderabad Masterclass",
        desc: "Invited by FDDI Hyderabad to conduct traditional toy-making workshops.",
      },
    ],
  },
};

const CURATED_ARTISANS: Record<string, typeof POLUMURI_NAGESWARA_RAO_PROFILE> = {
  "etikoppaka-lacquer-crafts": POLUMURI_NAGESWARA_RAO_PROFILE,
  "polumuri-nageswara-rao": {
    ...POLUMURI_NAGESWARA_RAO_PROFILE,
    id: "polumuri-nageswara-rao",
  },
  "fab03143-9d65-47cf-bdc0-53db548b1005": {
    ...POLUMURI_NAGESWARA_RAO_PROFILE,
    id: "fab03143-9d65-47cf-bdc0-53db548b1005",
  },
};

export class SellersService {
  /**
   * 1. Public Profile for customer storefront / discover page
   */
  static async getPublicProfile(sellerId: string) {
    const admin = getSupabaseAdminClient();
    const curated = CURATED_ARTISANS[sellerId];

    const [sellerRes, userRes, productsRes, reelsRes] = await Promise.all([
      admin.from("seller_profiles").select("*").eq("id", sellerId).maybeSingle(),
      admin
        .from("profiles")
        .select("avatar_url, full_name")
        .eq("id", sellerId)
        .maybeSingle(),
      admin
        .from("products")
        .select("*")
        .eq("seller_id", sellerId)
        .eq("status", "published")
        .order("created_at", { ascending: false }),
      admin
        .from("reels")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false }),
    ]);

    if (!curated && !sellerRes.data) {
      throw new NotFoundError(`Seller with id "${sellerId}" was not found.`);
    }

    let profileData: Record<string, unknown> = {};

    if (curated) {
      profileData = { ...curated };
    } else if (sellerRes.data) {
      const dbSeller = sellerRes.data;
      let meta: Record<string, unknown> = {};
      let plainBio = dbSeller.description || "";
      if (dbSeller.description && dbSeller.description.startsWith("{")) {
        try {
          meta = JSON.parse(dbSeller.description);
          plainBio = (meta.short_bio as string) || (meta.description as string) || "";
        } catch {}
      }

      profileData = {
        id: dbSeller.id,
        business_name: (meta.business_name as string) || dbSeller.business_name,
        maker_name:
          (meta.maker_name as string) ||
          (meta.owner_name as string) ||
          userRes.data?.full_name ||
          null,
        craft_title:
          (meta.craft_title as string) ||
          (meta.craft_category as string) ||
          "Artisan & Manufacturer",
        city: dbSeller.city,
        state: dbSeller.state,
        established_year: dbSeller.established_year,
        avatar_url: (meta.avatar_url as string) || userRes.data?.avatar_url || null,
        cover_url: (meta.cover_url as string) || null,
        description: plainBio,
        story: meta.story || null,
      };
    }

    return {
      seller: profileData,
      profile: profileData,
      products: productsRes.data || [],
      reels: reelsRes.data || [],
    };
  }

  /**
   * 2. Seller Dashboard Overview Metrics
   */
  static async getSellerOverview(sellerId: string, email?: string) {
    const admin = getSupabaseAdminClient();

    const [
      productsCountRes,
      sellerOrdersRaw,
      documentsCountRes,
      profileRes,
      recentProductsRes,
    ] = await Promise.all([
      admin
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", sellerId),
      OrdersService.getSellerOrders(sellerId).catch(() => []),
      admin
        .from("seller_documents")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", sellerId),
      admin.from("seller_profiles").select("*").eq("id", sellerId).maybeSingle(),
      admin
        .from("products")
        .select("*")
        .eq("seller_id", sellerId)
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

    // Intelligent fallback for store business name
    let storeName = profileRes.data?.business_name;
    if (!storeName || storeName === "Factory Seller") {
      if (email) {
        try {
          const { data: appRow } = await admin
            .from("seller_applications")
            .select("business_name, full_name, form_data")
            .ilike("email", email.trim().toLowerCase())
            .limit(1)
            .maybeSingle();
          if (appRow) {
            const fd = (appRow.form_data || {}) as Record<string, unknown>;
            storeName =
              appRow.business_name || (fd.business_name as string) || appRow.full_name;
          }
        } catch {}
      }
    }
    storeName = storeName || "Seller Store";

    // Scope orders to authenticated seller and calculate genuine financials
    const rawList = Array.isArray(sellerOrdersRaw) ? sellerOrdersRaw : [];
    const scopedOrders = rawList.map((order) => {
      const sellerItems = (order.items || []).filter(
        (item: OrderLineItemLike) => (item.sellerId || item.seller_id) === sellerId
      );
      const sellerSubtotal = sellerItems.reduce(
        (sum: number, item: OrderLineItemLike) =>
          sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      );
      return {
        ...order,
        items: sellerItems.length > 0 ? sellerItems : order.items,
        totalAmount: sellerItems.length > 0 ? sellerSubtotal : order.totalAmount,
      };
    });

    const totalOrdersCount = scopedOrders.length;
    const pendingOrders = scopedOrders.filter(
      (o) => o.status === "placed" || o.status === "processing"
    ).length;
    const deliveredOrders = scopedOrders.filter((o) => o.status === "delivered").length;
    const totalRevenue = scopedOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const isVerified = profileRes.data?.status === "verified";

    return {
      storeName,
      isVerified,
      productCount: productsCountRes.count ?? 0,
      totalOrdersCount,
      pendingOrdersCount: pendingOrders,
      deliveredOrdersCount: deliveredOrders,
      documentCount: documentsCountRes.count ?? 0,
      totalRevenue,
      sellerProfile: profileRes.data || null,
      recentProducts: recentProductsRes.data || [],
      recentOrders: scopedOrders.slice(0, 5),
    };
  }

  /**
   * 3. Get Seller Profile with intelligent fallback
   */
  static async getSellerProfile(sellerId: string, email?: string) {
    const admin = getSupabaseAdminClient();

    const [profileRes, userRes] = await Promise.all([
      admin.from("seller_profiles").select("*").eq("id", sellerId).maybeSingle(),
      admin
        .from("profiles")
        .select("avatar_url, full_name")
        .eq("id", sellerId)
        .maybeSingle(),
    ]);

    let profile: Record<string, unknown> | null = profileRes.data;

    // Fallback to seller_applications if profile is missing or sparse
    if (
      !profile ||
      !profile.business_name ||
      profile.business_name === "Factory Seller"
    ) {
      if (email) {
        const { data: appRow } = await admin
          .from("seller_applications")
          .select("*")
          .ilike("email", email.trim().toLowerCase())
          .limit(1)
          .maybeSingle();

        if (appRow) {
          const fd = (appRow.form_data || {}) as Record<string, unknown>;
          profile = {
            id: sellerId,
            business_name:
              appRow.business_name || (fd.business_name as string) || appRow.full_name,
            gst_number: String(fd.gst_number || fd.gstin || "PENDING"),
            factory_address: String(fd.factory_address || fd.address || "") || null,
            city: String(fd.city || "") || null,
            state: String(fd.state || "") || null,
            pincode: String(fd.pincode || "") || null,
            established_year: fd.years_in_business
              ? new Date().getFullYear() - Number(fd.years_in_business)
              : null,
            status: "verified",
            description: null,
            rejection_reason: null,
            submitted_at: appRow.created_at,
            reviewed_at: null,
            reviewed_by: null,
            updated_at: new Date().toISOString(),
          } as Record<string, unknown>;
        }
      }
    }

    return {
      profile: profile || null,
      user: userRes.data || null,
    };
  }

  /**
   * 4. Update Seller Profile
   */
  static async updateSellerProfile(sellerId: string, input: UpdateSellerProfileInput) {
    const admin = getSupabaseAdminClient();

    const { error: dbError } = await admin.from("seller_profiles").upsert(
      {
        id: sellerId,
        business_name: input.business_name,
        gst_number: input.gst_number || "PENDING",
        factory_address: input.factory_address || null,
        city: input.city || null,
        state: input.state || null,
        pincode: input.pincode || null,
        description: input.description || null,
        established_year: input.established_year ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (dbError) {
      throw new ValidationError(dbError.message || "Failed to update seller profile");
    }

    // Keep profiles table full_name in sync with business_name
    if (input.business_name) {
      await admin
        .from("profiles")
        .update({ full_name: input.business_name })
        .eq("id", sellerId);
    }

    return { success: true, message: "Profile updated successfully" };
  }

  /**
   * 5. Submit for Verification
   */
  static async submitForVerification(sellerId: string) {
    const admin = getSupabaseAdminClient();

    const { error } = await admin
      .from("seller_profiles")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", sellerId);

    if (error) {
      throw new ValidationError(error.message || "Failed to submit for verification");
    }

    return { success: true, status: "submitted" };
  }

  /**
   * 6. Creator Studio Profile Update
   */
  static async updateCreatorStudio(sellerId: string, input: UpdateStudioInput) {
    const admin = getSupabaseAdminClient();

    const { data: existing } = await admin
      .from("seller_profiles")
      .select("description")
      .eq("id", sellerId)
      .maybeSingle();

    let meta: Record<string, unknown> = {};
    if (existing?.description && existing.description.startsWith("{")) {
      try {
        meta = JSON.parse(existing.description);
      } catch {}
    }

    const storyObj = (
      typeof meta.story === "object" && meta.story ? meta.story : {}
    ) as Record<string, unknown>;

    const updatedMeta = {
      ...meta,
      maker_name: input.maker_name ?? meta.maker_name,
      craft_title: input.craft_title ?? meta.craft_title,
      short_bio: input.bio ?? meta.short_bio,
      story: {
        ...storyObj,
        how_it_started: input.how_it_started ?? storyObj.how_it_started,
        materials_and_technique:
          input.materials_and_technique ?? storyObj.materials_and_technique,
        vision: input.vision ?? storyObj.vision,
        milestones: input.milestones ?? storyObj.milestones,
      },
    };

    const { error } = await admin
      .from("seller_profiles")
      .update({
        description: JSON.stringify(updatedMeta),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sellerId);

    if (error) {
      throw new ValidationError(error.message || "Failed to update creator studio");
    }

    return { success: true, studio: updatedMeta };
  }

  /**
   * 7. Update Avatar URL
   */
  static async updateAvatar(sellerId: string, avatarUrl: string) {
    const admin = getSupabaseAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", sellerId);

    if (error) throw new ValidationError(error.message || "Failed to update avatar");
    return { avatarUrl };
  }

  /**
   * 8. Remove Avatar
   */
  static async removeAvatar(sellerId: string) {
    const admin = getSupabaseAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", sellerId);

    if (error) throw new ValidationError(error.message || "Failed to remove avatar");
    return { success: true };
  }

  /**
   * 9. Update Cover Image URL
   */
  static async updateCover(sellerId: string, coverUrl: string) {
    const admin = getSupabaseAdminClient();
    const { data: existing } = await admin
      .from("seller_profiles")
      .select("description")
      .eq("id", sellerId)
      .maybeSingle();

    let meta: Record<string, unknown> = {};
    if (existing?.description && existing.description.startsWith("{")) {
      try {
        meta = JSON.parse(existing.description);
      } catch {}
    }

    meta.cover_url = coverUrl;

    const { error } = await admin
      .from("seller_profiles")
      .update({
        description: JSON.stringify(meta),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sellerId);

    if (error)
      throw new ValidationError(error.message || "Failed to update cover image");
    return { coverUrl };
  }

  /**
   * 10. List Documents
   */
  static async listDocuments(sellerId: string) {
    const admin = getSupabaseAdminClient();
    const { data, error } = await admin
      .from("seller_documents")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    if (error)
      throw new ValidationError(error.message || "Failed to retrieve documents");
    return { documents: data || [] };
  }

  /**
   * 11. Upload Document Record
   */
  static async uploadDocument(sellerId: string, input: UploadDocumentInput) {
    const admin = getSupabaseAdminClient();

    const { data, error } = await admin
      .from("seller_documents")
      .insert({
        seller_id: sellerId,
        document_type: input.document_type,
        file_url: input.file_url,
        document_number: input.document_number || null,
        file_name: input.file_name || null,
        file_size: input.file_size || null,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error)
      throw new ValidationError(error.message || "Failed to create document record");
    return { document: data };
  }

  /**
   * 12. Delete Document
   */
  static async deleteDocument(sellerId: string, documentId: string) {
    const admin = getSupabaseAdminClient();
    const { error } = await admin
      .from("seller_documents")
      .delete()
      .eq("id", documentId)
      .eq("seller_id", sellerId);

    if (error) throw new ValidationError(error.message || "Failed to delete document");
    return { success: true };
  }

  /**
   * 13. List Seller Products
   */
  static async listSellerProducts(sellerId: string, query: SellerProductsQuery) {
    const admin = getSupabaseAdminClient();

    let q = admin
      .from("products")
      .select("*, product_variants(*)", { count: "exact" })
      .eq("seller_id", sellerId);

    if (query.status && query.status !== "all") {
      q = q.eq("status", query.status);
    }
    if (query.category) {
      q = q.eq("category", query.category);
    }
    if (query.search) {
      q = q.ilike("name", `%${query.search}%`);
    }

    q = q
      .order("updated_at", { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    const { data, count, error } = await q;

    if (error) throw new ValidationError(error.message || "Failed to list products");
    return {
      products: data || [],
      totalCount: count ?? 0,
      limit: query.limit,
      offset: query.offset,
    };
  }

  /**
   * 14. Get Seller Product Details
   */
  static async getSellerProduct(sellerId: string, productId: string, userRole: string) {
    const admin = getSupabaseAdminClient();
    const { data: product, error } = await admin
      .from("products")
      .select("*, product_variants(*)")
      .eq("id", productId)
      .maybeSingle();

    if (error || !product) {
      throw new NotFoundError(`Product "${productId}" not found`);
    }

    if (userRole !== "admin" && product.seller_id !== sellerId) {
      throw new ForbiddenError(
        "You do not have permission to view or edit this product"
      );
    }

    return { product };
  }

  /**
   * 15. Create Seller Product
   */
  static async createSellerProduct(sellerId: string, input: CreateProductInput) {
    const admin = getSupabaseAdminClient();

    const { variants, ...productData } = input;

    const { data: newProduct, error } = await admin
      .from("products")
      .insert({
        ...productData,
        seller_id: sellerId,
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error || !newProduct) {
      throw new ValidationError(error?.message || "Failed to create product");
    }

    // Insert variants if provided
    let createdVariants: Record<string, unknown>[] = [];
    if (variants && variants.length > 0) {
      const variantRows = variants.map((v) => ({
        product_id: newProduct.id,
        title: v.title,
        sku: v.sku || null,
        price_inr: v.price_inr ?? null,
        inventory_count: v.inventory_count ?? 0,
        attributes: v.attributes ?? {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data: varData } = await admin
        .from("product_variants")
        .insert(variantRows)
        .select("*");
      createdVariants = varData || [];
    }

    return {
      product: {
        ...newProduct,
        product_variants: createdVariants,
      },
    };
  }

  /**
   * 16. Update Seller Product
   */
  static async updateSellerProduct(
    sellerId: string,
    productId: string,
    input: UpdateProductInput,
    userRole: string
  ) {
    const admin = getSupabaseAdminClient();

    // Verify ownership
    await this.getSellerProduct(sellerId, productId, userRole);

    const { variants: _variants, ...updates } = input;

    const { data: updatedProduct, error } = await admin
      .from("products")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select("*")
      .single();

    if (error || !updatedProduct) {
      throw new ValidationError(error?.message || "Failed to update product");
    }

    return { product: updatedProduct };
  }

  /**
   * 17. Set Product Status
   */
  static async setSellerProductStatus(
    sellerId: string,
    productId: string,
    status: "draft" | "published" | "archived",
    userRole: string
  ) {
    const admin = getSupabaseAdminClient();

    // Verify ownership
    await this.getSellerProduct(sellerId, productId, userRole);

    const { error } = await admin
      .from("products")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (error)
      throw new ValidationError(error.message || "Failed to update product status");
    return { success: true, productId, status };
  }

  /**
   * 18. Quick Update Seller Product
   */
  static async quickUpdateSellerProduct(
    sellerId: string,
    productId: string,
    input: QuickUpdateProductInput,
    userRole: string
  ) {
    const admin = getSupabaseAdminClient();

    // Verify ownership
    await this.getSellerProduct(sellerId, productId, userRole);

    const { data: updated, error } = await admin
      .from("products")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select("*")
      .single();

    if (error)
      throw new ValidationError(error.message || "Failed to quick-update product");
    return { product: updated };
  }

  /**
   * 19. Delete / Archive Product
   */
  static async deleteSellerProduct(
    sellerId: string,
    productId: string,
    userRole: string
  ) {
    const admin = getSupabaseAdminClient();

    // Verify ownership
    await this.getSellerProduct(sellerId, productId, userRole);

    const { error } = await admin.from("products").delete().eq("id", productId);

    if (error) {
      // Fallback to archiving if foreign key constraints block hard deletion
      await admin
        .from("products")
        .update({ status: "archived", updated_at: new Date().toISOString() })
        .eq("id", productId);
    }

    return { success: true, message: "Product deleted or archived successfully" };
  }

  /**
   * 20. Add Product Variant
   */
  static async addProductVariant(
    sellerId: string,
    productId: string,
    input: AddVariantInput,
    userRole: string
  ) {
    const admin = getSupabaseAdminClient();

    // Verify ownership
    await this.getSellerProduct(sellerId, productId, userRole);

    const { data: variant, error } = await admin
      .from("product_variants")
      .insert({
        product_id: productId,
        title: input.title,
        sku: input.sku || null,
        price_inr: input.price_inr ?? null,
        inventory_count: input.inventory_count ?? 0,
        attributes: input.attributes ?? {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw new ValidationError(error.message || "Failed to add variant");
    return { variant };
  }

  /**
   * 21. Delete Product Variant
   */
  static async deleteProductVariant(
    sellerId: string,
    productId: string,
    variantId: string,
    userRole: string
  ) {
    const admin = getSupabaseAdminClient();

    // Verify ownership
    await this.getSellerProduct(sellerId, productId, userRole);

    const { error } = await admin
      .from("product_variants")
      .delete()
      .eq("id", variantId)
      .eq("product_id", productId);

    if (error) throw new ValidationError(error.message || "Failed to delete variant");
    return { success: true };
  }

  /**
   * 22. List Seller Orders
   */
  static async listSellerOrders(sellerId: string, query: SellerOrdersQuery) {
    const rawOrders = await OrdersService.getSellerOrders(sellerId);

    // Filter and scope line items
    let scoped = rawOrders.map((order) => {
      const sellerItems = (order.items || []).filter(
        (item: OrderLineItemLike) => (item.sellerId || item.seller_id) === sellerId
      );
      const sellerSubtotal = sellerItems.reduce(
        (sum: number, item: OrderLineItemLike) =>
          sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      );
      return {
        ...order,
        items: sellerItems.length > 0 ? sellerItems : order.items,
        totalAmount: sellerItems.length > 0 ? sellerSubtotal : order.totalAmount,
      };
    });

    if (query.status && query.status !== "all") {
      scoped = scoped.filter((o) => o.status === query.status);
    }

    if (query.search) {
      const term = query.search.toLowerCase();
      scoped = scoped.filter((o: Record<string, unknown>) => {
        const orderIdentifier = String(
          o.orderId || o.orderNumber || o.id || ""
        ).toLowerCase();
        const customerName = String(o.customerName || "").toLowerCase();
        const shipping = (o.shippingAddress || {}) as Record<string, unknown>;
        const recipientName = String(
          shipping.recipientName || shipping.fullName || ""
        ).toLowerCase();
        return (
          orderIdentifier.includes(term) ||
          customerName.includes(term) ||
          recipientName.includes(term)
        );
      });
    }

    const totalCount = scoped.length;
    const paginated = scoped.slice(query.offset, query.offset + query.limit);

    return {
      orders: paginated,
      totalCount,
      limit: query.limit,
      offset: query.offset,
    };
  }

  /**
   * 23. Get Scoped Seller Order
   */
  static async getSellerOrder(sellerId: string, orderId: string, userRole: string) {
    const order = await OrdersService.getOrder(orderId);
    if (!order) {
      throw new NotFoundError(`Order "${orderId}" not found`);
    }

    const sellerItems = (order.items || []).filter(
      (item: OrderLineItemLike) => (item.sellerId || item.seller_id) === sellerId
    );

    if (userRole !== "admin" && sellerItems.length === 0) {
      throw new ForbiddenError("You do not have permission to view this order");
    }

    const sellerSubtotal = sellerItems.reduce(
      (sum: number, item: OrderLineItemLike) =>
        sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );

    return {
      order: {
        ...order,
        items: userRole === "admin" ? order.items : sellerItems,
        totalAmount: userRole === "admin" ? order.totalAmount : sellerSubtotal,
      },
    };
  }

  /**
   * 24. Update Order Status
   */
  static async updateSellerOrderStatus(
    sellerId: string,
    orderId: string,
    input: UpdateOrderStatusInput,
    userRole: string
  ) {
    const res = await OrdersService.transitionStatus({
      orderId,
      newStatus: input.status as OrderStatus,
      actorUserId: sellerId,
      actorRole: userRole === "admin" ? "admin" : "seller",
      carrier: input.carrier,
      trackingNumber: input.trackingNumber,
      note: input.note,
    });

    if (!res.success) {
      throw new ValidationError(res.error || "Failed to update order status");
    }

    return res;
  }

  /**
   * 25. List Reels
   */
  static async listSellerReels(sellerId: string, productId?: string) {
    const admin = getSupabaseAdminClient();
    let q = admin.from("reels").select("*").eq("seller_id", sellerId);
    if (productId) {
      q = q.eq("product_id", productId);
    }
    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) throw new ValidationError(error.message || "Failed to retrieve reels");
    return { reels: data || [] };
  }

  /**
   * 26. Create Reel
   */
  static async createSellerReel(sellerId: string, input: CreateReelInput) {
    const admin = getSupabaseAdminClient();
    const { data, error } = await admin
      .from("reels")
      .insert({
        seller_id: sellerId,
        product_id: input.product_id || null,
        video_url: input.video_url,
        thumbnail_url: input.thumbnail_url || null,
        title: input.title || null,
        caption: input.caption || null,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw new ValidationError(error.message || "Failed to create reel");
    return { reel: data };
  }
}
