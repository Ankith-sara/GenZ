import {
  Mail,
  MapPin,
  Camera,
  Phone,
  Clock,
  Building2,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { ContactForm } from "@/features/marketing/components/contact-form";
import Link from "next/link";

export const metadata = {
  title: "Contact — GenZ Platform",
  description:
    "Connect with GenZ — direct seller partnerships, investor relations, buyer sourcing inquiries, or support.",
};

const CHANNELS = [
  {
    icon: Mail,
    label: "Official Email",
    value: "genz.official.hq@gmail.com",
    href: "mailto:genz.official.hq@gmail.com",
    desc: "For general inquiries & official correspondence",
  },
  {
    icon: Phone,
    label: "Direct Support Hotline",
    value: "+91 77948 93768",
    href: "tel:+917794893768",
    desc: "Mon - Sat, 9:00 AM - 7:00 PM IST",
  },
  {
    icon: Camera,
    label: "Official Instagram",
    value: "@genzonline.in",
    href: "https://www.instagram.com/genzonline.in",
    desc: "Factory reels & ecosystem updates",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "Andhra Pradesh / Telangana Corridor, India",
    href: undefined,
    desc: "Connecting pan-India industrial clusters",
  },
];

const DIRECT_DEPARTMENTS = [
  {
    title: "Seller Onboarding",
    desc: "Are you an Indian toy or hardware seller? Get verified & list your factory catalog.",
    tag: "Factory Direct",
  },
  {
    title: "B2C Sourcing & Bulk Orders",
    desc: "Need direct factory quotes with zero broker markups? Our team connects you directly with makers.",
    tag: "Bulk Sourcing",
  },
  {
    title: "Investor & Ecosystem Partnerships",
    desc: "Interested in supporting India's MSME manufacturing ecosystem and B2C supply chain?",
    tag: "Partnerships",
  },
  {
    title: "Press & Media Inquiries",
    desc: "For media interviews, platform statistics, or brand asset requests.",
    tag: "Press",
  },
];

const FAQS = [
  {
    q: "How fast does the GenZ team respond to inquiries?",
    a: "We review all messages within 24 business hours. For urgent seller verification or active bulk orders, our hotline is active Mon-Sat.",
  },
  {
    q: "How can Indian sellers register on GenZ?",
    a: "Sellers can fill out the contact form selecting 'Seller partnership'. Our verification team conducts GST and factory unit checks before listing.",
  },
  {
    q: "Are there middleman commission fees for buyers on GenZ?",
    a: "No. GenZ operates on a zero-broker-markup model, connecting buyers directly with genuine factory owners.",
  },
  {
    q: "Which manufacturing categories are currently supported?",
    a: "We specialize in verified Toy Sellers, STEM products, Plastic Molds, Educational Kits, and Precision Craft manufacturing across India.",
  },
];

export default async function ContactPage() {
  return (
    <main className="bg-cream-paper text-ink-black min-h-screen flex-1 font-sans antialiased">
      {/* 1. HERO & CONTACT FORM SECTION (CREAM BG) */}
      <section className="border-ash border-b bg-[#FAF7F0] py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-14 px-6 sm:grid-cols-2 sm:px-12">
          <div>
            <div className="tag border-ash mb-4 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 shadow-xs">
              <Sparkles className="text-brand-yellow-dark h-3.5 w-3.5" />
              <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
                Get in Touch
              </span>
            </div>
            <h1 className="font-nantes text-ink-black text-4xl leading-[1.08] font-normal tracking-tight sm:text-6xl">
              Let&apos;s talk about building together.
            </h1>
            <p className="text-smoke font-graphik mt-6 max-w-md text-base leading-relaxed">
              Seller partnership, investment, buyer sourcing, press, or just a question
              — we&apos;d love to connect.
            </p>

            {/* Channels list */}
            <ul className="mt-10 space-y-6">
              {CHANNELS.map((c) => {
                const Icon = c.icon;
                const content = (
                  <span className="flex items-start gap-4">
                    <span className="border-ash text-ink-black flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-white shadow-xs transition-transform hover:scale-105">
                      <Icon
                        className="text-brand-yellow-dark h-5 w-5"
                        aria-hidden="true"
                      />
                    </span>
                    <span>
                      <span className="text-smoke font-graphik block text-xs font-semibold tracking-wider uppercase">
                        {c.label}
                      </span>
                      <span className="font-graphik text-ink-black mt-0.5 block text-sm font-medium">
                        {c.value}
                      </span>
                      {c.desc && (
                        <span className="text-smoke font-graphik mt-0.5 block text-xs">
                          {c.desc}
                        </span>
                      )}
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
                          c.href.startsWith("http") ? "noopener noreferrer" : undefined
                        }
                        className="block w-fit transition-opacity hover:opacity-80"
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

            {/* Response commitment badge */}
            <div className="border-ash mt-10 flex max-w-md items-center gap-4 rounded-2xl border bg-white p-5 shadow-xs">
              <Clock className="text-brand-yellow-dark h-8 w-8 shrink-0" />
              <div>
                <span className="font-graphik text-ink-black block text-xs font-semibold tracking-wider uppercase">
                  24-Hour Response Commitment
                </span>
                <span className="font-graphik text-smoke mt-0.5 block text-xs">
                  Our team reads and responds to every verified inquiry within 1
                  business day.
                </span>
              </div>
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* 2. DIRECT DEPARTMENTS GRID (WHITE BG) */}
      <section className="border-ash border-b bg-white px-6 py-20 sm:px-12 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <div className="tag border-ash mb-4 inline-block rounded-full border bg-[#FAF7F0] px-4 py-1 shadow-xs">
              <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
                Dedicated Channels
              </span>
            </div>
            <h2 className="font-nantes text-ink-black text-3xl font-normal sm:text-5xl">
              Direct Inquiry Departments
            </h2>
            <p className="font-graphik text-smoke mt-4 text-base">
              Connect directly with the specialized team dedicated to your specific
              need.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {DIRECT_DEPARTMENTS.map((dept, idx) => (
              <div
                key={idx}
                className="border-ash group flex flex-col justify-between rounded-2xl border bg-[#FAF7F0] p-8 shadow-xs transition-all hover:border-black"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="bg-brand-yellow font-graphik rounded-full px-3 py-1 text-[10px] font-semibold tracking-wider text-black uppercase shadow-xs">
                      {dept.tag}
                    </span>
                    <Building2 className="text-smoke h-5 w-5 transition-colors group-hover:text-black" />
                  </div>
                  <h3 className="font-nantes text-ink-black mb-2 text-2xl font-normal">
                    {dept.title}
                  </h3>
                  <p className="font-graphik text-smoke text-sm leading-relaxed">
                    {dept.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FREQUENTLY ASKED QUESTIONS (CREAM BG) */}
      <section className="border-ash border-b bg-[#FAF7F0] px-6 py-20 sm:px-12 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <div className="tag border-ash mb-4 inline-block rounded-full border bg-white px-4 py-1 shadow-xs">
              <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
                Support FAQs
              </span>
            </div>
            <h2 className="font-nantes text-ink-black text-3xl font-normal sm:text-5xl">
              Before you contact us
            </h2>
            <p className="font-graphik text-smoke mt-4 text-base">
              Quick answers to standard questions about GenZ platform partnerships.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="border-ash rounded-2xl border bg-white p-6 shadow-xs"
              >
                <h3 className="font-nantes text-ink-black mb-2 flex items-center gap-3 text-xl font-normal">
                  <HelpCircle className="text-brand-yellow-dark h-5 w-5 shrink-0" />
                  {faq.q}
                </h3>
                <p className="font-graphik text-smoke pl-8 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA BANNER (WHITE BG) */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="tag border-ash mb-4 inline-block rounded-full border bg-[#FAF7F0] px-4 py-1 shadow-xs">
            <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
              Explore Platform
            </span>
          </div>
          <h2 className="font-nantes text-ink-black text-3xl font-normal sm:text-5xl">
            Ready to discover verified Indian makers?
          </h2>
          <p className="font-graphik text-smoke mx-auto mt-4 mb-8 max-w-xl text-base">
            Explore our curated catalog of toys, products, and verified industrial
            sellers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/discover"
              className="bg-brand-yellow hover:bg-brand-yellow-hover font-graphik inline-flex h-12 items-center justify-center rounded-full px-8 text-xs font-semibold tracking-wider text-black uppercase shadow-xs transition-all"
            >
              Explore Discover Page
            </Link>
            <Link
              href="/about"
              className="text-ink-black border-ash font-graphik inline-flex h-12 items-center justify-center rounded-full border bg-transparent px-8 text-xs font-semibold tracking-wider uppercase shadow-xs transition-all hover:bg-[#FAF7F0]"
            >
              Read Our About Story
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
