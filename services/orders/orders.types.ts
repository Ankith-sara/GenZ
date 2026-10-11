import type {
  OrderRecord,
  OrderStatus,
  PaymentStatus,
  OrderItem,
  ShippingAddress,
  OrderTrackingEvent,
} from "@genz/types";

export type {
  OrderRecord,
  OrderStatus,
  OrderItem,
  ShippingAddress,
  OrderTrackingEvent,
};

export interface CreateOrderDomainInput {
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  paymentMethod: "cod" | "online" | "razorpay" | "upi_qr" | string;
  paymentStatus?: PaymentStatus;
  paymentGatewayId?: string | null;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  notes?: string;
}

export interface TransitionOrderStatusInput {
  orderId: string;
  newStatus: OrderStatus;
  actorUserId: string;
  actorRole: "buyer" | "seller" | "admin";
  carrier?: string;
  trackingNumber?: string;
  note?: string;
}

export interface TransitionOrderStatusResult {
  success: boolean;
  order?: OrderRecord | null;
  error?: string;
}
