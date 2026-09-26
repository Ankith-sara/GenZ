"use client";

import Link from "next/link";
import {
  Package,
  ShoppingBag,
  CheckSquare,
  Building2,
  ArrowRight,
  ShieldCheck,
  FileBarChart,
  Settings,
  Truck,
  Clock,
  Sparkles,
} from "lucide-react";
import type { OrderRecord, InternalTask } from "@genz/types";

interface OperationsDashboardClientProps {
  orders: OrderRecord[];
  productCount: number;
  tasks: InternalTask[];
  pendingVerificationsCount: number;
}

export function OperationsDashboardClient({
  orders,
  productCount,
  tasks,
  pendingVerificationsCount,
}: OperationsDashboardClientProps) {
  const pendingOrders = orders.filter(
    (o) => o.status === "placed" || o.status === "processing"
  ).length;
  const shippedOrders = orders.filter((o) => o.status === "shipped").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount ?? 0), 0);

  const activeTasks = tasks.filter((t) => t.status !== "done").length;
  const urgentTasks = tasks.filter((t) => t.priority === "urgent" && t.status !== "done").length;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Module Navigation Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E5E0] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-900">
              Operations Module
            </span>
            <span className="text-xs text-neutral-400">|</span>
            <span className="text-xs font-semibold text-neutral-600">Orders, Products & Logistics Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Operations Module Dashboard
          </h1>
          <p className="text-xs text-neutral-500">
            Real-time fulfillment supervision over customer orders, artisanal catalog SKUs, Kanban sprint tasks, and GI compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/reports?module=operations"
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition-colors"
          >
            <FileBarChart className="h-3.5 w-3.5 text-neutral-500" />
            <span>Operations Reports</span>
          </Link>
          <Link
            href="/dashboard/operations/settings"
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition-colors"
          >
            <Settings className="h-3.5 w-3.5 text-neutral-500" />
            <span>Operations Settings</span>
          </Link>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 transition-colors"
          >
            <Package className="h-3.5 w-3.5 text-[#C89D32]" />
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/orders"
          className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:border-neutral-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Customer Orders</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{orders.length}</span>
            <span className="text-xs font-semibold text-amber-600">{pendingOrders} pending dispatch</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-100 pt-2">
            <span>Fulfillment queue</span>
            <ArrowRight className="h-3 w-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          href="/dashboard/products"
          className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:border-neutral-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Products Catalog</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{productCount}</span>
            <span className="text-xs text-neutral-500">SKUs in catalog</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-100 pt-2">
            <span>Curation & publishing</span>
            <ArrowRight className="h-3 w-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          href="/dashboard/tasks"
          className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:border-neutral-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Internal Kanban Tasks</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{activeTasks}</span>
            <span className="text-xs font-semibold text-red-600">{urgentTasks} urgent</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-100 pt-2">
            <span>Operational workflow</span>
            <ArrowRight className="h-3 w-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          href="/dashboard/verifications"
          className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:border-neutral-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">GI & KYC Audits</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{pendingVerificationsCount}</span>
            <span className="text-xs font-semibold text-purple-700">Verification reviews</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-100 pt-2">
            <span>Artisan GI verification</span>
            <ArrowRight className="h-3 w-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Fulfillment Status & Quick Workflows */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Fulfillment Pipeline */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Order Fulfillment Lifecycle</h2>
                <p className="text-xs text-neutral-500">Live order state tracking and dispatch velocity</p>
              </div>
            </div>
            <Link
              href="/dashboard/orders"
              className="text-xs font-semibold text-neutral-600 hover:text-black flex items-center gap-1"
            >
              <span>View Orders Board &rarr;</span>
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <span className="text-xs font-semibold text-amber-900">Pending & Processing</span>
              <p className="mt-2 text-2xl font-bold text-amber-900">{pendingOrders}</p>
              <p className="mt-1 text-[11px] text-amber-700">Ready for packaging</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
              <span className="text-xs font-semibold text-blue-900">Shipped / In Transit</span>
              <p className="mt-2 text-2xl font-bold text-blue-900">{shippedOrders}</p>
              <p className="mt-1 text-[11px] text-blue-700">Courier assigned</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <span className="text-xs font-semibold text-emerald-900">Delivered</span>
              <p className="mt-2 text-2xl font-bold text-emerald-900">{deliveredOrders}</p>
              <p className="mt-1 text-[11px] text-emerald-700">Completed shipments</p>
            </div>
          </div>

          <div className="mt-6 border-t border-neutral-100 pt-4 flex items-center justify-between text-xs text-neutral-600">
            <span className="flex items-center gap-1.5 font-semibold text-neutral-800">
              <Clock className="h-4 w-4 text-[#C89D32]" />
              Fulfillment SLA: Average 48h Dispatch Time
            </span>
            <span className="font-mono font-bold text-neutral-900">
              Total Volume: ₹{totalRevenue.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Operations Quick Action Links */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
              <Sparkles className="h-4 w-4 text-[#C89D32]" />
              <h3 className="text-sm font-bold text-neutral-900">Operations Module Navigation</h3>
            </div>
            <div className="mt-4 space-y-2.5">
              <Link
                href="/dashboard/orders"
                className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-neutral-800">Customer Orders & Dispatches</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
              </Link>

              <Link
                href="/dashboard/products"
                className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-neutral-800">Product Catalog Management</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
              </Link>

              <Link
                href="/dashboard/tasks"
                className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold text-neutral-800">Operations Kanban Tasks</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
              </Link>

              <Link
                href="/dashboard/verifications"
                className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-semibold text-neutral-800">Seller GI & KYC Audits</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Logistics Config</span>
            <Link
              href="/dashboard/operations/settings"
              className="font-semibold text-neutral-900 hover:underline"
            >
              Configure Operations Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
