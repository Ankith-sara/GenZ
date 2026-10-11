import { CartService } from "../cart/cart.service";
import { PricingService } from "../pricing/pricing.service";
import { OrdersService } from "../orders/orders.service";
import {
  CustomerNotificationsService,
  NotificationsService,
} from "../notifications/notifications.service";
import type { CheckoutInput, CheckoutResult } from "./checkout.types";

export class CheckoutService {
  /**
   * Orchestrates complete checkout flow:
   * 1. Validates cart items and partitions by seller
   * 2. Calculates verified subtotal, tax, and shipping on the server
   * 3. Creates the order in database & persistent monorepo store
   * 4. Asynchronously notifies each seller with their partitioned items
   */
  static async processCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    try {
      if (!input.customerEmail || !input.customerName) {
        return { success: false, error: "Customer name and email are required" };
      }

      const hasAddress =
        input.shippingAddress &&
        (input.shippingAddress.addressLine ||
          (input.shippingAddress as { addressLine1?: string }).addressLine1);

      if (!hasAddress) {
        return { success: false, error: "Valid shipping address is required" };
      }

      // 1. Validate & summarize cart
      const cartSummary = CartService.summarizeCart(input.items);

      // 2. Server-side price calculation (never trust client totals)
      const pricing = PricingService.calculateOrderTotals(
        cartSummary.items.map((item) => ({
          unitPrice: item.price,
          quantity: item.quantity,
        }))
      );

      // 3. Create order record
      const order = await OrdersService.createOrder({
        customerId: input.customerId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        shippingAddress: input.shippingAddress,
        paymentMethod: input.paymentMethod || "upi_qr",
        paymentStatus: input.paymentStatus || "pending",
        paymentGatewayId: input.paymentGatewayId || null,
        items: cartSummary.items,
        subtotal: pricing.subtotal,
        tax: pricing.tax,
        shippingFee: pricing.shippingFee,
        totalAmount: pricing.total,
        notes: input.notes,
      });

      // 4. Asynchronously dispatch seller notification emails
      for (const [sellerId, group] of Object.entries(cartSummary.sellerGroups)) {
        NotificationsService.sendSellerOrderNotification({
          sellerId,
          sellerName: group.sellerBusinessName,
          orderId: order.id,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          shippingAddress: input.shippingAddress,
          items: group.items.map((item) => ({
            name: item.name || item.product_name || "Handcrafted Product",
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: group.subtotal,
          paymentMethod: input.notes
            ? `UPI QR Payment (UTR: ${input.notes})`
            : "UPI QR Payment",
        }).catch((err) => {
          console.warn(
            `[CheckoutService] Seller notification dispatch warning for ${sellerId}:`,
            err
          );
        });
      }

      // 5. Customer order confirmation (never throws; failures are logged)
      await CustomerNotificationsService.sendOrderConfirmation(order);

      return { success: true, order };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Checkout processing failed";
      return { success: false, error: msg };
    }
  }
}
