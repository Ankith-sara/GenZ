import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getUserAndProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { MainHeader } from "@/components/main-header";

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
              <div className="lg:col-span-8 text-left space-y-8 font-sans text-base leading-relaxed tracking-wide text-charcoal">
                <div>
                  <h3 className="font-serif text-2xl font-normal text-black mb-4 border-b border-gray-100 pb-2">
                    How GenZ Began
                  </h3>
                  <p className="mb-4">
                    My name is Appala Sairam, and I founded GenZ at the age of 23 — while I was still studying for my BBA in the United Kingdom. I worked nights in a restaurant kitchen, the only Indian on a team of mostly Pakistani colleagues. There were jokes about my accent, comments about where I came from. I let most of it go. I was there to work.
                  </p>
                  <p>
                    Then came Operation Sindoor, and the jokes turned into arguments about whether India even mattered on the world stage. One night, defending my country, I found myself comparing India to Pakistan. A colleague stopped me cold: why measure ourselves against a neighbor, when the real comparison was China, was America?
                  </p>
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-normal text-black mb-4 border-b border-gray-100 pb-2">
                    Discovering the Trust Gap
                  </h3>
                  <p className="mb-4">
                    I could not shake that question. For two months I read everything I could find on how China and the United States had built their manufacturing and innovation engines. What I found wasn&rsquo;t a talent gap — it was a trust gap. India has no shortage of skilled makers, sharp founders, and original ideas. What it lacks is a system that lets the world see them, verify them, and buy from them with confidence.
                  </p>
                  <p>
                    That gap became GenZ. I flew home certain that once people heard the idea, the support would follow. I met politicians, incubators, institutions. Everyone nodded. Almost no one acted. Belief in an idea and building it, I learned, are two very different things.
                  </p>
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-normal text-black mb-4 border-b border-gray-100 pb-2">
                    Delivery Partner by Day, Founder by Night
                  </h3>
                  <p className="mb-4">
                    When my savings ran out, I started delivering food for Zomato — days on a bike, nights on GenZ. To anyone watching, I was a delivery partner. To me, every delivery was one step closer to a platform that refused to leave my mind.
                  </p>
                  <p>
                    GenZ exists because a question I couldn&rsquo;t answer forced me to go looking for one. India&rsquo;s greatest resource was never hidden underground — it lives in the hands and minds of its people. GenZ is how we build the trust that lets the world finally see it: manufacturers made visible, ideas turned into products, and buyers everywhere able to choose India with confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline block */}
        <section className="bg-light-gray-bg py-24 px-6 sm:px-12 border-t border-b border-gray-200">
          <div className="mx-auto max-w-5xl text-center">
            <span className="text-gold-yellow text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
              Our Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-black font-normal tracking-tight mb-16">
              Milestones of Self-Reliance
            </h2>

            {/* Alternating list */}
            <div className="space-y-12 relative before:absolute before:inset-0 before:left-1/2 before:-translate-x-1/2 before:w-0.5 before:bg-forest-green/10 before:hidden md:before:block">
              {/* Point 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
                <div className="md:text-right md:pr-12">
                  <span className="text-xs font-bold text-gold-yellow uppercase tracking-widest">2024 — London</span>
                  <h4 className="font-serif text-lg font-semibold text-black mt-1">The Spark</h4>
                  <p className="text-xs text-smoke font-sans mt-2 leading-relaxed">
                    A restaurant kitchen debate sparks research into why India has a B2B trust gap compared to major global manufacturing leaders.
                  </p>
                </div>
                <div className="hidden md:block relative pl-12">
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-forest-green border-4 border-white shadow-md" />
                </div>
              </div>

              {/* Point 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
                <div className="hidden md:block relative pr-12 text-right">
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-forest-green border-4 border-white shadow-md" />
                </div>
                <div className="md:pl-12">
                  <span className="text-xs font-bold text-gold-yellow uppercase tracking-widest">2024 — Hyderabad</span>
                  <h4 className="font-serif text-lg font-semibold text-black mt-1">Grounded Reality</h4>
                  <p className="text-xs text-smoke font-sans mt-2 leading-relaxed">
                    Returning to India to pitch the solution. Working delivery shifts on a bicycle to fund local development and prototype construction.
                  </p>
                </div>
              </div>

              {/* Point 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
                <div className="md:text-right md:pr-12">
                  <span className="text-xs font-bold text-gold-yellow uppercase tracking-widest">2025 — Launch</span>
                  <h4 className="font-serif text-lg font-semibold text-black mt-1">The Trust Platform</h4>
                  <p className="text-xs text-smoke font-sans mt-2 leading-relaxed">
                    Scaffolding GenZ with verified GST identification, video-based factory reels, and direct wholesale inquiries.
                  </p>
                </div>
                <div className="hidden md:block relative pl-12">
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-forest-green border-4 border-white shadow-md" />
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