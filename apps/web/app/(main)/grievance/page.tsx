import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, Mail, Phone } from "lucide-react";
import {
  COMPANY,
  NATIONAL_CONSUMER_HELPLINE,
  POLICY,
  formatAddress,
} from "@genz/utils/company";

export const metadata: Metadata = {
  title: "Grievance Officer & Complaint Redressal — GenZ",
  description:
    "Contact details of the GenZ Grievance Officer, how to file a complaint, response timelines, and how to escalate to the National Consumer Helpline.",
};

const officer = COMPANY.grievanceOfficer;
const officerPhoneHref = `tel:${officer.phone.replace(/\s+/g, "")}`;

const linkClass =
  "text-ink-black decoration-brand-yellow-dark font-medium underline decoration-2 underline-offset-4 transition-colors hover:decoration-ink-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none rounded-sm";

const INCLUDE_LIST = [
  "Your name and the email or phone number on your account",
  "The order number, if your complaint is about an order",
  "A clear description of the issue and what you would like us to do",
  "Any supporting photos, screenshots or documents",
];

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-smoke text-xs">{label}</dt>
      <dd className="text-ink-black mt-0.5 text-sm leading-relaxed [overflow-wrap:anywhere]">
        {children}
      </dd>
    </div>
  );
}

export default function GrievancePage() {
  return (
    <main className="bg-cream-paper text-ink-black min-h-screen flex-1 font-sans antialiased">
      {/* 1. The desk: brand-yellow band with the one action that matters */}
      <section className="bg-brand-yellow border-b border-black/10">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-12 sm:py-24">
          <h1 className="font-nantes max-w-4xl text-5xl leading-[1.02] font-normal tracking-tight text-balance text-black sm:text-7xl">
            Something went wrong? Tell us.
          </h1>
          <p className="font-graphik mt-6 max-w-xl text-base leading-relaxed text-black/70 sm:text-lg">
            This is the grievance redressal desk for {COMPANY.brandName}, run under the
            Consumer Protection (E-Commerce) Rules, 2020. Your Grievance Officer is{" "}
            <span className="font-semibold text-black">{officer.name}</span>,{" "}
            {officer.designation}.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`mailto:${officer.email}?subject=Grievance`}
              className="font-graphik bg-ink-black hover:bg-black inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-brand-yellow focus-visible:outline-none"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email the Grievance Officer
            </a>
            <a
              href={officerPhoneHref}
              className="font-graphik inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/30 px-7 text-sm font-semibold text-black transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-brand-yellow focus-visible:outline-none"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call {officer.phone}
            </a>
          </div>

          <p className="font-graphik mt-6 text-sm text-black/60">
            Working hours: {officer.workingHours}. Last updated October 2026.
          </p>
        </div>
      </section>

      {/* 2. What happens after you write: a real timeline */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-12 sm:py-24">
        <h2 className="font-nantes text-ink-black max-w-2xl text-3xl font-normal tracking-tight text-balance sm:text-5xl">
          What happens after you write
        </h2>

        <ol className="mt-12 lg:grid lg:grid-cols-4">
          <li className="border-ash relative border-l pb-10 pl-6 lg:border-t lg:border-l-0 lg:pt-6 lg:pr-8 lg:pb-0 lg:pl-0">
            <span
              aria-hidden="true"
              className="bg-ink-black absolute top-1 -left-1.5 h-3 w-3 rounded-full lg:-top-1.5 lg:left-0"
            />
            <h3 className="font-graphik text-smoke text-sm">You</h3>
            <p className="font-nantes text-ink-black mt-1 text-3xl font-normal tracking-tight sm:text-4xl">
              Write or call
            </p>
            <p className="font-graphik text-smoke mt-3 text-sm leading-relaxed">
              Email the Grievance Officer at{" "}
              <a href={`mailto:${officer.email}?subject=Grievance`} className={linkClass}>
                {officer.email}
              </a>{" "}
              with the subject line “Grievance”, or call {officer.phone} during working
              hours.
            </p>
          </li>

          <li className="border-ash relative border-l pb-10 pl-6 lg:border-t lg:border-l-0 lg:pt-6 lg:pr-8 lg:pb-0 lg:pl-0">
            <span
              aria-hidden="true"
              className="bg-ink-black absolute top-1 -left-1.5 h-3 w-3 rounded-full lg:-top-1.5 lg:left-0"
            />
            <h3 className="font-graphik text-smoke text-sm">We acknowledge within</h3>
            <p className="font-nantes text-ink-black mt-1 text-3xl font-normal tracking-tight sm:text-4xl">
              {POLICY.grievanceAcknowledgementHours} hours
            </p>
            <p className="font-graphik text-smoke mt-3 text-sm leading-relaxed">
              We will acknowledge your complaint within{" "}
              {POLICY.grievanceAcknowledgementHours} hours of receiving it.
            </p>
          </li>

          <li className="border-ash relative border-l pb-10 pl-6 lg:border-t lg:border-l-0 lg:pt-6 lg:pr-8 lg:pb-0 lg:pl-0">
            <span
              aria-hidden="true"
              className="bg-ink-black absolute top-1 -left-1.5 h-3 w-3 rounded-full lg:-top-1.5 lg:left-0"
            />
            <h3 className="font-graphik text-smoke text-sm">We resolve within</h3>
            <p className="font-nantes text-ink-black mt-1 text-3xl font-normal tracking-tight sm:text-4xl">
              {POLICY.grievanceResolutionLabel}
            </p>
            <p className="font-graphik text-smoke mt-3 text-sm leading-relaxed">
              We will resolve your complaint within {POLICY.grievanceResolutionLabel} of
              receiving it, and tell you the outcome and the reasons for it.
            </p>
          </li>

          <li className="border-ash relative border-l pl-6 lg:border-t lg:border-l-0 lg:pt-6 lg:pr-0 lg:pl-0">
            <span
              aria-hidden="true"
              className="bg-brand-yellow ring-ink-black absolute top-1 -left-1.5 h-3 w-3 rounded-full ring-1 lg:-top-1.5 lg:left-0"
            />
            <h3 className="font-graphik text-smoke text-sm">Not satisfied?</h3>
            <p className="font-nantes text-ink-black mt-1 text-3xl font-normal tracking-tight sm:text-4xl">
              Escalate
            </p>
            <p className="font-graphik text-smoke mt-3 text-sm leading-relaxed">
              If you are not satisfied with our resolution, or we do not respond within
              the timelines above, you can{" "}
              <a href="#escalation" className={linkClass}>
                escalate to the National Consumer Helpline
              </a>
              .
            </p>
          </li>
        </ol>
      </section>

      {/* 3. What to include + the officer's full details */}
      <section className="border-ash border-y bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 sm:px-12 sm:py-24 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <h2 className="font-nantes text-ink-black text-3xl font-normal tracking-tight sm:text-4xl">
              What to include
            </h2>
            <ul className="mt-6 space-y-4">
              {INCLUDE_LIST.map((item) => (
                <li key={item} className="font-graphik flex items-start gap-3 text-base">
                  <span className="bg-brand-yellow mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    <Check className="h-3.5 w-3.5 text-black" aria-hidden="true" />
                  </span>
                  <span className="text-ink-black leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <p className="font-graphik text-smoke mt-6 max-w-lg text-base leading-relaxed">
              For quick help with an order, you can first contact customer support; if
              you are not satisfied with the response, write to the Grievance Officer.
            </p>
            <Link
              href="/contact"
              className="font-graphik text-ink-black border-ash mt-6 inline-flex h-12 items-center justify-center rounded-full border px-7 text-sm font-semibold transition-colors hover:bg-cream-paper focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Contact support first
            </Link>
          </div>

          <div className="lg:col-span-6">
            <h2 className="font-nantes text-ink-black text-3xl font-normal tracking-tight sm:text-4xl">
              Your Grievance Officer
            </h2>
            <p className="font-graphik text-smoke mt-4 max-w-lg text-base leading-relaxed">
              In accordance with the Consumer Protection (E-Commerce) Rules, 2020 and
              the Digital Personal Data Protection Act, 2023, {COMPANY.brandName} has
              appointed a Grievance Officer to handle consumer complaints and personal
              data concerns.
            </p>
            <dl className="border-ash bg-cream-paper font-graphik mt-6 grid gap-5 rounded-2xl border p-6 sm:grid-cols-2 sm:p-8">
              <DetailRow label="Name">{officer.name}</DetailRow>
              <DetailRow label="Designation">{officer.designation}</DetailRow>
              <DetailRow label="Email">
                <a href={`mailto:${officer.email}`} className={linkClass}>
                  {officer.email}
                </a>
              </DetailRow>
              <DetailRow label="Phone">
                <a href={officerPhoneHref} className={linkClass}>
                  {officer.phone}
                </a>
              </DetailRow>
              <div className="sm:col-span-2">
                <DetailRow label="Address">{formatAddress(officer.address)}</DetailRow>
              </div>
              <div className="sm:col-span-2">
                <DetailRow label="Working hours">{officer.workingHours}</DetailRow>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* 4. Seller complaints */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 pt-16 sm:px-12 sm:pt-24 lg:grid-cols-12 lg:gap-16">
        <h2 className="font-nantes text-ink-black text-3xl font-normal tracking-tight text-balance sm:text-4xl lg:col-span-6">
          Complaints about a seller’s product
        </h2>
        <p className="font-graphik text-smoke text-base leading-relaxed lg:col-span-6">
          Products on {COMPANY.brandName} are sold by independent sellers. If your
          complaint is about a product or a seller, we will take it up with the seller
          and help resolve it in line with our{" "}
          <Link href="/refund-policy" className={linkClass}>
            Cancellation &amp; Refund Policy
          </Link>
          . The seller’s name and location are shown on their profile page.
        </p>
      </section>

      {/* 5. Escalation: the one dark block, for when we have failed you */}
      <section id="escalation" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-16 sm:px-12 sm:py-24">
        <div className="bg-ink-black grid grid-cols-1 gap-10 rounded-2xl p-8 text-white sm:p-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <h2 className="font-nantes text-3xl font-normal tracking-tight text-white sm:text-4xl">
              Escalation
            </h2>
            <p className="font-graphik mt-4 text-base leading-relaxed text-neutral-300">
              If you are not satisfied with our resolution, or we do not respond within
              the timelines above, you can approach the {NATIONAL_CONSUMER_HELPLINE.name}{" "}
              of the Government of India.
            </p>
            <p className="font-graphik mt-4 text-base leading-relaxed text-neutral-300">
              For personal data complaints that we do not resolve, you may also approach
              the Data Protection Board of India under the Digital Personal Data
              Protection Act, 2023.
            </p>
          </div>

          <dl className="font-graphik lg:col-span-5 lg:col-start-8">
            <dt className="text-sm text-neutral-400">Toll-free</dt>
            <dd className="font-nantes text-brand-yellow mt-1 text-4xl font-normal tracking-tight sm:text-5xl">
              {NATIONAL_CONSUMER_HELPLINE.tollFree}
            </dd>

            <dt className="mt-8 text-sm text-neutral-400">Online</dt>
            <dd className="mt-1">
              <a
                href={NATIONAL_CONSUMER_HELPLINE.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-sm text-base font-medium text-white underline decoration-neutral-500 underline-offset-4 hover:decoration-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
              >
                {NATIONAL_CONSUMER_HELPLINE.website.replace("https://", "")}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </dd>

            <dt className="mt-6 text-sm text-neutral-400">Consumer commission e-filing</dt>
            <dd className="mt-1">
              <a
                href={NATIONAL_CONSUMER_HELPLINE.edaakhilWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-sm text-base font-medium text-white underline decoration-neutral-500 underline-offset-4 hover:decoration-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
              >
                {NATIONAL_CONSUMER_HELPLINE.edaakhilWebsite.replace("https://", "")}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </dd>
          </dl>
        </div>
      </section>

      {/* 6. Platform operator: quiet reference details */}
      <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-12 sm:pb-28">
        <div className="border-ash border-t pt-10">
          <h2 className="font-nantes text-ink-black text-2xl font-normal tracking-tight">
            Platform operator
          </h2>
          <dl className="font-graphik mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <DetailRow label="Legal entity">{COMPANY.legalEntityName}</DetailRow>
            <DetailRow label="Registration (CIN)">{COMPANY.cin}</DetailRow>
            <DetailRow label="GSTIN">{COMPANY.gstin}</DetailRow>
            <DetailRow label="Registered office">
              {formatAddress(COMPANY.registeredOffice)}
            </DetailRow>
            <DetailRow label="Customer support">
              <a href={`mailto:${COMPANY.supportEmail}`} className={linkClass}>
                {COMPANY.supportEmail}
              </a>
              ,{" "}
              <a href={`tel:${COMPANY.supportPhoneHref}`} className={linkClass}>
                {COMPANY.supportPhone}
              </a>
            </DetailRow>
          </dl>
        </div>
      </section>
    </main>
  );
}