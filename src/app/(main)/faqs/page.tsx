import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "FAQs — GenZ",
  description: "Answers to common questions about buying, selling, and verification on GenZ.",
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
    <main className="flex-1 bg-cream-paper font-sans text-ink-black antialiased">
      {/* Hero */}
      <section className="py-20 sm:py-28 px-6 sm:px-12 border-b border-ash">
        <div className="mx-auto max-w-4xl text-left">
          <span className="text-caption font-graphik uppercase tracking-[0.2em] text-smoke block mb-4">Support</span>
          <h1 className="font-nantes text-4xl sm:text-6xl font-normal leading-[1.1] tracking-tight text-ink-black mb-5">
            Frequently Asked Questions
          </h1>
          <p className="text-charcoal max-w-2xl text-body font-graphik leading-relaxed">
            Everything you need to know about buying from verified Indian manufacturers,
            selling on GenZ, and how the trust network works. Can&apos;t find your answer?{" "}
            <Link href="/contact" className="underline decoration-gold-yellow decoration-2 underline-offset-4 hover:text-forest-green font-medium">
              Get in touch
            </Link>
            .
          </p>
        </div>
      </section>

      {/* FAQ Groups */}
      <section className="py-16 sm:py-24 px-6 sm:px-12">
        <div className="mx-auto max-w-4xl flex flex-col gap-14">
          {FAQ_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="font-nantes text-2xl sm:text-3xl text-ink-black mb-6 tracking-tight">
                {group.title}
              </h2>
              <div className="flex flex-col gap-3">
                {group.items.map((item) => (
                  <details
                    key={item.q}
                    className="group bg-pure-white rounded-none border border-ash open:border-forest-green transition-colors"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6 text-left font-medium text-ink-black focus:outline-none select-none">
                      <span className="text-sm sm:text-base font-graphik font-semibold">{item.q}</span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-smoke transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <p className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-1 text-sm text-charcoal font-graphik leading-relaxed">
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
      <section className="pb-24 px-6 sm:px-12">
        <div className="mx-auto max-w-4xl bg-forest-green rounded-none p-10 sm:p-12 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h3 className="font-nantes text-2xl sm:text-3xl font-normal text-white mb-2 tracking-tight">
              Still have questions?
            </h3>
            <p className="text-white/70 text-caption font-graphik">
              Our team typically responds within one business day.
            </p>
          </div>
          <Button asChild className="bg-gold-yellow text-ink-black hover:bg-gold-yellow/90 font-graphik font-medium rounded-none h-12 px-8 text-xs uppercase tracking-wider border-none shrink-0">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
