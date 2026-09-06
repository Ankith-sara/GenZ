"use client";

import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle2, ChevronDown, ChevronUp, Clock } from "lucide-react";
import Link from "next/link";
import type { OrderRecord } from "@genz/types";

interface OrdersClientProps {
  initialOrders?: OrderRecord[];
}

type ExtendedOrder = OrderRecord & { total?: number; date?: string };

export function OrdersClient({ initialOrders = [] }: OrdersClientProps) {
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    initialOrders[0]?.id || null
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);

    const stored = localStorage.getItem("genz-orders");
    if (stored) {
      try {
        const localList = JSON.parse(stored) as ExtendedOrder[];
        if (Array.isArray(localList) && localList.length > 0) {
          // Merge local orders with server orders by ID
          const orderMap = new Map<string, ExtendedOrder>();
          initialOrders.forEach((o) => orderMap.set(o.id || o.orderId || "", o));
          localList.forEach((o) => {
            const key = o.id || o.orderId || "";
            // Keep server state if exists, else local
            if (!orderMap.has(key)) {
              orderMap.set(key, o);
            }
          });
          const merged = Array.from(orderMap.values()).sort((a, b) => {
            const timeA = new Date(a.createdAt || a.date || 0).getTime();
            const timeB = new Date(b.createdAt || b.date || 0).getTime();
            return timeB - timeA;
          });
          setOrders(merged);
          if (!expandedOrderId && merged.length > 0) {
            setExpandedOrderId(merged[0].id || merged[0].orderId || null);
          }
        }
      } catch (err) {
        console.warn("Local orders parse error:", err);
      }
    }
  }, [initialOrders, expandedOrderId]);


  if (!isMounted) return null;

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-[#E5E5E0] p-8 shadow-xs">
        <div className="bg-[#FAF7F0] text-[#D97706] border border-[#E5E5E0] mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="font-serif text-[#1A1A18] text-2xl font-normal">
          No orders found yet
        </h2>
        <p className="text-sm text-[#73736E] mx-auto mt-2 max-w-sm leading-relaxed">
          You haven&apos;t placed any orders yet. Add items to your basket and choose Cash on Delivery to track them here.
        </p>
        <Link
          href="/discover"
          className="bg-[#D97706] hover:bg-[#B45309] mt-6 inline-flex h-11 items-center justify-center rounded-xl px-8 text-xs font-semibold tracking-wider text-white uppercase shadow-sm"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const steps = [
    { key: "placed", label: "Order Placed", desc: "Confirmed with COD", icon: Clock },
    { key: "processing", label: "Processing", desc: "Maker packing items", icon: Package },
    { key: "shipped", label: "Shipped", desc: "Handed to courier", icon: Truck },
    { key: "delivered", label: "Delivered", desc: "Delivered to address", icon: CheckCircle2 },
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
        <h2 className="font-serif text-[#1A1A18] text-xl font-normal">
          Recent Orders ({orders.length})
        </h2>
        <span className="text-xs text-[#73736E]">
          Click any order to view tracking updates
        </span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const ordId = order.id || order.orderId || "GZ-ORD";
          const isExpanded = expandedOrderId === ordId;
          const status = (order.status || "placed").toLowerCase();

          const statusBadge = {
            placed: "bg-amber-50 text-amber-800 border-amber-300",
            processing: "bg-blue-50 text-blue-800 border-blue-300",
            shipped: "bg-purple-50 text-purple-800 border-purple-300",
            delivered: "bg-emerald-50 text-emerald-800 border-emerald-300",
            cancelled: "bg-rose-50 text-rose-800 border-rose-300",
          }[status] || "bg-gray-100 text-gray-800 border-gray-300";

          const extOrder = order as ExtendedOrder;
          const totalVal = order.totalAmount ?? extOrder.total ?? 0;
          const createdDate = order.createdAt || extOrder.date || new Date().toISOString();


          return (
            <div
              key={ordId}
              className="border border-[#E5E5E0] bg-white overflow-hidden rounded-2xl shadow-xs transition-all"
            >
              {/* Header / Summary row */}
              <div
                onClick={() => setExpandedOrderId(isExpanded ? null : ordId)}
                className="hover:bg-[#FAF8F4]/50 flex cursor-pointer flex-col items-start justify-between gap-3 p-5 transition-colors select-none sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-[#1A1A18]">
                      {ordId}
                    </span>
                    <span
                      className={`rounded-md border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${statusBadge}`}
                    >
                      {status}
                    </span>
                    <span className="bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                      COD
                    </span>
                  </div>
                  <p className="text-xs text-[#73736E] mt-1">
                    Placed on:{" "}
                    {new Date(createdDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
                  <div className="text-right">
                    <span className="text-[#D97706] font-mono text-base font-bold block">
                      ₹{totalVal.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-[#73736E]">Pay on delivery</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="text-[#73736E] h-5 w-5" />
                  ) : (
                    <ChevronDown className="text-[#73736E] h-5 w-5" />
                  )}
                </div>
              </div>

              {/* Expandable details */}
              {isExpanded && (
                <div className="border-t border-[#E5E5E0] bg-[#FAF8F4]/40 space-y-6 p-6">
                  {/* Stepper Timeline */}
                  <div>
                    <h4 className="text-[11px] font-bold text-[#73736E] tracking-wider uppercase mb-5">
                      Live Delivery Progress
                    </h4>
                    <div className="relative grid grid-cols-4 items-center justify-between">
                      {/* Connecting Line */}
                      <div className="bg-[#E5E5E0] pointer-events-none absolute top-4.5 right-[12.5%] left-[12.5%] z-0 h-0.5">
                        <div
                          className="bg-[#D97706] h-full transition-all duration-500"
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
                                  ? "bg-[#D97706] border-[#D97706] text-white shadow-xs"
                                  : "bg-white border-[#E5E5E0] text-[#73736E]"
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

                  {/* Courier & Tracking details if shipped */}
                  {(order.carrier || order.trackingNumber) && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-900">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-purple-700 shrink-0" />
                        <span>
                          Carrier Partner: <strong>{order.carrier || "Standard Courier"}</strong>
                        </span>
                      </div>
                      <div>
                        Tracking AWB: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-purple-300">{order.trackingNumber}</strong>
                      </div>
                    </div>
                  )}

                  {/* Items list */}
                  <div className="bg-white rounded-xl border border-[#E5E5E0] p-4">
                    <h5 className="text-[11px] font-bold text-[#73736E] uppercase tracking-wider mb-3">
                      Ordered Products
                    </h5>
                    <div className="divide-y divide-[#E5E5E0]">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            {item.image && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={item.image}
                                alt={item.name || item.product_name || "Product"}
                                className="w-10 h-10 object-cover rounded-lg border border-[#E5E5E0]"
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
                            <span className="text-[#1A1A18] font-mono font-medium block">
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
                    <div className="bg-white rounded-xl border border-[#E5E5E0] p-4 text-xs">
                      <h5 className="text-[11px] font-bold text-[#73736E] uppercase tracking-wider mb-2">
                        Delivery Destination
                      </h5>
                      <p className="font-semibold text-[#1A1A18]">
                        {order.shippingAddress.recipientName}
                      </p>
                      {order.shippingAddress.phone && (
                        <p className="text-[#52524E]">📞 {order.shippingAddress.phone}</p>
                      )}
                      <p className="text-[#52524E] mt-0.5">
                        📍 {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
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
