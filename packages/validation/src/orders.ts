import { z } from "zod";

// --- Checkout ---

const trimmed = (max: number) => z.string().trim().max(max);

export const checkoutAddressSchema = z.object({
  recipientName: trimmed(100).min(1, "Recipient name is required"),
  phone: trimmed(20).regex(/^\+?[0-9\s\-()]{7,20}$/, "Enter a valid phone number"),
  addressLine: trimmed(300).min(3, "Address is required"),
  city: trimmed(80).min(1, "City is required"),
  state: trimmed(80).min(1, "State is required"),
  pincode: trimmed(10).regex(/^[A-Za-z0-9\s-]{3,10}$/, "Enter a valid pincode"),
});

export const checkoutItemSchema = z.object({
  id: z.string().max(200).optional(),
  productId: z.string().max(200).optional(),
  product_id: z.string().max(200).optional(),
  name: z.string().max(300).optional(),
  category: z.string().max(100).optional(),
  price: z.number().finite().nonnegative(),
  quantity: z.number().int().positive().max(100),
  image: z.string().max(2000).optional(),
  sellerId: z.string().max(200).optional(),
  seller_id: z.string().max(200).optional(),
  sellerBusinessName: z.string().max(200).optional(),
  variantName: z.string().max(100).optional(),
  variantValue: z.string().max(100).optional(),
});

export const checkoutPaymentSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("razorpay"),
    razorpayOrderId: z.string().trim().min(1).max(100),
    razorpayPaymentId: z
      .string()
      .trim()
      .regex(/^pay_[A-Za-z0-9]+$/, "Invalid Razorpay payment id"),
    razorpaySignature: z.string().trim().min(1).max(256),
  }),
  z.object({
    method: z.literal("upi_qr"),
    utr: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9]{8,22}$/, "Enter a valid UPI reference / UTR number"),
    payerAccount: z.string().trim().max(100).optional(),
  }),
]);

export const placeOrderSchema = z.object({
  shippingAddress: checkoutAddressSchema,
  items: z.array(checkoutItemSchema).min(1, "Your basket is empty").max(50),
  /** Required for guest checkout only; signed-in users' email comes from the session. */
  guestEmail: z.string().trim().toLowerCase().email("Enter a valid email address").max(255).optional(),
  payment: checkoutPaymentSchema,
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export const razorpayOrderRequestSchema = z.object({
  items: z
    .array(
      z.object({
        price: z.number().finite().nonnegative(),
        quantity: z.number().int().positive().max(100),
      })
    )
    .min(1)
    .max(50),
});

// --- Refunds & cancellations ---

export const orderIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid order id");

export const refundIdSchema = z.string().trim().uuid("Invalid refund id");

export const refundReasonSchema = z.string().trim().max(1000);

export const cancelOrderSchema = z.object({
  orderId: orderIdSchema,
  reason: refundReasonSchema.optional(),
});

export const requestReturnSchema = z.object({
  orderId: orderIdSchema,
  reason: refundReasonSchema.min(5, "Tell us briefly why you want to return this order"),
});

/** Bank / UPI transfer reference (UTR) for manual refunds. */
export const manualRefundReferenceSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9\-/]{6,40}$/, "Enter a valid UTR / transfer reference");

const moneySchema = z
  .number()
  .finite()
  .positive("Amount must be greater than zero")
  .max(10_000_000)
  .refine((n) => Math.abs(Math.round(n * 100) - n * 100) < 1e-6, "At most 2 decimal places");

export const approveRefundSchema = z.object({
  refundId: refundIdSchema,
  amount: moneySchema.optional(),
  manualReference: manualRefundReferenceSchema.optional(),
  adminNote: z.string().trim().max(1000).optional(),
});

export const rejectRefundSchema = z.object({
  refundId: refundIdSchema,
  adminNote: z.string().trim().min(3, "Add a note for the customer").max(1000),
});

export const adminInitiateRefundSchema = z.object({
  orderId: orderIdSchema,
  amount: moneySchema,
  reason: z.string().trim().min(3, "Add a reason").max(1000),
  manualReference: manualRefundReferenceSchema.optional(),
  adminNote: z.string().trim().max(1000).optional(),
});
