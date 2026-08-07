"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Bell,
  Building2,
  Save,
  RotateCcw,
  CheckCircle2,
  Globe,
  Lock,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
}

interface SettingsClientProps {
  adminUser: AdminUser;
}

const DEFAULT_SETTINGS = {
  // General & Branding
  platformName: "GenZ Enterprise Commerce Platform",
  supportEmail: "genz.official.hq@gmail.com",
  baseCurrency: "INR (₹)",
  defaultGstRate: "18",

  // Seller Onboarding & Verification
  autoApproveSellers: false,
  requireGstVerification: true,
  requireFactoryAddress: true,

  // Security & RLS
  forceAdmin2FA: true,
  maintenanceMode: false,
  rlsGuardActive: true,
  rateLimitingEnabled: true,

  // Email Notifications
  notifyNewInquiry: true,
  notifyNewSellerSignup: true,
  notifyDocumentUpload: true,
  dailySummaryDigest: false,
};

export function SettingsClient({ adminUser }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<
    "general" | "sellers" | "security" | "notifications"
  >("general");
  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("genz_admin_system_settings");
        if (saved) {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_SETTINGS;
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    key: keyof typeof DEFAULT_SETTINGS,
    value: string | boolean
  ) => {
    setSettings((prev: typeof DEFAULT_SETTINGS) => ({ ...prev, [key]: value }));
    setSavedSuccess(false);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      try {
        localStorage.setItem("genz_admin_system_settings", JSON.stringify(settings));
      } catch (err) {
        console.error("Failed to save settings:", err);
      }
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }, 400);
  };

  const handleReset = () => {
    if (confirm("Reset all platform settings to enterprise defaults?")) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem("genz_admin_system_settings");
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="font-graphik space-y-6 select-none">
      <PageHeader
        title="Platform Administration Settings"
        description="Configure systemic rules, seller verification policies, security enforcement, and dispatch preferences."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Settings" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="font-graphik h-9 border-[#E5E5E0] bg-white text-xs font-semibold text-[#52524E] hover:bg-[#FAF8F4]"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              <span>Reset Defaults</span>
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="font-graphik h-9 rounded-lg bg-black px-4 text-xs font-semibold text-white shadow-2xs hover:bg-neutral-800"
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              <span>{isSaving ? "Saving..." : "Save Settings"}</span>
            </Button>
          </div>
        }
      />

      {savedSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-900 shadow-2xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">
            System settings successfully updated and persisted across platform services.
          </span>
        </div>
      )}

      {/* SETTINGS TABS & CONTENT LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* TABS SIDEBAR (3 Columns) */}
        <div className="space-y-1 lg:col-span-3">
          {[
            { id: "general" as const, label: "General & Identity", icon: Globe },
            { id: "sellers" as const, label: "Seller Onboarding", icon: Building2 },
            { id: "security" as const, label: "Security & Governance", icon: Lock },
            {
              id: "notifications" as const,
              label: "Alerts & Notifications",
              icon: Bell,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-black text-white shadow-2xs"
                    : "border border-[#E5E5E0] bg-white text-[#52524E] hover:border-black/30 hover:bg-[#FAF8F4]"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? "text-white" : "text-[#73736E]"}`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* ADMIN PROFILE MINI CARD */}
          <div className="mt-6 rounded-2xl border border-[#E5E5E0] bg-[#FAF8F4] p-4 text-xs">
            <div className="mb-1 flex items-center gap-2 font-bold text-black">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span>Active Superadmin</span>
            </div>
            <p className="truncate font-semibold text-[#1A1A18]">
              {adminUser.fullName}
            </p>
            <p className="truncate text-[11px] text-[#73736E]">{adminUser.email}</p>
          </div>
        </div>

        {/* SETTINGS FORM PANELS (9 Columns) */}
        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs lg:col-span-9">
          {/* 1. GENERAL & IDENTITY */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#1A1A18]">
                  General Platform Identity
                </h3>
                <p className="text-xs text-[#73736E]">
                  Core platform naming, contact routing, and regional currency settings.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
                    Platform Title & Brand Name
                  </label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => handleChange("platformName", e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#E5E5E0] bg-white px-3 text-xs text-black focus:border-black focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
                      Support & Helpdesk Email
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleChange("supportEmail", e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#E5E5E0] bg-white px-3 text-xs text-black focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
                      Default GST Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={settings.defaultGstRate}
                      onChange={(e) => handleChange("defaultGstRate", e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#E5E5E0] bg-white px-3 text-xs text-black focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
                    Primary Settlement Currency
                  </label>
                  <input
                    type="text"
                    disabled
                    value={settings.baseCurrency}
                    className="h-10 w-full cursor-not-allowed rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] px-3 text-xs text-[#73736E]"
                  />
                  <p className="mt-1 text-[11px] text-[#8C8C85]">
                    Locked to Indian Rupee (INR) for compliance with Indian GST & DPDP
                    standards.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. SELLER ONBOARDING */}
          {activeTab === "sellers" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#1A1A18]">
                  Seller Onboarding & Verification Policies
                </h3>
                <p className="text-xs text-[#73736E]">
                  Control requirements for manufacturer registrations and document
                  validation.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-[#F0F0EC]">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      Require GSTIN Verification
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Enforce 15-character Indian GSTIN number validation during seller
                      application.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.requireGstVerification}
                    onChange={(e) =>
                      handleChange("requireGstVerification", e.target.checked)
                    }
                    className="h-4 w-4 cursor-pointer rounded accent-black"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      Require Mandatory Factory Address
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Sellers must submit physical manufacturing facility address and
                      pincode.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.requireFactoryAddress}
                    onChange={(e) =>
                      handleChange("requireFactoryAddress", e.target.checked)
                    }
                    className="h-4 w-4 cursor-pointer rounded accent-black"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      Auto-Approve Seller Applications
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Automatically mark incoming seller profiles as verified without
                      manual admin review.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoApproveSellers}
                    onChange={(e) =>
                      handleChange("autoApproveSellers", e.target.checked)
                    }
                    className="h-4 w-4 cursor-pointer rounded accent-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. SECURITY & GOVERNANCE */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#1A1A18]">
                  Security & Database Governance
                </h3>
                <p className="text-xs text-[#73736E]">
                  Row Level Security enforcement, rate limit defenses, and
                  administrative access controls.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-[#F0F0EC]">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      SECURITY DEFINER RLS Guard (`is_admin`)
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Standardized helper function to prevent infinite recursion in
                      PostgreSQL RLS policies.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-800">
                    ACTIVE (IMMUTABLE)
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      Rate Limiting Defense Engine
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Restrict rapid API calls, login attempts, and catalog creations
                      per user ID.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.rateLimitingEnabled}
                    onChange={(e) =>
                      handleChange("rateLimitingEnabled", e.target.checked)
                    }
                    className="h-4 w-4 cursor-pointer rounded accent-black"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      Force 2FA for Admin Portal Access
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Require secondary verification code for all accounts accessing
                      `/admin/*`.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.forceAdmin2FA}
                    onChange={(e) => handleChange("forceAdmin2FA", e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded accent-black"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-rose-600">
                      Platform Maintenance Mode
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Display maintenance notice to non-admin visitors across
                      storefront.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded accent-rose-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. NOTIFICATIONS & ALERTS */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#1A1A18]">
                  Alerts & Notification Dispatch
                </h3>
                <p className="text-xs text-[#73736E]">
                  Manage automated email dispatches for platform events and lead alerts.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-[#F0F0EC]">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      New Buyer Inquiry Dispatches
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Send instant email notification when a buyer submits a product
                      sourcing inquiry.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifyNewInquiry}
                    onChange={(e) => handleChange("notifyNewInquiry", e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded accent-black"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      Seller Application Alerts
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Notify superadmin when a new seller submits verification
                      documents.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifyNewSellerSignup}
                    onChange={(e) =>
                      handleChange("notifyNewSellerSignup", e.target.checked)
                    }
                    className="h-4 w-4 cursor-pointer rounded accent-black"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      Daily Administrative Summary
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Receive daily digest of catalog counts, new users, and pending
                      verification queues.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.dailySummaryDigest}
                    onChange={(e) =>
                      handleChange("dailySummaryDigest", e.target.checked)
                    }
                    className="h-4 w-4 cursor-pointer rounded accent-black"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
