import Link from "next/link";
import { ChevronDown, HelpCircle, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "FAQs — GenZ Platform",
  description:
    "Answers to common questions about buying, selling, and GST verification on GenZ.",
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
        a: "Most applications are reviewed within 24–48 business hours. You can check your status anytime from Dashboard → Verification once you've registered.",
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
    title: "General & Trust",
    items: [
      {
        q: "What's GenZ's mission?",
        a: "To turn India's consumer demand into Indian manufacturing growth — connecting verified local makers directly with buyers, cutting out import dependency and fake resellers along the way.",
      },
      {
        q: "How do I contact support?",
        a: "Use the Contact page for email, hotline, and Instagram channels, or reach out at genz.official.hq@gmail.com directly.",
      },
      {
        q: "Where can I read the legal details?",
        a: "Our Terms & Conditions and Privacy Policy cover the full details on data handling, account responsibilities, and platform rules.",
      },
    ],
  },
];

export default async function FaqsPage() {
  const allFaqs = FAQ_GROUPS.flatMap((g) => g.items);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <main className="bg-cream-paper text-ink-black flex-1 font-sans antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero Section (CREAM BG) */}
      <section className="border-ash border-b bg-[#FAF7F0] px-6 py-20 sm:px-12 sm:py-28">
        <div className="mx-auto max-w-4xl text-left">
          <div className="tag border-ash mb-4 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 shadow-xs">
            <Sparkles className="text-brand-yellow-dark h-3.5 w-3.5" />
            <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
              Help Center &amp; Support
            </span>
          </div>
          <h1 className="font-nantes text-ink-black mb-5 text-4xl leading-[1.08] font-normal tracking-tight sm:text-6xl">
            Frequently Asked Questions
          </h1>
          <p className="text-smoke font-graphik max-w-2xl text-base leading-relaxed">
            Everything you need to know about buying from verified Indian manufacturers,
            selling on GenZ, and how our trust network operates.
          </p>
        </div>
      </section>

      {/* FAQ Groups (WHITE BG) */}
      <section className="border-ash border-b bg-white px-6 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto flex max-w-4xl flex-col gap-14">
          {FAQ_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="font-nantes text-ink-black mb-6 text-2xl font-normal sm:text-3xl">
                {group.title}
              </h2>
              <div className="flex flex-col gap-4">
                {group.items.map((item) => (
                  <details
                    key={item.q}
                    className="group border-ash rounded-2xl border bg-[#FAF7F0] shadow-xs transition-all open:border-black"
                  >
                    <summary className="text-ink-black flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-medium select-none focus:outline-none sm:p-6">
                      <span className="font-nantes flex items-center gap-3 text-lg font-normal sm:text-xl">
                        <HelpCircle className="text-brand-yellow-dark h-5 w-5 shrink-0" />
                        {item.q}
                      </span>
                      <ChevronDown className="text-smoke h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <p className="font-graphik text-smoke pr-6 pb-6 pl-13 text-sm leading-relaxed">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section (CREAM BG) */}
      <section className="bg-[#FAF7F0] px-6 py-20 sm:px-12 sm:py-28">
        <div className="border-ash mx-auto flex max-w-4xl flex-col gap-6 rounded-2xl border bg-white p-8 text-left shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-12">
          <div>
            <span className="bg-brand-yellow font-graphik mb-3 inline-block rounded-full px-3 py-1 text-[10px] font-semibold tracking-wider text-black uppercase shadow-xs">
              24-Hour Support
            </span>
            <h3 className="font-nantes text-ink-black mb-2 text-2xl font-normal tracking-tight sm:text-3xl">
              Still have questions?
            </h3>
            <p className="font-graphik text-smoke text-sm">
              Our team typically responds to all inquiries within one business day.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-brand-yellow hover:bg-brand-yellow-hover font-graphik h-12 rounded-full border-none px-8 text-xs font-semibold tracking-wider text-black uppercase shadow-xs transition-all"
          >
            <Link href="/contact" className="inline-flex items-center gap-2">
              <span>Contact Team</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
