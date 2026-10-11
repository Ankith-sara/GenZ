"use client";

import { useActionState, useMemo, useState } from "react";
import { StatusBadge } from "@genz/ui";
import { AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";
import type {
  OrderStatus,
  PaymentStatus,
  RefundMethod,
  RefundRecord,
  RefundStatus,
} from "@genz/types";
import {
  approveRefundAction,
  initiateRefundAction,
  rejectRefundAction,
  type RefundAdminActionState,
} from "./actions";

export interface AdminRefundRow {
  refund: RefundRecord;
  order: {
    id: string;
    customerName: string;
    customerEmail: string;
    status: OrderStatus;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    paymentGatewayId: string | null;
    totalAmount: number;
    createdAt: string;
  } | null;
  /** How approval will move the money for this order right now. */
  method: RefundMethod;
}

export interface RefundableOrderOption {
  id: string;
  label: string;
  balance: number;
  method: RefundMethod;
  hasOpenRefund: boolean;
}

const OPEN: RefundStatus[] = ["requested", "approved", "processing", "failed"];

const STATUS_BADGE: Record<RefundStatus, { variant: string; label: string }> = {
  requested: { variant: "pending", label: "Requested" },
  approved: { variant: "processing", label: "Approved" },
  processing: { variant: "processing", label: "Processing" },
  processed: { variant: "verified", label: "Processed" },
  rejected: { variant: "rejected", label: "Rejected" },
  failed: { variant: "rejected", label: "Failed" },
};

const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const inputCls =
  "h-9 w-full rounded-lg border border-[#E5E5E0] bg-white px-3 text-xs text-[#1A1A18] focus:ring-2 focus:ring-[#C89D32]/40 focus:outline-none";

function Feedback({ state }: { state: RefundAdminActionState }) {
  if (state.error) {
    return (
      <p role="alert" className="flex items-start gap-1.5 text-xs text-rose-700">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {state.error}
      </p>
    );
  }
  if (state.success && state.message) {
    return (
      <p className="flex items-start gap-1.5 text-xs text-emerald-700">
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {state.message}
      </p>
    );
  }
  return null;
}

function ReviewForms({ row }: { row: AdminRefundRow }) {
  const [approveState, approveAction, approving] = useActionState(approveRefundAction, {});
  const [rejectState, rejectAction, rejecting] = useActionState(rejectRefundAction, {});
  const [mode, setMode] = useState<"none" | "approve" | "reject">("none");
  const { refund } = row;
  const isManual = row.method === "manual";

  if (refund.status === "processing") {
    return (
      <p className="text-xs text-[#73736E]">
        Sent to Razorpay{refund.gatewayRefundId ? ` (${refund.gatewayRefundId})` : ""}. Waiting
        for confirmation via webhook.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {mode === "none" && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("approve")}
            className="h-9 cursor-pointer rounded-lg bg-[#1A1A18] px-4 text-xs font-semibold text-white hover:bg-black"
          >
            {refund.status === "failed" ? "Retry refund" : "Approve"}
          </button>
          <button
            type="button"
            onClick={() => setMode("reject")}
            className="h-9 cursor-pointer rounded-lg border border-rose-200 bg-white px-4 text-xs font-semibold text-rose-700 hover:bg-rose-50"
          >
            Reject
          </button>
        </div>
      )}

      {mode === "approve" && (
        <form action={approveAction} className="space-y-2.5">
          <input type="hidden" name="refundId" value={refund.id} />
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <label className="space-y-1 text-[11px] font-semibold text-[#52524E]">
              <span>Amount (max {inr(refund.amount)})</span>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={refund.amount}
                defaultValue={refund.amount}
                className={inputCls}
              />
            </label>
            {isManual && (
              <label className="space-y-1 text-[11px] font-semibold text-[#52524E]">
                <span>Transfer reference (UTR) *</span>
                <input
                  name="manualReference"
                  required
                  minLength={6}
                  maxLength={40}
                  placeholder="e.g. 425689123456"
                  className={inputCls}
                />
              </label>
            )}
          </div>
          <label className="block space-y-1 text-[11px] font-semibold text-[#52524E]">
            <span>Internal note (optional)</span>
            <input name="adminNote" maxLength={1000} className={inputCls} />
          </label>
          <p className="text-[11px] text-[#73736E]">
            {isManual
              ? "Send the money by UPI / bank transfer first, then record the UTR here. The refund is marked processed immediately."
              : "This sends the refund through Razorpay to the customer's original payment method."}
          </p>
          <Feedback state={approveState} />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={approving}
              className="h-9 cursor-pointer rounded-lg bg-[#1A1A18] px-4 text-xs font-semibold text-white hover:bg-black disabled:opacity-60"
            >
              {approving ? "Processing..." : isManual ? "Mark refunded" : "Send Razorpay refund"}
            </button>
            <button
              type="button"
              onClick={() => setMode("none")}
              className="h-9 cursor-pointer rounded-lg border border-[#E5E5E0] px-4 text-xs font-semibold text-[#52524E]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {mode === "reject" && (
        <form action={rejectAction} className="space-y-2.5">
          <input type="hidden" name="refundId" value={refund.id} />
          <label className="block space-y-1 text-[11px] font-semibold text-[#52524E]">
            <span>Reason shown to the customer *</span>
            <textarea
              name="adminNote"
              required
              minLength={3}
              maxLength={1000}
              rows={2}
              className="w-full rounded-lg border border-[#E5E5E0] p-2 text-xs focus:ring-2 focus:ring-[#C89D32]/40 focus:outline-none"
            />
          </label>
          <Feedback state={rejectState} />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={rejecting}
              className="h-9 cursor-pointer rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {rejecting ? "Rejecting..." : "Reject request"}
            </button>
            <button
              type="button"
              onClick={() => setMode("none")}
              className="h-9 cursor-pointer rounded-lg border border-[#E5E5E0] px-4 text-xs font-semibold text-[#52524E]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {mode === "none" && <Feedback state={approveState.error ? approveState : rejectState} />}
    </div>
  );
}

function InitiateRefundForm({
  orders,
  preselectedOrderId,
}: {
  orders: RefundableOrderOption[];
  preselectedOrderId: string | null;
}) {
  const initial = orders.find((o) => o.id === preselectedOrderId) ?? null;
  const [open, setOpen] = useState(Boolean(initial));
  const [orderId, setOrderId] = useState(initial?.id ?? orders[0]?.id ?? "");
  const [state, formAction, pending] = useActionState(initiateRefundAction, {});
  const selected = orders.find((o) => o.id === orderId) ?? null;

  return (
    <section className="rounded-xl border border-[#E5E5E0] bg-white p-4 shadow-2xs sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A18]">Refund an order</h2>
          <p className="text-xs text-[#73736E]">
            Start a full or partial refund directly from a paid order.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-[#E5E5E0] px-4 text-xs font-semibold text-[#1A1A18] hover:bg-[#FAF8F4]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {open ? "Close" : "New refund"}
        </button>
      </div>

      {preselectedOrderId && !initial && (
        <p className="mt-3 text-xs text-[#73736E]">
          Order {preselectedOrderId} has no refundable balance or already has an open refund.
        </p>
      )}

      {open &&
        (orders.length === 0 ? (
          <p className="mt-4 text-xs text-[#73736E]">
            There are no paid orders with a refundable balance.
          </p>
        ) : (
          <form action={formAction} className="mt-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="space-y-1 text-[11px] font-semibold text-[#52524E]">
                <span>Order *</span>
                <select
                  name="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className={inputCls}
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-[11px] font-semibold text-[#52524E]">
                <span>Amount * {selected ? `(refundable ${inr(selected.balance)})` : ""}</span>
                <input
                  key={orderId}
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selected?.balance}
                  defaultValue={selected?.balance}
                  required
                  className={inputCls}
                />
              </label>
              <label className="space-y-1 text-[11px] font-semibold text-[#52524E] md:col-span-2">
                <span>Reason (shown to the customer) *</span>
                <input name="reason" required minLength={3} maxLength={1000} className={inputCls} />
              </label>
              {selected?.method === "manual" && (
                <label className="space-y-1 text-[11px] font-semibold text-[#52524E]">
                  <span>Transfer reference (UTR) *</span>
                  <input
                    name="manualReference"
                    required
                    minLength={6}
                    maxLength={40}
                    className={inputCls}
                  />
                </label>
              )}
              <label className="space-y-1 text-[11px] font-semibold text-[#52524E]">
                <span>Internal note (optional)</span>
                <input name="adminNote" maxLength={1000} className={inputCls} />
              </label>
            </div>
            <p className="text-[11px] text-[#73736E]">
              {selected?.method === "manual"
                ? "This order was not paid through Razorpay. Transfer the money first, then record the UTR."
                : "The refund will be sent through Razorpay immediately."}
            </p>
            <Feedback state={state} />
            <button
              type="submit"
              disabled={pending}
              className="h-9 cursor-pointer rounded-lg bg-[#1A1A18] px-4 text-xs font-semibold text-white hover:bg-black disabled:opacity-60"
            >
              {pending ? "Processing..." : "Create refund"}
            </button>
          </form>
        ))}
    </section>
  );
}

export function RefundsQueueClient({
  rows,
  refundableOrders,
  preselectedOrderId,
}: {
  rows: AdminRefundRow[];
  refundableOrders: RefundableOrderOption[];
  preselectedOrderId: string | null;
}) {
  const [tab, setTab] = useState<"open" | "done" | "all">("open");
  const visible = useMemo(
    () =>
      rows.filter((r) =>
        tab === "all"
          ? true
          : tab === "open"
            ? OPEN.includes(r.refund.status)
            : !OPEN.includes(r.refund.status)
      ),
    [rows, tab]
  );
  const openCount = rows.filter((r) => OPEN.includes(r.refund.status)).length;

  return (
    <div className="space-y-5">
      <InitiateRefundForm orders={refundableOrders} preselectedOrderId={preselectedOrderId} />

      <div role="tablist" className="flex flex-wrap gap-2">
        {(
          [
            ["open", `Needs action (${openCount})`],
            ["done", "Completed"],
            ["all", "All"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`h-9 cursor-pointer rounded-full px-4 text-xs font-semibold ${
              tab === key
                ? "bg-[#1A1A18] text-white"
                : "border border-[#E5E5E0] bg-white text-[#52524E] hover:bg-[#FAF8F4]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-[#E5E5E0] bg-white p-10 text-center text-sm text-[#73736E]">
          {tab === "open" ? "No refunds need action." : "No refunds yet."}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((row) => {
            const { refund, order } = row;
            const badge = STATUS_BADGE[refund.status];
            return (
              <li
                key={refund.id}
                className="rounded-xl border border-[#E5E5E0] bg-white p-4 shadow-2xs sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#1A1A18]">
                        {refund.orderId}
                      </span>
                      <StatusBadge status={badge.variant} label={badge.label} />
                      <span className="rounded bg-[#F0F0EC] px-2 py-0.5 text-[10px] font-semibold text-[#52524E] uppercase">
                        {refund.type}
                      </span>
                      <span className="rounded bg-[#F0F0EC] px-2 py-0.5 text-[10px] font-semibold text-[#52524E] uppercase">
                        {row.method === "razorpay" ? "Razorpay" : "Manual / UTR"}
                      </span>
                    </div>
                    <p className="text-xs text-[#52524E]">
                      {order
                        ? `${order.customerName} · ${order.customerEmail || "no email"} · Order ${order.status} · ${order.paymentMethod} (${order.paymentStatus}) · Total ${inr(order.totalAmount)}`
                        : "Order details unavailable"}
                    </p>
                    {refund.reason && (
                      <p className="text-xs text-[#1A1A18]">
                        <span className="font-semibold">Reason:</span> {refund.reason}
                      </p>
                    )}
                    {refund.failureReason && (
                      <p className="text-xs text-rose-700">
                        <span className="font-semibold">Error:</span> {refund.failureReason}
                      </p>
                    )}
                    {refund.adminNote && (
                      <p className="text-xs text-[#73736E]">
                        <span className="font-semibold">Note:</span> {refund.adminNote}
                      </p>
                    )}
                    {(refund.gatewayRefundId || refund.manualReference) && (
                      <p className="font-mono text-[11px] text-[#73736E]">
                        {refund.gatewayRefundId
                          ? `Razorpay ${refund.gatewayRefundId}`
                          : `UTR ${refund.manualReference}`}
                      </p>
                    )}
                    <p className="text-[11px] text-[#73736E]">
                      Requested {new Date(refund.createdAt).toLocaleString("en-IN")}
                      {refund.processedAt
                        ? ` · Processed ${new Date(refund.processedAt).toLocaleString("en-IN")}`
                        : ""}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-lg font-bold text-[#1A1A18]">
                    {inr(refund.amount)}
                  </span>
                </div>

                {OPEN.includes(refund.status) && (
                  <div className="mt-4 border-t border-[#F0F0EC] pt-4">
                    <ReviewForms row={row} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
