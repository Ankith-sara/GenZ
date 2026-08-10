import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "@/features/products/components/product-card";
import type { Product } from "@/types/database";

const mockProduct: Product = {
  id: "prod_001",
  seller_id: "seller_unverified_123",
  name: "Handmade Wooden Blocks",
  category: "Toys",
  age_group: "3-5 years",
  description: "Natural wooden blocks",
  price_inr: 499,
  status: "published",
  cover_image_path: "products/blocks.jpg",
  materials: ["Wood"],
  seller_verified: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("ProductCard Component", () => {
  it("does NOT render VerifiedBadge when sellerVerified is false (unverified or rejected seller)", () => {
    render(<ProductCard product={mockProduct} sellerVerified={false} />);

    expect(screen.getByText("Handmade Wooden Blocks")).toBeInTheDocument();
    expect(screen.queryByText("GST Verified")).not.toBeInTheDocument();
  });

  it("does NOT render VerifiedBadge when sellerVerified prop is omitted and product.seller_verified is false", () => {
    const unverifiedProduct = { ...mockProduct, seller_verified: false };
    render(<ProductCard product={unverifiedProduct} />);

    expect(screen.queryByText("GST Verified")).not.toBeInTheDocument();
  });

  it("renders VerifiedBadge when sellerVerified is explicitly true", () => {
    render(<ProductCard product={mockProduct} sellerVerified={true} />);

    expect(screen.getByText("GST Verified")).toBeInTheDocument();
  });

  it("renders VerifiedBadge when product.seller_verified is true and sellerVerified is omitted", () => {
    const verifiedProduct = { ...mockProduct, seller_verified: true };
    render(<ProductCard product={verifiedProduct} />);

    expect(screen.getByText("GST Verified")).toBeInTheDocument();
  });
});
