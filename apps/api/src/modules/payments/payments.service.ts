import { PaymentsService as DomainPaymentsService } from "@genz/services/payments";
import { CartService } from "../cart/cart.service";
import type {
  CreateRazorpayOrderInput,
  VerifyRazorpayPaymentInput,
} from "./payments.schemas";
import { ValidationError } from "../../common/errors";

export class PaymentsModuleService {
  static async createOrder(input: CreateRazorpayOrderInput) {
    // 1. Recalculate financial total using authoritative database prices
    const cart = await CartService.validateAndCalculate({ items: input.items });
    if (!cart.valid || cart.pricing.total <= 0) {
      throw new ValidationError(
        "Cannot create payment order for an invalid or zero-sum cart."
      );
    }

    const notes = Object.fromEntries(
      Object.entries(input.notes ?? {})
        .slice(0, 10)
        .map(([k, v]) => [String(k).slice(0, 40), String(v).slice(0, 200)])
    );

    const order = await DomainPaymentsService.createRazorpayOrder({
      amountInInr: cart.pricing.total,
      receipt: (input.receipt || `rcpt_${Date.now()}`).slice(0, 40),
      notes,
    });

    if (!order.success || !order.orderId) {
      throw new ValidationError(
        order.error || "Failed to create payment order with gateway."
      );
    }

    return {
      success: order.success,
      keyId: order.keyId,
      orderId: order.orderId,
      amount: order.amountInPaise,
      currency: order.currency,
      verifiedTotalInr: cart.pricing.total,
    };
  }

  static verifySignature(input: VerifyRazorpayPaymentInput) {
    const result = DomainPaymentsService.verifyRazorpaySignature({
      orderId: input.razorpayOrderId,
      paymentId: input.razorpayPaymentId,
      signature: input.razorpaySignature,
    });

    return {
      verified: result.verified,
      reason: result.reason,
    };
  }
}
