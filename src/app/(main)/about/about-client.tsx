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
  Sparkles,
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

// Count Up Numbers Component
interface CountUpProps {
  end: string;
  duration?: number;
}

export function CountUp({ end, duration = 1800 }: CountUpProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [triggered, setTriggered] = useState(false);

  const numericEnd = parseInt(end.replace(/[,₹]/g, ""), 10) || 0;
  const prefix = end.startsWith("₹") ? "₹" : "";
  const suffix = end.replace(/[0-9,₹]/g, "");

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
    const steps = 50;
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
      {prefix}
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

// Interactive Roadmap Timeline Slider
const timelineSteps = [
  {
    year: "2026",
    label: "FOUNDATION",
    icon: Rocket,
    desc: "Launch the platform starting with verified Toy Manufacturers, onboard early makers, validate the ecosystem, and build baseline commercial trust.",
  },
  {
    year: "2027",
    label: "GROWTH",
    icon: LineChart,
    desc: "Expand across major manufacturing sectors (STEM, Craft, Plastics, Molds) and increase verified business listings across industrial hubs.",
  },
  {
    year: "2028",
    label: "SCALE",
    icon: Settings,
    desc: "Introduce export intelligence, innovation partnerships, investor connections, and advanced AI-matched B2C sourcing tools.",
  },
  {
    year: "2029",
    label: "NATIONAL NETWORK",
    icon: Share2,
    desc: "Strengthen manufacturing clusters across every Indian state and improve nationwide direct business connectivity without middleman markups.",
  },
  {
    year: "2030",
    label: "TRUSTED ECOSYSTEM",
    icon: Trophy,
    desc: "Become India's leading digital platform connecting manufacturers, innovators, and consumers to eliminate import dependencies.",
  },
];

export function InteractiveTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="border-ash relative rounded-2xl border bg-white p-6 shadow-xs sm:p-8">
      {/* Timeline Nav bar */}
      <div className="border-ash relative flex scrollbar-none items-center justify-between gap-4 overflow-x-auto border-b pb-6">
        {timelineSteps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === activeIndex;
          return (
            <button
              key={step.year}
              onClick={() => setActiveIndex(idx)}
              className="group relative flex min-w-[75px] flex-1 cursor-pointer flex-col items-center gap-2 pb-3 focus:outline-none"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-brand-yellow scale-105 text-black shadow-xs"
                    : "text-smoke group-hover:text-ink-black group-hover:bg-cream-paper bg-[#FAF7F0]"
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
                <div className="bg-brand-yellow-dark absolute right-0 bottom-0 left-0 h-0.5 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content pane with fade reveal */}
      <div className="mt-8 flex min-h-[130px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-2xl animate-[fade-in_0.4s_ease-out_forwards] text-left">
          <span className="font-graphik text-brand-yellow-dark mb-2 block text-xs font-semibold tracking-widest uppercase">
            Phase {activeIndex + 1} — {timelineSteps[activeIndex].label}
          </span>
          <h4 className="font-nantes text-ink-black mb-3 text-2xl">
            {timelineSteps[activeIndex].year} Strategy &amp; Goals
          </h4>
          <p className="font-graphik text-smoke text-sm leading-relaxed">
            {timelineSteps[activeIndex].desc}
          </p>
        </div>
        <div className="border-ash flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border bg-[#FAF7F0] text-black shadow-xs">
          {(() => {
            const CurrentIcon = timelineSteps[activeIndex].icon;
            return (
              <CurrentIcon className="text-brand-yellow-dark h-7 w-7 animate-pulse" />
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export function AboutClient() {
  return (
    <main className="main-wrapper bg-cream-paper text-ink-black font-sans antialiased">
      {/* ────────────────────────────────────────────────────────────────
          1. header.section_header-about
         ──────────────────────────────────────────────────────────────── */}
      <header className="section_header-about border-ash relative border-b bg-[#FAF7F0] pt-16 pb-16 sm:pt-24 sm:pb-24">
        <div className="padding-global px-6 sm:px-12">
          <div className="container-large mx-auto max-w-[1280px]">
            <div className="padding-section-hero is-text-section">
              <div className="header-about_component flex flex-col gap-12">
                {/* margin-bottom margin-xxlarge > max-width-xmedium */}
                <div className="margin-bottom margin-xxlarge max-w-3xl space-y-4 text-left">
                  <ScrollReveal>
                    <div className="tag border-ash mb-2 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 shadow-xs">
                      <Sparkles className="text-brand-yellow-dark h-3.5 w-3.5" />
                      <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
                        About GenZ Platform
                      </span>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={100}>
                    <div className="margin-bottom margin-small">
                      <h1 className="font-nantes text-ink-black text-4xl leading-[1.08] font-normal sm:text-5xl lg:text-6xl">
                        Keeping Indian makers at the core.
                      </h1>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={200}>
                    <p className="text-size-medium font-graphik text-charcoal text-lg leading-relaxed sm:text-xl">
                      We created a simple, effortless system designed to remove what
                      pulls buyers away from authentic Indian factories and get
                      manufacturers back to doing what&apos;s most important.
                    </p>
                  </ScrollReveal>
                </div>

                {/* about-image-grid: two images side by side (Hero photo on left, decorative shape on right) */}
                <div className="about-image-grid relative grid grid-cols-1 items-stretch gap-6 md:grid-cols-12">
                  {/* reveal-wrap > header-about_image-wrapper (hero photo) */}
                  <ScrollReveal delay={300} className="relative h-full md:col-span-8">
                    <div className="reveal-wrap is-ready is-revealed h-full">
                      <div className="header-about_image-wrapper border-ash group relative h-[320px] overflow-hidden rounded-[16px] border bg-white shadow-xs sm:h-[400px]">
                        <Image
                          src="/hero_background.png"
                          alt="GenZ Indian Toy Manufacturing Workshop"
                          fill
                          priority
                          className="header-about_image object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 1280px) 100vw, 800px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute right-6 bottom-6 left-6 text-left">
                          <span className="text-ink-black font-graphik rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase shadow-xs backdrop-blur-md">
                            VERIFIED MANUFACTURING CORRIDOR
                          </span>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* reveal-wrap > about-shape-wrapper (decorative shape SVG) */}
                  <ScrollReveal delay={400} className="h-full md:col-span-4">
                    <div className="reveal-wrap is-ready is-revealed h-full">
                      <div className="about-shape-wrapper border-ash group relative flex h-[340px] flex-col justify-between overflow-hidden rounded-[16px] border bg-[#FAF7F0] p-6 shadow-xs sm:h-[400px]">
                        <svg
                          className="about-shape pointer-events-none absolute inset-0 h-full w-full"
                          viewBox="0 0 320 400"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          preserveAspectRatio="none"
                        >
                          <circle
                            cx="320"
                            cy="200"
                            r="45"
                            stroke="#1C1C1E"
                            strokeWidth="2"
                            strokeOpacity="0.85"
                          />
                          <circle
                            cx="320"
                            cy="200"
                            r="95"
                            stroke="#1C1C1E"
                            strokeWidth="2"
                            strokeOpacity="0.85"
                          />
                          <circle
                            cx="320"
                            cy="200"
                            r="145"
                            stroke="#1C1C1E"
                            strokeWidth="2"
                            strokeOpacity="0.85"
                          />
                          <circle
                            cx="320"
                            cy="200"
                            r="195"
                            stroke="#1C1C1E"
                            strokeWidth="2"
                            strokeOpacity="0.85"
                          />
                          <circle
                            cx="320"
                            cy="200"
                            r="245"
                            stroke="#1C1C1E"
                            strokeWidth="2"
                            strokeOpacity="0.85"
                          />
                          <circle
                            cx="320"
                            cy="200"
                            r="295"
                            stroke="#1C1C1E"
                            strokeWidth="2"
                            strokeOpacity="0.85"
                          />
                          <circle
                            cx="320"
                            cy="200"
                            r="345"
                            stroke="#1C1C1E"
                            strokeWidth="2"
                            strokeOpacity="0.85"
                          />
                        </svg>

                        <div className="relative z-10 flex items-start justify-between">
                          <span className="bg-brand-yellow font-graphik rounded-full px-3 py-1 text-[10px] font-semibold tracking-wider text-black uppercase shadow-xs">
                            Direct Architecture
                          </span>
                        </div>
                        <div className="border-ash/60 relative z-10 rounded-xl border bg-white/90 p-5 text-left shadow-xs backdrop-blur-xs">
                          <h3 className="font-nantes text-ink-black mb-1 text-xl leading-tight font-normal">
                            Factory Direct. Zero Markups.
                          </h3>
                          <p className="font-graphik text-smoke text-xs leading-relaxed">
                            Connecting consumers directly with verified Indian
                            manufacturers.
                          </p>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. section.section_support — team_component */}
      <section className="section_support border-ash border-b bg-white">
        <div className="padding-global px-6 sm:px-12">
          <div className="container-large mx-auto max-w-[1280px]">
            <div className="padding-section-large py-20 sm:py-28">
              <div className="mx-auto max-w-4xl text-center">
                {/* Section Tag & Heading */}
                <ScrollReveal className="mx-auto mb-12 max-w-2xl text-center">
                  <div className="margin-bottom margin-medium flex justify-center">
                    <div className="tag bg-brand-yellow mb-4 inline-block rounded-full px-4 py-1.5 text-black shadow-xs">
                      <span className="font-graphik text-xs font-semibold tracking-wider uppercase">
                        Founder story
                      </span>
                    </div>
                  </div>
                  <h2 className="font-nantes text-ink-black text-3xl leading-tight font-normal sm:text-5xl">
                    Why we built GenZ
                  </h2>
                </ScrollReveal>

                {/* Centered Founder Image Card */}
                <ScrollReveal delay={100} className="mx-auto mb-12 max-w-md">
                  <div className="reveal-wrap is-ready is-revealed border-ash mx-auto overflow-hidden rounded-[20px] border bg-[#FAF7F0] p-2 shadow-sm">
                    <Image
                      src="/founder.png"
                      alt="Appala Sairam — Founder of GenZ"
                      width={800}
                      height={1200}
                      className="about-image h-[460px] w-full rounded-[16px] object-cover object-top"
                      priority
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="font-nantes text-ink-black text-xl font-normal">
                      Appala Sairam
                    </h3>
                    <p className="font-graphik text-smoke mt-0.5 text-sm">
                      Founder &amp; CEO, GenZ
                    </p>
                  </div>
                </ScrollReveal>

                {/* Centered Story Card (Styled cleanly like Terms & Conditions) */}
                <ScrollReveal delay={200} className="mx-auto max-w-3xl">
                  <div className="border-ash font-graphik text-smoke space-y-6 rounded-2xl border bg-[#FAF7F0] p-8 text-left text-base leading-relaxed shadow-xs sm:p-12">
                    <p className="text-ink-black text-lg font-semibold">
                      My name is Appala Sairam, and I started building GenZ at the age
                      of 23.
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
                      compare India with Pakistan? Compare India with China and the
                      United States.&rdquo;
                    </p>
                    <p>That one sentence stayed with me.</p>
                    <p>
                      For the next two months, I spent countless hours researching why
                      countries like China and the United States became global leaders
                      in manufacturing, innovation, and economic growth.
                    </p>
                    <p className="text-ink-black font-semibold">
                      The more I learned, the more I realized one thing: India does not
                      lack talent.
                    </p>
                    <p>
                      We have skilled manufacturers, innovators, artisans,
                      entrepreneurs, students, and millions of people with brilliant
                      ideas. Yet many of them struggle to gain trust, visibility,
                      opportunities, and access to markets. Consumers often do not know
                      who actually manufactures the products they buy, and many
                      innovative ideas never receive the recognition they deserve.
                    </p>
                    <p>That realization became the foundation of GenZ.</p>
                    <p>
                      I made the difficult decision to leave the United Kingdom and
                      return to India to build this vision. Before leaving, I shared my
                      idea with my family. They respected my decision but made one thing
                      very clear: if I chose this path, I would have to build it on my
                      own. They would not be able to provide any financial support. I
                      accepted that responsibility because I truly believed this vision
                      was worth pursuing.
                    </p>
                    <p>
                      After returning to India, I met politicians, startup incubators,
                      and various organizations. Many appreciated the idea, but the
                      support I had hoped for never came. Although it was disappointing,
                      every rejection only made me more determined to continue.
                    </p>
                    <p className="text-ink-black font-medium">
                      To support myself while building GenZ, I became a Zomato delivery
                      partner.
                    </p>
                    <p>
                      Every day, I delivered food. Every night, I worked on GenZ. While
                      others saw a delivery partner, I saw someone taking one step
                      closer to a vision that never left my mind.
                    </p>
                    <p>
                      Today, GenZ is more than just a startup. It is the result of one
                      question that changed my life and inspired me to stop making
                      excuses and start building solutions.
                    </p>
                    <p>
                      I believe India&apos;s future will not be built by one person, one
                      company, or one government alone. It will be built when
                      innovators, manufacturers, entrepreneurs, and consumers come
                      together to create opportunities for one another.
                    </p>
                    <div className="border-ash/60 border-t pt-6 text-center">
                      <p className="font-nantes text-ink-black text-xl leading-snug font-normal sm:text-2xl">
                        &ldquo;That is the future I want GenZ to help build.&rdquo;
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────
          4. India 2030 Vision & Roadmap (CREAM BG)
         ──────────────────────────────────────────────────────────────── */}
      <section className="border-ash border-b bg-[#FAF7F0] px-6 py-20 sm:px-12 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <ScrollReveal className="mx-auto mb-16 max-w-2xl text-center">
            <div className="tag border-ash mb-4 inline-block rounded-full border bg-white px-4 py-1 shadow-xs">
              <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.25em] uppercase">
                India 2030 Vision
              </span>
            </div>
            <h2 className="font-nantes text-ink-black mb-6 text-4xl font-normal sm:text-5xl">
              The future we are building together.
            </h2>
            <p className="text-smoke font-graphik text-base leading-relaxed">
              GenZ is building India&apos;s trusted B2C manufacturing platform —
              connecting makers, startups, buyers, and investors to strengthen
              India&apos;s industrial foundation.
            </p>
          </ScrollReveal>

          {/* Targets Grid */}
          <div className="mb-24">
            <ScrollReveal>
              <h3 className="font-graphik text-brand-yellow-dark mb-10 text-center text-xs font-semibold tracking-widest uppercase">
                Our 2030 Key Targets
              </h3>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: CheckCircle2,
                  value: "1,000+",
                  label: "Verified Indian Manufacturers",
                  desc: "Digitally connected with verified GST profiles, machinery audits, and direct catalog listings.",
                },
                {
                  icon: Package,
                  value: "10,000+",
                  label: "Made-in-India Products",
                  desc: "Enabling makers to showcase products directly to national consumers without markup stacking.",
                },
                {
                  icon: Handshake,
                  value: "5,000+",
                  label: "Commercial Connections",
                  desc: "Facilitating direct B2C commerce, supplier discovery, and localized manufacturing contracts.",
                },
                {
                  icon: MapPin,
                  value: "Pan-India Reach",
                  label: "Industrial Clusters",
                  desc: "Covering every Indian state, tier-2 manufacturing hubs, and heritage artisan corridors.",
                },
              ].map((item, idx) => (
                <ScrollReveal key={idx} delay={idx * 100} className="h-full">
                  <div className="border-ash group flex h-full min-h-[220px] flex-col justify-between rounded-2xl border bg-white p-6 shadow-xs transition-all duration-300 hover:border-black">
                    <div>
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF7F0] text-black shadow-xs transition-transform duration-300 group-hover:scale-105">
                        <item.icon className="text-brand-yellow-dark h-5 w-5" />
                      </div>
                      <span className="font-nantes text-ink-black mb-1 block text-2xl font-normal sm:text-3xl">
                        {item.value.includes("+") ? (
                          <CountUp end={item.value} />
                        ) : (
                          item.value
                        )}
                      </span>
                      <span className="font-graphik text-smoke mb-3 block text-[10px] font-semibold tracking-wider uppercase">
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
          </div>

          {/* Expected Impact Grid */}
          <div className="mb-24">
            <ScrollReveal>
              <h3 className="font-graphik text-brand-yellow-dark mb-10 text-center text-xs font-semibold tracking-widest uppercase">
                Expected Economic &amp; Social Impact
              </h3>
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Users,
                  title: "Strengthen Indian MSMEs",
                  desc: "Empower small and medium manufacturers with national digital visibility and direct customer relationships.",
                },
                {
                  icon: ArrowDownLeft,
                  title: "Reduce Import Dependency",
                  desc: "Substitute imported goods by showcasing reliable domestic alternatives built right here in India.",
                },
                {
                  icon: Lightbulb,
                  title: "Boost Manufacturing Innovation",
                  desc: "Help hardware startups and inventors find verified local tooling and production partners faster.",
                },
                {
                  icon: TrendingUp,
                  title: "Increase Direct Domestic Trade",
                  desc: "Eliminate broker markups and middleman fees to keep profits with makers and prices fair for buyers.",
                },
                {
                  icon: Briefcase,
                  title: "Support Skilled Employment",
                  desc: "Increased factory utilization directly powers job growth in manufacturing, design, and logistics.",
                },
                {
                  icon: Globe,
                  title: "Global Competitiveness",
                  desc: "Position Indian manufacturing clusters to meet international quality, safety, and supply standards.",
                },
              ].map((item, idx) => (
                <ScrollReveal key={idx} delay={idx * 80} className="h-full">
                  <div className="border-ash group flex h-full gap-4 rounded-2xl border bg-white p-6 text-left shadow-xs transition-all duration-300 hover:border-black">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FAF7F0] text-black shadow-xs transition-transform duration-300 group-hover:scale-105">
                      <item.icon className="text-brand-yellow-dark h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-nantes text-ink-black mb-1.5 text-lg font-normal">
                        {item.title}
                      </h4>
                      <p className="font-graphik text-smoke text-xs leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Interactive Roadmap */}
          <div className="mb-24">
            <ScrollReveal className="mb-12 text-center">
              <h3 className="font-graphik text-brand-yellow-dark text-xs font-semibold tracking-widest uppercase">
                Strategic Roadmap
              </h3>
            </ScrollReveal>

            <ScrollReveal>
              <InteractiveTimeline />
            </ScrollReveal>
          </div>

          {/* Long Term Mission Banner */}
          <ScrollReveal>
            <div className="bg-brand-yellow border-ash grid grid-cols-1 items-center gap-8 rounded-2xl border p-8 text-black shadow-xs transition-transform duration-500 hover:scale-[1.005] sm:p-12 lg:grid-cols-12 lg:gap-12">
              <div className="text-left lg:col-span-6">
                <span className="font-graphik mb-3 block text-xs font-semibold tracking-[0.2em] text-black/80 uppercase">
                  Our Long-Term Mission
                </span>
                <p className="font-nantes mb-0 text-2xl leading-snug font-normal sm:text-3xl">
                  To become India&apos;s most trusted manufacturing ecosystem —
                  empowering makers, fostering innovation, and building self-reliance.
                </p>
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
                    className="group flex flex-col items-center rounded-xl border border-black/10 bg-black/5 p-4 text-center transition-colors duration-300 hover:bg-black/10"
                  >
                    <val.icon className="mb-2.5 h-5 w-5 text-black transition-transform duration-300 group-hover:scale-110" />
                    <span className="font-graphik mb-1.5 block text-[10px] font-semibold tracking-wider text-black uppercase">
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

      {/* 5. Institutional Verification Row */}
      <section className="border-ash border-b bg-white px-6 py-16 sm:px-12">
        <ScrollReveal className="mx-auto max-w-[1280px] text-center">
          <span className="font-graphik text-smoke mb-8 block text-xs font-semibold tracking-[0.25em] uppercase">
            Institutional Standards &amp; Verification
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
            <span className="font-graphik rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-medium tracking-widest text-neutral-800 uppercase transition-colors hover:bg-neutral-800 hover:text-white">
              MAKE IN INDIA
            </span>
          </div>
        </ScrollReveal>
      </section>

      {/* 6. Call To Action  */}
      <section className="bg-[#FAF7F0] py-20 sm:py-28">
        <ScrollReveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center sm:px-12">
          <div className="tag border-ash inline-block rounded-full border bg-white px-4 py-1 shadow-xs">
            <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
              Join the Ecosystem
            </span>
          </div>
          <h2 className="font-nantes text-ink-black text-3xl font-normal sm:text-5xl">
            Be part of the founding cohort.
          </h2>
          <p className="font-graphik text-smoke max-w-xl text-base">
            Whether you are an Indian toy manufacturer, hardware innovator, or buyer
            looking for factory-direct products, join GenZ today.
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
      </section>
    </main>
  );
}
