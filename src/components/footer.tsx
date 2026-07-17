import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";
import { Phone, Mail } from "lucide-react";

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-black px-6 py-20 text-left font-sans text-white sm:px-12">
      {/* Subtle background glow/pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Dominant Newsletter Signup Section */}
        <div className="mb-16 grid grid-cols-1 items-center gap-12 border-b border-white/10 pb-16 lg:grid-cols-12">
          <div className="flex flex-col justify-center text-left lg:col-span-7">
            <span className="text-brand-yellow-dark mb-3 block text-xs font-semibold tracking-[0.2em] uppercase">
              Stay Updated
            </span>
            <h2 className="mb-4 font-serif text-3xl leading-[1.15] font-normal tracking-tight text-white sm:text-5xl">
              Subscribe to the{" "}
              <span className="text-brand-yellow-dark font-serif">GenZ Newsletter</span>
            </h2>
            <p className="max-w-xl font-sans text-sm leading-relaxed text-white/70 sm:text-base">
              Get monthly updates on top import gaps, verified Indian manufacturers,
              local innovations, and exclusive founder stories.
            </p>
          </div>
          <div className="w-full lg:col-span-5">
            <NewsletterForm />
          </div>
        </div>

        {/* Secondary Navigation Section */}
        <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-6">
          {/* Column 1: Branding */}
          <div className="col-span-2 flex flex-col justify-start">
            <Link href="/" className="group mb-4 flex items-baseline gap-0.5">
              <span className="group-hover:text-brand-yellow-dark text-2xl font-medium tracking-tight text-white transition-colors">
                Gen
              </span>
              <span className="text-brand-yellow-dark text-2xl font-normal tracking-tight">
                Z
              </span>
            </Link>
            <p className="mb-6 max-w-xs font-sans text-xs leading-relaxed text-white/60">
              A trust commerce and manufacturing platform connecting verified makers
              directly with buyers.
            </p>
            {/* Social & Contact Icons */}
            <div className="flex items-center gap-5 text-white/50">
              <a
                href="https://www.instagram.com/genzonline.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-yellow-dark transition-colors duration-200"
                title="Instagram: genzonline.in"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href="tel:+917794893768"
                className="hover:text-brand-yellow-dark transition-colors duration-200"
                title="Phone: +91 77948 93768"
              >
                <Phone className="h-5 w-5" />
              </a>
              <a
                href="mailto:genz.official.hq@gmail.com"
                className="hover:text-brand-yellow-dark transition-colors duration-200"
                title="Email: genz.official.hq@gmail.com"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Company */}
          <div>
            <h4 className="mb-4 text-[10px] font-medium tracking-widest text-white/40 uppercase">
              Company
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-white/70">
              <li>
                <Link href="/about" className="transition-colors hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/about#mission"
                  className="transition-colors hover:text-white"
                >
                  Our Mission
                </Link>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-white">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Consumers */}
          <div>
            <h4 className="mb-4 text-[10px] font-medium tracking-widest text-white/40 uppercase">
              For Consumers
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-white/70">
              <li>
                <Link href="/discover" className="transition-colors hover:text-white">
                  Shop Products
                </Link>
              </li>
              <li>
                <Link
                  href="/discover?origin=india"
                  className="transition-colors hover:text-white"
                >
                  Made in India
                </Link>
              </li>
              <li>
                <Link
                  href="/discover?innovations=true"
                  className="transition-colors hover:text-white"
                >
                  Innovations
                </Link>
              </li>
              <li>
                <Link href="/discover" className="transition-colors hover:text-white">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: For Manufacturers */}
          <div>
            <h4 className="mb-4 text-[10px] font-medium tracking-widest text-white/40 uppercase">
              Manufacturers
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-white/70">
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-white">
                  Join as Manufacturer
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-white">
                  Benefits
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-white">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-white">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Import Gap */}
          <div>
            <h4 className="mb-4 text-[10px] font-medium tracking-widest text-white/40 uppercase">
              Import Gap
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-white/70">
              <li>
                <Link
                  href="/discover?import_gap=true"
                  className="transition-colors hover:text-white"
                >
                  Top Import Gaps
                </Link>
              </li>
              <li>
                <Link
                  href="/discover?import_gap=true"
                  className="transition-colors hover:text-white"
                >
                  Opportunity Finder
                </Link>
              </li>
              <li>
                <Link
                  href="/discover?import_gap=true"
                  className="transition-colors hover:text-white"
                >
                  Reports &amp; Insights
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="mb-8 border-white/10" />

        {/* Bottom copyright and legal links */}
        <div className="flex flex-col items-center justify-between gap-4 font-sans text-xs text-white/50 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} GenZ Trust Commerce. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/faqs" className="transition-colors hover:text-white">
              Help Center
            </Link>
            <Link href="/faqs" className="transition-colors hover:text-white">
              FAQs
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms &amp; Conditions
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
          </div>
          <p className="flex items-center gap-1.5">
            Designed &amp; Built in India <span className="text-sm">🇮🇳</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
