"use client";

import Link from "next/link";
import {
  Users,
  Target,
  Briefcase,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  FileBarChart,
  Settings,
  Plus,
} from "lucide-react";
import type {
  CRMContact,
  CRMLead,
  CRMDeal,
  SellerOnboardingTracker,
} from "@genz/types";

interface CRMDashboardClientProps {
  contacts: CRMContact[];
  leads: CRMLead[];
  deals: CRMDeal[];
  onboardings: SellerOnboardingTracker[];
}

export function CRMDashboardClient({
  contacts,
  leads,
  deals,
  onboardings,
}: CRMDashboardClientProps) {
  const totalPipelineDealsValue = deals.reduce(
    (acc, d) => acc + (d.expected_sku_count ?? 0) * 1500,
    0
  );
  const liveSellers = onboardings.filter((o) => o.live_on_marketplace).length;
  const inKyc = onboardings.filter((o) => !o.kyc_completed).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Module Navigation Header */}
      <div className="flex flex-col gap-4 border-b border-[#E5E5E0] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-900">
              CRM Module
            </span>
            <span className="text-xs text-neutral-400">|</span>
            <span className="text-xs font-semibold text-neutral-600">
              Seller Acquisition & Sourcing Hub
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            CRM Module Dashboard
          </h1>
          <p className="text-xs text-neutral-500">
            Executive oversight over artisan sourcing pipelines, lead conversions,
            deals, and master merchant onboardings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/reports?module=crm"
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs transition-colors hover:bg-neutral-50"
          >
            <FileBarChart className="h-3.5 w-3.5 text-neutral-500" />
            <span>CRM Reports</span>
          </Link>
          <Link
            href="/dashboard/crm/settings"
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs transition-colors hover:bg-neutral-50"
          >
            <Settings className="h-3.5 w-3.5 text-neutral-500" />
            <span>CRM Settings</span>
          </Link>
          <Link
            href="/dashboard/crm/leads"
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-neutral-800"
          >
            <Plus className="h-3.5 w-3.5 text-[#C89D32]" />
            <span>Manage Leads</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/crm/leads"
          className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:border-neutral-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">
              Sourcing Leads
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{leads.length}</span>
            <span className="text-xs font-semibold text-emerald-600">
              Pipeline active
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-[11px] text-neutral-500">
            <span>View artisan leads</span>
            <ArrowRight className="h-3 w-3 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        <Link
          href="/dashboard/crm/contacts"
          className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:border-neutral-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">
              Master Contacts
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">
              {contacts.length}
            </span>
            <span className="text-xs text-neutral-500">Directory</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-[11px] text-neutral-500">
            <span>Cluster contacts</span>
            <ArrowRight className="h-3 w-3 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        <Link
          href="/dashboard/crm/deals"
          className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:border-neutral-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">
              Pipeline Deals
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{deals.length}</span>
            <span className="text-xs text-neutral-500">
              ₹{totalPipelineDealsValue.toLocaleString("en-IN")} est.
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-[11px] text-neutral-500">
            <span>Negotiation stages</span>
            <ArrowRight className="h-3 w-3 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        <Link
          href="/dashboard/crm/onboarding"
          className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:border-neutral-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">
              Seller Onboarding
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
              <ClipboardCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{liveSellers}</span>
            <span className="text-xs font-semibold text-emerald-700">
              Live on Store ({inKyc} in KYC)
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-[11px] text-neutral-500">
            <span>Track onboarding stage</span>
            <ArrowRight className="h-3 w-3 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>

      {/* CRM Funnel Overview and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sourcing Funnel */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">
                  Artisan Sourcing Pipeline Funnel
                </h2>
                <p className="text-xs text-neutral-500">
                  Active status distribution across partner craft clusters
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/reports?module=crm"
              className="flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-black"
            >
              <span>Full Analytics &rarr;</span>
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                <span className="text-neutral-700">Discovery & Cluster Sourcing</span>
                <span className="font-mono text-neutral-900">
                  {leads.filter((l) => l.stage === "discovery").length} leads
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{
                    width: `${Math.min(100, Math.max(15, (leads.filter((l) => l.stage === "discovery").length / Math.max(1, leads.length)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                <span className="text-neutral-700">Catalog Ingestion & GI Audit</span>
                <span className="font-mono text-neutral-900">
                  {leads.filter((l) => l.stage === "catalog_audit").length} leads
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{
                    width: `${Math.min(100, Math.max(15, (leads.filter((l) => l.stage === "catalog_audit").length / Math.max(1, leads.length)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                <span className="text-neutral-700">
                  Commercial Negotiation & Proposal
                </span>
                <span className="font-mono text-neutral-900">
                  {deals.filter((d) => d.stage === "proposal_sent").length} deals
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${Math.min(100, Math.max(15, (deals.filter((d) => d.stage === "proposal_sent").length / Math.max(1, deals.length)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                <span className="text-neutral-700">
                  KYC Verified & Live on Marketplace
                </span>
                <span className="font-mono font-bold text-emerald-700">
                  {liveSellers} onboarded
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${Math.min(100, Math.max(20, (liveSellers / Math.max(1, onboardings.length)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Module Navigation Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
              <Sparkles className="h-4 w-4 text-[#C89D32]" />
              <h3 className="text-sm font-bold text-neutral-900">
                CRM Module Quick Actions
              </h3>
            </div>
            <div className="mt-4 space-y-2.5">
              <Link
                href="/dashboard/crm/leads"
                className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 transition-colors hover:bg-neutral-50"
              >
                <div className="flex items-center gap-2.5">
                  <Target className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-neutral-800">
                    Sourcing Leads Kanban
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
              </Link>

              <Link
                href="/dashboard/crm/contacts"
                className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 transition-colors hover:bg-neutral-50"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold text-neutral-800">
                    Master Artisan Directory
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
              </Link>

              <Link
                href="/dashboard/crm/deals"
                className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 transition-colors hover:bg-neutral-50"
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-neutral-800">
                    Pipeline Deals Tracker
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
              </Link>

              <Link
                href="/dashboard/crm/onboarding"
                className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 transition-colors hover:bg-neutral-50"
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-neutral-800">
                    Seller Onboarding Tracker
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
              </Link>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-500">
            <span>Module Config</span>
            <Link
              href="/dashboard/crm/settings"
              className="font-semibold text-neutral-900 hover:underline"
            >
              Configure CRM Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
