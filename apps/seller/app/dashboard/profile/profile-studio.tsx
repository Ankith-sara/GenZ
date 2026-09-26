"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  BadgeCheck,
  Globe,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Film,
  ArrowRight,
} from "lucide-react";
import { Button, Input, Label, Textarea } from "@genz/ui";
import { AvatarUploader } from "@/features/user/components/avatar-uploader";
import { CoverUploader } from "@/features/user/components/cover-uploader";
import { updateSellerProfileStudio, type ProfileUpdateState } from "./actions";
import { SITE_URL } from "@genz/utils";

interface SellerMetadata {
  short_bio?: string;
  maker_name?: string;
  handle?: string;
  craft_category?: string;
  craft_title?: string;
  cover_url?: string;
  avatar_url?: string;
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
];

export function SellerProfileStudio({
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

  // Controlled states for live preview sync
  const [businessName, setBusinessName] = useState(
    sellerProfile?.business_name || "Polumuri Craft Atelier"
  );
  const [makerName, setMakerName] = useState(
    parsedMeta.maker_name || fullName || "Polumuri Nageswara Rao"
  );
  const [handle, setHandle] = useState(
    parsedMeta.handle ||
      (sellerProfile?.business_name
        ? sellerProfile.business_name.toLowerCase().replace(/[^a-z0-9_]/g, "")
        : "etikoppaka_crafts")
  );
  const [craftCategory, setCraftCategory] = useState(
    parsedMeta.craft_category || CRAFT_CATEGORIES[0]
  );
  const [craftTitle, setCraftTitle] = useState(
    parsedMeta.craft_title || "Master Woodturner & GI Certified Artisan"
  );
  const [city, setCity] = useState(sellerProfile?.city || "Etikoppaka");
  const [state, setState] = useState(sellerProfile?.state || "Andhra Pradesh");
  const [shortBio, setShortBio] = useState(
    parsedMeta.short_bio ||
      "Born in Etikoppaka. Shaped by generations. Along the Varaha River in Andhra Pradesh, second-generation artisan Polumuri Nageswara Rao carries forward 400-year-old GI-certified turned-wood lacquer craft using Ankudi Karra wood."
  );
  const [establishedYear, setEstablishedYear] = useState<string>(
    sellerProfile?.established_year ? String(sellerProfile.established_year) : "1984"
  );
  const [coverUrl, setCoverUrl] = useState<string | null>(parsedMeta.cover_url || null);
  const [liveAvatarUrl, setLiveAvatarUrl] = useState<string | null>(
    avatarUrl || parsedMeta.avatar_url || null
  );

  const [formState, formAction, isPending] = useActionState<
    ProfileUpdateState,
    FormData
  >(updateSellerProfileStudio, {});

  const liveStorefrontUrl = `${SITE_URL}/sellers/${userId}`;
  const isVerified = sellerProfile?.status === "verified";

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="border-outline-variant/60 flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-surface-container-high text-on-surface-variant rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
              Public Storefront
            </span>
          </div>
          <h1 className="text-on-surface mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            Storefront &amp; Maker Profile
          </h1>
          <p className="text-on-surface-variant mt-1 text-xs sm:text-sm">
            Customize how buyers discover your workshop, read your journey, and view
            your catalog.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-surface-container rounded-full px-4 text-xs font-semibold transition-all"
          >
            <a
              href={liveStorefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
            >
              <span>View Public Storefront</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Success / Error notification */}
      {formState?.success && (
        <div className="border-success/20 bg-success-container/70 text-on-success-container flex items-center gap-2.5 rounded-2xl border p-4 text-xs font-medium">
          <CheckCircle2 className="text-success h-4 w-4 shrink-0" />
          <p>{formState.message || "Profile successfully updated!"}</p>
        </div>
      )}
      {formState?.error && (
        <div className="border-error/20 bg-error-container/70 text-on-error-container flex items-center gap-2.5 rounded-2xl border p-4 text-xs font-medium">
          <AlertCircle className="text-error h-4 w-4 shrink-0" />
          <p>{formState.error}</p>
        </div>
      )}

      {/* Main Studio 2-Column Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN: Profile Customization Form */}
        <div className="space-y-6 lg:col-span-7">
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="cover_url" value={coverUrl || ""} />
            <input type="hidden" name="avatar_url" value={liveAvatarUrl || ""} />

            {/* 1. Profile Avatar & Atelier Cover Banner */}
            <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-6 rounded-2xl border p-6">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-on-surface text-sm font-bold">
                    1. Artisan Profile Photo
                  </h2>
                  {liveAvatarUrl && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 shadow-2xs">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span>Connected to Profile</span>
                    </span>
                  )}
                </div>
                <p className="text-on-surface-variant mt-1 text-xs">
                  {liveAvatarUrl
                    ? "Your public maker avatar is synchronized from your profile. You can update or replace it here anytime."
                    : "Upload a genuine portrait of you or your master craftsperson to showcase your atelier."}
                </p>

                <div className="mt-3">
                  <AvatarUploader
                    userId={userId}
                    fullName={makerName || businessName}
                    currentUrl={liveAvatarUrl}
                    onUploaded={(url) => setLiveAvatarUrl(url)}
                    size="lg"
                  />
                </div>
              </div>

              <div className="border-outline-variant/40 border-t pt-5">
                <h2 className="text-on-surface text-sm font-bold">
                  Atelier Cover Banner
                </h2>
                <p className="text-on-surface-variant mt-1 text-xs">
                  Upload a panoramic photo of your workshop, lathe machinery, raw
                  timber, or craft showroom.
                </p>

                <div className="mt-3">
                  <CoverUploader
                    currentUrl={coverUrl}
                    onUploaded={(url) => setCoverUrl(url)}
                  />
                </div>
              </div>
            </div>

            {/* 2. Identity, Handle & Category */}
            <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-2xl border p-6">
              <h2 className="text-on-surface text-sm font-bold">
                2. Maker Identity &amp; Handle
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="business_name"
                    className="text-on-surface-variant text-xs font-semibold"
                  >
                    Workshop / Business Name *
                  </Label>
                  <Input
                    id="business_name"
                    name="business_name"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Etikoppaka Heritage Lacquer Toys"
                    className="border-outline-variant/60 h-10 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="maker_name"
                    className="text-on-surface-variant text-xs font-semibold"
                  >
                    Master Artisan / Founder Name *
                  </Label>
                  <Input
                    id="maker_name"
                    name="maker_name"
                    value={makerName}
                    onChange={(e) => setMakerName(e.target.value)}
                    placeholder="e.g. Rameshwar Rao"
                    className="border-outline-variant/60 h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="handle"
                    className="text-on-surface-variant text-xs font-semibold"
                  >
                    Storefront Handle (@username) *
                  </Label>
                  <div className="relative flex items-center">
                    <span className="text-on-surface-variant absolute left-3 font-mono text-xs">
                      @
                    </span>
                    <Input
                      id="handle"
                      name="handle"
                      value={handle}
                      onChange={(e) =>
                        setHandle(
                          e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                        )
                      }
                      placeholder="etikoppaka_crafts"
                      className="border-outline-variant/60 h-10 rounded-xl pl-7 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="craft_category"
                    className="text-on-surface-variant text-xs font-semibold"
                  >
                    Craft Category *
                  </Label>
                  <select
                    id="craft_category"
                    name="craft_category"
                    value={craftCategory}
                    onChange={(e) => setCraftCategory(e.target.value)}
                    className="border-outline-variant/60 bg-surface-container-lowest text-on-surface h-10 w-full rounded-xl border px-3 text-xs font-medium"
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
                  <Label
                    htmlFor="craft_title"
                    className="text-on-surface-variant text-xs font-semibold"
                  >
                    Artisan Craft Title
                  </Label>
                  <Input
                    id="craft_title"
                    name="craft_title"
                    value={craftTitle}
                    onChange={(e) => setCraftTitle(e.target.value)}
                    placeholder="e.g. Master Woodcarver & National Awardee"
                    className="border-outline-variant/60 h-10 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="established_year"
                    className="text-on-surface-variant text-xs font-semibold"
                  >
                    Year Established
                  </Label>
                  <Input
                    id="established_year"
                    name="established_year"
                    type="number"
                    value={establishedYear}
                    onChange={(e) => setEstablishedYear(e.target.value)}
                    placeholder="e.g. 1988"
                    className="border-outline-variant/60 h-10 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 3. Short Bio & Story Narrative */}
            <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-2xl border p-6">
              <div className="flex items-center gap-2">
                <BookOpen className="text-primary h-4 w-4" />
                <h2 className="text-on-surface text-sm font-bold">
                  3. Story &amp; Journey Narrative
                </h2>
              </div>
              <p className="text-on-surface-variant text-xs">
                This personal story will be showcased under the &quot;Story &amp;
                Journey&quot; tab on your public profile.
              </p>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="short_bio"
                    className="text-on-surface-variant text-xs font-semibold"
                  >
                    Headline Bio (Storefront Pitch)
                  </Label>
                  <span className="text-on-surface-variant text-[10px]">
                    {shortBio.length}/200 chars
                  </span>
                </div>
                <Textarea
                  id="short_bio"
                  name="short_bio"
                  rows={2}
                  maxLength={200}
                  value={shortBio}
                  onChange={(e) => setShortBio(e.target.value)}
                  placeholder="A concise, punchy bio summarizing your craft and heritage."
                  className="border-outline-variant/60 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="how_it_started"
                  className="text-on-surface-variant text-xs font-semibold"
                >
                  How My Journey Started (In Depth Narrative)
                </Label>
                <Textarea
                  id="how_it_started"
                  name="how_it_started"
                  rows={4}
                  defaultValue={
                    parsedMeta.how_it_started ||
                    `Along the banks of the Varaha River in Andhra Pradesh lies the village of Etikoppaka, where turned-wood lacquer craft has been passed down for over 400 years. As the son of senior artisan Polumuri Talla Chari, making toys is an inheritance carrying pride and responsibility.`
                  }
                  placeholder="Share your personal story of learning the craft, ancestral roots, and workshop dedication..."
                  className="border-outline-variant/60 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="materials_and_technique"
                  className="text-on-surface-variant text-xs font-semibold"
                >
                  Materials, Wood Species &amp; Lathe Technique
                </Label>
                <Textarea
                  id="materials_and_technique"
                  name="materials_and_technique"
                  rows={3}
                  defaultValue={
                    parsedMeta.materials_and_technique ||
                    `Shaped exclusively from soft Ankudi Karra wood on a traditional lathe. Pure lac is applied by hand while the wood turns, using natural friction heat to melt and bind the lacquer. Finished with 100% natural, non-toxic colors derived from seeds, bark, roots, and leaves (Registered GI Craft, 2017).`
                  }
                  placeholder="Describe your raw materials, sustainability standards, and artisan techniques..."
                  className="border-outline-variant/60 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* 4. Location & Workshop Details */}
            <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-2xl border p-6">
              <div className="flex items-center gap-2">
                <MapPin className="text-on-surface h-4 w-4" />
                <h2 className="text-on-surface text-sm font-bold">
                  4. Workshop Location &amp; Verification
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="city"
                    className="text-on-surface-variant text-xs font-semibold"
                  >
                    City / Craft Cluster *
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Etikoppaka"
                    className="border-outline-variant/60 h-10 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="state"
                    className="text-on-surface-variant text-xs font-semibold"
                  >
                    State *
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Andhra Pradesh"
                    className="border-outline-variant/60 h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="gst_number"
                    className="text-on-surface-variant text-xs font-semibold"
                  >
                    GSTIN / Tax ID
                  </Label>
                  <Input
                    id="gst_number"
                    name="gst_number"
                    defaultValue={sellerProfile?.gst_number || ""}
                    placeholder="22AAAAA0000A1Z5"
                    className="border-outline-variant/60 h-10 rounded-xl font-mono text-xs uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="pincode"
                    className="text-on-surface-variant text-xs font-semibold"
                  >
                    Pincode
                  </Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    defaultValue={sellerProfile?.pincode || ""}
                    placeholder="531055"
                    className="border-outline-variant/60 h-10 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="factory_address"
                  className="text-on-surface-variant text-xs font-semibold"
                >
                  Workshop / Factory Physical Address
                </Label>
                <Input
                  id="factory_address"
                  name="factory_address"
                  defaultValue={sellerProfile?.factory_address || ""}
                  placeholder="Plot 14, Main Craft Bazaar, Artisans Street"
                  className="border-outline-variant/60 h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* 5. Contact & Social Channels */}
            <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-2xl border p-6">
              <div className="flex items-center gap-2">
                <Globe className="text-on-surface h-4 w-4" />
                <h2 className="text-on-surface text-sm font-bold">
                  5. Contact &amp; Social Channels
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="whatsapp"
                    className="text-on-surface-variant text-xs font-semibold"
                  >
                    WhatsApp Business
                  </Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    defaultValue={parsedMeta.whatsapp || ""}
                    placeholder="+91 9876543210"
                    className="border-outline-variant/60 h-10 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="instagram"
                    className="text-on-surface-variant text-xs font-semibold"
                  >
                    Instagram Handle
                  </Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    defaultValue={parsedMeta.instagram || ""}
                    placeholder="etikoppaka_toys"
                    className="border-outline-variant/60 h-10 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="website"
                    className="text-on-surface-variant text-xs font-semibold"
                  >
                    Official Website
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    defaultValue={parsedMeta.website || ""}
                    placeholder="https://..."
                    className="border-outline-variant/60 h-10 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 6. Workshop Process Reels */}
            <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-2xl border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="text-primary h-4 w-4" />
                  <h2 className="text-on-surface text-sm font-bold">
                    6. Workshop Process Reels
                  </h2>
                </div>
                <span className="bg-primary-container text-on-primary-container rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                  {reelCount} Published
                </span>
              </div>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Video reels appear directly under the &quot;Reels&quot; tab on your
                public profile. Upload raw video footage of woodturning, organic
                lacquering, or carving.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-surface-container rounded-full text-xs font-semibold"
                >
                  <Link href="/dashboard/products">
                    <span>Manage &amp; Upload Reels to Products</span>
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="bg-primary text-on-primary shadow-elevation-1 hover:shadow-elevation-2 h-11 rounded-full px-8 text-xs font-bold transition-all active:scale-[0.98]"
              >
                <Save className="mr-2 h-4 w-4" />
                <span>
                  {isPending ? "Saving Profile..." : "Save & Publish Profile"}
                </span>
              </Button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Storefront Profile Card Preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant font-mono text-xs font-bold tracking-wider uppercase">
                Live Storefront Preview
              </span>
              <span className="bg-success-container text-on-success-container border-success/20 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold">
                <span className="bg-success h-1.5 w-1.5 animate-pulse rounded-full" />
                Live Sync
              </span>
            </div>

            {/* Storefront Profile Frame */}
            <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-2 overflow-hidden rounded-3xl border">
              {/* Cover Banner */}
              <div className="bg-surface-container-highest relative h-28 w-full overflow-hidden">
                <Image
                  src={coverUrl || "/machine_work.png"}
                  alt="Cover preview"
                  fill
                  className="object-cover opacity-85"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                  Public Storefront
                </div>
              </div>

              {/* Profile Body */}
              <div className="relative px-6 pt-0 pb-6">
                {/* Avatar */}
                <div className="-mt-12 flex items-end justify-between">
                  <div className="border-surface-container-lowest bg-surface-container-high shadow-elevation-1 relative h-20 w-20 overflow-hidden rounded-2xl border-4">
                    {liveAvatarUrl ? (
                      <Image
                        src={liveAvatarUrl}
                        alt={businessName}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                      />
                    ) : (
                      <div className="relative flex h-full w-full items-center justify-center bg-[#E4E6EB]">
                        <svg
                          viewBox="0 0 100 100"
                          className="h-full w-full fill-[#8A8D91]"
                          aria-hidden="true"
                        >
                          <circle cx="50" cy="38" r="18" />
                          <path d="M 20 86 C 20 66, 32 58, 50 58 C 68 58, 80 66, 80 86 Z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isVerified
                        ? "bg-success-container text-on-success-container border-success/20 border"
                        : "border-outline-variant/60 bg-surface-container text-on-surface-variant border"
                    }`}
                  >
                    <BadgeCheck
                      className={`h-3.5 w-3.5 ${
                        isVerified
                          ? "fill-success text-on-success"
                          : "text-on-surface-variant"
                      }`}
                    />
                    {isVerified ? "Verified Maker" : "Pending Audit"}
                  </span>
                </div>

                {/* Name & Handle */}
                <div className="mt-3">
                  <h3 className="text-on-surface line-clamp-1 text-lg font-bold">
                    {businessName}
                  </h3>
                  <div className="text-on-surface-variant flex items-center gap-1 text-xs">
                    <span className="text-on-surface-variant font-mono">@{handle}</span>
                    <span>·</span>
                    <span className="text-primary font-medium">{craftCategory}</span>
                  </div>
                  <p className="text-on-surface-variant mt-1 text-xs font-semibold">
                    {craftTitle}
                  </p>
                </div>

                {/* Location & Established Year */}
                <div className="text-on-surface-variant mt-2.5 flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1">
                    <MapPin className="text-on-surface-variant h-3 w-3" />
                    {city}, {state}
                  </span>
                  {establishedYear && (
                    <span className="flex items-center gap-1">
                      <Calendar className="text-on-surface-variant h-3 w-3" />
                      Est. {establishedYear}
                    </span>
                  )}
                </div>

                {/* Bio */}
                <p className="text-on-surface-variant mt-3 line-clamp-3 text-xs leading-relaxed">
                  {shortBio}
                </p>

                {/* Storefront Profile Metrics */}
                <div className="border-outline-variant/40 bg-surface-container-low mt-4 grid grid-cols-3 gap-2 rounded-2xl border p-3 text-center">
                  <div>
                    <p className="text-on-surface text-sm font-extrabold">
                      {productCount}
                    </p>
                    <p className="text-on-surface-variant text-[10px]">Products</p>
                  </div>
                  <div>
                    <p className="text-primary text-sm font-extrabold">
                      {establishedYear
                        ? `${new Date().getFullYear() - Number(establishedYear)}+`
                        : "25+"}
                    </p>
                    <p className="text-on-surface-variant text-[10px]">Years Craft</p>
                  </div>
                  <div>
                    <p className="text-secondary text-sm font-extrabold">
                      {reelCount > 0 ? reelCount : "4+"}
                    </p>
                    <p className="text-on-surface-variant text-[10px]">Video Reels</p>
                  </div>
                </div>

                {/* CTA Action */}
                <div className="mt-4">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-surface-container w-full rounded-full text-xs font-bold"
                  >
                    <a
                      href={liveStorefrontUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5"
                    >
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

export const SellerInstagramProfileStudio = SellerProfileStudio;
