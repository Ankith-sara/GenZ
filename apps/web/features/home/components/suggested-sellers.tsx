"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Store } from "lucide-react";
import { Button } from "@genz/ui";

export interface SuggestedSellerProduct {
  id: string;
  name: string;
  price_inr?: number | null;
  category?: string | null;
  cover_image_path?: string | null;
  image_url?: string | null;
}

export interface SuggestedSeller {
  id: string;
  business_name: string;
  maker_name?: string;
  craft: string;
  city?: string | null;
  state?: string | null;
  avatar: string;
  established_year?: number | null;
  thumbnails: string[];
  products_count?: number;
  description?: string | null;
  products?: SuggestedSellerProduct[];
}

interface SuggestedSellersProps {
  sellers?: SuggestedSeller[];
}

export function SuggestedSellers({ sellers = [] }: SuggestedSellersProps) {
  return (
    <section
      id="suggested-sellers"
      className="border-b border-[#E5E5E0] bg-[#FAF8F5] px-4 py-16 sm:px-8 sm:py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100/70 px-3 py-0.5 text-[11px] font-semibold text-amber-900">
              <span>Authentic Regional Makers</span>
            </div>
            <h2 className="font-nantes text-ink-black text-3xl font-normal sm:text-4xl md:text-5xl">
              Suggested Indian Makers
            </h2>
          </div>

          <Button
            asChild
            variant="outline"
            className="font-graphik self-start rounded-full border-black px-6 text-xs font-bold text-black transition-all duration-300 hover:bg-black hover:text-white md:self-auto"
          >
            <Link href="/discover" className="flex items-center gap-2">
              <span>View All Makers</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Empty State */}
        {sellers.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D4D4CE] bg-white p-8 text-center sm:p-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 shadow-xs">
              <Store className="h-8 w-8" />
            </div>
            <h3 className="font-nantes mt-5 text-2xl font-normal text-neutral-900 sm:text-3xl">
              Makers Currently Onboarding
            </h3>
            <p className="font-graphik mt-2 max-w-lg text-xs leading-relaxed text-neutral-600 sm:text-sm">
              Verified Indian artisans, cooperatives, and manufacturing units are
              onboarding their workshop profiles. Sign up today to feature your
              workshop.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                className="font-graphik rounded-full bg-[#1A1A18] px-6 text-xs font-bold text-white transition-all hover:bg-neutral-800"
              >
                <Link href="/seller/signup">Apply as a Maker</Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Real Makers Cards Grid — Responsive for Mobile & Desktop */
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
            {sellers.map((seller) => {
              const location = [seller.city, seller.state]
                .filter(Boolean)
                .join(", ");
              const sellerImage = seller.avatar || "/indian_craftsman.png";

              return (
                <div
                  key={seller.id}
                  className="group flex w-full flex-col text-left transition-all duration-300"
                >
                  <div className="relative flex h-full flex-col items-center justify-between rounded-2xl border border-[#E5E5E0] bg-white p-5 sm:p-6 text-center shadow-xs transition-all duration-300 hover:border-neutral-300 hover:shadow-md">
                    {/* Top Content */}
                    <div className="flex w-full flex-col items-center">
                      {/* Top Bar: Suggested for you & Verified Badge */}
                      <div className="flex w-full items-center justify-between font-graphik text-[11px] font-medium text-neutral-400">
                        <span className="rounded-full bg-[#FAF8F5] px-2.5 py-0.5 text-[10px] font-semibold text-neutral-600">
                          Suggested for you
                        </span>
                        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-700">
                          Verified
                        </span>
                      </div>

                      {/* Centered Circular Profile Avatar */}
                      <Link
                        href={`/sellers/${seller.id}`}
                        title={`View ${seller.business_name} Profile`}
                        className="relative mx-auto my-4 h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden border-2 border-[#E5E5E0] bg-neutral-100 shadow-xs block cursor-pointer transition-transform duration-200 hover:scale-105"
                      >
                        <Image
                          src={sellerImage}
                          alt={seller.maker_name || seller.business_name}
                          fill
                          unoptimized
                          className="object-cover object-center"
                          sizes="(max-width: 640px) 96px, 112px"
                        />
                      </Link>

                      {/* Profile Details: Business Name (Without Blue Tick) */}
                      <h3 className="font-graphik text-base font-bold text-neutral-900 transition-colors group-hover:text-black">
                        <Link
                          href={`/sellers/${seller.id}`}
                          className="hover:underline"
                        >
                          {seller.business_name}
                        </Link>
                      </h3>

                      {/* Maker Handle / Name */}
                      <p className="font-graphik text-xs text-neutral-400 mt-0.5 font-mono">
                        by {seller.maker_name || "Verified Indian Artisan"}
                      </p>

                      {/* Craft & Bio */}
                      <p className="font-graphik text-xs font-medium text-neutral-600 mt-2 line-clamp-2 px-1 leading-relaxed">
                        {seller.craft}
                      </p>

                      {/* Location & Provenance */}
                      <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 font-graphik font-normal">
                        {location && <span>{location}</span>}
                        {location && <span>•</span>}
                        <span>
                          {seller.products_count
                            ? `${seller.products_count} ${
                                seller.products_count === 1
                                  ? "Live Listing"
                                  : "Live Listings"
                              }`
                            : "Direct Workshop"}
                        </span>
                      </div>
                    </div>

                    {/* Direct Page Navigation "View Profile" Button */}
                    <div className="mt-5 w-full">
                      <Link
                        href={`/sellers/${seller.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#171717] py-2.5 px-4 text-center font-graphik text-xs font-semibold text-white transition-all duration-200 hover:bg-neutral-800 shadow-xs"
                      >
                        <span>View Profile</span>
                        <ArrowRight className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
