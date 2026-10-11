import type {
  CommissionCalculation,
  LineItemPriceInput,
  PricingBreakdown,
} from "./pricing.types";

export class PricingService {
  public static readonly DEFAULT_SHIPPING_FEE = 70;
  public static readonly FREE_SHIPPING_THRESHOLD = 999;
  public static readonly DEFAULT_PLATFORM_FEE_PERCENT = 10;

  /**
   * Calculates subtotal, tax, shipping, and total for a cart or checkout order
   */
  static calculateOrderTotals(
    items: LineItemPriceInput[],
    options?: { freeShipping?: boolean }
  ): PricingBreakdown {
    let subtotal = 0;
    let tax = 0;

    for (const item of items) {
      if (item.unitPrice < 0 || item.quantity <= 0) {
        throw new Error("Invalid item price or quantity");
      }
      const itemSubtotal = item.unitPrice * item.quantity;
      subtotal += itemSubtotal;

      const taxRate = (item.taxRatePercent ?? 5) / 100;
      tax += Math.round(itemSubtotal * taxRate);
    }

    const shippingFee =
      options?.freeShipping || subtotal >= this.FREE_SHIPPING_THRESHOLD
        ? 0
        : subtotal > 0
          ? this.DEFAULT_SHIPPING_FEE
          : 0;

    const total = subtotal + tax + shippingFee;

    return {
      subtotal,
      tax,
      shippingFee,
      total,
    };
  }

  /**
   * Converts INR to paise for payment gateways (e.g. Razorpay)
   */
  static inrToPaise(amountInInr: number): number {
    if (amountInInr < 0) {
      throw new Error("Amount cannot be negative");
    }
    return Math.round(amountInInr * 100);
  }

  /**
   * Calculates platform commission and net seller payout
   */
  static calculateSellerCommission(
    grossAmount: number,
    platformFeePercent = PricingService.DEFAULT_PLATFORM_FEE_PERCENT
  ): CommissionCalculation {
    if (grossAmount < 0) {
      throw new Error("Gross amount cannot be negative");
    }
    const feeAmount = Math.round((grossAmount * platformFeePercent) / 100);
    const sellerPayout = grossAmount - feeAmount;

    return {
      grossAmount,
      platformFeeRatePercent: platformFeePercent,
      platformFeeAmount: feeAmount,
      sellerPayoutAmount: sellerPayout,
    };
  }
}
