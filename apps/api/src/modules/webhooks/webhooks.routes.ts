import type { FastifyPluginAsync } from "fastify";
import { PaymentsService } from "@genz/services/payments";
import { RefundsService } from "@genz/services/refunds";
import { sendError, sendSuccess } from "../../common/utils/response";

type RefundEvent = "refund.processed" | "refund.failed";
const HANDLED_EVENTS = new Set<string>(["refund.processed", "refund.failed"]);

interface RazorpayRefundWebhookPayload {
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
        request.log.error("[RazorpayWebhook] RAZORPAY_WEBHOOK_SECRET is not configured.");
        return sendError(reply, 503, "WEBHOOK_MISCONFIGURED", "Webhook not configured");
      }

      if (!verification.verified) {
        request.log.warn("[RazorpayWebhook] Signature verification failed.");
        return sendError(reply, 401, "INVALID_SIGNATURE", "Invalid webhook signature");
      }

      let payload: RazorpayRefundWebhookPayload;
      try {
        payload = (typeof request.body === "object" ? request.body : JSON.parse(rawBody)) as RazorpayRefundWebhookPayload;
      } catch {
        return sendError(reply, 400, "INVALID_JSON", "Invalid JSON payload");
      }

      const event = payload.event || "";
      if (!HANDLED_EVENTS.has(event)) {
        return sendSuccess(reply, { ok: true, ignored: event || "unknown" });
      }

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
        return sendError(reply, 500, "PROCESSING_FAILED", "Failed to process webhook event");
      }
    }
  );
};

