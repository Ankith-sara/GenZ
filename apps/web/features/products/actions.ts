"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@genz/database/admin";
import { requireRole } from "@/features/auth/lib/require-role";

export interface VariantFormState {
  error?: string;
}

export async function uploadProductCoverAction(
  productId: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const session = await requireRole("seller");
  const file = formData.get("cover_image") as File | null;
  if (!file) return { error: "No cover image provided." };

  const supabase = createAdminClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, seller_id")
    .eq("id", productId)
    .single();

  if (!product) return { error: "Product not found." };

  const productSlug = (product.name || "product")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const path = `${product.seller_id}/products/${productId}/${productSlug}-1.jpg`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from("product-media")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) return { error: uploadError.message };

  await supabase
    .from("products")
    .update({ cover_image_path: path })
    .eq("id", productId);
  revalidatePath(`/products/${productId}`);
  return { success: true };
}

export async function uploadProductImagesAction(
  productId: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const session = await requireRole("seller");
  const files = formData.getAll("gallery_images") as File[];
  if (files.length === 0) return { error: "No gallery images provided." };

  const supabase = createAdminClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, seller_id")
    .eq("id", productId)
    .single();

  if (!product) return { error: "Product not found." };

  const productSlug = (product.name || "product")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const { data: existingImages } = await supabase
    .from("product_images")
    .select("position")
    .eq("product_id", productId);

  let nextPosition = existingImages?.length ?? 0;
  let imageIndex = nextPosition + 2;

  for (const file of files) {
    const path = `${product.seller_id}/products/${productId}/${productSlug}-${imageIndex}.jpg`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("product-media")
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) return { error: uploadError.message };

    await supabase.from("product_images").insert({
      product_id: productId,
      seller_id: product.seller_id,
      image_path: path,
      position: nextPosition,
    });

    nextPosition++;
    imageIndex++;
  }

  revalidatePath(`/products/${productId}`);
  return { success: true };
}

export async function addVariant(
  productId: string,
  _prevState: VariantFormState,
  formData: FormData
): Promise<VariantFormState> {
  await requireRole("seller");
  const variant_name = String(formData.get("variant_name") ?? "").trim();
  const variant_value = String(formData.get("variant_value") ?? "").trim();
  const priceRaw = String(formData.get("price_inr") ?? "").trim();
  const stockRaw = String(formData.get("stock_qty") ?? "").trim();
  const price_inr = priceRaw ? Number(priceRaw) : null;
  const stock_qty = stockRaw ? Number(stockRaw) : null;

  const supabase = createAdminClient();
  const { data: product } = await supabase
    .from("products")
    .select("seller_id")
    .eq("id", productId)
    .single();
  if (!product) return { error: "Product not found." };

  const { error } = await supabase.from("product_variants").insert({
    product_id: productId,
    seller_id: product.seller_id,
    variant_name,
    variant_value,
    price_inr,
    stock_qty,
  });

  if (error) return { error: error.message };
  revalidatePath(`/products/${productId}`);
  return {};
}

export async function deleteVariant(productId: string, variantId: string) {
  const session = await requireRole("seller");
  const supabase = createAdminClient();
  await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId)
    .eq("seller_id", session.userId);
  revalidatePath(`/products/${productId}`);
}
