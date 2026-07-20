"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Play, Star, ArrowRight } from "lucide-react";
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
    image: "/investors.png",
    copy: "Verified manufacturer listings and regional innovation clusters worth backing. Gain access to transparent manufacturing metrics, production capacity data, and growth indicators.",
  },
];

const pillars = [
  {
    index: "01",
    title: "Trust Layer",
    copy: "GST verification, factory validation and certification checks run on every seller before they ever list a product.",
    featured: true,
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

const marqueeLogos = ["sidbi", "NSIC", "DPIIT", "MAKE IN INDIA"];

export default function HomePage() {
  const [activeStakeholder, setActiveStakeholder] = useState(0);

  return (
    <main className="bg-cream-paper text-ink-black flex-1 font-sans antialiased">
      <section className="border-ash relative w-full overflow-hidden border-b">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-12">
          <div className="relative z-10 flex flex-col justify-center gap-8 px-6 py-16 sm:px-12 sm:py-20 lg:col-span-6 lg:py-0">
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
              GenZ connects Indian consumers directly with verified Indian manufacturers
              — trading imported guesswork for factory-validated trust.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <Button
                asChild
                size="lg"
                className="bg-brand-yellow hover:bg-brand-yellow-hover font-graphik h-12 rounded-none border-none px-6 text-xs font-semibold tracking-[0.05em] text-black uppercase transition-colors"
              >
                <Link href="/discover">Explore products</Link>
              </Button>
              <Link
                href="/signup/manufacturer"
                className="group text-body font-graphik text-ink-black decoration-ash inline-flex items-center gap-1.5 font-medium underline underline-offset-4 transition-all hover:decoration-current"
              >
                For manufacturers
                <ArrowUpRight className="text-brand-yellow h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          {/* Image column — full bleed, diagonal cut against the text column, with an overlapping metric card */}
          <div className="relative min-h-[420px] lg:col-span-6 lg:min-h-[720px]">
            <div
              className="absolute inset-0 hidden lg:block"
              style={{ clipPath: "polygon(6% 0, 100% 0, 100% 100%, 0 100%)" }}
            >
              <Image
                src="/hero_background.png"
                alt="GenZ Toy Manufacturing Workshop"
                fill
                priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </div>
            <div className="absolute inset-0 lg:hidden">
              <Image
                src="/hero_background.png"
                alt="GenZ Toy Manufacturing Workshop"
                fill
                priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS — broken grid, one featured pillar, staggered offsets */}
      <section className="border-ash border-b px-6 py-20 sm:px-12 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-xl">
              <span className="text-caption font-graphik text-smoke mb-4 block tracking-[0.2em] uppercase">
                Foundations of Trust
              </span>
              <h2 className="font-nantes text-ink-black text-4xl sm:text-5xl">
                The pillars that build direct commerce.
              </h2>
            </div>
            <p className="font-graphik text-charcoal max-w-xs text-sm leading-relaxed lg:text-right">
              Five commitments, running underneath every listing, every reel, every
              transaction.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className={`border-ash bg-pure-white relative overflow-hidden border p-8 md:p-10 ${
                  pillar.featured ? "lg:col-span-2 lg:p-12" : "lg:col-span-1"
                }`}
              >
                <div className="relative">
                  <h3
                    className={`font-nantes text-ink-black mb-3 font-normal ${
                      pillar.featured ? "text-3xl" : "text-xl"
                    }`}
                  >
                    {pillar.title}
                  </h3>
                  <p
                    className={`text-body font-graphik text-charcoal leading-relaxed ${
                      pillar.featured ? "max-w-xl" : ""
                    }`}
                  >
                    {pillar.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT MAKES US DIFFERENT — bento: one lead card + two stacked */}
      <section className="border-ash bg-pure-white border-b px-6 py-20 sm:px-12 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-16 max-w-xl">
            <span className="text-caption font-graphik text-smoke mb-4 block tracking-[0.2em] uppercase">
              Differentiation
            </span>
            <h2 className="font-nantes text-ink-black text-4xl sm:text-5xl">
              How GenZ changes the game.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-cream-paper border-ash flex flex-col justify-between gap-6 border p-8">
              <div>
                <h3 className="font-nantes text-ink-black mb-3 text-xl">
                  We show{" "}
                  <span className="text-brand-yellow font-semibold italic">
                    who makes
                  </span>{" "}
                  what you buy.
                </h3>
                <p className="text-body font-graphik text-charcoal text-sm leading-relaxed">
                  Watch real reels from real factories. Complete process transparency
                  builds complete commercial trust.
                </p>
              </div>

              <div className="border-ink-black relative mx-auto h-40 w-28 shrink-0 overflow-hidden rounded-2xl border-4 bg-black">
                <div className="absolute top-1 left-1/2 z-30 h-2 w-10 -translate-x-1/2 rounded-full bg-white/20" />
                <div className="relative h-full w-full">
                  <Image
                    src="/machine_work.png"
                    alt="Reel Screen"
                    fill
                    className="object-cover opacity-90 brightness-95"
                    sizes="120px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm">
                      <Play className="h-3 w-3 fill-white text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 text-left">
                    <span className="bg-brand-yellow-dark text-ink-black font-graphik rounded px-1 py-0.5 text-[6px] font-medium tracking-wide uppercase">
                      100% Verified
                    </span>
                  </div>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="border-ash text-ink-black hover:bg-ash/10 font-graphik h-11 w-full shrink-0 rounded-none bg-transparent text-[10px] tracking-[0.05em] uppercase"
              >
                <Link href="/discover">Watch reels</Link>
              </Button>
            </div>

            <div className="bg-cream-paper border-ash flex flex-col justify-between gap-6 border p-8">
              <div>
                <h3 className="font-nantes text-ink-black mb-3 text-xl">
                  Import data becomes{" "}
                  <span className="text-brand-blue font-semibold italic">
                    Indian opportunity
                  </span>
                  .
                </h3>
                <p className="text-body font-graphik text-charcoal text-sm leading-relaxed">
                  Our system highlights the top imported products India needs — routing
                  that demand to local makers.
                </p>
              </div>

              <div className="flex h-40 w-full shrink-0 items-center justify-center">
                <svg className="text-brand-blue h-20 w-full" viewBox="0 0 200 80">
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
              </div>

              <Button
                asChild
                variant="outline"
                className="border-ash text-ink-black hover:bg-ash/10 font-graphik h-11 w-full shrink-0 rounded-none bg-transparent text-[10px] tracking-[0.05em] uppercase"
              >
                <Link href="/discover?import_gap=true">Explore gaps</Link>
              </Button>
            </div>

            <div className="bg-cream-paper border-ash flex flex-col justify-between gap-6 border p-8">
              <div>
                <h3 className="font-nantes text-ink-black mb-3 text-xl">
                  We promote{" "}
                  <span className="text-brand-yellow font-semibold italic">
                    innovation
                  </span>
                  , not replication.
                </h3>
                <p className="text-body font-graphik text-charcoal text-sm leading-relaxed">
                  Encouraging Indian makers to redesign and upgrade — securing better
                  materials and larger export margins.
                </p>
              </div>

              <div className="flex h-40 w-full shrink-0 items-center justify-center">
                <div className="bg-ink-black border-ash flex h-24 w-18 flex-col items-center justify-between border p-2">
                  <div className="relative flex h-12 w-full flex-col items-center justify-center overflow-hidden border border-neutral-800 bg-neutral-900">
                    <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px] opacity-10" />
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-700 bg-black">
                      <div className="bg-brand-yellow-dark h-2 w-2 rounded-full" />
                    </div>
                  </div>
                  <div className="bg-pure-white border-ash text-charcoal font-graphik flex h-4 w-full items-center justify-between border-t px-2 text-[5px]">
                    <span>DESIGN #042</span>
                    <div className="bg-brand-yellow h-1 w-1 rounded-full" />
                  </div>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="border-ash text-ink-black hover:bg-ash/10 font-graphik h-11 w-full shrink-0 rounded-none bg-transparent text-[10px] tracking-[0.05em] uppercase"
              >
                <Link href="/discover?innovations=true">See designs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY — image bleeds behind the list, watermark numeral */}
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

      {/* STATS — unified bento with mission card folded into the same grid */}
      <section className="border-ash bg-pure-white border-b px-6 py-20 sm:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className="border-ash bg-cream-paper border p-8">
                <p className="font-nantes text-brand-yellow text-5xl font-normal sm:text-6xl">
                  {stat.value}
                </p>
                <p className="text-caption font-graphik text-smoke mt-3 tracking-wider uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Mission strip runs full-width beneath the stat row instead of sitting beside it */}
          <div className="border-ash bg-ink-black text-pure-white mt-px flex flex-col gap-6 border border-t-0 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="text-caption font-graphik text-brand-yellow mb-3 block font-medium tracking-widest uppercase">
                The Mission
              </span>
              <h3 className="font-nantes mb-2 text-2xl sm:text-3xl">
                10 million Indian businesses by 2030.
              </h3>
              <p className="text-body font-graphik text-pure-white/70 leading-relaxed">
                Building the most trusted direct-discovery commerce engine for Indian
                manufacturing.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-brand-yellow hover:bg-brand-yellow-hover font-graphik h-12 shrink-0 rounded-none border-none px-6 text-xs font-semibold tracking-[0.05em] text-black uppercase transition-colors"
            >
              <Link href="/about">Read the vision</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TRUST — full-width pull-quote first, marquee logo strip underneath */}
      <section className="border-ash border-b px-6 py-16 sm:px-12">
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
            <div className="border-ash bg-cream-paper relative h-10 w-10 overflow-hidden rounded-full border">
              <Image
                src="/founder.jpeg"
                alt="Founder"
                fill
                className="object-cover"
                sizes="40px"
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

        <div className="border-ash bg-cream-paper mx-auto mt-14 flex max-w-7xl flex-wrap items-center justify-between gap-8 border px-8 py-6">
          <span className="text-smoke font-graphik shrink-0 text-[10px] font-medium tracking-[0.25em] uppercase">
            Institutional validation
          </span>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-10 sm:gap-16">
            {marqueeLogos.map((logo) =>
              logo === "MAKE IN INDIA" ? (
                <span
                  key={logo}
                  className="font-graphik border border-neutral-800 px-3 py-1.5 text-xs font-medium tracking-widest text-neutral-800 uppercase"
                >
                  {logo}
                </span>
              ) : (
                <span
                  key={logo}
                  className={`font-graphik text-lg font-semibold tracking-tighter ${
                    logo === "sidbi"
                      ? "text-brand-blue"
                      : logo === "NSIC"
                        ? "text-red-700"
                        : "text-base font-medium tracking-wide text-neutral-800 uppercase"
                  }`}
                >
                  {logo}
                </span>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
