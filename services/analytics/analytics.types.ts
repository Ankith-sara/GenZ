export type AnalyticsEventName =
  | "order_placed"
  | "product_viewed"
  | "seller_application_submitted"
  | "seller_verified"
  | "cart_updated";

export interface AnalyticsEvent {
  event: AnalyticsEventName;
  properties?: Record<string, string | number | boolean | null>;
  userId?: string;
  timestamp: string;
}
