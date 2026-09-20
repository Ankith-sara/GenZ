"use client";

import React, { useState, useTransition } from "react";
import type { OrderRecord, OrderStatus } from "@genz/types";
import { SlideOverDrawer } from "../slide-over-drawer";
import { Button } from "../button";
import { Label } from "../label";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  ChevronRight,
  MapPin,
  CreditCard,
  AlertCircle,
  Building2,
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

  // Scope orders to authenticated seller if in seller mode
  const scopedOrders = orders.filter((o) => {
    if (mode === "seller" && sellerId) {
      return (
        (o.sellerIds && o.sellerIds.includes(sellerId)) ||
        (o.items || []).some((item) => (item.sellerId || item.seller_id) === sellerId)
      );
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
      const myItemsTotal = (o.items || [])
        .filter((item) => (item.sellerId || item.seller_id) === sellerId)
        .reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
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

    // Validate required courier info when shipping
    if (newStatus === "shipped") {
      if (!carrier?.trim() || !tracking?.trim()) {
        setActionError(
          "Please provide both shipping carrier and a valid tracking number."
        );
        return;
      }
    }

    startTransition(async () => {
      try {
        const res = await onUpdateStatus(
          selectedOrder.id,
          newStatus,
          carrier?.trim(),
          tracking?.trim(),
          note?.trim()
        );
        if (res && !res.success) {
          setActionError(res.error || "Failed to update order status.");
          return;
        }

        // Optimistic local update
        const updatedEvents = [
          ...(selectedOrder.trackingEvents || []),
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            title: `Order marked as ${newStatus.toUpperCase()}`,
            description: note || `Updated status to ${newStatus}`,
          },
        ];

        const updatedOrder: OrderRecord = {
          ...selectedOrder,
          status: newStatus,
          carrier: carrier ? carrier.trim() : selectedOrder.carrier,
          trackingNumber: tracking ? tracking.trim() : selectedOrder.trackingNumber,
          paymentStatus:
            newStatus === "delivered" ? "paid" : selectedOrder.paymentStatus,
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

  const statusBadges: Record<string, string> = {
    placed: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    shipped: "bg-purple-50 text-purple-700 border-purple-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };

  // Scope items in drawer for seller privacy
  const drawerItems = selectedOrder
    ? mode === "seller" && sellerId
      ? (selectedOrder.items || []).filter(
          (item) => (item.sellerId || item.seller_id) === sellerId
        )
      : selectedOrder.items || []
    : [];

  const drawerTotalAmount = selectedOrder
    ? mode === "seller" && sellerId
      ? drawerItems.reduce(
          (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
          0
        )
      : selectedOrder.totalAmount
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {mode === "admin" ? "Platform Orders" : "Orders & Fulfillment"}
            </h1>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
              {mode === "admin" ? "Master View" : "Store Desk"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {mode === "admin"
              ? "Inspect and track customer orders across all marketplace sellers."
              : "Manage customer orders placed for your products. Track progress from workshop to delivery."}
          </p>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-5">
        <div className="bg-card border-border rounded-2xl border p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
              Total Orders
            </span>
            <Package className="text-muted-foreground h-4 w-4" />
          </div>
          <p className="text-foreground mt-1.5 text-2xl font-bold">{totalCount}</p>
          <span className="text-muted-foreground text-[11px]">All recorded</span>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
              To Fulfill
            </span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-1.5 text-2xl font-bold text-amber-700">
            {placedCount + processingCount}
          </p>
          <span className="text-[11px] text-amber-700">Needs action</span>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
              In Transit
            </span>
            <Truck className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-1.5 text-2xl font-bold text-purple-700">{shippedCount}</p>
          <span className="text-[11px] text-purple-700">Shipped with courier</span>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">Delivered</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1.5 text-2xl font-bold text-emerald-700">{deliveredCount}</p>
          <span className="text-[11px] text-emerald-700">Completed &amp; paid</span>
        </div>

        <div className="bg-card border-border col-span-2 rounded-2xl border p-4 shadow-2xs sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
              {mode === "seller" ? "Seller Revenue" : "Total Volume"}
            </span>
            <CreditCard className="text-muted-foreground h-4 w-4" />
          </div>
          <p className="text-foreground mt-1.5 text-xl font-bold sm:text-2xl">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
          <span className="text-muted-foreground text-[11px]">Authentic sales</span>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-card border-border flex flex-col justify-between gap-3 rounded-2xl border p-3.5 shadow-2xs md:flex-row md:items-center">
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
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatusTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                  selectedStatusTab === tab.key
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order ID, customer, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/40 border-border text-foreground placeholder-muted-foreground focus:ring-ring focus:bg-card w-full rounded-full border py-2 pr-3 pl-9 text-xs transition-all focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table & Mobile Representation */}
      <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-2xs">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
            <h3 className="text-base font-semibold text-foreground">No orders found</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {orders.length === 0
                ? "When customers purchase your products, orders will appear here."
                : "No orders match your search query or status filter."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted\/40/70 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">Order ID &amp; Date</th>
                    <th className="px-4 py-3">Customer &amp; City</th>
                    <th className="px-4 py-3">Products</th>
                    {mode === "admin" && (
                      <th className="px-4 py-3">Seller Attribution</th>
                    )}
                    <th className="px-4 py-3">Total Amount</th>
                    <th className="px-4 py-3">Status &amp; Tracking</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border\/70">
                  {filteredOrders.map((order) => {
                    const items = order.items || [];
                    const displayedItems =
                      mode === "seller" && sellerId
                        ? items.filter((i) => (i.sellerId || i.seller_id) === sellerId)
                        : items;

                    const status = (order.status || "placed").toLowerCase();
                    const badgeClass =
                      statusBadges[status] ||
                      "bg-muted text-foreground border-border";

                    return (
                      <tr
                        key={order.id}
                        onClick={() => handleOpenOrder(order)}
                        className="cursor-pointer transition-colors hover:bg-muted\/40/60"
                      >
                        <td className="px-4 py-3.5 font-mono font-semibold text-foreground">
                          <div>{order.id}</div>
                          <div className="mt-0.5 font-sans text-[11px] font-normal text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-foreground">
                            {order.customerName}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{order.shippingAddress?.city || "India"}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            {displayedItems[0]?.image && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={displayedItems[0].image}
                                alt="thumb"
                                className="h-8 w-8 rounded-lg border border-border object-cover"
                              />
                            )}
                            <div className="max-w-[160px] truncate">
                              <span className="block truncate font-medium text-foreground">
                                {displayedItems[0]?.name ||
                                  displayedItems[0]?.product_name ||
                                  "Item"}
                              </span>
                              {displayedItems.length > 1 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{displayedItems.length - 1} more items
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {mode === "admin" && (
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                              {displayedItems[0]?.sellerBusinessName ||
                                "Artisan Workshop"}
                            </span>
                          </td>
                        )}

                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-foreground">
                            ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                          </span>
                          <div className="text-[10px] font-medium text-muted-foreground uppercase">
                            {order.paymentMethod || "COD"}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${badgeClass}`}
                          >
                            {order.status}
                          </span>
                          {order.trackingNumber && (
                            <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                              AWB: {order.trackingNumber}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-foreground"
                          >
                            <span>Manage</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (<640px) */}
            <div className="divide-y divide-border\/70 sm:hidden">
              {filteredOrders.map((order) => {
                const items = order.items || [];
                const displayedItems =
                  mode === "seller" && sellerId
                    ? items.filter((i) => (i.sellerId || i.seller_id) === sellerId)
                    : items;

                const status = (order.status || "placed").toLowerCase();
                const badgeClass =
                  statusBadges[status] || "bg-muted text-foreground border-border";

                return (
                  <div
                    key={order.id}
                    onClick={() => handleOpenOrder(order)}
                    className="space-y-2.5 p-4 transition-colors active:bg-muted\/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {order.id}
                      </span>
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${badgeClass}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="block font-semibold text-foreground">
                          {order.customerName}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {order.shippingAddress?.city || "India"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-foreground">
                          ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {order.paymentMethod || "COD"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border\/70 pt-1 text-[11px] text-muted-foreground">
                      <span>
                        {displayedItems.length} item
                        {displayedItems.length !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        Manage <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* SlideOver Drawer for Order Details and Status Transition */}
      <SlideOverDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`Order: ${selectedOrder?.id || ""}`}
        description="Fulfillment details, shipment destination, and live tracking history."
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6 pb-8">
            {/* Status & Payment Banner */}
            <div className="flex items-center justify-between rounded-2xl border border-border bg-muted\/40 p-4">
              <div>
                <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Current Status
                </span>
                <span
                  className={`mt-1 inline-block rounded-full border px-3 py-0.5 text-xs font-bold tracking-wider uppercase ${
                    statusBadges[(selectedOrder.status || "placed").toLowerCase()] ||
                    "bg-muted text-foreground"
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              <div className="text-right">
                <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Payment Method
                </span>
                <span className="mt-0.5 block text-sm font-bold text-foreground">
                  {selectedOrder.paymentMethod === "online"
                    ? "Online Payment"
                    : "Cash on Delivery"}{" "}
                  (₹
                  {drawerTotalAmount.toLocaleString("en-IN")})
                </span>
                <span className="text-[10px] font-semibold text-emerald-700">
                  {selectedOrder.status === "delivered"
                    ? "Collected / Paid"
                    : "Collect upon delivery"}
                </span>
              </div>
            </div>

            {/* Error banner if any */}
            {actionError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* ORDER LIFECYCLE ACTION CONTROLS */}
            <div className="space-y-3 rounded-2xl border border-border bg-white p-4">
              <span className="block text-xs font-bold tracking-wider text-foreground uppercase">
                Update Order Lifecycle
              </span>

              <div className="flex flex-wrap gap-2">
                {selectedOrder.status === "placed" && (
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleStatusChange("processing")}
                    className="h-9 rounded-xl bg-blue-600 text-xs text-white hover:bg-blue-700"
                  >
                    <Package className="mr-1.5 h-3.5 w-3.5" /> Start Processing Order
                  </Button>
                )}

                {(selectedOrder.status === "placed" ||
                  selectedOrder.status === "processing") && (
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => setShowShipModal((prev) => !prev)}
                    className="h-9 rounded-xl bg-purple-600 text-xs text-white hover:bg-purple-700"
                  >
                    <Truck className="mr-1.5 h-3.5 w-3.5" /> Mark as Shipped
                  </Button>
                )}

                {selectedOrder.status === "shipped" && (
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleStatusChange("delivered")}
                    className="h-9 rounded-xl bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Confirm Delivery
                  </Button>
                )}

                {selectedOrder.status !== "delivered" &&
                  selectedOrder.status !== "cancelled" && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      onClick={() =>
                        handleStatusChange(
                          "cancelled",
                          undefined,
                          undefined,
                          "Order cancelled by seller"
                        )
                      }
                      className="h-9 rounded-xl border-rose-200 text-xs text-rose-600 hover:bg-rose-50"
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" /> Cancel Order
                    </Button>
                  )}
              </div>

              {/* Courier Input Dialog when Dispatching */}
              {showShipModal && (
                <div className="mt-3 space-y-3 rounded-2xl border border-border bg-muted\/40 p-4">
                  <span className="block text-xs font-semibold text-foreground">
                    Shipment Carrier &amp; Tracking Information:
                  </span>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Courier Partner
                      </Label>
                      <select
                        value={carrierInput}
                        onChange={(e) => setCarrierInput(e.target.value)}
                        className="mt-1 h-9 w-full rounded-xl border border-border bg-white px-2.5 text-xs text-foreground"
                      >
                        <option value="Delhivery">Delhivery</option>
                        <option value="BlueDart">BlueDart Express</option>
                        <option value="DTDC">DTDC</option>
                        <option value="India Post">India Post (Speed Post)</option>
                        <option value="Shadowfax">Shadowfax</option>
                        <option value="Shiprocket">Shiprocket</option>
                        <option value="Other">Other Logistics</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Tracking Number (AWB) *
                      </Label>
                      <input
                        type="text"
                        placeholder="e.g. DL123456789IN"
                        value={trackingNumberInput}
                        onChange={(e) => setTrackingNumberInput(e.target.value)}
                        className="mt-1 h-9 w-full rounded-xl border border-border bg-white px-2.5 font-mono text-xs text-foreground placeholder-zinc-400"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Dispatch Notes (Optional)
                      </Label>
                      <input
                        type="text"
                        placeholder="e.g. Handed over to courier hub"
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        className="mt-1 h-9 w-full rounded-xl border border-border bg-white px-2.5 text-xs text-foreground placeholder-zinc-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-border pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowShipModal(false)}
                      className="h-8 rounded-xl text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      disabled={isPending || !trackingNumberInput.trim()}
                      onClick={() =>
                        handleStatusChange(
                          "shipped",
                          carrierInput,
                          trackingNumberInput.trim(),
                          customNote.trim() || undefined
                        )
                      }
                      className="h-8 rounded-xl bg-purple-600 text-xs text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      Confirm Dispatch
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Customer & Shipping Address */}
            <div className="bg-card border-border space-y-3 rounded-2xl border p-4">
              <span className="text-foreground block text-xs font-bold tracking-wider uppercase">
                Customer &amp; Shipping Destination
              </span>
              <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Recipient
                  </span>
                  <span className="text-foreground font-semibold">
                    {selectedOrder.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Phone
                  </span>
                  <span className="text-foreground font-mono">
                    {selectedOrder.customerPhone ||
                      selectedOrder.shippingAddress?.phone ||
                      "N/A"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Delivery Address
                  </span>
                  <span className="text-muted-foreground">
                    {selectedOrder.shippingAddress?.addressLine},{" "}
                    {selectedOrder.shippingAddress?.city},{" "}
                    {selectedOrder.shippingAddress?.state} -{" "}
                    {selectedOrder.shippingAddress?.pincode}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Products (Scoped to Seller) */}
            <div className="bg-card border-border space-y-3 rounded-2xl border p-4">
              <span className="text-foreground block text-xs font-bold tracking-wider uppercase">
                Store Products ({drawerItems.length})
              </span>
              <div className="divide-border/60 divide-y">
                {drawerItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2.5 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {item.image && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.image}
                          alt="product"
                          className="border-border h-10 w-10 rounded-xl border object-cover"
                        />
                      )}
                      <div>
                        <span className="text-foreground block font-semibold">
                          {item.name || item.product_name || "Product"}
                        </span>
                        {item.variantName && (
                          <span className="text-muted-foreground block text-[10px]">
                            Variant: {item.variantName} ({item.variantValue})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-foreground block font-semibold">
                        ₹
                        {((item.price || 0) * (item.quantity || 1)).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                      <span className="text-muted-foreground text-[10px]">
                        Qty: {item.quantity || 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking History Events */}
            <div className="bg-card border-border space-y-3 rounded-2xl border p-4">
              <span className="text-foreground block text-xs font-bold tracking-wider uppercase">
                Fulfillment Timeline
              </span>
              <div className="space-y-3">
                {(selectedOrder.trackingEvents || []).map((event, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <div className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground font-semibold">
                          {event.title}
                        </span>
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {new Date(event.timestamp).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-muted-foreground mt-0.5 text-[11px]">
                          {event.description}
                        </p>
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
