"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { parseMaterials } from "@/lib/products";
import type { ProductStatus } from "@/types/database";
import { checkRateLimit, logRateLimitAttempt } from "@/lib/rate-limiter";
import { productSchema, variantSchema } from "@/lib/validation";

export interface ProductFormState {
  error?: string;
}

function parseProductFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "toys").trim() || "toys";
  const age_group = String(formData.get("age_group") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("price_inr") ?? "").trim();
  const price_inr = priceRaw ? Number(priceRaw) : null;
  const materials = parseMaterials(String(formData.get("materials") ?? ""));
  return { name, category, age_group, description, price_inr, materials };
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const session = await requireRole("manufacturer");

  // 1. Rate Limit
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "create_product",
    identifier: session.userId,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Parse and Validate
  const fields = parseProductFields(formData);
  const validation = productSchema.safeParse(fields);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      manufacturer_id: session.userId,
      name: validation.data.name,
      category: validation.data.category,
      age_group: validation.data.age_group,
      description: validation.data.description || null,
      price_inr: validation.data.price_inr,
      materials: validation.data.materials,
    })
    .select("id")
    .single();

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "create_product",
    identifier: session.userId,
  });

  if (error) {
    console.error("Create product DB error:", error);
    if (error.code === "42501") {
      return {
        error:
          "Only verified manufacturers can list products. Finish verification first.",
      };
    }
    return { error: "Could not create the product. Please try again." };
  }

  revalidatePath("/dashboard/manufacturer/products");
  redirect(`/dashboard/manufacturer/products/${data.id}`);
}

export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const session = await requireRole("manufacturer");

  // 1. Rate Limit
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "update_product",
    identifier: session.userId,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Parse and Validate
  const fields = parseProductFields(formData);
  const validation = productSchema.safeParse(fields);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: validation.data.name,
      category: validation.data.category,
      age_group: validation.data.age_group,
      description: validation.data.description || null,
      price_inr: validation.data.price_inr,
      materials: validation.data.materials,
    })
    .eq("id", productId)
    .eq("manufacturer_id", session.userId);

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "update_product",
    identifier: session.userId,
  });

  if (error) {
    console.error("Update product DB error:", error);
    return { error: "Could not save changes. Please try again." };
  }

  revalidatePath(`/dashboard/manufacturer/products/${productId}`);
  revalidatePath("/dashboard/manufacturer/products");
  return {};
}

export async function setProductStatus(productId: string, status: ProductStatus) {
  const session = await requireRole("manufacturer");

  // Rate Limit
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "set_product_status",
    identifier: session.userId,
  });
  if (rateLimit.blocked) return;

  const supabase = await createClient();
  await supabase
    .from("products")
    .update({ status })
    .eq("id", productId)
    .eq("manufacturer_id", session.userId);

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "set_product_status",
    identifier: session.userId,
  });

  revalidatePath(`/dashboard/manufacturer/products/${productId}`);
  revalidatePath("/dashboard/manufacturer/products");
}

export async function deleteProduct(productId: string) {
  const session = await requireRole("manufacturer");

  // Rate Limit
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "delete_product",
    identifier: session.userId,
  });
  if (rateLimit.blocked) return;

  const supabase = await createClient();

  const { data: reels } = await supabase
    .from("reels")
    .select("video_path, thumbnail_path")
    .eq("product_id", productId);

  const { data: product } = await supabase
    .from("products")
    .select("cover_image_path")
    .eq("id", productId)
    .single();

  await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("manufacturer_id", session.userId);

  const paths = [
    product?.cover_image_path,
    ...(reels ?? []).flatMap((r) => [r.video_path, r.thumbnail_path]),
  ].filter((p): p is string => !!p);

  if (paths.length > 0) {
    await supabase.storage.from("product-media").remove(paths);
  }

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "delete_product",
    identifier: session.userId,
  });

  revalidatePath("/dashboard/manufacturer/products");
  redirect("/dashboard/manufacturer/products");
}

export interface VariantFormState {
  error?: string;
}

export async function addVariant(
  productId: string,
  _prevState: VariantFormState,
  formData: FormData
): Promise<VariantFormState> {
  const session = await requireRole("manufacturer");

  // 1. Rate Limit
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "add_variant",
    identifier: session.userId,
  });
  if (rateLimit.blocked) {
    return { error: rateLimit.error || "Too many requests. Please try again later." };
  }

  // 2. Parse and Validate
  const variant_name = String(formData.get("variant_name") ?? "").trim();
  const variant_value = String(formData.get("variant_value") ?? "").trim();
  const priceRaw = String(formData.get("price_inr") ?? "").trim();
  const stockRaw = String(formData.get("stock_qty") ?? "").trim();
  const price_inr = priceRaw ? Number(priceRaw) : undefined;
  const stock_qty = stockRaw ? Number(stockRaw) : undefined;

  const validation = variantSchema.safeParse({
    variant_name,
    variant_value,
    price_inr,
    stock_qty,
  });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("product_variants").insert({
    product_id: productId,
    manufacturer_id: session.userId,
    variant_name: validation.data.variant_name,
    variant_value: validation.data.variant_value,
    price_inr: validation.data.price_inr ?? null,
    stock_qty: validation.data.stock_qty ?? null,
  });

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "add_variant",
    identifier: session.userId,
  });

  if (error) {
    console.error("Add variant DB error:", error);
    return { error: "Could not add the variant. Please try again." };
  }

  revalidatePath(`/dashboard/manufacturer/products/${productId}`);
  return {};
}

export async function deleteVariant(productId: string, variantId: string) {
  const session = await requireRole("manufacturer");

  // Rate Limit
  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "delete_variant",
    identifier: session.userId,
  });
  if (rateLimit.blocked) return;

  const supabase = await createClient();

  await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId)
    .eq("manufacturer_id", session.userId);

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "delete_variant",
    identifier: session.userId,
  });

  revalidatePath(`/dashboard/manufacturer/products/${productId}`);
}
