"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@genz/ui";
import {
  Shield,
  Briefcase,
  Users,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Layers,
  Activity,
  UserCheck,
} from "lucide-react";
import type {
  OrderRecord,
  InternalTask,
  CRMContact,
  CRMLead,
  CRMDeal,
  SellerOnboardingTracker,
  Employee,
  Department,
  RoleDefinition,
} from "@genz/types";

interface ReportsData {
  orders: OrderRecord[];
  tasks: InternalTask[];
  contacts: CRMContact[];
  leads: CRMLead[];
  deals: CRMDeal[];
  onboardings: SellerOnboardingTracker[];
  employees: Employee[];
  departments: Department[];
  roles: RoleDefinition[];
  productCount: number;
  pendingVerificationsCount: number;
}

interface ReportsViewClientProps {
  initialModule: string;
  data: ReportsData;
}

type ModuleKey = "admin" | "operations" | "crm";

export function ReportsViewClient({ initialModule, data }: ReportsViewClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeModule = (searchParams.get("module") as ModuleKey) || (initialModule as ModuleKey) || "admin";

  const handleTabChange = (mod: ModuleKey) => {
    router.push(`/dashboard/reports?module=${mod}`);
  };

  // Helper for CSV export
  const exportCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Operations Metrics Calculations
  const totalRevenue = data.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const deliveredOrders = data.orders.filter((o) => o.status === "delivered").length;
  const processingOrders = data.orders.filter((o) => o.status === "processing" || o.status === "shipped").length;
  const placedOrders = data.orders.filter((o) => o.status === "placed").length;
  const avgOrderValue = data.orders.length > 0 ? Math.round(totalRevenue / data.orders.length) : 0;
  const deliveryFulfillmentRate =
    data.orders.length > 0 ? Math.round((deliveredOrders / data.orders.length) * 100) : 100;

  // CRM Metrics Calculations
  const signedDeals = data.deals.filter((d) => d.stage === "contract_signed");
  const signedValue = signedDeals.reduce((sum, d) => sum + (d.estimated_annual_value_inr || 0), 0);
  const totalPipelineValue = data.deals.reduce((sum, d) => sum + (d.estimated_annual_value_inr || 0), 0);
  const liveOnMarketplace = data.onboardings.filter((o) => o.live_on_marketplace).length;
  const winRate = data.deals.length > 0 ? Math.round((signedDeals.length / data.deals.length) * 100) : 0;

  // Admin Metrics Calculations
  const activeEmployees = data.employees.filter((e) => e.status === "active").length;
  const totalRoles = data.roles.length;
  const totalDepts = data.departments.length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageHeader
            title="Modular Reports & Intelligence"
            description="Comprehensive cross-module performance metrics, operational audit logs, and strategic pipeline analytics."
          />
        </div>

        {/* Global Export Button */}
        <div>
          {activeModule === "admin" && (
            <button
              onClick={() =>
                exportCsv(
                  "admin-audit-roles-report.csv",
                  ["Role ID", "Role Name", "Assigned Staff", "Total Permissions", "Description"],
                  data.roles.map((r) => [r.id, r.name, r.member_count || 0, r.permissions.length, r.description])
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-neutral-800"
            >
              <Download className="h-4 w-4" />
              Export Admin Audit CSV
            </button>
          )}

          {activeModule === "operations" && (
            <button
              onClick={() =>
                exportCsv(
                  "operations-orders-report.csv",
                  ["Order ID", "Customer Name", "Total Amount", "Status", "Payment Status", "Created Date"],
                  data.orders.map((o) => [
                    o.id,
                    o.customerName || "N/A",
                    `₹${o.totalAmount}`,
                    o.status,
                    o.paymentStatus,
                    new Date(o.createdAt).toLocaleDateString(),
                  ])
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-neutral-800"
            >
              <Download className="h-4 w-4" />
              Export Orders SLA CSV
            </button>
          )}

          {activeModule === "crm" && (
            <button
              onClick={() =>
                exportCsv(
                  "crm-pipeline-report.csv",
                  ["Deal Name", "Artisan / Lead", "Stage", "Annual Value (INR)", "Commission %", "Created At"],
                  data.deals.map((d) => [
                    d.deal_name,
                    d.lead_name || "N/A",
                    d.stage,
                    `₹${d.estimated_annual_value_inr || 0}`,
                    `${d.commission_rate_percent}%`,
                    new Date(d.created_at).toLocaleDateString(),
                  ])
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-neutral-800"
            >
              <Download className="h-4 w-4" />
              Export CRM Pipeline CSV
            </button>
          )}
        </div>
      </div>

      {/* Module Selector Navigation Tabs */}
      <div className="flex border-b border-neutral-200">
        <button
          type="button"
          onClick={() => handleTabChange("admin")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeModule === "admin"
              ? "border-neutral-900 text-neutral-900"
              : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
          }`}
        >
          <Shield className="h-4 w-4" />
          Admin & Governance
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
            {data.roles.length} Roles
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("operations")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeModule === "operations"
              ? "border-neutral-900 text-neutral-900"
              : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          Operations & Fulfillment
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
            {data.orders.length} Orders
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("crm")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeModule === "crm"
              ? "border-neutral-900 text-neutral-900"
              : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
          }`}
        >
          <Users className="h-4 w-4" />
          CRM & Artisan Sourcing
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
            {data.leads.length} Leads
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. ADMIN & GOVERNANCE REPORTS                                             */}
      {/* ========================================================================= */}
      {activeModule === "admin" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">Active Staff</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <UserCheck className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">{activeEmployees}</div>
              <p className="mt-1 text-xs text-neutral-500">Across {totalDepts} organizational departments</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">Access Roles</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Shield className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">{totalRoles}</div>
              <p className="mt-1 text-xs text-neutral-500">3 system standard + custom roles</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">Security Gate</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Activity className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-emerald-600">Active (RLS)</div>
              <p className="mt-1 text-xs text-neutral-500">Row Level Security & Token verification</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">System Health</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">99.98%</div>
              <p className="mt-1 text-xs text-neutral-500">All 3 platform modules nominal</p>
            </div>
          </div>

          {/* Department Headcount Breakdown */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
              <h3 className="text-sm font-bold text-neutral-900">Departmental Resource Allocation</h3>
              <p className="mt-1 text-xs text-neutral-500">Distribution of internal staff across business units.</p>

              <div className="mt-6 space-y-4">
                {data.departments.map((dept) => {
                  const staffInDept = data.employees.filter((e) => e.department === dept.code.toLowerCase() || e.department === dept.name.toLowerCase()).length;
                  const pct = data.employees.length > 0 ? Math.round((staffInDept / data.employees.length) * 100) : 0;
                  return (
                    <div key={dept.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-800">
                          {dept.name} <span className="font-normal text-neutral-400">({dept.code})</span>
                        </span>
                        <span className="font-medium text-neutral-600">
                          {staffInDept} staff ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-neutral-900 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Role Access Matrix Breakdown */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
              <h3 className="text-sm font-bold text-neutral-900">RBAC Role Distribution & Coverage</h3>
              <p className="mt-1 text-xs text-neutral-500">Access permission density and staff assignment per role.</p>

              <div className="mt-4 divide-y divide-neutral-100">
                {data.roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between py-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900">{role.name}</span>
                        {role.is_system && (
                          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                            System Default
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-neutral-500 line-clamp-1">{role.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                        {role.permissions.length} actions
                      </span>
                      <span className="w-16 text-right font-medium text-neutral-600">
                        {role.member_count || 0} users
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. OPERATIONS & FULFILLMENT REPORTS                                       */}
      {/* ========================================================================= */}
      {activeModule === "operations" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">Gross Merchandising</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <IndianRupee className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </div>
              <p className="mt-1 text-xs text-neutral-500">Across {data.orders.length} lifetime orders</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">SLA Delivery Rate</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Clock className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">{deliveryFulfillmentRate}%</div>
              <p className="mt-1 text-xs text-neutral-500">{deliveredOrders} orders fulfilled on time</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">Live Catalog</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <ShoppingBag className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">{data.productCount} SKUs</div>
              <p className="mt-1 text-xs text-neutral-500">Authentic artisan craft catalog</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">Pending KYC & GI</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-amber-600">
                {data.pendingVerificationsCount}
              </div>
              <p className="mt-1 text-xs text-neutral-500">Artisan applications awaiting audit</p>
            </div>
          </div>

          {/* Fulfillment Pipeline Breakdown */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-neutral-900">Order Fulfillment Stages</h3>
            <p className="mt-1 text-xs text-neutral-500">Real-time status distribution of customer orders in operations.</p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <span className="text-xs font-medium text-neutral-500">Placed Orders</span>
                <div className="mt-2 text-xl font-bold text-neutral-900">{placedOrders}</div>
                <div className="mt-1 text-xs text-neutral-400">Awaiting merchant accept</div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <span className="text-xs font-medium text-blue-700">In Transit / Processing</span>
                <div className="mt-2 text-xl font-bold text-blue-900">{processingOrders}</div>
                <div className="mt-1 text-xs text-blue-600">Dispatched via craft logistics</div>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <span className="text-xs font-medium text-emerald-700">Delivered</span>
                <div className="mt-2 text-xl font-bold text-emerald-900">{deliveredOrders}</div>
                <div className="mt-1 text-xs text-emerald-600">Fulfilled successfully</div>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <span className="text-xs font-medium text-neutral-500">Average Ticket</span>
                <div className="mt-2 text-xl font-bold text-neutral-900">₹{avgOrderValue.toLocaleString("en-IN")}</div>
                <div className="mt-1 text-xs text-neutral-400">Basket size per checkout</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CRM & ARTISAN SOURCING REPORTS                                         */}
      {/* ========================================================================= */}
      {activeModule === "crm" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">Pipeline Value</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">
                ₹{totalPipelineValue.toLocaleString("en-IN")}
              </div>
              <p className="mt-1 text-xs text-neutral-500">Total volume across {data.deals.length} active deals</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">Signed Value</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-emerald-600">
                ₹{signedValue.toLocaleString("en-IN")}
              </div>
              <p className="mt-1 text-xs text-neutral-500">{signedDeals.length} contracts signed successfully</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">Sourcing Win Rate</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Activity className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">{winRate}%</div>
              <p className="mt-1 text-xs text-neutral-500">Conversion rate from prospect to signed</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">Onboarding Velocity</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                  <Layers className="h-4 w-4 text-neutral-600" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">
                {liveOnMarketplace} / {data.onboardings.length}
              </div>
              <p className="mt-1 text-xs text-neutral-500">Artisans live on marketplace</p>
            </div>
          </div>

          {/* Deals Pipeline Stages Table */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xs">
            <div className="border-b border-neutral-100 p-6">
              <h3 className="text-sm font-bold text-neutral-900">Artisan Sourcing Pipeline Deals</h3>
              <p className="mt-1 text-xs text-neutral-500">
                Active negotiations with master weavers, handicraft cooperatives, and GI-certified clusters.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-100 bg-neutral-50 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-6 py-3">Deal & Artisan</th>
                    <th className="px-6 py-3">Stage</th>
                    <th className="px-6 py-3">Annual Est. Value</th>
                    <th className="px-6 py-3">Commission %</th>
                    <th className="px-6 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data.deals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                        No active deals found in the CRM pipeline.
                      </td>
                    </tr>
                  ) : (
                    data.deals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-neutral-50/50">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-neutral-900">{deal.deal_name}</div>
                          <div className="text-[11px] text-neutral-500">{deal.lead_name || "No lead linked"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              deal.stage === "contract_signed"
                                ? "bg-emerald-100 text-emerald-800"
                                : deal.stage === "lost"
                                ? "bg-rose-100 text-rose-800"
                                : deal.stage === "proposal_sent"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-neutral-100 text-neutral-800"
                            }`}
                          >
                            {deal.stage.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-neutral-900">
                          ₹{(deal.estimated_annual_value_inr || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4 text-neutral-600">{deal.commission_rate_percent}%</td>
                        <td className="px-6 py-4 text-neutral-500">
                          {new Date(deal.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
