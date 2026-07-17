"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  ArrowUpRight,
  Play,
  Heart,
  MessageCircle,
  Share2,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const stakeholdersList = [
  {
    index: "01",
    name: "Consumers",
    image: "/consumers.jpeg",
    copy: "Trusted, high-quality Indian products, straight from the source. We connect you directly to the factory floor, ensuring verified quality and competitive pricing without middleman markups.",
  },
  {
    index: "02",
    name: "Manufacturers",
    image: "/manufacturers.jpeg",
    copy: "Visibility, market demand insights, and a direct line to national buyers. We help you digitize your profile, showcase catalogs, and build lasting business relationships.",
  },
  {
    index: "03",
    name: "Startups",
    image: "/startups.jpeg",
    copy: "Reliable manufacturing partners for products that don't exist yet. Discover local fabricators, request custom quotes, and turn prototypes into physical products.",
  },
  {
    index: "04",
    name: "Creators",
    image: "/creators.jpeg",
    copy: "A stage to showcase process, not just the finished product. Share factory reels, tell your brand story, and build direct emotional and commercial trust with buyers.",
  },
  {
    index: "05",
    name: "Investors",
    image: "/india_glow_map.png",
    copy: "Verified manufacturer listings and regional innovation clusters worth backing. Gain access to transparent manufacturing metrics, production capacity data, and growth indicators.",
  },
];

const pillars = [
  {
    index: "01",
    title: "Trust Layer",
    copy: "GST verification, factory validation and certification checks run on every seller before they ever list a product.",
  },
  {
    index: "02",
    title: "Reel-Based Discovery",
    copy: "Real factory reels, not stock photography. You see the process and the people before you see the price.",
  },
  {
    index: "03",
    title: "Import Gap Intelligence",
    copy: "We track what India still imports and route that demand toward the manufacturers who can build it here instead.",
  },
  {
    index: "04",
    title: "Innovation & Design",
    copy: "Encouraging Indian makers to redesign, not just replicate — better materials, better ergonomics, better margins.",
  },
  {
    index: "05",
    title: "Direct Market Access",
    copy: "Manufacturers reach consumers without a chain of middlemen. No markup stacking, no anonymous resellers.",
  },
];

const stats = [
  { value: "10,000+", label: "Verified manufacturers" },
  { value: "1,00,000+", label: "Products & innovations" },
  { value: "500+", label: "Import gaps identified" },
  { value: "1M+", label: "Jobs & livelihoods" },
];

