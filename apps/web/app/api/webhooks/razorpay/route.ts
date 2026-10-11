import { NextResponse } from "next/server";
import { PaymentsService } from "@genz/services/payments";
import { RefundsService } from "@genz/services/refunds";

/**
 * Razorpay webhook receiver (configure in Razorpay Dashboard -> Webhooks with
 * the events refund.processed and refund.failed, and the same secret as
 * RAZORPAY_WEBHOOK_SECRET).
 *
 * The signature is verified over the raw body before anything is parsed.
 * Server-to-server: no session or rate limiting; the HMAC is the authentication.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RefundEvent = "refund.processed" | "refund.failed";
const HANDLED_EVENTS = new Set<string>(["refund.processed", "refund.failed"]);

interface RazorpayRefundWebhook {
  event?: string;
  payload?: {
    refund?: {
      entity?: {
        id?: string;
        payment_id?: string;
        amount?: number;
        status?: string;
        notes?: Record<string, string> | unknown[];
      };
    };
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const verification = PaymentsService.verifyRazorpayWebhookSignature(
    rawBody,
    request.headers.get("x-razorpay-signature")
  );

  if (verification.misconfigured) {
    console.error("[RazorpayWebhook] RAZORPAY_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  if (!verification.verified) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: RazorpayRefundWebhook;
  try {
    payload = JSON.parse(rawBody) as RazorpayRefundWebhook;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event || "";
  if (!HANDLED_EVENTS.has(event)) {
    return NextResponse.json({ ok: true, ignored: event || "unknown" });
  }

  const entity = payload.payload?.refund?.entity;
  if (!entity?.id) {
    return NextResponse.json({ error: "Missing refund entity" }, { status: 400 });
  }
  const notes =
    entity.notes && !Array.isArray(entity.notes) ? (entity.notes as Record<string, string>) : {};

  try {
    const result = await RefundsService.applyGatewayRefundEvent({
      event: event as RefundEvent,
      gatewayRefundId: entity.id,
      paymentId: entity.payment_id ?? null,
      amountInPaise: typeof entity.amount === "number" ? entity.amount : null,
      notesRefundId: typeof notes.refund_id === "string" ? notes.refund_id : null,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    // 5xx makes Razorpay retry; the handler is idempotent.
    console.error("[RazorpayWebhook] Failed to apply refund event:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
