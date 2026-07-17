import Link from "next/link";
import Image from "next/image";
import { productMediaUrl, formatInr } from "@/lib/products";
import { VerifiedBadge } from "@/components/verified-badge";
import { ProductWishlistButton } from "@/components/product-wishlist-button";
import type { Product } from "@/types/database";

export function ProductCard({ product }: { product: Product }) {
  const coverUrl = productMediaUrl(product.cover_image_path);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-paper-white hover:border-brand-yellow/30 block overflow-hidden rounded-[4px] border border-black/10 p-2.5 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[4px] bg-[#fbf8f6]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
            No image
          </div>
        )}
        <VerifiedBadge className="bg-paper-white/95 absolute top-2.5 left-2.5" />

        {/* Wishlist Button */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <ProductWishlistButton product={product} />
        </div>
      </div>
      <div className="px-1.5 pt-3 pb-1.5">
        <p className="text-brand-yellow-dark font-sans text-[10px] font-medium tracking-widest uppercase">
          {product.category}
        </p>
        <p className="group-hover:text-brand-yellow mt-1 truncate font-sans text-sm leading-tight font-semibold text-neutral-800 transition-colors">
          {product.name}
        </p>
        <p className="text-brand-yellow mt-1 font-sans text-sm font-medium">
          {formatInr(product.price_inr)}
        </p>
      </div>
    </Link>
  );
}
