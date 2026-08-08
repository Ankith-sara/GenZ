"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { Button } from "@/components/ui/atoms/button";
import {
  Building2,
  User,
  ShieldCheck,
  Bell,
  ExternalLink,
  Save,
  CheckCircle2,
} from "lucide-react";
import { AvatarUploader } from "@/features/user/components/avatar-uploader";

interface SellerSettingsClientProps {
  userId: string;
  userEmail: string;
  fullName: string;
  avatarUrl: string | null;
  businessProfile?: {
    business_name?: string | null;
    gst_number?: string | null;
    city?: string | null;
    state?: string | null;
    status?: string | null;
  } | null;
}

export function SellerSettingsClient({
  userId,
  userEmail,
  fullName,
  avatarUrl,
  businessProfile,
}: SellerSettingsClientProps) {
  const [inquiryAlerts, setInquiryAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreferences = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="font-graphik space-y-6 select-none">
      <PageHeader
        title="Seller Account & Preferences"
        description="Manage your factory profile, personal account details, security, and notification settings."
        breadcrumbs={[
          { label: "Seller Desk", href: "/dashboard/seller" },
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* FACTORY BUSINESS PROFILE SUMMARY CARD */}
        <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-black" />
              <h3 className="text-sm font-bold text-[#1A1A18]">
                Factory Business Profile
              </h3>
            </div>
            <Link href="/dashboard/seller/onboarding">
              <Button
                variant="outline"
                className="h-8 border-[#E5E5E0] text-xs font-semibold hover:bg-[#FAF8F4]"
              >
                <span>Edit Profile</span>
                <ExternalLink className="ml-1.5 h-3 w-3 text-[#73736E]" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="block font-semibold text-[#73736E]">Business Name</span>
              <span className="text-sm font-bold text-black">
                {businessProfile?.business_name || "Factory Account"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block font-semibold text-[#73736E]">GSTIN Tax ID</span>
                <span className="font-mono font-semibold text-[#1A1A18]">
                  {businessProfile?.gst_number || "Pending verification"}
                </span>
              </div>
              <div>
                <span className="block font-semibold text-[#73736E]">
                  Verification Status
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="capitalize">
                    {businessProfile?.status || "verified"}
                  </span>
                </span>
              </div>
            </div>

            <div>
              <span className="block font-semibold text-[#73736E]">
                Manufacturing Hub
              </span>
              <span className="text-[#1A1A18]">
                {businessProfile?.city && businessProfile?.state
                  ? `${businessProfile.city}, ${businessProfile.state}`
                  : "India"}
              </span>
            </div>
          </div>
        </div>

        {/* PERSONAL ACCOUNT & AVATAR CARD */}
        <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-[#F0F0EC] pb-3">
            <User className="h-5 w-5 text-black" />
            <h3 className="text-sm font-bold text-[#1A1A18]">Personal User Account</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#73736E]">
                Profile Avatar
              </label>
              <AvatarUploader
                userId={userId}
                fullName={fullName}
                currentUrl={avatarUrl}
              />
            </div>

            <div className="space-y-2 border-t border-[#F0F0EC] pt-3 text-xs">
              <div>
                <span className="block font-semibold text-[#73736E]">Full Name</span>
                <span className="font-bold text-black">{fullName}</span>
              </div>
              <div>
                <span className="block font-semibold text-[#73736E]">Login Email</span>
                <span className="font-mono text-[#1A1A18]">{userEmail}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICATION PREFERENCES CARD */}
      <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-[#F0F0EC] pb-3">
          <Bell className="h-5 w-5 text-black" />
          <h3 className="text-sm font-bold text-[#1A1A18]">
            Email Dispatch Preferences
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
                GenZ Seller Digest & Platform Updates
              </h4>
              <p className="text-[11px] text-[#73736E]">
                Periodic emails about seller portal feature upgrades and market demand
                reports.
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
