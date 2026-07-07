import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getUserAndProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { MainHeader } from "@/components/main-header";
import { 
  CheckCircle2, Package, Handshake, MapPin, Users, ArrowDownLeft, 
  Lightbulb, TrendingUp, Briefcase, Globe, Rocket, LineChart, 
  Settings, Share2, Trophy, ShieldCheck, Eye, RefreshCw 
} from "lucide-react";

export default async function AboutPage() {
  const session = await getUserAndProfile();
  const isLoggedIn = !!session;
  const role = session?.profile?.role;

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
        {/* About Hero Section */}
        <section className="bg-forest-green text-white py-20 px-6 sm:px-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
          <div className="mx-auto max-w-4xl text-center relative z-10">
            <span className="text-gold-yellow text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
              Our Story
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-normal leading-[1.1] tracking-tight text-white mb-6">
              Built by someone who refused <br />
              to <span className="text-gold-yellow font-serif">accept the excuse</span>
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto text-base sm:text-lg font-sans font-normal leading-relaxed tracking-wide">
              Every founder has a moment that will not let them go. This is the one that became GenZ.
            </p>
          </div>
        </section>

        {/* Founder Story & Profile section */}
        <section className="bg-white py-24 px-6 sm:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Left Column: Founder Photo & Primary Quote */}
              <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left sticky top-28">
                {/* Profile Image container */}
                <div className="relative h-44 w-44 rounded-md overflow-hidden border-2 border-gold-yellow/20 bg-light-gray-bg shadow-xl mb-6">
                  <Image
                    src="/founder.jpeg"
                    alt="Appala Sairam"
                    fill
                    className="object-cover"
                    sizes="176px"
                    priority
                  />
                </div>
                <h2 className="font-serif text-2xl font-normal text-black mb-1">
                  Appala Sairam
                </h2>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-yellow mb-6">
                  Founder &amp; Delivery Partner, GenZ
                </p>

                {/* Left side Callout quote */}
                <div className="border-l-4 border-gold-yellow pl-5 py-2 text-left bg-light-gray-bg rounded-r-md p-4 w-full">
                  <p className="font-serif text-base italic text-forest-green leading-relaxed">
                    &ldquo;India does not lack talent. It lacks a trusted system that connects talent with opportunity.&rdquo;
                  </p>
                  <span className="text-[10px] text-smoke uppercase tracking-wider block mt-3 font-sans font-bold">
                    GenZ Founding Charter
                  </span>
                </div>
              </div>

              {/* Right Column: The narrative */}
              <div className="lg:col-span-8 text-left space-y-6 font-sans text-base leading-relaxed tracking-wide text-charcoal">
                <h3 className="font-serif text-3xl font-normal text-black mb-6 border-b border-gray-100 pb-2">
                  Founder Story
                </h3>
                
                <p className="font-medium text-lg text-forest-green">
                  My name is Appala Sairam, and I founded GenZ at the age of 23.
                </p>

                <p>
                  This journey began while I was studying for my Bachelor of Business Administration in the United Kingdom.
                </p>

                <p>
                  At the time, I was working in a restaurant where I was the only Indian on the team. Most of my colleagues were from Pakistan. From the beginning, I often felt different. There were jokes about my accent, my appearance, and sometimes even comments about India that were difficult to hear.
                </p>

                <p>
                  I tried to ignore them and focus on my work.
                </p>

                <p>
                  But during Operation Sindoor, the conversations became more intense. People openly questioned India&apos;s strength and future. As an Indian living far from home, those moments were not easy.
                </p>

                <p>
                  One day, while defending my country, I compared India&apos;s progress with Pakistan.
                </p>

                <p className="font-semibold text-forest-green">
                  The response I received changed my life.
                </p>

                <div className="bg-light-gray-bg border-l-4 border-gold-yellow p-4 my-6 italic text-lg text-forest-green font-serif">
                  &ldquo;Why do you always compare India with Pakistan? Compare India with China and the United States.&rdquo;
                </div>

                <p>
                  That sentence stayed in my mind. I could not stop thinking about it.
                </p>

                <p>
                  For the next two months, I spent countless hours researching, reading, and trying to understand why countries like China and the United States had become global leaders in manufacturing, innovation, and economic growth.
                </p>

                <p>
                  The deeper I looked, the more I realized something important: <strong>India does not lack talent.</strong>
                </p>

                <p>
                  We have brilliant innovators, skilled manufacturers, hardworking artisans, ambitious entrepreneurs, talented students, and millions of people with ideas that can change lives.
                </p>

                <p>
                  Yet many of them remain unseen. Many struggle to gain trust, visibility, opportunities, and access to markets. Consumers often do not know who is actually making products. Small manufacturers struggle to get noticed. Great ideas remain hidden.
                </p>

                <p className="font-medium text-black">
                  That realization became the foundation of GenZ.
                </p>

                <p>
                  I returned to India with a dream and a strong belief that if I shared this vision, people would help me bring it to life. I met politicians, incubators, institutions, and organizations across the country. Many appreciated the idea. Many said the vision was powerful.
                </p>

                <p>
                  But as time passed, I realized that believing in an idea and helping build it are two different things. The support I hoped for did not come. There were moments of disappointment, frustration, and doubt. But every setback only strengthened my determination. I knew this was a problem worth solving.
                </p>

                <p>
                  As my savings slowly ran out, I needed a way to support myself while continuing to work on my dream. <strong>So I became a Zomato delivery partner.</strong>
                </p>

                <p>
                  Every day, I delivered food to earn a living. Every night, I worked on GenZ. While others saw a delivery partner, I saw someone taking one more step toward a vision that refused to leave his mind.
                </p>

                <p>
                  Today, GenZ is more than a startup. It is the result of a question that changed my life—a question that forced me to look beyond excuses and search for solutions.
                </p>

                <div className="bg-forest-green text-white p-6 rounded-lg my-8 text-center">
                  <p className="text-gold-yellow text-xs font-bold tracking-wider uppercase mb-2">Our Founding Belief</p>
                  <p className="font-serif text-xl sm:text-2xl font-normal leading-relaxed">
                    India does not lack talent. It lacks a trusted system that connects talent with opportunity.
                  </p>
                </div>

                <p>
                  My dream is to help Indian manufacturers become visible, help innovators turn ideas into products, help startups grow, and help consumers discover and trust products proudly made in India.
                </p>

                <p>
                  I believe India&apos;s greatest strength is not hidden beneath its land. It lives in the minds, skills, and determination of its people.
                </p>

                <p className="font-serif text-lg text-forest-green font-semibold">
                  And GenZ exists to help unlock that potential—so that one day the world does not just see India as a market or a workforce, but as a global leader in innovation, manufacturing, and trust.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* India 2030 Vision Section */}
        <section className="bg-neutral-50 py-0 border-t border-b border-gray-100 w-full overflow-hidden">
          
          {/* Header / India 2030 Vision - Full Width */}
          <div className="bg-forest-green text-white py-20 px-6 sm:px-12 relative overflow-hidden w-full flex items-center justify-center text-center">
            {/* Left side Industry Silhouette Image */}
            <div className="absolute bottom-0 left-0 h-5/6 w-1/4 opacity-20 pointer-events-none hidden md:block">
              <Image 
                src="/factory.png" 
                alt="Industry" 
                fill 
                className="object-contain object-left-bottom"
                sizes="25vw"
              />
            </div>
            
            {/* Right side India Map Image */}
            <div className="absolute inset-y-0 right-0 h-5/6 w-1/4 opacity-20 pointer-events-none hidden md:block my-auto">
              <Image 
                src="/india-map.png" 
                alt="India Map" 
                fill 
                className="object-contain object-right"
                sizes="25vw"
              />
            </div>

            <div className="mx-auto max-w-4xl relative z-10 py-6">
              <span className="text-gold-yellow text-xs font-bold tracking-[0.25em] uppercase mb-4 block">
                India 2030 Vision
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-[1.15] tracking-tight text-white mb-6">
                The Future We&apos;re Building Together
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-sans">
                GenZ is building India&apos;s trusted B2C manufacturing and innovation platform—connecting manufacturers, startups, innovators, buyers, and investors to strengthen India&apos;s manufacturing ecosystem and reduce dependence on imports.
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 sm:px-12 py-20">

            {/* Our 2030 Targets */}
            <div className="mb-20">
              <div className="text-center mb-10">
                <h3 className="font-serif text-2xl sm:text-3xl text-forest-green font-normal tracking-tight relative inline-block after:content-[''] after:block after:w-12 after:h-0.5 after:bg-gold-yellow after:mx-auto after:mt-3">
                  OUR 2030 TARGETS
                </h3>
              </div>
              
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
                    label: "Business Opportunities Facilitated",
                    desc: "Through B2C connections, supplier discovery, manufacturing partnerships and sourcing."
                  },
                  {
                    icon: MapPin,
                    value: "Presence Across India",
                    label: "Nationwide Coverage",
                    desc: "Building a manufacturing network covering every Indian state and major industrial clusters."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-forest-green/5 text-forest-green flex items-center justify-center mb-4">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="font-serif text-xl sm:text-2xl font-bold text-forest-green mb-1">
                      {item.value}
                    </span>
                    <span className="font-sans text-xs font-semibold uppercase tracking-wider text-gold-yellow mb-3">
                      {item.label}
                    </span>
                    <p className="text-xs text-smoke leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Impact on India */}
            <div className="mb-20">
              <div className="text-center mb-10">
                <h3 className="font-serif text-2xl sm:text-3xl text-forest-green font-normal tracking-tight relative inline-block after:content-[''] after:block after:w-12 after:h-0.5 after:bg-gold-yellow after:mx-auto after:mt-3">
                  EXPECTED IMPACT ON INDIA
                </h3>
              </div>

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
                    desc: "Business growth can lead to more hiring across manufacturing, logistics, design, technology and services."
                  },
                  {
                    icon: Globe,
                    title: "Improve Global Competitiveness",
                    desc: "Help Indian manufacturers become more visible to international buyers in the future."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex gap-4 text-left">
                    <div className="h-10 w-10 rounded-full bg-forest-green/5 text-forest-green flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-black mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-smoke leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Our Roadmap */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h3 className="font-serif text-2xl sm:text-3xl text-forest-green font-normal tracking-tight relative inline-block after:content-[''] after:block after:w-12 after:h-0.5 after:bg-gold-yellow after:mx-auto after:mt-3">
                  OUR ROADMAP
                </h3>
              </div>

              <div className="relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-forest-green/10 -translate-y-1/2 hidden lg:block" />

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10">
                  {[
                    { year: "2026", label: "FOUNDATION", icon: Rocket, desc: "Launch the platform, onboard early manufacturers, validate the ecosystem and build trust." },
                    { year: "2027", label: "GROWTH", icon: LineChart, desc: "Expand across major manufacturing sectors and increase verified businesses and product listings." },
                    { year: "2028", label: "SCALE", icon: Settings, desc: "Introduce exports, innovation partnerships, investor connections and advanced B2C tools." },
                    { year: "2029", label: "NATIONAL NETWORK", icon: Share2, desc: "Strengthen manufacturing clusters across India and improve nationwide business connectivity." },
                    { year: "2030", label: "TRUSTED ECOSYSTEM", icon: Trophy, desc: "Become one of India's leading digital platforms connecting manufacturers, innovators and businesses." }
                  ].map((step, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col items-center text-center lg:h-full">
                      <div className="h-10 w-10 rounded-full bg-forest-green text-gold-yellow flex items-center justify-center mb-3 shadow-md">
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span className="font-serif text-lg font-bold text-forest-green mb-0.5">{step.year}</span>
                      <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-gold-yellow mb-2">{step.label}</span>
                      <p className="text-[11px] text-smoke leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Our Long-term Mission */}
            <div className="bg-forest-green text-white rounded-2xl p-8 sm:p-12 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-6 text-left">
                <span className="text-gold-yellow text-xs font-bold tracking-[0.22em] uppercase mb-3 block">
                  Our Long-Term Mission
                </span>
                <p className="font-serif text-lg sm:text-2xl font-light leading-snug mb-0">
                  To become India&apos;s most trusted manufacturing and innovation ecosystem—empowering Indian businesses, supporting local production, encouraging innovation, and helping India become a stronger global manufacturing nation.
                </p>
              </div>

              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { icon: ShieldCheck, title: "TRUST", desc: "Verified businesses for reliable and secure connections." },
                  { icon: Eye, title: "TRANSPARENCY", desc: "Building trust through verified information and quality validation." },
                  { icon: RefreshCw, title: "SUSTAINABILITY", desc: "Promoting local manufacturing for a self-reliant and sustainable India." }
                ].map((val, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center">
                    <val.icon className="h-5 w-5 text-gold-yellow mb-2" />
                    <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-white mb-1.5">{val.title}</span>
                    <p className="text-[10px] text-white/70 leading-relaxed">{val.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trusted By / Institutional Partners */}
            <div className="mt-16 pt-12 border-t border-gray-200/80 text-center">
              <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase mb-8 block">
                TRUSTED BY / INSTITUTIONAL COLLABORATION
              </span>
              <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 opacity-70">
                <span className="font-serif text-lg font-bold text-forest-green tracking-tight">X sidbi</span>
                <span className="font-sans text-sm font-black text-forest-green tracking-wide">NSIC <span className="text-[8px] font-normal block -mt-1 font-mono">ISO 9001:2015</span></span>
                <span className="font-sans text-sm font-extrabold text-forest-green tracking-tight">DPIIT <span className="text-[9px] text-gold-yellow font-bold block -mt-1">#startupindia</span></span>
                <div className="flex items-center gap-1.5 font-serif text-xs font-bold text-forest-green">
                  <span className="text-base">⚙️</span>
                  <span>MAKE IN INDIA</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-forest-green tracking-wider uppercase">
                  <span>A PROUDLY MADE IN INDIA</span>
                  <span className="text-xs">🇮🇳</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Belief statement — inverted section */}
        <section id="mission" className="bg-forest-green px-6 py-20 sm:px-12 sm:py-24 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-gold-yellow text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
              Our Mission
            </span>
            <p className="font-serif text-2xl font-normal leading-snug text-white sm:text-4xl sm:leading-tight">
              India does not lack talent. It lacks a trusted system that connects talent with opportunity.
            </p>
            <p className="mt-6 font-sans text-sm tracking-wide text-white/70">
              That belief is the only line item in GenZ&rsquo;s founding charter.
            </p>
          </div>
        </section>

        {/* CTA section */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 text-center sm:px-12">
            <h2 className="mb-6 font-serif text-3xl font-normal leading-tight tracking-normal text-black sm:text-5xl">
              Be part of the founding cohort.
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-[4px] bg-gold-yellow text-forest-green hover:bg-gold-yellow/90 px-6 font-sans text-sm font-bold tracking-wider uppercase border-none"
              >
                <Link href="/#waitlist">Join the Waitlist</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-forest-green border-forest-green hover:bg-forest-green/5 h-12 rounded-[4px] px-6 font-sans text-sm font-medium tracking-wider uppercase bg-transparent"
              >
                <Link href="/contact">Get in touch</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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