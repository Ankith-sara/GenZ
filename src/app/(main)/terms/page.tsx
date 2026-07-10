

export const metadata = {
  title: "Terms & Conditions — GenZ",
  description: "The terms that govern use of the GenZ platform for buyers and manufacturers.",
};

const SECTIONS = [
  {
    title: "1. Who We Are",
    body: `GenZ ("we", "us", "the platform") operates a trust-commerce marketplace connecting Indian consumers with verified Indian manufacturers, MSMEs, startups, and artisan businesses. By creating an account or using any part of the platform, you agree to these Terms & Conditions.`,
  },
  {
    title: "2. Eligibility & Accounts",
    body: `You must be at least 18 years old, or have the consent of a parent or guardian, to create an account. You're responsible for the accuracy of the information you provide and for keeping your login credentials secure. Manufacturer accounts additionally require valid GST registration and pass our verification review before a storefront goes live.`,
  },
  {
    title: "3. Verified Manufacturer Listings",
    body: `We verify manufacturer identity, GST status, and — where applicable — factory or production claims before listings are published. Verification confirms that a business is who it claims to be; it does not constitute a guarantee of product quality, delivery timelines, or fitness for a particular purpose. Buyers should still exercise ordinary care when placing orders.`,
  },
  {
    title: "4. Orders, Pricing & Payments",
    body: `Product pricing, availability, and accepted payment methods are set by individual manufacturers and displayed on each listing. GenZ facilitates the connection between buyer and manufacturer; order fulfillment, shipping, and after-sales support are the responsibility of the manufacturer unless otherwise stated on the platform.`,
  },
  {
    title: "5. Cancellations, Returns & Refunds",
    body: `Cancellation and return policies may vary by manufacturer and will be disclosed on the relevant product or storefront page before you complete a purchase. Where a manufacturer's policy is silent or unclear, contact our support team and we'll help mediate a resolution.`,
  },
  {
    title: "6. Manufacturer Obligations",
    body: `Manufacturers agree to list only products they are legally entitled to sell, to represent product details (materials, dimensions, origin, pricing) accurately, and to fulfill confirmed orders in good faith. Repeated inaccurate listings, non-fulfillment, or misrepresentation of verification status may result in suspension or removal from the platform.`,
  },
  {
    title: "7. Prohibited Use",
    body: `You agree not to use GenZ to list or purchase counterfeit, stolen, or illegal goods; to misrepresent your identity or business credentials; to scrape or reverse-engineer the platform; or to interfere with the security or normal operation of the service.`,
  },
  {
    title: "8. Content & Intellectual Property",
    body: `Product photos, descriptions, and reels uploaded by manufacturers remain their intellectual property, but by uploading you grant GenZ a license to display that content on the platform for the purpose of listing and promoting the product. The GenZ name, logo, and platform design are the property of GenZ and may not be reproduced without permission.`,
  },
  {
    title: "9. Limitation of Liability",
    body: `GenZ is provided on an "as is" basis. To the extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from transactions between buyers and manufacturers, delays, or product defects — responsibility for the product itself rests with the manufacturer.`,
  },
  {
    title: "10. Suspension & Termination",
    body: `We may suspend or terminate accounts that violate these terms, provide false verification information, or engage in fraudulent activity, with or without notice depending on severity.`,
  },
  {
    title: "11. Changes to These Terms",
    body: `We may update these Terms & Conditions from time to time to reflect changes in our platform or legal requirements. Material changes will be communicated via the platform or registered email before they take effect.`,
  },
  {
    title: "12. Contact",
    body: `Questions about these terms can be sent to genz.official.hq@gmail.com or via our Contact page.`,
  },
];

export default async function TermsPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col font-sans text-foreground antialiased">
      <main className="flex-1">
        <section className="py-20 sm:py-24 px-6 sm:px-12 border-b border-black/10">
          <div className="mx-auto max-w-3xl text-left">
            <span className="eyebrow text-charcoal mb-3 block">Legal</span>
            <h1 className="font-serif text-4xl sm:text-6xl font-normal leading-[1.05] tracking-tight text-deep-forest mb-4">
              Terms &amp; Conditions
            </h1>
            <p className="text-charcoal text-sm">Last updated: July 2026</p>
          </div>
        </section>

        <section className="py-16 sm:py-20 px-6 sm:px-12">
          <div className="mx-auto max-w-3xl bg-paper-white rounded-[4px] border border-black/10 p-8 sm:p-12 flex flex-col gap-10">
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h2 className="font-serif text-xl sm:text-2xl font-normal text-deep-forest mb-3 tracking-tight">
                  {s.title}
                </h2>
                <p className="text-charcoal text-sm sm:text-base leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
