"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Package,
  Handshake,
  MapPin,
  Users,
  ArrowDownLeft,
  Lightbulb,
  TrendingUp,
  Briefcase,
  Globe,
  Rocket,
  LineChart,
  Settings,
  Share2,
  Trophy,
  ShieldCheck,
  Eye,
  RefreshCw,
} from "lucide-react";

// ────────────────────────────────────────────────────────────────────────
// Scroll Reveal Component (Native Intersection Observer)
// ────────────────────────────────────────────────────────────────────────
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
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
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
      className={`transform transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Animated SVGUnderline (Draws on mount)
// ────────────────────────────────────────────────────────────────────────
export function AnimatedUnderline() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setActive(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <span className="relative inline-block italic">
      accept the excuse
      <svg
        className="text-brand-yellow-dark absolute -bottom-2 left-0 h-3 w-full"
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,5 Q50,1 100,5"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="100"
          strokeDashoffset={active ? "0" : "100"}
          className="transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
      </svg>
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Count Up Numbers Component
// ────────────────────────────────────────────────────────────────────────
interface CountUpProps {
  end: string;
  duration?: number;
}

export function CountUp({ end, duration = 1800 }: CountUpProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [triggered, setTriggered] = useState(false);

  const numericEnd = parseInt(end.replace(/,/g, ""), 10);
  const suffix = end.replace(/[0-9,]/g, "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!triggered) return;
    let start = 0;
    const steps = 60;
    const increment = Math.ceil(numericEnd / steps);
    const stepTime = Math.floor(duration / steps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= numericEnd) {
        setCount(numericEnd);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [triggered, numericEnd, duration]);

  return (
    <span ref={ref} className="font-mono">
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Interactive Timeline Slider
// ────────────────────────────────────────────────────────────────────────
const timelineSteps = [
  {
    year: "2026",
    label: "FOUNDATION",
    icon: Rocket,
    desc: "Launch the platform, onboard early manufacturers, validate the ecosystem and build trust.",
  },
  {
    year: "2027",
    label: "GROWTH",
    icon: LineChart,
    desc: "Expand across major manufacturing sectors and increase verified businesses and product listings.",
  },
  {
    year: "2028",
    label: "SCALE",
    icon: Settings,
    desc: "Introduce exports, innovation partnerships, investor connections and advanced B2C tools.",
  },
  {
    year: "2029",
    label: "NATIONAL NETWORK",
    icon: Share2,
    desc: "Strengthen manufacturing clusters across India and improve nationwide business connectivity.",
  },
  {
    year: "2030",
    label: "TRUSTED ECOSYSTEM",
    icon: Trophy,
    desc: "Become one of India's leading digital platforms connecting manufacturers, innovators and businesses.",
  },
];

export function InteractiveTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="border-ash bg-pure-white relative rounded-none border p-8">
      {/* Timeline Nav bar */}
      <div className="border-ash relative flex scrollbar-none items-center justify-between gap-4 overflow-x-auto border-b pb-6">
        {timelineSteps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === activeIndex;
          return (
            <button
              key={step.year}
              onClick={() => setActiveIndex(idx)}
              className="group relative flex min-w-[70px] flex-1 cursor-pointer flex-col items-center gap-2 pb-3 focus:outline-none"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center transition-all duration-300 ${
                  isActive
                    ? "bg-brand-yellow text-black"
                    : "bg-cream-paper text-smoke group-hover:text-ink-black"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`font-nantes text-lg font-medium transition-colors ${
                  isActive ? "font-semibold text-black" : "text-smoke"
                }`}
              >
                {step.year}
              </span>
              <span className="font-graphik text-smoke hidden text-[9px] font-medium tracking-wider uppercase md:block">
                {step.label}
              </span>
              {isActive && (
                <div className="bg-brand-yellow absolute right-0 bottom-0 left-0 h-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content pane with fade reveal */}
      <div className="mt-8 flex min-h-[140px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-2xl animate-[fade-in_0.5s_ease-out_forwards] text-left">
          <span className="font-graphik text-brand-blue mb-2 block text-[10px] font-semibold tracking-widest uppercase">
            Phase {activeIndex + 1} — {timelineSteps[activeIndex].label}
          </span>
          <h4 className="font-nantes text-ink-black mb-3 text-2xl">
            {timelineSteps[activeIndex].year} Goals
          </h4>
          <p className="text-body font-graphik text-charcoal leading-relaxed">
            {timelineSteps[activeIndex].desc}
          </p>
        </div>
        <div className="bg-cream-paper border-ash flex h-16 w-16 shrink-0 items-center justify-center border text-black">
          {(() => {
            const CurrentIcon = timelineSteps[activeIndex].icon;
            return <CurrentIcon className="h-8 w-8 animate-pulse" />;
          })()}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Main AboutClient Component
// ────────────────────────────────────────────────────────────────────────
export function AboutClient() {
  return (
    <>
      {/* Hero Section */}
      <section className="border-ash relative overflow-hidden border-b px-6 py-20 sm:px-12 md:py-28">
        <div className="from-brand-yellow-dark/5 pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] via-transparent to-transparent" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <span className="text-caption font-graphik text-smoke mb-4 block animate-[fade-in_0.6s_ease-out] tracking-[0.2em] uppercase">
            Our Story
          </span>
          <h1 className="font-nantes text-ink-black mb-6 animate-[fade-in-up_0.8s_ease-out] text-4xl leading-[1.1] font-normal tracking-tight sm:text-6xl">
            Built by someone who refused <br />
            to <AnimatedUnderline />.
          </h1>
          <p className="text-charcoal text-body font-graphik mx-auto max-w-2xl animate-[fade-in-up_1s_ease-out] leading-relaxed">
            Every founder has a moment that will not let them go. This is the story of
            how GenZ was born.
          </p>
        </div>
      </section>

      {/* Founder Story & Profile Section */}
      <section className="bg-pure-white border-ash border-b px-6 py-20 sm:px-12 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Column: Founder Photo & Profile */}
            <div className="flex flex-col items-center text-center lg:sticky lg:top-28 lg:col-span-4 lg:items-start lg:text-left">
              <ScrollReveal>
                <div className="border-ash bg-cream-paper group relative mb-6 h-48 w-48 cursor-pointer overflow-hidden rounded-none border">
                  <Image
                    src="/founder.jpeg"
                    alt="Appala Sairam"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="192px"
                    priority
                  />
                  <div className="bg-brand-yellow/5 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <h2 className="font-nantes text-ink-black mb-1 text-2xl font-normal">
                  Appala Sairam
                </h2>
                <p className="text-caption font-graphik text-smoke mb-6 tracking-wider uppercase">
                  Founder, GenZ
                </p>
              </ScrollReveal>

              <ScrollReveal delay={200} className="w-full">
                <div className="border-brand-yellow bg-cream-paper w-full rounded-none border-l-2 p-4 py-3 pl-5 text-left">
                  <p className="font-nantes text-base leading-relaxed text-black italic">
                    &ldquo;India does not lack talent. It lacks a trusted system that
                    connects talent with opportunity.&rdquo;
                  </p>
                  <span className="text-smoke font-graphik mt-3 block text-[10px] tracking-wider uppercase">
                    GenZ Founding Charter
                  </span>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Narrative */}
            <div className="font-graphik text-body text-charcoal space-y-6 text-left leading-relaxed lg:col-span-8">
              <ScrollReveal>
                <h3 className="font-nantes text-ink-black border-ash mb-6 border-b pb-3 text-3xl font-normal">
                  Founder Story
                </h3>
              </ScrollReveal>

              <ScrollReveal delay={50}>
                <p className="text-base font-semibold text-black">
                  My name is Appala Sairam, and I founded GenZ at the age of 23.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <p>
                  While studying BBA in London, I worked in a Pakistani restaurant as
                  the only Indian employee. Most of the time, I ignored jokes about my
                  accent, my appearance, and even my country. But during Operation
                  Sindoor, the conversations became more serious. While defending India,
                  I compared India&apos;s progress with Pakistan.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={150}>
                <p className="font-semibold text-black">
                  The reply I received changed my life forever.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="bg-cream-paper border-brand-yellow-dark text-ink-black font-nantes hover:bg-brand-yellow-dark/5 my-6 border-l-2 p-5 text-lg italic transition-colors">
                  &ldquo;Why are you comparing India&apos;s progress with Pakistan?
                  Compare it with China and the United States. Then you&apos;ll realize
                  where India stands.&rdquo;
                </div>
              </ScrollReveal>

              <ScrollReveal delay={250}>
                <p>That one sentence stayed with me.</p>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <p>
                  For the next two months, I spent countless hours researching why
                  countries like China and the United States became global leaders in
                  manufacturing, innovation, and economic growth. The more I learned,
                  the more I realized that India doesn&apos;t lack talent—it lacks
                  trust, visibility, and opportunities. Millions of manufacturers,
                  innovators, artisans, startups, and entrepreneurs have incredible
                  potential, yet many never receive the recognition or market access
                  they deserve.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={350}>
                <p className="text-ink-black font-medium">
                  That realization became GenZ.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={400}>
                <p>
                  I made the difficult decision to leave London and return to India to
                  build this vision. Before returning, I told my family that I was
                  leaving everything behind to make this dream a reality. My father
                  respected my decision but made one thing clear—he would not be able to
                  provide any financial support. If I believed in this vision, I would
                  have to build it on my own.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={450}>
                <p>
                  After returning to India, I met politicians, startup incubators, and
                  various organizations. Many appreciated the idea, but the support I
                  hoped for never came. Every rejection only strengthened my
                  determination.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={500}>
                <p>
                  To support myself while building GenZ, I became a Zomato delivery
                  partner. Every day, I delivered food. Every night, I worked on GenZ.
                  While others saw a delivery partner, I saw someone taking one step
                  closer to a vision that never left my mind.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={550}>
                <p>
                  Today, GenZ is more than an e-commerce platform. It is a mission to
                  build trust, empower Indian manufacturers and innovators, and create
                  opportunities that help India compete with the world&apos;s best.
                </p>
              </ScrollReveal>

              <ScrollReveal>
                <div className="bg-brand-yellow border-ash my-8 rounded-none border p-8 text-center text-black transition-transform duration-500 hover:scale-[1.01]">
                  <p className="text-caption font-graphik mb-2 font-medium tracking-wider text-black/70 uppercase">
                    Our Founding Belief
                  </p>
                  <p className="font-nantes text-2xl leading-relaxed font-normal">
                    India does not lack talent. It lacks a trusted system that connects
                    talent with opportunity.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <p>
                  I believe India&apos;s future will not be built by one person, one
                  company, or one government alone. It will be built when manufacturers,
                  innovators, entrepreneurs, and consumers come together to create
                  opportunities for one another.
                </p>
              </ScrollReveal>

              <ScrollReveal>
                <p className="font-nantes text-xl font-semibold text-black">
                  That is the future I want GenZ to help build.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Launch Strategy: Starting with Toys */}
      <section className="bg-pure-white border-ash relative overflow-hidden border-b px-6 py-20 sm:px-12 md:py-28">
        <div className="from-brand-blue/5 pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] via-transparent to-transparent" />
        <div className="mx-auto max-w-[1280px]">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left side: Headline & Mission */}
            <div className="space-y-6 text-left lg:col-span-6">
              <ScrollReveal>
                <span className="text-caption font-graphik text-smoke mb-4 block tracking-[0.2em] uppercase">
                  Launch Strategy
                </span>
                <h2 className="font-nantes text-ink-black mb-6 text-4xl leading-[1.1] font-normal sm:text-5xl">
                  Starting with Toys. <br />
                  <span className="font-semibold text-black italic">
                    Growing with Innovation.
                  </span>
                </h2>
              </ScrollReveal>

              <ScrollReveal
                delay={100}
                className="font-graphik text-body text-charcoal space-y-6 leading-relaxed"
              >
                <p className="text-ink-black text-lg font-semibold">
                  We are launching with toys as our first category.
                </p>
                <p>
                  <strong>Why toys?</strong> Because they represent creativity,
                  learning, innovation, and India&apos;s growing manufacturing
                  potential. Starting with one category allows us to build trust, verify
                  manufacturers, and deliver the best experience from day one.
                </p>
                <p className="text-lg font-semibold text-black">
                  This is only the beginning.
                </p>
                <p>
                  Our mission is to build one trusted platform where consumers,
                  manufacturers, startups, creators, and businesses can discover and
                  grow with verified products made through innovation and quality.
                </p>
              </ScrollReveal>
            </div>

            {/* Right side: Future Categories List Card */}
            <div className="bg-cream-paper border-ash relative rounded-none border p-8 sm:p-10 lg:col-span-6">
              <ScrollReveal delay={200}>
                <h3 className="font-nantes text-ink-black border-ash mb-4 border-b pb-3 text-2xl">
                  Future Categories
                </h3>
                <p className="text-caption font-graphik text-smoke mb-6">
                  As we grow, we will expand into more trusted manufacturing categories,
                  including:
                </p>

                <ul className="text-caption font-graphik text-charcoal grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
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
                  ].map((cat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="bg-brand-yellow h-1.5 w-1.5 shrink-0" />
                      <span>{cat}</span>
                    </li>
                  ))}
                  <li className="col-span-2 mt-2 flex items-center gap-2 font-medium text-black">
                    <span className="bg-brand-yellow h-1.5 w-1.5 shrink-0" />
                    <span>And many more.</span>
                  </li>
                </ul>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* India 2030 Vision Section */}
      <section className="bg-cream-paper border-ash border-b px-6 py-20 sm:px-12 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <ScrollReveal className="mx-auto mb-16 max-w-2xl text-center">
            <span className="text-caption font-graphik text-smoke mb-4 block tracking-[0.25em] uppercase">
              India 2030 Vision
            </span>
            <h2 className="font-nantes text-ink-black mb-6 text-4xl sm:text-5xl">
              The future we are building together.
            </h2>
            <p className="text-charcoal text-body font-graphik leading-relaxed">
              GenZ is building India&apos;s trusted B2C manufacturing and innovation
              platform — connecting manufacturers, startups, innovators, buyers, and
              investors to strengthen India&apos;s manufacturing ecosystem.
            </p>
          </ScrollReveal>

          {/* Targets Grid */}
          <div className="mb-24">
            <ScrollReveal>
              <h3 className="text-caption font-graphik text-brand-blue mb-10 text-center font-medium tracking-widest uppercase">
                Our 2030 Targets
              </h3>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: CheckCircle2,
                  value: "1,00,000+",
                  label: "Verified Indian Manufacturers",
                  desc: "Digitally connected with verified business profiles and product catalogs.",
                },
                {
                  icon: Package,
                  value: "10,00,000+",
                  label: "Made-in-India Products",
                  desc: "Helping manufacturers showcase products directly to businesses and buyers.",
                },
                {
                  icon: Handshake,
                  value: "5,00,000+",
                  label: "Opportunities Facilitated",
                  desc: "Through B2C connections, supplier discovery, manufacturing partnerships and sourcing.",
                },
                {
                  icon: MapPin,
                  value: "Presence Across India",
                  label: "Nationwide Coverage",
                  desc: "Building a manufacturing network covering every Indian state and major industrial clusters.",
                },
              ].map((item, idx) => (
                <ScrollReveal key={idx} delay={idx * 100} className="h-full">
                  <div className="bg-pure-white border-ash group hover:border-brand-yellow flex h-full min-h-[220px] flex-col justify-between rounded-none border p-6 transition-colors duration-300">
                    <div>
                      <div className="bg-cream-paper mb-4 flex h-10 w-10 items-center justify-center text-black transition-transform duration-300 group-hover:scale-105">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="font-nantes text-ink-black mb-1 block text-2xl font-normal">
                        {item.value.includes("+") ? (
                          <CountUp end={item.value} />
                        ) : (
                          item.value
                        )}
                      </span>
                      <span className="font-graphik text-smoke mb-3 block text-[10px] tracking-wider uppercase">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-caption font-graphik text-charcoal leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Impact Grid */}
          <div className="mb-24">
            <ScrollReveal>
              <h3 className="text-caption font-graphik text-brand-blue mb-10 text-center font-medium tracking-widest uppercase">
                Expected Impact on India
              </h3>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Users,
                  title: "Strengthen MSMEs",
                  desc: "Help small and medium manufacturers gain national visibility and direct business opportunities.",
                },
                {
                  icon: ArrowDownLeft,
                  title: "Reduce Import Dependency",
                  desc: "Promote Indian-made alternatives by making domestic manufacturers easier to discover.",
                },
                {
                  icon: Lightbulb,
                  title: "Boost Manufacturing Innovation",
                  desc: "Enable startups and innovators to find manufacturing partners faster.",
                },
                {
                  icon: TrendingUp,
                  title: "Increase Domestic Trade",
                  desc: "Create more direct B2C transactions between Indian buyers and manufacturers.",
                },
                {
                  icon: Briefcase,
                  title: "Support Employment",
                  desc: "Business growth can lead to more hiring across manufacturing, logistics, and design.",
                },
                {
                  icon: Globe,
                  title: "Improve Global Competitiveness",
                  desc: "Help Indian manufacturers become more visible to international buyers in the future.",
                },
              ].map((item, idx) => (
                <ScrollReveal key={idx} delay={idx * 80} className="h-full">
                  <div className="bg-pure-white border-ash group hover:border-brand-blue flex h-full gap-4 rounded-none border p-6 text-left transition-colors duration-300">
                    <div className="bg-cream-paper flex h-10 w-10 shrink-0 items-center justify-center text-black transition-transform duration-300 group-hover:scale-105">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-nantes text-ink-black mb-1.5 text-base">
                        {item.title}
                      </h4>
                      <p className="text-caption font-graphik text-charcoal leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Timeline / Roadmap */}
          <div className="mb-24">
            <ScrollReveal className="mb-12">
              <h3 className="text-caption font-graphik text-brand-blue text-center font-medium tracking-widest uppercase">
                Our Roadmap
              </h3>
            </ScrollReveal>

            <ScrollReveal>
              <InteractiveTimeline />
            </ScrollReveal>
          </div>

          {/* Long Term Mission */}
          <ScrollReveal>
            <div className="bg-brand-yellow border-ash grid grid-cols-1 items-center gap-8 rounded-none border p-8 text-black transition-transform duration-500 hover:scale-[1.005] sm:p-12 lg:grid-cols-12 lg:gap-12">
              <div className="text-left lg:col-span-6">
                <span className="text-caption font-graphik mb-3 block tracking-[0.2em] text-black/70 uppercase">
                  Our Long-Term Mission
                </span>
                <p className="font-nantes mb-0 text-2xl leading-snug font-light">
                  To become India&apos;s most trusted manufacturing and innovation
                  ecosystem — empowering businesses, supporting production, and reducing
                  import dependency.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-6">
                {[
                  {
                    icon: ShieldCheck,
                    title: "TRUST",
                    desc: "Verified businesses for secure connections.",
                  },
                  {
                    icon: Eye,
                    title: "TRANSPARENCY",
                    desc: "Building trust through validated details.",
                  },
                  {
                    icon: RefreshCw,
                    title: "SUSTAINABILITY",
                    desc: "Promoting domestic manufacture for self-reliance.",
                  },
                ].map((val, idx) => (
                  <div
                    key={idx}
                    className="group flex flex-col items-center border border-black/10 bg-black/5 p-4 text-center transition-colors duration-300 hover:bg-black/10"
                  >
                    <val.icon className="mb-2.5 h-5 w-5 text-black transition-transform duration-300 group-hover:scale-110" />
                    <span className="font-graphik mb-1.5 block text-[9px] font-medium tracking-wider text-black uppercase">
                      {val.title}
                    </span>
                    <p className="text-[10px] leading-normal text-black/70">
                      {val.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Institutional Verification Row */}
      <section className="border-ash bg-pure-white border-b px-6 py-16 sm:px-12">
        <ScrollReveal className="mx-auto max-w-[1280px] text-center">
          <span className="font-graphik text-smoke mb-8 block text-[10px] tracking-[0.25em] uppercase">
            Institutional verification
          </span>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-90 sm:gap-20">
            <span className="font-graphik text-brand-blue text-lg font-semibold tracking-tighter transition-transform hover:scale-105">
              sidbi
            </span>
            <span className="font-graphik text-lg font-semibold tracking-tighter text-red-700 transition-transform hover:scale-105">
              NSIC
            </span>
            <span className="font-graphik text-base font-medium tracking-wide text-neutral-800 uppercase transition-transform hover:scale-105">
              DPIIT
            </span>
            <span className="font-graphik border border-neutral-800 px-3 py-1.5 text-xs font-medium tracking-widest text-neutral-800 uppercase transition-colors hover:bg-neutral-800 hover:text-white">
              MAKE IN INDIA
            </span>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <ScrollReveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center sm:px-12">
          <h2 className="font-nantes text-ink-black mb-4 text-3xl sm:text-5xl">
            Be part of the founding cohort.
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-brand-yellow hover:bg-brand-yellow-hover font-graphik h-12 rounded-none border-none px-6 text-xs font-normal tracking-wider text-black uppercase transition-transform hover:scale-102"
            >
              <Link href="/#waitlist">Join the Waitlist</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-ink-black border-ash hover:bg-cream-paper font-graphik h-12 rounded-none border bg-transparent px-6 text-xs font-normal tracking-wider uppercase transition-transform hover:scale-102"
            >
              <Link href="/contact">Get in touch</Link>
            </Button>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
