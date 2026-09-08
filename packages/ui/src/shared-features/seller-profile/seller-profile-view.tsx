"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Grid3X3,
  Film,
  BookOpen,
  Share2,
  ExternalLink,
  ShoppingBag,
  Play,
  Volume2,
  VolumeX,
  CheckCircle2,
  Award,
  Sparkles,
  Calendar,
  X,
  ArrowRight,
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
  original_mrp?: number | null;
}

export interface SellerReelItem {
  id: string;
  video_path?: string | null;
  video_url?: string | null;
  thumbnail_path?: string | null;
  thumbnail_url?: string | null;
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
  const [activeTab, setActiveTab] = useState<"story" | "posts" | "reels">("story");
  const [copiedLink, setCopiedLink] = useState(false);

  // Interactive Reel Video Player state
  const [activeReel, setActiveReel] = useState<SellerReelItem | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  const location = [seller.city, seller.state].filter(Boolean).join(", ");
  const avatarSrc = seller.avatar_url || "/indian_craftsman.png";
  const coverSrc = seller.cover_url || "/machine_work.png";
  const craftTitle =
    seller.craft_title || "Second-Generation Master Artisan & GI Craft Custodian";
  const established = seller.established_year || 1984;
  const yearsActive = established ? new Date().getFullYear() - established : null;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin + `/sellers/${seller.id}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

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
    return "/cat_toys.png";
  };

  const getReelVideoUrl = (r: SellerReelItem): string | null => {
    if (r.video_url) return r.video_url;
    if (r.video_path) {
      if (r.video_path.startsWith("http")) return r.video_path;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        return `${supabaseUrl}/storage/v1/object/public/product-media/${r.video_path}`;
      }
      return r.video_path;
    }
    return null;
  };

  const getReelThumbUrl = (r: SellerReelItem): string => {
    if (r.thumbnail_url) return r.thumbnail_url;
    if (r.thumbnail_path) {
      if (r.thumbnail_path.startsWith("http")) return r.thumbnail_path;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        return `${supabaseUrl}/storage/v1/object/public/product-media/${r.thumbnail_path}`;
      }
      return r.thumbnail_path;
    }
    return "/etikoppaka_toys.png";
  };

  const togglePlayPause = () => {
    if (!modalVideoRef.current) return;
    if (modalVideoRef.current.paused) {
      modalVideoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      modalVideoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!modalVideoRef.current) return;
    modalVideoRef.current.muted = !modalVideoRef.current.muted;
    setIsMuted(modalVideoRef.current.muted);
  };

  return (
    <div className="w-full bg-white font-sans text-[#1A1A18]">
      {/* 1. MAJESTIC HERITAGE COVER BANNER */}
      <div className="relative h-48 w-full overflow-hidden bg-neutral-900 sm:h-64 md:h-72">
        <Image
          src={coverSrc}
          alt={seller.business_name}
          fill
          className="object-cover object-center opacity-65 brightness-90 transition-transform duration-700 hover:scale-105"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

        {/* Top Badges & Actions */}
        <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between sm:inset-x-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-black/60 px-3 py-1 text-[11px] font-semibold text-amber-200 backdrop-blur-md">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span>GI Craft Custodian • Govt of India Reg.</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="h-8 rounded-full border-white/20 bg-black/40 px-3.5 text-xs font-medium text-white backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
            >
              <Share2 className="mr-1.5 h-3.5 w-3.5" />
              <span>{copiedLink ? "Copied!" : "Share Atelier"}</span>
            </Button>

            {fullProfileHref && (
              <Link href={fullProfileHref}>
                <Button
                  size="sm"
                  className="h-8 rounded-full bg-amber-600 px-3.5 text-xs font-semibold text-white shadow-md hover:bg-amber-700"
                >
                  <span>Full Atelier</span>
                  <ExternalLink className="ml-1.5 h-3 w-3" />
                </Button>
              </Link>
            )}

            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-black/50 p-2 text-white/80 backdrop-blur-md hover:bg-black/80 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Master Artisan Avatar Floating Over Bottom Edge */}
        <div className="absolute -bottom-14 left-6 z-20 sm:-bottom-16 sm:left-10">
          <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl ring-2 ring-amber-900/20 sm:h-36 sm:w-36 sm:rounded-3xl">
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
      </div>

      {/* 2. ARTISAN ATELIER IDENTITY HEADER */}
      <div className="border-b border-[#F0EFEA] px-6 pt-18 pb-6 sm:px-10 sm:pt-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-md bg-amber-100/80 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider text-amber-900 uppercase">
                Direct Master Workshop
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/80 px-2 py-0.5 text-[11px] font-bold text-emerald-900">
                <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                <span>GI-Certified Provenance</span>
              </span>
            </div>

            <h1 className="font-serif text-2xl font-normal tracking-tight text-[#1A1A18] sm:text-3xl lg:text-4xl">
              {seller.business_name}
            </h1>

            <p className="font-serif text-sm font-medium text-amber-900 italic sm:text-base">
              {craftTitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#52524E]">
              {seller.maker_name && (
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-[#8C8C85]">Master Craftsman:</span>
                  <span className="font-semibold text-[#1A1A18]">
                    {seller.maker_name}
                  </span>
                </div>
              )}

              {location && (
                <div className="flex items-center gap-1 text-[#52524E]">
                  <MapPin className="h-3.5 w-3.5 text-amber-700" />
                  <span>{location}, India • Along the Varaha River</span>
                </div>
              )}

              {yearsActive != null && (
                <div className="flex items-center gap-1 text-[#52524E]">
                  <Calendar className="h-3.5 w-3.5 text-amber-700" />
                  <span>
                    Est. {established} ({yearsActive}+ Years Heritage)
                  </span>
                </div>
              )}
            </div>

            {seller.description && (
              <p className="max-w-2xl pt-2 text-xs leading-relaxed text-[#52524E] sm:text-sm">
                {seller.description}
              </p>
            )}
          </div>
        </div>

        {/* Prestige Heritage Credentials Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#F0EFEA] pt-5 sm:grid-cols-4">
          <div className="rounded-xl border border-[#EBEAE5] bg-[#FAF9F5] p-3.5">
            <span className="block font-mono text-[10px] font-bold tracking-wider text-[#8C8C85] uppercase">
              Atelier Provenance
            </span>
            <span className="mt-0.5 block font-serif text-base font-bold text-[#1A1A18] sm:text-lg">
              100% Direct
            </span>
            <span className="mt-0.5 block text-[11px] text-[#73736E]">
              Zero middleman markups
            </span>
          </div>

          <div className="rounded-xl border border-[#EBEAE5] bg-[#FAF9F5] p-3.5">
            <span className="block font-mono text-[10px] font-bold tracking-wider text-[#8C8C85] uppercase">
              Craft Heritage
            </span>
            <span className="mt-0.5 block font-serif text-base font-bold text-amber-900 sm:text-lg">
              {yearsActive ? `${yearsActive}+ Yrs` : "Ancestral"}
            </span>
            <span className="mt-0.5 block text-[11px] text-[#73736E]">
              2nd-Gen Living Tradition
            </span>
          </div>

          <div className="rounded-xl border border-[#EBEAE5] bg-[#FAF9F5] p-3.5">
            <span className="block font-mono text-[10px] font-bold tracking-wider text-[#8C8C85] uppercase">
              Sourcing Integrity
            </span>
            <span className="mt-0.5 block font-serif text-base font-bold text-emerald-800 sm:text-lg">
              Organic Lac
            </span>
            <span className="mt-0.5 block text-[11px] text-[#73736E]">
              Natural vegetable dyes
            </span>
          </div>

          <div className="rounded-xl border border-[#EBEAE5] bg-[#FAF9F5] p-3.5">
            <span className="block font-mono text-[10px] font-bold tracking-wider text-[#8C8C85] uppercase">
              Verified Catalog
            </span>
            <span className="mt-0.5 block font-serif text-base font-bold text-[#1A1A18] sm:text-lg">
              {products.length} Products
            </span>
            <span className="mt-0.5 block text-[11px] text-[#73736E]">
              Hand-turned on lathe
            </span>
          </div>
        </div>
      </div>

      {/* 3. LUXURY EDITORIAL TAB NAVIGATION */}
      <div className="sticky top-0 z-10 border-b border-[#E5E5E0] bg-[#FAF9F5]/60 px-6 backdrop-blur-md sm:px-10">
        <div className="flex items-center justify-start gap-4 sm:gap-8">
          <button
            type="button"
            onClick={() => setActiveTab("story")}
            className={`-mb-[1px] flex items-center gap-2 border-b-2 py-4 text-xs font-semibold tracking-wider transition-all sm:text-sm ${
              activeTab === "story"
                ? "border-[#D97706] text-[#B45309]"
                : "border-transparent text-[#73736E] hover:text-[#1A1A18]"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Story & Lineage</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`-mb-[1px] flex items-center gap-2 border-b-2 py-4 text-xs font-semibold tracking-wider transition-all sm:text-sm ${
              activeTab === "posts"
                ? "border-[#D97706] text-[#B45309]"
                : "border-transparent text-[#73736E] hover:text-[#1A1A18]"
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
            <span>Catalog</span>
            <span className="rounded-full bg-[#EAE8E3] px-2 py-0.5 text-[10px] font-bold text-[#52524E]">
              {products.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reels")}
            className={`-mb-[1px] flex items-center gap-2 border-b-2 py-4 text-xs font-semibold tracking-wider transition-all sm:text-sm ${
              activeTab === "reels"
                ? "border-[#D97706] text-[#B45309]"
                : "border-transparent text-[#73736E] hover:text-[#1A1A18]"
            }`}
          >
            <Film className="h-4 w-4" />
            <span>Workshop Reels</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
              {reels.length > 0 ? reels.length : "Videos"}
            </span>
          </button>
        </div>
      </div>

      {/* 4. CONTENT SECTIONS */}
      <div className="p-6 sm:p-10">
        {/* TAB 1: EDITORIAL STORY & HERITAGE */}
        {activeTab === "story" && (
          <div className="space-y-8">
            {/* Master's Voice Quote Callout */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-[#FFFDF9] via-[#FAF7F0] to-[#F5EFE1] p-6 shadow-xs sm:p-8">
              <div className="pointer-events-none absolute top-2 right-4 font-serif text-7xl font-bold text-amber-200/50 select-none">
                “
              </div>
              <div className="relative z-10 max-w-3xl space-y-3">
                <span className="font-mono text-[10px] font-bold tracking-widest text-amber-800 uppercase">
                  MASTER CRAFTSMAN&apos;S VOICE
                </span>
                <blockquote className="font-serif text-lg leading-relaxed text-[#1A1A18] italic sm:text-xl">
                  &ldquo;Along the Varaha River, turning wood is not merely an
                  occupation—it is a four-century cultural inheritance. Each lacquer
                  layer applied by hand on the turning lathe seals living organic
                  history safe for children across generations.&rdquo;
                </blockquote>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-[#1A1A18]">
                    {seller.maker_name || seller.business_name}
                  </span>
                  <span className="text-xs text-[#8C8C85]">• Master GI Artisan</span>
                </div>
              </div>
            </div>

            {/* Narrative Sections Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2 text-amber-900">
                  <BookOpen className="h-4 w-4" />
                  <h3 className="font-serif text-base font-bold text-[#1A1A18]">
                    Ancestral Roots & Varaha River Origins
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-[#52524E] sm:text-sm">
                  {seller.story?.how_it_started ||
                    seller.description ||
                    "Along the banks of the Varaha River in Andhra Pradesh lies the village of Etikoppaka, where turned-wood lacquer craft has flourished across families for more than 400 years. Born into a household of generational carvers, our workshop upholds traditional woodturning methods, ensuring every artifact carries authentic cultural roots."}
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2 text-amber-900">
                  <Sparkles className="h-4 w-4" />
                  <h3 className="font-serif text-base font-bold text-[#1A1A18]">
                    Materials & Natural Lathe Technique
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-[#52524E] sm:text-sm">
                  {seller.story?.materials_and_technique ||
                    "Turned exclusively from indigenous Ankudi Karra wood on traditional woodturning lathes. Pure botanical lac is applied while the wood spins, using natural friction heat to fuse non-toxic, lead-free colors extracted from seeds, bark, roots, and leaves—making every toy safe for infants and collectors alike."}
                </p>
              </div>
            </div>

            {/* Living Milestones Timeline */}
            {seller.story?.milestones && seller.story.milestones.length > 0 && (
              <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-xs sm:p-8">
                <div className="mb-6">
                  <span className="block font-mono text-[10px] font-bold tracking-widest text-amber-800 uppercase">
                    CHRONOLOGY OF EXCELLENCE
                  </span>
                  <h3 className="mt-1 font-serif text-lg font-bold text-[#1A1A18]">
                    Atelier Heritage & National Recognition
                  </h3>
                </div>

                <div className="relative space-y-6 border-l-2 border-amber-200 pl-6 sm:pl-8">
                  {seller.story.milestones.map((m, idx) => (
                    <div key={idx} className="relative">
                      {/* Node circle */}
                      <div className="absolute top-0.5 -left-[31px] h-4 w-4 rounded-full border-2 border-amber-600 bg-white sm:-left-[39px]" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-xs font-bold text-amber-900">
                            {m.year}
                          </span>
                          <h4 className="text-xs font-semibold text-[#1A1A18] sm:text-sm">
                            {m.title}
                          </h4>
                        </div>
                        <p className="text-xs leading-relaxed text-[#52524E]">
                          {m.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STRUCTURED PRODUCT CATALOG GRID */}
        {activeTab === "posts" && (
          <div>
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E5E0] bg-[#FAF9F5] p-10 py-16 text-center text-[#73736E]">
                <ShoppingBag className="mb-3 h-10 w-10 text-[#A3A3A3]" />
                <h4 className="font-serif text-base font-semibold text-[#1A1A18]">
                  Handmade Inventory in Preparation
                </h4>
                <p className="mt-1 max-w-sm text-xs text-[#73736E]">
                  This artisan workshop is currently finishing their hand-lathe batch.
                  Check back shortly for new catalog releases.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => {
                  const img = getProductImage(p);
                  const isGI =
                    p.category?.toLowerCase().includes("etikoppaka") ||
                    p.name?.toLowerCase().includes("etikoppaka") ||
                    p.category?.toLowerCase().includes("gi");

                  return (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      className="group flex w-full flex-col text-left transition-all duration-300"
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[#E5E5E0] bg-[#F6F5F2]">
                        <Image
                          src={img}
                          alt={p.name}
                          fill
                          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                          unoptimized
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />

                        {isGI && (
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <span className="rounded-md bg-black/85 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-amber-300 uppercase shadow-xs backdrop-blur-xs">
                              GI Certified
                            </span>
                          </div>
                        )}

                        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center opacity-0 transition-all duration-300 ease-out group-hover:bottom-4 group-hover:opacity-100">
                          <span className="rounded-full bg-[#1A1A18] px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-md">
                            View Craft Details
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1">
                        {p.category && (
                          <p className="truncate text-[10px] font-semibold tracking-wider text-amber-800 uppercase">
                            {p.category}
                          </p>
                        )}

                        <h4 className="line-clamp-2 font-serif text-xs leading-snug font-semibold tracking-tight text-[#1A1A18] transition-colors group-hover:text-amber-800 sm:text-sm">
                          {p.name}
                        </h4>

                        <div className="flex items-baseline gap-1.5 pt-0.5">
                          <span className="font-mono text-xs font-bold tracking-tight text-[#1A1A18] sm:text-sm">
                            ₹
                            {p.price_inr != null
                              ? p.price_inr.toLocaleString("en-IN")
                              : "—"}
                          </span>
                          {p.original_mrp && (
                            <span className="font-mono text-[10px] text-[#A3A3A3] line-through sm:text-xs">
                              ₹{p.original_mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INTERACTIVE WORKSHOP REELS (Video & Audio Player) */}
        {activeTab === "reels" && (
          <div>
            {reels.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E5E0] bg-[#FAF9F5] p-10 py-16 text-center text-[#73736E]">
                <Film className="mb-3 h-10 w-10 text-[#A3A3A3]" />
                <h4 className="font-serif text-base font-semibold text-[#1A1A18]">
                  Workshop Videos in Production
                </h4>
                <p className="mt-1 max-w-sm text-xs text-[#73736E]">
                  Raw hand-lathe footage and organic lacquer demonstrations will be
                  available here soon.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4">
                {reels.map((reel) => {
                  const videoUrl = getReelVideoUrl(reel);
                  const thumbUrl = getReelThumbUrl(reel);

                  return (
                    <div
                      key={reel.id}
                      onClick={() => {
                        setActiveReel(reel);
                        setIsVideoPlaying(true);
                      }}
                      className="group relative aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-2xl bg-neutral-900 shadow-md ring-1 ring-black/10 transition-transform duration-300 hover:scale-[1.02]"
                    >
                      {/* Video or Thumbnail preview */}
                      {videoUrl ? (
                        <video
                          src={videoUrl}
                          poster={thumbUrl}
                          muted
                          playsInline
                          loop
                          className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                          onMouseEnter={(e) => {
                            e.currentTarget.play().catch(() => {});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                        />
                      ) : (
                        <Image
                          src={thumbUrl}
                          alt={reel.caption || "Workshop Reel"}
                          fill
                          className="object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                          unoptimized
                        />
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

                      {/* Video Indicator / Duration badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] text-white backdrop-blur-md">
                        <Play className="h-2.5 w-2.5 fill-white text-white" />
                        <span>{reel.duration || "Reel"}</span>
                      </div>

                      {/* Play Button Overlay on Hover */}
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/90 text-white shadow-lg backdrop-blur-xs">
                          <Play className="ml-0.5 h-5 w-5 fill-white" />
                        </div>
                      </div>

                      {/* Caption & Views Count */}
                      <div className="pointer-events-none absolute right-3.5 bottom-3.5 left-3.5 text-white">
                        <p className="line-clamp-2 text-xs leading-snug font-semibold drop-shadow-md">
                          {reel.caption ||
                            "Traditional Turned-Wood Craft Lathe Demonstration"}
                        </p>
                        <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-white/80">
                          <span>
                            {reel.views_count
                              ? `${(reel.views_count / 1000).toFixed(1)}k views`
                              : "Verified Craft"}
                          </span>
                          <span className="font-semibold text-amber-300">
                            Tap to play
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. INTERACTIVE FULLSCREEN REEL VIDEO PLAYER MODAL */}
      {activeReel && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md duration-200 sm:p-6">
          <div className="relative flex aspect-[9/16] max-h-[90vh] w-full max-w-sm flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl sm:max-w-md">
            {/* Video Stream */}
            {getReelVideoUrl(activeReel) ? (
              <video
                ref={modalVideoRef}
                src={getReelVideoUrl(activeReel)!}
                poster={getReelThumbUrl(activeReel)}
                autoPlay
                playsInline
                loop
                muted={isMuted}
                onClick={togglePlayPause}
                className="absolute inset-0 h-full w-full cursor-pointer object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                <Image
                  src={getReelThumbUrl(activeReel)}
                  alt="Reel preview"
                  fill
                  className="object-cover opacity-60"
                  unoptimized
                />
                <div className="relative z-10 rounded-2xl bg-black/70 p-4 backdrop-blur-md">
                  <Film className="mx-auto mb-2 h-8 w-8 text-amber-400" />
                  <p className="text-xs text-white/90">
                    Workshop demonstration footage is being synced with high-definition
                    storage.
                  </p>
                </div>
              </div>
            )}

            {/* Gradient Overlays */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60" />

            {/* Top Controls Bar */}
            <div className="relative z-20 flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/40">
                  <Image
                    src={avatarSrc}
                    alt={seller.business_name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h4 className="text-xs leading-tight font-bold text-white">
                    {seller.business_name}
                  </h4>
                  <span className="font-mono text-[10px] text-amber-300">
                    Verified Reel
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/80"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveReel(null)}
                  className="rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Center Play/Pause Overlay indicator on click */}
            <div
              onClick={togglePlayPause}
              className="relative z-10 flex flex-1 cursor-pointer items-center justify-center"
            >
              {!isVideoPlaying && (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md">
                  <Play className="ml-1 h-8 w-8 fill-white" />
                </div>
              )}
            </div>

            {/* Bottom Caption & Product Interaction Bar */}
            <div className="relative z-20 space-y-3 p-5">
              <p className="text-xs leading-relaxed text-white/95 drop-shadow-md">
                {activeReel.caption ||
                  "Master artisan turning Ankudi Karra wood on the lathe and applying non-toxic natural lacquer."}
              </p>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 font-mono text-xs text-white/80">
                  <span>{activeReel.duration || "0:30"}</span>
                  <span>•</span>
                  <span>
                    {activeReel.views_count
                      ? `${(activeReel.views_count / 1000).toFixed(1)}k views`
                      : "GI Certified Showcase"}
                  </span>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    setActiveReel(null);
                    setActiveTab("posts");
                  }}
                  className="h-8 rounded-full bg-amber-500 px-3.5 text-xs font-semibold text-white shadow-lg hover:bg-amber-600"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
