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
      className="group border-ash bg-white block overflow-hidden rounded-[4px] border p-1 shadow-none transition-all hover:border-black"
    >
      <div className="bg-[#fbf8f6] relative aspect-square w-full overflow-hidden rounded-[2px]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-[1.02]"
            unoptimized
          />
        ) : (
          <div className="text-smoke flex h-full w-full items-center justify-center text-xs">
            No image
          </div>
        )}
        <VerifiedBadge className="bg-white/90 absolute top-2 left-2" />
      </div>
      <div className="pt-3 pb-2 px-2">
        <p className="text-smoke text-[10px] uppercase tracking-wider font-sans">{product.category}</p>
        <p className="mt-1 truncate font-sans text-sm font-normal text-black">{product.name}</p>
        <p className="text-smoke mt-0.5 text-xs font-sans">
          {formatInr(product.price_inr)}
        </p>
      </div>
    </Link>
  );
}