export default function HomePage() {
  const [activeStakeholder, setActiveStakeholder] = useState(0);

  return (
    <main className="bg-cream-paper text-ink-black flex-1 font-sans antialiased">
      <section className="border-ash relative flex min-h-[600px] w-full items-center overflow-hidden border-b px-6 py-20 sm:min-h-[700px] sm:px-12 lg:min-h-[750px]">
        {/* Background Image with Dark/Warm Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero_background.png"
            alt="GenZ Toy Manufacturing Workshop"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent lg:from-black/90 lg:via-black/55 lg:to-black/30" />
          {/* Accent glow on top left */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(226,161,111,0.2),_transparent_50%)]" />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Column: text overlay (now high contrast white/cream text on dark overlay) */}
          <div className="flex flex-col justify-center space-y-6 text-left lg:col-span-8">
            <span className="text-caption font-graphik tracking-[0.28em] text-white/70 uppercase">
              Made in India
            </span>

            <h1 className="font-nantes max-w-3xl text-5xl leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.8rem]">
              From import dependency <br />
              to{" "}
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

            <p className="font-graphik mt-4 max-w-xl text-lg leading-relaxed text-white/80">
              GenZ connects Indian consumers directly with verified Indian manufacturers
              — trading imported guesswork for factory-validated trust.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-4">
              <Button
                asChild
                size="lg"
                className="bg-brand-yellow hover:bg-brand-yellow-hover font-graphik h-12 rounded-none border-none px-6 text-xs font-semibold tracking-[0.05em] text-black uppercase transition-colors"
              >
                <Link href="/discover">Explore products</Link>
              </Button>
              <Link
                href="/signup/manufacturer"
                className="group text-body font-graphik inline-flex items-center gap-1.5 font-medium text-white underline decoration-white/30 underline-offset-4 transition-all hover:decoration-white"
              >
                For manufacturers
                <ArrowUpRight className="text-brand-yellow h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <dl className="mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-4 border-t border-white/10 pt-10 sm:grid-cols-2">
              {[
                "100% verified manufacturers",
                "No imports, no fake resellers",
                "GST & factory validated",
                "Built for India, by India",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <ShieldCheck className="text-brand-yellow h-5 w-5 shrink-0" />
                  <dd className="font-graphik text-sm leading-snug text-white/85">
                    {item}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Core Pillars — list/grid hybrids with lines */}
      <section className="border-ash border-b px-6 py-20 sm:px-12 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-14 max-w-xl">
            <span className="text-caption font-graphik text-smoke mb-4 block tracking-[0.2em] uppercase">
              Foundations of Trust
            </span>
            <h2 className="font-nantes text-ink-black text-4xl sm:text-5xl">
              The pillars that build direct commerce.
            </h2>
          </div>

          <div className="divide-ash divide-ash border-ash grid grid-cols-1 divide-y border-y lg:grid-cols-5 lg:divide-x lg:divide-y-0">
            {pillars.map((pillar) => (
              <div
                key={pillar.index}
                className="flex min-h-[220px] flex-col justify-between py-8 first:pl-0 last:pr-0 lg:px-6 lg:py-12"
              >
                <div>
                  <span className="text-caption font-graphik text-brand-blue mb-3 block font-medium tracking-[0.1em]">
                    {pillar.index}
                  </span>
                  <h3 className="font-nantes text-ink-black mb-3 text-xl font-normal">
                    {pillar.title}
                  </h3>
                </div>
                <p className="text-body font-graphik text-charcoal leading-relaxed">
                  {pillar.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="border-ash bg-pure-white border-b px-6 py-20 sm:px-12 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-16 text-center">
            <span className="text-caption font-graphik text-smoke mb-4 block tracking-[0.2em] uppercase">
              Differentiation
            </span>
            <h2 className="font-nantes text-ink-black text-4xl sm:text-5xl">
              How GenZ changes the game.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Card 1: Video Reels */}
            <div className="bg-cream-paper border-ash group relative flex h-full min-h-[520px] flex-col justify-between border p-8">
              <div>
                <h3 className="font-nantes text-ink-black mb-3 text-2xl">
                  We show{" "}
                  <span className="text-brand-yellow font-semibold italic">
                    who makes
                  </span>{" "}
                  what you buy.
                </h3>
                <p className="text-body font-graphik text-charcoal leading-relaxed">
                  Watch real reels from real factories. Complete process transparency
                  builds complete commercial trust.
                </p>
              </div>

              {/* iPhone Reel Mockup */}
              <div className="border-ink-black relative mx-auto mt-6 h-60 w-44 overflow-hidden rounded-3xl border-4 bg-black">
                <div className="absolute top-2 left-1/2 z-30 h-3 w-14 -translate-x-1/2 rounded-full bg-white/20" />
                <div className="relative h-full w-full">
                  <Image
                    src="/machine_work.png"
                    alt="Reel Screen"
                    fill
                    className="object-cover opacity-90 brightness-95"
                    sizes="180px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-105">
                      <Play className="h-4 w-4 fill-white text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 text-left">
                    <span className="bg-brand-yellow-dark text-ink-black font-graphik rounded px-1.5 py-0.5 text-[8px] font-medium tracking-wide uppercase">
                      100% Verified
                    </span>
                    <p className="font-graphik mt-1 text-[10px] font-semibold text-white">
                      Precision machining process.
                    </p>
                  </div>
                  <div className="absolute right-2 bottom-3 flex flex-col items-center gap-2 text-white/90">
                    <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                    <MessageCircle className="h-3.5 w-3.5" />
                    <Share2 className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Import data */}
            <div className="bg-cream-paper border-ash group relative flex h-full min-h-[520px] flex-col justify-between border p-8">
              <div>
                <h3 className="font-nantes text-ink-black mb-3 text-2xl">
                  We turn import data into{" "}
                  <span className="text-brand-blue font-semibold italic">
                    Indian opportunities
                  </span>
                  .
                </h3>
                <p className="text-body font-graphik text-charcoal leading-relaxed">
                  Our system highlights the top imported products India needs — routing
                  that demand to local makers.
                </p>
              </div>

              {/* Import Chart Graphic */}
              <div className="my-6 flex w-full flex-col items-center">
                <svg className="text-brand-blue h-32 w-full" viewBox="0 0 200 80">
                  <defs>
                    <linearGradient id="grad-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#D8D365" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#D8D365" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 10 70 Q 40 50 70 60 T 130 30 T 190 10 L 190 70 L 10 70 Z"
                    fill="url(#grad-blue)"
                  />
                  <path
                    d="M 10 70 Q 40 50 70 60 T 130 30 T 190 10"
                    fill="none"
                    stroke="#D8D365"
                    strokeWidth="2"
                  />
                  <circle
                    cx="130"
                    cy="30"
                    r="3"
                    fill="#ffffff"
                    stroke="#D8D365"
                    strokeWidth="1.5"
                  />
                  <circle cx="190" cy="10" r="3" fill="#E6F082" />
                </svg>
                <span className="text-charcoal font-graphik mt-3 block text-center text-[10px] tracking-widest uppercase">
                  Top Import Segments: Toys, Electronics, Spares
                </span>
              </div>

              <Button
                asChild
                variant="outline"
                className="border-ash text-ink-black hover:bg-ash/10 font-graphik h-11 w-full rounded-none bg-transparent text-[10px] tracking-[0.05em] uppercase"
              >
                <Link href="/discover?import_gap=true">Explore Import Gaps</Link>
              </Button>
            </div>

            {/* Card 3: Innovation */}
            <div className="bg-cream-paper border-ash group relative flex h-full min-h-[520px] flex-col justify-between border p-8">
              <div>
                <h3 className="font-nantes text-ink-black mb-3 text-2xl">
                  We promote{" "}
                  <span className="text-brand-yellow font-semibold italic">
                    innovation
                  </span>
                  , not replication.
                </h3>
                <p className="text-body font-graphik text-charcoal leading-relaxed">
                  Encouraging Indian makers to redesign and upgrade — securing better
                  materials and larger export margins.
                </p>
              </div>

              {/* Speaker rendering illustration */}
              <div className="relative mx-auto my-6 flex h-40 w-40 items-center justify-center">
                <div className="bg-ink-black border-ash flex h-32 w-24 flex-col items-center justify-between border p-2">
                  <div className="relative flex h-20 w-full flex-col items-center justify-center overflow-hidden border border-neutral-800 bg-neutral-900">
                    <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px] opacity-10" />
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-black">
                      <div className="bg-brand-yellow-dark h-4.5 w-4.5 rounded-full" />
                    </div>
                  </div>
                  <div className="bg-pure-white border-ash text-charcoal font-graphik flex h-6 w-full items-center justify-between border-t px-2 text-[7px]">
                    <span>DESIGN #042</span>
                    <div className="bg-brand-yellow h-1.5 w-1.5 rounded-full" />
                  </div>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="border-ash text-ink-black hover:bg-ash/10 font-graphik h-11 w-full rounded-none bg-transparent text-[10px] tracking-[0.05em] uppercase"
              >
                <Link href="/discover?innovations=true">Discover Innovations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Community — interactive split grid */}
      <section className="border-ash bg-pure-white border-b px-6 py-20 sm:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-left">
            <span className="text-caption font-graphik text-smoke mb-4 block tracking-[0.2em] uppercase">
              Our Community
            </span>
            <h2 className="font-nantes text-ink-black max-w-xl text-4xl sm:text-5xl">
              Built for all Indian stakeholders.
            </h2>
          </div>

          {/* Interactive Split Grid */}
          <div className="grid min-h-[500px] grid-cols-1 items-stretch gap-12 lg:grid-cols-12">
            {/* Left Column: Interactive Menu List */}
            <div className="divide-ash border-ash flex flex-col justify-center divide-y border-t border-b lg:col-span-7">
              {stakeholdersList.map((s, idx) => {
                const isActive = idx === activeStakeholder;
                return (
                  <div key={s.name} className="flex flex-col">
                    <button
                      onMouseEnter={() => setActiveStakeholder(idx)}
                      onClick={() => setActiveStakeholder(idx)}
                      className="group flex w-full cursor-pointer items-center justify-between py-6 text-left transition-colors duration-300 focus:outline-none"
                    >
                      <div className="flex items-center gap-6">
                        <span
                          className={`font-mono text-xs transition-colors duration-300 ${
                            isActive ? "text-brand-yellow font-semibold" : "text-smoke"
                          }`}
                        >
                          {s.index}
                        </span>
                        <span
                          className={`font-nantes text-2xl transition-colors duration-300 sm:text-3xl ${
                            isActive
                              ? "text-brand-yellow translate-x-1 font-medium italic"
                              : "text-ink-black"
                          }`}
                        >
                          {s.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Active Indicator Line */}
                        <div
                          className={`bg-brand-yellow hidden h-[1px] transition-all duration-500 md:block ${
                            isActive ? "w-24 opacity-100" : "w-0 opacity-0"
                          }`}
                        />
                        <div
                          className={`flex h-8 w-8 items-center justify-center border transition-all duration-300 ${
                            isActive
                              ? "bg-brand-yellow border-brand-yellow text-ink-black rotate-45"
                              : "border-ash text-smoke group-hover:text-ink-black group-hover:border-ink-black"
                          }`}
                        >
                          <ArrowRight
                            className={`h-4 w-4 transition-transform duration-300 ${isActive ? "-rotate-45" : ""}`}
                          />
                        </div>
                      </div>
                    </button>

                    {/* Mobile-only Collapsible Detail Panel */}
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out lg:hidden ${
                        isActive
                          ? "max-h-[500px] pb-6 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="border-ash bg-cream-paper flex flex-col gap-4 border p-4">
                        <div className="border-ash bg-pure-white relative aspect-[4/3] w-full overflow-hidden border">
                          <Image
                            src={s.image}
                            alt={s.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 400px"
                          />
                        </div>
                        <div>
                          <h4 className="font-nantes text-ink-black mb-2 text-xl">
                            For {s.name}
                          </h4>
                          <p className="font-graphik text-charcoal text-sm leading-relaxed">
                            {s.copy}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Image & Details Showcase */}
            <div className="border-ash bg-cream-paper relative hidden flex-col justify-between border p-6 lg:col-span-5 lg:flex">
              <div className="border-ash bg-pure-white relative mb-6 aspect-[4/3] w-full overflow-hidden border">
                {stakeholdersList.map((s, idx) => (
                  <div
                    key={s.name}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      idx === activeStakeholder
                        ? "pointer-events-auto scale-100 opacity-100"
                        : "pointer-events-none scale-95 opacity-0"
                    }`}
                  >
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 400px"
                    />
                    {/* Subtle color highlight overlay */}
                    <div className="bg-brand-yellow/5 absolute inset-0" />
                  </div>
                ))}
              </div>

              {/* Content description area with fade-in */}
              <div className="flex min-h-[140px] flex-1 flex-col justify-end">
                {stakeholdersList.map((s, idx) => {
                  if (idx !== activeStakeholder) return null;
                  return (
                    <div
                      key={s.name}
                      className="animate-[fade-in_0.5s_ease-out_forwards]"
                    >
                      <h3 className="font-nantes text-ink-black mb-3 text-2xl">
                        For {s.name}
                      </h3>
                      <p className="text-body font-graphik text-charcoal leading-relaxed">
                        {s.copy}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats & Impact Section */}
      <section className="border-ash bg-pure-white border-b px-6 py-20 sm:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left side stats grid */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:col-span-7">
              {stats.map((stat) => (
                <div key={stat.label} className="border-ash border-l pl-6">
                  <p className="font-nantes text-brand-yellow text-4xl font-normal sm:text-5xl">
                    {stat.value}
                  </p>
                  <p className="text-caption font-graphik text-smoke mt-2 tracking-wider uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Right side Goal callout */}
            <div className="lg:col-span-5">
              <div className="bg-cream-paper border-ash border p-8 sm:p-10">
                <span className="text-caption font-graphik text-brand-blue mb-3 block font-medium tracking-widest uppercase">
                  The Mission
                </span>
                <h3 className="font-nantes text-ink-black mb-4 text-2xl">
                  10 million Indian businesses by 2030.
                </h3>
                <p className="text-body font-graphik text-charcoal leading-relaxed">
                  To build the most trusted direct-discovery commerce engine for Indian
                  manufacturing — helping local factories grow, create jobs, and access
                  the global market.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Certification Row */}
      <section className="border-ash border-b px-6 py-16 sm:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 text-center">
          <div className="flex flex-col gap-4">
            <span className="text-smoke font-graphik text-[10px] font-medium tracking-[0.25em] uppercase">
              Institutional validation
            </span>
            <div className="flex flex-wrap items-center justify-center gap-10 opacity-90 sm:gap-20">
              <span className="font-graphik text-brand-blue text-lg font-semibold tracking-tighter">
                sidbi
              </span>
              <span className="font-graphik text-lg font-semibold tracking-tighter text-red-700">
                NSIC
              </span>
              <span className="font-graphik text-base font-medium tracking-wide text-neutral-800 uppercase">
                DPIIT
              </span>
              <span className="font-graphik border border-neutral-800 px-3 py-1.5 text-xs font-medium tracking-widest text-neutral-800 uppercase">
                MAKE IN INDIA
              </span>
            </div>
          </div>

          {/* Minimal Testimonial Card */}
          <div className="border-ash bg-pure-white mx-auto flex max-w-2xl flex-col items-center border p-8 sm:p-10">
            <div className="text-brand-yellow-dark mb-5 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="fill-brand-yellow-dark text-brand-yellow-dark h-4 w-4"
                />
              ))}
            </div>
            <blockquote className="font-nantes text-ink-black mb-6 text-center text-xl leading-relaxed italic">
              &ldquo;GenZ is not just a commercial platform, it&apos;s a movement to
              bring our manufacturing roots back to life.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="border-ash bg-cream-paper relative h-9 w-9 overflow-hidden rounded-full border">
                <Image
                  src="/founder.jpeg"
                  alt="Founder"
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              </div>
              <div className="text-left">
                <h4 className="text-caption font-graphik text-ink-black font-medium">
                  Appala Sairam
                </h4>
                <p className="text-smoke font-graphik text-[10px]">
                  Founder &amp; Delivery Partner, GenZ
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
