"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NewsletterForm } from "@/components/newsletter-form";
import { Mail, Phone } from "lucide-react";

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

interface FooterLink {
  name: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterSocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

const defaultSections: FooterSection[] = [
  {
    title: "Product",
    links: [
      { name: "Overview", href: "/" },
      { name: "Discover Catalog", href: "/discover" },
      { name: "Import Gap Finder", href: "/discover?import_gap=true" },
      { name: "Made in India", href: "/discover?origin=india" },
      { name: "Innovations", href: "/discover?innovations=true" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Vision 2030", href: "/about#vision" },
      { name: "Founder Story", href: "/about#story" },
      { name: "Contact Us", href: "/contact" },
      { name: "For Sellers", href: "/signup/seller" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "/faqs" },
      { name: "FAQs", href: "/faqs" },
      { name: "System Status", href: "/status" },
      { name: "Community", href: "/#community" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Seller Guide", href: "/signup/seller" },
      { name: "Verification", href: "/signup/seller" },
      { name: "Buyer Inquiries", href: "/discover" },
      { name: "Partnerships", href: "/contact" },
    ],
  },
];

const defaultSocialLinks: FooterSocialLink[] = [
  {
    icon: <InstagramIcon className="h-5 w-5" />,
    href: "https://www.instagram.com/genzonline.in",
    label: "Instagram",
  },
  {
    icon: <Mail className="h-5 w-5" />,
    href: "mailto:genz.official.hq@gmail.com",
    label: "Email",
  },
  {
    icon: <Phone className="h-5 w-5" />,
    href: "tel:+917794893768",
    label: "Phone",
  },
];

const defaultLegalLinks: FooterLink[] = [
  { name: "Terms and Conditions", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Help Center", href: "/faqs" },
];

export function Footer({ className }: { className?: string }) {
  const description =
    "India's premier trust commerce & direct manufacturing platform connecting verified makers directly with buyers.";
  const copyright = `© ${new Date().getFullYear()} GenZ Trust Commerce. All rights reserved.`;

  return (
    <footer
      className={cn(
        "relative overflow-hidden border-t border-neutral-800 bg-[#0B0B0B] py-16 font-sans text-white antialiased sm:py-24",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        {/* Dominant Integrated Newsletter Section */}
        <div className="mb-16 grid grid-cols-1 items-center gap-10 border-b border-neutral-800 pb-16 lg:grid-cols-12">
          <div className="flex flex-col justify-center text-left lg:col-span-7">
            <div className="tag border-brand-yellow/30 bg-brand-yellow/10 mb-3 inline-block self-start rounded-full border px-4 py-1 shadow-xs">
              <span className="font-graphik text-brand-yellow text-xs font-semibold tracking-[0.2em] uppercase">
                Stay Updated
              </span>
            </div>
            <h2 className="font-nantes mb-3 text-3xl leading-[1.15] font-normal tracking-tight text-white sm:text-4xl">
              Subscribe to the{" "}
              <span className="text-brand-yellow font-medium italic">
                GenZ Newsletter
              </span>
            </h2>
            <p className="font-graphik max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
              Receive monthly updates on verified Indian sellers, top import gap
              analyses, local innovations, and direct factory insights.
            </p>
          </div>
          <div className="w-full lg:col-span-5">
            <NewsletterForm />
          </div>
        </div>

        {/* Footer Navigation & Brand Section */}
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          {/* Left Column: Brand Logo, Description, Social Links */}
          <div className="flex w-full flex-col justify-between gap-6 lg:w-1/3 lg:items-start">
            <div className="flex items-center gap-2">
              <Link href="/" className="group flex items-baseline gap-0.5">
                <span className="font-nantes group-hover:text-brand-yellow text-2xl font-medium tracking-tight text-white transition-colors">
                  Gen
                </span>
                <span className="font-nantes text-brand-yellow text-2xl font-normal tracking-tight">
                  Z
                </span>
              </Link>
            </div>
            <p className="font-graphik max-w-sm text-xs leading-relaxed text-neutral-400">
              {description}
            </p>
            <ul className="flex flex-wrap items-center gap-4 text-neutral-400">
              {defaultSocialLinks.map((social, idx) => (
                <li
                  key={idx}
                  className="hover:text-brand-yellow font-medium transition-colors"
                >
                  <a
                    href={social.href}
                    aria-label={social.label}
                    title={social.label}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      social.href.startsWith("http") ? "noopener noreferrer" : undefined
                    }
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Columns: Links Grid */}
          <div className="grid w-full grid-cols-2 gap-8 sm:grid-cols-3 lg:w-2/3 lg:gap-12">
            {defaultSections.slice(0, 3).map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="font-nantes mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                  {section.title}
                </h3>
                <ul className="font-graphik space-y-2.5 text-xs text-neutral-400">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium transition-colors hover:text-white"
                    >
                      <Link href={link.href}>{link.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="font-graphik mt-12 flex flex-col justify-between gap-4 border-t border-neutral-800 pt-8 text-xs font-medium text-neutral-500 md:flex-row md:items-center md:text-left">
          <p className="order-2 md:order-1">{copyright}</p>
          <ul className="order-1 flex flex-wrap gap-4 md:order-2">
            {defaultLegalLinks.map((link, idx) => (
              <li key={idx} className="transition-colors hover:text-white">
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
