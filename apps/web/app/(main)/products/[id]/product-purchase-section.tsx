"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@genz/ui";
import {
  ShoppingCart,
  Zap,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { formatInr } from "@/features/products/lib/products";

interface VariantItem {
  id: string;
  variant_name: string;
  variant_value: string;
  price_inr: number | null;
}

interface ProductPurchaseSectionProps {
  product: {
    id: string;
    name: string;
    price_inr: number | null;
    category: string;
    coverUrl: string | null;
    seller_id: string;
  };
  seller: {
    business_name: string;
    city?: string | null;
    state?: string | null;
  } | null;
  variants: VariantItem[];
}

export function ProductPurchaseSection({
  product,
  seller,
  variants,
}: ProductPurchaseSectionProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.length > 0 ? variants[0].id : null
  );
  const [isAdded, setIsAdded] = useState(false);

  const activeVariant = variants.find((v) => v.id === selectedVariantId);
  const currentPrice =
    activeVariant && activeVariant.price_inr !== null
      ? activeVariant.price_inr
      : (product.price_inr ?? 0);

  const handleAddToCart = (redirectAfter = false) => {
    const existingCart = localStorage.getItem("genz-cart");
    let items = [];
    if (existingCart) {
      try {
        items = JSON.parse(existingCart);
      } catch {}
    }

    const cartItemId = activeVariant ? `${product.id}-${activeVariant.id}` : product.id;

    const existingIndex = items.findIndex(
      (i: { id: string; quantity: number }) => i.id === cartItemId
    );
    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({
        id: cartItemId,
        productId: product.id,
        product_id: product.id,
        name: product.name,
        category: product.category,
        price: currentPrice,
        quantity,
        image:
          product.coverUrl ||
          "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=400&q=80",
        sellerId: product.seller_id,
        seller_id: product.seller_id,
        sellerBusinessName: seller?.business_name || "Verified Indian Maker",
        variantName: activeVariant?.variant_name,
        variantValue: activeVariant?.variant_value,
      });
    }

    localStorage.setItem("genz-cart", JSON.stringify(items));
    window.dispatchEvent(new Event("cart-updated"));

    if (redirectAfter) {
      router.push("/checkout");
    } else {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2500);
    }
  };

  return (
    <div className="mt-6 space-y-5 border-t border-[#E5E5E0] pt-6">
      {/* Variants selection if available */}
      {variants.length > 0 && (
        <div>
          <label className="mb-2 block text-xs font-semibold tracking-wider text-[#1A1A18] uppercase">
            Select Option / Variant:
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isSelected = selectedVariantId === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#1A1A18] text-white shadow-sm ring-2 ring-[#1A1A18]/20"
                      : "border border-[#E5E5E0] bg-white text-[#52524E] hover:border-[#1A1A18]"
                  }`}
                >
                  {variant.variant_name}: {variant.variant_value}
                  {variant.price_inr !== null && (
                    <span className="ml-1.5 opacity-80">
                      ({formatInr(variant.price_inr)})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <label className="text-xs font-semibold tracking-wider text-[#1A1A18] uppercase">
          Quantity:
        </label>
        <div className="inline-flex h-9 items-center overflow-hidden rounded-lg border border-[#E5E5E0] bg-white">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-full items-center justify-center px-2.5 text-[#73736E] transition-colors hover:bg-[#FAF8F4] hover:text-[#1A1A18]"
            title="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center font-mono text-sm font-semibold text-[#1A1A18]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-full items-center justify-center px-2.5 text-[#73736E] transition-colors hover:bg-[#FAF8F4] hover:text-[#1A1A18]"
            title="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="text-xs text-[#73736E]">
          Total:{" "}
          <strong className="text-[#1A1A18]">
            {formatInr(currentPrice * quantity)}
          </strong>
        </span>
      </div>

      {/* Action Buttons: Add to Cart & Buy with COD */}
      <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
        <Button
          type="button"
          onClick={() => handleAddToCart(false)}
          className={`h-12 w-full text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
            isAdded
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "border border-[#1A1A18] bg-[#FAF7F0] text-[#1A1A18] hover:bg-[#F3EFE6]"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Added to Basket!
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Basket
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={() => handleAddToCart(true)}
          className="h-12 w-full bg-[#D97706] text-xs font-semibold tracking-wider text-white uppercase shadow-sm transition-all hover:bg-[#B45309]"
        >
          <Zap className="mr-2 h-4 w-4 fill-white" /> Buy with COD
        </Button>
      </div>

      {/* Delivery & Trust Highlights */}
      <div className="space-y-2 rounded-xl border border-[#E5E5E0]/80 bg-[#FAF8F4] p-3.5 text-xs text-[#52524E]">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 shrink-0 text-[#D97706]" />
          <span>
            <strong>Cash on Delivery Available:</strong> Pay only when delivered to your
            door.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            Direct dispatch from{" "}
            <strong>{seller?.business_name || "Verified Seller Desk"}</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}
