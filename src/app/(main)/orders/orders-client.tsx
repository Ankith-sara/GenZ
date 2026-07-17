"use client";

import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
}

interface Address {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  orderId: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: "processing" | "packed" | "shipped" | "delivered";
  shippingAddress: Address;
  paymentMethod: string;
}

export function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const stored = localStorage.getItem("genz-orders");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        // Dynamically simulate status changes based on time elapsed
        const updated = parsed.map((order: Order) => {
          const elapsedSecs = (Date.now() - new Date(order.date).getTime()) / 1000;

          let currentStatus: Order["status"] = "processing";
          if (elapsedSecs > 120) currentStatus = "packed";
          if (elapsedSecs > 600) currentStatus = "shipped";
          if (elapsedSecs > 1800) currentStatus = "delivered";

          return { ...order, status: currentStatus };
        });

        setOrders(updated);
        if (updated.length > 0) {
          setExpandedOrderId(updated[0].orderId);
        }
      } catch {}
    }
  }, []);

  if (!isMounted) return null;

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="bg-cream-paper text-brand-yellow border-ash mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-none border">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="font-nantes text-ink-black text-2xl font-normal">
          No orders found
        </h2>
        <p className="text-caption font-graphik text-charcoal mx-auto mt-2 max-w-sm leading-relaxed">
          You haven&apos;t placed any orders yet. Add items to your cart and place an
          order to see it tracked here.
        </p>
        <Link
          href="/discover"
          className="bg-brand-yellow hover:bg-brand-yellow-hover font-graphik mt-8 inline-flex h-11 items-center justify-center rounded-none border-none px-8 text-xs font-normal tracking-[0.05em] text-white uppercase"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // Helper to render tracking steps
  const steps = [
    {
      key: "processing",
      label: "Confirmed",
      desc: "Order is processing",
      icon: Package,
    },
    { key: "packed", label: "Packed", desc: "Ready for shipment", icon: Package },
    { key: "shipped", label: "Shipped", desc: "Out for delivery", icon: Truck },
    {
      key: "delivered",
      label: "Delivered",
      desc: "Handed to recipient",
      icon: CheckCircle2,
    },
  ];

  const getStepStatus = (orderStatus: Order["status"], stepKey: string) => {
    const statusOrder = ["processing", "packed", "shipped", "delivered"];
    const currentIdx = statusOrder.indexOf(orderStatus);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (currentIdx >= stepIdx) return "completed";
    return "pending";
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h2 className="font-nantes text-ink-black border-ash mb-4 border-b pb-3 text-xl font-normal">
        Order History &amp; Tracking
      </h2>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.orderId;
          const statusColors = {
            processing: "bg-cream-paper text-brand-blue border-brand-blue/30",
            packed: "bg-cream-paper text-brand-yellow border-brand-yellow/30",
            shipped: "bg-cream-paper text-brand-yellow border-brand-yellow/30",
            delivered: "bg-brand-yellow text-white border-none",
          };

          return (
            <div
              key={order.orderId}
              className="border-ash bg-pure-white overflow-hidden rounded-none border transition-all duration-300"
            >
              {/* Header / Summary row */}
              <div
                onClick={() => setExpandedOrderId(isExpanded ? null : order.orderId)}
                className="hover:bg-cream-paper/40 flex cursor-pointer flex-col items-start justify-between gap-3 p-5 transition-colors select-none sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-ink-black font-mono text-sm font-semibold">
                      {order.orderId}
                    </span>
                    <span
                      className={`font-graphik rounded-none border px-2.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase ${statusColors[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-caption font-graphik text-smoke mt-1.5">
                    Placed:{" "}
                    {new Date(order.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
                  <span className="text-brand-yellow font-mono text-sm font-semibold sm:text-base">
                    ₹{order.total.toLocaleString()}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="text-smoke h-4.5 w-4.5" />
                  ) : (
                    <ChevronDown className="text-smoke h-4.5 w-4.5" />
                  )}
                </div>
              </div>

              {/* Expandable details */}
              {isExpanded && (
                <div className="border-ash bg-cream-paper/20 space-y-8 border-t p-6">
                  {/* Stepper Timeline */}
                  <div>
                    <h4 className="text-smoke font-graphik mb-6 text-[10px] font-medium tracking-wider uppercase">
                      Shipment Tracking Timeline
                    </h4>
                    <div className="relative grid grid-cols-4 items-center justify-between">
                      {/* Connecting Line */}
                      <div className="bg-ash pointer-events-none absolute top-4.5 right-[12.5%] left-[12.5%] z-0 h-0.5">
                        <div
                          className="bg-brand-yellow h-full transition-all duration-500"
                          style={{
                            width:
                              order.status === "processing"
                                ? "0%"
                                : order.status === "packed"
                                  ? "33.3%"
                                  : order.status === "shipped"
                                    ? "66.6%"
                                    : "100%",
                          }}
                        />
                      </div>

                      {steps.map((step) => {
                        const stepStatus = getStepStatus(order.status, step.key);
                        const Icon = step.icon;

                        return (
                          <div
                            key={step.key}
                            className="font-graphik relative z-10 flex flex-col items-center text-center"
                          >
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-none border transition-all duration-300 ${
                                stepStatus === "completed"
                                  ? "bg-brand-yellow border-brand-yellow text-white"
                                  : "bg-pure-white text-smoke border-ash"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span
                              className={`mt-2.5 block text-[10px] font-semibold sm:text-xs ${stepStatus === "completed" ? "text-brand-yellow" : "text-smoke"}`}
                            >
                              {step.label}
                            </span>
                            <span className="text-smoke mt-0.5 hidden text-[9px] sm:block">
                              {step.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="border-ash grid grid-cols-1 gap-8 border-t pt-6 md:grid-cols-3">
                    {/* Delivery & Billing */}
                    <div className="font-graphik space-y-4 text-sm md:col-span-1">
                      <div>
                        <h5 className="text-smoke mb-2 text-[10px] font-medium tracking-wider uppercase">
                          Delivery Destination
                        </h5>
                        <p className="text-ink-black text-sm font-semibold">
                          {order.shippingAddress.recipientName}
                        </p>
                        <p className="text-charcoal mt-1 text-xs">
                          {order.shippingAddress.addressLine}
                        </p>
                        <p className="text-charcoal text-xs">
                          {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                          {order.shippingAddress.pincode}
                        </p>
                        <p className="text-smoke mt-1.5 font-mono text-[11px]">
                          {order.shippingAddress.phone}
                        </p>
                      </div>

                      <div>
                        <h5 className="text-smoke mb-1.5 text-[10px] font-medium tracking-wider uppercase">
                          Payment Method
                        </h5>
                        <p className="text-charcoal text-xs font-medium">
                          {order.paymentMethod}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="font-graphik space-y-3 md:col-span-2">
                      <h5 className="text-smoke mb-2 text-[10px] font-medium tracking-wider uppercase">
                        Products Purchased
                      </h5>

                      <div className="divide-ash border-ash bg-pure-white divide-y overflow-hidden rounded-none border">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 p-3.5 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-cream-paper border-ash h-10 w-10 shrink-0 overflow-hidden rounded-none border">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-ink-black line-clamp-1 font-semibold">
                                  {item.name}
                                </p>
                                <p className="text-smoke mt-0.5 text-[10px]">
                                  Qty: {item.quantity} · Price: ₹{item.price}
                                </p>
                              </div>
                            </div>
                            <span className="text-ink-black font-mono font-semibold">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Calculations breakdown */}
                      <dl className="border-ash font-graphik space-y-1.5 border-t border-dashed pt-2 text-xs">
                        <div className="flex justify-between">
                          <dt className="text-charcoal">Subtotal</dt>
                          <dd className="text-ink-black font-mono">
                            ₹{order.subtotal.toLocaleString()}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-charcoal">GST (18%)</dt>
                          <dd className="text-ink-black font-mono">
                            ₹{order.tax.toLocaleString()}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-charcoal">Shipping</dt>
                          <dd className="text-ink-black font-mono">
                            {order.shipping === 0 ? "FREE" : `₹${order.shipping}`}
                          </dd>
                        </div>
                        <div className="border-ash mt-1 flex justify-between border-t pt-2 text-sm font-semibold">
                          <dt className="text-brand-yellow">Total Paid</dt>
                          <dd className="text-brand-yellow font-mono">
                            ₹{order.total.toLocaleString()}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
