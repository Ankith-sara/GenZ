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
    <footer className="bg-black text-white border-t border-white/5 py-20 px-6 sm:px-12 text-left relative overflow-hidden font-sans">
      {/* Subtle background glow/pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Dominant Newsletter Signup Section */}
        <div className="border-b border-white/10 pb-16 mb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <span className="text-gold-yellow text-xs font-semibold tracking-[0.2em] uppercase mb-3 block">
              Stay Updated
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-[1.15] tracking-tight text-white mb-4">
              Subscribe to the <span className="text-gold-yellow font-serif">GenZ Newsletter</span>
            </h2>
            <p className="text-white/70 max-w-xl text-sm sm:text-base leading-relaxed font-sans">
              Get monthly updates on top import gaps, verified Indian manufacturers, local innovations, and exclusive founder stories.
            </p>
          </div>
          <div className="lg:col-span-5 w-full">
            <NewsletterForm />
          </div>
        </div>

        {/* Secondary Navigation Section */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          {/* Column 1: Branding */}
          <div className="col-span-2 flex flex-col justify-start">
            <Link href="/" className="flex items-baseline gap-0.5 mb-4 group">
              <span className="text-2xl font-medium tracking-tight text-white group-hover:text-gold-yellow transition-colors">Gen</span>
              <span className="text-2xl font-normal tracking-tight text-gold-yellow">Z</span>
            </Link>
            <p className="text-xs text-white/60 leading-relaxed font-sans mb-6 max-w-xs">
              A trust commerce and manufacturing platform connecting verified makers directly with buyers.
            </p>
            {/* Social & Contact Icons */}
            <div className="flex gap-5 text-white/50 items-center">
              <a
                href="https://www.instagram.com/genzonline.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-yellow transition-colors duration-200"
                title="Instagram: genzonline.in"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href="tel:+917794893768"
                className="hover:text-gold-yellow transition-colors duration-200"
                title="Phone: +91 77948 93768"
              >
                <Phone className="h-5 w-5" />
              </a>
              <a
                href="mailto:genz.official.hq@gmail.com"
                className="hover:text-gold-yellow transition-colors duration-200"
                title="Email: genz.official.hq@gmail.com"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Company */}
          <div>
            <h4 className="text-[10px] font-medium tracking-widest text-white/40 uppercase mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs text-white/70 font-sans">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/about#mission" className="hover:text-white transition-colors">Our Mission</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: For Consumers */}
          <div>
            <h4 className="text-[10px] font-medium tracking-widest text-white/40 uppercase mb-4">For Consumers</h4>
            <ul className="space-y-2.5 text-xs text-white/70 font-sans">
              <li><Link href="/discover" className="hover:text-white transition-colors">Shop Products</Link></li>
              <li><Link href="/discover?origin=india" className="hover:text-white transition-colors">Made in India</Link></li>
              <li><Link href="/discover?innovations=true" className="hover:text-white transition-colors">Innovations</Link></li>
              <li><Link href="/discover" className="hover:text-white transition-colors">Categories</Link></li>
            </ul>
          </div>

          {/* Column 4: For Manufacturers */}
          <div>
            <h4 className="text-[10px] font-medium tracking-widest text-white/40 uppercase mb-4">Manufacturers</h4>
            <ul className="space-y-2.5 text-xs text-white/70 font-sans">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Join as Manufacturer</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Benefits</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Resources</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          {/* Column 5: Import Gap */}
          <div>
            <h4 className="text-[10px] font-medium tracking-widest text-white/40 uppercase mb-4">Import Gap</h4>
            <ul className="space-y-2.5 text-xs text-white/70 font-sans">
              <li><Link href="/discover?import_gap=true" className="hover:text-white transition-colors">Top Import Gaps</Link></li>
              <li><Link href="/discover?import_gap=true" className="hover:text-white transition-colors">Opportunity Finder</Link></li>
              <li><Link href="/discover?import_gap=true" className="hover:text-white transition-colors">Reports &amp; Insights</Link></li>
            </ul>
          </div>
        </div>

        <hr className="border-white/10 mb-8" />

        {/* Bottom copyright and legal links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-sans">
          <p>&copy; {new Date().getFullYear()} GenZ Trust Commerce. All rights reserved.</p>
          <div className="flex gap-6 flex-wrap justify-center">
            <Link href="/faqs" className="hover:text-white transition-colors">Help Center</Link>
            <Link href="/faqs" className="hover:text-white transition-colors">FAQs</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
          <p className="flex items-center gap-1.5">
            Designed &amp; Built in India <span className="text-sm">🇮🇳</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
