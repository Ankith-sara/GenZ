"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@genz/database";
import { createAdminClient } from "@genz/database/admin";
import { requireRole } from "@/features/auth/lib/require-role";
import { parseMaterials } from "@/features/products/lib/products";
import type { Product, ProductStatus, Role } from "@genz/types";
import { checkRateLimit, logRateLimitAttempt, withRateLimit } from "@/lib/rate-limiter";
import { productSchema, variantSchema } from "@/lib/validation";
import { validateFileContentServer } from "@/lib/file-validation";

export interface ProductFormState {
  error?: string;
  success?: boolean;
}

function parseProductFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "toys").trim() || "toys";
  const description = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("price_inr") ?? "").trim();
  const parsedPrice = priceRaw ? Number(priceRaw) : null;
  const price_inr = parsedPrice !== null && !isNaN(parsedPrice) ? parsedPrice : null;
  const materials = parseMaterials(String(formData.get("materials") ?? ""));
  return { name, category, description, price_inr, materials };
}

function parseCommerceFields(formData: FormData) {
  const sku = String(formData.get("sku") ?? "").trim() || null;

  const stockQtyRaw = String(formData.get("stock_qty") ?? "").trim();
  const inventory_count =
    stockQtyRaw !== "" && !isNaN(Number(stockQtyRaw)) ? Number(stockQtyRaw) : 0;

  const lowStockRaw = String(formData.get("low_stock_threshold") ?? "").trim();
  const low_stock_threshold =
    lowStockRaw !== "" && !isNaN(Number(lowStockRaw)) ? Number(lowStockRaw) : 5;

  const track_inventory = formData.get("track_inventory") !== null;

  const is_featured = formData.get("is_featured") === "true";
  const is_new_arrival =
    formData.get("is_new_arrival") === null
      ? true
      : formData.get("is_new_arrival") === "true";
  const is_best_seller =
    formData.get("is_bestseller") === "true" ||
    formData.get("is_best_seller") === "true";

  return {
    sku,
    inventory_count,
    low_stock_threshold,
    track_inventory,
    is_featured,
    is_new_arrival,
    is_best_seller,
  };
}

/**
 * Utility to convert product name to URL/filename safe slug.
 * e.g., "Handmade Wooden Car" -> "handmade-wooden-car"
 */
function slugifyProductName(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product"
  );
}

/**
 * Extracts file extension safely.
 */
