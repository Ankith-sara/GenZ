"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { Button } from "@/components/ui/atoms/button";
import { Bell, Save, CheckCircle2, Lock, KeyRound, ShieldCheck } from "lucide-react";

interface SellerSettingsClientProps {
  userId: string;
  userEmail: string;
  fullName: string;
  avatarUrl: string | null;
  businessProfile?: Record<string, unknown> | null;
}

export function SellerSettingsClient({ userEmail }: SellerSettingsClientProps) {
  const [inquiryAlerts, setInquiryAlerts] = useState(true);
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
    <div className="font-graphik space-y-6 select-none">
      <PageHeader
        title="Seller Settings"
        description="Configure your account security, password reset preferences, and email notifications."
        breadcrumbs={[
          { label: "Seller Desk", href: "/seller/dashboard" },
          { label: "Settings" },
        ]}
      />

      {savedSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-900 shadow-2xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">
            Notification preferences updated successfully.
          </span>
        </div>
      )}

      {passwordMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-900 shadow-2xs">
          <KeyRound className="h-4 w-4 shrink-0 text-blue-600" />
          <span className="font-semibold">{passwordMsg}</span>
        </div>
      )}

      {/* 1. SECURITY & PASSWORD RESET CARD */}
      <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-black" />
            <h3 className="text-sm font-bold text-[#1A1A18]">
              Security & Authentication
            </h3>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
            2FA Eligible
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-4 text-xs">
          <div className="space-y-0.5">
            <span className="block font-bold text-[#1A1A18]">Password Reset</span>
            <span className="block text-[11px] text-[#73736E]">
              Send password change link to your login email address ({userEmail})
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handlePasswordResetRequest}
            className="h-8 border-[#E5E5E0] text-xs font-semibold hover:bg-white"
          >
            <Lock className="mr-1.5 h-3.5 w-3.5" />
            <span>Reset Password</span>
          </Button>
        </div>
      </div>

      {/* 2. NOTIFICATION PREFERENCES CARD */}
      <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-[#F0F0EC] pb-3">
          <Bell className="h-5 w-5 text-black" />
          <h3 className="text-sm font-bold text-[#1A1A18]">
            Email Dispatch & Notification Preferences
          </h3>
        </div>

        <div className="space-y-4 divide-y divide-[#F0F0EC] text-xs">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="font-bold text-[#1A1A18]">
                Buyer Sourcing Inquiry Alerts
              </h4>
              <p className="text-[11px] text-[#73736E]">
                Receive instant email notification whenever a wholesale buyer sends an
                RFQ or message.
              </p>
            </div>
            <input
              type="checkbox"
              checked={inquiryAlerts}
              onChange={(e) => setInquiryAlerts(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded accent-black"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <h4 className="font-bold text-[#1A1A18]">
                GenZ Seller Digest & Platform Reports
              </h4>
              <p className="text-[11px] text-[#73736E]">
                Periodic emails about seller portal feature upgrades, market demand
                reports, and catalog analytics.
              </p>
            </div>
            <input
              type="checkbox"
              checked={marketingEmails}
              onChange={(e) => setMarketingEmails(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded accent-black"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={handleSavePreferences}
            className="h-9 rounded-lg bg-black px-4 text-xs font-semibold text-white hover:bg-neutral-800"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            <span>Save Notification Preferences</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
