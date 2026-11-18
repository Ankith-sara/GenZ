import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { LuInstagram } from "react-icons/lu";
import { cn } from "@genz/utils";
import { NewsletterForm } from "@/features/home/components/newsletter-form";
import { COMPANY, formatAddress } from "@genz/utils/company";

interface FooterLink {
  name: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterSocialLink {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  href: string;
  label: string;
}

// Every page appears once. The old footer linked the grievance page three times
// and repeated the policy links in a second row.
const SECTIONS: FooterSection[] = [
  {
    title: "Shop",
    links: [
      { name: "Overview", href: "/" },
      { name: "Discover catalog", href: "/discover" },
      { name: "Wishlist", href: "/wishlist" },
      { name: "Cart", href: "/cart" },
      { name: "Track orders", href: "/orders" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About us", href: "/about" },
      { name: "Vision 2030", href: "/about#vision" },
      { name: "Founder story", href: "/about#story" },
      { name: "Sell on GenZ", href: "/seller/signup" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help center and FAQs", href: "/faqs" },
      { name: "Contact us", href: "/contact" },
      { name: "Grievance officer", href: "/grievance" },
    ],
  },
  {
    title: "Policies",
    links: [
      { name: "Terms and conditions", href: "/terms" },
      { name: "Privacy policy", href: "/privacy" },
      { name: "Cancellation and refund policy", href: "/refund-policy" },
      { name: "Shipping policy", href: "/shipping-policy" },
    ],
  },
];

const SOCIAL_LINKS: FooterSocialLink[] = [
  { icon: LuInstagram, href: COMPANY.instagramUrl, label: "Instagram" },
  { icon: Mail, href: `mailto:${COMPANY.supportEmail}`, label: "Email" },
  { icon: Phone, href: `tel:${COMPANY.supportPhoneHref}`, label: "Phone" },
];

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none";

export function Footer({ className }: { className?: string }) {
  const description =
    "India’s premier trust commerce and direct manufacturing platform, connecting verified makers directly with buyers.";
  const copyright = `© ${new Date().getFullYear()} ${COMPANY.brandName}. All rights reserved.`;

  return (
    <footer
      className={cn(
        "border-t border-neutral-800 bg-black font-sans text-white antialiased",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        {/* Newsletter: the big serif line is the only loud thing in the footer */}
        <div className="grid grid-cols-1 items-end gap-10 border-b border-neutral-800 py-16 sm:py-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="font-nantes text-4xl leading-[1.08] font-normal tracking-tight text-balance text-white sm:text-5xl">
              Subscribe to the GenZ Newsletter
            </h2>
            <p className="font-graphik mt-4 max-w-xl text-base leading-relaxed text-neutral-400">
              Monthly updates on verified Indian sellers, top import gap analyses,
              local innovations, and direct factory insights.
            </p>
          </div>
          <div className="w-full lg:col-span-5">
            <NewsletterForm />
          </div>
        </div>

        {/* Brand + navigation */}
        <div className="grid grid-cols-1 gap-12 py-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link
              href="/"
              aria-label="GenZ home"
              className={`font-nantes inline-flex items-baseline gap-0.5 rounded-sm text-3xl tracking-tight ${focusRing}`}
            >
              <span className="font-medium text-white">Gen</span>
              <span className="text-brand-yellow font-normal">Z</span>
            </Link>
            <p className="font-graphik mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              {description}
            </p>
            <ul className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    title={label}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className={`hover:text-brand-yellow flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:border-neutral-600 ${focusRing}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:col-span-8"
          >
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h3 className="font-graphik text-sm font-semibold text-white">
                  {section.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href + link.name}>
                      <Link
                        href={link.href}
                        className={`font-graphik rounded-sm text-sm leading-snug text-neutral-400 transition-colors hover:text-white ${focusRing}`}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Legal */}
        <div className="font-graphik flex flex-col gap-2 border-t border-neutral-800 py-8 text-xs leading-relaxed text-neutral-500">
          <p>{copyright}</p>
          <p className="max-w-3xl">
            {COMPANY.brandName} is operated by {COMPANY.legalEntityName} (CIN: {COMPANY.cin}). Registered
            office: {formatAddress(COMPANY.registeredOffice)}.
          </p>
        </div>
      </div>
    </footer>
  );
}