export interface LineItemPriceInput {
  unitPrice: number;
  quantity: number;
  taxRatePercent?: number;
}

export interface PricingBreakdown {
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
}

export interface CommissionCalculation {
  grossAmount: number;
  platformFeeRatePercent: number;
  platformFeeAmount: number;
  sellerPayoutAmount: number;
}
