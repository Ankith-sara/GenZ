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

function FacebookIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function LinkedinIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GithubIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
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
      { name: "For Manufacturers", href: "/signup/manufacturer" },
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
      { name: "Manufacturer Guide", href: "/signup/manufacturer" },
      { name: "GST Verification", href: "/signup/manufacturer" },
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
              Receive monthly updates on verified Indian manufacturers, top import gap
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
