"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@genz/database/admin";
import { requireRole } from "@/features/auth/lib/require-role";
import { productSchema } from "@genz/validation";
import { validateFileContentServer } from "@/lib/file-validation";
import { withRateLimit } from "@/lib/rate-limiter";

export interface ProductFormState {
  error?: string;
}

export interface VariantFormState {
  error?: string;
}

export async function adminSetProductStatus(
  productId: string,
  status: "published" | "draft"
) {
  await requireRole("admin");

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (err: unknown) {
    console.error(
      "[CONFIG_ERROR] [adminSetProductStatus] Failed to initialize admin client:",
      err
    );
    throw new Error(
      "Server misconfiguration: admin credentials are not set up. Contact an engineer."
    );
  }

  const { error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", productId);

  if (error) {
    console.error("Admin set product status error:", error);
    throw new Error("Failed to update product status");
  }

  revalidatePath("/admin/dashboard/products");
  revalidatePath(`/products/${productId}`);
}

export async function adminDeleteProduct(productId: string) {
  await requireRole("admin");

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (err: unknown) {
    console.error(
      "[CONFIG_ERROR] [adminDeleteProduct] Failed to initialize admin client:",
      err
    );
    throw new Error(
      "Server misconfiguration: admin credentials are not set up. Contact an engineer."
    );
  }

  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    console.error("Admin delete product error:", error);
    throw new Error("Failed to delete product");
  }

  revalidatePath("/admin/dashboard/products");
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const session = await requireRole("admin");

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "toys").trim() || "toys";
  const age_group = String(formData.get("age_group") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("price_inr") ?? "").trim();
  const parsedPrice = priceRaw ? Number(priceRaw) : null;
  const price_inr = parsedPrice !== null && !isNaN(parsedPrice) ? parsedPrice : null;
  const rawMat = String(formData.get("materials") ?? "");
  const materials = rawMat
    ? rawMat
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const validation = productSchema.safeParse({
    name,
    category,
    age_group,
    description,
    price_inr,
    materials,
  });
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const supabase = createAdminClient();

  const customSellerId = String(formData.get("seller_id") ?? "").trim();
  const targetSellerId = customSellerId || session.userId;

  const { error } = await supabase
    .from("products")
    .insert({
      seller_id: targetSellerId,
      name: validation.data.name,
      category: validation.data.category,
      age_group: validation.data.age_group,
      description: validation.data.description || null,
      price_inr: validation.data.price_inr,
      materials: validation.data.materials,
      seller_verified: true,
      status: "published",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Admin create product error:", error);
    return { error: error.message || "Failed to create product" };
  }

  revalidatePath("/admin/dashboard/products");
  redirect("/admin/dashboard/products");
}

export async function uploadProductCoverAction(
  productId: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const session = await requireRole("admin");
  const file = formData.get("cover_image") as File | null;

  if (!file || file.size === 0) {
    return { error: "No cover image provided." };
  }

  return withRateLimit(
    {
      endpointType: "user",
      actionName: "upload_product_cover",
      identifier: session.userId,
    },
    async () => {
      const validation = await validateFileContentServer(file, ["image"]);
      if (!validation.valid) {
        return { error: validation.error || "Invalid image file." };
      }

      const supabase = createAdminClient();
      const { data: product } = await supabase
        .from("products")
        .select("name, seller_id, cover_image_path")
        .eq("id", productId)
        .single();

      if (!product) {
        return { error: "Product not found." };
      }

      const productSlug = (product.name || "product")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      const path = `${product.seller_id}/products/${productId}/${productSlug}-1.jpg`;

      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("product-media")
        .upload(path, buffer, { contentType: file.type, upsert: true });

      if (uploadError) {
        return { error: uploadError.message || "Failed to upload cover image." };
      }

      await supabase
        .from("products")
        .update({ cover_image_path: path })
        .eq("id", productId);

      revalidatePath(`/admin/dashboard/products/${productId}`);
      return { success: true };
    }
  );
}

export async function uploadProductImagesAction(
  productId: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const session = await requireRole("admin");
  const files = formData.getAll("gallery_images") as File[];

  if (files.length === 0) {
    return { error: "No gallery images provided." };
  }

  return withRateLimit(
    {
      endpointType: "user",
      actionName: "upload_product_images",
      identifier: session.userId,
    },
    async () => {
      for (const file of files) {
        const validation = await validateFileContentServer(file, ["image"]);
        if (!validation.valid) {
          return { error: validation.error || "Invalid gallery image file." };
        }
      }

      const supabase = createAdminClient();
      const { data: product } = await supabase
        .from("products")
        .select("name, seller_id")
        .eq("id", productId)
        .single();

      if (!product) {
        return { error: "Product not found." };
      }

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

        if (uploadError) {
          return { error: uploadError.message || "Failed to upload gallery image." };
        }

        await supabase.from("product_images").insert({
          product_id: productId,
          seller_id: product.seller_id,
          image_path: path,
          position: nextPosition,
        });

        nextPosition++;
        imageIndex++;
      }

      revalidatePath(`/admin/dashboard/products/${productId}`);
      return { success: true };
    }
  );
}

export async function addVariant(
  productId: string,
  _prevState: VariantFormState,
  formData: FormData
): Promise<VariantFormState> {
  await requireRole("admin");
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

  if (error) return { error: error.message || "Failed to add variant." };
  revalidatePath(`/admin/dashboard/products/${productId}`);
  return {};
}

export async function deleteVariant(productId: string, variantId: string) {
  await requireRole("admin");
  const supabase = createAdminClient();
  await supabase.from("product_variants").delete().eq("id", variantId);
  revalidatePath(`/admin/dashboard/products/${productId}`);
}
