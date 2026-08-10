"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Star,
  ArrowRight,
  BadgeCheck,
  Lock,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/atoms/button";

const homepageCategories = [
  {
    name: "Wooden Toys & Crafts",
    href: "/discover?category=Wooden Toys",
    image: "/cat_toys.png",
    count: "150+ Verified Products",
    desc: "Eco-friendly, non-toxic traditional Indian toys & STEM blocks.",
  },
  {
    name: "Electronics & Tech",
    href: "/discover?category=Electronics",
    image: "/cat_electronics.png",
    count: "220+ Verified Products",
    desc: "Smart devices, chargers & custom PCB assemblies.",
  },
  {
    name: "Fashion & Apparel",
    href: "/discover?category=Fashion",
    image: "/cat_fashion.png",
    count: "310+ Verified Products",
    desc: "Organic cotton textiles, handcrafted apparel & accessories.",
  },
  {
    name: "Home & Furniture",
    href: "/discover?category=Furniture",
    image: "/cat_furniture.png",
    count: "180+ Verified Products",
    desc: "Solid wood furniture, handcrafted decor & living items.",
  },
  {
    name: "Kitchen & Dining",
    href: "/discover?category=Kitchen",
    image: "/cat_kitchen.png",
    count: "200+ Verified Products",
    desc: "Stainless steel utensils, cast iron cookware & appliances.",
  },
  {
    name: "Beauty & Wellness",
    href: "/discover?category=Beauty",
    image: "/cat_beauty.png",
    count: "140+ Verified Products",
    desc: "Ayurvedic formulations, natural skincare & herbal wellness.",
  },
  {
    name: "Industrial & Tools",
    href: "/discover?category=Industrial",
    image: "/cat_industrial.png",
    count: "290+ Verified Products",
    desc: "Precision components, machinery parts & fabrication tools.",
  },
  {
    name: "Sports & Fitness",
    href: "/discover?category=Sports",
    image: "/cat_sports.png",
    count: "110+ Verified Products",
    desc: "Athletic gear, fitness equipment & outdoor play sets.",
  },
];

const homepageTrustPillars = [
  {
    title: "100% Made in India Sourcing",
    subtitle: "Authentic Domestic Craftsmanship",
    desc: "Every listing on GenZ originates from verified Indian workshops and factories. We eliminate reliance on low-quality imports and connect you directly to Indian makers.",
  },
  {
    title: "Rigorous Factory & GST Audits",
    subtitle: "3-Tier Supplier Verification",
    desc: "Before any seller lists a product, our team conducts physical site validation, GST registration verification, and MSME certification checks.",
  },
  {
    title: "Live Production Video Reels",
    subtitle: "Unfiltered Source Transparency",
    desc: "Watch real factory production reels showing actual workers, machinery, raw materials, and quality tests before placing your wholesale or retail order.",
  },
  {
    title: "Direct Pricing & Escrow Protection",
    subtitle: "Zero Middleman Markup",
    desc: "Buy directly from sellers with no price stacking. Payments are securely held in escrow until items are received and inspected.",
  },
];

const stakeholdersList = [
  {
    index: "01",
    name: "Consumers",
    image: "/consumers.png",
    copy: "Trusted, high-quality Indian products, straight from the source. We connect you directly to the factory floor, ensuring verified quality and competitive pricing without middleman markups.",
  },
  {
    index: "02",
    name: "Sellers",
    image: "/sellers.png",
    copy: "Visibility, market demand insights, and a direct line to national buyers. We help you digitize your profile, showcase catalogs, and build lasting business relationships.",
  },
  {
    index: "03",
    name: "Startups",
    image: "/startups.png",
    copy: "Reliable manufacturing partners for products that don't exist yet. Discover local fabricators, request custom quotes, and turn prototypes into physical products.",
  },
  {
    index: "04",
    name: "Creators",
    image: "/creators.png",
    copy: "A stage to showcase process, not just the finished product. Share factory reels, tell your brand story, and build direct emotional and commercial trust with buyers.",
  },
  {
    index: "05",
    name: "Investors",
    image: "/investors.png",
    copy: "Verified seller listings and regional innovation clusters worth backing. Gain access to transparent manufacturing metrics, production capacity data, and growth indicators.",
  },
];

const stats = [
  { value: "100+", label: "Verified sellers" },
  { value: "1,000+", label: "Products & innovations" },
  { value: "500+", label: "Import gaps identified" },
  { value: "1K+", label: "Jobs & livelihoods" },
];

interface Stakeholder {
  index: string;
  name: string;
  image: string;
  copy: string;
}

interface StakeholderCardProps {
  s: Stakeholder;
  tier: "xl" | "lg" | "md" | "sm";
  className?: string;
}

