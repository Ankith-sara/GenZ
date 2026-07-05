import Link from "next/link";
import { Mail, MapPin, Camera, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { getUserAndProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";

export const metadata = {
  title: "Contact — GenZ",
  description:
    "Get in touch with GenZ — manufacturer partnerships, investors, press, or general questions.",
};

const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@genz.co.in",
    href: "mailto:hello@genz.co.in",
  },
  {
    icon: Link2,
    label: "LinkedIn",
    value: "linkedin.com/company/genz",
    href: "https://linkedin.com/company/genz",
  },
  {
    icon: Camera,
    label: "Instagram",
    value: "@genz.india",
    href: "https://instagram.com/genz.india",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "India",
    href: undefined,
  },
];

export default async function ContactPage() {
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
            <Link href="/about" className="text-charcoal hover:text-black text-sm font-normal tracking-wide transition-colors font-sans">
              About
            </Link>
            <Link href="/contact" className="text-sm font-normal text-black underline decoration-butter-highlight decoration-2 underline-offset-4 font-sans">
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
        <section className="py-20 sm:py-24 bg-cream-paper">
          <div className="mx-auto grid max-w-7xl gap-14 px-6 sm:grid-cols-2 sm:px-12">
            <div>
              <p className="text-smoke mb-3 text-xs uppercase tracking-widest font-sans">Get in Touch</p>
              <div className="bg-butter-highlight mb-4 h-[3px] w-12" />
              <h1 className="font-serif text-4xl leading-[1.2] sm:text-6xl text-foreground font-normal tracking-normal">
                Let&apos;s talk.
              </h1>
              <p className="text-charcoal mt-6 max-w-md text-lg sm:text-xl font-sans font-normal leading-relaxed tracking-wide">
                Manufacturer partnership, investment, press, or just a question —
                we&apos;d love to hear from you.
              </p>

              <ul className="mt-12 space-y-6">
                {CHANNELS.map((c) => {
                  const Icon = c.icon;
                  const content = (
                    <span className="flex items-center gap-4">
                      <span className="border-ash bg-white flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-black shadow-none">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="text-smoke block text-xs uppercase tracking-wider font-sans">
                          {c.label}
                        </span>
                        <span className="block text-sm font-sans text-charcoal">{c.value}</span>
                      </span>
                    </span>
                  );
                  return (
                    <li key={c.label}>
                      {c.href ? (
                        <a
                          href={c.href}
                          target={c.href.startsWith("http") ? "_blank" : undefined}
                          rel={
                            c.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="hover:underline underline-offset-4 decoration-butter-highlight decoration-2"
                        >
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <ContactForm />
          </div>
        </section>
      </main>

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
