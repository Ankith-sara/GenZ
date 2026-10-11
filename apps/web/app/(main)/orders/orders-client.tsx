"use client";

import { useActionState, useEffect, useState, useSyncExternalStore } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  XCircle,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import type {
  OrderRecord,
  RefundMethod,
  RefundStatus,
  RefundType,
} from "@genz/types";
import { cancelOrderAction, requestReturnAction, type OrderActionState } from "./actions";

export interface CustomerRefundView {
  id: string;
  amount: number;
  type: RefundType;
  status: RefundStatus;
  method: RefundMethod;
  adminNote: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface CustomerOrderView {
  order: OrderRecord;
  refunds: CustomerRefundView[];
  actions: {
    canCancel: boolean;
    canReturn: boolean;
    returnBlockedReason: string | null;
    returnWindowEndsAt: string | null;
    refundOnCancel: boolean;
  };
}

interface OrdersClientProps {
  initialOrders?: CustomerOrderView[];
}

const emptySubscribe = () => () => {};

const PAYMENT_LABELS: Record<string, string> = {
  razorpay: "Online",
  online: "Online",
  upi_qr: "UPI",
  cod: "COD",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Payment pending",
  paid: "Paid",
  failed: "Payment failed",
  refunded: "Refunded",
  partially_refunded: "Partly refunded",
};

const REFUND_STATUS_STYLES: Record<RefundStatus, { label: string; className: string }> = {
  requested: { label: "Requested", className: "bg-amber-50 text-amber-800 border-amber-300" },
  approved: { label: "Approved", className: "bg-blue-50 text-blue-800 border-blue-300" },
  processing: { label: "Initiated", className: "bg-blue-50 text-blue-800 border-blue-300" },
  processed: { label: "Refunded", className: "bg-emerald-50 text-emerald-800 border-emerald-300" },
  rejected: { label: "Not approved", className: "bg-rose-50 text-rose-800 border-rose-300" },
  failed: { label: "Delayed", className: "bg-rose-50 text-rose-800 border-rose-300" },
};

const REFUND_TYPE_LABELS: Record<RefundType, string> = {
  cancellation: "Cancellation refund",
  return: "Return refund",
  admin: "Refund",
};

function formatDate(value: string | null | undefined, withTime = false): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function ActionMessage({ state }: { state: OrderActionState }) {
  if (state.error) {
    return (
      <p role="alert" className="flex items-start gap-1.5 text-xs text-rose-700">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {state.error}
      </p>
    );
  }
  if (state.success && state.message) {
    return <p className="text-xs text-emerald-700">{state.message}</p>;
  }
  return null;
}

function CancelOrderForm({ orderId, refundOnCancel }: { orderId: string; refundOnCancel: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(cancelOrderAction, {});

  if (state.success) return <ActionMessage state={state} />;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 text-xs font-semibold text-rose-700 hover:bg-rose-50"
      >
        <XCircle className="h-3.5 w-3.5" />
        Cancel order
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-2.5 rounded-xl border border-rose-200 bg-white p-4">
      <input type="hidden" name="orderId" value={orderId} />
      <label htmlFor={`cancel-reason-${orderId}`} className="block text-xs font-semibold text-[#1A1A18]">
        Why are you cancelling? (optional)
      </label>
      <textarea
        id={`cancel-reason-${orderId}`}
        name="reason"
        maxLength={1000}
        rows={2}
        className="w-full rounded-lg border border-[#E5E5E0] p-2 text-xs focus:ring-2 focus:ring-[#D97706]/30 focus:outline-none"
      />
      <p className="text-[11px] text-[#73736E]">
        {refundOnCancel
          ? "Your payment will be refunded to the original payment method after our team reviews the cancellation."
          : "Nothing has been charged for this order, so no refund is needed."}
      </p>
      <ActionMessage state={state} />
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 cursor-pointer items-center rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
        >
          {pending ? "Cancelling..." : "Confirm cancellation"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-9 cursor-pointer items-center rounded-xl border border-[#E5E5E0] px-4 text-xs font-semibold text-[#52524E] hover:bg-[#FAF8F4]"
        >
          Keep order
        </button>
      </div>
    </form>
  );
}

function ReturnRequestForm({ orderId, windowEndsAt }: { orderId: string; windowEndsAt: string | null }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(requestReturnAction, {});

  if (state.success) return <ActionMessage state={state} />;

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-[#E5E5E0] bg-white px-4 text-xs font-semibold text-[#1A1A18] hover:bg-[#FAF8F4]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Request return
        </button>
        {windowEndsAt && (
          <span className="text-[11px] text-[#73736E]">
            Return window closes on {formatDate(windowEndsAt)}
          </span>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-2.5 rounded-xl border border-[#E5E5E0] bg-white p-4">
      <input type="hidden" name="orderId" value={orderId} />
      <label htmlFor={`return-reason-${orderId}`} className="block text-xs font-semibold text-[#1A1A18]">
        What went wrong? *
      </label>
      <textarea
        id={`return-reason-${orderId}`}
        name="reason"
        required
        minLength={5}
        maxLength={1000}
        rows={3}
        className="w-full rounded-lg border border-[#E5E5E0] p-2 text-xs focus:ring-2 focus:ring-[#D97706]/30 focus:outline-none"
      />
      <p className="text-[11px] text-[#73736E]">
        Keep the item and its packaging ready. We will arrange a pickup and refund you once it is received.
      </p>
      <ActionMessage state={state} />
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 cursor-pointer items-center rounded-xl bg-[#D97706] px-4 text-xs font-semibold text-white hover:bg-[#B45309] disabled:opacity-60"
        >
          {pending ? "Sending..." : "Submit return request"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-9 cursor-pointer items-center rounded-xl border border-[#E5E5E0] px-4 text-xs font-semibold text-[#52524E] hover:bg-[#FAF8F4]"
        >
          Close
        </button>
      </div>
    </form>
  );
}

export function OrdersClient({ initialOrders = [] }: OrdersClientProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    initialOrders[0]?.order.id || null
  );

  useEffect(() => {
    // Older versions cached orders in the browser; remove them so no order
    // details linger on shared devices. Orders now always come from the server.
    try {
      localStorage.removeItem("genz-orders");
    } catch {}
  }, []);

  if (!isMounted) return null;

  if (initialOrders.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E5E5E0] bg-white p-8 py-16 text-center shadow-xs">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#E5E5E0] bg-[#FAF7F0] text-[#D97706]">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="font-serif text-2xl font-normal text-[#1A1A18]">
          No orders found yet
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#73736E]">
          You haven&apos;t placed any orders with this account yet. Orders you place while
          signed in will appear here.
        </p>
        <Link
          href="/discover"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#D97706] px-8 text-xs font-semibold tracking-wider text-white uppercase shadow-sm hover:bg-[#B45309]"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const steps = [
    { key: "placed", label: "Order Placed", desc: "Order confirmed", icon: Clock },
    {
      key: "processing",
      label: "Processing",
      desc: "Maker packing items",
      icon: Package,
    },
    { key: "shipped", label: "Shipped", desc: "Handed to courier", icon: Truck },
    {
      key: "delivered",
      label: "Delivered",
      desc: "Delivered to address",
      icon: CheckCircle2,
    },
  ];

  const getStepStatus = (orderStatus: string, stepKey: string) => {
    const statusOrder = ["placed", "processing", "shipped", "delivered"];
    const currentIdx = statusOrder.indexOf(orderStatus.toLowerCase());
    const stepIdx = statusOrder.indexOf(stepKey);

    if (currentIdx >= stepIdx) return "completed";
    return "pending";
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
        <h2 className="font-serif text-xl font-normal text-[#1A1A18]">
          Your Orders ({initialOrders.length})
        </h2>
        <span className="hidden text-xs text-[#73736E] sm:inline">
          Click any order to view tracking updates
        </span>
      </div>

      <div className="space-y-4">
        {initialOrders.map(({ order, refunds, actions }) => {
          const ordId = order.id || order.orderId || "GZ-ORD";
          const isExpanded = expandedOrderId === ordId;
          const status = (order.status || "placed").toLowerCase();

          const statusBadge =
            {
              placed: "bg-amber-50 text-amber-800 border-amber-300",
              processing: "bg-blue-50 text-blue-800 border-blue-300",
              shipped: "bg-purple-50 text-purple-800 border-purple-300",
              delivered: "bg-emerald-50 text-emerald-800 border-emerald-300",
              cancelled: "bg-rose-50 text-rose-800 border-rose-300",
            }[status] || "bg-gray-100 text-gray-800 border-gray-300";

          const totalVal = order.totalAmount ?? 0;
          const paymentLabel = PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod;
          const paymentStatusLabel =
            PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus;

          return (
            <div
              key={ordId}
              className="overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white shadow-xs transition-all"
            >
              {/* Header / Summary row */}
              <button
                type="button"
                onClick={() => setExpandedOrderId(isExpanded ? null : ordId)}
                aria-expanded={isExpanded}
                className="flex w-full cursor-pointer flex-col items-start justify-between gap-3 p-5 text-left transition-colors select-none hover:bg-[#FAF8F4]/50 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-[#1A1A18]">
                      {ordId}
                    </span>
                    <span
                      className={`rounded-md border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${statusBadge}`}
                    >
                      {status}
                    </span>
                    <span className="rounded bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold text-[#92400E] uppercase">
                      {paymentLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#73736E]">
                    Placed on: {formatDate(order.createdAt, true)}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
                  <div className="text-right">
                    <span className="block font-mono text-base font-bold text-[#D97706]">
                      ₹{totalVal.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-[#73736E]">{paymentStatusLabel}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-[#73736E]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#73736E]" />
                  )}
                </div>
              </button>

              {/* Expandable details */}
              {isExpanded && (
                <div className="space-y-6 border-t border-[#E5E5E0] bg-[#FAF8F4]/40 p-4 sm:p-6">
                  {/* Stepper Timeline */}
                  {status === "cancelled" ? (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
                      <XCircle className="h-4 w-4 shrink-0" />
                      This order was cancelled.
                    </div>
                  ) : (
                    <div>
                      <h4 className="mb-5 text-[11px] font-bold tracking-wider text-[#73736E] uppercase">
                        Live Delivery Progress
                      </h4>
                      <div className="relative grid grid-cols-4 items-center justify-between">
                        {/* Connecting Line */}
                        <div className="pointer-events-none absolute top-4.5 right-[12.5%] left-[12.5%] z-0 h-0.5 bg-[#E5E5E0]">
                          <div
                            className="h-full bg-[#D97706] transition-all duration-500"
                            style={{
                              width:
                                status === "placed"
                                  ? "0%"
                                  : status === "processing"
                                    ? "33.3%"
                                    : status === "shipped"
                                      ? "66.6%"
                                      : "100%",
                            }}
                          />
                        </div>

                        {steps.map((step) => {
                          const stepStatus = getStepStatus(status, step.key);
                          const Icon = step.icon;

                          return (
                            <div
                              key={step.key}
                              className="relative z-10 flex flex-col items-center text-center"
                            >
                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
                                  stepStatus === "completed"
                                    ? "border-[#D97706] bg-[#D97706] text-white shadow-xs"
                                    : "border-[#E5E5E0] bg-white text-[#73736E]"
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="mt-2 text-xs font-semibold text-[#1A1A18]">
                                {step.label}
                              </span>
                              <span className="hidden text-[10px] text-[#73736E] sm:block">
                                {step.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Courier & Tracking details if shipped */}
                  {(order.carrier || order.trackingNumber) && (
                    <div className="flex flex-col justify-between gap-3 rounded-xl border border-purple-200 bg-purple-50 p-4 text-xs text-purple-900 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 shrink-0 text-purple-700" />
                        <span>
                          Carrier Partner:{" "}
                          <strong>{order.carrier || "Standard Courier"}</strong>
                        </span>
                      </div>
                      <div>
                        Tracking AWB:{" "}
                        <strong className="rounded border border-purple-300 bg-white px-2 py-0.5 font-mono">
                          {order.trackingNumber}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Refunds */}
                  {refunds.length > 0 && (
                    <div className="rounded-xl border border-[#E5E5E0] bg-white p-4">
                      <h5 className="mb-3 text-[11px] font-bold tracking-wider text-[#73736E] uppercase">
                        Refunds
                      </h5>
                      <ul className="divide-y divide-[#E5E5E0]">
                        {refunds.map((refund) => {
                          const style = REFUND_STATUS_STYLES[refund.status];
                          return (
                            <li
                              key={refund.id}
                              className="flex flex-col gap-1 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <p className="font-semibold text-[#1A1A18]">
                                  {REFUND_TYPE_LABELS[refund.type]} · ₹
                                  {refund.amount.toLocaleString("en-IN")}
                                </p>
                                <p className="text-[10px] text-[#73736E]">
                                  Requested {formatDate(refund.createdAt)}
                                  {refund.processedAt
                                    ? ` · Refunded ${formatDate(refund.processedAt)}`
                                    : ""}
                                </p>
                                {refund.status === "rejected" && refund.adminNote && (
                                  <p className="mt-0.5 text-[11px] text-rose-700">
                                    {refund.adminNote}
                                  </p>
                                )}
                                {refund.status === "failed" && (
                                  <p className="mt-0.5 text-[11px] text-rose-700">
                                    There was a problem sending this refund. Our team is on it.
                                  </p>
                                )}
                              </div>
                              <span
                                className={`self-start rounded-md border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase sm:self-auto ${style.className}`}
                              >
                                {style.label}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Customer actions */}
                  {(actions.canCancel || actions.canReturn || actions.returnBlockedReason) && (
                    <div className="space-y-2">
                      {actions.canCancel && (
                        <CancelOrderForm orderId={ordId} refundOnCancel={actions.refundOnCancel} />
                      )}
                      {actions.canReturn && (
                        <ReturnRequestForm
                          orderId={ordId}
                          windowEndsAt={actions.returnWindowEndsAt}
                        />
                      )}
                      {!actions.canReturn && actions.returnBlockedReason && (
                        <p className="text-[11px] text-[#73736E]">{actions.returnBlockedReason}</p>
                      )}
                    </div>
                  )}

                  {/* Items list */}
                  <div className="rounded-xl border border-[#E5E5E0] bg-white p-4">
                    <h5 className="mb-3 text-[11px] font-bold tracking-wider text-[#73736E] uppercase">
                      Ordered Products
                    </h5>
                    <div className="divide-y divide-[#E5E5E0]">
                      {(order.items || []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 py-2.5 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            {item.image && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={item.image}
                                alt={item.name || item.product_name || "Product"}
                                className="h-10 w-10 rounded-lg border border-[#E5E5E0] object-cover"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-[#1A1A18]">
                                {item.name || item.product_name || "Artisan Craft"}
                              </p>
                              {item.sellerBusinessName && (
                                <p className="text-[10px] text-[#73736E]">
                                  Maker: {item.sellerBusinessName}
                                </p>
                              )}
                              {item.variantName && (
                                <p className="text-[10px] text-[#73736E]">
                                  Option: {item.variantName} ({item.variantValue})
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="block font-mono font-medium text-[#1A1A18]">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-[#73736E]">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping address details */}
                  {order.shippingAddress && (
                    <div className="rounded-xl border border-[#E5E5E0] bg-white p-4 text-xs">
                      <h5 className="mb-2 text-[11px] font-bold tracking-wider text-[#73736E] uppercase">
                        Delivery Destination
                      </h5>
                      <p className="font-semibold text-[#1A1A18]">
                        {order.shippingAddress.recipientName}
                      </p>
                      {order.shippingAddress.phone && (
                        <p className="text-[#52524E]">
                          Phone: {order.shippingAddress.phone}
                        </p>
                      )}
                      <p className="mt-0.5 text-[#52524E]">
                        {order.shippingAddress.addressLine}, {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
