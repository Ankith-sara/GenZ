"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  MapPin, Calendar, BadgeCheck, Globe, ExternalLink, 
  Save, CheckCircle2, AlertCircle, BookOpen,
} from "lucide-react";
import { Button, Input, Label, Textarea } from "@genz/ui";
import { AvatarUploader } from "@/features/user/components/avatar-uploader";
import { updateSellerInstagramProfile, type ProfileUpdateState } from "./actions";
import { SITE_URL } from "@genz/utils";

interface SellerMetadata {
  short_bio?: string;
  maker_name?: string;
  handle?: string;
  craft_category?: string;
  craft_title?: string;
  how_it_started?: string;
  materials_and_technique?: string;
  vision?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
}

interface ProfileStudioProps {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  sellerProfile: {
    id: string;
    business_name: string;
    gst_number?: string | null;
    factory_address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    description?: string | null;
    established_year?: number | null;
    status: string;
  } | null;
  productCount: number;
  reelCount: number;
}

const CRAFT_CATEGORIES = [
  "Etikoppaka Wooden Toys",
  "Kondapalli Toys",
  "Wooden Toys & Crafts",
  "Home & Furniture",
  "Handicrafts",
];

export function SellerInstagramProfileStudio({
  userId,
  fullName,
  avatarUrl,
  sellerProfile,
  productCount,
  reelCount,
}: ProfileStudioProps) {
  // Parse existing JSON metadata if present
  let parsedMeta: SellerMetadata = {};
  if (sellerProfile?.description) {
    try {
      if (sellerProfile.description.startsWith("{")) {
        parsedMeta = JSON.parse(sellerProfile.description);
      } else {
        parsedMeta = { short_bio: sellerProfile.description };
      }
    } catch {
      parsedMeta = { short_bio: sellerProfile.description };
    }
  }

  // Interactive local state for live Instagram-style preview
  const [businessName, setBusinessName] = useState(
    sellerProfile?.business_name || fullName || "My Artisan Studio"
  );
  const [makerName, setMakerName] = useState(
    parsedMeta.maker_name || fullName || "Master Maker"
  );
  const [handle, setHandle] = useState(
    parsedMeta.handle || (businessName ? businessName.toLowerCase().replace(/[^a-z0-9]/g, "_") : "artisan_crafts")
  );
  const [craftCategory, setCraftCategory] = useState(
    parsedMeta.craft_category || "Etikoppaka Wooden Toys"
  );
  const [craftTitle, setCraftTitle] = useState(
    parsedMeta.craft_title || "Master Artisan & GI Craft Custodian"
  );
  const [city, setCity] = useState(sellerProfile?.city || "Etikoppaka");
  const [state, setState] = useState(sellerProfile?.state || "Andhra Pradesh");
  const [shortBio, setShortBio] = useState(
    parsedMeta.short_bio ||
      "Preserving generations of authentic Indian hand-turned wooden toys and natural vegetable lacquer crafts. 100% non-toxic & direct from the workshop."
  );
  const [establishedYear, setEstablishedYear] = useState<string>(
    sellerProfile?.established_year ? String(sellerProfile.established_year) : "1992"
  );

  const [formState, formAction, isPending] = useActionState<ProfileUpdateState, FormData>(
    updateSellerInstagramProfile,
    {}
  );

  const liveStorefrontUrl = `${SITE_URL}/sellers/${userId}`;
  const isVerified = sellerProfile?.status === "verified";

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#E5E5E0] pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold tracking-widest text-amber-700 uppercase">
              STOREFRONT CREATOR STUDIO
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
              Instagram-Style Profile
            </span>
          </div>
          <h1 className="font-nantes text-2xl font-bold text-[#1A1A18] sm:text-3xl">
            Maker Profile & Public Storefront
          </h1>
          <p className="font-graphik mt-1 text-xs text-neutral-600 sm:text-sm">
            Customize how national buyers discover your workshop, read your journey, and view your catalog.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="font-graphik rounded-xl border-black bg-white px-4 text-xs font-bold text-black transition-all hover:bg-black hover:text-white"
          >
            <a href={liveStorefrontUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
              <span>View Public Profile</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Success / Error notification */}
      {formState?.success && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <p>{formState.message || "Profile successfully updated!"}</p>
        </div>
      )}
      {formState?.error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <p>{formState.error}</p>
        </div>
      )}

      {/* Main Studio 2-Column Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN: Profile Customization Form (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          <form action={formAction} className="space-y-6">
            {/* 1. Profile Picture & Avatar */}
            <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
              <h2 className="font-graphik text-sm font-bold text-neutral-900">
                1. Artisan Profile Picture
              </h2>
              <p className="font-graphik mt-1 text-xs text-neutral-500">
                Upload a genuine photo of you or your master craftsperson at work in the workshop.
              </p>

              <div className="mt-4">
                <AvatarUploader
                  userId={userId}
                  fullName={makerName || businessName}
                  currentUrl={avatarUrl}
                />
              </div>
            </div>

            {/* 2. Identity, Handle & Category */}
            <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs space-y-4">
              <h2 className="font-graphik text-sm font-bold text-neutral-900">
                2. Maker Identity & Handle
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="business_name" className="text-xs font-semibold text-neutral-700">
                    Workshop / Business Name *
                  </Label>
                  <Input
                    id="business_name"
                    name="business_name"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Etikoppaka Heritage Lacquer Toys"
                    className="h-10 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maker_name" className="text-xs font-semibold text-neutral-700">
                    Master Artisan / Founder Name *
                  </Label>
                  <Input
                    id="maker_name"
                    name="maker_name"
                    value={makerName}
                    onChange={(e) => setMakerName(e.target.value)}
                    placeholder="e.g. Rameshwar Rao"
                    className="h-10 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="handle" className="text-xs font-semibold text-neutral-700">
                    Storefront Handle (@username) *
                  </Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-mono text-xs text-neutral-400">@</span>
                    <Input
                      id="handle"
                      name="handle"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      placeholder="etikoppaka_crafts"
                      className="h-10 pl-7 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="craft_category" className="text-xs font-semibold text-neutral-700">
                    Craft Category *
                  </Label>
                  <select
                    id="craft_category"
                    name="craft_category"
                    value={craftCategory}
                    onChange={(e) => setCraftCategory(e.target.value)}
                    className="h-10 w-full rounded-lg border border-[#E5E5E0] bg-white px-3 text-xs font-medium text-neutral-800"
                  >
                    {CRAFT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="craft_title" className="text-xs font-semibold text-neutral-700">
                    Artisan Craft Title
                  </Label>
                  <Input
                    id="craft_title"
                    name="craft_title"
                    value={craftTitle}
                    onChange={(e) => setCraftTitle(e.target.value)}
                    placeholder="e.g. Master Woodcarver & National Awardee"
                    className="h-10 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="established_year" className="text-xs font-semibold text-neutral-700">
                    Year Established
                  </Label>
                  <Input
                    id="established_year"
                    name="established_year"
                    type="number"
                    value={establishedYear}
                    onChange={(e) => setEstablishedYear(e.target.value)}
                    placeholder="e.g. 1988"
                    className="h-10 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. Short Bio & Story Narrative */}
            <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-700" />
                <h2 className="font-graphik text-sm font-bold text-neutral-900">
                  3. Story & Journey Narrative
                </h2>
              </div>
              <p className="font-graphik text-xs text-neutral-500">
                This personal story will be showcased under the &quot;Story &amp; Journey&quot; tab on your public profile.
              </p>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="short_bio" className="text-xs font-semibold text-neutral-700">
                    Headline Bio (Instagram-Style)
                  </Label>
                  <span className="text-[10px] text-neutral-400">{shortBio.length}/200 chars</span>
                </div>
                <Textarea
                  id="short_bio"
                  name="short_bio"
                  rows={2}
                  maxLength={200}
                  value={shortBio}
                  onChange={(e) => setShortBio(e.target.value)}
                  placeholder="A concise, punchy bio summarizing your craft and heritage."
                  className="rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="how_it_started" className="text-xs font-semibold text-neutral-700">
                  How My Journey Started (In Depth Narrative)
                </Label>
                <Textarea
                  id="how_it_started"
                  name="how_it_started"
                  rows={4}
                  defaultValue={
                    parsedMeta.how_it_started ||
                    `My journey began nearly four decades ago in our ancestral workshop. As a child, I learned by watching master lathe turners carve raw seasoned wood and finish with friction lacquer.`
                  }
                  placeholder="Share your personal story of learning the craft, ancestral roots, and workshop dedication..."
                  className="rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="materials_and_technique" className="text-xs font-semibold text-neutral-700">
                  Materials, Wood Species & Lathe Technique
                </Label>
                <Textarea
                  id="materials_and_technique"
                  name="materials_and_technique"
                  rows={3}
                  defaultValue={
                    parsedMeta.materials_and_technique ||
                    `We use indigenous seasoned softwood and 100% natural, chemical-free lacquer dyed with edible vegetable and mineral pigments.`
                  }
                  placeholder="Describe your raw materials, sustainability standards, and artisan techniques..."
                  className="rounded-lg text-xs"
                />
              </div>
            </div>

            {/* 4. Location & Workshop Details */}
            <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-neutral-700" />
                <h2 className="font-graphik text-sm font-bold text-neutral-900">
                  4. Workshop Location & Verification
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-semibold text-neutral-700">
                    City / Craft Cluster *
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Etikoppaka"
                    className="h-10 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-semibold text-neutral-700">
                    State *
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Andhra Pradesh"
                    className="h-10 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="gst_number" className="text-xs font-semibold text-neutral-700">
                    GSTIN / Tax ID
                  </Label>
                  <Input
                    id="gst_number"
                    name="gst_number"
                    defaultValue={sellerProfile?.gst_number || ""}
                    placeholder="22AAAAA0000A1Z5"
                    className="h-10 rounded-lg text-xs uppercase font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pincode" className="text-xs font-semibold text-neutral-700">
                    Pincode
                  </Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    defaultValue={sellerProfile?.pincode || ""}
                    placeholder="531055"
                    className="h-10 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="factory_address" className="text-xs font-semibold text-neutral-700">
                  Workshop / Factory Physical Address
                </Label>
                <Input
                  id="factory_address"
                  name="factory_address"
                  defaultValue={sellerProfile?.factory_address || ""}
                  placeholder="Plot 14, Main Craft Bazaar, Artisans Street"
                  className="h-10 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* 5. Contact & Social Channels */}
            <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-neutral-700" />
                <h2 className="font-graphik text-sm font-bold text-neutral-900">
                  5. Contact & Social Channels
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="whatsapp" className="text-xs font-semibold text-neutral-700">
                    WhatsApp Business
                  </Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    defaultValue={parsedMeta.whatsapp || ""}
                    placeholder="+91 9876543210"
                    className="h-10 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="instagram" className="text-xs font-semibold text-neutral-700">
                    Instagram Handle
                  </Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    defaultValue={parsedMeta.instagram || ""}
                    placeholder="etikoppaka_toys"
                    className="h-10 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="website" className="text-xs font-semibold text-neutral-700">
                    Official Website
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    defaultValue={parsedMeta.website || ""}
                    placeholder="https://..."
                    className="h-10 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="font-graphik h-12 rounded-xl bg-black px-8 text-xs font-bold text-white shadow-md transition-all hover:bg-neutral-850 active:scale-[0.98]"
              >
                <Save className="mr-2 h-4 w-4" />
                <span>{isPending ? "Saving Profile..." : "Save & Publish Profile"}</span>
              </Button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Instagram-Style Profile Card Preview (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Live Storefront Preview
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>

            {/* Instagram-Style Profile Frame */}
            <div className="overflow-hidden rounded-3xl border border-[#E5E5E0] bg-white shadow-lg">
              {/* Cover Banner */}
              <div className="relative h-28 w-full bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                  Public Storefront
                </div>
              </div>

              {/* Profile Body */}
              <div className="relative px-6 pb-6 pt-0">
                {/* Avatar (clean frame, no story ring) */}
                <div className="-mt-12 flex items-end justify-between">
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-neutral-100 shadow-md">
                    <Image
                      src={avatarUrl || "/indian_craftsman.png"}
                      alt={businessName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isVerified
                        ? "bg-amber-100 text-amber-800"
                        : "border border-neutral-200 bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    <BadgeCheck
                      className={`h-3.5 w-3.5 ${
                        isVerified
                          ? "fill-amber-200 text-amber-600"
                          : "text-neutral-400"
                      }`}
                    />
                    {isVerified ? "Verified Maker" : "Pending Audit"}
                  </span>
                </div>

                {/* Name & Handle */}
                <div className="mt-3">
                  <h3 className="font-nantes text-lg font-bold text-[#1A1A18] line-clamp-1">
                    {businessName}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <span className="font-mono text-neutral-400">@{handle}</span>
                    <span>·</span>
                    <span className="font-medium text-amber-800">{craftCategory}</span>
                  </div>
                  <p className="mt-1 font-graphik text-xs font-semibold text-neutral-700">
                    {craftTitle}
                  </p>
                </div>

                {/* Location & Established Year */}
                <div className="mt-2.5 flex items-center gap-3 text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-neutral-400" />
                    {city}, {state}
                  </span>
                  {establishedYear && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-neutral-400" />
                      Est. {establishedYear}
                    </span>
                  )}
                </div>

                {/* Bio */}
                <p className="mt-3 font-graphik text-xs leading-relaxed text-neutral-600 line-clamp-3">
                  {shortBio}
                </p>

                {/* Instagram-Style Profile Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#FAF8F5] p-3 text-center border border-neutral-100">
                  <div>
                    <p className="font-graphik text-sm font-extrabold text-[#1A1A18]">
                      {productCount}
                    </p>
                    <p className="text-[10px] text-neutral-500">Products</p>
                  </div>
                  <div>
                    <p className="font-graphik text-sm font-extrabold text-amber-800">
                      {establishedYear ? `${new Date().getFullYear() - Number(establishedYear)}+` : "25+"}
                    </p>
                    <p className="text-[10px] text-neutral-500">Years Craft</p>
                  </div>
                  <div>
                    <p className="font-graphik text-sm font-extrabold text-rose-600">
                      {reelCount > 0 ? reelCount : "4+"}
                    </p>
                    <p className="text-[10px] text-neutral-500">Reels</p>
                  </div>
                </div>

                {/* Structured Tabs Preview */}
                <div className="mt-4 flex border-b border-neutral-100 pb-2 text-[11px] font-bold text-neutral-500">
                  <span className="border-b-2 border-black pb-2 text-black flex-1 text-center">
                    🛍️ Catalog
                  </span>
                  <span className="flex-1 text-center pb-2">
                    📖 Journey
                  </span>
                  <span className="flex-1 text-center pb-2">
                    🎬 Reels
                  </span>
                  <span className="flex-1 text-center pb-2">
                    🏛️ Trust
                  </span>
                </div>

                {/* CTA Action */}
                <div className="mt-4">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="font-graphik w-full rounded-xl border-[#1A1A18] text-xs font-bold text-[#1A1A18] hover:bg-[#1A1A18] hover:text-white"
                  >
                    <a href={liveStorefrontUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5">
                      <span>Preview Live on Marketplace</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
