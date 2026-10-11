"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@genz/database/authorization";
import { withRateLimit } from "@genz/utils/rate-limiter";
import {
  getPlatformCategories,
  addPlatformCategory,
  deletePlatformCategory,
} from "@genz/database/categories";
import type { Category } from "@genz/types";

export interface CategoryActionState {
  success?: boolean;
  error?: string;
  category?: Category;
}

/**
 * Fetches all platform product categories with product counts.
 */
export async function fetchCategoriesAction(): Promise<Category[]> {
  await requirePermission("products:read");
  return getPlatformCategories();
}

/**
 * Adds a new product category to the platform.
 */
export async function addCategoryAction(
  _prevState: CategoryActionState | null,
  formData: FormData
): Promise<CategoryActionState> {
  const { session } = await requirePermission("system:write");
  const adminId = session.userId || session.user?.id || "admin";

  return withRateLimit(
    {
      endpointType: "user",
      actionName: "admin_add_category",
      identifier: adminId,
    },
    async () => {
      const name = String(formData.get("name") || "").trim();
      const description = String(formData.get("description") || "").trim();

      if (!name) {
        return { success: false, error: "Category name is required." };
      }

      const res = await addPlatformCategory(name, description);
      if (!res.success) {
        return { success: false, error: res.error || "Failed to add category." };
      }

      revalidatePath("/dashboard/settings");
      revalidatePath("/dashboard/products");
      revalidatePath("/discover");

      return { success: true, category: res.category };
    }
  );
}

/**
 * Deletes (subtracts) a product category from the platform.
 */
export async function deleteCategoryAction(
  _prevState: CategoryActionState | null,
  formData: FormData
): Promise<CategoryActionState> {
  const { session } = await requirePermission("system:write");
  const adminId = session.userId || session.user?.id || "admin";

  return withRateLimit(
    {
      endpointType: "user",
      actionName: "admin_delete_category",
      identifier: adminId,
    },
    async () => {
      const identifier = String(
        formData.get("identifier") || formData.get("name") || formData.get("id") || ""
      ).trim();

      if (!identifier) {
        return { success: false, error: "Category identifier is required." };
      }

      const res = await deletePlatformCategory(identifier);
      if (!res.success) {
        return { success: false, error: res.error || "Failed to delete category." };
      }

      revalidatePath("/dashboard/settings");
      revalidatePath("/dashboard/products");
      revalidatePath("/discover");

      return { success: true };
    }
  );
}
