"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import type { Product } from "@/types/database";

interface ProductWishlistButtonProps {
  product: Product;
  showText?: boolean;
}

export function ProductWishlistButton({
  product,
  showText = false,
}: ProductWishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("genz-wishlist");
    if (stored) {
      try {
        const items = JSON.parse(stored);
        const exists = items.some((item: Product) => item.id === product.id);
        setTimeout(() => {
          setIsWishlisted(exists);
        }, 0);
      } catch {
        setTimeout(() => {
          setIsWishlisted(false);
        }, 0);
      }
    }
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const stored = localStorage.getItem("genz-wishlist");
    let items: Product[] = [];
    if (stored) {
      try {
        items = JSON.parse(stored);
      } catch {
        items = [];
      }
    }

    const exists = items.some((item: Product) => item.id === product.id);
    if (exists) {
      items = items.filter((item: Product) => item.id !== product.id);
      setIsWishlisted(false);
    } else {
      items.push(product);
      setIsWishlisted(true);
    }

    localStorage.setItem("genz-wishlist", JSON.stringify(items));
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  if (showText) {
    return (
      <button
        onClick={toggleWishlist}
        className="border-ash hover:bg-cream-paper font-graphik flex cursor-pointer items-center gap-2 rounded-[4px] border px-4 py-2 text-xs font-normal tracking-[0.009em] transition-all focus:outline-none"
      >
        <Heart
          className={`h-4 w-4 transition-colors duration-300 ${
            isWishlisted
              ? "fill-brand-yellow text-brand-yellow-dark"
              : "text-neutral-600"
          }`}
        />
        <span>{isWishlisted ? "In Wishlist" : "Add to Wishlist"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleWishlist}
      className="bg-pure-white border-ash/40 hover:bg-cream-paper flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition-all focus:outline-none"
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`h-4.5 w-4.5 transition-colors duration-300 ${
          isWishlisted
            ? "fill-brand-yellow text-brand-yellow-dark"
            : "text-neutral-600 hover:text-neutral-900"
        }`}
      />
    </button>
  );
}
