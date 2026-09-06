"use client";

import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, ArrowRight, Store } from "lucide-react";
import { Button } from "@genz/ui";

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
}

interface SuggestedSellersProps {
  sellers?: SuggestedSeller[];
}

export function SuggestedSellers({ sellers = [] }: SuggestedSellersProps) {
  const displaySellers = sellers;

  return (
    <section id="suggested-sellers" className="border-b border-[#E5E5E0] bg-[#FAF8F5] px-6 py-20 sm:px-12 md:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-nantes text-ink-black text-4xl font-normal sm:text-5xl">
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
        {displaySellers.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D4D4CE] bg-white p-12 text-center sm:p-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 shadow-xs">
              <Store className="h-8 w-8" />
            </div>
            <h3 className="font-nantes mt-5 text-2xl font-normal text-neutral-900 sm:text-3xl">
              Makers Currently Onboarding
            </h3>
            <p className="font-graphik mt-2 max-w-lg text-xs leading-relaxed text-neutral-600 sm:text-sm">
              Verified Indian artisans, cooperatives, and manufacturing units are onboarding their workshop profiles. Sign up today to feature your workshop.
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
          /* Real Makers Cards Grid — Authentic Instagram Profile Suggest Card Style */
          <div className="mt-8 flex flex-wrap gap-6">
            {displaySellers.map((seller) => {
              const location = [seller.city, seller.state].filter(Boolean).join(", ");
              const sellerImage = seller.avatar || "/indian_craftsman.png";

              return (
                <Link
                  key={seller.id}
                  href={`/sellers/${seller.id}`}
                  className="group block w-full max-w-[300px] text-left transition-all duration-300"
                >
                  <div className="relative flex flex-col items-center rounded-2xl border border-[#E5E5E0] bg-white p-6 text-center shadow-xs transition-all duration-300 hover:border-neutral-300 hover:shadow-md">
                    {/* Top Bar: Suggested for you & Verified Badge */}
                    <div className="flex w-full items-center justify-between text-[11px] font-medium font-graphik text-neutral-400">
                      <span className="rounded-full bg-[#FAF8F5] px-2.5 py-0.5 text-[10px] font-semibold text-neutral-600">
                        Suggested for you
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#0095F6]">
                        <BadgeCheck className="h-3.5 w-3.5 fill-[#0095F6]/10 text-[#0095F6]" />
                        Verified
                      </span>
                    </div>

                    {/* Centered Circular Profile Avatar with Instagram-Style Story Ring */}
                    <div className="relative mx-auto my-4 h-24 w-24 sm:h-28 sm:w-28 rounded-full p-[2.5px] bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] shadow-xs transition-transform duration-300">
                      <div className="h-full w-full rounded-full bg-white p-[2px]">
                        <div className="relative h-full w-full overflow-hidden rounded-full bg-neutral-100">
                          <Image
                            src={sellerImage}
                            alt={seller.maker_name || seller.business_name}
                            fill
                            unoptimized
                            className="object-cover object-center"
                            sizes="112px"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Profile Details: Business Name with Verified Checkmark */}
                    <h3 className="font-graphik text-base font-bold text-neutral-900 flex items-center justify-center gap-1.5 transition-colors group-hover:text-black">
                      <span>{seller.business_name}</span>
                      <BadgeCheck className="h-4 w-4 text-[#0095F6] fill-[#0095F6]/10 shrink-0" />
                    </h3>

                    {/* Maker Handle / Name */}
                    <p className="font-graphik text-xs text-neutral-400 mt-0.5">
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
                          ? `${seller.products_count} ${seller.products_count === 1 ? 'Live Listing' : 'Live Listings'}`
                          : 'Direct Workshop'}
                      </span>
                    </div>

                    {/* Instagram-Style "View Profile" Button */}
                    <div className="mt-5 w-full">
                      <span className="block w-full rounded-xl bg-black py-2.5 text-center font-graphik text-xs font-semibold text-white transition-all duration-200 hover:bg-neutral-800 group-hover:bg-neutral-900 shadow-xs">
                        View Profile
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
