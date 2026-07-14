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
  RefreshCw
} from "lucide-react";

// ────────────────────────────────────────────────────────────────────────
// Scroll Reveal Component (Native Intersection Observer)
// ────────────────────────────────────────────────────────────────────────
interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({ children, className = "", delay = 0 }: ScrollRevealProps) {
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
      className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
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
        className="absolute -bottom-2 left-0 h-3 w-full text-gold-yellow"
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
  { year: "2026", label: "FOUNDATION", icon: Rocket, desc: "Launch the platform, onboard early manufacturers, validate the ecosystem and build trust." },
  { year: "2027", label: "GROWTH", icon: LineChart, desc: "Expand across major manufacturing sectors and increase verified businesses and product listings." },
  { year: "2028", label: "SCALE", icon: Settings, desc: "Introduce exports, innovation partnerships, investor connections and advanced B2C tools." },
  { year: "2029", label: "NATIONAL NETWORK", icon: Share2, desc: "Strengthen manufacturing clusters across India and improve nationwide business connectivity." },
  { year: "2030", label: "TRUSTED ECOSYSTEM", icon: Trophy, desc: "Become one of India's leading digital platforms connecting manufacturers, innovators and businesses." }
];

export function InteractiveTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative border border-ash bg-pure-white p-8 rounded-none">
      {/* Timeline Nav bar */}
      <div className="flex justify-between items-center border-b border-ash pb-6 relative overflow-x-auto scrollbar-none gap-4">
        {timelineSteps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === activeIndex;
          return (
            <button
              key={step.year}
              onClick={() => setActiveIndex(idx)}
              className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none relative pb-3 flex-1 min-w-[70px]"
            >
              <div
                className={`h-10 w-10 flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? "bg-forest-green text-[#FFF0DD]"
                    : "bg-cream-paper text-smoke group-hover:text-ink-black"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`font-nantes text-lg font-medium transition-colors ${
                  isActive ? "text-forest-green font-semibold" : "text-smoke"
                }`}
              >
                {step.year}
              </span>
              <span className="text-[9px] font-graphik font-medium uppercase tracking-wider text-smoke hidden md:block">
                {step.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest-green" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content pane with fade reveal */}
      <div className="mt-8 min-h-[140px] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-2xl text-left animate-[fade-in_0.5s_ease-out_forwards]">
          <span className="text-[10px] font-graphik font-semibold text-brand-blue uppercase tracking-widest block mb-2">
            Phase {activeIndex + 1} — {timelineSteps[activeIndex].label}
          </span>
          <h4 className="font-nantes text-2xl text-ink-black mb-3">
            {timelineSteps[activeIndex].year} Goals
          </h4>
          <p className="text-body font-graphik text-charcoal leading-relaxed">
            {timelineSteps[activeIndex].desc}
          </p>
        </div>
        <div className="h-16 w-16 bg-cream-paper flex items-center justify-center border border-ash text-forest-green shrink-0">
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
      <section className="relative border-b border-ash px-6 py-20 sm:px-12 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold-yellow/5 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <span className="text-caption font-graphik uppercase tracking-[0.2em] text-smoke mb-4 block animate-[fade-in_0.6s_ease-out]">
            Our Story
          </span>
          <h1 className="font-nantes text-4xl sm:text-6xl font-normal leading-[1.1] tracking-tight text-ink-black mb-6 animate-[fade-in-up_0.8s_ease-out]">
            Built by someone who refused <br />
            to <AnimatedUnderline />.
          </h1>
          <p className="text-charcoal max-w-2xl mx-auto text-body font-graphik leading-relaxed animate-[fade-in-up_1s_ease-out]">
            Every founder has a moment that will not let them go. This is the story of how GenZ was born.
          </p>
        </div>
      </section>

      {/* Founder Story & Profile Section */}
      <section className="bg-pure-white py-20 px-6 sm:px-12 md:py-28 border-b border-ash">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Founder Photo & Profile */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left lg:sticky lg:top-28">
              <ScrollReveal>
                <div className="relative h-48 w-48 rounded-none overflow-hidden border border-ash bg-cream-paper mb-6 group cursor-pointer">
                  <Image
                    src="/founder.jpeg"
                    alt="Appala Sairam"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="192px"
                    priority
                  />
                  <div className="absolute inset-0 bg-forest-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={100}>
                <h2 className="font-nantes text-2xl font-normal text-ink-black mb-1">
                  Appala Sairam
                </h2>
                <p className="text-caption font-graphik uppercase tracking-wider text-smoke mb-6">
                  Founder &amp; Delivery Partner, GenZ
                </p>
              </ScrollReveal>

              <ScrollReveal delay={200} className="w-full">
                <div className="border-l-2 border-forest-green pl-5 py-3 text-left bg-cream-paper p-4 w-full rounded-none">
                  <p className="font-nantes text-base italic text-forest-green leading-relaxed">
                    &ldquo;India does not lack talent. It lacks a trusted system that connects talent with opportunity.&rdquo;
                  </p>
                  <span className="text-[10px] text-smoke uppercase tracking-wider block mt-3 font-graphik">
                    GenZ Founding Charter
                  </span>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Narrative */}
            <div className="lg:col-span-8 text-left space-y-6 font-graphik text-body leading-relaxed text-charcoal">
              <ScrollReveal>
                <h3 className="font-nantes text-3xl font-normal text-ink-black mb-6 border-b border-ash pb-3">
                  Founder Story
                </h3>
              </ScrollReveal>
              
              <ScrollReveal delay={50}>
                <p className="font-semibold text-forest-green text-base">
                  My name is Appala Sairam, and I founded GenZ at the age of 23.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <p>
                  While studying BBA in London, I worked in a Pakistani restaurant as the only Indian employee. Most of the time, I ignored jokes about my accent, my appearance, and even my country. But during Operation Sindoor, the conversations became more serious. While defending India, I compared India&apos;s progress with Pakistan.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={150}>
                <p className="font-semibold text-forest-green">
                  The reply I received changed my life forever.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="bg-cream-paper border-l-2 border-gold-yellow p-5 my-6 italic text-lg text-ink-black font-nantes transition-colors hover:bg-gold-yellow/5">
                  &ldquo;Why are you comparing India&apos;s progress with Pakistan? Compare it with China and the United States. Then you&apos;ll realize where India stands.&rdquo;
                </div>
              </ScrollReveal>

              <ScrollReveal delay={250}>
                <p>
                  That one sentence stayed with me.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <p>
                  For the next two months, I spent countless hours researching why countries like China and the United States became global leaders in manufacturing, innovation, and economic growth. The more I learned, the more I realized that India doesn&apos;t lack talent—it lacks trust, visibility, and opportunities. Millions of manufacturers, innovators, artisans, startups, and entrepreneurs have incredible potential, yet many never receive the recognition or market access they deserve.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={350}>
                <p className="font-medium text-ink-black">
                  That realization became GenZ.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={400}>
                <p>
                  I made the difficult decision to leave London and return to India to build this vision. Before returning, I told my family that I was leaving everything behind to make this dream a reality. My father respected my decision but made one thing clear—he would not be able to provide any financial support. If I believed in this vision, I would have to build it on my own.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={450}>
                <p>
                  After returning to India, I met politicians, startup incubators, and various organizations. Many appreciated the idea, but the support I hoped for never came. Every rejection only strengthened my determination.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={500}>
                <p>
                  To support myself while building GenZ, I became a Zomato delivery partner. Every day, I delivered food. Every night, I worked on GenZ. While others saw a delivery partner, I saw someone taking one step closer to a vision that never left my mind.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={550}>
                <p>
                  Today, GenZ is more than an e-commerce platform. It is a mission to build trust, empower Indian manufacturers and innovators, and create opportunities that help India compete with the world&apos;s best.
                </p>
              </ScrollReveal>

              <ScrollReveal>
                <div className="bg-forest-green text-white p-8 rounded-none my-8 text-center transition-transform duration-500 hover:scale-[1.01] border border-ash">
                  <p className="text-gold-yellow text-caption font-graphik font-medium tracking-wider uppercase mb-2">Our Founding Belief</p>
                  <p className="font-nantes text-2xl font-normal leading-relaxed">
                    India does not lack talent. It lacks a trusted system that connects talent with opportunity.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <p>
                  I believe India&apos;s future will not be built by one person, one company, or one government alone. It will be built when manufacturers, innovators, entrepreneurs, and consumers come together to create opportunities for one another.
                </p>
              </ScrollReveal>

              <ScrollReveal>
                <p className="font-nantes text-xl text-forest-green font-semibold">
                  That is the future I want GenZ to help build.
                </p>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>

      {/* Launch Strategy: Starting with Toys */}
      <section className="bg-pure-white py-20 px-6 sm:px-12 md:py-28 border-b border-ash relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-brand-blue/5 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-[1280px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left side: Headline & Mission */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <ScrollReveal>
                <span className="text-caption font-graphik uppercase tracking-[0.2em] text-smoke mb-4 block">
                  Launch Strategy
                </span>
                <h2 className="font-nantes text-4xl sm:text-5xl font-normal leading-[1.1] text-ink-black mb-6">
                  Starting with Toys. <br />
                  <span className="italic text-forest-green font-semibold">Growing with Innovation.</span>
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={100} className="space-y-6 font-graphik text-body leading-relaxed text-charcoal">
                <p className="font-semibold text-ink-black text-lg">
                  We are launching with toys as our first category.
                </p>
                <p>
                  <strong>Why toys?</strong> Because they represent creativity, learning, innovation, and India&apos;s growing manufacturing potential. Starting with one category allows us to build trust, verify manufacturers, and deliver the best experience from day one.
                </p>
                <p className="font-semibold text-forest-green text-lg">
                  This is only the beginning.
                </p>
                <p>
                  Our mission is to build one trusted platform where consumers, manufacturers, startups, creators, and businesses can discover and grow with verified products made through innovation and quality.
                </p>
              </ScrollReveal>
            </div>

            {/* Right side: Future Categories List Card */}
            <div className="lg:col-span-6 bg-cream-paper border border-ash p-8 sm:p-10 rounded-none relative">
              <ScrollReveal delay={200}>
                <h3 className="font-nantes text-2xl text-ink-black mb-4 pb-3 border-b border-ash">
                  Future Categories
                </h3>
                <p className="text-caption font-graphik text-smoke mb-6">
                  As we grow, we will expand into more trusted manufacturing categories, including:
                </p>
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-caption font-graphik text-charcoal">
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
                    "Future Creations"
                  ].map((cat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-forest-green shrink-0" />
                      <span>{cat}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2 font-medium text-forest-green col-span-2 mt-2">
                    <span className="h-1.5 w-1.5 bg-forest-green shrink-0" />
                    <span>And many more.</span>
                  </li>
                </ul>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>

      {/* India 2030 Vision Section */}
      <section className="bg-cream-paper py-20 px-6 sm:px-12 md:py-28 border-b border-ash">
        <div className="mx-auto max-w-[1280px]">
          
          <ScrollReveal className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-caption font-graphik uppercase tracking-[0.25em] text-smoke mb-4 block">
              India 2030 Vision
            </span>
            <h2 className="font-nantes text-4xl sm:text-5xl text-ink-black mb-6">
              The future we are building together.
            </h2>
            <p className="text-charcoal text-body font-graphik leading-relaxed">
              GenZ is building India&apos;s trusted B2C manufacturing and innovation platform — connecting manufacturers, startups, innovators, buyers, and investors to strengthen India&apos;s manufacturing ecosystem.
            </p>
          </ScrollReveal>

          {/* Targets Grid */}
          <div className="mb-24">
            <ScrollReveal>
              <h3 className="text-caption font-graphik text-brand-blue uppercase tracking-widest text-center font-medium mb-10">
                Our 2030 Targets
              </h3>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: CheckCircle2,
                  value: "1,00,000+",
                  label: "Verified Indian Manufacturers",
                  desc: "Digitally connected with verified business profiles and product catalogs."
                },
                {
                  icon: Package,
                  value: "10,00,000+",
                  label: "Made-in-India Products",
                  desc: "Helping manufacturers showcase products directly to businesses and buyers."
                },
                {
                  icon: Handshake,
                  value: "5,00,000+",
                  label: "Opportunities Facilitated",
                  desc: "Through B2C connections, supplier discovery, manufacturing partnerships and sourcing."
                },
                {
                  icon: MapPin,
                  value: "Presence Across India",
                  label: "Nationwide Coverage",
                  desc: "Building a manufacturing network covering every Indian state and major industrial clusters."
                }
              ].map((item, idx) => (
                <ScrollReveal key={idx} delay={idx * 100} className="h-full">
                  <div className="bg-pure-white border border-ash p-6 flex flex-col justify-between rounded-none min-h-[220px] h-full group hover:border-forest-green transition-colors duration-300">
                    <div>
                      <div className="h-10 w-10 bg-cream-paper text-forest-green flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="font-nantes text-2xl font-normal text-ink-black mb-1 block">
                        {item.value.includes("+") ? (
                          <CountUp end={item.value} />
                        ) : (
                          item.value
                        )}
                      </span>
                      <span className="font-graphik text-[10px] uppercase tracking-wider text-smoke mb-3 block">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-caption font-graphik leading-relaxed text-charcoal">
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
              <h3 className="text-caption font-graphik text-brand-blue uppercase tracking-widest text-center font-medium mb-10">
                Expected Impact on India
              </h3>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  title: "Strengthen MSMEs",
                  desc: "Help small and medium manufacturers gain national visibility and direct business opportunities."
                },
                {
                  icon: ArrowDownLeft,
                  title: "Reduce Import Dependency",
                  desc: "Promote Indian-made alternatives by making domestic manufacturers easier to discover."
                },
                {
                  icon: Lightbulb,
                  title: "Boost Manufacturing Innovation",
                  desc: "Enable startups and innovators to find manufacturing partners faster."
                },
                {
                  icon: TrendingUp,
                  title: "Increase Domestic Trade",
                  desc: "Create more direct B2C transactions between Indian buyers and manufacturers."
                },
                {
                  icon: Briefcase,
                  title: "Support Employment",
                  desc: "Business growth can lead to more hiring across manufacturing, logistics, and design."
                },
                {
                  icon: Globe,
                  title: "Improve Global Competitiveness",
                  desc: "Help Indian manufacturers become more visible to international buyers in the future."
                }
              ].map((item, idx) => (
                <ScrollReveal key={idx} delay={idx * 80} className="h-full">
                  <div className="bg-pure-white border border-ash p-6 flex gap-4 text-left rounded-none h-full group hover:border-brand-blue transition-colors duration-300">
                    <div className="h-10 w-10 bg-cream-paper text-forest-green flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-nantes text-base text-ink-black mb-1.5">
                        {item.title}
                      </h4>
                      <p className="text-caption font-graphik leading-relaxed text-charcoal">
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
              <h3 className="text-caption font-graphik text-brand-blue uppercase tracking-widest text-center font-medium">
                Our Roadmap
              </h3>
            </ScrollReveal>

            <ScrollReveal>
              <InteractiveTimeline />
            </ScrollReveal>
          </div>

          {/* Long Term Mission */}
          <ScrollReveal>
            <div className="bg-forest-green text-white p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-none border border-ash transition-transform duration-500 hover:scale-[1.005]">
              <div className="lg:col-span-6 text-left">
                <span className="text-gold-yellow text-caption font-graphik uppercase tracking-[0.2em] mb-3 block">
                  Our Long-Term Mission
                </span>
                <p className="font-nantes text-2xl font-light leading-snug mb-0">
                  To become India&apos;s most trusted manufacturing and innovation ecosystem — empowering businesses, supporting production, and reducing import dependency.
                </p>
              </div>

              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: ShieldCheck, title: "TRUST", desc: "Verified businesses for secure connections." },
                  { icon: Eye, title: "TRANSPARENCY", desc: "Building trust through validated details." },
                  { icon: RefreshCw, title: "SUSTAINABILITY", desc: "Promoting domestic manufacture for self-reliance." }
                ].map((val, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-4 flex flex-col items-center text-center group hover:bg-white/10 transition-colors duration-300">
                    <val.icon className="h-5 w-5 text-gold-yellow mb-2.5 transition-transform duration-300 group-hover:scale-110" />
                    <span className="font-graphik text-[9px] font-medium uppercase tracking-wider text-white mb-1.5 block">{val.title}</span>
                    <p className="text-[10px] text-white/70 leading-normal">{val.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Institutional Verification Row */}
      <section className="border-b border-ash px-6 py-16 sm:px-12 bg-pure-white">
        <ScrollReveal className="mx-auto max-w-[1280px] text-center">
          <span className="text-[10px] font-graphik text-smoke uppercase tracking-[0.25em] mb-8 block">
            Institutional verification
          </span>
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-20 opacity-90">
            <span className="font-graphik text-lg font-semibold tracking-tighter text-brand-blue hover:scale-105 transition-transform">sidbi</span>
            <span className="font-graphik text-lg font-semibold tracking-tighter text-red-700 hover:scale-105 transition-transform">NSIC</span>
            <span className="font-graphik text-base font-medium tracking-wide text-neutral-800 uppercase hover:scale-105 transition-transform">DPIIT</span>
            <span className="font-graphik text-xs font-medium tracking-widest text-neutral-800 uppercase border border-neutral-800 px-3 py-1.5 hover:bg-neutral-800 hover:text-white transition-colors">
              MAKE IN INDIA
            </span>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <ScrollReveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center sm:px-12">
          <h2 className="font-nantes text-3xl sm:text-5xl text-ink-black mb-4">
            Be part of the founding cohort.
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-none bg-forest-green text-white hover:bg-forest-mid px-6 font-graphik text-xs font-normal tracking-wider uppercase border-none transition-transform hover:scale-102"
            >
              <Link href="/#waitlist">Join the Waitlist</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-ink-black border border-ash hover:bg-cream-paper h-12 rounded-none px-6 font-graphik text-xs font-normal tracking-wider uppercase bg-transparent transition-transform hover:scale-102"
            >
              <Link href="/contact">Get in touch</Link>
            </Button>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
