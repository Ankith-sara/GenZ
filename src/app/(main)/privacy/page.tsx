export const metadata = {
  title: "Privacy Policy — GenZ",
  description: "How GenZ collects, uses, and protects your data.",
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly to us — such as your name, official email address, phone number, shipping address, and (for registered manufacturers) business entity details, GSTIN, and factory verification documents. When you sign in using third-party services like Google OAuth, we receive basic authentication profile data (your name, email address, and profile photo URL) provided by Google.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use your information to operate your account, process and route buyer-manufacturer orders, conduct manufacturer verification, send transactional notifications, and ensure platform security. Google OAuth data is strictly used for account authentication and user identity management. We do not sell your personal data or Google user data to third parties.`,
  },
  {
    title: "3. Information Sharing with Buyers & Sellers",
    body: `To facilitate transactions, necessary contact and fulfillment details are shared between the buyer and the verified manufacturer involved in that specific order. Sellers only receive the information required to manufacture and deliver your order. We do not share your account credentials or full profile data with unrelated sellers.`,
  },
  {
    title: "4. Infrastructure & Third-Party Providers",
    body: `GenZ relies on secure enterprise cloud infrastructure — including Supabase for encrypted database and authentication management, cloud media storage for product reels, and Google Cloud services for OAuth identity. These providers process data strictly on our behalf under mandatory confidentiality and security agreements.`,
  },
  {
    title: "5. Cookies & Session Storage",
    body: `We use essential session tokens and cookies to maintain your authenticated session and preserve your user preferences across visits. Essential authentication cookies cannot be disabled as they are required for security and core functionality.`,
  },
  {
    title: "6. Data Security & Encryption",
    body: `We implement robust technical and organizational security measures — including HTTPS/TLS encryption in transit, encrypted storage at rest via Supabase, and strict role-based access control — to safeguard your personal information against unauthorized access, disclosure, or alteration.`,
  },
  {
    title: "7. Data Retention & Account Deletion",
    body: `We retain personal and business information for as long as your account remains active or as needed to provide platform services. You have the right to request full account and data deletion at any time by contacting us. Certain transaction and GST verification records may be retained for statutory periods as required by Indian law.`,
  },
  {
    title: "8. Children's Privacy",
    body: `GenZ is an e-commerce and B2C manufacturing platform intended for users aged 18 and older. We do not knowingly collect or solicit personal information from children under 18. If we learn that a minor has provided us with personal data, we will immediately delete it.`,
  },
  {
    title: "9. Policy Updates",
    body: `We may update this Privacy Policy periodically to reflect platform enhancements or legal requirements. Updated policies will be posted on this page with a revised "Last updated" date.`,
  },
  {
    title: "10. Contact Us & Data Requests",
    body: `If you have questions, feedback, or data privacy requests regarding this Privacy Policy or your personal information, please reach out to our team at genz.official.hq@gmail.com.`,
  },
];

export default async function PrivacyPage() {
  return (
    <div className="bg-cream-paper text-ink-black flex min-h-screen flex-col font-sans antialiased">
      <main className="flex-1">
        {/* Page Header */}
        <section className="border-ash border-b px-6 py-16 sm:px-12 sm:py-20">
          <div className="mx-auto max-w-3xl text-left">
            <span className="text-caption font-graphik text-smoke mb-3 block tracking-[0.2em] uppercase">
              Legal &amp; Compliance
            </span>
            <h1 className="font-nantes text-ink-black mb-4 text-4xl leading-[1.05] font-normal tracking-tight sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="font-graphik text-smoke text-xs sm:text-sm">
              Last updated: July 2026 &bull; Compliant with Indian DPDP Act &amp; Google
              OAuth Security Standards
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
