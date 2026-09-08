"use client";

import React from "react";
import {
  SellerProfileView,
  type SellerProfileViewData,
  type SellerProductItem,
  type SellerReelItem,
} from "@genz/ui/shared-features";
import type { Product } from "@genz/types";

export interface SellerProfileData extends SellerProfileViewData {}
export interface SellerReel extends SellerReelItem {}

interface SellerStoryProfileProps {
  seller: SellerProfileData;
  products: Product[];
  reels?: SellerReel[];
}

export function SellerStoryProfile({
  seller,
  products,
  reels = [],
}: SellerStoryProfileProps) {
  const mappedProducts: SellerProductItem[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    price_inr: p.price_inr,
    category: p.category,
    cover_image_path: p.cover_image_path,
    status: p.status,
    original_mrp: p.original_mrp,
  }));

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 text-[#1A1A18]">
      <div className="mx-auto max-w-4xl pt-6 sm:pt-10">
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E5E5E0] bg-white shadow-xs">
          <SellerProfileView
            seller={seller}
            products={mappedProducts}
            reels={reels}
          />
        </div>
      </div>
    </div>
  );
}
