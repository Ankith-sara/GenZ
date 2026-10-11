import { Scale } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  COMPANY,
  NATIONAL_CONSUMER_HELPLINE,
  POLICY,
  formatAddress,
} from "@genz/utils/company";
import { LegalPage, type LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Grievance Officer & Complaint Redressal — GenZ",
  description:
    "Contact details of the GenZ Grievance Officer, how to file a complaint, response timelines, and how to escalate to the National Consumer Helpline.",
};

const officer = COMPANY.grievanceOfficer;

const SECTIONS: LegalSection[] = [
  {
    title: "1. Grievance Officer",
    body: (
      <>
        <p>
          In accordance with the Consumer Protection (E-Commerce) Rules, 2020 and the
          Digital Personal Data Protection Act, 2023, {COMPANY.brandName} has appointed
          a Grievance Officer to handle consumer complaints and personal data concerns.
        </p>
        <dl className="border-ash grid grid-cols-1 gap-x-6 gap-y-2 rounded-xl border bg-white p-5 sm:grid-cols-[max-content_1fr]">
          <dt className="text-ink-black font-semibold">Name</dt>
          <dd>{officer.name}</dd>
          <dt className="text-ink-black font-semibold">Designation</dt>
          <dd>{officer.designation}</dd>
          <dt className="text-ink-black font-semibold">Email</dt>
          <dd>
            <a href={`mailto:${officer.email}`}>{officer.email}</a>
          </dd>
          <dt className="text-ink-black font-semibold">Phone</dt>
          <dd>
            <a href={`tel:${officer.phone.replace(/\s+/g, "")}`}>{officer.phone}</a>
          </dd>
          <dt className="text-ink-black font-semibold">Address</dt>
          <dd>{formatAddress(officer.address)}</dd>
          <dt className="text-ink-black font-semibold">Working hours</dt>
          <dd>{officer.workingHours}</dd>
        </dl>
      </>
    ),
  },
  {
    title: "2. Platform Operator",
    body: (
      <ul>
        <li>
          <strong>Legal entity:</strong> {COMPANY.legalEntityName}
        </li>
        <li>
          <strong>Registration (CIN):</strong> {COMPANY.registrationNumber}
        </li>
        <li>
          <strong>GSTIN:</strong> {COMPANY.gstin}
        </li>
        <li>
          <strong>Registered office:</strong> {formatAddress(COMPANY.registeredOffice)}
        </li>
        <li>
          <strong>Customer support:</strong>{" "}
          <a href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a>,{" "}
          <a href={`tel:${COMPANY.supportPhoneHref}`}>{COMPANY.supportPhone}</a>
        </li>
      </ul>
    ),
  },
  {
    title: "3. How to File a Complaint",
    body: (
      <>
        <p>
          Email the Grievance Officer at{" "}
          <a href={`mailto:${officer.email}`}>{officer.email}</a> with the subject line
          &ldquo;Grievance&rdquo; and include:
        </p>
        <ul>
          <li>Your name and the email or phone number on your account</li>
          <li>The order number, if your complaint is about an order</li>
          <li>A clear description of the issue and what you would like us to do</li>
          <li>Any supporting photos, screenshots or documents</li>
        </ul>
        <p>
          You can also call {officer.phone} during working hours. For quick help with an
          order, you can first contact customer support; if you are not satisfied with
          the response, write to the Grievance Officer.
        </p>
      </>
    ),
  },
  {
    title: "4. Response Timelines",
    body: (
      <ul>
        <li>
          We will{" "}
          <strong>
            acknowledge your complaint within {POLICY.grievanceAcknowledgementHours}{" "}
            hours
          </strong>{" "}
          of receiving it.
        </li>
        <li>
          We will{" "}
          <strong>
            resolve your complaint within {POLICY.grievanceResolutionLabel}
          </strong>{" "}
          of receiving it, and tell you the outcome and the reasons for it.
        </li>
      </ul>
    ),
  },
  {
    title: "5. Complaints About a Seller's Product",
    body: (
      <p>
        Products on {COMPANY.brandName} are sold by independent sellers. If your
        complaint is about a product or a seller, we will take it up with the seller and
        help resolve it in line with our{" "}
        <Link href="/refund-policy">Cancellation &amp; Refund Policy</Link>. The
        seller&apos;s name and location are shown on their profile page.
      </p>
    ),
  },
  {
    title: "6. Escalation",
    body: (
      <>
        <p>
          If you are not satisfied with our resolution, or we do not respond within the
          timelines above, you can approach the {NATIONAL_CONSUMER_HELPLINE.name} of the
          Government of India:
        </p>
        <ul>
          <li>
            Toll-free: <strong>{NATIONAL_CONSUMER_HELPLINE.tollFree}</strong>
          </li>
          <li>
            Online:{" "}
            <a
              href={NATIONAL_CONSUMER_HELPLINE.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {NATIONAL_CONSUMER_HELPLINE.website.replace("https://", "")}
            </a>
          </li>
          <li>
            Consumer commission e-filing:{" "}
            <a
              href={NATIONAL_CONSUMER_HELPLINE.edaakhilWebsite}
              target="_blank"
              rel="noopener noreferrer"
            >
              {NATIONAL_CONSUMER_HELPLINE.edaakhilWebsite.replace("https://", "")}
            </a>
          </li>
        </ul>
        <p>
          For personal data complaints that we do not resolve, you may also approach the
          Data Protection Board of India under the Digital Personal Data Protection Act,
          2023.
        </p>
      </>
    ),
  },
];

export default function GrievancePage() {
  return (
    <LegalPage
      icon={Scale}
      eyebrow="Consumer Protection"
      title="Grievance Redressal"
      subtitle={
        <>
          Last updated: October 2026 &bull; Consumer Protection (E-Commerce) Rules, 2020
        </>
      }
      sections={SECTIONS}
      cta={{
        text: "Need help with an order first?",
        linkLabel: "Contact Support",
        href: "/contact",
      }}
    />
  );
}
