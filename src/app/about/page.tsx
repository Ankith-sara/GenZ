import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserAndProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";

export const metadata = {
  title: "About Us & Founder Story — GenZ",
  description:
    "Why GenZ exists: the founder story behind India's Trust Commerce & Manufacturing Platform.",
};

export default async function AboutPage() {
  const session = await getUserAndProfile();
  const isLoggedIn = !!session;
  const role = session?.profile?.role;

  return (
    <div className="bg-cream-paper flex min-h-screen flex-col font-sans">
      <header className="border-ash bg-cream-paper sticky top-0 z-50 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-12">
          <Link href="/" className="text-lg font-light tracking-[0.22em] uppercase text-black font-sans">
            GenZ
          </Link>
          <nav className="flex items-center gap-5">
            <Link href="/discover" className="text-charcoal hover:text-black text-sm font-normal tracking-wide transition-colors font-sans">
              Discover
            </Link>
            <Link href="/about" className="text-sm font-normal text-black underline decoration-butter-highlight decoration-2 underline-offset-4">
              About
            </Link>
            <Link href="/contact" className="text-charcoal hover:text-black text-sm font-normal tracking-wide transition-colors font-sans">
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
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-charcoal hover:text-black text-sm font-sans font-normal tracking-wide transition-colors">
                  Sign in
                </Link>
                <Button asChild variant="default" size="sm" className="bg-black text-white hover:bg-black/90 rounded-[4px] font-sans font-normal text-xs tracking-wider uppercase px-4 h-9">
                  <Link href="/#waitlist">Join Waitlist</Link>
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
        {/* HERO */}
        <section className="py-20 sm:py-24 bg-cream-paper">
          <div className="mx-auto max-w-3xl px-6 sm:px-12">
            <p className="text-smoke mb-3 text-xs uppercase tracking-widest font-sans">Why We Started</p>
            <div className="bg-butter-highlight mb-4 h-[3px] w-12" />
            <h1 className="font-serif text-4xl leading-[1.2] sm:text-6xl text-foreground font-normal tracking-normal">
              Our Founder Story
            </h1>
            <p className="text-charcoal mt-6 max-w-xl text-lg sm:text-xl font-sans font-normal leading-relaxed tracking-wide">
              GenZ began as a personal reckoning with one question: what would it take
              for India to become a nation the world looks up to — not just for its
              economy, but for its products, technology, innovation, and manufacturing?
            </p>
          </div>
        </section>

        {/* FOUNDER STORY */}
        <section className="border-ash bg-white border-t py-20 sm:py-24">
          <div className="mx-auto max-w-3xl px-6 sm:px-12">
            <div className="space-y-6 text-charcoal font-sans text-base leading-relaxed tracking-wide">
              <p>
                Founded by <strong>Appala Sairam</strong> at the age of 23, GenZ was
                born from a deeply personal experience during his Bachelor of Business
                Administration studies in the United Kingdom.
              </p>
              <p>
                While working in a restaurant to support himself, Sairam was often the
                only Indian on the team. What began as casual jokes about India
                gradually turned into open criticism and disrespect, especially during
                Operation Sindoor. One conversation changed everything. When he defended
                India, he was told:
              </p>
              <blockquote className="border-ash text-black border-l-2 py-2 pl-6 font-serif text-xl sm:text-2xl italic my-8 leading-relaxed">
                &ldquo;Don&apos;t compare India with Pakistan. Compare India with China
                and the United States.&rdquo;
              </blockquote>
              <p>Those words became the turning point of his life.</p>
              <p>
                Instead of responding with anger, he responded with purpose. Over the
                next two months, Sairam dedicated himself to researching that one
                question — and the answer became GenZ.
              </p>
              <p>
                Despite his family&apos;s concerns, he made the difficult decision to
                leave the UK and return to India to pursue this vision. Without
                financial support, he began working as a Zomato delivery partner while
                dedicating every available hour to building his dream.
              </p>
              <p>
                The journey has been far from easy. More than 72 organizations,
                incubators, and institutions turned him away. Many questioned the idea.
                Some laughed at it. But every rejection strengthened his determination
                to keep building.
              </p>
              <p>
                GenZ is more than a startup. It is a mission to unlock India&apos;s
                untapped talent by connecting innovators, manufacturers, startups,
                artisans, students, MSMEs, and consumers on one trusted platform. The
                goal is to help Indian ideas become Indian products, Indian products
                become global brands, and to create opportunities so that more Indians
                can build successful futures in their own country.
              </p>
              <p>
                We believe India&apos;s greatest resource is not hidden beneath its land
                — it lives within the minds of its people. GenZ exists to help those
                ideas become reality, and to contribute to a future where India is
                recognized not only as a global workforce, but as a global leader in
                innovation, manufacturing, and trust.
              </p>
            </div>
          </div>
        </section>

        {/* VISION + MISSION */}
        <section className="py-20 sm:py-24 bg-cream-paper border-t border-ash">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:grid-cols-2 sm:px-12">
            <div className="border-ash bg-white rounded-[4px] border p-8 shadow-none">
              <p className="text-smoke mb-3 text-xs uppercase tracking-widest font-sans">Our Vision</p>
              <div className="bg-butter-highlight mb-4 h-[3px] w-12" />
              <p className="font-serif text-xl sm:text-2xl text-foreground font-normal leading-[1.35] tracking-normal">
                To build a self-reliant India where innovation is celebrated,
                manufacturing thrives, and the world proudly chooses products and
                technologies created in India.
              </p>
            </div>
            <div className="border-ash bg-white rounded-[4px] border p-8 shadow-none">
              <p className="text-smoke mb-3 text-xs uppercase tracking-widest font-sans">Our Mission</p>
              <div className="bg-butter-highlight mb-4 h-[3px] w-12" />
              <p className="font-serif text-xl sm:text-2xl text-foreground font-normal leading-[1.35] tracking-normal">
                Empower every Indian creator, manufacturer, artisan, startup and MSME
                with one trusted platform.
              </p>
            </div>
          </div>
        </section>

        {/* MEET THE FOUNDER */}
        <section className="border-ash bg-white border-t py-20 sm:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center sm:px-12">
            <p className="text-smoke mb-3 text-xs uppercase tracking-widest font-sans">Meet the Founder</p>
            <div className="bg-butter-highlight mx-auto mb-6 h-[3px] w-12" />
            <div
              role="img"
              aria-label="Founder photograph placeholder"
              className="bg-[#fbf8f6] border border-ash mx-auto flex h-32 w-32 items-center justify-center rounded-full text-xs text-smoke font-sans"
            >
              Photo
            </div>
            <h2 className="mt-5 font-serif text-2xl font-normal text-black">Appala Sairam</h2>
            <p className="text-smoke text-sm mt-1 font-sans">Founder, GenZ</p>
            <p className="text-charcoal mx-auto mt-4 max-w-xl font-sans tracking-wide">
              Building India&apos;s Trust Commerce &amp; Manufacturing Platform — one
              verified factory at a time.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-24 bg-cream-paper border-t border-ash">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 text-center sm:px-12">
            <h2 className="font-serif text-3xl sm:text-5xl text-black leading-tight tracking-normal font-normal mb-6">
              Be part of the founding cohort.
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-black text-white hover:bg-black/90 rounded-[4px] font-sans font-normal text-sm tracking-wider uppercase px-6 h-11">
                <Link href="/#waitlist">Join the Waitlist</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-charcoal hover:underline underline-offset-4 decoration-butter-highlight decoration-2 font-sans font-normal text-sm tracking-wider uppercase px-6 h-11">
                <Link href="/contact">Get in touch →</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-ash bg-cream-paper border-t py-14 px-6 text-center sm:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between sm:px-12">
          <span className="text-black text-lg font-light tracking-[0.22em] uppercase font-sans">
            GenZ
          </span>
          <p className="text-smoke text-xs font-sans">
            &copy; {new Date().getFullYear()} GenZ. Made in India, for India — and the world.
          </p>
        </div>
      </footer>
    </div>
  );
}
