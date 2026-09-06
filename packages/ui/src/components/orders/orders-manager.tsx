"use client";

import React, { useState, useTransition } from "react";
import type { OrderRecord, OrderStatus } from "@genz/types";
import { SlideOverDrawer } from "../slide-over-drawer";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  ChevronRight,
  MapPin,
  Phone,
  User,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Building2,
  ExternalLink,
  Send,
  XCircle,
} from "lucide-react";

export interface OrdersManagerProps {
  mode: "admin" | "seller";
  orders: OrderRecord[];
  sellerId?: string;
  onUpdateStatus: (
    orderId: string,
    status: OrderStatus,
    carrier?: string,
    trackingNumber?: string,
    note?: string
  ) => Promise<{ success: boolean; error?: string } | void>;
}

export function OrdersManager({
  mode,
  orders: initialOrders,
  sellerId,
  onUpdateStatus,
}: OrdersManagerProps) {
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Status transition form state
  const [isPending, startTransition] = useTransition();
  const [carrierInput, setCarrierInput] = useState("Delhivery");
  const [trackingNumberInput, setTrackingNumberInput] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [showShipModal, setShowShipModal] = useState(false);

  // Filter orders if seller mode
  const scopedOrders = orders.filter((o) => {
    if (mode === "seller" && sellerId) {
      return o.sellerIds && o.sellerIds.includes(sellerId);
    }
    return true;
  });

  // Calculate KPI metrics
  const totalCount = scopedOrders.length;
  const placedCount = scopedOrders.filter((o) => o.status === "placed").length;
  const processingCount = scopedOrders.filter((o) => o.status === "processing").length;
  const shippedCount = scopedOrders.filter((o) => o.status === "shipped").length;
  const deliveredCount = scopedOrders.filter((o) => o.status === "delivered").length;
  const cancelledCount = scopedOrders.filter((o) => o.status === "cancelled").length;

  const totalRevenue = scopedOrders.reduce((sum, o) => {
    if (mode === "seller" && sellerId) {
      // Calculate only items from this seller
      const myItemsTotal = (o.items || [])
        .filter((item) => (item.sellerId || item.seller_id) === sellerId)
        .reduce((s, i) => s + i.price * i.quantity, 0);
      return sum + myItemsTotal;
    }
    return sum + (o.totalAmount || 0);
  }, 0);

  // Filter by tab and search
  const filteredOrders = scopedOrders.filter((order) => {
    if (selectedStatusTab !== "all" && order.status !== selectedStatusTab) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (order.id || "").toLowerCase().includes(q);
      const matchCustomer = (order.customerName || "").toLowerCase().includes(q);
      const matchCity = (order.shippingAddress?.city || "").toLowerCase().includes(q);
      const matchTracking = (order.trackingNumber || "").toLowerCase().includes(q);
      const matchItem = (order.items || []).some((i) =>
        (i.name || i.product_name || "").toLowerCase().includes(q)
      );
      return matchId || matchCustomer || matchCity || matchTracking || matchItem;
    }
    return true;
  });

  const handleOpenOrder = (order: OrderRecord) => {
    setSelectedOrder(order);
    setCarrierInput(order.carrier || "Delhivery");
    setTrackingNumberInput(order.trackingNumber || "");
    setCustomNote("");
    setActionError(null);
    setShowShipModal(false);
    setDrawerOpen(true);
  };

  const handleStatusChange = (
    newStatus: OrderStatus,
    carrier?: string,
    tracking?: string,
    note?: string
  ) => {
    if (!selectedOrder) return;
    setActionError(null);

    startTransition(async () => {
      try {
        const res = await onUpdateStatus(
          selectedOrder.id,
          newStatus,
          carrier,
          tracking,
          note
        );
        if (res && !res.success) {
          setActionError(res.error || "Failed to update order status");
          return;
        }

        // Optimistic local update
        const updatedEvents = [
          ...(selectedOrder.trackingEvents || []),
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            title: `Order marked as ${newStatus.toUpperCase()}`,
            description: note || `Updated to ${newStatus}`,
          },
        ];

        const updatedOrder: OrderRecord = {
          ...selectedOrder,
          status: newStatus,
          carrier: carrier || selectedOrder.carrier,
          trackingNumber: tracking || selectedOrder.trackingNumber,
          paymentStatus: newStatus === "delivered" ? "paid" : selectedOrder.paymentStatus,
          trackingEvents: updatedEvents,
          updatedAt: new Date().toISOString(),
        };

        setSelectedOrder(updatedOrder);
        setOrders((prev) =>
          prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
        );
        setShowShipModal(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error updating status";
        setActionError(msg);
      }
    });
  };

  const statusBadges = {
    placed: "bg-amber-50 text-amber-800 border-amber-300",
    processing: "bg-blue-50 text-blue-800 border-blue-300",
    shipped: "bg-purple-50 text-purple-800 border-purple-300",
    delivered: "bg-emerald-50 text-emerald-800 border-emerald-300",
    cancelled: "bg-rose-50 text-rose-800 border-rose-300",
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E0] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18]">
              {mode === "admin" ? "All Platform Orders" : "Factory Orders & COD Shipments"}
            </h1>
            <span className="bg-[#FEF3C7] text-[#92400E] px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
              {mode === "admin" ? "Master Admin View" : "Direct Seller Desk"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#73736E] mt-1">
            {mode === "admin"
              ? "Track, inspect, and fulfill orders across all verified Indian sellers and customers."
              : "Manage customer orders placed for your craft catalog. Track progress from workshop to delivery."}
          </p>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#73736E] uppercase tracking-wider">
              Total Orders
            </span>
            <Package className="w-4 h-4 text-[#D97706]" />
          </div>
          <p className="font-mono text-2xl font-bold text-[#1A1A18] mt-2">{totalCount}</p>
          <span className="text-[11px] text-[#73736E]">Across all categories</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#73736E] uppercase tracking-wider">
              To Ship / Pending
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-mono text-2xl font-bold text-amber-700 mt-2">
            {placedCount + processingCount}
          </p>
          <span className="text-[11px] text-amber-800">Needs fulfillment</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#73736E] uppercase tracking-wider">
              In Transit
            </span>
            <Truck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="font-mono text-2xl font-bold text-purple-700 mt-2">{shippedCount}</p>
          <span className="text-[11px] text-purple-800">Shipped with courier</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#73736E] uppercase tracking-wider">
              Delivered
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-mono text-2xl font-bold text-emerald-700 mt-2">
            {deliveredCount}
          </p>
          <span className="text-[11px] text-emerald-800">Completed &amp; paid</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#73736E] uppercase tracking-wider">
              {mode === "seller" ? "Seller Revenue" : "Total GMV"}
            </span>
            <CreditCard className="w-4 h-4 text-[#1A1A18]" />
          </div>
          <p className="font-mono text-xl sm:text-2xl font-bold text-[#1A1A18] mt-2">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">Cash on Delivery</span>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E5E5E0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: "all", label: "All Orders", count: totalCount },
            { key: "placed", label: "Placed", count: placedCount },
            { key: "processing", label: "Processing", count: processingCount },
            { key: "shipped", label: "Shipped", count: shippedCount },
            { key: "delivered", label: "Delivered", count: deliveredCount },
            { key: "cancelled", label: "Cancelled", count: cancelledCount },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedStatusTab(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedStatusTab === tab.key
                  ? "bg-[#1A1A18] text-white shadow-xs"
                  : "bg-[#FAF8F4] text-[#52524E] hover:bg-[#F3EFE6]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedStatusTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-[#E5E5E0] text-[#1A1A18]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#73736E]" />
          <input
            type="text"
            placeholder="Search Order ID, customer, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F4] border border-[#E5E5E0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1A1A18] placeholder-[#73736E] focus:outline-none focus:ring-2 focus:ring-[#D97706]/30 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5E0] overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-[#73736E] mx-auto mb-3 opacity-40" />
            <h3 className="font-serif text-lg text-[#1A1A18]">No orders found</h3>
            <p className="text-xs text-[#73736E] mt-1">
              Try adjusting your search query or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F4] border-b border-[#E5E5E0] text-[#73736E] uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID &amp; Date</th>
                  <th className="py-3 px-4">Customer &amp; City</th>
                  <th className="py-3 px-4">Products</th>
                  {mode === "admin" && <th className="py-3 px-4">Seller Attribution</th>}
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status &amp; Tracking</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E0]">
                {filteredOrders.map((order) => {
                  const items = order.items || [];
                  const displayedItems =
                    mode === "seller" && sellerId
                      ? items.filter((i) => (i.sellerId || i.seller_id) === sellerId)
                      : items;

                  const status = (order.status || "placed").toLowerCase();
                  const badgeClass =
                    statusBadges[status as keyof typeof statusBadges] ||
                    "bg-gray-100 text-gray-800 border-gray-300";

                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleOpenOrder(order)}
                      className="hover:bg-[#FAF8F4]/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1A1A18]">
                        <div>{order.id}</div>
                        <div className="font-sans font-normal text-[11px] text-[#73736E] mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#1A1A18]">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-[#73736E] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{order.shippingAddress?.city || "India"}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {displayedItems[0]?.image && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={displayedItems[0].image}
                              alt="thumb"
                              className="w-8 h-8 rounded-lg object-cover border border-[#E5E5E0]"
                            />
                          )}
                          <div className="max-w-[160px] truncate">
                            <span className="font-medium text-[#1A1A18] block truncate">
                              {displayedItems[0]?.name ||
                                displayedItems[0]?.product_name ||
                                "Item"}
                            </span>
                            {displayedItems.length > 1 && (
                              <span className="text-[10px] text-[#73736E]">
                                +{displayedItems.length - 1} more items
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {mode === "admin" && (
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FAF8F4] border border-[#E5E5E0] rounded-md text-[11px] font-medium text-[#1A1A18]">
                            <Building2 className="w-3 h-3 text-[#D97706]" />
                            {displayedItems[0]?.sellerBusinessName || "Artisan Workshop"}
                          </span>
                        </td>
                      )}

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#D97706]">
                          ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                        </span>
                        <div className="text-[10px] text-[#73736E] font-semibold uppercase">
                          COD
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
                        >
                          {order.status}
                        </span>
                        {order.trackingNumber && (
                          <div className="text-[10px] text-[#73736E] mt-0.5 font-mono">
                            AWB: {order.trackingNumber}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#D97706] hover:text-[#B45309]"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SlideOver Drawer for Order Details and Status Transition */}
      <SlideOverDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`Order Details: ${selectedOrder?.id || ""}`}
        description="View shipment destination, itemized products, and update live tracking."
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6 pb-8">
            {/* Status & Payment Banner */}
            <div className="bg-[#FAF8F4] p-4 rounded-2xl border border-[#E5E5E0] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#73736E] tracking-wider block">
                  Current Status
                </span>
                <span
                  className={`inline-block mt-1 px-3 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wider ${
                    statusBadges[
                      (selectedOrder.status || "placed").toLowerCase() as keyof typeof statusBadges
                    ] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#73736E] tracking-wider block">
                  Payment Method
                </span>
                <span className="font-mono text-base font-bold text-[#D97706] mt-0.5 block">
                  Cash on Delivery (₹{selectedOrder.totalAmount.toLocaleString("en-IN")})
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  {selectedOrder.status === "delivered" ? "Collected / Paid" : "Collect upon delivery"}
                </span>
              </div>
            </div>

            {/* Error banner if any */}
            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* ORDER LIFECYCLE ACTION CONTROLS */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A18] block">
                Update Order Lifecycle
              </span>

              <div className="flex flex-wrap gap-2">
                {selectedOrder.status === "placed" && (
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleStatusChange("processing")}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9"
                  >
                    <Package className="w-3.5 h-3.5 mr-1.5" /> Start Processing Order
                  </Button>
                )}

                {(selectedOrder.status === "placed" || selectedOrder.status === "processing") && (
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => setShowShipModal((prev) => !prev)}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-9"
                  >
                    <Truck className="w-3.5 h-3.5 mr-1.5" /> Dispatch / Mark as Shipped
                  </Button>
                )}

                {selectedOrder.status === "shipped" && (
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleStatusChange("delivered")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Confirm Delivery &amp; Collect COD
                  </Button>
                )}

                {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleStatusChange("cancelled", undefined, undefined, "Order cancelled")}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-9"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancel Order
                  </Button>
                )}
              </div>

              {/* Courier Input Drawer when Dispatching */}
              {showShipModal && (
                <div className="mt-3 p-3.5 bg-[#FAF8F4] rounded-xl border border-[#E5E5E0] space-y-3">
                  <span className="text-xs font-semibold text-[#1A1A18] block">
                    Enter Shipment Courier &amp; Tracking Details:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <Label className="text-[10px] text-[#73736E] uppercase font-semibold">
                        Courier Partner
                      </Label>
                      <select
                        value={carrierInput}
                        onChange={(e) => setCarrierInput(e.target.value)}
                        className="w-full h-9 bg-white border border-[#E5E5E0] rounded-xl text-xs px-2.5 mt-1 text-[#1A1A18]"
                      >
                        <option value="Delhivery">Delhivery</option>
                        <option value="Blue Dart">Blue Dart</option>
                        <option value="DTDC">DTDC</option>
                        <option value="India Post">India Post Speed Post</option>
                        <option value="Shiprocket">Shiprocket</option>
                        <option value="Shadowfax">Shadowfax</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-[10px] text-[#73736E] uppercase font-semibold">
                        Tracking Number / AWB
                      </Label>
                      <Input
                        value={trackingNumberInput}
                        onChange={(e) => setTrackingNumberInput(e.target.value)}
                        placeholder="e.g. AWB-982173491"
                        className="h-9 text-xs mt-1 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowShipModal(false)}
                      className="text-xs h-8"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        handleStatusChange(
                          "shipped",
                          carrierInput,
                          trackingNumberInput || `AWB-${Math.floor(10000000 + Math.random() * 90000000)}`
                        )
                      }
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
                    >
                      Confirm Dispatch
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Customer & Shipping Address */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A18] block">
                Customer &amp; Shipping Destination
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#73736E] uppercase block">Full Name</span>
                  <span className="font-semibold text-[#1A1A18]">
                    {selectedOrder.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#73736E] uppercase block">Phone</span>
                  <span className="font-mono text-[#1A1A18]">
                    {selectedOrder.customerPhone || selectedOrder.shippingAddress?.phone || "N/A"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-[#73736E] uppercase block">Delivery Address</span>
                  <span className="text-[#52524E]">
                    {selectedOrder.shippingAddress?.addressLine},{" "}
                    {selectedOrder.shippingAddress?.city},{" "}
                    {selectedOrder.shippingAddress?.state} -{" "}
                    {selectedOrder.shippingAddress?.pincode}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Products */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A18] block">
                Ordered Items ({selectedOrder.items?.length || 0})
              </span>
              <div className="divide-y divide-[#E5E5E0]">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.image}
                          alt="product"
                          className="w-10 h-10 object-cover rounded-lg border border-[#E5E5E0]"
                        />
                      )}
                      <div>
                        <span className="font-semibold text-[#1A1A18] block">
                          {item.name || item.product_name || "Handmade Product"}
                        </span>
                        {item.sellerBusinessName && (
                          <span className="text-[10px] text-[#73736E] block">
                            Maker: {item.sellerBusinessName}
                          </span>
                        )}
                        {item.variantName && (
                          <span className="text-[10px] text-[#73736E] block">
                            Variant: {item.variantName} ({item.variantValue})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#1A1A18] block">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-[#73736E]">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking History Events */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E0] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A18] block">
                Tracking History Log
              </span>
              <div className="space-y-3">
                {(selectedOrder.trackingEvents || []).map((event, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#D97706] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#1A1A18]">{event.title}</span>
                        <span className="text-[10px] text-[#73736E] font-mono">
                          {new Date(event.timestamp).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-[11px] text-[#52524E] mt-0.5">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
}
