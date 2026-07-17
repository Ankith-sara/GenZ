import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "FAQs — GenZ",
  description:
    "Answers to common questions about buying, selling, and verification on GenZ.",
};

type Faq = { q: string; a: string };
type FaqGroup = { title: string; items: Faq[] };

const FAQ_GROUPS: FaqGroup[] = [
  {
    title: "For Buyers",
    items: [
      {
        q: "How do I know a manufacturer is actually verified?",
        a: "Every seller on GenZ goes through GST verification and factory/document validation before their profile goes live. Look for the verified badge on any product or manufacturer page — it means their business identity and manufacturing claims have been checked, not just self-reported.",
      },
      {
        q: "Is GenZ a reseller or marketplace for imported goods?",
        a: "No. GenZ only lists products made by verified Indian manufacturers, MSMEs, startups, and local artisans. There are no imports and no unverified resellers on the platform.",
      },
      {
        q: "What payment methods are supported?",
        a: "Supported payment methods are shown at checkout and vary by seller. We're rolling out payment options gradually as we onboard more manufacturers — check the product page for what's available for a specific order.",
      },
      {
        q: "Can I track my order?",
        a: "Once a manufacturer confirms an order, you'll get updates through your buyer account under Dashboard → Orders. For direct questions about a specific shipment, reach out through the contact details on that manufacturer's profile.",
      },
      {
        q: "What if a product doesn't match its description?",
        a: "Contact the manufacturer directly first — most issues are resolved quickly at that level. If you're not getting a response, reach our support team via the Contact page and we'll step in.",
      },
    ],
  },
  {
    title: "For Manufacturers",
    items: [
      {
        q: "Who can register as a manufacturer on GenZ?",
        a: "Any GST-registered Indian manufacturer, MSME, startup, or artisan business producing goods locally. During signup you'll submit basic business and GST details for verification before your storefront goes live.",
      },
      {
        q: "How long does verification take?",
        a: "Most applications are reviewed within a few business days. You can check your status anytime from Dashboard → Verification once you've registered.",
      },
      {
        q: "Is there a listing fee?",
        a: "Core listing and storefront tools are free to get started. Any future premium features (promoted placement, advanced analytics) will always be clearly optional and separately priced — never bundled silently into your account.",
      },
      {
        q: "Can I manage products, orders, and reels from one place?",
        a: "Yes — the manufacturer dashboard covers product and variant management, order tracking, and short-form product reels in one workspace.",
      },
    ],
  },
  {
    title: "General",
    items: [
      {
        q: "What's GenZ's mission?",
        a: "To turn India's consumer demand into Indian manufacturing growth — connecting verified local makers directly with buyers, cutting out import dependency and fake resellers along the way.",
      },
      {
        q: "How do I contact support?",
        a: "Use the Contact page for email, LinkedIn, and Instagram channels, or reach out at genz.official.hq@gmail.com directly.",
      },
      {
        q: "Where can I read the legal details?",
        a: "Our Terms & Conditions and Privacy Policy cover the full details on data handling, account responsibilities, and platform rules.",
      },
    ],
  },
];

export default async function FaqsPage() {
  return (
    <main className="bg-cream-paper text-ink-black flex-1 font-sans antialiased">
      {/* Hero */}
      <section className="border-ash border-b px-6 py-20 sm:px-12 sm:py-28">
        <div className="mx-auto max-w-4xl text-left">
          <span className="text-caption font-graphik text-smoke mb-4 block tracking-[0.2em] uppercase">
            Support
          </span>
          <h1 className="font-nantes text-ink-black mb-5 text-4xl leading-[1.1] font-normal tracking-tight sm:text-6xl">
            Frequently Asked Questions
          </h1>
          <p className="text-charcoal text-body font-graphik max-w-2xl leading-relaxed">
            Everything you need to know about buying from verified Indian manufacturers,
            selling on GenZ, and how the trust network works. Can&apos;t find your
            answer?{" "}
            <Link
              href="/contact"
              className="decoration-brand-yellow-dark hover:text-brand-yellow font-medium underline decoration-2 underline-offset-4"
            >
              Get in touch
            </Link>
            .
          </p>
        </div>
      </section>

      {/* FAQ Groups */}
      <section className="px-6 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto flex max-w-4xl flex-col gap-14">
          {FAQ_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="font-nantes text-ink-black mb-6 text-2xl tracking-tight sm:text-3xl">
                {group.title}
              </h2>
              <div className="flex flex-col gap-3">
                {group.items.map((item) => (
                  <details
                    key={item.q}
                    className="group bg-pure-white border-ash open:border-brand-yellow rounded-none border transition-colors"
                  >
                    <summary className="text-ink-black flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-medium select-none focus:outline-none sm:p-6">
                      <span className="font-graphik text-sm font-semibold sm:text-base">
                        {item.q}
                      </span>
                      <ChevronDown className="text-smoke h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <p className="text-charcoal font-graphik -mt-1 px-5 pb-5 text-sm leading-relaxed sm:px-6 sm:pb-6">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 sm:px-12">
        <div className="bg-brand-yellow mx-auto flex max-w-4xl flex-col gap-6 rounded-none p-10 text-left sm:flex-row sm:items-center sm:justify-between sm:p-12">
          <div>
            <h3 className="font-nantes mb-2 text-2xl font-normal tracking-tight text-white sm:text-3xl">
              Still have questions?
            </h3>
            <p className="text-caption font-graphik text-white/70">
              Our team typically responds within one business day.
            </p>
          </div>
          <Button
            asChild
            className="bg-brand-yellow-dark text-ink-black hover:bg-brand-yellow-dark/90 font-graphik h-12 shrink-0 rounded-none border-none px-8 text-xs font-medium tracking-wider uppercase"
          >
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
