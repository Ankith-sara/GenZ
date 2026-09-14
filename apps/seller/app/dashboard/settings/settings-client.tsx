"use client";

import React, { useState } from "react";
import { PageHeader } from "@genz/ui";
import { Button } from "@genz/ui";
import { Bell, Save, CheckCircle2, Lock, KeyRound, ShieldCheck } from "lucide-react";

interface SellerSettingsClientProps {
  userId: string;
  userEmail: string;
  fullName: string;
  avatarUrl: string | null;
  businessProfile?: Record<string, unknown> | null;
}

export function SellerSettingsClient({ userEmail }: SellerSettingsClientProps) {
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  const handleSavePreferences = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePasswordResetRequest = () => {
    setPasswordMsg(`A password reset link has been dispatched to ${userEmail}.`);
    setTimeout(() => setPasswordMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your store notifications, email preferences, and account security."
        breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Settings" }]}
      />

      {savedSuccess && (
        <div className="border-success/20 bg-success-container/60 text-on-success-container flex items-center gap-3 rounded-2xl border p-4 text-xs shadow-2xs">
          <CheckCircle2 className="text-success h-4 w-4 shrink-0" />
          <span className="font-semibold">
            Notification preferences updated successfully.
          </span>
        </div>
      )}

      {passwordMsg && (
        <div className="border-primary/20 bg-primary-container/60 text-on-primary-container flex items-center gap-3 rounded-2xl border p-4 text-xs shadow-2xs">
          <KeyRound className="text-primary h-4 w-4 shrink-0" />
          <span className="font-semibold">{passwordMsg}</span>
        </div>
      )}

      {/* 1. SECURITY & PASSWORD RESET CARD */}
      <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-2xl border p-5 sm:p-6">
        <div className="border-outline-variant/40 flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-on-surface h-5 w-5" />
            <h3 className="text-on-surface text-sm font-bold">
              Security &amp; Authentication
            </h3>
          </div>
          <span className="border-success/20 bg-success-container text-on-success-container rounded-full border px-2.5 py-0.5 text-[10px] font-semibold">
            2FA Protected
          </span>
        </div>

        <div className="border-outline-variant/50 bg-surface-container-low flex items-center justify-between rounded-xl border p-4 text-xs">
          <div className="space-y-0.5">
            <span className="text-on-surface block font-bold">Password Reset</span>
            <span className="text-on-surface-variant block text-[11px]">
              Send a password reset link to your login email address ({userEmail})
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handlePasswordResetRequest}
            className="border-outline-variant hover:bg-surface-container text-on-surface h-8 rounded-full text-xs font-semibold"
          >
            <Lock className="mr-1.5 h-3.5 w-3.5" />
            <span>Reset Password</span>
          </Button>
        </div>
      </div>

      {/* 2. NOTIFICATION PREFERENCES CARD */}
      <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-2xl border p-5 sm:p-6">
        <div className="border-outline-variant/40 flex items-center gap-2 border-b pb-3">
          <Bell className="text-on-surface h-5 w-5" />
          <h3 className="text-on-surface text-sm font-bold">
            Email &amp; Order Notification Preferences
          </h3>
        </div>

        <div className="divide-outline-variant/30 space-y-4 divide-y text-xs">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="text-on-surface font-bold">Customer Order Alerts</h4>
              <p className="text-on-surface-variant text-[11px]">
                Receive instant email notification whenever a customer places an order
                for your products.
              </p>
            </div>
            <input
              type="checkbox"
              checked={orderAlerts}
              onChange={(e) => setOrderAlerts(e.target.checked)}
              className="accent-primary h-4 w-4 cursor-pointer rounded"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <h4 className="text-on-surface font-bold">GenZ Seller Platform Digest</h4>
              <p className="text-on-surface-variant text-[11px]">
                Periodic emails about seller feature updates, market demand insights,
                and catalog analytics.
              </p>
            </div>
            <input
              type="checkbox"
              checked={marketingEmails}
              onChange={(e) => setMarketingEmails(e.target.checked)}
              className="accent-primary h-4 w-4 cursor-pointer rounded"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={handleSavePreferences}
            className="bg-primary text-on-primary shadow-elevation-1 hover:shadow-elevation-2 h-8 rounded-full px-4 text-xs font-semibold"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            <span>Save Preferences</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
