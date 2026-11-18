import type { FastifyPluginAsync } from "fastify";
import { PaymentsService } from "@genz/services/payments";
import { RefundsService } from "@genz/services/refunds";
import { getSupabaseAdminClient } from "../../integrations/supabase";
import { sendError, sendSuccess } from "../../common/utils/response";

type RefundEvent = "refund.processed" | "refund.failed";
const REFUND_EVENTS = new Set<string>(["refund.processed", "refund.failed"]);
const PAYMENT_EVENTS = new Set<string>(["payment.captured", "order.paid"]);
const HANDLED_EVENTS = new Set<string>([...REFUND_EVENTS, ...PAYMENT_EVENTS]);

interface RazorpayWebhookPayload {
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
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        status?: string;
        notes?: Record<string, string> | unknown[];
      };
    };
    order?: {
      entity?: {
        id?: string;
        amount?: number;
        amount_paid?: number;
        status?: string;
        notes?: Record<string, string> | unknown[];
      };
    };
  };
}

export const webhooksRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /v1/webhooks/razorpay
  fastify.post(
    "/razorpay",
    {
      config: {
        rawBody: true,
      },
    },
    async (request, reply) => {
      const rawBody = (request.rawBody as string) || JSON.stringify(request.body);
      const signature = request.headers["x-razorpay-signature"] as string | undefined;

      const verification = PaymentsService.verifyRazorpayWebhookSignature(
        rawBody,
        signature
      );

      if (verification.misconfigured) {
        request.log.error(
          "[RazorpayWebhook] RAZORPAY_WEBHOOK_SECRET is not configured."
        );
        return sendError(reply, 503, "WEBHOOK_MISCONFIGURED", "Webhook not configured");
      }

      if (!verification.verified) {
        request.log.warn("[RazorpayWebhook] Signature verification failed.");
        return sendError(reply, 401, "INVALID_SIGNATURE", "Invalid webhook signature");
      }

      let payload: RazorpayWebhookPayload;
      try {
        payload = (
          typeof request.body === "object" ? request.body : JSON.parse(rawBody)
        ) as RazorpayWebhookPayload;
      } catch {
        return sendError(reply, 400, "INVALID_JSON", "Invalid JSON payload");
      }

      const event = payload.event || "";
      if (!HANDLED_EVENTS.has(event)) {
        return sendSuccess(reply, { ok: true, ignored: event || "unknown" });
      }

      // 1. Handle Payment Captured & Order Paid Events
      if (PAYMENT_EVENTS.has(event)) {
        const gatewayOrderId =
          payload.payload?.order?.entity?.id ||
          payload.payload?.payment?.entity?.order_id;
        const gatewayPaymentId = payload.payload?.payment?.entity?.id;

        if (!gatewayOrderId) {
          return sendError(
            reply,
            400,
            "MISSING_ORDER_ID",
            "Missing gateway order ID in payment webhook payload"
          );
        }

        try {
          const admin = getSupabaseAdminClient();
          const { data: paymentRow } = await admin
            .from("payments")
            .select("*")
            .eq("gateway_order_id", gatewayOrderId)
            .maybeSingle();

          if (paymentRow) {
            // If already claimed by an order, ensure that order is marked paid
            if (paymentRow.order_ref) {
              const { data: order } = await admin
                .from("orders")
                .select("id, payment_status")
                .eq("id", paymentRow.order_ref)
                .maybeSingle();

              if (order && order.payment_status !== "paid") {
                await admin
                  .from("orders")
                  .update({
                    payment_status: "paid",
                    payment_gateway_id: gatewayPaymentId || paymentRow.gateway_order_id,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", order.id);
              }
            }

            // Mark payment row captured
            if (paymentRow.status !== "captured") {
              await admin
                .from("payments")
                .update({
                  status: "captured",
                  updated_at: new Date().toISOString(),
                })
                .eq("gateway_order_id", gatewayOrderId);
            }

            return sendSuccess(reply, {
              ok: true,
              event,
              gatewayOrderId,
              status: "captured",
            });
          }

          // If no row exists yet, create one in captured state
          const amountPaise =
            payload.payload?.payment?.entity?.amount ||
            payload.payload?.order?.entity?.amount ||
            0;

          await admin.from("payments").insert({
            gateway_order_id: gatewayOrderId,
            amount_paise: amountPaise,
            status: "captured",
          });

          return sendSuccess(reply, {
            ok: true,
            event,
            gatewayOrderId,
            status: "captured",
          });
        } catch (err: unknown) {
          request.log.error(err, "[RazorpayWebhook] Failed to process payment event");
          return sendError(
            reply,
            500,
            "PROCESSING_FAILED",
            "Failed to process payment event"
          );
        }
      }

      // 2. Handle Refund Events
      const entity = payload.payload?.refund?.entity;
      if (!entity?.id) {
        return sendError(reply, 400, "MISSING_ENTITY", "Missing refund entity");
      }

      const notes =
        entity.notes && !Array.isArray(entity.notes)
          ? (entity.notes as Record<string, string>)
          : {};

      try {
        const result = await RefundsService.applyGatewayRefundEvent({
          event: event as RefundEvent,
          gatewayRefundId: entity.id,
          paymentId: entity.payment_id ?? null,
          amountInPaise: typeof entity.amount === "number" ? entity.amount : null,
          notesRefundId: typeof notes.refund_id === "string" ? notes.refund_id : null,
        });

        return sendSuccess(reply, { ok: true, ...result });
      } catch (err: unknown) {
        request.log.error(err, "[RazorpayWebhook] Failed to process refund event");
        // Return 500 to let Razorpay retry
        return sendError(
          reply,
          500,
          "PROCESSING_FAILED",
          "Failed to process webhook event"
        );
      }
    }
  );
};
