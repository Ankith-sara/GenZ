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
import { Button } from "@/components/ui/button";

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
      {/* HERO SECTION — laptop + product collage, white bg */}
      <section className="border-ash relative w-full overflow-hidden border-b bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center lg:grid-cols-12">
          <div className="relative z-10 flex flex-col justify-center gap-7 px-6 py-16 sm:px-12 sm:py-20 lg:col-span-6 lg:py-0">
            <span className="text-caption font-graphik text-smoke tracking-[0.28em] uppercase">
              Made in India
            </span>

            <h1 className="font-nantes max-w-xl text-5xl leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.2rem]">
              From import
              <br />
              dependency to{" "}
              <span className="text-brand-yellow-dark relative inline-block font-medium italic">
                opportunity
                <svg
                  className="text-brand-yellow-dark absolute -bottom-2 left-0 h-2.5 w-full"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <rect width="100" height="8" fill="currentColor" />
                </svg>
              </span>
              .
            </h1>

            <p className="font-graphik text-charcoal max-w-md text-lg leading-relaxed">
              Everything Made in India. One Trusted Platform. Discover authentic Indian
              products, innovative technologies, startups, artisans, and brands—all in
              one marketplace.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-brand-yellow hover:bg-brand-yellow-hover font-graphik h-12 rounded-none border-none px-6 text-xs font-semibold tracking-[0.05em] text-black uppercase transition-colors"
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
                className="font-graphik h-12 rounded-none border-black px-6 text-xs font-semibold tracking-[0.05em] text-black uppercase transition-colors hover:bg-black hover:text-white"
              >
                <Link href="/signup/seller">Sell on GenZ</Link>
              </Button>
            </div>

            {/* Trust Badges Strip — 4 badges to match reference */}
            <div className="font-graphik mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-neutral-600">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-amber-500" /> 100% Made in India
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <BadgeCheck className="h-4 w-4 text-blue-600" /> Factory Verified
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-purple-600" /> GST Verified
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="h-4 w-4 text-emerald-600" /> Secure Payments
              </span>
            </div>
          </div>

          {/* Image column — laptop mockup, no crop/dark overlay */}
          <div className="relative flex min-h-[380px] items-center justify-center px-6 py-10 lg:col-span-6 lg:min-h-[640px] lg:px-8">
            <div className="relative aspect-[16/10] w-full max-w-2xl">
              <Image
                src="/hero_background.png"
                alt="GenZ Made in India laptop showcase"
                fill
                priority
                className="object-contain"
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
              <div className="tag border-ash mb-3 inline-block rounded-full border bg-white px-4 py-1 shadow-xs">
                <span className="font-graphik text-xs font-semibold tracking-[0.2em] text-amber-600 uppercase">
                  Browse Marketplace
                </span>
              </div>
              <h2 className="font-nantes text-ink-black text-4xl sm:text-5xl">
                Explore by Categories
              </h2>
            </div>
            <Button
              asChild
              variant="outline"
              className="font-graphik rounded-full border-black px-6 text-xs font-bold text-black hover:bg-black hover:text-white"
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
                className="relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-100">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="font-graphik absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                    {cat.count}
                  </div>
                </div>

                <div className="mt-4 flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-nantes text-xl font-bold text-neutral-900">
                      {cat.name}
                    </h3>
                  </div>

                  <div className="font-graphik mt-4 flex items-center gap-1 text-xs font-bold text-amber-600">
                    <span>Explore Products</span>
                    <ArrowRight className="h-3.5 w-3.5" />
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
            <h2 className="font-nantes text-ink-black text-4xl sm:text-5xl">
              Why Trust GenZ?
            </h2>
            <p className="font-graphik text-smoke mt-4 text-base leading-relaxed">
              We bridge buyers directly to genuine Indian sellers with zero middlemen,
              on-site physical audits, and transparent live video proof.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {homepageTrustPillars.map((pillar) => (
              <div
                key={pillar.title}
                className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-[#FAF7F0]/80 p-7 shadow-xs"
              >
                <div>
                  <h3 className="font-nantes text-2xl font-bold text-neutral-900">
                    {pillar.title}
                  </h3>
                  <p className="font-graphik mt-1.5 text-xs font-semibold text-neutral-400">
                    {pillar.subtitle}
                  </p>
                  <p className="font-graphik mt-4 text-xs leading-relaxed text-neutral-600">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-6 rounded-2xl border border-neutral-800 bg-[#0B0B0B] p-8 text-white shadow-xl lg:flex-row">
            <div className="max-w-2xl">
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
              className="font-graphik shrink-0 rounded-full bg-amber-400 px-8 text-xs font-bold text-black hover:bg-amber-500"
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
            <div className="tag border-ash mb-4 inline-block rounded-full border bg-[#FAF7F0] px-4 py-1 shadow-xs">
              <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
                Our Community
              </span>
            </div>
            <h2 className="font-nantes text-ink-black max-w-xl text-4xl sm:text-5xl">
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
      <section className="border-b border-neutral-800 bg-[#0B0B0B] px-6 py-20 text-white sm:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 shadow-xs"
              >
                <p className="font-nantes text-brand-yellow text-5xl font-normal sm:text-6xl">
                  {stat.value}
                </p>
                <p className="font-graphik mt-3 text-xs tracking-wider text-neutral-400 uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="text-pure-white mt-8 flex flex-col gap-6 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-8 shadow-xs sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="tag border-brand-yellow/30 bg-brand-yellow/10 mb-3 inline-block rounded-full border px-4 py-1 shadow-xs">
                <span className="font-graphik text-brand-yellow text-xs font-semibold tracking-[0.2em] uppercase">
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
              className="bg-brand-yellow hover:bg-brand-yellow-hover font-graphik h-12 shrink-0 rounded-full border-none px-8 text-xs font-semibold tracking-[0.1em] text-black uppercase shadow-sm transition-all"
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
              <Star
                key={i}
                className="fill-brand-yellow-dark text-brand-yellow-dark h-4 w-4"
              />
            ))}
          </div>

          <blockquote className="font-nantes text-ink-black text-2xl leading-snug italic sm:text-3xl">
            &ldquo;GenZ is not just a commercial platform, it&apos;s a movement to bring
            our manufacturing roots back to life.&rdquo;
          </blockquote>

          <div className="flex items-center gap-3">
            <div className="text-left">
              <h4 className="font-graphik text-ink-black text-sm font-semibold">
                Appala Sairam
              </h4>
              <p className="font-graphik text-smoke text-xs">Founder, GenZ</p>
            </div>
          </div>
        </div>

        <div className="border-ash mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between gap-6 rounded-2xl border bg-white p-6 shadow-xs sm:mt-14 sm:flex-row sm:gap-8 sm:px-8 sm:py-6">
          <span className="font-graphik text-smoke shrink-0 text-center text-xs font-semibold tracking-[0.25em] uppercase sm:text-left">
            Institutional validation
          </span>
          <div className="grid w-full grid-cols-2 items-center justify-center gap-6 sm:flex sm:w-auto sm:flex-1 sm:flex-wrap sm:justify-end sm:gap-8 lg:gap-10">
            <div className="relative mx-auto h-10 w-24 shrink-0 sm:mx-0 sm:h-12 sm:w-28">
              <Image
                src="/sidbi_logo.png"
                alt="SIDBI"
                fill
                className="object-contain mix-blend-multiply"
                sizes="(max-width: 640px) 96px, 112px"
              />
            </div>
            <div className="relative mx-auto h-10 w-24 shrink-0 sm:mx-0 sm:h-12 sm:w-28">
              <Image
                src="/nsic_logo.png"
                alt="NSIC"
                fill
                className="object-contain mix-blend-multiply"
                sizes="(max-width: 640px) 96px, 112px"
              />
            </div>
            <div className="relative mx-auto h-10 w-20 shrink-0 sm:mx-0 sm:h-12 sm:w-24">
              <Image
                src="/dpiit_logo.png"
                alt="DPIIT"
                fill
                className="object-contain mix-blend-multiply"
                sizes="(max-width: 640px) 80px, 96px"
              />
            </div>
            <div className="relative mx-auto h-12 w-28 shrink-0 sm:mx-0 sm:h-14 sm:w-36">
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
