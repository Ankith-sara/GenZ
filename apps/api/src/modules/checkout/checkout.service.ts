import { CheckoutService as DomainCheckoutService } from "@genz/services/checkout";
import { PaymentsService } from "@genz/services/payments";
import { CartService } from "../cart/cart.service";
import type { CreateCheckoutOrderInput } from "./checkout.schemas";
import { ValidationError } from "../../common/errors";

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

    let paymentStatus: "pending" | "paid" = "pending";
    let paymentGatewayId: string | null = null;
    let paymentNotes = input.notes || "";

    // 2. Gateway signature verification
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

    // 3. Map verified items to domain order line items
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

    // 4. Create order and trigger multi-seller notifications
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

    return {
      order: result.order,
    };
  }
}
