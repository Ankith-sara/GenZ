import type { Product, ProductStatus } from "@genz/types";
import { ProductsRepository } from "./products.repository";
import type {
  CreateProductInput,
  ProductQueryFilters,
  UpdateProductInput,
} from "./products.types";

export class ProductsService {
  /**
   * Slugifies a product name for clean URLs and filenames
   */
  static slugify(name: string): string {
    return (
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "product"
    );
  }

  /**
   * Parses comma-delimited materials into clean array
   */
  static parseMaterials(materialsRaw: string): string[] {
    if (!materialsRaw) return [];
    return materialsRaw
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
  }

  /**
   * Retrieves a single product by ID
   */
  static async getProduct(productId: string): Promise<Product | null> {
    return ProductsRepository.getById(productId);
  }

  /**
   * Retrieves a list of products with filters
   */
  static async listProducts(filters: ProductQueryFilters = {}): Promise<{
    products: Product[];
    totalCount: number;
  }> {
    return ProductsRepository.list(filters);
  }

  /**
   * Verifies if a given seller or admin owns the product
   */
  static async verifyProductOwnership(
    productId: string,
    userId: string,
    userRole: string
  ): Promise<{ allowed: boolean; product?: Product; error?: string }> {
    const product = await ProductsRepository.getById(productId);
    if (!product) {
      return { allowed: false, error: "Product not found" };
    }

    if (userRole === "admin") {
      return { allowed: true, product };
    }

    if (product.seller_id !== userId) {
      return {
        allowed: false,
        product,
        error: "Unauthorized: You do not have permission to modify this product",
      };
    }

    return { allowed: true, product };
  }

  /**
   * Creates a product with business validation
   */
  static async createProduct(input: CreateProductInput): Promise<Product> {
    if (!input.name || input.name.trim().length < 2) {
      throw new Error("Product name must be at least 2 characters long");
    }
    if (input.price_inr < 0) {
      throw new Error("Product price cannot be negative");
    }

    return ProductsRepository.create({
      ...input,
      name: input.name.trim(),
      status: input.status || "draft",
    });
  }

  /**
   * Updates a product with business validation
   */
  static async updateProduct(
    productId: string,
    input: UpdateProductInput
  ): Promise<Product> {
    if (input.price_inr !== undefined && input.price_inr !== null && input.price_inr < 0) {
      throw new Error("Product price cannot be negative");
    }

    return ProductsRepository.update(productId, input);
  }

  /**
   * Updates product publishing status
   */
  static async setProductStatus(
    productId: string,
    status: ProductStatus
  ): Promise<void> {
    return ProductsRepository.setStatus(productId, status);
  }

  /**
   * Retrieves all distinct product categories from the database
   */
  static async getCategories(): Promise<string[]> {
    return ProductsRepository.getCategories();
  }
}

// Backward-compatibility alias
export { ProductsService as CatalogService };
