export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export interface AccountingAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type JournalEventType =
  | "order_paid"
  | "order_delivered"
  | "settlement_approved"
  | "settlement_paid"
  | "refund_processed"
  | "gateway_clearing"
  | "manual_adjustment";

export interface JournalLineItem {
  id?: string;
  accountId?: string;
  accountCode: string;
  accountName?: string;
  debit: number;
  credit: number;
  narration?: string;
}

export interface AccountingJournal {
  id: string; // JRN-######
  referenceId?: string; // ORD-######, PAY-######, SET-######, etc.
  eventType: JournalEventType;
  narration: string;
  status: "draft" | "posted" | "reversed";
  totalAmount: number;
  lines: JournalLineItem[];
  postedBy?: string;
  createdAt: string;
}

export type CommissionStatus = "accrued" | "invoiced" | "settled" | "reversed";

export interface CommissionRecord {
  id: string; // COM-######
  orderId: string;
  orderItemId: string;
  sellerId: string;
  sellerName?: string;
  productName?: string;
  grossValue: number;
  commissionRate: number; // e.g., 10 (10%)
  commissionAmount: number;
  gstRate: number; // e.g., 18 (18%)
  gstAmount: number;
  totalCommission: number;
  status: CommissionStatus;
  createdAt: string;
  settledAt?: string;
}

export type SettlementStatus =
  "draft" | "pending_approval" | "approved" | "disbursed" | "failed" | "cancelled";

export interface SettlementBatchItem {
  id: string;
  batchId: string;
  orderId: string;
  orderItemId: string;
  productName: string;
  grossAmount: number;
  commissionAmount: number;
  commissionGst: number;
  tcsAmount: number;
  tdsAmount: number;
  netPayout: number;
}

export interface SettlementBatch {
  id: string; // SET-######
  batchNumber: string;
  sellerId: string;
  sellerName: string;
  sellerBankName?: string;
  sellerAccountNumber?: string;
  sellerIfsc?: string;
  periodStart: string;
  periodEnd: string;
  itemCount: number;
  grossAmount: number;
  totalCommission: number;
  totalCommissionGst: number;
  totalTcs: number;
  totalTds: number;
  otherAdjustments: number;
  netPayable: number;
  status: SettlementStatus;
  makerAdminId?: string;
  checkerAdminId?: string;
  bankUtr?: string;
  disbursedAt?: string;
  notes?: string;
  items?: SettlementBatchItem[];
  createdAt: string;
  updatedAt: string;
}

export interface FinancialOverviewSummary {
  gmv: number;
  platformRevenue: number;
  outputGstPayable: number;
  sellerPayablesOutstanding: number;
  disbursedSettlements: number;
  gatewayClearingPending: number;
  tcsCollected: number;
  tdsDeducted: number;
}

export type ReconciliationDiscrepancyType =
  | "order_amount_mismatch"
  | "gateway_fee_mismatch"
  | "missing_bank_utr"
  | "double_settlement_detected"
  | "ledger_imbalance"
  | "tax_rate_divergence";

export interface ReconciliationException {
  id: string;
  entityType: "order" | "payment" | "settlement" | "journal" | "tax";
  entityId: string;
  discrepancyType: ReconciliationDiscrepancyType;
  expectedAmount: number;
  actualAmount: number;
  difference: number;
  status: "open" | "resolved" | "ignored";
  severity: "low" | "medium" | "high" | "critical";
  notes?: string;
  resolvedBy?: string;
  createdAt: string;
  resolvedAt?: string;
}