function getFileExtension(file: File): string {
  const parts = file.name.split(".");
  if (parts.length > 1) {
    const ext = parts.pop()!.toLowerCase();
    if (ext && ext.length <= 5) return ext;
  }
  if (file.type && file.type.startsWith("image/")) {
    const sub = file.type.split("/")[1]?.toLowerCase();
    if (sub === "jpeg") return "jpg";
    if (sub) return sub;
  }
  return "jpg";
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const session = await requireRole("seller");

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

  // Images are now uploaded client-side to Supabase Storage.
  // The client sends storage paths (strings) instead of raw File bytes.
  const coverImagePath = String(formData.get("cover_image_path") ?? "").trim();
  const galleryImagePaths = formData.getAll("gallery_image_paths")
    .map((v) => String(v).trim())
    .filter(Boolean);

  // Legacy fallback: if raw files were sent (e.g. from admin form), validate them
  const coverImage = formData.get("cover_image") as File | null;
  const hasCoverFile = coverImage && coverImage.size > 0;
  if (hasCoverFile) {
    if (!coverImage.type.startsWith("image/")) {
      return { error: "Cover file must be an image." };
    }
    if (coverImage.size > 5 * 1024 * 1024) {
      return { error: "Cover file size must be under 5MB." };
    }
  }

  const galleryImages = formData.getAll("gallery_images") as File[];
  const hasGalleryFiles = galleryImages.some((img) => img && img.size > 0);
  if (hasGalleryFiles) {
    for (const img of galleryImages) {
      if (img && img.size > 0) {
        if (!img.type.startsWith("image/")) {
          return { error: "All gallery files must be images." };
        }
        if (img.size > 5 * 1024 * 1024) {
          return { error: "All gallery files must be under 5MB." };
        }
      }
    }
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (err: unknown) {
    console.error(
      "[CONFIG_ERROR] [createProduct] Failed to initialize admin client:",
      err
    );
    return {
      error:
        "Server misconfiguration: admin credentials are not set up. Contact an engineer.",
    };
  }

  // Check product name uniqueness requirement
  const { data: existingProduct } = await supabase
    .from("products")
    .select("id")
    .ilike("name", validation.data.name)
    .maybeSingle();

  if (existingProduct) {
    return {
      error: `A product with the name "${validation.data.name}" already exists. Product names must be unique.`,
    };
  }

  const customSellerId = String(formData.get("seller_id") ?? "").trim();
  const targetSellerId = customSellerId || session.userId;

  // 1. Ensure user profile exists in profiles table
  try {
    await supabase.from("profiles").upsert(
      {
        id: targetSellerId,
        full_name: session.profile?.full_name || session.email || "Factory Seller",
        role: "seller" as Role,
      },
      { onConflict: "id" }
    );
  } catch (profileErr) {
    console.warn("profiles provision warning:", profileErr);
  }

  // 2. Ensure seller_profiles entry exists to satisfy products table FK constraint
  try {
    await supabase.from("seller_profiles").upsert(
      {
        id: targetSellerId,
        business_name: session.profile?.full_name || "Factory Seller",
        gst_number: "PENDING",
        status: "pending",
      },
      { onConflict: "id" }
    );
  } catch (err) {
    console.warn("seller_profiles provision warning:", err);
  }

  // 3. Check seller verification status & insert product using seller_id
  const { data: sellerProfile } = await supabase
    .from("seller_profiles")
    .select("status")
    .eq("id", targetSellerId)
    .maybeSingle();

  const isSellerVerified = sellerProfile?.status === "verified";

  const statusRaw = String(formData.get("status") ?? "").trim();
  const productStatus: ProductStatus = statusRaw === "draft" ? "draft" : "published";
  const commerceFields = parseCommerceFields(formData);

  const { data, error } = await supabase
    .from("products")
    .insert({
      seller_id: targetSellerId,
      name: validation.data.name,
      category: validation.data.category,
      description: validation.data.description || null,
      price_inr: validation.data.price_inr,
      materials: validation.data.materials,
      seller_verified: isSellerVerified,
      status: productStatus,
      created_by: session.userId,
      updated_by: session.userId,
      ...commerceFields,
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
    return {
      error: error.message || "Could not create the product. Please try again.",
    };
  }

  const productSlug = slugifyProductName(validation.data.name);

  // === IMAGE HANDLING ===
  // Primary path: client-side pre-uploaded storage paths (no file bytes in server action)
  // Fallback path: legacy raw File uploads (e.g. from admin form)

  if (coverImagePath) {
    // Client already uploaded to storage — just move/copy to final location and update DB
    const ext = coverImagePath.split(".").pop() || "jpg";
    const fileName = `${productSlug}-1.${ext}`;
    const finalPath = `${targetSellerId}/products/${data.id}/${fileName}`;

    try {
      const { error: moveError } = await supabase.storage
        .from("product-media")
        .move(coverImagePath, finalPath);

      if (moveError) {
        // If move fails (e.g. different buckets), use the original path directly
        console.warn("Cover image move warning (using original path):", moveError);
        await supabase
          .from("products")
          .update({ cover_image_path: coverImagePath })
          .eq("id", data.id);
      } else {
        await supabase
          .from("products")
          .update({ cover_image_path: finalPath })
          .eq("id", data.id);
      }
    } catch (err) {
      console.error("Exception handling cover image path:", err);
      // Still try to use the original path
      await supabase
        .from("products")
        .update({ cover_image_path: coverImagePath })
        .eq("id", data.id);
    }
  } else if (hasCoverFile) {
    // Legacy fallback: raw file upload from admin or older form
    const ext = getFileExtension(coverImage);
    const fileName = `${productSlug}-1.${ext}`;
    const path = `${targetSellerId}/products/${data.id}/${fileName}`;

    try {
      const buffer = Buffer.from(await coverImage.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("product-media")
        .upload(path, buffer, {
          contentType: coverImage.type,
          upsert: true,
        });

      if (uploadError) {
        console.error("Cover image upload error:", uploadError);
      } else {
        await supabase
          .from("products")
          .update({ cover_image_path: path })
          .eq("id", data.id);
      }
    } catch (uploadErr) {
      console.error("Exception uploading cover image:", uploadErr);
    }
  }

  // Gallery images from client-side pre-upload
  if (galleryImagePaths.length > 0) {
    let position = 0;
    let imageIndex = 2;
    for (const srcPath of galleryImagePaths) {
      const ext = srcPath.split(".").pop() || "jpg";
      const fileName = `${productSlug}-${imageIndex}.${ext}`;
      const finalPath = `${targetSellerId}/products/${data.id}/${fileName}`;

      try {
        const { error: moveError } = await supabase.storage
          .from("product-media")
          .move(srcPath, finalPath);

        const recordPath = moveError ? srcPath : finalPath;
        if (moveError) {
          console.warn("Gallery image move warning (using original path):", moveError);
        }

        await supabase.from("product_images").insert({
          product_id: data.id,
          seller_id: targetSellerId,
          image_path: recordPath,
          position: position++,
        });
      } catch (err) {
        console.error("Exception handling gallery image path:", err);
      }
      imageIndex++;
    }
  } else if (hasGalleryFiles) {
    // Legacy fallback: raw file uploads
    let position = 0;
    let imageIndex = 2;
    for (const img of galleryImages) {
      if (img && img.size > 0) {
        const ext = getFileExtension(img);
        const fileName = `${productSlug}-${imageIndex}.${ext}`;
        const path = `${targetSellerId}/products/${data.id}/${fileName}`;
        try {
          const buffer = Buffer.from(await img.arrayBuffer());
          const { error: uploadError } = await supabase.storage
            .from("product-media")
            .upload(path, buffer, {
              contentType: img.type,
              upsert: true,
            });

          if (!uploadError) {
            await supabase.from("product_images").insert({
              product_id: data.id,
              seller_id: targetSellerId,
              image_path: path,
              position: position++,
            });
          } else {
            console.error("Gallery image upload error:", uploadError);
          }
        } catch (uploadErr) {
          console.error("Exception uploading gallery image:", uploadErr);
        }
        imageIndex++;
      }
    }
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/admin/dashboard/products");

  const isAdminRedirect = String(formData.get("is_admin") ?? "") === "true";
  if (isAdminRedirect) {
    redirect("/admin/dashboard/products");
  }

  redirect(`/dashboard/products/${data.id}`);
}

export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const session = await requireRole("seller");

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

  const { data: existingProduct } = await supabase
    .from("products")
    .select("id")
    .ilike("name", validation.data.name)
    .neq("id", productId)
    .maybeSingle();

  if (existingProduct) {
    return {
      error: `A product with the name "${validation.data.name}" already exists. Product names must be unique.`,
    };
  }

  const statusRaw = String(formData.get("status") ?? "").trim();
  const statusUpdate =
    statusRaw === "published" || statusRaw === "draft"
      ? (statusRaw as ProductStatus)
      : undefined;

  const coverImagePath = String(formData.get("cover_image_path") ?? "").trim();
  const commerceFields = parseCommerceFields(formData);

  const updatePayload: Partial<Product> = {
    name: validation.data.name,
    category: validation.data.category,
    description: validation.data.description || null,
    price_inr: validation.data.price_inr,
    materials: validation.data.materials,
    updated_by: session.userId,
    updated_at: new Date().toISOString(),
    ...commerceFields,
  };

  if (statusUpdate) {
    updatePayload.status = statusUpdate;
  }
  if (coverImagePath) {
    updatePayload.cover_image_path = coverImagePath;
  }

  const { error } = await supabase
    .from("products")
    .update(updatePayload)
    .eq("id", productId)
    .eq("seller_id", session.userId);

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "update_product",
    identifier: session.userId,
  });

  if (error) {
    console.error("Update product DB error:", error);
    return { error: "Could not save changes. Please try again." };
  }

  revalidatePath(`/dashboard/products/${productId}`);
  revalidatePath("/dashboard/products");
  revalidatePath(`/products/${productId}`);
  return { success: true };
}

export async function setProductStatus(productId: string, status: ProductStatus) {
  const session = await requireRole("seller");

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
    .eq("seller_id", session.userId);

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "set_product_status",
    identifier: session.userId,
  });

  revalidatePath(`/dashboard/products/${productId}`);
  revalidatePath("/dashboard/products");
}

