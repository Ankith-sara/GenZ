export type SupportedCarrier =
  | "india_post"
  | "bluedart"
  | "delhivery"
  | "dtdc"
  | "ekart"
  | "shadowfax"
  | "other";

export interface CarrierInfo {
  id: SupportedCarrier;
  displayName: string;
  trackingUrlTemplate?: string;
}

export interface DispatchShippingInput {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  notes?: string;
}

export interface ShippingValidationResult {
  valid: boolean;
  carrierDisplayName: string;
  trackingUrl?: string;
  error?: string;
}

// Backward-compatibility aliases
export type DispatchFulfillmentInput = DispatchShippingInput;
export type FulfillmentValidationResult = ShippingValidationResult;
