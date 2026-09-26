"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@genz/ui";
import {
  Save, RotateCcw, CheckCircle2, Percent,
  Clock, Layers, ArrowLeft,
} from "lucide-react";

interface CRMSettingsState {
  // Commission Tiers
  giCertifiedFee: number;
  standardCraftFee: number;
  cooperativeTierFee: number;

  // Sourcing & SLAs
  firstContactSlaHours: number;
  staleLeadExpiryDays: number;
  autoAssignLeads: boolean;
  whatsappAlertsEnabled: boolean;
  giPreVerificationRequired: boolean;

  // Pipeline stages active
  qualificationStageEnabled: boolean;
  sampleReviewStageEnabled: boolean;
  contractAuditStageEnabled: boolean;
}

const DEFAULT_CRM_SETTINGS: CRMSettingsState = {
  giCertifiedFee: 8,
  standardCraftFee: 12,
  cooperativeTierFee: 15,
  firstContactSlaHours: 24,
  staleLeadExpiryDays: 60,
  autoAssignLeads: true,
  whatsappAlertsEnabled: true,
  giPreVerificationRequired: true,
  qualificationStageEnabled: true,
  sampleReviewStageEnabled: true,
  contractAuditStageEnabled: true,
};

export function CRMSettingsClient() {
  const [settings, setSettings] = useState<CRMSettingsState>(DEFAULT_CRM_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_CRM_SETTINGS);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard/crm"
              className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to CRM Dashboard
            </Link>
          </div>
          <PageHeader
            title="CRM Module Configurations & Settings"
            description="Manage commission rates, artisan pipeline stages, automation triggers, and sourcing SLA rules."
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-neutral-500" />
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            Save Changes
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium text-emerald-800 shadow-2xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>CRM Module settings updated successfully. New commission tiers and SLA policies are now active.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Section 1: Artisan Commission & Pricing Tiers */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Percent className="h-4 w-4 text-neutral-600" />
            <h3 className="text-sm font-bold text-neutral-900">Artisan Commission & Fee Structures</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                GI-Certified Master Artisan Take-Rate (%)
              </label>
              <p className="text-[11px] text-neutral-500 mb-1.5">
                Reduced platform fee for verified Geographical Indication holders (e.g., Kondapalli, Pochampally).
              </p>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.giCertifiedFee}
                  onChange={(e) => setSettings({ ...settings, giCertifiedFee: Number(e.target.value) })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs font-semibold text-neutral-400">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Standard Artisan & Weaver Platform Fee (%)
              </label>
              <p className="text-[11px] text-neutral-500 mb-1.5">
                Standard commission rate for registered handicraft and textile makers.
              </p>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.standardCraftFee}
                  onChange={(e) => setSettings({ ...settings, standardCraftFee: Number(e.target.value) })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs font-semibold text-neutral-400">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Handicraft Society & Cooperative Tier (%)
              </label>
              <p className="text-[11px] text-neutral-500 mb-1.5">
                Bulk consignment & state weaving federation processing fee.
              </p>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.cooperativeTierFee}
                  onChange={(e) => setSettings({ ...settings, cooperativeTierFee: Number(e.target.value) })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs font-semibold text-neutral-400">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Sourcing SLAs & Automation Triggers */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Clock className="h-4 w-4 text-neutral-600" />
            <h3 className="text-sm font-bold text-neutral-900">Lead SLAs & Operational Rules</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">First-Contact SLA (Hours)</label>
              <p className="text-[11px] text-neutral-500 mb-1.5">
                Maximum time allowed for a CRM manager to reach out after a lead registers.
              </p>
              <input
                type="number"
                min="1"
                max="168"
                value={settings.firstContactSlaHours}
                onChange={(e) => setSettings({ ...settings, firstContactSlaHours: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Auto-Archive Stale Leads Threshold (Days)
              </label>
              <p className="text-[11px] text-neutral-500 mb-1.5">
                Automatically mark inactive artisan inquiries as stale if no activity occurs.
              </p>
              <input
                type="number"
                min="7"
                max="365"
                value={settings.staleLeadExpiryDays}
                onChange={(e) => setSettings({ ...settings, staleLeadExpiryDays: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-neutral-100 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-neutral-800">Auto-Assign Inbound Leads</div>
                  <div className="text-[11px] text-neutral-500">
                    Round-robin assign new leads to available CRM Managers
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoAssignLeads}
                  onChange={(e) => setSettings({ ...settings, autoAssignLeads: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-neutral-800">WhatsApp Notification Dispatch</div>
                  <div className="text-[11px] text-neutral-500">
                    Send instant welcome & verification templates via WhatsApp Business API
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.whatsappAlertsEnabled}
                  onChange={(e) => setSettings({ ...settings, whatsappAlertsEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Active CRM Pipeline Stages */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Layers className="h-4 w-4 text-neutral-600" />
            <h3 className="text-sm font-bold text-neutral-900">Configured Pipeline Stages & Audits</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-900">Lead Qualification</span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  Required
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Initial phone triage, craft authentication, and region mapping.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-900">Sample Physical Review</span>
                <input
                  type="checkbox"
                  checked={settings.sampleReviewStageEnabled}
                  onChange={(e) => setSettings({ ...settings, sampleReviewStageEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </div>
              <p className="text-[11px] text-neutral-500">
                Physical sample dispatched to regional fulfillment center for quality audit.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-900">Contract & GI Verification</span>
                <input
                  type="checkbox"
                  checked={settings.contractAuditStageEnabled}
                  onChange={(e) => setSettings({ ...settings, contractAuditStageEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </div>
              <p className="text-[11px] text-neutral-500">
                Legal agreement execution, GI tag certificates, and payout bank verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
