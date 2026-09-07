"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck, MapPin, Grid3X3, Film, BookOpen,
  Share2, ExternalLink, ShoppingBag, Play, CheckCircle2,
} from "lucide-react";
import { Button } from "../../components/button";

export interface SellerProfileViewData {
  id: string;
  business_name: string;
  maker_name?: string | null;
  craft_title?: string | null;
  city?: string | null;
  state?: string | null;
  established_year?: number | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  description?: string | null;
  story?: {
    how_it_started?: string;
    generations_heritage?: string;
    materials_and_technique?: string;
    vision?: string;
    milestones?: Array<{ year: string; title: string; desc: string }>;
  };
}

export interface SellerProductItem {
  id: string;
  name: string;
  price_inr?: number | null;
  category?: string | null;
  cover_image_path?: string | null;
  image_url?: string | null;
  status?: string | null;
}

export interface SellerReelItem {
  id: string;
  thumbnail_path?: string | null;
  caption?: string | null;
  views_count?: number;
  duration?: string;
}

export interface SellerProfileViewProps {
  seller: SellerProfileViewData;
  products?: SellerProductItem[];
  reels?: SellerReelItem[];
  isModal?: boolean;
  onClose?: () => void;
  fullProfileHref?: string;
}

export function SellerProfileView({
  seller,
  products = [],
  reels = [],
  isModal = false,
  onClose,
  fullProfileHref,
}: SellerProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "story">("posts");
  const [copiedLink, setCopiedLink] = useState(false);

  const location = [seller.city, seller.state].filter(Boolean).join(", ");
  const avatarSrc = seller.avatar_url || "/indian_craftsman.png";
  const craftTitle = seller.craft_title || "Verified Indian Artisan & Manufacturer";
  const established = seller.established_year || 1992;
  const yearsActive = new Date().getFullYear() - established;

  // Social-style handle
  const handle =
    seller.business_name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 24);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(
        window.location.origin + `/sellers/${seller.id}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Story highlights
  const highlights = [
    {
      id: "lathe",
      label: "Workshop",
      icon: "🪵",
      bg: "bg-amber-100 text-amber-900",
    },
    {
      id: "materials",
      label: "Eco Dyes",
      icon: "🎨",
      bg: "bg-rose-100 text-rose-900",
    },
    {
      id: "gi-tag",
      label: "GI Tag",
      icon: "🏅",
      bg: "bg-yellow-100 text-yellow-900",
    },
    {
      id: "safety",
      label: "Audited",
      icon: "🛡️",
      bg: "bg-emerald-100 text-emerald-900",
    },
    {
      id: "awards",
      label: "National",
      icon: "⭐",
      bg: "bg-blue-100 text-blue-900",
    },
  ];

  // Helper to resolve product image
  const getProductImage = (p: SellerProductItem) => {
    if (p.image_url) return p.image_url;
    if (p.cover_image_path) {
      if (p.cover_image_path.startsWith("http")) return p.cover_image_path;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        return `${supabaseUrl}/storage/v1/object/public/product-media/${p.cover_image_path}`;
      }
      return p.cover_image_path;
    }
    return "/etikoppaka_toys.png";
  };

  const displayReels =
    reels.length > 0
      ? reels
      : [
          {
            id: "r1",
            thumbnail_path: "/etikoppaka_toys.png",
            caption: "Precision wood turning on traditional lathe",
            views_count: 14200,
            duration: "0:45",
          },
          {
            id: "r2",
            thumbnail_path: "/cat_toys.png",
            caption: "Applying friction melted vegetable-dye lacquer",
            views_count: 9800,
            duration: "0:38",
          },
          {
            id: "r3",
            thumbnail_path: "/cat_furniture.png",
            caption: "Hand finishing natural ivory wood carvings",
            views_count: 18500,
            duration: "0:52",
          },
        ];

  return (
    <div
      className={`w-full bg-white text-[#1A1A18] select-none ${
        isModal ? "p-4 sm:p-8" : "mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-12"
      }`}
    >
      {/* 1. SOCIAL PROFILE HEADER */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
        {/* Left: Avatar with Story Gradient Ring */}
        <div className="flex shrink-0 justify-center md:justify-start">
          <div className="relative h-24 w-24 sm:h-36 sm:w-36 rounded-full p-[3.5px] bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] shadow-md transition-transform duration-300 hover:scale-105">
            <div className="h-full w-full rounded-full bg-white p-[2.5px]">
              <div className="relative h-full w-full overflow-hidden rounded-full bg-neutral-100">
                <Image
                  src={avatarSrc}
                  alt={seller.business_name}
                  fill
                  className="object-cover object-center"
                  priority
                  unoptimized
                />
              </div>
            </div>
            {/* Verified Badge Pin */}
            <div className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md">
              <BadgeCheck className="h-5 w-5 text-[#0095F6] fill-[#0095F6]/15" />
            </div>
          </div>
        </div>

        {/* Right: Username, Actions, Stats & Bio */}
        <div className="flex-1 space-y-4">
          {/* Row 1: Username & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-[#171717] sm:text-2xl font-mono">
              @{handle}
            </h2>

            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#0095F6]">
              <BadgeCheck className="h-3.5 w-3.5" />
              <span>Verified Maker</span>
            </span>

            <div className="flex items-center gap-2 pt-1 sm:pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="h-8 rounded-lg border-[#E5E5E5] px-3 text-xs font-medium text-[#171717] hover:bg-[#F5F5F4]"
              >
                <Share2 className="mr-1.5 h-3.5 w-3.5 text-[#737373]" />
                <span>{copiedLink ? "Copied!" : "Share"}</span>
              </Button>

              {fullProfileHref && (
                <Link href={fullProfileHref}>
                  <Button
                    size="sm"
                    className="h-8 rounded-lg bg-[#171717] px-3 text-xs font-medium text-white hover:bg-[#262626]"
                  >
                    <span>Full Profile</span>
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Row 2: Stats Counter Strip */}
          <div className="flex items-center gap-6 sm:gap-8 border-y border-[#F0F0EE] py-3 text-xs sm:text-sm">
            <div>
              <span className="font-bold text-[#171717]">{products.length}</span>{" "}
              <span className="text-[#737373]">catalog listings</span>
            </div>
            <div>
              <span className="font-bold text-[#171717]">{yearsActive}+ yrs</span>{" "}
              <span className="text-[#737373]">heritage</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-bold text-[#171717]">100% Direct</span>{" "}
              <span className="text-[#737373]">workshop</span>
            </div>
          </div>

          {/* Row 3: Bio Block */}
          <div className="space-y-1.5 text-xs leading-relaxed text-[#262626]">
            <p className="font-bold text-sm text-[#171717]">
              {seller.business_name}
            </p>
            <p className="font-medium text-amber-800">
              {craftTitle}
            </p>
            {seller.maker_name && (
              <p className="text-[#525252]">
                Master Craftsman: <span className="font-semibold text-[#171717]">{seller.maker_name}</span>
              </p>
            )}
            {location && (
              <p className="flex items-center gap-1 text-[#737373]">
                <MapPin className="h-3 w-3 text-[#A3A3A3]" />
                <span>{location}, India</span>
              </p>
            )}
            {seller.description && (
              <p className="mt-2 text-[#525252] max-w-xl line-clamp-3">
                {seller.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. STORY HIGHLIGHTS */}
      <div className="mt-8 flex items-center gap-4 sm:gap-6 overflow-x-auto pb-3 scrollbar-none">
        {highlights.map((h) => (
          <div
            key={h.id}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
          >
            <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-full p-[2px] border-2 border-[#E5E5E5] transition-transform group-hover:scale-105 group-hover:border-black">
              <div
                className={`h-full w-full rounded-full flex items-center justify-center text-xl sm:text-2xl ${h.bg}`}
              >
                <span>{h.icon}</span>
              </div>
            </div>
            <span className="text-[11px] font-medium text-[#737373] group-hover:text-[#171717]">
              {h.label}
            </span>
          </div>
        ))}
      </div>

      {/* 3. TAB NAVIGATION */}
      <div className="mt-6 border-t border-[#E5E5E5]">
        <div className="flex items-center justify-center gap-12 sm:gap-16">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-t-2 -mt-[2px] ${
              activeTab === "posts"
                ? "border-[#171717] text-[#171717]"
                : "border-transparent text-[#737373] hover:text-[#171717]"
            }`}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            <span>Catalog Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reels")}
            className={`flex items-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-t-2 -mt-[2px] ${
              activeTab === "reels"
                ? "border-[#171717] text-[#171717]"
                : "border-transparent text-[#737373] hover:text-[#171717]"
            }`}
          >
            <Film className="h-3.5 w-3.5" />
            <span>Process Reels</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("story")}
            className={`flex items-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-t-2 -mt-[2px] ${
              activeTab === "story"
                ? "border-[#171717] text-[#171717]"
                : "border-transparent text-[#737373] hover:text-[#171717]"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Heritage Story</span>
          </button>
        </div>
      </div>

      {/* 4. CONTENT SECTIONS */}
      <div className="mt-4">
        {/* TAB 1: 3-COLUMN SQUARE GRID */}
        {activeTab === "posts" && (
          <div>
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-[#737373]">
                <ShoppingBag className="h-10 w-10 text-[#A3A3A3] mb-2" />
                <p className="text-sm font-semibold text-[#171717]">
                  No products catalogued yet
                </p>
                <p className="text-xs text-[#737373] mt-1">
                  This maker is currently preparing their handmade inventory.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 sm:gap-4 md:gap-6">
                {products.map((p) => {
                  const img = getProductImage(p);
                  return (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      className="group relative aspect-square w-full overflow-hidden bg-neutral-100 rounded-lg sm:rounded-xl cursor-pointer"
                    >
                      <Image
                        src={img}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />

                      {/* Translucent Hover Overlay with Price & Title */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex flex-col items-center justify-center p-3 text-center text-white">
                        <span className="font-mono text-sm sm:text-base font-bold">
                          ₹{p.price_inr ? p.price_inr.toLocaleString() : "—"}
                        </span>
                        <p className="mt-1 text-[11px] sm:text-xs font-semibold line-clamp-2 px-2">
                          {p.name}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] backdrop-blur-xs">
                          <ShoppingBag className="h-3 w-3" />
                          <span>View Item</span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROCESS REELS (Vertical 9:16 Cards) */}
        {activeTab === "reels" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
            {displayReels.map((reel) => (
              <div
                key={reel.id}
                className="group relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-neutral-900 shadow-xs cursor-pointer"
              >
                <Image
                  src={reel.thumbnail_path || "/etikoppaka_toys.png"}
                  alt={reel.caption || "Workshop Reel"}
                  fill
                  className="object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] text-white">
                  <Play className="h-2.5 w-2.5 fill-white" />
                  <span>{reel.duration || "0:30"}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-[11px] font-medium leading-tight line-clamp-2 drop-shadow-sm">
                    {reel.caption}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-neutral-300">
                    {reel.views_count ? `${(reel.views_count / 1000).toFixed(1)}k views` : "12.4k views"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: ARTISAN STORY & HERITAGE */}
        {activeTab === "story" && (
          <div className="space-y-6 rounded-2xl border border-[#E5E5E5] bg-[#FAFAF9] p-6 sm:p-8">
            <div>
              <h3 className="text-base font-bold text-[#171717] uppercase tracking-wider">
                Our Artisan Heritage & Workshop Journey
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#525252]">
                {seller.story?.how_it_started ||
                  seller.description ||
                  "Preserving ancient Indian hand-lathe woodworking with organic vegetable dyes. Every product is finished with non-toxic, lead-free natural lacquer safe for all ages."}
              </p>
            </div>

            {seller.story?.materials_and_technique && (
              <div className="border-t border-[#E5E5E5] pt-4">
                <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                  Materials & Sourcing Integrity
                </h4>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#525252]">
                  {seller.story.materials_and_technique}
                </p>
              </div>
            )}

            {seller.story?.milestones && seller.story.milestones.length > 0 && (
              <div className="border-t border-[#E5E5E5] pt-4">
                <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider mb-3">
                  Key Milestones
                </h4>
                <div className="space-y-3">
                  {seller.story.milestones.map((m, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        {m.year}
                      </span>
                      <div>
                        <p className="font-semibold text-[#171717]">{m.title}</p>
                        <p className="text-[#737373] mt-0.5">{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