export async function quickUpdateProduct(
  productId: string,
  data: {
    name: string;
    category?: string | null;
    price_inr?: number | null;
    status?: string | null;
    description?: string | null;
  }
) {
  const session = await requireRole("seller");

  const rateLimit = await checkRateLimit({
    endpointType: "user",
    actionName: "quick_update_product",
    identifier: session.userId,
  });
  if (rateLimit.blocked) {
    throw new Error(rateLimit.error || "Rate limit exceeded");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: data.name,
      category: data.category ?? undefined,
      price_inr: data.price_inr,
      status: (data.status as ProductStatus) ?? undefined,
      description: data.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .eq("seller_id", session.userId);

  if (error) {
    console.error("Seller quick update error:", error);
    throw new Error(error.message || "Failed to update product");
  }

  revalidatePath(`/dashboard/products/${productId}`);
  revalidatePath("/dashboard/products");
}

export async function sellerDeleteProductAction(productId: string) {
  const session = await requireRole("seller");

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
    .eq("seller_id", session.userId);

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

  revalidatePath("/dashboard/products");
}

export async function deleteProduct(productId: string) {
  const session = await requireRole("seller");

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
    .eq("seller_id", session.userId);

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

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export interface VariantFormState {
  error?: string;
}

export async function addVariant(
  productId: string,
  _prevState: VariantFormState,
  formData: FormData
): Promise<VariantFormState> {
  const session = await requireRole("seller");

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
    seller_id: session.userId,
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

  revalidatePath(`/dashboard/products/${productId}`);
  return {};
}

export async function deleteVariant(productId: string, variantId: string) {
  const session = await requireRole("seller");

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
    .eq("seller_id", session.userId);

  await logRateLimitAttempt({
    endpointType: "user",
    actionName: "delete_variant",
    identifier: session.userId,
  });

  revalidatePath(`/dashboard/products/${productId}`);
}

export async function uploadProductCoverAction(
  productId: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const session = await requireRole("seller");
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
      // Server-side magic byte & size validation
      const validation = await validateFileContentServer(file, ["image"]);
      if (!validation.valid) {
        return { error: validation.error || "Invalid image file." };
      }

      let supabase;
      try {
        supabase = createAdminClient();
      } catch (err: unknown) {
        console.error(
          "[CONFIG_ERROR] [uploadProductCoverAction] Admin client init failed:",
          err
        );
        return {
          error:
            "Server misconfiguration: admin credentials are not set up. Contact an engineer.",
        };
      }

      // Verify product ownership or admin
      const { data: product } = await supabase
        .from("products")
        .select("name, seller_id, cover_image_path")
        .eq("id", productId)
        .single();

      if (
        !product ||
        (product.seller_id !== session.userId && session.profile?.role !== "admin")
      ) {
        return { error: "Permission denied: Product not found or unauthorized." };
      }

      const productSlug = slugifyProductName(product.name || "product");
      const ext = getFileExtension(file);
      const fileName = `${productSlug}-1.${ext}`;
      const path = `${product.seller_id}/products/${productId}/${fileName}`;

      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("product-media")
        .upload(path, buffer, { contentType: file.type, upsert: true });

      if (uploadError) {
        return { error: uploadError.message || "Failed to upload cover image." };
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({ cover_image_path: path })
        .eq("id", productId);

      if (updateError) {
        // Rollback storage upload
        await supabase.storage.from("product-media").remove([path]);
        return { error: "Failed to update product cover image path." };
      }

      if (product.cover_image_path) {
        await supabase.storage.from("product-media").remove([product.cover_image_path]);
      }

      revalidatePath(`/dashboard/products/${productId}`);
      return { success: true };
    }
  );
}

export async function uploadProductImagesAction(
  productId: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const session = await requireRole("seller");
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
      // Validate all files server-side first
      for (const file of files) {
        const validation = await validateFileContentServer(file, ["image"]);
        if (!validation.valid) {
          return { error: validation.error || "Invalid gallery image file." };
        }
      }

      let supabase;
      try {
        supabase = createAdminClient();
      } catch (err: unknown) {
        console.error(
          "[CONFIG_ERROR] [uploadProductImagesAction] Admin client init failed:",
          err
        );
        return {
          error:
            "Server misconfiguration: admin credentials are not set up. Contact an engineer.",
        };
      }

      const { data: product } = await supabase
        .from("products")
        .select("name, seller_id")
        .eq("id", productId)
        .single();

      if (
        !product ||
        (product.seller_id !== session.userId && session.profile?.role !== "admin")
      ) {
        return { error: "Permission denied: Product not found or unauthorized." };
      }

      const productSlug = slugifyProductName(product.name || "product");
      const { data: existingImages } = await supabase
        .from("product_images")
        .select("position")
        .eq("product_id", productId);

      let nextPosition = existingImages?.length ?? 0;
      let imageIndex = nextPosition + 2;

      for (const file of files) {
        const ext = getFileExtension(file);
        const fileName = `${productSlug}-${imageIndex}.${ext}`;
        const path = `${product.seller_id}/products/${productId}/${fileName}`;

        const buffer = Buffer.from(await file.arrayBuffer());
        const { error: uploadError } = await supabase.storage
          .from("product-media")
          .upload(path, buffer, { contentType: file.type, upsert: true });

        if (uploadError) {
          return { error: uploadError.message || "Failed to upload gallery image." };
        }

        const { error: insertError } = await supabase.from("product_images").insert({
          product_id: productId,
          seller_id: product.seller_id,
          image_path: path,
          position: nextPosition,
        });

        if (insertError) {
          await supabase.storage.from("product-media").remove([path]);
          return { error: "Failed to record product gallery image." };
        }

        nextPosition++;
        imageIndex++;
      }

      revalidatePath(`/dashboard/products/${productId}`);
      return { success: true };
    }
  );
}
