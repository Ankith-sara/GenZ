import { Shield } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions — GenZ Platform",
  description:
    "The legal terms governing platform usage, buyer protections, and seller verification on GenZ.",
};

const SECTIONS = [
  {
    title: "1. Who We Are",
    body: `GenZ ("we", "us", "the platform") operates a direct commerce marketplace connecting Indian consumers with verified Indian sellers, MSMEs, startups, and artisan businesses. By creating an account or using any part of the platform, you agree to these Terms & Conditions.`,
  },
  {
    title: "2. Eligibility & Accounts",
    body: `You must be at least 18 years old to create an account. You are responsible for the accuracy of the information you provide and for maintaining the confidentiality of your login credentials. Seller accounts require valid GST registration and pass our verification review before a storefront is activated.`,
  },
  {
    title: "3. Verified Seller Listings",
    body: `We verify seller identity, GST status, and production capabilities before listings are published. Verification confirms business legitimacy; it does not constitute a explicit guarantee of individual product performance or fitness for a specific purpose. Buyers are encouraged to review product specifications carefully.`,
  },
  {
    title: "4. Orders, Pricing & Payments",
    body: `Product pricing, availability, and accepted payment methods are set by sellers and displayed on each listing. GenZ facilitates secure order processing between buyers and sellers. Order fulfillment and shipping are handled in accordance with platform delivery standards.`,
  },
  {
    title: "5. Cancellations, Returns & Refunds",
    body: `Cancellation and return terms are governed by platform policies and specified on listing pages. For disputed orders, our customer support team mediates resolutions in accordance with buyer protection guidelines.`,
  },
  {
    title: "6. Seller Obligations",
    body: `Sellers agree to list only products they are legally authorized to sell, represent product specifications accurately, and fulfill confirmed orders in good faith. Misrepresentation or failure to honor orders may result in storefront suspension.`,
  },
  {
    title: "7. Prohibited Uses",
    body: `You agree not to use GenZ to list or purchase counterfeit, stolen, or unlawful goods; misrepresent credentials; scrape or reverse-engineer platform components; or compromise platform security.`,
  },
  {
    title: "8. Intellectual Property",
    body: `Product media uploaded by sellers remains their intellectual property, licensed to GenZ for display and marketing on the platform. The GenZ name, logo, software, and brand assets are the exclusive property of GenZ.`,
  },
  {
    title: "9. Limitation of Liability",
    body: `GenZ is provided on an "as is" and "as available" basis. To the maximum extent permitted by law, GenZ shall not be liable for indirect, incidental, or consequential damages arising from buyer-seller transactions.`,
  },
  {
    title: "10. Account Termination",
    body: `We reserve the right to suspend or terminate accounts that violate these terms, submit fraudulent verification credentials, or engage in suspicious activity.`,
  },
  {
    title: "11. Changes to Terms",
    body: `We may update these Terms & Conditions periodically. Continued use of the platform following published changes constitutes acceptance of the revised terms.`,
  },
  {
    title: "12. Contact & Legal Inquiries",
    body: `For questions regarding these terms, please contact our legal team at genz.official.hq@gmail.com.`,
  },
];

export default async function TermsPage() {
  return (
    <main className="bg-cream-paper text-ink-black min-h-screen flex-1 font-sans antialiased">
      {/* Hero Section (CREAM BG) */}
      <section className="border-ash border-b bg-[#FAF7F0] px-6 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto max-w-4xl text-left">
          <div className="tag border-ash mb-4 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 shadow-xs">
            <Shield className="text-brand-yellow-dark h-3.5 w-3.5" />
            <span className="font-graphik text-smoke text-xs font-semibold tracking-[0.2em] uppercase">
              Legal &amp; Governance
            </span>
          </div>
          <h1 className="font-nantes text-ink-black mb-4 text-4xl leading-[1.08] font-normal tracking-tight sm:text-6xl">
            Terms &amp; Conditions
          </h1>
          <p className="font-graphik text-smoke text-sm">
            Last updated: July 2026 &bull; Governing Platform Usage &amp; Direct
            Manufacturing Commerce
          </p>
        </div>
      </section>

      {/* Terms Content Section (WHITE BG) */}
      <section className="border-ash border-b bg-white px-6 py-12 sm:px-12 sm:py-20">
        <div className="border-ash mx-auto flex max-w-4xl flex-col gap-10 rounded-2xl border bg-[#FAF7F0] p-8 shadow-xs sm:p-12">
          {SECTIONS.map((s) => (
            <div
              key={s.title}
              className="border-ash/60 border-b pb-8 last:border-b-0 last:pb-0"
            >
              <h2 className="font-nantes text-ink-black mb-3 text-xl font-normal tracking-tight sm:text-2xl">
                {s.title}
              </h2>
              <p className="font-graphik text-smoke text-sm leading-relaxed sm:text-base">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Support CTA (CREAM BG) */}
      <section className="bg-[#FAF7F0] px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-graphik text-smoke text-sm">
            Have questions about our legal policies or buyer terms?{" "}
            <Link
              href="/contact"
              className="decoration-brand-yellow-dark hover:text-brand-yellow-dark font-semibold text-black underline underline-offset-4"
            >
              Contact our Legal Team
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
