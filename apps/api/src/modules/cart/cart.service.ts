import { getSupabaseAdminClient } from "../../integrations/supabase";
import { PricingService } from "@genz/services/pricing";
import type { ValidateCartInput } from "./cart.schemas";
import { ValidationError } from "../../common/errors";

export interface ValidatedItem {
  productId: string;
  variantId?: string;
  name: string;
  category: string;
  coverImage?: string;
  sellerId: string;
  sellerBusinessName?: string;
  price: number;
  quantity: number;
  lineTotal: number;
  available: boolean;
  unavailabilityReason?: string;
}

interface DbVariantItem {
  id: string;
  product_id: string;
  name?: string;
  price_inr?: number;
}

export class CartService {
  static async validateAndCalculate(input: ValidateCartInput) {
    if (!input.items || input.items.length === 0) {
      throw new ValidationError("Cart is empty");
    }

    const admin = getSupabaseAdminClient();
    const productIds = Array.from(new Set(input.items.map((i) => i.productId)));

    // Fetch authoritative product records from PostgreSQL
    const { data: dbProducts, error } = await admin
      .from("products")
      .select("id, name, category, price_inr, status, cover_image_path, seller_id")
      .in("id", productIds);

    if (error) {
      throw new Error(`Failed to verify products: ${error.message}`);
    }

    const productMap = new Map((dbProducts || []).map((p) => [p.id, p]));

    // Fetch variants if requested
    const variantIds = input.items
      .map((i) => i.variantId)
      .filter((id): id is string => Boolean(id));

    let variantMap = new Map<string, DbVariantItem>();
    if (variantIds.length > 0) {
      const { data: dbVariants } = await admin
        .from("product_variants")
        .select("id, product_id, name, price_inr")
        .in("id", variantIds);
      if (dbVariants) {
        variantMap = new Map(dbVariants.map((v) => [v.id, v]));
      }
    }

    const validatedItems: ValidatedItem[] = [];
    let allValid = true;

    for (const item of input.items) {
      const dbProduct = productMap.get(item.productId);

      if (!dbProduct) {
        allValid = false;
        validatedItems.push({
          productId: item.productId,
          variantId: item.variantId,
          name: "Unknown Product",
          category: "General",
          sellerId: "unknown",
          price: 0,
          quantity: item.quantity,
          lineTotal: 0,
          available: false,
          unavailabilityReason: "Product no longer exists",
        });
        continue;
      }

      if (dbProduct.status !== "published") {
        allValid = false;
        validatedItems.push({
          productId: dbProduct.id,
          variantId: item.variantId,
          name: dbProduct.name,
          category: dbProduct.category,
          sellerId: dbProduct.seller_id,
          price: dbProduct.price_inr,
          quantity: item.quantity,
          lineTotal: 0,
          available: false,
          unavailabilityReason: "Product is currently out of stock or archived",
        });
        continue;
      }

      // Check for variant price override and cross-product variant binding attack
      let authoritativePrice = dbProduct.price_inr;
      if (item.variantId) {
        const variant = variantMap.get(item.variantId);
        if (!variant || variant.product_id !== dbProduct.id) {
          allValid = false;
          validatedItems.push({
            productId: dbProduct.id,
            variantId: item.variantId,
            name: dbProduct.name,
            category: dbProduct.category,
            sellerId: dbProduct.seller_id,
            price: dbProduct.price_inr,
            quantity: item.quantity,
            lineTotal: 0,
            available: false,
            unavailabilityReason: "Requested variant does not belong to this product",
          });
          continue;
        }

        if (variant.price_inr && variant.price_inr > 0) {
          authoritativePrice = variant.price_inr;
        }
      }

      const lineTotal = authoritativePrice * item.quantity;

      validatedItems.push({
        productId: dbProduct.id,
        variantId: item.variantId,
        name: dbProduct.name,
        category: dbProduct.category,
        coverImage: dbProduct.cover_image_path || undefined,
        sellerId: dbProduct.seller_id,
        price: authoritativePrice,
        quantity: item.quantity,
        lineTotal,
        available: true,
      });
    }

    // Only calculate financial totals for available items
    const availableItems = validatedItems.filter((i) => i.available);
    const pricing = PricingService.calculateOrderTotals(
      availableItems.map((i) => ({
        unitPrice: i.price,
        quantity: i.quantity,
      }))
    );

    return {
      valid: allValid && availableItems.length > 0,
      itemCount: availableItems.reduce((acc, i) => acc + i.quantity, 0),
      items: validatedItems,
      pricing: {
        subtotal: pricing.subtotal,
        tax: pricing.tax,
        shippingFee: pricing.shippingFee,
        total: pricing.total,
      },
    };
  }
}
