import { escapeHtml, safeUrl } from "./html";
import { sendResendEmail, type SendEmailResult } from "./resend";

/**
 * Customer transactional emails for orders and refunds (brand: GenZ Online).
 *
 * Builders are pure (subject + HTML + text) so they can be tested; every
 * customer-, seller- or admin-provided string is escaped before it reaches HTML.
 * `sendCustomerEmail` never throws: failures are logged and returned.
 */

const BRAND = "GenZ Online";

export interface CustomerEmailItem {
  name: string;
  quantity: number;
  price: number;
  variant?: string | null;
  sellerName?: string | null;
}

export interface CustomerEmailOrder {
  id: string;
  customerName: string;
  items: CustomerEmailItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  shippingAddress: {
    recipientName?: string;
    phone?: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  carrier?: string | null;
  trackingNumber?: string | null;
}

export interface CustomerEmailRefund {
  id: string;
  amount: number;
  method: "razorpay" | "manual";
  reason?: string | null;
  adminNote?: string | null;
  manualReference?: string | null;
}

export interface BuiltEmail {
  subject: string;
  html: string;
  text: string;
}

export interface EmailLinks {
  /** Customer-facing site, used for "View your order" links. */
  siteUrl?: string;
  /** Carrier tracking page for shipped orders. */
  trackingUrl?: string | null;
}

export function formatInr(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function paymentMethodLabel(method: string): string {
  switch ((method || "").toLowerCase()) {
    case "razorpay":
    case "online":
      return "Online payment (Razorpay)";
    case "upi_qr":
      return "UPI (QR code)";
    case "cod":
      return "Cash on delivery";
    default:
      return method || "Not specified";
  }
}

function defaultSiteUrl(): string {
  // NEXT_PUBLIC_SITE_URL differs per app (seller/admin), so customer links use
  // the dedicated storefront URL only.
  return (process.env.NEXT_PUBLIC_WEB_URL || "https://genzonline.in").replace(/\/+$/, "");
}

function ordersUrl(links?: EmailLinks): string {
  return `${(links?.siteUrl || defaultSiteUrl()).replace(/\/+$/, "")}/orders`;
}

// ---------- Layout helpers ----------

function layout(title: string, intro: string, body: string, cta?: { href: string; label: string }) {
  const button = cta
    ? `<p style="margin:24px 0 0 0;"><a href="${safeUrl(cta.href)}" style="display:inline-block;background:#1A1A18;color:#FFFFFF;padding:12px 22px;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px;">${escapeHtml(cta.label)}</a></p>`
    : "";
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FAF8F4;">
    <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;color:#1A1A18;">
      <p style="font-size:11px;font-weight:700;letter-spacing:0.15em;color:#C89D32;text-transform:uppercase;margin:0 0 16px 0;">${BRAND}</p>
      <h1 style="font-size:22px;line-height:1.3;margin:0 0 8px 0;">${escapeHtml(title)}</h1>
      <p style="font-size:14px;line-height:1.6;color:#52524E;margin:0 0 20px 0;">${intro}</p>
      ${body}
      ${button}
      <p style="font-size:12px;line-height:1.6;color:#8C8C85;margin:28px 0 0 0;border-top:1px solid #E5E5E0;padding-top:16px;">
        You are receiving this email because you placed an order on ${BRAND}. Reply to this email if you need help with your order.
      </p>
    </div>
  </body>
</html>`;
}

function card(inner: string): string {
  return `<div style="background:#FFFFFF;border:1px solid #E5E5E0;border-radius:12px;padding:16px 18px;margin:0 0 16px 0;">${inner}</div>`;
}

function label(text: string): string {
  return `<p style="font-size:11px;color:#73736E;text-transform:uppercase;font-weight:600;letter-spacing:0.08em;margin:0 0 6px 0;">${escapeHtml(text)}</p>`;
}

function itemsTable(order: CustomerEmailOrder): string {
  const rows = order.items
    .map((item) => {
      const meta = [item.variant, item.sellerName ? `by ${item.sellerName}` : null]
        .filter(Boolean)
        .map((m) => escapeHtml(m))
        .join(" · ");
      return `<tr>
        <td style="padding:8px 0;font-size:14px;border-bottom:1px solid #F0F0EC;">${escapeHtml(item.name)}${meta ? `<br><span style="font-size:12px;color:#73736E;">${meta}</span>` : ""}</td>
        <td style="padding:8px 0;font-size:14px;color:#52524E;text-align:center;border-bottom:1px solid #F0F0EC;">x${escapeHtml(item.quantity)}</td>
        <td style="padding:8px 0;font-size:14px;text-align:right;border-bottom:1px solid #F0F0EC;">${escapeHtml(formatInr(item.price * item.quantity))}</td>
      </tr>`;
    })
    .join("");

  const totalRow = (name: string, value: number, strong = false) =>
    `<tr><td colspan="2" style="padding:4px 0;font-size:${strong ? 15 : 13}px;${strong ? "font-weight:700;" : "color:#52524E;"}">${escapeHtml(name)}</td><td style="padding:4px 0;text-align:right;font-size:${strong ? 15 : 13}px;${strong ? "font-weight:700;" : ""}">${escapeHtml(formatInr(value))}</td></tr>`;

  return `<table role="presentation" style="width:100%;border-collapse:collapse;">
    <tbody>${rows}</tbody>
    <tfoot>
      ${totalRow("Subtotal", order.subtotal)}
      ${order.tax ? totalRow("Tax", order.tax) : ""}
      ${totalRow("Shipping", order.shippingFee)}
      ${totalRow("Total", order.totalAmount, true)}
    </tfoot>
  </table>`;
}

function addressBlock(order: CustomerEmailOrder): string {
  const a = order.shippingAddress;
  return `${label("Delivery address")}
    <p style="font-size:14px;line-height:1.6;margin:0;">
      ${a.recipientName ? `<strong>${escapeHtml(a.recipientName)}</strong><br>` : ""}
      ${escapeHtml(a.addressLine)}<br>
      ${escapeHtml(a.city)}, ${escapeHtml(a.state)} - ${escapeHtml(a.pincode)}
      ${a.phone ? `<br>Phone: ${escapeHtml(a.phone)}` : ""}
    </p>`;
}

function textItems(order: CustomerEmailOrder): string {
  const lines = order.items.map(
    (i) =>
      `- ${i.name}${i.variant ? ` (${i.variant})` : ""} x${i.quantity}: ${formatInr(i.price * i.quantity)}`
  );
  lines.push(`Subtotal: ${formatInr(order.subtotal)}`);
  if (order.tax) lines.push(`Tax: ${formatInr(order.tax)}`);
  lines.push(`Shipping: ${formatInr(order.shippingFee)}`);
  lines.push(`Total: ${formatInr(order.totalAmount)}`);
  return lines.join("\n");
}

function textAddress(order: CustomerEmailOrder): string {
  const a = order.shippingAddress;
  return [
    a.recipientName,
    a.addressLine,
    `${a.city}, ${a.state} - ${a.pincode}`,
    a.phone ? `Phone: ${a.phone}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function textFooter(links?: EmailLinks): string {
  return `\nView your orders: ${ordersUrl(links)}\n\n${BRAND}`;
}

// ---------- Builders ----------

export function buildOrderConfirmationEmail(
  order: CustomerEmailOrder,
  links?: EmailLinks
): BuiltEmail {
  const name = order.customerName || "there";
  const intro = `Hi ${escapeHtml(name)}, thank you for your order. We have shared it with the makers and will email you when it ships.`;
  const body =
    card(
      `${label("Order ID")}<p style="font-size:16px;font-weight:700;margin:0 0 4px 0;">${escapeHtml(order.id)}</p>
       <p style="font-size:13px;color:#52524E;margin:0;">Payment: ${escapeHtml(paymentMethodLabel(order.paymentMethod))}</p>`
    ) +
    card(`${label("Items")}${itemsTable(order)}`) +
    card(addressBlock(order));

  return {
    subject: `Order confirmed: ${order.id} | ${BRAND}`,
    html: layout("Your order is confirmed", intro, body, {
      href: ordersUrl(links),
      label: "View your order",
    }),
    text: [
      `Hi ${name}, thank you for your order on ${BRAND}.`,
      "",
      `Order ID: ${order.id}`,
      `Payment: ${paymentMethodLabel(order.paymentMethod)}`,
      "",
      "Items:",
      textItems(order),
      "",
      "Delivery address:",
      textAddress(order),
      textFooter(links),
    ].join("\n"),
  };
}

export type CustomerStatusEmailKind = "shipped" | "delivered" | "cancelled";

export function buildOrderStatusEmail(
  order: CustomerEmailOrder,
  status: CustomerStatusEmailKind,
  options?: EmailLinks & { note?: string | null; returnWindowDays?: number }
): BuiltEmail {
  const name = order.customerName || "there";
  let title: string;
  let introText: string;
  let detailsHtml = "";
  const detailsText: string[] = [];

  if (status === "shipped") {
    title = "Your order is on its way";
    introText = `Hi ${name}, your order ${order.id} has been handed to the courier.`;
    if (order.carrier || order.trackingNumber) {
      const trackLink =
        options?.trackingUrl && order.trackingNumber
          ? `<p style="margin:8px 0 0 0;"><a href="${safeUrl(options.trackingUrl)}" style="color:#C89D32;font-weight:600;">Track your package</a></p>`
          : "";
      detailsHtml = card(
        `${label("Shipment")}
         ${order.carrier ? `<p style="font-size:14px;margin:0;">Courier: <strong>${escapeHtml(order.carrier)}</strong></p>` : ""}
         ${order.trackingNumber ? `<p style="font-size:14px;margin:4px 0 0 0;">Tracking number: <strong>${escapeHtml(order.trackingNumber)}</strong></p>` : ""}
         ${trackLink}`
      );
      if (order.carrier) detailsText.push(`Courier: ${order.carrier}`);
      if (order.trackingNumber) detailsText.push(`Tracking number: ${order.trackingNumber}`);
      if (options?.trackingUrl && order.trackingNumber)
        detailsText.push(`Track: ${options.trackingUrl}`);
    }
  } else if (status === "delivered") {
    title = "Your order has been delivered";
    const windowDays = options?.returnWindowDays;
    introText = `Hi ${name}, your order ${order.id} has been delivered. We hope you love it.${
      windowDays ? ` If something is wrong, you can request a return from your orders page within ${windowDays} days.` : ""
    }`;
  } else {
    title = "Your order has been cancelled";
    introText = `Hi ${name}, your order ${order.id} has been cancelled.`;
    if (options?.note) {
      detailsHtml = card(
        `${label("Note")}<p style="font-size:14px;margin:0;">${escapeHtml(options.note)}</p>`
      );
      detailsText.push(`Note: ${options.note}`);
    }
    const prepaid = ["razorpay", "online", "upi_qr"].includes(
      (order.paymentMethod || "").toLowerCase()
    );
    if (prepaid) {
      const refundLine =
        "If you paid online, we will email you as soon as your refund is initiated.";
      detailsHtml += card(`<p style="font-size:14px;margin:0;">${escapeHtml(refundLine)}</p>`);
      detailsText.push(refundLine);
    }
  }

  const body = detailsHtml + card(`${label("Items")}${itemsTable(order)}`);
  return {
    subject: `${title}: ${order.id} | ${BRAND}`,
    html: layout(title, escapeHtml(introText), body, {
      href: ordersUrl(options),
      label: "View your order",
    }),
    text: [
      introText,
      "",
      ...detailsText,
      ...(detailsText.length ? [""] : []),
      "Items:",
      textItems(order),
      textFooter(options),
    ].join("\n"),
  };
}

export type CustomerRefundEmailKind = "initiated" | "processed" | "rejected";

export function buildRefundEmail(
  order: Pick<CustomerEmailOrder, "id" | "customerName" | "totalAmount" | "paymentMethod">,
  refund: CustomerEmailRefund,
  kind: CustomerRefundEmailKind,
  links?: EmailLinks
): BuiltEmail {
  const name = order.customerName || "there";
  const amount = formatInr(refund.amount);
  const destination =
    refund.method === "razorpay"
      ? "your original payment method"
      : "your bank account / UPI ID";

  let title: string;
  let introText: string;
  const rows: Array<[string, string]> = [
    ["Order ID", order.id],
    ["Refund ID", refund.id],
    ["Amount", amount],
  ];

  if (kind === "initiated") {
    title = "Your refund has been initiated";
    introText = `Hi ${name}, we have initiated a refund of ${amount} for order ${order.id} to ${destination}. Banks usually take 5-7 working days to credit it.`;
  } else if (kind === "processed") {
    title = "Your refund has been processed";
    introText = `Hi ${name}, your refund of ${amount} for order ${order.id} has been processed to ${destination}.`;
    if (refund.manualReference) rows.push(["Reference (UTR)", refund.manualReference]);
  } else {
    title = "Update on your refund request";
    introText = `Hi ${name}, we could not approve the refund request for order ${order.id}.`;
    if (refund.adminNote) rows.push(["Reason", refund.adminNote]);
  }
  if (refund.reason && kind !== "rejected") rows.push(["Your reason", refund.reason]);

  const rowsHtml = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 0;font-size:13px;color:#73736E;width:40%;">${escapeHtml(k)}</td><td style="padding:4px 0;font-size:14px;font-weight:600;">${escapeHtml(v)}</td></tr>`
    )
    .join("");

  return {
    subject: `${title}: ${order.id} | ${BRAND}`,
    html: layout(
      title,
      escapeHtml(introText),
      card(`<table role="presentation" style="width:100%;border-collapse:collapse;">${rowsHtml}</table>`),
      { href: ordersUrl(links), label: "View your order" }
    ),
    text: [introText, "", ...rows.map(([k, v]) => `${k}: ${v}`), textFooter(links)].join("\n"),
  };
}

// ---------- Sender ----------

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface CustomerEmailResult extends SendEmailResult {
  skipped?: boolean;
}

/**
 * Sends a built customer email. Never throws. Skips (and logs) when Resend is
 * not configured or the recipient address is missing/invalid.
 */
export async function sendCustomerEmail(
  to: string | null | undefined,
  email: BuiltEmail,
  context: string
): Promise<CustomerEmailResult> {
  try {
    const recipient = (to || "").trim();
    if (!recipient || !EMAIL_PATTERN.test(recipient)) {
      console.warn(`[CustomerEmail] ${context}: no valid recipient address, skipping.`);
      return { success: false, skipped: true, error: "No valid recipient email" };
    }
    if (!process.env.RESEND_API_KEY) {
      console.warn(`[CustomerEmail] ${context}: RESEND_API_KEY not set, skipping send.`);
      return { success: false, skipped: true, error: "RESEND_API_KEY is not configured" };
    }

    const result = await sendResendEmail({
      to: recipient,
      subject: email.subject,
      html: email.html,
      text: email.text,
      from: process.env.RESEND_ORDERS_FROM_EMAIL || undefined,
    });
    if (!result.success) {
      console.error(`[CustomerEmail] ${context}: send failed: ${result.error}`);
    }
    return result;
  } catch (err) {
    console.error(`[CustomerEmail] ${context}: unexpected error`, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Email dispatch failed",
    };
  }
}
