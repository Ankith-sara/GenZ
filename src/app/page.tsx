import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Video,
  Layers,
  Play,
  LineChart,
  Lightbulb,
  Users,
  Search,
  Heart,
  MessageCircle,
  Share2,
  Star
} from "lucide-react";
import { WaitlistForm } from "@/components/waitlist-form";
import { Button } from "@/components/ui/button";
import { getUserAndProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { cookies } from "next/headers";
import { MainHeader } from "@/components/main-header";

export default async function HomePage() {
  const [session, cookieStore] = await Promise.all([
    getUserAndProfile(),
    cookies(),
  ]);
  const isLoggedIn = !!session;
  const role = session?.profile?.role;
  const hasJoinedWaitlist = cookieStore.get("waitlist_joined")?.value === "true";

  return (
    <div className="bg-white flex min-h-screen flex-col font-sans text-black antialiased">
      {/* Premium Main Header */}
      <MainHeader
        isLoggedIn={isLoggedIn}
        role={role}
        userName={session?.profile?.full_name || session?.email}
        signOutAction={signOut}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-forest-green text-white pt-16 pb-20 px-6 sm:px-12 relative overflow-hidden">
          {/* Subtle gold grid pattern or gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

          <div className="mx-auto max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Vision & Action */}
              <div className="lg:col-span-7 flex flex-col justify-center text-left">
                <span className="text-gold-yellow text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
                  Our Vision
                </span>
                <h1 className="font-serif text-4xl sm:text-6xl font-normal leading-[1.1] tracking-tight text-white mb-6">
                  From Import Dependency <br />
                  to <span className="text-gold-yellow font-serif">Innovation &amp; Global Opportunity</span>
                </h1>
                <p className="text-white/80 max-w-2xl text-base sm:text-lg font-sans font-normal leading-relaxed tracking-wide mb-8">
                  A trusted platform that connects Indian consumers with verified Indian manufacturers, drives innovation and turns India&apos;s demand into Indian manufacturing growth.
                </p>

                <div className="flex flex-wrap gap-4 mb-12">
                  <Button asChild size="lg" className="bg-gold-yellow text-forest-green hover:bg-gold-yellow/90 rounded-[4px] font-sans font-bold text-sm tracking-wider uppercase px-6 h-12 border-none">
                    <a href="#waitlist">Explore Made in India</a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border border-white/30 text-white hover:bg-white/10 rounded-[4px] font-sans font-medium text-sm tracking-wider uppercase px-6 h-12 bg-transparent">
                    <Link href="/discover">For Manufacturers</Link>
                  </Button>
                </div>

                {/* Bullets Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-8">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-gold-yellow shrink-0" />
                    <span className="text-xs sm:text-sm font-medium tracking-wide text-white/95">100% Verified Indian Manufacturers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-gold-yellow shrink-0" />
                    <span className="text-xs sm:text-sm font-medium tracking-wide text-white/95">No Imports, No Fake Resellers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-gold-yellow shrink-0" />
                    <span className="text-xs sm:text-sm font-medium tracking-wide text-white/95">GST Verified, Factory Validated</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-gold-yellow shrink-0" />
                    <span className="text-xs sm:text-sm font-medium tracking-wide text-white/95">Trusted by Consumers, Built for India</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Glow Map & Collage */}
              <div className="lg:col-span-5 relative w-full flex flex-col items-center">
                {/* Mobile View Collage */}
                <div className="w-full grid grid-cols-3 gap-3 md:hidden">
                  <div className="relative h-24 rounded overflow-hidden border border-white/10">
                    <Image src="/machine_work.png" alt="Machining" fill className="object-cover" sizes="120px" />
                  </div>
                  <div className="relative h-24 rounded overflow-hidden border border-white/10">
                    <Image src="/female_worker.png" alt="Engineer" fill className="object-cover" sizes="120px" />
                  </div>
                  <div className="relative h-24 rounded overflow-hidden border border-white/10">
                    <Image src="/indian_craftsman.png" alt="Craftsman" fill className="object-cover" sizes="120px" />
                  </div>
                </div>

                {/* Tablet/Desktop View Overlay Collage */}
                <div className="hidden md:block relative w-full h-[520px] bg-forest-green rounded-lg overflow-hidden border border-white/5 shadow-inner">
                  {/* Glowing map of India in background */}
                  <Image
                    src="/india_glow_map.png"
                    alt="India glowing map"
                    fill
                    className="object-contain opacity-35 p-6"
                    sizes="480px"
                    priority
                  />

                  {/* Centered Map Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none z-10">
                    <h2 className="text-xl font-bold tracking-[0.25em] text-gold-yellow font-serif uppercase">
                      MADE IN INDIA
                    </h2>
                    <p className="text-[10px] font-semibold tracking-widest text-white/80 uppercase mt-0.5">
                      MADE FOR THE WORLD
                    </p>
                  </div>

                  {/* Image 1: Machinist (Top-Left) */}
                  <div className="absolute top-6 left-6 w-36 h-36 rounded-[4px] border border-white/10 overflow-hidden shadow-2xl z-20 hover:scale-105 transition-transform duration-300">
                    <Image src="/machine_work.png" alt="Machinist" fill className="object-cover" sizes="150px" />
                  </div>

                  {/* Image 2: Female Engineer (Middle-Right) */}
                  <div className="absolute top-12 right-6 w-36 h-48 rounded-[4px] border border-white/10 overflow-hidden shadow-2xl z-20 hover:scale-105 transition-transform duration-300">
                    <Image src="/female_worker.png" alt="Female Engineer" fill className="object-cover" sizes="150px" />
                  </div>

                  {/* Image 3: Craftsman Hands (Bottom-Left) */}
                  <div className="absolute bottom-6 left-12 w-48.5 h-36 rounded-[4px] border border-white/10 overflow-hidden shadow-2xl z-20 hover:scale-105 transition-transform duration-300">
                    <Image src="/indian_craftsman.png" alt="Artisan Crafts" fill className="object-cover" sizes="200px" />
                  </div>
                </div>

                {/* Pill at Bottom Right */}
                <div className="md:absolute md:bottom-2 md:right-2 mt-4 md:mt-0 bg-[#07170f] border border-gold-yellow/30 px-5 py-2 rounded-full shadow-lg z-30">
                  <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-gold-yellow uppercase block text-center">
                    Play Desi. Be Desi. Proudly Desi.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Core Pillars Section */}
        <section className="bg-white py-24 px-6 sm:px-12 border-b border-light-gray-bg">
          <div className="mx-auto max-w-7xl text-center">
            <span className="text-gold-yellow text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
              Our Core Pillars
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-black font-normal tracking-tight mb-16">
              The Foundations of GenZ Trust
            </h2>

            {/* Grid of 5 pillars */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {/* Trust Layer */}
              <div className="flex flex-col items-center p-6 bg-light-gray-bg rounded-lg border border-gray-100 hover:border-gold-yellow/30 hover:shadow-md transition-all">
                <div className="h-12 w-12 bg-forest-green/5 border border-forest-green/10 flex items-center justify-center rounded-full mb-4">
                  <ShieldCheck className="h-6 w-6 text-forest-green" />
                </div>
                <h3 className="font-serif text-lg font-medium text-black mb-3">Trust Layer</h3>
                <p className="text-xs text-smoke leading-relaxed text-center font-sans">
                  GST verification, factory validation &amp; certification checks for 100% trust.
                </p>
              </div>

              {/* Reel-Based Discovery */}
              <div className="flex flex-col items-center p-6 bg-light-gray-bg rounded-lg border border-gray-100 hover:border-gold-yellow/30 hover:shadow-md transition-all">
                <div className="h-12 w-12 bg-forest-green/5 border border-forest-green/10 flex items-center justify-center rounded-full mb-4">
                  <Play className="h-6 w-6 text-forest-green fill-forest-green/20" />
                </div>
                <h3 className="font-serif text-lg font-medium text-black mb-3">Reel-Based</h3>
                <p className="text-xs text-smoke leading-relaxed text-center font-sans">
                  Real factory reels. Real process. Real people. See who makes what you buy.
                </p>
              </div>

              {/* Import Gap Intelligence */}
              <div className="flex flex-col items-center p-6 bg-light-gray-bg rounded-lg border border-gray-100 hover:border-gold-yellow/30 hover:shadow-md transition-all">
                <div className="h-12 w-12 bg-forest-green/5 border border-forest-green/10 flex items-center justify-center rounded-full mb-4">
                  <LineChart className="h-6 w-6 text-forest-green" />
                </div>
                <h3 className="font-serif text-lg font-medium text-black mb-3">Import Gap</h3>
                <p className="text-xs text-smoke leading-relaxed text-center font-sans">
                  We identify what India imports and turn it into opportunities for Indian manufacturers.
                </p>
              </div>

              {/* Innovation & Design */}
              <div className="flex flex-col items-center p-6 bg-light-gray-bg rounded-lg border border-gray-100 hover:border-gold-yellow/30 hover:shadow-md transition-all">
                <div className="h-12 w-12 bg-forest-green/5 border border-forest-green/10 flex items-center justify-center rounded-full mb-4">
                  <Lightbulb className="h-6 w-6 text-forest-green" />
                </div>
                <h3 className="font-serif text-lg font-medium text-black mb-3">Innovation &amp; Design</h3>
                <p className="text-xs text-smoke leading-relaxed text-center font-sans">
                  Encouraging Indian creativity to redesign, innovate and build products.
                </p>
              </div>

              {/* Direct Market Access */}
              <div className="flex flex-col items-center p-6 bg-light-gray-bg rounded-lg border border-gray-100 hover:border-gold-yellow/30 hover:shadow-md transition-all">
                <div className="h-12 w-12 bg-forest-green/5 border border-forest-green/10 flex items-center justify-center rounded-full mb-4">
                  <Users className="h-6 w-6 text-forest-green" />
                </div>
                <h3 className="font-serif text-lg font-medium text-black mb-3">Direct Access</h3>
                <p className="text-xs text-smoke leading-relaxed text-center font-sans">
                  Manufacturers connect directly with consumers. No middlemen. No unfair margins.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Makes Us Different Section */}
        <section className="bg-light-gray-bg py-24 px-6 sm:px-12 border-b border-gray-200">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <span className="text-gold-yellow text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
                What Makes Us Different
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-black font-normal tracking-tight">
                How GenZ Changes the Game
              </h2>
            </div>

            {/* Grid of 3 Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Card 1: Video Reels */}
              <div className="bg-forest-green text-white rounded-lg p-8 flex flex-col justify-between h-[450px] shadow-lg border border-white/5 relative overflow-hidden group">
                <div>
                  <h3 className="font-serif text-2xl font-normal mb-3 text-white">
                    We Show <span className="text-gold-yellow">Who Makes</span> What You Buy
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed font-sans">
                    Watch real reels from real factories. Complete transparency builds complete trust.
                  </p>
                </div>

                {/* iPhone Reel Mockup */}
                <div className="relative w-48 h-64 mx-auto -mb-12 border-4 border-white/20 bg-black rounded-2xl overflow-hidden shadow-2xl mt-4">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-white/25 rounded-full z-30" />
                  {/* Inside Screen */}
                  <div className="relative w-full h-full">
                    {/* Machinist thumbnail inside screen */}
                    <Image
                      src="/machine_work.png"
                      alt="Reel Screen"
                      fill
                      className="object-cover brightness-95 opacity-80"
                      sizes="180px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    {/* Play Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-10 w-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-4.5 w-4.5 text-white fill-white" />
                      </div>
                    </div>
                    {/* Overlay Info */}
                    <div className="absolute bottom-4 left-3 text-left">
                      <span className="text-[8px] bg-gold-yellow text-forest-green font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                        Precision
                      </span>
                      <p className="text-[10px] font-semibold mt-1 text-white">Precision. Passion.</p>
                      <p className="text-[8px] text-white/70">Made in India.</p>
                    </div>
                    {/* Reel Interactions */}
                    <div className="absolute bottom-4 right-2 flex flex-col gap-2 items-center text-white/95">
                      <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                      <MessageCircle className="h-3.5 w-3.5" />
                      <Share2 className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Import data */}
              <div className="bg-forest-green text-white rounded-lg p-8 flex flex-col justify-between h-[450px] shadow-lg border border-white/5 relative overflow-hidden group">
                <div>
                  <h3 className="font-serif text-2xl font-normal mb-3 text-white">
                    We Turn Import Data into <span className="text-gold-yellow">Indian Opportunities</span>
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed font-sans">
                    Our engine shows the top imported products India needs — so you know what to build.
                  </p>
                </div>

                {/* Import Chart Graphic */}
                <div className="w-full flex flex-col items-center my-4 mt-6">
                  {/* Styled SVG Chart */}
                  <svg className="w-full h-32 text-gold-yellow" viewBox="0 0 200 80">
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ebb812" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#ebb812" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 10 70 Q 40 50 70 60 T 130 30 T 190 10 L 190 70 L 10 70 Z"
                      fill="url(#grad)"
                    />
                    <path
                      d="M 10 70 Q 40 50 70 60 T 130 30 T 190 10"
                      fill="none"
                      stroke="#ebb812"
                      strokeWidth="2.5"
                      className="path-draw"
                    />
                    <circle cx="130" cy="30" r="3.5" fill="#0b2216" stroke="#ebb812" strokeWidth="2" />
                    <circle cx="190" cy="10" r="3.5" fill="#ebb812" />
                  </svg>
                  {/* Container ship silhouette */}
                  <span className="text-[10px] text-white/50 uppercase tracking-widest font-sans mt-2">
                    Top Import Categories: Electronics, Wood Toys, Spares
                  </span>
                </div>

                <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full rounded-[4px] h-11 uppercase text-xs font-semibold tracking-wider bg-transparent">
                  <Link href="/discover?import_gap=true">Explore Import Gaps</Link>
                </Button>
              </div>

              {/* Card 3: Innovation */}
              <div className="bg-forest-green text-white rounded-lg p-8 flex flex-col justify-between h-[450px] shadow-lg border border-white/5 relative overflow-hidden group">
                <div>
                  <h3 className="font-serif text-2xl font-normal mb-3 text-white">
                    We Promote <span className="text-gold-yellow">Innovation</span>, Not Just Manufacturing
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed font-sans">
                    Innovate. Redesign. Create better. Stand out globally.
                  </p>
                </div>

                {/* Speaker rendering illustration */}
                <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-2">
                  <div className="w-28 h-36 bg-neutral-900 border border-neutral-800 rounded-xl relative shadow-2xl flex flex-col items-center p-2.5 overflow-hidden">
                    {/* Metal speaker mesh texture */}
                    <div className="w-full h-24 bg-neutral-950 rounded-lg flex flex-col items-center justify-center relative overflow-hidden border border-neutral-800">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
                      <div className="h-10 w-10 rounded-full border border-neutral-700 bg-black flex items-center justify-center">
                        <div className="h-5 w-5 rounded-full bg-gold-yellow/80" />
                      </div>
                    </div>
                    {/* Premium wood base base */}
                    <div className="w-full h-8 bg-[#8b5a2b] border-t border-neutral-800 mt-2 rounded-md flex items-center justify-between px-3 text-[8px] text-white/60 font-sans">
                      <span>WOODEN BASE</span>
                      <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>

                <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full rounded-[4px] h-11 uppercase text-xs font-semibold tracking-wider bg-transparent">
                  <Link href="/discover?innovations=true">Discover Innovations</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white py-24 px-6 sm:px-12 border-b border-light-gray-bg">
          <div className="mx-auto max-w-7xl text-center">
            <span className="text-gold-yellow text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
              How It Works
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-black font-normal tracking-tight mb-16">
              Simplifying the B2C Supply Chain
            </h2>

            {/* Horizontal flow container */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center relative z-10 group">
                <div className="h-14 w-14 bg-forest-green text-white rounded-full flex items-center justify-center text-lg font-bold border-4 border-white shadow-md mb-6 relative">
                  1
                  <div className="absolute -bottom-1 right-0 bg-gold-yellow rounded-full p-1 border border-forest-green">
                    <Search className="h-2.5 w-2.5 text-forest-green" />
                  </div>
                </div>
                <h3 className="font-serif text-lg font-medium text-black mb-2">Discover Products</h3>
                <p className="text-xs text-smoke leading-relaxed text-center font-sans max-w-xs">
                  Explore verified products &amp; manufacturers across India.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center relative z-10 group">
                <div className="h-14 w-14 bg-forest-green text-white rounded-full flex items-center justify-center text-lg font-bold border-4 border-white shadow-md mb-6 relative">
                  2
                  <div className="absolute -bottom-1 right-0 bg-gold-yellow rounded-full p-1 border border-forest-green">
                    <Video className="h-2.5 w-2.5 text-forest-green" />
                  </div>
                </div>
                <h3 className="font-serif text-lg font-medium text-black mb-2">Watch Factory Reels</h3>
                <p className="text-xs text-smoke leading-relaxed text-center font-sans max-w-xs">
                  See how it&apos;s made. Builds direct trust and quality validation.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center relative z-10 group">
                <div className="h-14 w-14 bg-forest-green text-white rounded-full flex items-center justify-center text-lg font-bold border-4 border-white shadow-md mb-6 relative">
                  3
                  <div className="absolute -bottom-1 right-0 bg-gold-yellow rounded-full p-1 border border-forest-green">
                    <Layers className="h-2.5 w-2.5 text-forest-green" />
                  </div>
                </div>
                <h3 className="font-serif text-lg font-medium text-black mb-2">Buy Directly</h3>
                <p className="text-xs text-smoke leading-relaxed text-center font-sans max-w-xs">
                  Connect with the makers. No middlemen. Better wholesale pricing.
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center relative z-10 group">
                <div className="h-14 w-14 bg-forest-green text-white rounded-full flex items-center justify-center text-lg font-bold border-4 border-white shadow-md mb-6 relative">
                  4
                  <div className="absolute -bottom-1 right-0 bg-gold-yellow rounded-full p-1 border border-forest-green">
                    <ShieldCheck className="h-2.5 w-2.5 text-forest-green" />
                  </div>
                </div>
                <h3 className="font-serif text-lg font-medium text-black mb-2">Support Indian Growth</h3>
                <p className="text-xs text-smoke leading-relaxed text-center font-sans max-w-xs">
                  Every purchase builds India, driving local manufacture and innovation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who It's For Section */}
        <section className="bg-light-gray-bg py-24 px-6 sm:px-12 border-b border-gray-200">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <span className="text-gold-yellow text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
                Who It&apos;s For
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-black font-normal tracking-tight">
                Designed for All Indian Stakeholders
              </h2>
            </div>

            {/* 5-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Card 1: Consumers */}
              <div className="bg-white rounded-md border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-[280px]">
                <div className="relative h-32 w-full">
                  <Image src="/female_worker.png" alt="Consumers" fill className="object-cover" sizes="220px" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between text-left">
                  <h3 className="font-serif text-base font-semibold text-black">Consumers</h3>
                  <p className="text-[11px] text-smoke leading-relaxed font-sans mt-1">
                    Get trusted, high-quality Indian products directly from source.
                  </p>
                </div>
              </div>

              {/* Card 2: Manufacturers */}
              <div className="bg-white rounded-md border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-[280px]">
                <div className="relative h-32 w-full">
                  <Image src="/machine_work.png" alt="Manufacturers" fill className="object-cover" sizes="220px" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between text-left">
                  <h3 className="font-serif text-base font-semibold text-black">Manufacturers</h3>
                  <p className="text-[11px] text-smoke leading-relaxed font-sans mt-1">
                    Get visibility, demand insights &amp; direct consumer base.
                  </p>
                </div>
              </div>

              {/* Card 3: Startups & Innovators */}
              <div className="bg-white rounded-md border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-[280px]">
                <div className="relative h-32 w-full">
                  <Image src="/founder.jpeg" alt="Startups & Innovators" fill className="object-cover" sizes="220px" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between text-left">
                  <h3 className="font-serif text-base font-semibold text-black">Startups</h3>
                  <p className="text-[11px] text-smoke leading-relaxed font-sans mt-1">
                    Find manufacturing opportunities and build innovative products.
                  </p>
                </div>
              </div>

              {/* Card 4: Students & Creators */}
              <div className="bg-white rounded-md border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-[280px]">
                <div className="relative h-32 w-full">
                  <Image src="/indian_craftsman.png" alt="Students & Creators" fill className="object-cover" sizes="220px" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between text-left">
                  <h3 className="font-serif text-base font-semibold text-black">Creators</h3>
                  <p className="text-[11px] text-smoke leading-relaxed font-sans mt-1">
                    Learn, showcase innovative ideas and build your brand.
                  </p>
                </div>
              </div>

              {/* Card 5: Investors & Partners */}
              <div className="bg-white rounded-md border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-[280px]">
                <div className="relative h-32 w-full">
                  <Image src="/india_glow_map.png" alt="Investors" fill className="object-cover" sizes="220px" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between text-left">
                  <h3 className="font-serif text-base font-semibold text-black">Investors</h3>
                  <p className="text-[11px] text-smoke leading-relaxed font-sans mt-1">
                    Discover verified manufacturers &amp; high-potential opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission In Numbers Section */}
        <section className="bg-forest-green text-white py-24 px-6 sm:px-12 border-b border-white/10">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left side stats grid */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
                <div className="border-l-2 border-gold-yellow pl-5">
                  <p className="text-3xl sm:text-4xl font-serif text-gold-yellow font-normal">10,000+</p>
                  <p className="text-xs uppercase tracking-wider text-white/70 mt-1">Verified Manufacturers</p>
                </div>
                <div className="border-l-2 border-gold-yellow pl-5">
                  <p className="text-3xl sm:text-4xl font-serif text-gold-yellow font-normal">1,00,000+</p>
                  <p className="text-xs uppercase tracking-wider text-white/70 mt-1">Products &amp; Innovations</p>
                </div>
                <div className="border-l-2 border-gold-yellow pl-5">
                  <p className="text-3xl sm:text-4xl font-serif text-gold-yellow font-normal">500+</p>
                  <p className="text-xs uppercase tracking-wider text-white/70 mt-1">Import Gaps Identified</p>
                </div>
                <div className="border-l-2 border-gold-yellow pl-5">
                  <p className="text-3xl sm:text-4xl font-serif text-gold-yellow font-normal">1M+</p>
                  <p className="text-xs uppercase tracking-wider text-white/70 mt-1">Jobs &amp; Livelihoods</p>
                </div>
                <div className="border-l-2 border-gold-yellow pl-5 sm:col-span-2">
                  <p className="text-xl sm:text-2xl font-serif text-white font-normal">1 Vision: A Stronger, Self-Reliant India</p>
                </div>
              </div>

              {/* Right side Goal callout */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <div className="bg-[#0c1a11] border border-gold-yellow/20 rounded-md p-8 text-left">
                  <span className="text-gold-yellow text-xs font-semibold tracking-wider uppercase mb-3 block">
                    Our Ultimate Goal
                  </span>
                  <h3 className="font-serif text-xl font-normal text-white mb-4">
                    10,000,000+ Indian Businesses by 2030
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed font-sans">
                    To build the world&apos;s most trusted B2C commerce platform for Indian manufacturing, driving local production, self-reliance, and international reach.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators Section */}
        <section className="bg-white py-20 px-6 sm:px-12 border-b border-light-gray-bg">
          <div className="mx-auto max-w-7xl flex flex-col gap-14 text-center">
            {/* Trusted By logos row */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] text-smoke uppercase tracking-[0.25em] font-sans font-semibold">
                TRUSTED BY
              </span>
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-75">
                <span className="text-xl font-black tracking-tighter text-blue-900 font-sans">sidbi</span>
                <span className="text-xl font-black tracking-tighter text-red-800 font-sans">NSIC</span>
                <span className="text-lg font-bold tracking-tight text-neutral-800 font-sans uppercase">DPIIT</span>
                <span className="text-sm font-semibold tracking-widest text-neutral-800 font-serif uppercase border-2 border-neutral-800 px-3 py-1">
                  MAKE IN INDIA
                </span>
              </div>
            </div>

            {/* Testimonial callout */}
            <div className="bg-light-gray-bg border border-gray-100 rounded-lg p-8 max-w-3xl mx-auto flex flex-col items-center">
              <div className="flex gap-1 text-gold-yellow mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4.5 w-4.5 fill-gold-yellow text-gold-yellow" />
                ))}
              </div>
              <blockquote className="font-serif text-lg text-black italic text-center mb-6 leading-relaxed">
                &ldquo;GenZ is not just a platform, it&apos;s a movement to bring our roots back to life.&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                  <Image src="/founder.jpeg" alt="User portrait" fill className="object-cover" sizes="40px" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-black">Appala Sairam</h4>
                  <p className="text-[10px] text-smoke">Founder &amp; Delivery Partner, GenZ</p>
                </div>
              </div>
            </div>

            {/* As Featured In logos row */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] text-smoke uppercase tracking-[0.25em] font-sans font-semibold">
                AS FEATURED IN
              </span>
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75">
                <span className="text-base font-bold text-red-600 font-sans">YOURSTORY</span>
                <span className="text-base font-black text-black font-sans tracking-tight">Inc<span className="text-gold-yellow">42</span></span>
                <span className="text-sm font-bold text-neutral-800 font-serif italic uppercase">The Economic Times</span>
                <span className="text-base font-bold text-orange-500 font-sans">StartupIndia</span>
              </div>
            </div>
          </div>
        </section>

        {/* Waitlist/Movement Section */}
        <section id="waitlist" className="bg-forest-green text-white py-24 px-6 sm:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Side: Call to action */}
              <div className="lg:col-span-6 text-left flex flex-col justify-center">
                <span className="text-gold-yellow text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
                  Be Part of the Movement
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight tracking-tight text-white mb-6">
                  Join the Founding Cohort
                </h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed font-sans mb-8">
                  Support local. Choose sustainable. Build a better future. We are onboarding select buyers and verified manufacturers for our private launch. Reserve your place today.
                </p>

                <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1.5 block">For Consumers</span>
                    <Link href="/discover" className="text-gold-yellow hover:underline text-sm font-bold flex items-center gap-1 uppercase tracking-wider">
                      Explore Now <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1.5 block">For Manufacturers</span>
                    <Link href="/dashboard" className="text-gold-yellow hover:underline text-sm font-bold flex items-center gap-1 uppercase tracking-wider">
                      Join Now <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Side: Waitlist form card */}
              <div className="lg:col-span-6 w-full max-w-xl mx-auto">
                {hasJoinedWaitlist ? (
                  <div className="border border-white/10 bg-[#07170f] rounded-lg p-10 text-center animate-fade-in shadow-xl">
                    <div className="bg-white/10 text-white border border-white/20 mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-normal tracking-[0.11em] uppercase font-sans">
                      <ShieldCheck className="h-3.5 w-3.5 text-gold-yellow" /> Active Waitlist Member
                    </div>
                    <h3 className="font-serif text-2xl text-white leading-tight mb-4">
                      You&apos;re on the list!
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm font-sans tracking-wide leading-relaxed">
                      We have reserved your spot in the GenZ cohort. We will reach out with your invitation credentials soon.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-md shadow-2xl overflow-hidden p-1.5">
                    <WaitlistForm />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Styled Footer */}
      <footer className="bg-light-gray-bg text-black border-t border-gray-200 py-16 px-6 sm:px-12 text-left">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            {/* Column 1: Branding */}
            <div className="col-span-2 flex flex-col justify-start">
              <Link href="/" className="flex items-baseline gap-0.5">
                <span className="text-2xl font-bold tracking-tight text-forest-green">Gen</span>
                <span className="text-2xl font-black tracking-tight text-gold-yellow">Z</span>
              </Link>
              <p className="text-xs text-smoke leading-relaxed font-sans mt-3 mb-6 max-w-xs">
                A trust commerce and manufacturing platform connecting verified makers directly with buyers.
              </p>
              {/* Social icons */}
              <div className="flex gap-4 text-smoke">
                <a href="#" className="hover:text-gold-yellow"><span className="sr-only">Facebook</span>f</a>
                <a href="#" className="hover:text-gold-yellow"><span className="sr-only">Twitter</span>t</a>
                <a href="#" className="hover:text-gold-yellow"><span className="sr-only">LinkedIn</span>in</a>
                <a href="#" className="hover:text-gold-yellow"><span className="sr-only">Instagram</span>ig</a>
              </div>
            </div>

            {/* Column 2: Company */}
            <div>
              <h4 className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-4">Company</h4>
              <ul className="space-y-2.5 text-xs text-smoke font-sans">
                <li><Link href="/about" className="hover:text-black">About Us</Link></li>
                <li><Link href="/about#mission" className="hover:text-black">Our Mission</Link></li>
                <li><a href="#" className="hover:text-black">Careers</a></li>
                <li><a href="#" className="hover:text-black">Blog</a></li>
                <li><Link href="/contact" className="hover:text-black">Contact Us</Link></li>
              </ul>
            </div>

            {/* Column 3: For Consumers */}
            <div>
              <h4 className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-4">For Consumers</h4>
              <ul className="space-y-2.5 text-xs text-smoke font-sans">
                <li><Link href="/discover" className="hover:text-black">Shop Products</Link></li>
                <li><Link href="/discover?origin=india" className="hover:text-black">Made in India</Link></li>
                <li><Link href="/discover?innovations=true" className="hover:text-black">Innovations</Link></li>
                <li><Link href="/discover" className="hover:text-black">Categories</Link></li>
              </ul>
            </div>

            {/* Column 4: For Manufacturers */}
            <div>
              <h4 className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-4">Manufacturers</h4>
              <ul className="space-y-2.5 text-xs text-smoke font-sans">
                <li><Link href="/dashboard" className="hover:text-black">Join as Manufacturer</Link></li>
                <li><Link href="/dashboard" className="hover:text-black">Benefits</Link></li>
                <li><Link href="/dashboard" className="hover:text-black">Resources</Link></li>
                <li><Link href="/dashboard" className="hover:text-black">Success Stories</Link></li>
              </ul>
            </div>

            {/* Column 5: Import Gap */}
            <div>
              <h4 className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-4">Import Gap</h4>
              <ul className="space-y-2.5 text-xs text-smoke font-sans">
                <li><Link href="/discover?import_gap=true" className="hover:text-black">Top Import Gaps</Link></li>
                <li><Link href="/discover?import_gap=true" className="hover:text-black">Opportunity Finder</Link></li>
                <li><Link href="/discover?import_gap=true" className="hover:text-black">Reports &amp; Insights</Link></li>
              </ul>
            </div>
          </div>

          <hr className="border-gray-200 mb-8" />

          {/* Bottom Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-smoke font-sans">
            <p>&copy; {new Date().getFullYear()} GenZ Trust Commerce. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-black">Help Center</a>
              <a href="#" className="hover:text-black">FAQs</a>
              <a href="#" className="hover:text-black">Terms &amp; Conditions</a>
              <a href="#" className="hover:text-black">Privacy Policy</a>
            </div>
            <p className="flex items-center gap-1">
              Designed &amp; Built in India <span className="text-sm">🇮🇳</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
