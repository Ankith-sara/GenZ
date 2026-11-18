import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock, Plus } from "lucide-react";
import { ContactForm } from "@/features/home/components/contact-form";

export const metadata: Metadata = {
  title: "Contact — GenZ Platform",
  description:
    "Connect with GenZ — direct seller partnerships, investor relations, buyer sourcing inquiries, or support.",
};

const EMAIL = "genz.official.hq@gmail.com";

const CHANNELS = [
  {
    label: "Email",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    desc: "For general inquiries and official correspondence",
  },
  {
    label: "Support hotline",
    value: "+91 77948 93768",
    href: "tel:+917794893768",
    desc: "Mon to Sat, 9:00 AM to 7:00 PM IST",
  },
  {
    label: "Instagram",
    value: "@genzonline4u",
    href: "https://www.instagram.com/genzonline4u",
    desc: "Factory reels and ecosystem updates",
  },
  {
    label: "Headquarters",
    value: "Andhra Pradesh / Telangana Corridor, India",
    href: undefined,
    desc: "Connecting pan-India industrial clusters",
  },
];

const DEPARTMENTS = [
  {
    title: "Seller onboarding",
    desc: "Are you an Indian toy or hardware seller? Get verified and list your factory catalog.",
  },
  {
    title: "Bulk orders and sourcing",
    desc: "Need direct factory quotes with zero broker markups? We connect you directly with makers.",
  },
  {
    title: "Investors and partnerships",
    desc: "Interested in supporting India’s MSME manufacturing ecosystem and B2C supply chain?",
  },
  {
    title: "Press and media",
    desc: "Media interviews, platform statistics, or brand asset requests.",
  },
];

const FAQS = [
  {
    q: "How fast does the GenZ team respond to inquiries?",
    a: "We reply to every message within one business day. For urgent seller verification or active bulk orders, call the hotline, Mon to Sat.",
  },
  {
    q: "How can Indian sellers register on GenZ?",
    a: "Fill out the contact form and select ‘Seller partnership’. Our verification team runs GST and factory unit checks before listing.",
  },
  {
    q: "Are there middleman commission fees for buyers on GenZ?",
    a: "No. GenZ operates on a zero-broker-markup model, connecting buyers directly with genuine factory owners.",
  },
  {
    q: "Which manufacturing categories are currently supported?",
    a: "We specialize in verified toy sellers, STEM products, plastic molds, educational kits, and precision craft manufacturing across India.",
  },
];

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:outline-none";

export default function ContactPage() {
  return (
    <main className="bg-cream-paper text-ink-black min-h-screen flex-1 font-sans antialiased">
      {/* Hero: headline, form, and a direct-email index for each team */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-x-16 gap-y-12 px-6 pt-16 pb-12 sm:px-12 sm:pt-24 lg:grid-cols-12">
        <div className="lg:col-span-7 lg:col-start-1">
          <h1 className="font-nantes text-ink-black text-5xl leading-[1.02] font-normal tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Let’s talk about building together.
          </h1>
          <p className="font-graphik text-smoke mt-6 max-w-lg text-base leading-relaxed sm:text-lg">
            Seller partnership, investment, buyer sourcing, press, or just a question.
            A real person reads every message.
          </p>
          <p className="font-graphik text-ink-black mt-5 inline-flex items-center gap-2 text-sm font-medium">
            <Clock className="text-brand-yellow-dark h-4 w-4" aria-hidden="true" />
            We reply within one business day.
          </p>
        </div>

        {/* Form first on mobile; sits beside the headline and team list on desktop */}
        <div
          id="message"
          className="scroll-mt-24 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1"
        >
          <ContactForm />
        </div>

        <div className="lg:col-span-7 lg:col-start-1">
          <h2 className="font-graphik text-ink-black text-sm font-semibold">
            Or email the right team directly
          </h2>
          <ul className="border-ash divide-ash mt-4 divide-y border-y">
            {DEPARTMENTS.map((dept) => (
              <li key={dept.title}>
                <a
                  href={`mailto:${EMAIL}?subject=${encodeURIComponent(dept.title)}`}
                  aria-label={`Email us about ${dept.title}`}
                  className={`group flex items-start justify-between gap-6 py-6 ${focusRing}`}
                >
                  <span>
                    <span className="font-nantes text-ink-black block text-2xl font-normal sm:text-3xl">
                      {dept.title}
                    </span>
                    <span className="font-graphik text-smoke mt-1.5 block max-w-md text-sm leading-relaxed">
                      {dept.desc}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="border-ash text-ink-black group-hover:bg-brand-yellow group-hover:border-ink-black mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contact details */}
      <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-12 sm:pb-28">
        <h2 className="sr-only">Contact details</h2>
        <dl className="border-ash grid gap-x-8 gap-y-10 border-t pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((c) => (
            <div key={c.label}>
              <dt className="font-graphik text-smoke text-sm">{c.label}</dt>
              <dd className="mt-2">
                {c.href ? (
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className={`font-nantes text-ink-black decoration-brand-yellow-dark text-xl font-normal [overflow-wrap:anywhere] underline decoration-2 underline-offset-4 ${focusRing}`}
                  >
                    {c.value}
                  </a>
                ) : (
                  <span className="font-nantes text-ink-black text-xl font-normal">
                    {c.value}
                  </span>
                )}
                <p className="font-graphik text-smoke mt-1.5 text-sm leading-relaxed">
                  {c.desc}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* FAQ: native details elements, no JS needed */}
      <section className="border-ash border-y bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-20 sm:px-12 lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-4">
            <h2 className="font-nantes text-ink-black text-3xl font-normal tracking-tight sm:text-4xl">
              Before you write
            </h2>
            <p className="font-graphik text-smoke mt-3 max-w-xs text-base leading-relaxed">
              Quick answers about partnering with GenZ.
            </p>
          </div>

          <div className="border-ash divide-ash divide-y border-y lg:col-span-8">
            {FAQS.map((faq, idx) => (
              <details key={faq.q} open={idx === 0} className="group py-5">
                <summary
                  className={`flex cursor-pointer list-none items-start justify-between gap-6 [&::-webkit-details-marker]:hidden ${focusRing}`}
                >
                  <span className="font-nantes text-ink-black text-xl font-normal">
                    {faq.q}
                  </span>
                  <Plus
                    className="text-smoke mt-1 h-5 w-5 shrink-0 transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  />
                </summary>
                <p className="font-graphik text-smoke mt-3 max-w-2xl text-sm leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-20 sm:px-12 sm:py-24 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="font-nantes text-ink-black text-3xl font-normal tracking-tight text-balance sm:text-5xl">
            Ready to discover verified Indian makers?
          </h2>
          <p className="font-graphik text-smoke mt-4 text-base leading-relaxed">
            Explore our curated catalog of toys, products, and verified industrial
            sellers.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/discover"
            className="bg-brand-yellow hover:bg-brand-yellow-hover font-graphik inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-semibold text-black transition-colors focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Explore Discover
          </Link>
          <Link
            href="/about"
            className="text-ink-black border-ash font-graphik inline-flex h-12 items-center justify-center rounded-full border px-7 text-sm font-semibold transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Read our story
          </Link>
        </div>
      </section>
    </main>
  );
}