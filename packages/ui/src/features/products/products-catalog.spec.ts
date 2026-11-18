import { describe, it, expect } from "vitest";
import {
  resolveProductImage,
  type SharedProductRecord,
} from "./products-catalog-manager";

describe("Products Catalog UI Manager Specs", () => {
  describe("resolveProductImage", () => {
    it("returns direct HTTP/HTTPS URL when image_url is provided", () => {
      const product: SharedProductRecord = {
        id: "prod-1",
        name: "Artisan Toy",
        image_url: "https://example.com/photos/toy.jpg",
      };
      expect(resolveProductImage(product)).toBe("https://example.com/photos/toy.jpg");
    });

    it("prefers image_url over images array and cover_image_path", () => {
      const product: SharedProductRecord = {
        id: "prod-2",
        name: "Artisan Toy",
        image_url: "https://example.com/primary.jpg",
        images: ["https://example.com/secondary.jpg"],
        cover_image_path: "storage/path.jpg",
      };
      expect(resolveProductImage(product)).toBe("https://example.com/primary.jpg");
    });

    it("falls back to first image in images array when image_url is absent", () => {
      const product: SharedProductRecord = {
        id: "prod-3",
        name: "Artisan Toy",
        images: ["https://example.com/first.jpg", "https://example.com/second.jpg"],
      };
      expect(resolveProductImage(product)).toBe("https://example.com/first.jpg");
    });

    it("resolves cover_image_path with leading slash if relative path", () => {
      const product: SharedProductRecord = {
        id: "prod-4",
        name: "Artisan Toy",
        cover_image_path: "local/image.png",
      };
      const resolved = resolveProductImage(product);
      expect(resolved).toBeTruthy();
      expect(resolved?.endsWith("local/image.png")).toBe(true);
    });

    it("returns null when all image sources are absent or empty", () => {
      const product: SharedProductRecord = {
        id: "prod-5",
        name: "Artisan Toy",
        images: [],
      };
      expect(resolveProductImage(product)).toBeNull();
    });
  });
});
