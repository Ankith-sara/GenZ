import { CheckoutService as DomainCheckoutService } from "@genz/services/checkout";
import { PaymentsService } from "@genz/services/payments";
import { getSupabaseAdminClient } from "../../integrations/supabase";
import { CartService } from "../cart/cart.service";
import type { CreateCheckoutOrderInput } from "./checkout.schemas";
import {
  ValidationError,
  ConflictError,
  NotFoundError,
  PricingMismatchError,
} from "../../common/errors";

export class CheckoutModuleService {
  static async processOrder(
    input: CreateCheckoutOrderInput,
    authenticatedUser?: { id: string; email?: string }
  ) {
    const customerEmail = authenticatedUser?.email || input.guestEmail;
    if (!customerEmail) {
      throw new ValidationError(
        authenticatedUser
          ? "Your account has no email address. Please update your profile before ordering."
          : "Please provide an email address so we can send order updates."
      );
    }

    // 1. Authoritative price recalculation against database
    const cart = await CartService.validateAndCalculate({ items: input.items });
    if (!cart.valid) {
      throw new ValidationError(
        "One or more items in your cart are invalid or out of stock."
      );
    }

    // 2. Validate client-expected total if provided
    const clientExpected = input.expectedTotalInr ?? input.clientCalculatedTotal;
    if (
      clientExpected !== undefined &&
      Math.abs(clientExpected - cart.pricing.total) > 0.01
    ) {
      throw new PricingMismatchError(
        `Pricing mismatch: Client expected ₹${clientExpected.toFixed(2)}, but authoritative total is ₹${cart.pricing.total.toFixed(2)}.`
      );
    }

    let paymentStatus: "pending" | "paid" = "pending";
    let paymentGatewayId: string | null = null;
    let paymentNotes = input.notes || "";
    const admin = getSupabaseAdminClient();

    // 3. Gateway signature & payment row verification
    if (input.payment.method === "razorpay") {
      const verification = PaymentsService.verifyRazorpaySignature({
        orderId: input.payment.razorpayOrderId,
        paymentId: input.payment.razorpayPaymentId,
        signature: input.payment.razorpaySignature,
      });

      if (!verification.verified) {
        throw new ValidationError(
          "We could not verify your payment signature. If money was debited, contact support with your payment ID."
        );
      }

      // Check payments table for authoritative gateway order record
      const { data: paymentRow, error: paymentError } = await admin
        .from("payments")
        .select("*")
        .eq("gateway_order_id", input.payment.razorpayOrderId)
        .maybeSingle();

      if (paymentError) {
        throw new Error(`Failed to query payment record: ${paymentError.message}`);
      }

      if (!paymentRow) {
        throw new NotFoundError(
          `Payment order "${input.payment.razorpayOrderId}" was not found.`
        );
      }

      if (paymentRow.order_ref) {
        throw new ConflictError(
          "This payment has already been associated with an existing order."
        );
      }

      const expectedPaise = Math.round(cart.pricing.total * 100);
      if (Number(paymentRow.amount_paise) !== expectedPaise) {
        throw new PricingMismatchError(
          `Payment amount mismatch: gateway order was for ₹${(Number(paymentRow.amount_paise) / 100).toFixed(2)}, but authoritative cart total is ₹${cart.pricing.total.toFixed(2)}.`
        );
      }

      // Verify no duplicate order exists with this payment ID
      const { data: existingOrder } = await admin
        .from("orders")
        .select("id")
        .eq("payment_gateway_id", input.payment.razorpayPaymentId)
        .maybeSingle();

      if (existingOrder) {
        throw new ConflictError(
          "Duplicate payment detected. This payment ID has already been applied."
        );
      }

      paymentStatus = "paid";
      paymentGatewayId = input.payment.razorpayPaymentId;
      paymentNotes = `Razorpay Payment ID: ${input.payment.razorpayPaymentId} | Gateway Order: ${input.payment.razorpayOrderId}${
        paymentNotes ? ` | ${paymentNotes}` : ""
      }`;
    } else if (input.payment.method === "upi_qr") {
      paymentNotes = `PhonePe UPI QR | UTR: ${input.payment.utr}${
        input.payment.payerAccount ? ` | Payer: ${input.payment.payerAccount}` : ""
      }${paymentNotes ? ` | ${paymentNotes}` : ""}`;
    } else {
      paymentNotes = `Cash on Delivery${paymentNotes ? ` | ${paymentNotes}` : ""}`;
    }

    // 4. Map verified items to domain order line items
    const domainItems = cart.items.map((i) => ({
      id: i.productId,
      productId: i.productId,
      variantId: i.variantId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: i.coverImage,
      sellerId: i.sellerId,
    }));

    // 5. Create order and trigger multi-seller notifications
    const result = await DomainCheckoutService.processCheckout({
      customerId: authenticatedUser?.id ?? null,
      customerName: input.shippingAddress.recipientName,
      customerEmail,
      customerPhone: input.shippingAddress.phone,
      shippingAddress: input.shippingAddress,
      paymentMethod: input.payment.method,
      paymentStatus,
      paymentGatewayId,
      items: domainItems as Parameters<
        typeof DomainCheckoutService.processCheckout
      >[0]["items"],
      notes: paymentNotes,
    });

    if (!result.success || !result.order) {
      throw new Error(result.error || "Failed to process checkout order");
    }

    // 6. Update payments table with order reference and captured status
    if (input.payment.method === "razorpay") {
      await admin
        .from("payments")
        .update({
          order_ref: result.order.id,
          status: "captured",
          updated_at: new Date().toISOString(),
        })
        .eq("gateway_order_id", input.payment.razorpayOrderId);
    }

    return {
      order: result.order,
    };
  }
}
