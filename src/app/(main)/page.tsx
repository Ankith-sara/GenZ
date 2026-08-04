"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const stakeholdersList = [
  {
    index: "01",
    name: "Consumers",
    image: "/consumers.png",
    copy: "Trusted, high-quality Indian products, straight from the source. We connect you directly to the factory floor, ensuring verified quality and competitive pricing without middleman markups.",
  },
  {
    index: "02",
    name: "Manufacturers",
    image: "/manufacturers.png",
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
  { value: "100+", label: "Verified manufacturers" },
  { value: "1,000+", label: "Products & innovations" },
  { value: "500+", label: "Import gaps identified" },
  { value: "1K+", label: "Jobs & livelihoods" },
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
              Everything Made in India. One Trusted Platform. Discover authentic Indian
              products, innovative technologies, startups, artisans, and brands—all in
              one marketplace.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <Button
                asChild
                size="lg"
                className="bg-brand-yellow hover:bg-brand-yellow-hover font-graphik h-12 rounded-none border-none px-6 text-xs font-semibold tracking-[0.05em] text-black uppercase transition-colors"
              >
                <Link href="/discover">Shop Now</Link>
              </Button>
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
                          className={`font-graphik text-xs transition-colors duration-300 ${
                            isActive ? "text-brand-yellow-dark font-bold" : "text-smoke"
                          }`}
                        >
                          {s.index}
                        </span>
                        <span
                          className={`font-nantes text-2xl transition-colors duration-300 sm:text-3xl ${
                            isActive
                              ? "text-brand-yellow-dark translate-x-1 font-medium italic"
                              : "text-ink-black"
                          }`}
                        >
                          {s.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div
                          className={`bg-brand-yellow-dark hidden h-[1px] transition-all duration-500 md:block ${
                            isActive ? "w-24 opacity-100" : "w-0 opacity-0"
                          }`}
                        />
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
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
                      <div className="border-ash flex flex-col gap-4 rounded-2xl border bg-[#FAF7F0] p-5 shadow-xs">
                        <div className="border-ash bg-cream-paper relative aspect-[4/3] w-full overflow-hidden rounded-xl border">
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
                          <p className="font-graphik text-smoke text-sm leading-relaxed">
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
            <div className="border-ash relative hidden flex-col justify-between rounded-2xl border bg-[#FAF7F0] p-6 shadow-xs lg:col-span-5 lg:flex">
              <div className="border-ash bg-cream-paper relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-xl border">
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
                      <p className="font-graphik text-smoke text-sm leading-relaxed">
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

      {/* STATS & MISSION — Dark Slate Theme Switch Accent */}
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

          {/* Mission strip */}
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

      {/* TRUST — full-width pull-quote first, marquee logo strip underneath */}
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
