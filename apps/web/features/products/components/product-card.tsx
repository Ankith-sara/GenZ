"use client";

import Link from "next/link";
import Image from "next/image";
import { formatInr, productMediaUrl } from "@/features/products/lib/products";
import { ProductWishlistButton } from "@/features/products/components/product-wishlist-button";
import type { Product } from "@genz/types";

export interface ProductCardProps {
  product: Product;
  artisanName?: string;
  sellerVerified?: boolean;
  isGI?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  artisanName,
  sellerVerified,
  isGI,
  className = "",
}: ProductCardProps) {
  const coverUrl = productMediaUrl(product.cover_image_path) || "/cat_toys.png";
  const artisan = artisanName || "Verified Indian Maker";
  const hasGI =
    isGI ??
    (product.category?.toLowerCase().includes("etikoppaka") ||
      product.name?.toLowerCase().includes("etikoppaka") ||
      false);

  return (
    <Link
      href={`/products/${product.id}`}
      className={`group block w-full text-left transition-all duration-300 ${className}`}
    >
      {/* 1. First: Tall Portrait Media Container (Reference: Clean Editorial Fashion Look) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F6F5F2]">
        <Image
          src={coverUrl}
          alt={product.name}
          fill
          unoptimized
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Floating Wishlist Button on Top-Right */}
        <div className="absolute top-3 right-3 z-20">
          <ProductWishlistButton product={product} />
        </div>

        {/* Minimal Clean Badge at Bottom-Left */}
        {hasGI ? (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="rounded-[2px] bg-[#2E2E2A]/90 px-2 py-0.5 font-graphik text-[10px] font-semibold tracking-wider uppercase text-white shadow-xs backdrop-blur-xs">
              GI Tag
            </span>
          </div>
        ) : sellerVerified ? (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="rounded-[2px] bg-[#2E2E2A]/90 px-2 py-0.5 font-graphik text-[10px] font-semibold tracking-wider uppercase text-white shadow-xs backdrop-blur-xs">
              Verified
            </span>
          </div>
        ) : null}

        {/* "Quick View" Pill floating at bottom on hover*/}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center opacity-0 transition-all duration-300 ease-out group-hover:bottom-5 group-hover:opacity-100">
          <span className="rounded-full bg-black/90 px-5 py-2 font-graphik text-xs font-semibold text-white shadow-md backdrop-blur-xs">
            Quick View
          </span>
        </div>
      </div>

      <div className="mt-3.5 space-y-1">
        <p className="font-graphik text-xs font-normal text-neutral-400">
          by {artisan}
        </p>

        {/* Product Title */}
        <h3 className="font-graphik text-sm font-medium tracking-tight text-neutral-900 transition-colors group-hover:text-black sm:text-base line-clamp-1">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="font-graphik text-xs leading-relaxed text-neutral-500 line-clamp-1">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="pt-0.5 flex items-baseline gap-2">
          <span className="font-graphik text-sm font-semibold tracking-tight text-neutral-900 sm:text-base">
            {formatInr(product.price_inr)}
          </span>
          {product.original_mrp && (
            <span className="font-graphik text-xs text-neutral-400 line-through">
              {formatInr(product.original_mrp)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
