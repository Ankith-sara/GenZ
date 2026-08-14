"use client";

import React, { useState } from "react";
import { PageHeader } from "@genz/ui";
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

  // Security & Protection
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

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  accentColor?: "black" | "rose";
}

function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  accentColor = "black",
}: ToggleSwitchProps) {
  const activeBg = accentColor === "rose" ? "bg-rose-600" : "bg-black";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${checked ? activeBg : "bg-neutral-200"}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

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
    if (confirm("Reset all platform settings to default values?")) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem("genz_admin_system_settings");
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="font-graphik space-y-6">
      <PageHeader
        title="Platform Settings"
        description="Manage storefront details, seller registration rules, platform security, and notification preferences."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Settings" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 text-xs font-semibold text-neutral-800 shadow-2xs transition-colors hover:border-neutral-400 hover:bg-neutral-100 focus:ring-2 focus:ring-black focus:ring-offset-1 focus:outline-none"
            >
              <RotateCcw className="h-3.5 w-3.5 text-neutral-700" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-black px-4 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-neutral-800 focus:ring-2 focus:ring-black focus:ring-offset-1 focus:outline-none disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5 text-white" />
              <span>{isSaving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        }
      />

      {savedSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-900 shadow-2xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">System settings updated successfully.</span>
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
              <span>Active Admin</span>
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
                  General Platform Details
                </h3>
                <p className="text-xs text-[#73736E]">
                  Manage your platform name, customer support contact email, and default
                  tax rates.
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
                    Locked to Indian Rupee (INR) for compliance with Indian tax & trade
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
                  Seller Verification Rules
                </h3>
                <p className="text-xs text-[#73736E]">
                  Set verification rules and document requirements for sellers
                  registering on the platform.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-[#F0F0EC]">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      Require GST Verification
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Verify 15-character GSTIN details for all new seller
                      registrations.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.requireGstVerification}
                    onChange={(checked) =>
                      handleChange("requireGstVerification", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      Require Physical Factory Address
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Mandate registered factory location details and pincode from
                      manufacturers.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.requireFactoryAddress}
                    onChange={(checked) =>
                      handleChange("requireFactoryAddress", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      Auto-Approve Seller Registrations
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Automatically grant verified status to new sellers without manual
                      admin review.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.autoApproveSellers}
                    onChange={(checked) => handleChange("autoApproveSellers", checked)}
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
                  Security & Platform Protection
                </h3>
                <p className="text-xs text-[#73736E]">
                  Manage platform security settings, access controls, and protection
                  rules.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-[#F0F0EC]">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      Core Database Data Shield
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Automated isolation guard protecting user profiles and preventing
                      unauthorized database access.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                    ACTIVE (PROTECTED)
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      Spam & Abuse Protection
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Automatically block rapid requests, repeated login attempts, and
                      automated spam.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.rateLimitingEnabled}
                    onChange={(checked) => handleChange("rateLimitingEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      Require Two-Factor Authentication (2FA) for Admins
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Require a secondary verification code for all admin team members
                      signing into the portal.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.forceAdmin2FA}
                    onChange={(checked) => handleChange("forceAdmin2FA", checked)}
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-rose-600">
                      Storefront Maintenance Mode
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Temporarily pause public buyer browsing and display a friendly
                      maintenance notice on the storefront.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.maintenanceMode}
                    onChange={(checked) => handleChange("maintenanceMode", checked)}
                    accentColor="rose"
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
                  Notification & Email Preferences
                </h3>
                <p className="text-xs text-[#73736E]">
                  Choose which platform updates and buyer inquiries trigger instant
                  email alerts.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-[#F0F0EC]">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      New Buyer Inquiry Alerts
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Receive immediate email notifications whenever a buyer submits a
                      product inquiry.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.notifyNewInquiry}
                    onChange={(checked) => handleChange("notifyNewInquiry", checked)}
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      New Seller Application Alerts
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Notify the admin team when a seller submits their verification
                      documents for review.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.notifyNewSellerSignup}
                    onChange={(checked) =>
                      handleChange("notifyNewSellerSignup", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A18]">
                      Daily Performance Digest
                    </h4>
                    <p className="text-[11px] text-[#73736E]">
                      Receive a daily summary email with seller applications, catalog
                      updates, and key metrics.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.dailySummaryDigest}
                    onChange={(checked) => handleChange("dailySummaryDigest", checked)}
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
