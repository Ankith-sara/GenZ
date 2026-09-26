"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@genz/ui";
import {
  Save,
  RotateCcw,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Package,
  Clock,
  ArrowLeft,
} from "lucide-react";

interface OperationsSettingsState {
  // Shipping & SLAs
  standardShippingDays: number;
  expressShippingDays: number;
  maxDispatchHours: number;
  returnWindowDays: number;

  // Courier Partners
  delhiveryEnabled: boolean;
  shiprocketEnabled: boolean;
  indiaPostEnabled: boolean;

  // GI Quality Gate
  requireGiCertificate: boolean;
  physicalQcTagRequired: boolean;
  dualAgentInspectionHighValue: boolean;

  // Inventory
  lowStockThreshold: number;
  autoHideOutOfStock: boolean;
}

const DEFAULT_OPS_SETTINGS: OperationsSettingsState = {
  standardShippingDays: 4,
  expressShippingDays: 2,
  maxDispatchHours: 48,
  returnWindowDays: 7,
  delhiveryEnabled: true,
  shiprocketEnabled: true,
  indiaPostEnabled: true,
  requireGiCertificate: true,
  physicalQcTagRequired: true,
  dualAgentInspectionHighValue: true,
  lowStockThreshold: 5,
  autoHideOutOfStock: false,
};

export function OperationsSettingsClient() {
  const [settings, setSettings] = useState<OperationsSettingsState>(DEFAULT_OPS_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_OPS_SETTINGS);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard/operations"
              className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Operations Dashboard
            </Link>
          </div>
          <PageHeader
            title="Operations Module Configurations & Settings"
            description="Manage logistics courier integrations, fulfillment SLAs, artisan GI compliance gates, and inventory policies."
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
          <span>Operations settings updated successfully. Logistics SLAs and QC inspection gates are now active.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Section 1: Fulfillment & Logistics SLAs */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Clock className="h-4 w-4 text-neutral-600" />
            <h3 className="text-sm font-bold text-neutral-900">Fulfillment & Delivery SLAs</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700">Standard Delivery (Days)</label>
                <p className="text-[11px] text-neutral-500 mb-1.5">Inter-state transit estimate</p>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={settings.standardShippingDays}
                  onChange={(e) => setSettings({ ...settings, standardShippingDays: Number(e.target.value) })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">Express Delivery (Days)</label>
                <p className="text-[11px] text-neutral-500 mb-1.5">Priority courier SLA</p>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={settings.expressShippingDays}
                  onChange={(e) => setSettings({ ...settings, expressShippingDays: Number(e.target.value) })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700">Max Dispatch Window (Hours)</label>
                <p className="text-[11px] text-neutral-500 mb-1.5">Artisan packaging SLA</p>
                <input
                  type="number"
                  min="12"
                  max="120"
                  value={settings.maxDispatchHours}
                  onChange={(e) => setSettings({ ...settings, maxDispatchHours: Number(e.target.value) })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">Return Window (Days)</label>
                <p className="text-[11px] text-neutral-500 mb-1.5">Customer return period</p>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={settings.returnWindowDays}
                  onChange={(e) => setSettings({ ...settings, returnWindowDays: Number(e.target.value) })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Courier & Shipping Integrations */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Truck className="h-4 w-4 text-neutral-600" />
            <h3 className="text-sm font-bold text-neutral-900">Integrated Shipping Carriers</h3>
          </div>

          <div className="space-y-3.5">
            <label className="flex items-center justify-between rounded-xl border border-neutral-100 p-3 hover:bg-neutral-50/50 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-neutral-800">Delhivery Express Surface & Air</div>
                <div className="text-[11px] text-neutral-500">Automated AWB generation & real-time webhook tracking</div>
              </div>
              <input
                type="checkbox"
                checked={settings.delhiveryEnabled}
                onChange={(e) => setSettings({ ...settings, delhiveryEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-neutral-100 p-3 hover:bg-neutral-50/50 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-neutral-800">Shiprocket Direct API</div>
                <div className="text-[11px] text-neutral-500">Multi-courier aggregator for tier-2/3 pincode coverage</div>
              </div>
              <input
                type="checkbox"
                checked={settings.shiprocketEnabled}
                onChange={(e) => setSettings({ ...settings, shiprocketEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-neutral-100 p-3 hover:bg-neutral-50/50 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-neutral-800">India Post Rural Craft Logistics</div>
                <div className="text-[11px] text-neutral-500">Specialized pickup for remote artisan weaving hamlets</div>
              </div>
              <input
                type="checkbox"
                checked={settings.indiaPostEnabled}
                onChange={(e) => setSettings({ ...settings, indiaPostEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
            </label>
          </div>
        </div>

        {/* Section 3: GI Craft Quality Assurance Gate */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <ShieldCheck className="h-4 w-4 text-neutral-600" />
            <h3 className="text-sm font-bold text-neutral-900">GI Quality Gate & Craft Compliance</h3>
          </div>

          <div className="space-y-3.5">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-neutral-800">Enforce GI Certificate Audit</div>
                <div className="text-[11px] text-neutral-500">
                  Block publishing products claiming GI origin until government certificate is audited
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.requireGiCertificate}
                onChange={(e) => setSettings({ ...settings, requireGiCertificate: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-neutral-800">Physical QC Hologram Tagging</div>
                <div className="text-[11px] text-neutral-500">
                  Require artisan to affix serialized tamper-proof hologram before courier dispatch
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.physicalQcTagRequired}
                onChange={(e) => setSettings({ ...settings, physicalQcTagRequired: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-neutral-800">Dual-Agent High-Value Inspection</div>
                <div className="text-[11px] text-neutral-500">
                  Require two Operation Managers to sign off on items valued over ₹10,000
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.dualAgentInspectionHighValue}
                onChange={(e) => setSettings({ ...settings, dualAgentInspectionHighValue: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
            </label>
          </div>
        </div>

        {/* Section 4: Inventory & Stock Policies */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Package className="h-4 w-4 text-neutral-600" />
            <h3 className="text-sm font-bold text-neutral-900">Inventory & Stock Alerts</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Low Stock Alert Threshold (Units)
              </label>
              <p className="text-[11px] text-neutral-500 mb-1.5">
                Trigger operational task notifications when stock falls below this quantity.
              </p>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-neutral-800">Auto-Delist Zero-Stock Items</div>
                  <div className="text-[11px] text-neutral-500">
                    Automatically hide product from public storefront when inventory reaches 0
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoHideOutOfStock}
                  onChange={(e) => setSettings({ ...settings, autoHideOutOfStock: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
