import { Shield } from "lucide-react";
import Link from "next/link";
import { COMPANY, POLICY, formatAddress } from "@genz/utils/company";
import { LegalPage, type LegalSection } from "@/components/legal-page";

export const metadata = {
  title: "Terms & Conditions — GenZ Platform",
  description:
    "The legal terms governing platform usage, buyer protections, and seller verification on GenZ.",
};

const SECTIONS: LegalSection[] = [
  {
    title: "1. Who We Are",
    body: (
      <p>
        {COMPANY.brandName} (&ldquo;GenZ&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
        &ldquo;the platform&rdquo;) is an online marketplace operated by{" "}
        {COMPANY.legalEntityName}, with its registered office at{" "}
        {formatAddress(COMPANY.registeredOffice)}. The platform connects Indian
        consumers with independent Indian sellers, MSMEs, startups, and artisan
        businesses. By creating an account or using any part of the platform, you agree
        to these Terms &amp; Conditions.
      </p>
    ),
  },
  {
    title: "2. Eligibility & Accounts",
    body: `You must be at least 18 years old to create an account. You are responsible for the accuracy of the information you provide and for maintaining the confidentiality of your login credentials. Seller accounts require valid GST registration and pass our verification review before a storefront is activated.`,
  },
  {
    title: "3. GenZ Is a Marketplace",
    body: (
      <>
        <p>
          GenZ provides the technology platform on which independent sellers list and
          sell their products. Unless a listing clearly says otherwise, GenZ does not
          own, manufacture or stock the products sold on the platform.
        </p>
        <p>
          The seller named on a listing is the <strong>seller of record</strong> for
          that product. The seller is responsible for the product&apos;s quality,
          safety, description, legal compliance, warranty (if any), packing, dispatch
          and the tax invoice. GenZ facilitates orders, payments and customer support,
          and helps resolve disputes between buyers and sellers.
        </p>
      </>
    ),
  },
  {
    title: "4. Verified Seller Listings",
    body: `We review seller identity and GST status before a storefront is activated. Verification confirms that a business exists and is registered; it is not a guarantee of individual product performance or fitness for a specific purpose. Please review product descriptions and photos carefully before buying.`,
  },
  {
    title: "5. Orders, Pricing & Payments",
    body: (
      <p>
        Product prices and availability are set by sellers and shown on each listing.
        Shipping charges are explained in our{" "}
        <Link href="/shipping-policy">Shipping Policy</Link>, and the total amount
        payable, including any shipping charge and applicable taxes, is shown at
        checkout before you pay. Online payments are processed by our payment partner;
        GenZ does not store your card or UPI details.
      </p>
    ),
  },
  {
    title: "6. Cancellations, Returns & Refunds",
    body: (
      <>
        <p>
          Cancellations, returns and refunds are governed by our{" "}
          <Link href="/refund-policy">Cancellation, Return &amp; Refund Policy</Link>.
          In summary:
        </p>
        <ul>
          <li>
            You can cancel an order before it is {POLICY.cancellationAllowedUntilStatus}
            .
          </li>
          <li>
            Damaged, defective or wrong items can be reported within{" "}
            {POLICY.returnWindowDays} days of delivery.
          </li>
          <li>
            Handmade and custom-made items are not returnable unless they are damaged,
            defective or wrong.
          </li>
          <li>
            Approved refunds go to your {POLICY.refundMethod} within{" "}
            {POLICY.refundTimelineBusinessDays.min}–
            {POLICY.refundTimelineBusinessDays.max} business days.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "7. Seller Obligations",
    body: `Sellers agree to list only products they are legally authorised to sell, describe products and prices accurately, issue proper tax invoices, fulfil confirmed orders in good faith, and honour GenZ's cancellation, return and refund policy. Misrepresentation or failure to honour orders may result in storefront suspension.`,
  },
  {
    title: "8. Prohibited Uses",
    body: `You agree not to use GenZ to list or purchase counterfeit, stolen, or unlawful goods; misrepresent credentials; scrape or reverse-engineer platform components; or compromise platform security.`,
  },
  {
    title: "9. Intellectual Property",
    body: `Product media uploaded by sellers remains their intellectual property, licensed to GenZ for display and marketing on the platform. The GenZ name, logo, software, and brand assets are the exclusive property of GenZ.`,
  },
  {
    title: "10. Limitation of Liability",
    body: `GenZ is provided on an "as is" and "as available" basis. To the maximum extent permitted by law, GenZ shall not be liable for indirect, incidental, or consequential damages arising from buyer-seller transactions. Nothing in these terms limits any rights you have as a consumer under the Consumer Protection Act, 2019 or other applicable Indian law.`,
  },
  {
    title: "11. Account Termination",
    body: `We reserve the right to suspend or terminate accounts that violate these terms, submit fraudulent verification credentials, or engage in suspicious activity.`,
  },
  {
    title: "12. Governing Law & Disputes",
    body: (
      <p>
        These terms are governed by the laws of India. If you have a complaint, please
        contact us first so we can try to resolve it — see{" "}
        <Link href="/grievance">Grievance Redressal</Link> for our Grievance Officer and
        response timelines. Disputes that cannot be resolved this way are subject to the
        jurisdiction of the competent courts and consumer commissions in India.
      </p>
    ),
  },
  {
    title: "13. Changes to Terms",
    body: `We may update these Terms & Conditions periodically. Updated terms will be posted on this page with a revised "Last updated" date. Continued use of the platform after changes are published constitutes acceptance of the revised terms.`,
  },
  {
    title: "14. Contact & Legal Inquiries",
    body: (
      <p>
        For questions about these terms, contact us at{" "}
        <a href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a>. For
        complaints, please write to our <Link href="/grievance">Grievance Officer</Link>
        .
      </p>
    ),
  },
];

export default async function TermsPage() {
  return (
    <LegalPage
      icon={Shield}
      eyebrow="Legal & Governance"
      title="Terms & Conditions"
      subtitle={
        <>
          Last updated: October 2026 &bull; Governing Platform Usage &amp; Marketplace
          Commerce
        </>
      }
      sections={SECTIONS}
      cta={{
        text: "Have questions about our legal policies or buyer terms?",
        linkLabel: "Contact our Legal Team",
        href: "/contact",
      }}
    />
  );
}
