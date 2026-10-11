import { Lock } from "lucide-react";
import Link from "next/link";
import { COMPANY, formatAddress } from "@genz/utils/company";
import { LegalPage, type LegalSection } from "@/components/legal-page";

export const metadata = {
  title: "Privacy Policy — GenZ Platform",
  description:
    "How GenZ collects, uses, and protects your personal data under the Digital Personal Data Protection Act, 2023.",
};

const officer = COMPANY.grievanceOfficer;

const SECTIONS: LegalSection[] = [
  {
    title: "1. Who Is Responsible for Your Data",
    body: (
      <p>
        {COMPANY.brandName} is operated by {COMPANY.legalEntityName} (registered office:{" "}
        {formatAddress(COMPANY.registeredOffice)}), which is the Data Fiduciary for
        personal data collected through the platform under the Digital Personal Data
        Protection Act, 2023 (&ldquo;DPDP Act&rdquo;).
      </p>
    ),
  },
  {
    title: "2. Information We Collect",
    body: `We collect information you provide directly to us — such as your name, email address, phone number, shipping address, and (for registered sellers) business entity details, GSTIN, and verification documents. When you sign in using third-party services like Google OAuth, we receive basic authentication profile data (your name, email address, and profile photo URL) provided by Google. When you place an order we keep a record of the order, the items, the amounts paid and the payment reference returned by our payment processor.`,
  },
  {
    title: "3. How We Use Your Information",
    body: `We use your information to operate your account, process and route buyer-seller orders, handle cancellations, returns and refunds, conduct seller verification, send transactional emails about your account and orders, respond to support requests and complaints, meet legal and tax obligations, and keep the platform secure. Google OAuth data is used only for account authentication and identity management. We do not sell your personal data or Google user data to anyone.`,
  },
  {
    title: "4. Information Sharing with Buyers & Sellers",
    body: `To fulfil an order, the buyer's name, phone number and shipping address are shared with the seller of that specific order. Sellers receive only the information required to make and deliver your order. We do not share your account credentials or full profile data with unrelated sellers.`,
  },
  {
    title: "5. Service Providers (Data Processors)",
    body: (
      <>
        <p>
          We use the following service providers, who process data on our behalf and
          only for the purposes described:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — database, file storage (product media and
            workshop reels) and account authentication.
          </li>
          <li>
            <strong>Razorpay</strong> — payment processing. Your card, UPI or bank
            details are entered with and handled by Razorpay; we do not store them. We
            receive the payment status and reference for your order.
          </li>
          <li>
            <strong>Resend</strong> — sending transactional emails such as order updates
            and seller account notifications.
          </li>
          <li>
            <strong>Vercel</strong> — website hosting and Vercel Web Analytics, which
            measures aggregate page visits without using cookies.
          </li>
          <li>
            <strong>Google</strong> — &ldquo;Sign in with Google&rdquo; (OAuth), if you
            choose to use it.
          </li>
        </ul>
        <p>
          Some of these providers may process data on servers outside India. We share
          only what each provider needs to perform its service.
        </p>
      </>
    ),
  },
  {
    title: "6. Cookies & Local Storage",
    body: (
      <>
        <p>
          We use only <strong>essential cookies</strong> needed to keep you signed in
          and protect your session. These cannot be switched off because the site cannot
          work securely without them. We do not use advertising or cross-site tracking
          cookies.
        </p>
        <p>
          Vercel Web Analytics is cookieless: it counts page views in aggregate and does
          not set cookies or build a profile of you. Your cart, wishlist and recent
          searches are saved in your own browser&apos;s local storage so they are kept
          between visits; you can clear them at any time by clearing your browser&apos;s
          site data.
        </p>
      </>
    ),
  },
  {
    title: "7. Data Security",
    body: `We use technical and organisational safeguards — including HTTPS/TLS encryption in transit, encrypted storage at rest via our infrastructure providers, and role-based access controls — to protect your personal data against unauthorised access, disclosure or alteration.`,
  },
  {
    title: "8. Data Retention",
    body: `We keep personal data for as long as your account is active or as needed to provide our services. When you ask us to delete your account, we erase your personal data unless we must keep it to meet a legal obligation — for example, order, invoice and GST records that Indian tax law requires us to retain for a statutory period.`,
  },
  {
    title: "9. Your Rights",
    body: (
      <>
        <p>Under the DPDP Act, you have the right to:</p>
        <ul>
          <li>
            <strong>Access</strong> — get a summary of the personal data we hold about
            you and how it is used.
          </li>
          <li>
            <strong>Correction &amp; completion</strong> — have inaccurate or incomplete
            data corrected or updated.
          </li>
          <li>
            <strong>Erasure</strong> — ask us to delete your personal data, subject to
            legal retention requirements.
          </li>
          <li>
            <strong>Withdraw consent</strong> — where we rely on your consent, you can
            withdraw it at any time (this does not affect processing already done).
          </li>
          <li>
            <strong>Grievance redressal</strong> — raise a complaint about how we handle
            your data.
          </li>
          <li>
            <strong>Nominate</strong> — nominate another person to exercise these rights
            on your behalf in the event of your death or incapacity.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "10. How to Exercise Your Rights",
    body: (
      <>
        <p>
          Email <a href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a>{" "}
          from the email address linked to your account, saying which right you want to
          exercise. We may ask you to confirm your identity before acting on the
          request.
        </p>
        <p>
          If you are not satisfied with our response, contact our Grievance Officer:{" "}
          {officer.name}, {officer.designation} —{" "}
          <a href={`mailto:${officer.email}`}>{officer.email}</a>, {officer.phone} (
          {officer.workingHours}). Full details are on our{" "}
          <Link href="/grievance">Grievance Redressal</Link> page. You may also approach
          the Data Protection Board of India.
        </p>
      </>
    ),
  },
  {
    title: "11. Children's Privacy",
    body: `GenZ is intended for users aged 18 and older. We do not knowingly collect personal data from children under 18. If we learn that a child has provided us with personal data, we will delete it.`,
  },
  {
    title: "12. Policy Updates",
    body: `We may update this Privacy Policy to reflect changes to our services or legal requirements. Updated policies will be posted on this page with a revised "Last updated" date.`,
  },
];

export default async function PrivacyPage() {
  return (
    <LegalPage
      icon={Lock}
      eyebrow="Legal & Compliance"
      title="Privacy Policy"
      subtitle={
        <>
          Last updated: October 2026 &bull; Digital Personal Data Protection Act, 2023
        </>
      }
      sections={SECTIONS}
      cta={{
        text: "Want to access, correct or delete your data?",
        linkLabel: "Contact the Grievance Officer",
        href: "/grievance",
      }}
    />
  );
}
