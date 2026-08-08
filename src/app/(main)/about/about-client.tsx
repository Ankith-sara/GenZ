"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/atoms/button";
import {
  CheckCircle2,
  Package,
  MapPin,
  ArrowDownLeft,
  ShieldCheck,
  Eye,
  RefreshCw,
  ToyBrick,
} from "lucide-react";

// Scroll Reveal Component
interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Problem & Solution Section (Original Animated Line Component)
// ─────────────────────────────────────────────────────────────────────────────
function ProblemSolutionSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const raw = -rect.top / total;
      setProgress(Math.min(1, Math.max(0, raw)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Accelerated transition math for quick line animation and view switching
  const problemOpacity = Math.min(1, Math.max(0, 1 - progress / 0.25));
  const solutionOpacity = Math.min(1, Math.max(0, (progress - 0.25) / 0.25));
  const isSolution = progress > 0.3;

  const lineCount = 7;
  const centerY = 175;
  const lineSpacing = 42;

  const lines = Array.from({ length: lineCount }, (_, i) => {
    const yStart = centerY + (i - 3) * lineSpacing;
    return {
      id: i,
      d: `M 0,${yStart} L 400,${yStart} C 650,${yStart} 850,${centerY} 1000,${centerY} L 2000,${centerY}`,
    };
  });

  const pathLength = 2300;
  // Quick drawing animation (multiplied speed so lines draw instantly as you scroll)
  const drawProgress = Math.max(0, Math.min(1, progress * 2.2));
  const dashOffset = pathLength * (1 - drawProgress);
  const lineColor = isSolution ? "#FAE251" : "#1C1C1E";

  return (
    <section
      ref={wrapperRef}
      className="section_solution border-ash relative w-full border-b"
      style={{ minHeight: "110vh" }}
    >
      <div
        className="solution-inside sticky top-0 flex h-screen w-full flex-col justify-between overflow-hidden pt-24 pb-2 transition-colors duration-200 sm:pt-28 lg:pt-32"
        style={{
          backgroundColor: isSolution ? "#0B0B0B" : "#FAF7F0",
        }}
      >
        <div className="padding-global is-text relative z-10 mx-auto w-full max-w-[1280px] px-6 sm:px-12">
          <div className="container-medium relative min-h-[160px] max-w-3xl sm:min-h-[190px]">
            {/* Problem View */}
            <div
              className="solution_component is-problem w-full transition-all duration-200 ease-out"
              style={{
                opacity: problemOpacity,
                pointerEvents: problemOpacity > 0.1 ? "auto" : "none",
                position: problemOpacity > 0.1 ? "relative" : "absolute",
                inset: 0,
              }}
            >
              <div className="mb-3 sm:mb-4">
                <div className="tag border-ash inline-block rounded-full border bg-white px-4 py-1 shadow-xs">
                  <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
                    The Problem
                  </span>
                </div>
              </div>
              <h3 className="font-nantes text-ink-black max-w-3xl text-2xl leading-[1.3] font-normal sm:text-3xl lg:text-4xl">
                Fragmented brokers, unverified middlemen, and opaque import channels
                slow intake and hide real Indian factory capacity.
              </h3>
              <p className="font-graphik text-smoke mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
                Legacy sourcing forces buyers to navigate 30-40% broker markups,
                unverified machinery claims, and risky overseas supply chains.
              </p>
            </div>

            {/* Solution & Differentiation View */}
            <div
              className="solution_component is-solution w-full transition-all duration-200 ease-out"
              style={{
                opacity: solutionOpacity,
                pointerEvents: solutionOpacity > 0.1 ? "auto" : "none",
                position: solutionOpacity > 0.1 ? "relative" : "absolute",
                inset: 0,
              }}
            >
              <div className="mb-3 sm:mb-4">
                <div className="tag border-brand-yellow/30 bg-brand-yellow/10 inline-block rounded-full border px-4 py-1 shadow-xs">
                  <span className="font-graphik text-brand-yellow text-xs font-semibold tracking-[0.2em] uppercase">
                    The Solution &amp; Differentiation
                  </span>
                </div>
              </div>
              <h3 className="font-nantes text-pure-white max-w-3xl text-2xl leading-[1.3] font-normal sm:text-3xl lg:text-4xl">
                GenZ replaces opaque middleman chains with one direct platform for real
                factory reels, import gap routing, and design innovation.
              </h3>
              <p className="font-graphik mt-3 max-w-2xl text-sm leading-relaxed text-neutral-300 sm:text-base">
                Complete process transparency builds commercial trust — connecting
                buyers directly to verified Indian sellers without markup stacking.
              </p>
            </div>
          </div>
        </div>

        <div className="solution-lottie-container pointer-events-none z-10 flex w-full items-center justify-center overflow-hidden opacity-90 sm:opacity-100">
          <div className="solution-lottie w-full">
            <svg
              viewBox="0 0 2000 350"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              className="h-[30vh] max-h-[320px] w-full sm:h-[35vh]"
            >
              <g>
                {lines.map((line) => (
                  <path
                    key={line.id}
                    d={line.d}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={pathLength}
                    strokeDashoffset={dashOffset}
                    className="transition-colors duration-200 ease-in-out"
                  />
                ))}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Foundations of Trust Component (Original Sticky Track / Responsive Grid)
// ─────────────────────────────────────────────────────────────────────────────
function FoundationsOfTrustScrollSection() {
  const trustPillars = [
    {
      id: "trust-layer",
      number: "01",
      title: "Trust Layer",
      description:
        "GST verification, factory validation and certification checks run on every seller before they ever list a product.",
      colSpan: "md:col-span-7",
      isHero: true,
      tag: "Core Pillar",
    },
    {
      id: "reels",
      number: "02",
      title: "Reel-Based Discovery",
      description:
        "Real factory reels, not stock photography. You see the process and the people before you see the price.",
      colSpan: "md:col-span-5",
      isHero: false,
    },
    {
      id: "import-gap",
      number: "03",
      title: "Import Gap Intelligence",
      description:
        "We track what India still imports and route that demand toward the sellers who can build it here instead.",
      colSpan: "md:col-span-4",
      isHero: false,
    },
    {
      id: "innovation",
      number: "04",
      title: "Innovation & Design",
      description:
        "Encouraging Indian makers to redesign, not just replicate — better materials, better ergonomics, better margins.",
      colSpan: "md:col-span-4",
      isHero: false,
    },
    {
      id: "direct-access",
      number: "05",
      title: "Direct Market Access",
      description:
        "Sellers reach consumers without a chain of middlemen. No markup stacking, no anonymous resellers.",
      colSpan: "md:col-span-4",
      isHero: false,
    },
  ];

  return (
    <section className="section_trust border-ash border-b bg-white px-6 py-16 sm:px-12 sm:py-24">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="mb-10">
          <div className="tag border-ash mb-3 inline-block rounded-full border bg-[#FAF7F0] px-4 py-1 shadow-xs">
            <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
              Foundations of Trust
            </span>
          </div>
          <h2 className="font-nantes text-ink-black text-2xl font-normal sm:text-3xl lg:text-4xl">
            The pillars that build direct commerce.
          </h2>
        </div>

        {/* Golden Ratio Bento Grid (7:5 Top Row | 4:4:4 Bottom Row) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {trustPillars.map((item) => (
            <div
              key={item.id}
              className={`product-card relative flex flex-col justify-between rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                item.colSpan
              } ${
                item.isHero
                  ? "border-amber-300/80 bg-gradient-to-br from-[#FAF7F0] via-[#FAF7F0] to-amber-50/60 p-7 shadow-xs sm:p-8"
                  : "border-ash bg-[#FAF7F0] p-6 shadow-xs"
              }`}
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-nantes text-brand-yellow-dark text-2xl font-normal sm:text-3xl">
                      {item.number}
                    </span>
                    {item.tag && (
                      <span className="font-graphik rounded-full border border-amber-300 bg-amber-100/70 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 uppercase">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <span className="bg-brand-yellow-dark h-2 w-2 rounded-full" />
                </div>

                <h3
                  className={`font-nantes text-ink-black mb-2.5 leading-snug font-normal ${
                    item.isHero ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                  }`}
                >
                  {item.title}
                </h3>

                <p
                  className={`font-graphik text-smoke leading-relaxed ${
                    item.isHero ? "text-sm sm:text-base" : "text-xs sm:text-sm"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Interactive Strategic Roadmap Component
const roadmapSteps = [
  {
    year: "2026",
    title: "Foundation",
    description:
      "GenZ launches with a primary focus on India's toy manufacturing corridor. We onboard the first 100+ verified makers with GST verification, factory process reels, and direct B2C listings without broker markups.",
  },
  {
    year: "2027",
    title: "Sector Expansion",
    description:
      "Expanding across major industrial sectors including STEM toys, artisan woodcraft, plastic molding, and hardware MSMEs across top Indian manufacturing hubs.",
  },
  {
    year: "2028",
    title: "Import Gap",
    description:
      "Deploying automated import gap intelligence and AI-matched B2C sourcing tools to identify key products India imports and route demand directly to domestic makers.",
  },
  {
    year: "2029",
    title: "Pan-India Manufacturing Network",
    description:
      "Connecting tier-2 and tier-3 industrial hubs across all Indian states into a unified, transparent direct commerce ecosystem.",
  },
  {
    year: "2030",
    title: "India's Trusted Commerce Ecosystem",
    description:
      "Achieving our mission of connecting 10 million Indian businesses, empowering local makers, and establishing self-reliance across critical manufacturing corridors.",
  },
];

function OurStory5Timeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentStep = roadmapSteps[activeIndex];

  return (
    <div className="border-ash relative mx-auto max-w-7xl rounded-3xl border bg-white p-6 shadow-xs sm:p-10">
      {/* Top Header: Strategic Roadmap Tag & Selected Year Title */}
      <div className="mx-auto mb-6 max-w-3xl text-center">
        <div className="tag border-ash mb-3 inline-block rounded-full border bg-[#FAF7F0] px-4 py-1 shadow-xs">
          <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
            Strategic Roadmap
          </span>
        </div>
        <span className="font-nantes text-brand-yellow-dark mt-1 mb-1 block text-2xl font-bold sm:text-3xl">
          {currentStep.year}
        </span>
        <h3 className="font-nantes text-ink-black text-2xl leading-tight font-semibold sm:text-3xl">
          {currentStep.title}
        </h3>
      </div>

      {/* Description Container */}
      <div className="relative mx-auto mb-10 max-w-2xl text-center">
        <p className="font-graphik text-smoke text-sm leading-relaxed sm:text-base">
          {currentStep.description}
        </p>
      </div>

      {/* Bottom Horizontal Timeline Axis (Dots and Line Perfectly Aligned) */}
      <div className="relative mx-auto max-w-2xl pt-4">
        {/* Row 1: Year Text Labels */}
        <div className="mb-2 flex items-center justify-between px-2">
          {roadmapSteps.map((step, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={step.year}
                onClick={() => setActiveIndex(idx)}
                className="group w-14 cursor-pointer text-center focus:outline-none"
              >
                <span
                  className={`font-nantes block text-sm font-bold transition-all duration-300 sm:text-base ${
                    isActive
                      ? "text-ink-black scale-110"
                      : "text-neutral-400 group-hover:text-neutral-700"
                  }`}
                >
                  {step.year}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Timeline Axis & Dots (Guaranteed Vertical Center Alignment) */}
        <div className="relative flex h-8 items-center justify-between px-2">
          {/* Axis Line centered in container */}
          <div className="pointer-events-none absolute top-1/2 right-6 left-6 h-0.5 -translate-y-1/2 bg-neutral-300" />

          {/* Dots centered in container */}
          {roadmapSteps.map((step, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={step.year}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Select year ${step.year}`}
                className="group relative z-10 flex h-8 w-14 cursor-pointer items-center justify-center focus:outline-none"
              >
                <div
                  className={`rounded-full border-2 border-white shadow-xs transition-all duration-300 ${
                    isActive
                      ? "ring-brand-yellow h-5 w-5 scale-110 bg-black ring-4"
                      : "h-4 w-4 bg-neutral-400 group-hover:bg-neutral-600"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main About Client Component
// ─────────────────────────────────────────────────────────────────────────────
export function AboutClient() {
  return (
    <main className="main-wrapper bg-cream-paper text-ink-black font-sans antialiased">
      {/* 1. FOUNDER STORY — Left Image, Right Text Layout */}
      <section className="section_support border-ash border-b bg-[#FAF7F0] pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="padding-global px-6 sm:px-12">
          <div className="container-large mx-auto max-w-[1280px]">
            {/* Section Tag & Heading */}
            <ScrollReveal className="mx-auto mb-12 max-w-3xl text-left sm:text-center">
              <div className="tag bg-brand-yellow mb-4 inline-block rounded-full px-4 py-1.5 text-black shadow-xs">
                <span className="font-graphik text-xs font-semibold tracking-wider uppercase">
                  Founder Story
                </span>
              </div>
              <h1 className="font-nantes text-ink-black text-4xl leading-tight font-normal sm:text-5xl lg:text-6xl">
                Why we built GenZ
              </h1>
              <p className="font-graphik text-smoke mt-3 text-base sm:text-lg">
                Founded by Appala Sairam at age 23 to connect Indian talent directly
                with market opportunity.
              </p>
            </ScrollReveal>

            {/* Left Image — Right Text 2-Column Grid */}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
              {/* LEFT COLUMN: Founder Photo Card */}
              <ScrollReveal delay={100} className="lg:sticky lg:top-28 lg:col-span-5">
                <div className="border-ash overflow-hidden rounded-[24px] border bg-white p-3 shadow-md">
                  <div className="relative overflow-hidden rounded-[18px]">
                    <Image
                      src="/founder.png"
                      alt="Appala Sairam — Founder of GenZ"
                      width={800}
                      height={1200}
                      className="h-[460px] w-full object-cover object-top sm:h-[520px]"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute right-6 bottom-6 left-6 text-left text-white">
                      <span className="bg-brand-yellow font-graphik mb-2 inline-block rounded-full px-3 py-1 text-[10px] font-bold text-black uppercase shadow-xs">
                        FOUNDER &amp; CEO
                      </span>
                      <h3 className="font-nantes text-2xl font-normal text-white">
                        Appala Sairam
                      </h3>
                      <p className="font-graphik mt-1 text-xs text-white/80">
                        Zomato Delivery Partner turned Founder building India&apos;s
                        Direct Commerce Ecosystem.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* RIGHT COLUMN: Founder Story Text Card */}
              <ScrollReveal delay={200} className="lg:col-span-7">
                <div className="border-ash font-graphik text-smoke space-y-6 rounded-[24px] border bg-white p-8 text-left text-base leading-relaxed shadow-xs sm:p-12">
                  <p className="text-ink-black text-lg leading-snug font-semibold">
                    My name is Appala Sairam, and I started building GenZ at the age of
                    23.
                  </p>
                  <p>
                    This journey began while I was studying for a Bachelor of Business
                    Administration (BBA) in the United Kingdom. At that time, I was
                    working in a Pakistani restaurant, where I was the only Indian
                    employee. Most of my co-workers were from Pakistan. I often heard
                    jokes about my accent, my appearance, and sometimes even comments
                    about India. I chose to ignore them and focus on my work.
                  </p>
                  <p>
                    However, during Operation Sindoor, the conversations became more
                    serious. People openly questioned India&apos;s strength and its
                    future. One day, while defending India, I compared India&apos;s
                    progress with Pakistan.
                  </p>
                  <p className="text-ink-black border-brand-yellow-dark border-l-2 pl-4 font-medium italic">
                    The reply I received changed my life: &ldquo;Why do you always
                    compare India with Pakistan? Compare India with China and the United
                    States.&rdquo;
                  </p>
                  <p>That one sentence stayed with me.</p>
                  <p>
                    For the next two months, I spent countless hours researching why
                    countries like China and the United States became global leaders in
                    manufacturing, innovation, and economic growth.
                  </p>
                  <p className="text-ink-black font-semibold">
                    The more I learned, the more I realized one thing: India does not
                    lack talent.
                  </p>
                  <p>
                    We have skilled sellers, innovators, artisans, entrepreneurs,
                    students, and millions of people with brilliant ideas. Yet many of
                    them struggle to gain trust, visibility, opportunities, and access
                    to markets. Consumers often do not know who actually manufactures
                    the products they buy, and many innovative ideas never receive the
                    recognition they deserve.
                  </p>
                  <p>That realization became the foundation of GenZ.</p>
                  <p>
                    I made the difficult decision to leave the United Kingdom and return
                    to India to build this vision. Before leaving, I shared my idea with
                    my family. They respected my decision but made one thing very clear:
                    if I chose this path, I would have to build it on my own. They would
                    not be able to provide any financial support. I accepted that
                    responsibility because I truly believed this vision was worth
                    pursuing.
                  </p>
                  <p>
                    After returning to India, I met politicians, startup incubators, and
                    various organizations. Many appreciated the idea, but the support I
                    had hoped for never came. Although it was disappointing, every
                    rejection only made me more determined to continue.
                  </p>
                  <p className="text-ink-black font-medium">
                    To support myself while building GenZ, I became a Zomato delivery
                    partner.
                  </p>
                  <p>
                    Every day, I delivered food. Every night, I worked on GenZ. While
                    others saw a delivery partner, I saw someone taking one step closer
                    to a vision that never left my mind.
                  </p>
                  <p>
                    Today, GenZ is more than just a startup. It is the result of one
                    question that changed my life and inspired me to stop making excuses
                    and start building solutions.
                  </p>
                  <p>
                    I believe India&apos;s future will not be built by one person, one
                    company, or one government alone. It will be built when innovators,
                    sellers, entrepreneurs, and consumers come together to create
                    opportunities for one another.
                  </p>
                  <div className="border-ash/60 border-t pt-6 text-center sm:text-left">
                    <p className="font-nantes text-ink-black text-xl leading-snug font-normal sm:text-2xl">
                      &ldquo;That is the future I want GenZ to help build.&rdquo;
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE SOLUTION & DIFFERENTIATION */}
      <ProblemSolutionSection />

      {/* 3. FOUNDATIONS OF TRUST */}
      <FoundationsOfTrustScrollSection />

      {/* 4. INDIA 2030 VISION WITH STARTING WITH TOYS & OUR STORY 5 INTERACTIVE TIMELINE */}
      <section className="border-ash border-b bg-[#FAF7F0] px-6 py-20 sm:px-12 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          {/* Starting with Toys & Category Expansion Focus Box */}
          <ScrollReveal className="mb-20">
            <div className="border-ash rounded-3xl border bg-white p-8 shadow-xs sm:p-12 lg:p-14">
              <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
                {/* LEFT COLUMN: Mission Quote */}
                <div className="space-y-6 text-left lg:col-span-6">
                  <div className="tag border-ash inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 shadow-xs">
                    <ToyBrick className="text-brand-yellow-dark h-4 w-4" />
                    <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
                      Initial Focus Sector
                    </span>
                  </div>

                  <h3 className="font-nantes text-ink-black text-3xl leading-tight font-normal sm:text-4xl">
                    Starting with Toys. Growing with Innovation.
                  </h3>

                  <p className="font-nantes text-brand-yellow-dark text-xl font-normal sm:text-2xl">
                    We are launching with toys as our first category.
                  </p>

                  <p className="font-graphik text-smoke text-base leading-relaxed">
                    Why toys? Because they represent creativity, learning, innovation,
                    and India&apos;s growing manufacturing potential. Starting with one
                    category allows us to build trust, verify sellers, and deliver the
                    best experience from day one.
                  </p>

                  <div className="border-ash/60 border-t pt-6">
                    <p className="font-nantes text-ink-black text-lg leading-relaxed italic sm:text-xl">
                      &ldquo;Our mission is to build one trusted platform where
                      consumers, sellers, startups, creators, and businesses can
                      discover and grow with verified products made through innovation
                      and quality.&rdquo;
                    </p>
                  </div>
                </div>

                {/* RIGHT COLUMN: Product & Category List Box */}
                <div className="lg:col-span-6">
                  <div className="border-ash space-y-6 rounded-2xl border bg-white p-6 shadow-xs sm:p-8">
                    <div>
                      <h4 className="font-nantes text-ink-black mb-1 text-2xl font-normal">
                        This is only the beginning.
                      </h4>
                      <p className="font-graphik text-smoke text-sm">
                        As we grow, we will expand into more trusted manufacturing
                        categories, including:
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {[
                        "Toys & Games",
                        "Educational Products",
                        "Consumer Electronics",
                        "Home & Kitchen",
                        "Furniture & Home Decor",
                        "Fashion & Textiles",
                        "Sports & Fitness",
                        "Beauty & Personal Care",
                        "Stationery & Office Supplies",
                        "Industrial & Business Products",
                        "Packaging Solutions",
                        "Smart Products",
                        "Innovative Technologies",
                        "Future Creations",
                        "And many more.",
                      ].map((cat, idx) => (
                        <span
                          key={idx}
                          className={`font-graphik rounded-full border px-3.5 py-1.5 text-xs transition-all sm:text-sm ${
                            cat === "And many more."
                              ? "bg-brand-yellow/20 border-brand-yellow text-brand-yellow-dark font-semibold"
                              : "border-ash text-ink-black bg-[#FAF7F0] font-medium hover:border-black"
                          }`}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* India 2030 Vision Header */}
          <ScrollReveal className="mx-auto mb-12 max-w-2xl text-center">
            <div className="tag border-ash mb-4 inline-block rounded-full border bg-white px-4 py-1.5 shadow-xs">
              <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.25em] uppercase">
                India 2030 Vision
              </span>
            </div>
            <h2 className="font-nantes text-ink-black text-3xl font-normal sm:text-5xl">
              Building India&apos;s Trusted Commerce Ecosystem
            </h2>
          </ScrollReveal>

          {/* Key Target Cards Grid */}
          <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: CheckCircle2,
                value: "1,000+",
                label: "Verified Sellers",
                desc: "Digitally audited with GST profiles & factory reels.",
              },
              {
                icon: Package,
                value: "10,000+",
                label: "Made-in-India Catalog",
                desc: "Direct B2C listings with zero middleman markup.",
              },
              {
                icon: ArrowDownLeft,
                value: "500+",
                label: "Import Gaps Identified",
                desc: "Demand routed to domestic Indian makers.",
              },
              {
                icon: MapPin,
                value: "Pan-India",
                label: "Industrial Reach",
                desc: "Covering tier-2 manufacturing & artisan corridors.",
              },
            ].map((item, idx) => (
              <ScrollReveal key={idx} delay={idx * 80} className="h-full">
                <div className="border-ash group flex h-full flex-col justify-between rounded-2xl border bg-white p-6 shadow-xs transition-all duration-300 hover:border-black">
                  <div>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF7F0] text-black shadow-xs">
                      <item.icon className="text-brand-yellow-dark h-5 w-5" />
                    </div>
                    <span className="font-nantes text-ink-black mb-1 block text-2xl font-normal">
                      {item.value}
                    </span>
                    <span className="font-graphik text-smoke mb-2 block text-[11px] font-semibold tracking-wider uppercase">
                      {item.label}
                    </span>
                  </div>
                  <p className="font-graphik text-smoke text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Strategic Roadmap — Interactive Timeline Box */}
          <ScrollReveal className="mb-16">
            <OurStory5Timeline />
          </ScrollReveal>

          {/* Long Term Mission Banner */}
          <ScrollReveal>
            <div className="border-ash grid grid-cols-1 items-center gap-8 rounded-2xl border bg-white p-8 shadow-xs sm:p-12 lg:grid-cols-12 lg:gap-12">
              <div className="text-left lg:col-span-6">
                <div className="tag border-ash mb-4 inline-block rounded-full border bg-[#FAF7F0] px-4 py-1 shadow-xs">
                  <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
                    Our Long-Term Mission
                  </span>
                </div>
                <h3 className="font-nantes text-ink-black mb-0 text-2xl leading-snug font-normal sm:text-3xl">
                  To become India&apos;s most trusted manufacturing ecosystem —
                  empowering makers, fostering innovation, and building self-reliance.
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-6">
                {[
                  {
                    icon: ShieldCheck,
                    title: "TRUST",
                    desc: "Verified factory credentials for direct commerce.",
                  },
                  {
                    icon: Eye,
                    title: "TRANSPARENCY",
                    desc: "Real process reels and validated factory details.",
                  },
                  {
                    icon: RefreshCw,
                    title: "SELF-RELIANCE",
                    desc: "Promoting domestic manufacture to replace imports.",
                  },
                ].map((val, idx) => (
                  <div
                    key={idx}
                    className="border-ash group flex flex-col justify-between rounded-2xl border bg-[#FAF7F0] p-5 shadow-xs transition-all duration-300 hover:border-black"
                  >
                    <div>
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-xs transition-transform duration-300 group-hover:scale-105">
                        <val.icon className="text-brand-yellow-dark h-5 w-5" />
                      </div>
                      <span className="font-graphik text-ink-black mb-1.5 block text-xs font-semibold tracking-wider uppercase">
                        {val.title}
                      </span>
                    </div>
                    <p className="font-graphik text-smoke text-xs leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. Call To Action & Institutional Verification Banner */}
      <section className="border-ash border-b bg-white py-20 sm:py-28">
        <ScrollReveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center sm:px-12">
          <div className="tag border-ash inline-block rounded-full border bg-[#FAF7F0] px-4 py-1.5 shadow-xs">
            <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
              Join the Ecosystem
            </span>
          </div>
          <h2 className="font-nantes text-ink-black text-3xl font-normal sm:text-5xl">
            Be part of the founding cohort.
          </h2>
          <p className="font-graphik text-smoke max-w-xl text-base">
            Whether you are an Indian toy seller, hardware innovator, or buyer looking
            for factory-direct products, join GenZ today.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-brand-yellow hover:bg-brand-yellow-hover font-graphik h-12 rounded-full border-none px-8 text-xs font-semibold tracking-wider text-black uppercase shadow-xs transition-all"
            >
              <Link href="/#waitlist">Join the Waitlist</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-ink-black border-ash font-graphik h-12 rounded-full border bg-transparent px-8 text-xs font-semibold tracking-wider uppercase shadow-xs transition-all hover:bg-[#FAF7F0]"
            >
              <Link href="/contact">Contact Team</Link>
            </Button>
          </div>
        </ScrollReveal>

        {/* Institutional Standards & Verification Card */}
        <div className="mx-auto mt-20 max-w-[1280px] px-6 sm:px-12">
          <ScrollReveal>
            <div className="border-ash flex max-w-7xl flex-col items-center justify-between gap-6 rounded-2xl border bg-[#FAF7F0] p-6 shadow-xs sm:flex-row sm:gap-8 sm:px-8 sm:py-6">
              <span className="font-graphik text-smoke shrink-0 text-center text-xs font-semibold tracking-[0.25em] uppercase sm:text-left">
                Institutional Standards &amp; Verification
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
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
