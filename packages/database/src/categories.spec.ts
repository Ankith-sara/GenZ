import { describe, it, expect } from "vitest";
import {
  getPlatformCategories,
  addPlatformCategory,
  deletePlatformCategory,
  slugifyCategory,
} from "./categories";

describe("Platform Categories Database Operations", () => {
  it("slugifies category name correctly", () => {
    expect(slugifyCategory("Etikoppaka Wooden Toys")).toBe("etikoppaka-wooden-toys");
    expect(slugifyCategory("  Home & Living Crafts!  ")).toBe("home-living-crafts");
  });

  it("adds and subtracts (deletes) categories dynamically", async () => {
    const testCatName = `Test Category ${Date.now()}`;

    // Addition
    const addResult = await addPlatformCategory(
      testCatName,
      "High-grade testing craft category"
    );
    expect(addResult.success).toBe(true);
    expect(addResult.category).toBeDefined();
    expect(addResult.category?.name).toBe(testCatName);

    // Verify it appears in categories list
    const listAfterAdd = await getPlatformCategories();
    expect(listAfterAdd.some((c) => c.name === testCatName)).toBe(true);

    // Duplicate prevention
    const dupResult = await addPlatformCategory(testCatName);
    expect(dupResult.success).toBe(false);

    // Subtraction (deletion)
    const deleteResult = await deletePlatformCategory(testCatName);
    expect(deleteResult.success).toBe(true);

    // Verify it is removed
    const listAfterDelete = await getPlatformCategories();
    expect(listAfterDelete.some((c) => c.name === testCatName)).toBe(false);
  });
});
