export const metadata = {
  title: "Terms & Conditions — GenZ",
  description:
    "The terms that govern use of the GenZ platform for buyers and manufacturers.",
};

const SECTIONS = [
  {
    title: "1. Who We Are",
    body: `GenZ ("we", "us", "the platform") operates a direct commerce marketplace connecting Indian consumers with verified Indian manufacturers, MSMEs, startups, and artisan businesses. By creating an account or using any part of the platform, you agree to these Terms & Conditions.`,
  },
  {
    title: "2. Eligibility & Accounts",
    body: `You must be at least 18 years old to create an account. You are responsible for the accuracy of the information you provide and for maintaining the confidentiality of your login credentials. Manufacturer accounts require valid GST registration and pass our verification review before a storefront is activated.`,
  },
  {
    title: "3. Verified Manufacturer Listings",
    body: `We verify manufacturer identity, GST status, and production capabilities before listings are published. Verification confirms business legitimacy; it does not constitute a explicit guarantee of individual product performance or fitness for a specific purpose. Buyers are encouraged to review product specifications carefully.`,
  },
  {
    title: "4. Orders, Pricing & Payments",
    body: `Product pricing, availability, and accepted payment methods are set by manufacturers and displayed on each listing. GenZ facilitates secure order processing between buyers and manufacturers. Order fulfillment and shipping are handled in accordance with platform delivery standards.`,
  },
  {
    title: "5. Cancellations, Returns & Refunds",
    body: `Cancellation and return terms are governed by platform policies and specified on listing pages. For disputed orders, our customer support team mediates resolutions in accordance with buyer protection guidelines.`,
  },
  {
    title: "6. Manufacturer Obligations",
    body: `Manufacturers agree to list only products they are legally authorized to sell, represent product specifications accurately, and fulfill confirmed orders in good faith. Misrepresentation or failure to honor orders may result in storefront suspension.`,
  },
  {
    title: "7. Prohibited Uses",
    body: `You agree not to use GenZ to list or purchase counterfeit, stolen, or unlawful goods; misrepresent credentials; scrape or reverse-engineer platform components; or compromise platform security.`,
  },
  {
    title: "8. Intellectual Property",
    body: `Product media uploaded by manufacturers remains their intellectual property, licensed to GenZ for display and marketing on the platform. The GenZ name, logo, software, and brand assets are the exclusive property of GenZ.`,
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
    <div className="bg-cream-paper text-ink-black flex min-h-screen flex-col font-sans antialiased">
      <main className="flex-1">
        {/* Page Header */}
        <section className="border-ash border-b px-6 py-16 sm:px-12 sm:py-20">
          <div className="mx-auto max-w-3xl text-left">
            <span className="text-caption font-graphik text-smoke mb-3 block tracking-[0.2em] uppercase">
              Legal &amp; Governance
            </span>
            <h1 className="font-nantes text-ink-black mb-4 text-4xl leading-[1.05] font-normal tracking-tight sm:text-5xl">
              Terms &amp; Conditions
            </h1>
            <p className="font-graphik text-smoke text-xs sm:text-sm">
              Last updated: July 2026 &bull; Governing Platform Usage &amp; Commerce
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="px-6 py-12 sm:px-12 sm:py-16">
          <div className="bg-pure-white border-ash mx-auto flex max-w-3xl flex-col gap-10 rounded-none border p-8 shadow-sm sm:p-12">
            {SECTIONS.map((s) => (
              <div
                key={s.title}
                className="border-ash/30 border-b pb-8 last:border-b-0 last:pb-0"
              >
                <h2 className="font-nantes text-ink-black mb-3 text-xl font-normal tracking-tight sm:text-2xl">
                  {s.title}
                </h2>
                <p className="font-graphik text-charcoal text-sm leading-relaxed sm:text-base">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
