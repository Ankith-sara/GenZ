"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/features/auth/lib/require-role";

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
