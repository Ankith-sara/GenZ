import type { Category } from "@genz/types";
import { createAdminClient } from "./admin";
import fs from "fs";
import path from "path";

function getCategoriesStoragePath(file = "categories-store.json"): string {
  const isTest = process.env.NODE_ENV === "test" || process.env.VITEST;
  const fileName = isTest ? `test-${file}` : file;
  const primaryDir = path.resolve(process.cwd(), "packages/database/src/storage");
  if (fs.existsSync(primaryDir)) return path.join(primaryDir, fileName);
  const altDir = path.resolve(process.cwd(), "../../packages/database/src/storage");
  if (fs.existsSync(altDir)) return path.join(altDir, fileName);
  try {
    fs.mkdirSync(primaryDir, { recursive: true });
    return path.join(primaryDir, fileName);
  } catch {
    return path.resolve(process.cwd(), fileName);
  }
}

function readLocalCategories(): Category[] {
  try {
    const filePath = getCategoriesStoragePath();
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Category[];
    }
  } catch {}
  return [];
}

function writeLocalCategories(data: Category[]) {
  try {
    const filePath = getCategoriesStoragePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

export function slugifyCategory(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "category"
  );
}

/**
 * Retrieves all distinct product categories from the database,
 * incorporating both dedicated product_categories and active products.
 */
export async function getPlatformCategories(): Promise<Category[]> {
  const categoryMap = new Map<string, Category>();

  // 1. Read from local cache/store as baseline
  const localList = readLocalCategories();
  for (const cat of localList) {
    if (cat.name && cat.name.trim()) {
      categoryMap.set(cat.name.trim().toLowerCase(), {
        ...cat,
        productCount: cat.productCount ?? 0,
      });
    }
  }

  try {
    const admin = createAdminClient();

    // 2. Fetch from product_categories table
    const { data: dbCategories, error: catError } = await admin
      .from("product_categories")
      .select("*")
      .order("name", { ascending: true });

    if (!catError && Array.isArray(dbCategories)) {
      for (const row of dbCategories) {
        if (row.name && row.is_active !== false) {
          const key = row.name.trim().toLowerCase();
          categoryMap.set(key, {
            id: row.id,
            name: row.name.trim(),
            slug: row.slug || slugifyCategory(row.name),
            description: row.description || undefined,
            is_active: row.is_active ?? true,
            created_at: row.created_at,
            productCount: 0,
          });
        }
      }
    }

    // 3. Count products per category
    const { data: productRows, error: prodError } = await admin
      .from("products")
      .select("category");

    if (!prodError && Array.isArray(productRows)) {
      const counts: Record<string, number> = {};
      for (const p of productRows) {
        if (p.category && typeof p.category === "string" && p.category.trim()) {
          const trimmed = p.category.trim();
          const key = trimmed.toLowerCase();
          counts[key] = (counts[key] || 0) + 1;

          // If product has a category not yet in table, ensure it exists in the map
          if (!categoryMap.has(key)) {
            categoryMap.set(key, {
              id: slugifyCategory(trimmed),
              name: trimmed,
              slug: slugifyCategory(trimmed),
              is_active: true,
              productCount: 0,
            });
          }
        }
      }

      // Assign counts
      for (const [key, count] of Object.entries(counts)) {
        const item = categoryMap.get(key);
        if (item) {
          item.productCount = count;
        }
      }
    }
  } catch (err) {
    console.warn("[getPlatformCategories] Remote database query fallback:", err);
  }

  const result = Array.from(categoryMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Sync to local fallback
  if (result.length > 0) {
    writeLocalCategories(result);
  }

  return result;
}

/**
 * Adds a new product category to the platform database.
 */
export async function addPlatformCategory(
  name: string,
  description?: string
): Promise<{ success: boolean; category?: Category; error?: string }> {
  const cleanName = (name || "").trim();
  if (!cleanName) {
    return { success: false, error: "Category name cannot be empty." };
  }
  if (cleanName.length > 100) {
    return { success: false, error: "Category name cannot exceed 100 characters." };
  }

  const slug = slugifyCategory(cleanName);
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name: cleanName,
    slug,
    description: description?.trim() || undefined,
    is_active: true,
    productCount: 0,
    created_at: new Date().toISOString(),
  };

  // 1. Persist to local store
  const localList = readLocalCategories();
  const existingIdx = localList.findIndex(
    (c) => c.name.toLowerCase() === cleanName.toLowerCase() || c.slug === slug
  );
  if (existingIdx !== -1) {
    return { success: false, error: `Category "${cleanName}" already exists.` };
  }
  localList.push(newCat);
  writeLocalCategories(localList);

  // 2. Persist to Supabase if available
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("product_categories")
      .insert({
        name: cleanName,
        slug,
        description: description?.trim() || null,
        is_active: true,
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      newCat.id = data.id;
    }
  } catch (err) {
    console.warn("[addPlatformCategory] Remote insert warning:", err);
  }

  return { success: true, category: newCat };
}

/**
 * Subtracts (deletes) a product category from the platform database.
 */
export async function deletePlatformCategory(
  identifier: string
): Promise<{ success: boolean; error?: string }> {
  const cleanId = (identifier || "").trim();
  if (!cleanId) {
    return { success: false, error: "Category identifier is required." };
  }

  // 1. Remove from local store
  const localList = readLocalCategories();
  const filtered = localList.filter(
    (c) =>
      c.id !== cleanId &&
      c.name.toLowerCase() !== cleanId.toLowerCase() &&
      c.slug !== cleanId.toLowerCase()
  );
  writeLocalCategories(filtered);

  // 2. Remove from Supabase
  try {
    const admin = createAdminClient();
    await admin
      .from("product_categories")
      .delete()
      .or(`id.eq.${cleanId},name.ilike.${cleanId},slug.eq.${cleanId}`);
  } catch (err) {
    console.warn("[deletePlatformCategory] Remote delete warning:", err);
  }

  return { success: true };
}
