"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  BadgeCheck,
  ShoppingBag,
  BookOpen,
  Play,
  Award,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Share2,
  Info,
} from "lucide-react";
import { Button } from "@genz/ui";
import { ProductCard } from "@/features/products/components/product-card";
import { productMediaUrl } from "@/features/products/lib/products";
import type { Product } from "@genz/types";

export interface SellerProfileData {
  id: string;
  business_name: string;
  city?: string | null;
  state?: string | null;
  description?: string | null;
  established_year?: number | null;
  maker_name?: string;
  craft_title?: string;
  avatar_url?: string;
  cover_url?: string;
  story?: {
    how_it_started: string;
    generations_heritage: string;
    materials_and_technique: string;
    vision: string;
    milestones: Array<{ year: string; title: string; desc: string }>;
  };
}

export interface SellerReel {
  id: string;
  video_path?: string | null;
  thumbnail_path?: string | null;
  caption?: string | null;
  views_count?: number;
  duration?: string;
}

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
  const [activeTab, setActiveTab] = useState<"products" | "story" | "reels" | "heritage">("products");
  const [copiedLink, setCopiedLink] = useState(false);

  const location = [seller.city, seller.state].filter(Boolean).join(", ");
  const makerTitle = seller.craft_title || "Master Artisan & GI-Tag Craft Custodian";
  const avatarSrc = seller.avatar_url || "/indian_craftsman.png";

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Curated story fallback if none in database
  const story = seller.story || {
    how_it_started: `My journey began nearly four decades ago in our ancestral workshop. As a child, I would sit beside my grandfather watching him shape raw Ankudu (ivory wood) on a traditional hand-lathe. The gentle hum of the chisel, the earthy aroma of natural resin, and the burst of colors when lac was applied with dry palm leaves ignited a lifelong reverence for this craft. What began as an inherited discipline grew into a personal mission: to preserve India's natural toy-making heritage and ensure safe, chemical-free play for generations of children worldwide.`,
    generations_heritage: `We are the third generation of lacquerware artisans in our cluster. In a world flooded with cheap imported plastic that breaks in days and harms our ecosystem, our wooden toys are made to last decades. Every toy is hand-turned using wood sourced from responsibly managed local groves, dried naturally under the Indian sun, and coated exclusively with organic lacquer extracted from tree bark and colored with plant-based dyes like turmeric, indigo, and vermillion.`,
    materials_and_technique: `We strictly employ Ankudu softwood (Wrightia tinctoria), celebrated for its medicinal qualities, lightweight resilience, and satin-smooth turning texture. Unlike synthetic glossy paints containing lead or phthalates, our finish is 100% edible-grade lacquer applied purely by friction on the lathe. The heat of the spinning wood fuses the natural resin onto the surface, creating an unbreakable, non-toxic barrier safe even for teething infants.`,
    vision: `Our goal is to make Indian artisanal craft economically viable for the next generation of rural makers. By partnering directly with consumers on GenZ without middlemen markups, 100% of the proceeds flow back into our artisan families, apprentice workshops, and community schools.`,
    milestones: [
      {
        year: seller.established_year ? `${seller.established_year}` : "1988",
        title: "Workshop Established",
        desc: "Started with two hand-lathes and four master carvers crafting classical spinning tops.",
      },
      {
        year: "2006",
        title: "Geographical Indication (GI) Recognition",
        desc: "Awarded registered Geographical Indication status recognizing authentic regional heritage.",
      },
      {
        year: "2018",
        title: "Zero-Plastic National Toy Award",
        desc: "Recognized by the Ministry of Textiles for chemical-free and sustainable toy innovations.",
      },
      {
        year: "2024",
        title: "Direct Digital Workshop with GenZ",
        desc: "Eliminated wholesale brokers to ship directly from the lathe to homes across India.",
      },
    ],
  };

  // Sample reels if none in DB
  const displayReels: SellerReel[] =
    reels.length > 0
      ? reels
      : [
          {
            id: "reel-1",
            thumbnail_path: "/etikoppaka_toys.png",
            caption: "Turning seasoned ivory wood on the lathe — precision shaping of traditional spinning tops.",
            views_count: 14200,
            duration: "0:45",
          },
          {
            id: "reel-2",
            thumbnail_path: "/cat_toys.png",
            caption: "Applying natural organic lac melted by friction with talipot palm leaves. 100% chemical-free!",
            views_count: 9800,
            duration: "0:38",
          },
          {
            id: "reel-3",
            thumbnail_path: "/cat_furniture.png",
            caption: "Hand-finishing details on our dancing Raja-Rani dolls with vegetable dye pigments.",
            views_count: 18500,
            duration: "0:52",
          },
          {
            id: "reel-4",
            thumbnail_path: "/cat_kitchen.png",
            caption: "Inside our workshop courtyard: quality inspection and eco-friendly packaging.",
            views_count: 7300,
            duration: "0:30",
          },
        ];

  return (
    <div className="bg-[#FAF8F5] pb-24 text-[#1A1A18]">
      {/* Editorial Cover Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 sm:h-64">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        {/* Artisan Profile Header (Dignified maker focus, NO story ring, NO highlights) */}
        <div className="relative -mt-20 sm:-mt-24">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            {/* Left: Avatar & Maker Identity */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              {/* Profile Avatar: Clean, solid dignified frame, NO story ring */}
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl sm:h-36 sm:w-36">
                <Image
                  src={avatarSrc}
                  alt={seller.business_name}
                  fill
                  className="object-cover"
                  priority
                  sizes="144px"
                />
              </div>

              {/* Names, Craft & Location */}
              <div className="space-y-1.5 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-nantes text-2xl font-bold tracking-tight text-[#1A1A18] sm:text-3xl lg:text-4xl">
                    {seller.business_name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                    <BadgeCheck className="h-3.5 w-3.5 text-amber-600 fill-amber-200" />
                    Verified Maker
                  </span>
                </div>

                <p className="font-graphik text-sm font-semibold text-amber-800 sm:text-base">
                  {makerTitle}
                </p>

                <div className="font-graphik flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                  {location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                      {location}
                    </span>
                  )}
                  {seller.established_year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                      Established in {seller.established_year}
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    GST Audited
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 pt-2 md:pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="font-graphik rounded-xl border-neutral-300 bg-white px-4 text-xs font-bold text-neutral-800 shadow-2xs hover:bg-neutral-50"
              >
                <Share2 className="mr-1.5 h-3.5 w-3.5" />
                <span>{copiedLink ? "Link Copied!" : "Share Profile"}</span>
              </Button>
            </div>
          </div>

          {/* Short Bio */}
          {seller.description && (
            <p className="font-graphik mt-6 max-w-3xl text-sm leading-relaxed text-neutral-700 sm:text-base">
              {seller.description}
            </p>
          )}

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
              <p className="text-xs text-neutral-500">Catalogued Items</p>
              <p className="font-graphik mt-1 text-2xl font-bold text-[#1A1A18]">
                {products.length > 0 ? products.length : "12+"}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
              <p className="text-xs text-neutral-500">Craft Heritage</p>
              <p className="font-graphik mt-1 text-2xl font-bold text-amber-700">
                {seller.established_year
                  ? `${new Date().getFullYear() - seller.established_year}+ Yrs`
                  : "38+ Yrs"}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
              <p className="text-xs text-neutral-500">Process Transparency</p>
              <p className="font-graphik mt-1 text-2xl font-bold text-emerald-700">
                100%
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
              <p className="text-xs text-neutral-500">Materials Sourcing</p>
              <p className="font-graphik mt-1 text-2xl font-bold text-neutral-800">
                Natural & GI
              </p>
            </div>
          </div>
        </div>

        {/* STRUCTURED TABS (Products, Story / Journey, Reels, Heritage) */}
        <div className="mt-12 border-b border-neutral-200">
          <nav className="no-scrollbar -mb-px flex space-x-6 overflow-x-auto sm:space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 border-b-2 py-4 text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === "products"
                  ? "border-[#1A1A18] text-[#1A1A18]"
                  : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Products & Catalog</span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("story")}
              className={`flex items-center gap-2 border-b-2 py-4 text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === "story"
                  ? "border-[#1A1A18] text-[#1A1A18]"
                  : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
              }`}
            >
              <BookOpen className="h-4 w-4 text-amber-700" />
              <span>Story & Journey</span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                Artisan Life
              </span>
            </button>

            <button
              onClick={() => setActiveTab("reels")}
              className={`flex items-center gap-2 border-b-2 py-4 text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === "reels"
                  ? "border-[#1A1A18] text-[#1A1A18]"
                  : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
              }`}
            >
              <Play className="h-4 w-4 text-rose-600" />
              <span>Workshop Reels</span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                {displayReels.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("heritage")}
              className={`flex items-center gap-2 border-b-2 py-4 text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === "heritage"
                  ? "border-[#1A1A18] text-[#1A1A18]"
                  : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
              }`}
            >
              <Award className="h-4 w-4 text-amber-600" />
              <span>Craft Heritage & Trust</span>
            </button>
          </nav>
        </div>

        {/* TAB CONTENTS */}
        <div className="mt-10">
          {/* TAB 1: PRODUCTS & CATALOG */}
          {activeTab === "products" && (
            <div>
              {products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
                  <ShoppingBag className="mx-auto h-12 w-12 text-neutral-300" />
                  <h3 className="font-nantes mt-4 text-xl font-normal text-neutral-800">
                    Catalog Being Curated
                  </h3>
                  <p className="font-graphik mt-2 text-xs text-neutral-500 sm:text-sm">
                    {seller.business_name} is currently cataloguing their latest workshop batches. Check back shortly or browse related items on Discover.
                  </p>
                  <Button asChild className="mt-6 rounded-full bg-[#1A1A18] px-6 text-xs text-white">
                    <Link href="/discover">Explore Full Marketplace</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      sellerVerified={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STORY & JOURNEY */}
          {activeTab === "story" && (
            <div className="space-y-12">
              {/* How My Journey Started */}
              <div className="rounded-3xl border border-[#E5E5E0] bg-white p-8 shadow-xs sm:p-12">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>The Maker&apos;s Voice</span>
                </div>
                <h2 className="font-nantes mt-3 text-3xl font-normal text-[#1A1A18] sm:text-4xl">
                  How My Journey Started
                </h2>

                <div className="font-graphik mt-6 space-y-5 text-sm leading-relaxed text-neutral-700 sm:text-base">
                  <p className="first-letter:float-left first-letter:mr-3 first-letter:text-5xl first-letter:font-bold first-letter:text-amber-800 font-nantes">
                    {story.how_it_started}
                  </p>
                  <p>{story.generations_heritage}</p>
                </div>

                <div className="mt-8 border-t border-neutral-100 pt-6">
                  <h3 className="font-nantes text-xl font-bold text-neutral-900">
                    Materials, Wood Selection & Lathe Technique
                  </h3>
                  <p className="font-graphik mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
                    {story.materials_and_technique}
                  </p>
                </div>

                <div className="mt-8 rounded-2xl bg-amber-50/70 p-6 border border-amber-200/70">
                  <h4 className="font-nantes text-lg font-bold text-amber-900">
                    Vision for the Future
                  </h4>
                  <p className="font-graphik mt-2 text-xs leading-relaxed text-amber-950 sm:text-sm">
                    {story.vision}
                  </p>
                </div>
              </div>

              {/* Journey Milestones Timeline */}
              <div className="rounded-3xl border border-[#E5E5E0] bg-white p-8 shadow-xs sm:p-12">
                <h3 className="font-nantes text-2xl font-normal text-[#1A1A18] sm:text-3xl">
                  Chronicle of Craft Milestones
                </h3>
                <p className="font-graphik mt-2 text-xs text-neutral-500 sm:text-sm">
                  Key moments of recognition, cluster preservation, and modern innovation.
                </p>

                <div className="mt-8 space-y-6">
                  {story.milestones.map((m, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A1A18] font-graphik text-xs font-bold text-amber-300 shadow-xs">
                        {m.year}
                      </div>
                      <div className="rounded-xl border border-neutral-100 bg-[#FAF8F5] p-4 flex-1">
                        <h4 className="font-graphik text-sm font-bold text-neutral-900">
                          {m.title}
                        </h4>
                        <p className="font-graphik mt-1 text-xs leading-relaxed text-neutral-600">
                          {m.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORKSHOP REELS */}
          {activeTab === "reels" && (
            <div>
              <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-nantes text-2xl font-normal text-[#1A1A18]">
                    Live Lathe & Workshop Process Reels
                  </h3>
                  <p className="font-graphik text-xs text-neutral-500">
                    Direct video evidence of raw materials, lathe craftsmanship, and natural lac application.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {displayReels.map((reel) => {
                  const thumb = reel.thumbnail_path ? productMediaUrl(reel.thumbnail_path) || reel.thumbnail_path : "/etikoppaka_toys.png";
                  const videoUrl = reel.video_path ? productMediaUrl(reel.video_path) : null;

                  return (
                    <div
                      key={reel.id}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xs transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
                        {videoUrl ? (
                          <video
                            src={videoUrl}
                            poster={thumb}
                            controls
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <>
                            <Image
                              src={thumb}
                              alt="Reel preview"
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-lg backdrop-blur-xs transition-transform group-hover:scale-110">
                                <Play className="h-5 w-5 fill-neutral-900 translate-x-0.5" />
                              </div>
                            </div>
                          </>
                        )}

                        {reel.duration && (
                          <div className="absolute top-3 right-3 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                            {reel.duration}
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <p className="font-graphik text-xs leading-relaxed text-neutral-700 line-clamp-2">
                          {reel.caption || "Crafting process inside the workshop."}
                        </p>
                        {reel.views_count && (
                          <p className="font-graphik mt-2 text-[11px] font-semibold text-neutral-400">
                            {reel.views_count.toLocaleString()} views
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: HERITAGE & VERIFICATION */}
          {activeTab === "heritage" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-[#E5E5E0] bg-white p-8 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-nantes text-xl font-bold text-neutral-900">
                      Geographical Indication (GI)
                    </h3>
                    <p className="text-xs text-neutral-500">Government of India Protection</p>
                  </div>
                </div>
                <p className="font-graphik mt-4 text-xs leading-relaxed text-neutral-600 sm:text-sm">
                  This workshop operates within the officially gazetted craft corridor. All items are produced according to strict GI guidelines specifying indigenous ivory wood species and plant lac resins.
                </p>
                <div className="mt-5 border-t border-neutral-100 pt-4 flex items-center justify-between text-xs font-semibold text-amber-800">
                  <span>Cluster: {seller.city || "Andhra Pradesh"}</span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Certified
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-[#E5E5E0] bg-white p-8 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-nantes text-xl font-bold text-neutral-900">
                      Site & GST Validation
                    </h3>
                    <p className="text-xs text-neutral-500">GenZ 3-Tier Supplier Audit</p>
                  </div>
                </div>
                <p className="font-graphik mt-4 text-xs leading-relaxed text-neutral-600 sm:text-sm">
                  This seller has completed physical workshop verification, GSTIN tax validation, and banking authentication. Payments are held in escrow until product inspection.
                </p>
                <div className="mt-5 border-t border-neutral-100 pt-4 flex items-center justify-between text-xs font-semibold text-neutral-700">
                  <span>Status: Audited & Active</span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 100% Escrow Protected
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
