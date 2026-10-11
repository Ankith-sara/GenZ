import type { ShippingAddress } from "@genz/types";

export interface OrderNotificationItem {
  name: string;
  quantity: number;
  price: number;
}

export interface SendSellerOrderNotificationInput {
  sellerId: string;
  sellerName: string;
  orderId: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  items: OrderNotificationItem[];
  totalAmount: number;
  paymentMethod: string;
}

export interface SendEmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}
