"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { parseMaterials } from "@/lib/products";
import type { ProductStatus } from "@/types/database";

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
  const { name, category, age_group, description, price_inr, materials } =
    parseProductFields(formData);

  if (!name) return { error: "Product name is required." };
  if (price_inr !== null && Number.isNaN(price_inr)) {
    return { error: "Price must be a number." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      manufacturer_id: session.userId,
      name,
      category,
      age_group,
      description: description || null,
      price_inr,
      materials,
    })
    .select("id")
    .single();

  if (error) {
    console.error(error);
    // The insert policy requires a verified manufacturer — surface that
    // distinctly rather than a generic database error.
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
  const { name, category, age_group, description, price_inr, materials } =
    parseProductFields(formData);

  if (!name) return { error: "Product name is required." };
  if (price_inr !== null && Number.isNaN(price_inr)) {
    return { error: "Price must be a number." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name,
      category,
      age_group,
      description: description || null,
      price_inr,
      materials,
    })
    .eq("id", productId)
    .eq("manufacturer_id", session.userId);

  if (error) {
    console.error(error);
    return { error: "Could not save changes. Please try again." };
  }

  revalidatePath(`/dashboard/manufacturer/products/${productId}`);
  revalidatePath("/dashboard/manufacturer/products");
  return {};
}

export async function setProductStatus(productId: string, status: ProductStatus) {
  const session = await requireRole("manufacturer");
  const supabase = await createClient();

  await supabase
    .from("products")
    .update({ status })
    .eq("id", productId)
    .eq("manufacturer_id", session.userId);

  revalidatePath(`/dashboard/manufacturer/products/${productId}`);
  revalidatePath("/dashboard/manufacturer/products");
}

export async function deleteProduct(productId: string) {
  const session = await requireRole("manufacturer");
  const supabase = await createClient();

  // Pull reel file paths first so we can clean up storage after the row
  // (and its reels, via ON DELETE CASCADE) are gone.
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

  const variant_name = String(formData.get("variant_name") ?? "").trim();
  const variant_value = String(formData.get("variant_value") ?? "").trim();
  const priceRaw = String(formData.get("price_inr") ?? "").trim();
  const stockRaw = String(formData.get("stock_qty") ?? "").trim();
  const price_inr = priceRaw ? Number(priceRaw) : null;
  const stock_qty = stockRaw ? Number(stockRaw) : null;

  if (!variant_name || !variant_value) {
    return {
      error: "Both a variant name (e.g. Color) and value (e.g. Red) are required.",
    };
  }
  if (price_inr !== null && Number.isNaN(price_inr)) {
    return { error: "Price override must be a number." };
  }
  if (stock_qty !== null && Number.isNaN(stock_qty)) {
    return { error: "Stock must be a number." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("product_variants").insert({
    product_id: productId,
    manufacturer_id: session.userId,
    variant_name,
    variant_value,
    price_inr,
    stock_qty,
  });

  if (error) {
    console.error(error);
    return { error: "Could not add the variant. Please try again." };
  }

  revalidatePath(`/dashboard/manufacturer/products/${productId}`);
  return {};
}

export async function deleteVariant(productId: string, variantId: string) {
  const session = await requireRole("manufacturer");
  const supabase = await createClient();

  await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId)
    .eq("manufacturer_id", session.userId);

  revalidatePath(`/dashboard/manufacturer/products/${productId}`);
}
