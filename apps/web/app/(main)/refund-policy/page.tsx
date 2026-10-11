import { RotateCcw } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { COMPANY, POLICY } from "@genz/utils/company";
import { LegalPage, type LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Cancellation, Return & Refund Policy — GenZ",
  description: `Cancel before your order ships, report damaged, defective or wrong items within ${POLICY.returnWindowDays} days of delivery, and get refunds to your original payment method.`,
};

const { min: refundMin, max: refundMax } = POLICY.refundTimelineBusinessDays;

const SECTIONS: LegalSection[] = [
  {
    title: "1. About This Policy",
    body: (
      <p>
        {COMPANY.brandName} is an online marketplace. Products are listed and sold by
        independent sellers and artisans, who pack and ship their own orders. This
        policy applies to every order placed on {COMPANY.domain}. It sets out when you
        can cancel an order, when you can return an item, and how refunds are made.
      </p>
    ),
  },
  {
    title: "2. Cancelling an Order",
    body: (
      <>
        <p>
          You can cancel an order at any time before its status changes to{" "}
          <strong>&ldquo;{POLICY.cancellationAllowedUntilStatus}&rdquo;</strong>. To
          cancel, contact us with your order number at{" "}
          <a href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a> or{" "}
          <a href={`tel:${COMPANY.supportPhoneHref}`}>{COMPANY.supportPhone}</a>. There
          is no cancellation charge, and the full amount you paid is refunded as
          described in section 5.
        </p>
        <p>
          Once an order has shipped it can no longer be cancelled. If the item then
          arrives damaged, defective or wrong, you can request a return under section 3.
        </p>
        <p>
          If a seller cannot fulfil your order (for example, the item is out of stock),
          the order is cancelled and you receive a full refund.
        </p>
      </>
    ),
  },
  {
    title: "3. Returns & Replacements",
    body: (
      <>
        <p>
          You can request a return or replacement within{" "}
          <strong>{POLICY.returnWindowDays} days of delivery</strong> if:
        </p>
        <ul>
          {POLICY.returnEligibleReasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        <p>
          Contact us within the return window with your order number, a short
          description of the problem, and photos of the item and its packaging. We
          review the request with the seller and tell you the outcome. If the return is
          approved, we will explain how the item will be collected or how to send it
          back.
        </p>
      </>
    ),
  },
  {
    title: "4. Handmade & Custom-Made Items",
    body: (
      <>
        <p>
          Many products on {COMPANY.brandName} are handmade, made to order or
          personalised. These items are <strong>not returnable</strong> unless they
          arrive damaged, are defective, or are not the item you ordered. In those cases
          section 3 applies in full.
        </p>
        <p>
          Handmade products can differ slightly from their photos in colour, grain,
          finish or size. Small natural differences like these are part of handmade work
          and are not treated as defects.
        </p>
      </>
    ),
  },
  {
    title: "5. Refunds",
    body: (
      <>
        <p>
          Approved refunds go back to your <strong>{POLICY.refundMethod}</strong>. We
          start the refund once a cancellation or return is approved, and it normally
          reaches your account within{" "}
          <strong>
            {refundMin}–{refundMax} business days
          </strong>{" "}
          after approval. The exact time depends on your bank or payment provider.
        </p>
        <p>
          If you are refunded because an item was damaged, defective or wrong, the
          refund covers the full amount you paid for that item, including any shipping
          charge.
        </p>
      </>
    ),
  },
  {
    title: "6. Contact & Complaints",
    body: (
      <p>
        For help with a cancellation, return or refund, email{" "}
        <a href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a> or call{" "}
        <a href={`tel:${COMPANY.supportPhoneHref}`}>{COMPANY.supportPhone}</a> (
        {COMPANY.supportHours}). If you are not satisfied with how your request was
        handled, you can raise a complaint with our{" "}
        <Link href="/grievance">Grievance Officer</Link>. See also our{" "}
        <Link href="/shipping-policy">Shipping Policy</Link> and{" "}
        <Link href="/terms">Terms &amp; Conditions</Link>.
      </p>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      icon={RotateCcw}
      eyebrow="Orders & Payments"
      title="Cancellation, Return & Refund Policy"
      subtitle={
        <>
          Last updated: October 2026 &bull; Applies to all orders placed on{" "}
          {COMPANY.domain}
        </>
      }
      sections={SECTIONS}
      cta={{
        text: "Have a problem with an order?",
        linkLabel: "Contact Support",
        href: "/contact",
      }}
    />
  );
}
