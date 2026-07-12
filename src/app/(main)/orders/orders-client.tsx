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
      <div className="text-center py-16">
        <div className="mx-auto w-16 h-16 bg-cream-paper text-forest-green flex items-center justify-center rounded-none border border-ash mb-4">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="font-nantes text-2xl text-ink-black font-normal">No orders found</h2>
        <p className="text-caption font-graphik mt-2 max-w-sm mx-auto leading-relaxed text-charcoal">
          You haven&apos;t placed any orders yet. Add items to your cart and place an order to see it tracked here.
        </p>
        <Link 
          href="/discover"
          className="inline-flex items-center justify-center bg-forest-green hover:bg-forest-mid text-white rounded-none font-graphik text-xs font-normal tracking-[0.05em] uppercase h-11 px-8 mt-8 border-none"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // Helper to render tracking steps
  const steps = [
    { key: "processing", label: "Confirmed", desc: "Order is processing", icon: Package },
    { key: "packed", label: "Packed", desc: "Ready for shipment", icon: Package },
    { key: "shipped", label: "Shipped", desc: "Out for delivery", icon: Truck },
    { key: "delivered", label: "Delivered", desc: "Handed to recipient", icon: CheckCircle2 },
  ];

  const getStepStatus = (orderStatus: Order["status"], stepKey: string) => {
    const statusOrder = ["processing", "packed", "shipped", "delivered"];
    const currentIdx = statusOrder.indexOf(orderStatus);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (currentIdx >= stepIdx) return "completed";
    return "pending";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="font-nantes text-xl text-ink-black font-normal mb-4 border-b border-ash pb-3">Order History &amp; Tracking</h2>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.orderId;
          const statusColors = {
            processing: "bg-cream-paper text-brand-blue border-brand-blue/30",
            packed: "bg-cream-paper text-forest-green border-forest-green/30",
            shipped: "bg-cream-paper text-forest-green border-forest-green/30",
            delivered: "bg-forest-green text-white border-none",
          };

          return (
            <div key={order.orderId} className="border border-ash bg-pure-white rounded-none overflow-hidden transition-all duration-300">
              {/* Header / Summary row */}
              <div 
                onClick={() => setExpandedOrderId(isExpanded ? null : order.orderId)}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 cursor-pointer hover:bg-cream-paper/40 transition-colors gap-3 select-none"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-ink-black">{order.orderId}</span>
                    <span className={`text-[9px] px-2.5 py-0.5 border rounded-none font-graphik font-semibold uppercase tracking-wider ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-caption font-graphik mt-1.5 text-smoke">
                    Placed: {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="font-semibold text-forest-green text-sm sm:text-base font-mono">₹{order.total.toLocaleString()}</span>
                  {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-smoke" /> : <ChevronDown className="h-4.5 w-4.5 text-smoke" />}
                </div>
              </div>

              {/* Expandable details */}
              {isExpanded && (
                <div className="border-t border-ash p-6 space-y-8 bg-cream-paper/20">
                  {/* Stepper Timeline */}
                  <div>
                    <h4 className="text-[10px] font-medium text-smoke uppercase tracking-wider mb-6 font-graphik">Shipment Tracking Timeline</h4>
                    <div className="grid grid-cols-4 relative items-center justify-between">
                      {/* Connecting Line */}
                      <div className="absolute left-[12.5%] right-[12.5%] top-4.5 h-0.5 bg-ash pointer-events-none z-0">
                        <div 
                          className="h-full bg-forest-green transition-all duration-500" 
                          style={{
                            width: 
                              order.status === "processing" ? "0%" : 
                              order.status === "packed" ? "33.3%" : 
                              order.status === "shipped" ? "66.6%" : "100%"
                          }}
                        />
                      </div>

                      {steps.map((step) => {
                        const stepStatus = getStepStatus(order.status, step.key);
                        const Icon = step.icon;

                        return (
                          <div key={step.key} className="flex flex-col items-center text-center relative z-10 font-graphik">
                            <div 
                              className={`w-9 h-9 rounded-none flex items-center justify-center border transition-all duration-300 ${
                                stepStatus === "completed" 
                                  ? "bg-forest-green text-white border-forest-green" 
                                  : "bg-pure-white text-smoke border-ash"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className={`text-[10px] sm:text-xs font-semibold mt-2.5 block ${stepStatus === "completed" ? "text-forest-green" : "text-smoke"}`}>
                              {step.label}
                            </span>
                            <span className="text-[9px] text-smoke hidden sm:block mt-0.5">{step.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-ash">
                    {/* Delivery & Billing */}
                    <div className="md:col-span-1 space-y-4 font-graphik text-sm">
                      <div>
                        <h5 className="text-[10px] font-medium text-smoke uppercase tracking-wider mb-2">Delivery Destination</h5>
                        <p className="font-semibold text-sm text-ink-black">{order.shippingAddress.recipientName}</p>
                        <p className="text-xs text-charcoal mt-1">{order.shippingAddress.addressLine}</p>
                        <p className="text-xs text-charcoal">
                          {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                        </p>
                        <p className="text-[11px] text-smoke mt-1.5 font-mono">{order.shippingAddress.phone}</p>
                      </div>

                      <div>
                        <h5 className="text-[10px] font-medium text-smoke uppercase tracking-wider mb-1.5">Payment Method</h5>
                        <p className="text-xs text-charcoal font-medium">{order.paymentMethod}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="md:col-span-2 space-y-3 font-graphik">
                      <h5 className="text-[10px] font-medium text-smoke uppercase tracking-wider mb-2">Products Purchased</h5>
                      
                      <div className="divide-y divide-ash border border-ash rounded-none bg-pure-white overflow-hidden">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex gap-3 p-3.5 items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-none overflow-hidden bg-cream-paper shrink-0 border border-ash">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-semibold text-ink-black line-clamp-1">{item.name}</p>
                                <p className="text-smoke text-[10px] mt-0.5">Qty: {item.quantity} · Price: ₹{item.price}</p>
                              </div>
                            </div>
                            <span className="font-semibold text-ink-black font-mono">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Calculations breakdown */}
                      <dl className="space-y-1.5 text-xs pt-2 border-t border-ash border-dashed font-graphik">
                        <div className="flex justify-between">
                          <dt className="text-charcoal">Subtotal</dt>
                          <dd className="font-mono text-ink-black">₹{order.subtotal.toLocaleString()}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-charcoal">GST (18%)</dt>
                          <dd className="font-mono text-ink-black">₹{order.tax.toLocaleString()}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-charcoal">Shipping</dt>
                          <dd className="font-mono text-ink-black">{order.shipping === 0 ? "FREE" : `₹${order.shipping}`}</dd>
                        </div>
                        <div className="flex justify-between font-semibold text-sm border-t border-ash pt-2 mt-1">
                          <dt className="text-forest-green">Total Paid</dt>
                          <dd className="font-mono text-forest-green">₹{order.total.toLocaleString()}</dd>
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
