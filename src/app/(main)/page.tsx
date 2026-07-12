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
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const stakeholdersList = [
  {
    index: "01",
    name: "Consumers",
    image: "/consumers.jpeg",
    copy: "Trusted, high-quality Indian products, straight from the source. We connect you directly to the factory floor, ensuring verified quality and competitive pricing without middleman markups."
  },
  {
    index: "02",
    name: "Manufacturers",
    image: "/manufacturers.jpeg",
    copy: "Visibility, market demand insights, and a direct line to national buyers. We help you digitize your profile, showcase catalogs, and build lasting business relationships."
  },
  {
    index: "03",
    name: "Startups",
    image: "/startups.jpeg",
    copy: "Reliable manufacturing partners for products that don't exist yet. Discover local fabricators, request custom quotes, and turn prototypes into physical products."
  },
  {
    index: "04",
    name: "Creators",
    image: "/creators.jpeg",
    copy: "A stage to showcase process, not just the finished product. Share factory reels, tell your brand story, and build direct emotional and commercial trust with buyers."
  },
  {
    index: "05",
    name: "Investors",
    image: "/india_glow_map.png",
    copy: "Verified manufacturer listings and regional innovation clusters worth backing. Gain access to transparent manufacturing metrics, production capacity data, and growth indicators."
  }
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
    <main className="flex-1 bg-cream-paper font-sans text-ink-black antialiased">
      <section className="relative border-b border-ash px-6 pt-14 pb-0 sm:px-12">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
          {/* Left: masthead-style editorial headline */}
          <div className="flex flex-col justify-center lg:col-span-6 lg:pr-8 lg:pb-24">
            <span className="mb-6 block text-caption font-graphik uppercase tracking-[0.28em] text-smoke">
              Made in India
            </span>
            <h1 className="font-nantes text-5xl leading-[0.98] tracking-tight text-ink-black sm:text-6xl lg:text-[4.6rem]">
              From import
              <br />
              dependency to{" "}
              <span className="relative inline-block italic">
                opportunity
                <svg
                  className="absolute -bottom-2 left-0 h-2 w-full text-gold-yellow"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <rect width="100" height="8" fill="currentColor" />
                </svg>
              </span>
              .
            </h1>
            <p className="mt-8 max-w-md text-body font-graphik leading-relaxed text-charcoal">
              GenZ connects Indian consumers directly with verified Indian manufacturers —
              trading imported guesswork for factory-validated trust.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Button asChild size="lg" className="bg-forest-green hover:bg-forest-mid text-white rounded-none font-graphik text-xs font-normal tracking-[0.05em] uppercase h-12 px-6 border-none">
                <Link href="/discover">Explore products</Link>
              </Button>
              <Link
                href="/signup/manufacturer"
                className="group inline-flex items-center gap-1.5 text-body font-graphik text-ink-black underline decoration-ash underline-offset-4 hover:decoration-ink-black"
              >
                For manufacturers
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-ash pt-8">
              {[
                "100% verified manufacturers",
                "No imports, no fake resellers",
                "GST & factory validated",
                "Built for India, by India",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-green" />
                  <dd className="text-caption font-graphik leading-snug text-charcoal">{item}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: full-bleed photography */}
          <div className="relative -mx-6 lg:col-span-6 lg:mx-0">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-forest-green sm:aspect-[3/4] lg:aspect-auto lg:h-[640px]">
              <Image
                src="/india_glow_map.png"
                alt="Map of India"
                fill
                priority
                className="object-contain opacity-40 p-10"
              />
              <div className="absolute left-8 top-8 z-10">
                <p className="text-caption font-graphik uppercase tracking-[0.3em] text-white/70">Made in</p>
                <p className="font-nantes text-3xl italic text-white">India</p>
              </div>

              <div className="absolute bottom-8 left-8 right-8 z-10 hidden sm:block">
                <div className="h-px w-full bg-white/15" />
                <p className="mt-4 max-w-xs text-caption font-graphik text-white/60">
                  Play Desi. Be Desi. Proudly Desi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars — list/grid hybrids with lines */}
      <section className="border-b border-ash px-6 py-20 sm:px-12 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-14 max-w-xl">
            <span className="text-caption font-graphik uppercase tracking-[0.2em] text-smoke block mb-4">
              Foundations of Trust
            </span>
            <h2 className="font-nantes text-4xl sm:text-5xl text-ink-black">
              The pillars that build direct commerce.
            </h2>
          </div>

          <div className="grid grid-cols-1 divide-y divide-ash lg:grid-cols-5 lg:divide-y-0 lg:divide-x divide-ash border-y border-ash">
            {pillars.map((pillar) => (
              <div key={pillar.index} className="py-8 lg:px-6 lg:py-12 first:pl-0 last:pr-0 flex flex-col justify-between min-h-[220px]">
                <div>
                  <span className="block text-caption font-graphik text-brand-blue tracking-[0.1em] font-medium mb-3">
                    {pillar.index}
                  </span>
                  <h3 className="font-nantes text-xl font-normal text-ink-black mb-3">
                    {pillar.title}
                  </h3>
                </div>
                <p className="text-body font-graphik leading-relaxed text-charcoal">
                  {pillar.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="border-b border-ash px-6 py-20 sm:px-12 md:py-28 bg-pure-white">
        <div className="mx-auto max-w-[1280px]">
          <div className="text-center mb-16">
            <span className="text-caption font-graphik uppercase tracking-[0.2em] text-smoke block mb-4">
              Differentiation
            </span>
            <h2 className="font-nantes text-4xl sm:text-5xl text-ink-black">
              How GenZ changes the game.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Card 1: Video Reels */}
            <div className="bg-cream-paper border border-ash p-8 flex flex-col justify-between h-full min-h-[520px] relative group">
              <div>
                <h3 className="font-nantes text-2xl text-ink-black mb-3">
                  We show <span className="italic text-forest-green font-semibold">who makes</span> what you buy.
                </h3>
                <p className="text-body font-graphik text-charcoal leading-relaxed">
                  Watch real reels from real factories. Complete process transparency builds complete commercial trust.
                </p>
              </div>

              {/* iPhone Reel Mockup */}
              <div className="relative w-44 h-60 mx-auto border-4 border-ink-black bg-black rounded-3xl overflow-hidden mt-6">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-3 bg-white/20 rounded-full z-30" />
                <div className="relative w-full h-full">
                  <Image
                    src="/machine_work.png"
                    alt="Reel Screen"
                    fill
                    className="object-cover brightness-95 opacity-90"
                    sizes="180px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-10 w-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Play className="h-4 w-4 text-white fill-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 text-left">
                    <span className="text-[8px] bg-gold-yellow text-ink-black font-graphik font-medium px-1.5 py-0.5 rounded tracking-wide uppercase">
                      100% Verified
                    </span>
                    <p className="text-[10px] font-graphik font-semibold mt-1 text-white">Precision machining process.</p>
                  </div>
                  <div className="absolute bottom-3 right-2 flex flex-col gap-2 items-center text-white/90">
                    <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                    <MessageCircle className="h-3.5 w-3.5" />
                    <Share2 className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Import data */}
            <div className="bg-cream-paper border border-ash p-8 flex flex-col justify-between h-full min-h-[520px] relative group">
              <div>
                <h3 className="font-nantes text-2xl text-ink-black mb-3">
                  We turn import data into <span className="italic text-brand-blue font-semibold">Indian opportunities</span>.
                </h3>
                <p className="text-body font-graphik text-charcoal leading-relaxed">
                  Our system highlights the top imported products India needs — routing that demand to local makers.
                </p>
              </div>

              {/* Import Chart Graphic */}
              <div className="w-full flex flex-col items-center my-6">
                <svg className="w-full h-32 text-brand-blue" viewBox="0 0 200 80">
                  <defs>
                    <linearGradient id="grad-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0f4c81" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#0f4c81" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 10 70 Q 40 50 70 60 T 130 30 T 190 10 L 190 70 L 10 70 Z"
                    fill="url(#grad-blue)"
                  />
                  <path
                    d="M 10 70 Q 40 50 70 60 T 130 30 T 190 10"
                    fill="none"
                    stroke="#0f4c81"
                    strokeWidth="2"
                  />
                  <circle cx="130" cy="30" r="3" fill="#ffffff" stroke="#0f4c81" strokeWidth="1.5" />
                  <circle cx="190" cy="10" r="3" fill="#ffda58" />
                </svg>
                <span className="text-[10px] text-charcoal uppercase tracking-widest font-graphik mt-3 block text-center">
                  Top Import Segments: Toys, Electronics, Spares
                </span>
              </div>

              <Button asChild variant="outline" className="border-ash text-ink-black hover:bg-ash/10 w-full rounded-none h-11 uppercase text-[10px] font-graphik tracking-[0.05em] bg-transparent">
                <Link href="/discover?import_gap=true">Explore Import Gaps</Link>
              </Button>
            </div>

            {/* Card 3: Innovation */}
            <div className="bg-cream-paper border border-ash p-8 flex flex-col justify-between h-full min-h-[520px] relative group">
              <div>
                <h3 className="font-nantes text-2xl text-ink-black mb-3">
                  We promote <span className="italic text-forest-green font-semibold">innovation</span>, not replication.
                </h3>
                <p className="text-body font-graphik text-charcoal leading-relaxed">
                  Encouraging Indian makers to redesign and upgrade — securing better materials and larger export margins.
                </p>
              </div>

              {/* Speaker rendering illustration */}
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center my-6">
                <div className="w-24 h-32 bg-ink-black border border-ash p-2 flex flex-col items-center justify-between">
                  <div className="w-full h-20 bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px]" />
                    <div className="h-8 w-8 rounded-full border border-neutral-700 bg-black flex items-center justify-center">
                      <div className="h-4.5 w-4.5 rounded-full bg-gold-yellow" />
                    </div>
                  </div>
                  <div className="w-full h-6 bg-pure-white border-t border-ash flex items-center justify-between px-2 text-[7px] text-charcoal font-graphik">
                    <span>DESIGN #042</span>
                    <div className="h-1.5 w-1.5 bg-forest-green rounded-full" />
                  </div>
                </div>
              </div>

              <Button asChild variant="outline" className="border-ash text-ink-black hover:bg-ash/10 w-full rounded-none h-11 uppercase text-[10px] font-graphik tracking-[0.05em] bg-transparent">
                <Link href="/discover?innovations=true">Discover Innovations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Community — interactive split grid */}
      <section className="border-b border-ash px-6 py-20 sm:px-12 md:py-28 bg-pure-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-left">
            <span className="text-caption font-graphik uppercase tracking-[0.2em] text-smoke block mb-4">
              Our Community
            </span>
            <h2 className="font-nantes text-4xl sm:text-5xl text-ink-black max-w-xl">
              Built for all Indian stakeholders.
            </h2>
          </div>

          {/* Interactive Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch min-h-[500px]">

            {/* Left Column: Interactive Menu List */}
            <div className="lg:col-span-7 flex flex-col justify-center divide-y divide-ash border-t border-b border-ash">
              {stakeholdersList.map((s, idx) => {
                const isActive = idx === activeStakeholder;
                return (
                  <div key={s.name} className="flex flex-col">
                    <button
                      onMouseEnter={() => setActiveStakeholder(idx)}
                      onClick={() => setActiveStakeholder(idx)}
                      className="w-full text-left py-6 flex items-center justify-between group cursor-pointer focus:outline-none transition-colors duration-300"
                    >
                      <div className="flex items-center gap-6">
                        <span
                          className={`font-mono text-xs transition-colors duration-300 ${
                            isActive ? "text-forest-green font-semibold" : "text-smoke"
                          }`}
                        >
                          {s.index}
                        </span>
                        <span
                          className={`font-nantes text-2xl sm:text-3xl transition-colors duration-300 ${
                            isActive ? "text-forest-green italic font-medium translate-x-1" : "text-ink-black"
                          }`}
                        >
                          {s.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Active Indicator Line */}
                        <div
                          className={`h-[1px] bg-forest-green transition-all duration-500 hidden md:block ${
                            isActive ? "w-24 opacity-100" : "w-0 opacity-0"
                          }`}
                        />
                        <div
                          className={`h-8 w-8 flex items-center justify-center border transition-all duration-300 ${
                            isActive
                              ? "bg-forest-green border-forest-green text-gold-yellow rotate-45"
                              : "border-ash text-smoke group-hover:text-ink-black group-hover:border-ink-black"
                          }`}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </button>

                    {/* Mobile-only Collapsible Detail Panel */}
                    <div
                      className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
                        isActive ? "max-h-[500px] opacity-100 pb-6" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="border border-ash bg-cream-paper p-4 flex flex-col gap-4">
                        <div className="relative aspect-[4/3] w-full overflow-hidden border border-ash bg-pure-white">
                          <Image
                            src={s.image}
                            alt={s.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 400px"
                          />
                        </div>
                        <div>
                          <h4 className="font-nantes text-xl text-ink-black mb-2">For {s.name}</h4>
                          <p className="text-sm font-graphik leading-relaxed text-charcoal">{s.copy}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Image & Details Showcase */}
            <div className="hidden lg:flex lg:col-span-5 flex-col justify-between border border-ash bg-cream-paper p-6 relative">
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-ash bg-pure-white mb-6">
                {stakeholdersList.map((s, idx) => (
                  <div
                    key={s.name}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      idx === activeStakeholder
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 scale-95 pointer-events-none"
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
                    <div className="absolute inset-0 bg-forest-green/5" />
                  </div>
                ))}
              </div>

              {/* Content description area with fade-in */}
              <div className="flex-1 flex flex-col justify-end min-h-[140px]">
                {stakeholdersList.map((s, idx) => {
                  if (idx !== activeStakeholder) return null;
                  return (
                    <div key={s.name} className="animate-[fade-in_0.5s_ease-out_forwards]">
                      <h3 className="font-nantes text-2xl text-ink-black mb-3">
                        For {s.name}
                      </h3>
                      <p className="text-body font-graphik leading-relaxed text-charcoal">
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
      <section className="border-b border-ash px-6 py-20 sm:px-12 md:py-28 bg-pure-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left side stats grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
              {stats.map((stat) => (
                <div key={stat.label} className="border-l border-ash pl-6">
                  <p className="text-4xl sm:text-5xl font-nantes text-forest-green font-normal">
                    {stat.value}
                  </p>
                  <p className="text-caption font-graphik uppercase tracking-wider text-smoke mt-2">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Right side Goal callout */}
            <div className="lg:col-span-5">
              <div className="bg-cream-paper border border-ash p-8 sm:p-10">
                <span className="text-caption font-graphik text-brand-blue uppercase tracking-widest block mb-3 font-medium">
                  The Mission
                </span>
                <h3 className="font-nantes text-2xl text-ink-black mb-4">
                  10 million Indian businesses by 2030.
                </h3>
                <p className="text-body font-graphik leading-relaxed text-charcoal">
                  To build the most trusted direct-discovery commerce engine for Indian manufacturing — helping local factories grow, create jobs, and access the global market.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust & Certification Row */}
      <section className="border-b border-ash px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-7xl flex flex-col gap-12 text-center">
          <div className="flex flex-col gap-4">
            <span className="text-[10px] text-smoke uppercase tracking-[0.25em] font-graphik font-medium">
              Institutional validation
            </span>
            <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-20 opacity-90">
              <span className="text-lg font-graphik font-semibold tracking-tighter text-brand-blue">sidbi</span>
              <span className="text-lg font-graphik font-semibold tracking-tighter text-red-700">NSIC</span>
              <span className="text-base font-graphik font-medium tracking-wide text-neutral-800 uppercase">DPIIT</span>
              <span className="text-xs font-graphik font-medium tracking-widest text-neutral-800 uppercase border border-neutral-800 px-3 py-1.5">
                MAKE IN INDIA
              </span>
            </div>
          </div>

          {/* Minimal Testimonial Card */}
          <div className="border border-ash bg-pure-white p-8 sm:p-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="flex gap-1 text-gold-yellow mb-5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-gold-yellow text-gold-yellow" />
              ))}
            </div>
            <blockquote className="font-nantes text-xl text-ink-black italic text-center mb-6 leading-relaxed">
              &ldquo;GenZ is not just a commercial platform, it&apos;s a movement to bring our manufacturing roots back to life.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-ash bg-cream-paper">
                <Image src="/founder.jpeg" alt="Founder" fill className="object-cover" sizes="36px" />
              </div>
              <div className="text-left">
                <h4 className="text-caption font-graphik font-medium text-ink-black">Appala Sairam</h4>
                <p className="text-[10px] text-smoke font-graphik">Founder &amp; Delivery Partner, GenZ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}