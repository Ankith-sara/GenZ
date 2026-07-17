"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/types/database";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    function loadWishlist() {
      const stored = localStorage.getItem("genz-wishlist");
      if (stored) {
        try {
          setWishlist(JSON.parse(stored));
        } catch {
          setWishlist([]);
        }
      }
    }

    setTimeout(() => {
      loadWishlist();
      setMounted(true);
    }, 0);

    window.addEventListener("wishlist-updated", loadWishlist);
    return () => window.removeEventListener("wishlist-updated", loadWishlist);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-background flex min-h-screen flex-col font-sans antialiased">
        <main className="flex-1 px-6 py-16 sm:px-12 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="h-8 w-48 animate-pulse rounded bg-neutral-200"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen flex-col font-sans antialiased">
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:px-12">
          {/* Header */}
          <div className="mb-10 flex flex-col gap-3">
            <Link
              href="/discover"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Discover
            </Link>
            <h1 className="text-4xl font-normal tracking-tight sm:text-5xl">
              My Wishlist{" "}
              <span className="text-muted-foreground text-2xl font-light">
                ({wishlist.length})
              </span>
            </h1>
          </div>

          {/* Grid */}
          {wishlist.length === 0 ? (
            <div className="border-ash/40 flex flex-col items-center justify-center rounded-[4px] border border-dashed px-6 py-20 text-center">
              <div className="bg-cream-paper text-smoke mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Heart className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-medium text-neutral-800">
                Your wishlist is empty
              </h2>
              <p className="text-muted-foreground mt-1 max-w-xs text-sm">
                Save items you like to keep track of them and make inquiries later.
              </p>
              <Link
                href="/discover"
                className="bg-dark-band text-dark-band-foreground hover:bg-dark-band/90 mt-6 inline-flex h-10 items-center justify-center rounded-[4px] px-6 text-sm font-medium transition-colors"
              >
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="animate-fadeIn grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {wishlist.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