function StakeholderCard({ s, tier, className = "" }: StakeholderCardProps) {
  const paddingMap = {
    xl: "p-8 sm:p-10",
    lg: "p-6 sm:p-8",
    md: "p-5 sm:p-6",
    sm: "p-4 sm:p-5",
  };

  const titleMap = {
    xl: "text-3xl sm:text-4xl lg:text-5xl",
    lg: "text-2xl sm:text-3xl",
    md: "text-xl sm:text-2xl",
    sm: "text-lg sm:text-xl",
  };

  const copyMap = {
    xl: "text-sm sm:text-base max-w-md opacity-90",
    lg: "text-xs sm:text-sm max-w-sm opacity-85",
    md: "text-xs max-w-xs opacity-80",
    sm: "hidden",
  };

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-950 text-white shadow-xs transition-all duration-500 hover:shadow-lg ${paddingMap[tier]} ${className}`}
    >
      {/* Background Image with zoom on hover */}
      <div className="absolute inset-0 z-0">
        <Image
          src={s.image}
          alt={s.name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 600px"
        />
        {/* Soft, high-end editorial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 transition-opacity duration-500 group-hover:opacity-95" />
      </div>

      {/* Card Content */}
      <div className="relative z-10 flex h-full w-full flex-col justify-between">
        {/* Bottom Section */}
        <div className="mt-auto pt-6">
          <h3
            className={`font-nantes mb-2 leading-tight font-normal text-white ${titleMap[tier]}`}
          >
            For {s.name}
          </h3>
          {tier !== "sm" && (
            <p
              className={`font-graphik leading-relaxed text-neutral-300 ${copyMap[tier]}`}
            >
              {s.copy}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="bg-cream-paper text-ink-black flex-1 font-sans antialiased">
      {/* HERO SECTION — Golden Ratio Aligned Editorial Layout */}
      <section className="relative w-full overflow-hidden border-b border-[#E5E5E0] bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 px-6 py-14 sm:px-12 sm:py-18 lg:grid-cols-12 lg:gap-12 lg:py-24">
          {/* Left Text & CTA Column — 5 cols (~41.7% width, Golden Ratio minor section) */}
          <div className="flex flex-col justify-center gap-6 lg:col-span-5">
            <div className="inline-flex items-center gap-2">
              <span className="font-graphik text-xs font-semibold tracking-[0.25em] text-[#73736E] uppercase">
                MADE IN INDIA
              </span>
            </div>

            <h1 className="font-nantes text-4xl leading-[1.08] font-normal tracking-tight text-[#1A1A18] sm:text-5xl lg:text-[3.5rem] xl:text-[4rem]">
              From import
              <br />
              dependency to{" "}
              <span className="relative inline-block font-medium text-[#D4A017] italic">
                opportunity
                <svg
                  className="text-brand-yellow-dark absolute -bottom-2 left-0 h-2.5 w-full opacity-90"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <rect width="100" height="8" fill="currentColor" />
                </svg>
              </span>
              .
            </h1>

            <p className="font-graphik max-w-lg text-base leading-relaxed text-[#52524E]">
              Everything Made in India. One Trusted Platform. Discover authentic Indian
              products, innovative technologies, startups, artisans, and brands—all in
              one marketplace.
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="font-graphik h-12 rounded-lg border-none bg-[#FACC15] px-7 text-xs font-bold tracking-wide text-black transition-all duration-200 hover:bg-[#EAB308] hover:shadow-md active:scale-[0.98]"
              >
                <Link href="/discover" className="flex items-center gap-2">
                  <span>Explore India</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="font-graphik h-12 rounded-lg border border-[#1A1A18] bg-white px-7 text-xs font-bold tracking-wide text-[#1A1A18] transition-all duration-200 hover:bg-[#1A1A18] hover:text-white hover:shadow-md active:scale-[0.98]"
              >
                <Link href="/seller/signup">Sell on GenZ</Link>
              </Button>
            </div>

            {/* Trust Badges Strip — Golden ratio divider & layout */}
            <div className="font-graphik mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-neutral-100 pt-4 text-xs text-[#52524E]">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#D4A017]" /> 100% Made in India
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <BadgeCheck className="h-4 w-4 text-[#D4A017]" /> Factory Verified
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-[#D4A017]" /> GST Verified
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="h-4 w-4 text-[#D4A017]" /> Secure Payments
              </span>
            </div>
          </div>

          {/* Right Hero Image Column — 7 cols (~58.3% width, Golden Ratio major section) */}
          <div className="relative flex items-center justify-center lg:col-span-7">
            {/* Ambient Backlight Aura */}
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-full bg-amber-400/15 opacity-70 blur-3xl" />

            {/* Golden Ratio Aspect Box: 1.618 : 1 */}
            <div className="relative aspect-[1.618/1] w-full max-w-4xl p-2">
              <Image
                src="/hero_background.png"
                alt="GenZ Made in India products exploding from laptop screen"
                fill
                priority
                className="object-contain object-center drop-shadow-xl"
                sizes="(max-width: 1024px) 100vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* DEDICATED SECTION: EXPLORE BY CATEGORIES */}
      <section
        id="categories"
        className="border-ash border-b bg-[#FAF7F0] px-6 py-20 sm:px-12 md:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="tag mb-3 inline-block rounded-full border border-neutral-300/80 bg-white px-4 py-1.5 shadow-2xs">
                <span className="font-graphik text-xs font-bold tracking-[0.2em] text-amber-700 uppercase">
                  Browse Marketplace
                </span>
              </div>
              <h2 className="font-nantes text-ink-black text-4xl font-normal sm:text-5xl">
                Explore by Categories
              </h2>
            </div>
            <Button
              asChild
              variant="outline"
              className="font-graphik rounded-full border-black px-6 text-xs font-bold text-black transition-all duration-300 hover:bg-black hover:text-white"
            >
              <Link href="/discover" className="flex items-center gap-2">
                <span>View Full Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {homepageCategories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E5E5E0] bg-white p-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-black/20 hover:shadow-xl"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-100">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <h3 className="font-nantes text-2xl font-bold tracking-tight text-[#1A1A18] transition-colors group-hover:text-amber-600">
                      {cat.name}
                    </h3>
                    {cat.desc && (
                      <p className="font-graphik line-clamp-2 text-xs leading-relaxed text-neutral-600">
                        {cat.desc}
                      </p>
                    )}
                  </div>
                </div>

                <div className="font-graphik mt-5 flex items-center justify-between border-t border-[#F0F0EC] pt-3.5 text-xs font-bold text-[#1A1A18]">
                  <span className="text-neutral-500 tabular-nums transition-colors group-hover:text-amber-800">
                    {cat.count}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E5E0] bg-[#FAF8F4] transition-all duration-300 group-hover:border-black group-hover:bg-black group-hover:text-white">
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DEDICATED SECTION: WHY TRUST GENZ */}
      <section
        id="why-trust-genz"
        className="border-ash border-b bg-white px-6 py-20 sm:px-12 md:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="font-nantes text-ink-black text-4xl font-normal sm:text-5xl">
              Why Trust GenZ?
            </h2>
            <p className="font-graphik text-smoke mt-4 text-base leading-relaxed text-neutral-600">
              We bridge buyers directly to genuine Indian sellers with zero middlemen,
              on-site physical audits, and transparent live video proof.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {homepageTrustPillars.map((pillar) => (
              <div
                key={pillar.title}
                className="flex flex-col justify-between rounded-3xl border border-neutral-200/80 bg-[#FAF7F0]/90 p-7 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-lg"
              >
                <div>
                  <h3 className="font-nantes text-2xl font-bold text-neutral-900">
                    {pillar.title}
                  </h3>
                  <p className="font-graphik mt-1.5 text-xs font-semibold text-amber-700">
                    {pillar.subtitle}
                  </p>
                  <p className="font-graphik mt-4 text-xs leading-relaxed text-neutral-600">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-14 flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl border border-neutral-800 bg-[#09090b] p-8 text-white shadow-2xl lg:flex-row lg:p-10">
            <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="relative z-10 max-w-2xl">
              <h3 className="font-nantes text-2xl text-white sm:text-3xl">
                Backed by Institutional Trust & Government Initiatives
              </h3>
              <p className="font-graphik mt-2 text-xs leading-relaxed text-neutral-400 sm:text-sm">
                GenZ aligns with national manufacturing initiatives like DPIIT, MSME,
                and Make in India to empower domestic makers and eliminate import
                dependencies.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="font-graphik relative z-10 shrink-0 rounded-full bg-amber-400 px-8 text-xs font-bold text-black transition-all duration-300 hover:bg-amber-300 hover:shadow-lg active:scale-95"
            >
              <Link href="/about">Learn Our Story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="border-ash border-b bg-white px-6 py-20 sm:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-left">
            <div className="tag mb-4 inline-block rounded-full border border-neutral-300/80 bg-[#FAF7F0] px-4 py-1 shadow-2xs">
              <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
                Our Community
              </span>
            </div>
            <h2 className="font-nantes text-ink-black max-w-xl text-4xl font-normal sm:text-5xl">
              Built for all Indian stakeholders.
            </h2>
          </div>

          {/* Mobile/tablet */}
          <div className="flex flex-col gap-5 lg:hidden">
            {stakeholdersList.map((s) => (
              <StakeholderCard
                key={s.name}
                s={s}
                tier="lg"
                className="aspect-[16/10]"
              />
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden lg:grid lg:h-[640px] lg:grid-cols-2 lg:gap-5">
            <StakeholderCard s={stakeholdersList[0]} tier="xl" className="h-full" />

            <div className="grid grid-cols-2 grid-rows-2 gap-5">
              {stakeholdersList.slice(1).map((s) => (
                <StakeholderCard key={s.name} s={s} tier="md" className="h-full" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS & MISSION */}
      <section className="bg-noise-dark border-b border-neutral-800 bg-[#09090b] px-6 py-20 text-white sm:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-neutral-800/90 bg-neutral-900/70 p-8 shadow-md backdrop-blur-xs transition-all duration-300 hover:border-amber-500/30 hover:shadow-xl"
              >
                <p className="font-nantes text-brand-yellow text-5xl font-normal tabular-nums sm:text-6xl">
                  {stat.value}
                </p>
                <p className="font-graphik mt-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="text-pure-white mt-8 flex flex-col gap-6 rounded-3xl border border-neutral-800 bg-neutral-900/90 p-8 shadow-xl sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="tag mb-3 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 shadow-2xs">
                <span className="font-graphik text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">
                  The Mission
                </span>
              </div>
              <h3 className="font-nantes mb-2 text-2xl text-white sm:text-3xl">
                10 million Indian businesses by 2030.
              </h3>
              <p className="font-graphik text-sm leading-relaxed text-neutral-300">
                Building the most trusted direct-discovery commerce engine for Indian
                manufacturing.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-brand-yellow font-graphik h-12 shrink-0 rounded-full border-none px-8 text-xs font-bold tracking-[0.1em] text-black uppercase shadow-md transition-all duration-300 hover:bg-amber-300 hover:shadow-lg active:scale-95"
            >
              <Link href="/about">Read the vision</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TRUST MARQUEE */}
      <section className="border-ash border-b bg-[#FAF7F0] px-6 py-20 sm:px-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
          <div className="text-brand-yellow-dark flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
            ))}
          </div>

          <blockquote className="font-nantes text-ink-black text-2xl leading-snug italic sm:text-3xl">
            &ldquo;GenZ is not just a commercial platform, it&apos;s a movement to bring
            our manufacturing roots back to life.&rdquo;
          </blockquote>

          <div className="flex items-center gap-3">
            <div className="text-left">
              <h4 className="font-graphik text-ink-black text-sm font-bold">
                Appala Sairam
              </h4>
              <p className="font-graphik text-smoke text-xs">Founder, GenZ</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between gap-6 rounded-3xl border border-neutral-300/80 bg-white p-6 shadow-xs sm:mt-14 sm:flex-row sm:gap-8 sm:px-8 sm:py-6">
          <span className="font-graphik shrink-0 text-center text-xs font-bold tracking-[0.25em] text-neutral-500 uppercase sm:text-left">
            Institutional validation
          </span>
          <div className="grid w-full grid-cols-2 items-center justify-center gap-6 sm:flex sm:w-auto sm:flex-1 sm:flex-wrap sm:justify-end sm:gap-8 lg:gap-10">
            <div className="relative mx-auto h-10 w-24 shrink-0 opacity-90 transition-opacity hover:opacity-100 sm:mx-0 sm:h-12 sm:w-28">
              <Image
                src="/sidbi_logo.png"
                alt="SIDBI"
                fill
                className="object-contain mix-blend-multiply"
                sizes="(max-width: 640px) 96px, 112px"
              />
            </div>
            <div className="relative mx-auto h-10 w-24 shrink-0 opacity-90 transition-opacity hover:opacity-100 sm:mx-0 sm:h-12 sm:w-28">
              <Image
                src="/nsic_logo.png"
                alt="NSIC"
                fill
                className="object-contain mix-blend-multiply"
                sizes="(max-width: 640px) 96px, 112px"
              />
            </div>
            <div className="relative mx-auto h-10 w-20 shrink-0 opacity-90 transition-opacity hover:opacity-100 sm:mx-0 sm:h-12 sm:w-24">
              <Image
                src="/dpiit_logo.png"
                alt="DPIIT"
                fill
                className="object-contain mix-blend-multiply"
                sizes="(max-width: 640px) 80px, 96px"
              />
            </div>
            <div className="relative mx-auto h-12 w-28 shrink-0 opacity-90 transition-opacity hover:opacity-100 sm:mx-0 sm:h-14 sm:w-36">
              <Image
                src="/make_in_india.png"
                alt="Make in India"
                fill
                className="object-contain mix-blend-multiply"
                sizes="(max-width: 640px) 112px, 144px"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
