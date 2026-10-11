import type { OrderRecord, OrderItem, PaymentStatus, ShippingAddress } from "@genz/types";

export interface CheckoutInput {
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  paymentMethod: "cod" | "online" | "razorpay" | "upi_qr" | string;
  paymentStatus?: PaymentStatus;
  /** Verified gateway payment id (set server-side only after signature verification). */
  paymentGatewayId?: string | null;
  items: OrderItem[];
  notes?: string;
}

export interface CheckoutResult {
  success: boolean;
  order?: OrderRecord;
  error?: string;
}
