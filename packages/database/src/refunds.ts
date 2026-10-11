import "server-only";
import type {
  RefundDbRow,
  RefundMethod,
  RefundRecord,
  RefundStatus,
  RefundType,
} from "@genz/types";
import { createAdminClient } from "./admin";

/**
 * Refunds repository (migration 0026).
 *
 * Unlike orders, refunds have no local JSON fallback: money movement must only
 * ever be recorded in the database, so every function surfaces database errors.
 * Callers authorise the actor before calling in (service-role client).
 */

export class RefundStoreError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = "RefundStoreError";
  }
}

export function mapRefundRow(row: RefundDbRow): RefundRecord {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    amount: Number(row.amount),
    currency: row.currency || "INR",
    reason: row.reason ?? null,
    type: row.type,
    status: row.status,
    method: row.method,
    gatewayPaymentId: row.gateway_payment_id ?? null,
    gatewayRefundId: row.gateway_refund_id ?? null,
    manualReference: row.manual_reference ?? null,
    failureReason: row.failure_reason ?? null,
    requestedBy: row.requested_by ?? null,
    reviewedBy: row.reviewed_by ?? null,
    adminNote: row.admin_note ?? null,
    processedAt: row.processed_at ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function toStoreError(err: { message: string; code?: string }): RefundStoreError {
  if (err.code === "23505") {
    return new RefundStoreError(
      "A refund for this order is already open. Please wait for it to be reviewed.",
      err.code
    );
  }
  if (err.code === "23514" || /exceeds the refundable balance/i.test(err.message)) {
    return new RefundStoreError(
      "This refund is larger than the amount still refundable on the order.",
      err.code
    );
  }
  if (err.code === "42P01" || /relation .*refunds.* does not exist/i.test(err.message)) {
    return new RefundStoreError(
      "Refunds are not set up in the database yet (apply migration 0026).",
      err.code
    );
  }
  return new RefundStoreError(err.message, err.code);
}

function client() {
  try {
    return createAdminClient();
  } catch {
    throw new RefundStoreError("Refunds are unavailable: database is not configured.");
  }
}

export interface InsertRefundInput {
  orderId: string;
  amount: number;
  type: RefundType;
  method: RefundMethod;
  status?: RefundStatus;
  reason?: string | null;
  gatewayPaymentId?: string | null;
  requestedBy?: string | null;
  reviewedBy?: string | null;
  adminNote?: string | null;
}

export async function insertRefund(input: InsertRefundInput): Promise<RefundRecord> {
  const { data, error } = await client()
    .from("refunds")
    .insert({
      order_id: input.orderId,
      amount: Math.round(input.amount * 100) / 100,
      currency: "INR",
      type: input.type,
      method: input.method,
      status: input.status ?? "requested",
      reason: input.reason ?? null,
      gateway_payment_id: input.gatewayPaymentId ?? null,
      requested_by: input.requestedBy ?? null,
      reviewed_by: input.reviewedBy ?? null,
      admin_note: input.adminNote ?? null,
    })
    .select("*")
    .single();

  if (error || !data) throw toStoreError(error ?? { message: "Refund insert failed" });
  return mapRefundRow(data as RefundDbRow);
}

export async function getRefundById(id: string): Promise<RefundRecord | null> {
  const { data, error } = await client()
    .from("refunds")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw toStoreError(error);
  return data ? mapRefundRow(data as RefundDbRow) : null;
}

export async function getRefundByGatewayRefundId(
  gatewayRefundId: string
): Promise<RefundRecord | null> {
  const { data, error } = await client()
    .from("refunds")
    .select("*")
    .eq("gateway_refund_id", gatewayRefundId)
    .maybeSingle();
  if (error) throw toStoreError(error);
  return data ? mapRefundRow(data as RefundDbRow) : null;
}

export async function listRefunds(filter?: {
  status?: RefundStatus[];
  orderIds?: string[];
  limit?: number;
}): Promise<RefundRecord[]> {
  if (filter?.orderIds && filter.orderIds.length === 0) return [];

  let query = client()
    .from("refunds")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(filter?.limit ?? 500);

  if (filter?.status?.length) query = query.in("status", filter.status);
  if (filter?.orderIds?.length) query = query.in("order_id", filter.orderIds);

  const { data, error } = await query;
  if (error) throw toStoreError(error);
  return ((data ?? []) as RefundDbRow[]).map(mapRefundRow);
}

export interface RefundPatch {
  status?: RefundStatus;
  amount?: number;
  method?: RefundMethod;
  gatewayPaymentId?: string | null;
  gatewayRefundId?: string | null;
  manualReference?: string | null;
  failureReason?: string | null;
  reviewedBy?: string | null;
  adminNote?: string | null;
  processedAt?: string | null;
}

/**
 * Compare-and-set update: only applies when the refund is still in one of
 * `fromStatuses`. Returns null when another request already moved it, which
 * is how concurrent approvals and duplicate webhooks are made idempotent.
 */
export async function transitionRefund(
  id: string,
  fromStatuses: RefundStatus[],
  patch: RefundPatch
): Promise<RefundRecord | null> {
  const update: Partial<RefundDbRow> = {};
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.amount !== undefined) update.amount = Math.round(patch.amount * 100) / 100;
  if (patch.method !== undefined) update.method = patch.method;
  if (patch.gatewayPaymentId !== undefined)
    update.gateway_payment_id = patch.gatewayPaymentId;
  if (patch.gatewayRefundId !== undefined) update.gateway_refund_id = patch.gatewayRefundId;
  if (patch.manualReference !== undefined) update.manual_reference = patch.manualReference;
  if (patch.failureReason !== undefined) update.failure_reason = patch.failureReason;
  if (patch.reviewedBy !== undefined) update.reviewed_by = patch.reviewedBy;
  if (patch.adminNote !== undefined) update.admin_note = patch.adminNote;
  if (patch.processedAt !== undefined) update.processed_at = patch.processedAt;

  const { data, error } = await client()
    .from("refunds")
    .update(update)
    .eq("id", id)
    .in("status", fromStatuses)
    .select("*")
    .maybeSingle();

  if (error) throw toStoreError(error);
  return data ? mapRefundRow(data as RefundDbRow) : null;
}
