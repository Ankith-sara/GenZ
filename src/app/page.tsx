import Link from "next/link";
import { ArrowRight, ShieldCheck, Video, Layers } from "lucide-react";
import { WaitlistForm } from "@/components/waitlist-form";
import { Button } from "@/components/ui/button";
import { getUserAndProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";

export default async function HomePage() {
  const session = await getUserAndProfile();
  const isLoggedIn = !!session;
  const role = session?.profile?.role;

  return (
    <div className="bg-cream-paper flex min-h-screen flex-col font-sans">
      {/* Header/Navbar */}
      <header className="border-ash bg-cream-paper sticky top-0 z-50 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-12">
          <Link href="/" className="text-lg font-light tracking-[0.22em] uppercase text-black font-sans">
            GenZ
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/discover"
              className="text-charcoal hover:text-black text-sm font-normal tracking-wide transition-colors font-sans"
            >
              Discover
            </Link>
            <Link
              href="/about"
              className="text-charcoal hover:text-black text-sm font-normal tracking-wide transition-colors font-sans"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-charcoal hover:text-black text-sm font-normal tracking-wide transition-colors font-sans"
            >
              Contact
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href={role === "buyer" ? "/dashboard/account" : "/dashboard"}
                  className="text-charcoal hover:text-black text-sm font-normal tracking-wide transition-colors font-sans"
                >
                  {role === "buyer" ? "Account" : "Dashboard"}
                </Link>
                <form action={signOut} className="inline">
                  <Button variant="ghost" size="sm" type="submit" className="text-charcoal hover:text-black">
                    Sign Out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-charcoal hover:text-black text-sm font-normal tracking-wide transition-colors font-sans"
                >
                  Sign In
                </Link>
                <Button asChild variant="default" size="sm" className="bg-black text-white hover:bg-black/90 rounded-[4px] font-sans font-normal text-xs tracking-wider uppercase px-4 h-9">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Category Nav Bar */}
      <div className="bg-cream-paper border-b border-ash hidden sm:block">
        <div className="mx-auto max-w-7xl px-6 py-2.5 sm:px-12">
          <div className="flex items-center justify-center gap-8 overflow-x-auto text-xs uppercase tracking-[0.12em] text-charcoal font-sans">
            <Link href="/discover?category=Wooden%20Toys" className="hover:text-black transition-colors">Wooden Toys</Link>
            <Link href="/discover?category=Educational" className="hover:text-black transition-colors">Educational</Link>
            <Link href="/discover?category=Puzzles" className="hover:text-black transition-colors">Puzzles</Link>
            <Link href="/discover?category=Soft%20Toys" className="hover:text-black transition-colors">Soft Toys</Link>
            <Link href="/discover?category=Crafts" className="hover:text-black transition-colors">Crafts & Kits</Link>
            <Link href="/discover" className="hover:text-black transition-colors underline decoration-butter-highlight decoration-2 underline-offset-4">All Catalog</Link>
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* Hero Section - Asymmetric Layout */}
        <section className="relative px-6 pt-24 pb-20 sm:px-12 sm:pt-36 sm:pb-28 bg-cream-paper">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-4xl text-left">
              <div className="bg-white text-charcoal border-ash border mx-auto mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-normal tracking-[0.11em] uppercase font-sans">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified B2B Commerce
              </div>
              <h1 className="font-serif text-5xl leading-[1.18] sm:text-7xl text-foreground text-left max-w-3xl font-normal tracking-normal">
                The trust network for <br />
                <span className="relative inline-block">
                  modern manufacturing
                  <span className="absolute left-0 bottom-1.5 h-[3px] w-full bg-butter-highlight -z-10" />
                </span>.
              </h1>
              <p className="text-charcoal mt-8 max-w-2xl text-lg sm:text-xl text-left font-sans font-normal leading-relaxed tracking-wide">
                Connecting verified manufacturers directly with buyers, startups, and MSMEs. Source components, request custom quotes, and scale production with absolute confidence.
              </p>
              <div className="mt-10 flex flex-wrap justify-start gap-4">
                <Button asChild size="lg" className="bg-black text-white hover:bg-black/90 rounded-[4px] font-sans font-normal text-sm tracking-wider uppercase px-6 h-11">
                  <a href="#waitlist">Reserve Your Spot</a>
                </Button>
                <Button asChild size="lg" variant="outline" className="border border-ash bg-white text-black hover:bg-cream-paper rounded-[4px] font-sans font-normal text-sm tracking-wider uppercase px-6 h-11 shadow-none transition-none">
                  <Link href="/discover" className="group">
                    Browse Catalog
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="border-ash bg-cream-paper border-t py-24 px-6 sm:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-20 text-left">
              <div className="bg-butter-highlight h-[3px] w-12 mb-4" />
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground tracking-normal font-normal">Built for transparent sourcing</h2>
              <p className="text-charcoal mt-4 text-sm sm:text-base font-sans tracking-wide max-w-xl">
                Eliminating layers of middlemen through verified manufacturer relationships.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="border-ash bg-white flex flex-col rounded-[4px] border p-8 shadow-none transition-none hover:border-black">
                <div className="bg-cream-paper border border-ash text-foreground flex h-12 w-12 items-center justify-center rounded-[4px]">
                  <ShieldCheck className="h-6 w-6 text-black" />
                </div>
                <h3 className="mt-6 font-serif text-xl font-normal text-foreground">100% Verified Only</h3>
                <p className="text-smoke mt-4 text-sm leading-relaxed font-sans">
                  Every manufacturer must pass GST validation and physical facility verification before listing a single product. No anonymous brokers.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="border-ash bg-white flex flex-col rounded-[4px] border p-8 shadow-none transition-none hover:border-black">
                <div className="bg-cream-paper border border-ash text-foreground flex h-12 w-12 items-center justify-center rounded-[4px]">
                  <Video className="h-6 w-6 text-black" />
                </div>
                <h3 className="mt-6 font-serif text-xl font-normal text-foreground">Production Reels</h3>
                <p className="text-smoke mt-4 text-sm leading-relaxed font-sans">
                  Verify quality visually. Watch short-form reels of goods, processes, and active assembly lines directly from factory floors.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="border-ash bg-white flex flex-col rounded-[4px] border p-8 shadow-none transition-none hover:border-black">
                <div className="bg-cream-paper border border-ash text-foreground flex h-12 w-12 items-center justify-center rounded-[4px]">
                  <Layers className="h-6 w-6 text-black" />
                </div>
                <h3 className="mt-6 font-serif text-xl font-normal text-foreground">Direct Inquiries</h3>
                <p className="text-smoke mt-4 text-sm leading-relaxed font-sans">
                  Communicate directly with the makers. Request details on custom materials, order minimums, and request production updates directly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Waitlist Section - Inverted Dark Section */}
        <section id="waitlist" className="border-t border-black bg-dark-band py-24 px-6 sm:px-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-16 text-center">
              <h2 className="font-serif text-3xl sm:text-5xl text-white leading-tight tracking-normal font-normal">Join the founding cohort</h2>
              <p className="text-white/80 mt-4 text-sm sm:text-base font-sans tracking-wide max-w-xl mx-auto">
                We are onboarding select buyers and verified manufacturers for our private launch. Reserve your place today.
              </p>
            </div>
            <WaitlistForm />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-ash bg-cream-paper border-t py-14 px-6 text-center sm:px-12">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-smoke text-xs font-sans">
            &copy; {new Date().getFullYear()} GenZ Trust Commerce. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/about" className="text-charcoal hover:text-black text-xs font-sans transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-charcoal hover:text-black text-xs font-sans transition-colors">
              Contact
            </Link>
            <Link href="/login" className="text-charcoal hover:text-black text-xs font-sans transition-colors">
              Manufacturer Dashboard
            </Link>
            <Link href="/discover" className="text-charcoal hover:text-black text-xs font-sans transition-colors">
              Explore Products
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
