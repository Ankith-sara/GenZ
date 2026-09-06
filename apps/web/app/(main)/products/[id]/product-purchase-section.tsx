"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@genz/ui";
import { ShoppingCart, Zap, Plus, Minus, Check, ShieldCheck, Truck } from "lucide-react";
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
    price_inr: number;
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
      : product.price_inr;

  const handleAddToCart = (redirectAfter = false) => {
    const existingCart = localStorage.getItem("genz-cart");
    let items = [];
    if (existingCart) {
      try {
        items = JSON.parse(existingCart);
      } catch {}
    }

    const cartItemId = activeVariant
      ? `${product.id}-${activeVariant.id}`
      : product.id;

    const existingIndex = items.findIndex((i: { id: string; quantity: number }) => i.id === cartItemId);
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
    <div className="border-t border-[#E5E5E0] pt-6 mt-6 space-y-5">
      {/* Variants selection if available */}
      {variants.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-[#1A1A18] tracking-wider uppercase mb-2">
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
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#1A1A18] text-white shadow-sm ring-2 ring-[#1A1A18]/20"
                      : "bg-white border border-[#E5E5E0] text-[#52524E] hover:border-[#1A1A18]"
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
        <label className="text-xs font-semibold text-[#1A1A18] tracking-wider uppercase">
          Quantity:
        </label>
        <div className="inline-flex items-center border border-[#E5E5E0] bg-white rounded-lg overflow-hidden h-9">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-2.5 h-full flex items-center justify-center text-[#73736E] hover:text-[#1A1A18] hover:bg-[#FAF8F4] transition-colors"
            title="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-10 text-center font-mono text-sm font-semibold text-[#1A1A18]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="px-2.5 h-full flex items-center justify-center text-[#73736E] hover:text-[#1A1A18] hover:bg-[#FAF8F4] transition-colors"
            title="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-xs text-[#73736E]">
          Total: <strong className="text-[#1A1A18]">{formatInr(currentPrice * quantity)}</strong>
        </span>
      </div>

      {/* Action Buttons: Add to Cart & Buy with COD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <Button
          type="button"
          onClick={() => handleAddToCart(false)}
          className={`h-12 w-full font-medium text-xs tracking-wider uppercase transition-all duration-200 ${
            isAdded
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-[#FAF7F0] hover:bg-[#F3EFE6] text-[#1A1A18] border border-[#1A1A18]"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 mr-2" /> Added to Basket!
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" /> Add to Basket
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={() => handleAddToCart(true)}
          className="h-12 w-full bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-xs tracking-wider uppercase shadow-sm transition-all"
        >
          <Zap className="w-4 h-4 mr-2 fill-white" /> Buy with COD
        </Button>
      </div>

      {/* Delivery & Trust Highlights */}
      <div className="bg-[#FAF8F4] rounded-xl p-3.5 border border-[#E5E5E0]/80 space-y-2 text-xs text-[#52524E]">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#D97706] shrink-0" />
          <span>
            <strong>Cash on Delivery Available:</strong> Pay only when delivered to your door.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Direct dispatch from <strong>{seller?.business_name || "Verified Factory Desk"}</strong>.
          </span>
        </div>
      </div>


    </div>
  );
}
