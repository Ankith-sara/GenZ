import Link from "next/link";
import Image from "next/image";
import { productMediaUrl, formatInr } from "@/lib/products";
import { VerifiedBadge } from "@/components/verified-badge";
import type { Product } from "@/types/database";

export function ProductCard({ product }: { product: Product }) {
  const coverUrl = productMediaUrl(product.cover_image_path);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-white block overflow-hidden rounded-xl border border-gray-100 p-2.5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-forest-green/30"
    >
      <div className="bg-[#fbf8f6] relative aspect-square w-full overflow-hidden rounded-lg">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="text-neutral-400 flex h-full w-full items-center justify-center text-xs">
            No image
          </div>
        )}
        <VerifiedBadge className="bg-white/95 absolute top-2.5 left-2.5 shadow-sm" />
      </div>
      <div className="pt-3 pb-1.5 px-1.5">
        <p className="text-gold-yellow text-[10px] uppercase tracking-widest font-bold font-sans">
          {product.category}
        </p>
        <p className="mt-1 truncate font-sans text-sm font-semibold text-neutral-800 group-hover:text-forest-green transition-colors leading-tight">
          {product.name}
        </p>
        <p className="text-forest-green font-sans font-bold mt-1 text-sm">
          {formatInr(product.price_inr)}
        </p>
      </div>
    </Link>
  );
}
