import { Truck } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { PricingService } from "@genz/services/pricing";
import { ShippingService } from "@genz/services/shipping";
import { COMPANY, POLICY } from "@genz/utils/company";
import { LegalPage, type LegalSection } from "@/components/legal-page";

const formatInr = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

const SHIPPING_FEE = formatInr(PricingService.DEFAULT_SHIPPING_FEE);
const FREE_SHIPPING_THRESHOLD = formatInr(PricingService.FREE_SHIPPING_THRESHOLD);

export const metadata: Metadata = {
  title: "Shipping Policy — GenZ",
  description: `How orders on GenZ are dispatched and delivered. Shipping is ${SHIPPING_FEE} per order and free on orders of ${FREE_SHIPPING_THRESHOLD} or more.`,
};

const carrierNames = ShippingService.getSupportedCarriers().map((c) => c.displayName);

const SECTIONS: LegalSection[] = [
  {
    title: "1. Who Ships Your Order",
    body: (
      <p>
        {COMPANY.brandName} is a marketplace. Each order is packed and dispatched
        directly by the seller or artisan who listed the product, not from a{" "}
        {COMPANY.brandName} warehouse. If your order contains items from more than one
        seller, they may arrive in separate packages on different days.
      </p>
    ),
  },
  {
    title: "2. Shipping Charges",
    body: (
      <>
        <p>
          A shipping charge of <strong>{SHIPPING_FEE}</strong> applies to orders below{" "}
          {FREE_SHIPPING_THRESHOLD}. Orders with a subtotal of{" "}
          <strong>{FREE_SHIPPING_THRESHOLD} or more ship free</strong>.
        </p>
        <p>
          The final shipping charge and applicable taxes are shown at checkout before
          you pay. We do not add any other delivery charge after you place your order.
        </p>
      </>
    ),
  },
  {
    title: "3. Dispatch Timelines",
    body: (
      <>
        <p>
          Sellers dispatch orders after they are confirmed. Ready-to-ship items are
          usually dispatched within a few business days. Handmade, made-to-order and
          personalised items can take longer because they are made after you order.
        </p>
        <p>
          If a seller cannot dispatch your order, we will let you know. You can cancel
          any order before it ships, as explained in our{" "}
          <Link href="/refund-policy">Cancellation &amp; Refund Policy</Link>.
        </p>
      </>
    ),
  },
  {
    title: "4. Delivery Coverage & Time",
    body: (
      <p>
        We currently deliver to addresses within India only. Delivery time depends on
        your location and the courier service, and remote areas can take longer. Sellers
        ship using courier services such as {carrierNames.join(", ")}.
      </p>
    ),
  },
  {
    title: "5. Tracking Your Order",
    body: (
      <p>
        When a seller marks your order as shipped, they add the courier name and
        tracking number. You can see your order status on the{" "}
        <Link href="/orders">Orders</Link> page.
      </p>
    ),
  },
  {
    title: "6. Damaged, Missing or Delayed Deliveries",
    body: (
      <p>
        If your package arrives damaged, has the wrong item, or has not arrived when
        expected, contact us at{" "}
        <a href={`mailto:${COMPANY.supportEmail}`}>{COMPANY.supportEmail}</a> or{" "}
        <a href={`tel:${COMPANY.supportPhoneHref}`}>{COMPANY.supportPhone}</a>. Damaged,
        defective or wrong items must be reported within {POLICY.returnWindowDays} days
        of delivery. If your concern is not resolved, you can contact our{" "}
        <Link href="/grievance">Grievance Officer</Link>.
      </p>
    ),
  },
];

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      icon={Truck}
      eyebrow="Orders & Delivery"
      title="Shipping Policy"
      subtitle={
        <>
          Last updated: October 2026 &bull; Applies to all orders placed on{" "}
          {COMPANY.domain}
        </>
      }
      sections={SECTIONS}
      cta={{
        text: "Questions about a delivery?",
        linkLabel: "Contact Support",
        href: "/contact",
      }}
    />
  );
}
