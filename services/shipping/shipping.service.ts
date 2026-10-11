import type {
  CarrierInfo,
  ShippingValidationResult,
  SupportedCarrier,
} from "./shipping.types";

export const CARRIERS: Record<string, CarrierInfo> = {
  india_post: {
    id: "india_post",
    displayName: "India Post (Speed Post)",
    trackingUrlTemplate: "https://www.indiapost.gov.in/_layouts/15/dpt.cpt.tracking/tracking.aspx?trackingid={tracking}",
  },
  bluedart: {
    id: "bluedart",
    displayName: "Blue Dart Express",
    trackingUrlTemplate: "https://www.bluedart.com/tracking?numbers={tracking}",
  },
  delhivery: {
    id: "delhivery",
    displayName: "Delhivery Logistics",
    trackingUrlTemplate: "https://www.delhivery.com/track/package/{tracking}",
  },
  dtdc: {
    id: "dtdc",
    displayName: "DTDC Courier",
    trackingUrlTemplate: "https://www.dtdc.in/tracking/tracking_results.asp?trkType=awb&strCnno={tracking}",
  },
  ekart: {
    id: "ekart",
    displayName: "Ekart Logistics",
    trackingUrlTemplate: "https://ekartlogistics.com/shipmenttrack/{tracking}",
  },
  shadowfax: {
    id: "shadowfax",
    displayName: "Shadowfax Express",
    trackingUrlTemplate: "https://tracker.shadowfax.in/#/track/{tracking}",
  },
};

export class ShippingService {
  /**
   * Returns list of supported carrier partners
   */
  static getSupportedCarriers(): CarrierInfo[] {
    return Object.values(CARRIERS);
  }

  /**
   * Validates dispatch information when shipping an order
   */
  static validateDispatch(
    carrierInput: string,
    trackingNumber: string
  ): ShippingValidationResult {
    const cleanCarrier = carrierInput.trim();
    const cleanTracking = trackingNumber.trim();

    if (!cleanCarrier) {
      return {
        valid: false,
        carrierDisplayName: "",
        error: "Carrier partner is required.",
      };
    }

    if (!cleanTracking) {
      return {
        valid: false,
        carrierDisplayName: cleanCarrier,
        error: "Tracking / AWB number is required.",
      };
    }

    // Match known carrier key or normalize
    const key = cleanCarrier.toLowerCase().replace(/[^a-z]/g, "");
    const matched = Object.entries(CARRIERS).find(([k]) => key.includes(k));

    let trackingUrl: string | undefined;
    let displayName = cleanCarrier;

    if (matched) {
      const [, carrier] = matched;
      displayName = carrier.displayName;
      if (carrier.trackingUrlTemplate) {
        trackingUrl = carrier.trackingUrlTemplate.replace("{tracking}", encodeURIComponent(cleanTracking));
      }
    }

    return {
      valid: true,
      carrierDisplayName: displayName,
      trackingUrl,
    };
  }
}

// Backward-compatibility alias
export { ShippingService as FulfillmentService };
