"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@genz/database";
import { createAdminClient } from "@genz/database/admin";
import { requireRole } from "@/features/auth/lib/require-role";
import { parseMaterials } from "@/features/products/lib/products";
import type { ProductStatus, Role } from "@genz/types";
import { checkRateLimit, logRateLimitAttempt, withRateLimit } from "@/lib/rate-limiter";
import { productSchema, variantSchema } from "@/lib/validation";
import { validateFileContentServer } from "@/lib/file-validation";

export interface ProductFormState {
  error?: string;
}

function parseProductFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "toys").trim() || "toys";
  const age_group = String(formData.get("age_group") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("price_inr") ?? "").trim();
  const parsedPrice = priceRaw ? Number(priceRaw) : null;
  const price_inr = parsedPrice !== null && !isNaN(parsedPrice) ? parsedPrice : null;
  const materials = parseMaterials(String(formData.get("materials") ?? ""));
  return { name, category, age_group, description, price_inr, materials };
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

  // Cover image server-side validation
  const coverImage = formData.get("cover_image") as File | null;
  if (coverImage && coverImage.size > 0) {
    if (!coverImage.type.startsWith("image/")) {
      return { error: "Cover file must be an image." };
    }
    if (coverImage.size > 5 * 1024 * 1024) {
      return { error: "Cover file size must be under 5MB." };
    }
  }

  // Gallery images server-side validation
  const galleryImages = formData.getAll("gallery_images") as File[];
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

  const { data, error } = await supabase
    .from("products")
    .insert({
      seller_id: targetSellerId,
      name: validation.data.name,
      category: validation.data.category,
      age_group: validation.data.age_group,
      description: validation.data.description || null,
      price_inr: validation.data.price_inr,
      materials: validation.data.materials,
      seller_verified: isSellerVerified,
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

  // Upload cover image if provided (named <productSlug>-1.<ext>)
  if (coverImage && coverImage.size > 0) {
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

  // Upload gallery images if provided (named <productSlug>-2.<ext>, <productSlug>-3.<ext>, etc.)
  if (galleryImages.length > 0) {
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

  revalidatePath("/seller/dashboard/products");
  revalidatePath("/admin/dashboard/products");

  const isAdminRedirect = String(formData.get("is_admin") ?? "") === "true";
  if (isAdminRedirect) {
    redirect("/admin/dashboard/products");
  }

  redirect(`/seller/dashboard/products/${data.id}`);
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

  revalidatePath(`/seller/dashboard/products/${productId}`);
  revalidatePath("/seller/dashboard/products");
  return {};
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

  revalidatePath(`/seller/dashboard/products/${productId}`);
  revalidatePath("/seller/dashboard/products");
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

  revalidatePath("/seller/dashboard/products");
  redirect("/seller/dashboard/products");
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

  revalidatePath(`/seller/dashboard/products/${productId}`);
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

  revalidatePath(`/seller/dashboard/products/${productId}`);
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

      revalidatePath(`/seller/dashboard/products/${productId}`);
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

      revalidatePath(`/seller/dashboard/products/${productId}`);
      return { success: true };
    }
  );
}
