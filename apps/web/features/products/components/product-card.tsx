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
      {/* 1. Tall Editorial Media Container */}
      <div className="relative aspect-[4/5] w-full bg-[#F6F5F2] border border-[#EBEAE5]">
        <Image
          src={coverUrl}
          alt={product.name}
          fill
          unoptimized
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />

        {/* Floating Wishlist Button on Top-Right */}
        <div className="absolute top-2.5 right-2.5 z-20 sm:top-3 sm:right-3">
          <ProductWishlistButton product={product} />
        </div>

        {/* Minimal Clean Badge at Bottom-Left */}
        {hasGI ? (
          <div className="absolute bottom-2.5 left-2.5 z-10 sm:bottom-3 sm:left-3">
            <span className="rounded-[2px] bg-[#2E2E2A]/90 px-1.5 py-0.5 font-graphik text-[9px] font-semibold tracking-wider uppercase text-white shadow-xs backdrop-blur-xs sm:px-2 sm:text-[10px]">
              GI Tag
            </span>
          </div>
        ) : sellerVerified ? (
          <div className="absolute bottom-2.5 left-2.5 z-10 sm:bottom-3 sm:left-3">
            <span className="rounded-[2px] bg-[#2E2E2A]/90 px-1.5 py-0.5 font-graphik text-[9px] font-semibold tracking-wider uppercase text-white shadow-xs backdrop-blur-xs sm:px-2 sm:text-[10px]">
              Verified
            </span>
          </div>
        ) : null}

        {/* "Quick View" Pill floating at bottom on hover */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center opacity-0 transition-all duration-300 ease-out group-hover:bottom-4 group-hover:opacity-100 sm:bottom-4 sm:group-hover:bottom-5">
          <span className="rounded-full bg-black/90 px-3.5 py-1.5 font-graphik text-[11px] font-semibold text-white shadow-md backdrop-blur-xs sm:px-5 sm:py-2 sm:text-xs">
            Quick View
          </span>
        </div>
      </div>

      <div className="mt-2.5 space-y-0.5 sm:mt-3 sm:space-y-1">
        <p className="font-graphik text-[11px] font-normal text-neutral-400 truncate sm:text-xs">
          by {artisan}
        </p>

        {/* Product Title */}
        <h3 className="font-graphik text-xs font-semibold tracking-tight text-neutral-900 transition-colors group-hover:text-black sm:text-sm line-clamp-1">
          {product.name}
        </h3>

        {/* Price */}
        <div className="pt-0.5 flex items-baseline gap-1.5">
          <span className="font-graphik text-xs font-bold tracking-tight text-neutral-900 sm:text-sm">
            {formatInr(product.price_inr)}
          </span>
          {product.original_mrp && (
            <span className="font-graphik text-[10px] text-neutral-400 line-through sm:text-xs">
              {formatInr(product.original_mrp)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
