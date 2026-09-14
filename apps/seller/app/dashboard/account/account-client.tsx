"use client";

import React, { useState } from "react";
import { PageHeader } from "@genz/ui";
import { Button } from "@genz/ui";
import {
  User,
  Building2,
  Edit3,
  Monitor,
  Apple,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { AvatarUploader } from "@/features/user/components/avatar-uploader";
import { OnboardingForm } from "../onboarding/onboarding-form";
import type { SellerProfile } from "@genz/types";

interface SellerAccountClientProps {
  userId: string;
  userEmail: string;
  fullName: string;
  avatarUrl: string | null;
  sellerProfile: SellerProfile | null;
}

export function SellerAccountClient({
  userId,
  userEmail,
  fullName,
  avatarUrl,
  sellerProfile,
}: SellerAccountClientProps) {
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);

  // Detect real current device from navigator.userAgent
  const [currentDevice] = useState<{
    name: string;
    type: "windows" | "apple" | "android" | "mobile";
    browser: string;
  }>(() => {
    if (typeof window === "undefined") {
      return { name: "Detecting…", type: "windows", browser: "" };
    }

    const ua = navigator.userAgent;
    let browser = "Browser";
    if (/Edg/i.test(ua)) browser = "Microsoft Edge";
    else if (/Chrome/i.test(ua)) browser = "Chrome";
    else if (/Firefox/i.test(ua)) browser = "Firefox";
    else if (/Safari/i.test(ua)) browser = "Safari";

    let name = "Unknown Device";
    let type: "windows" | "apple" | "android" | "mobile" = "mobile";

    if (/Windows/i.test(ua)) {
      name = "Windows Laptop / PC";
      type = "windows";
    } else if (/Mac/i.test(ua) && !/iPhone|iPad/i.test(ua)) {
      name = "MacBook (macOS)";
      type = "apple";
    } else if (/iPhone|iPad/i.test(ua)) {
      name = "iPhone / iPad (iOS)";
      type = "apple";
    } else if (/Android/i.test(ua)) {
      name = "Android Smartphone";
      type = "android";
    }

    return { name, type, browser };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Account & Profile"
        description="Manage your verified business identity, GSTIN registration, and account credentials."
        breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Account" }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. PERSONAL USER ACCOUNT CARD */}
        <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-2xl border p-5 sm:p-6">
          <div className="border-outline-variant/40 flex items-center gap-2 border-b pb-3">
            <User className="text-on-surface h-5 w-5" />
            <h3 className="text-on-surface text-sm font-bold">User Account</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-on-surface-variant mb-2 block text-xs font-semibold">
                Profile Avatar
              </label>
              <AvatarUploader
                userId={userId}
                fullName={fullName}
                currentUrl={avatarUrl}
              />
            </div>

            <div className="border-outline-variant/40 space-y-2.5 border-t pt-3 text-xs">
              <div>
                <span className="text-on-surface-variant block font-semibold">
                  Full Name
                </span>
                <span className="text-on-surface font-bold">{fullName}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block font-semibold">
                  Login Email
                </span>
                <span className="text-on-surface font-mono">{userEmail}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CURRENT ACTIVE DEVICE LOG */}
        <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-2xl border p-5 sm:p-6">
          <div className="border-outline-variant/40 flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-on-surface h-5 w-5" />
              <h3 className="text-on-surface text-sm font-bold">
                Current Device Session
              </h3>
            </div>
            <span className="border-success/20 bg-success-container text-on-success-container rounded-full border px-2.5 py-0.5 text-[10px] font-semibold">
              Active Session
            </span>
          </div>

          <div className="border-success/20 bg-success-container/20 flex items-center justify-between rounded-xl border p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="border-outline-variant/50 bg-surface-container-low text-on-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
                {currentDevice.type === "windows" ? (
                  <Monitor className="text-on-surface h-5 w-5" />
                ) : currentDevice.type === "apple" ? (
                  <Apple className="text-on-surface h-5 w-5" />
                ) : (
                  <Smartphone className="text-on-surface h-5 w-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-on-surface font-bold">
                    {currentDevice.name}
                  </span>
                  <span className="bg-success-container text-on-success-container border-success/20 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase">
                    Current Device
                  </span>
                </div>
                <span className="text-on-surface-variant block text-[11px]">
                  {currentDevice.browser} · Active now
                </span>
              </div>
            </div>

            <div className="text-success flex items-center gap-1 text-[10px] font-bold">
              <span className="bg-success h-2 w-2 animate-pulse rounded-full" />
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BUSINESS PROFILE WITH EDIT OPTION */}
      <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-2xl border p-5 sm:p-6">
        <div className="border-outline-variant/40 flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="text-on-surface h-5 w-5" />
            <h3 className="text-on-surface text-sm font-bold">
              Business Details &amp; GSTIN
            </h3>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditingBusiness((prev) => !prev)}
            className="border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container h-8 rounded-full px-3 text-xs font-semibold transition-colors"
          >
            <Edit3 className="mr-1.5 h-3.5 w-3.5 text-current" />
            <span>{isEditingBusiness ? "Close Editor" : "Edit Business Details"}</span>
          </Button>
        </div>

        {isEditingBusiness ? (
          <div className="pt-2">
            <OnboardingForm
              profile={sellerProfile}
              onSuccess={() => setIsEditingBusiness(false)}
              onCancel={() => setIsEditingBusiness(false)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
            <div className="border-outline-variant/50 bg-surface-container-low rounded-xl border p-3.5">
              <span className="text-on-surface-variant block font-semibold">
                Business Name
              </span>
              <span className="text-on-surface text-sm font-bold">
                {sellerProfile?.business_name || "Not specified"}
              </span>
            </div>

            <div className="border-outline-variant/50 bg-surface-container-low rounded-xl border p-3.5">
              <span className="text-on-surface-variant block font-semibold">
                GSTIN Identification
              </span>
              <span className="text-on-surface font-mono text-sm font-bold">
                {sellerProfile?.gst_number || "Pending"}
              </span>
            </div>

            <div className="border-outline-variant/50 bg-surface-container-low rounded-xl border p-3.5">
              <span className="text-on-surface-variant block font-semibold">
                Clearance Status
              </span>
              <span className="text-success inline-flex items-center gap-1 font-bold capitalize">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{sellerProfile?.status || "Pending"}</span>
              </span>
            </div>

            <div className="border-outline-variant/50 bg-surface-container-low rounded-xl border p-3.5">
              <span className="text-on-surface-variant block font-semibold">
                Factory Address
              </span>
              <span className="text-on-surface">
                {sellerProfile?.factory_address || "Not specified"}
              </span>
            </div>

            <div className="border-outline-variant/50 bg-surface-container-low rounded-xl border p-3.5">
              <span className="text-on-surface-variant block font-semibold">
                City / State / Pincode
              </span>
              <span className="text-on-surface">
                {sellerProfile?.city && sellerProfile?.state
                  ? `${sellerProfile.city}, ${sellerProfile.state} - ${sellerProfile.pincode || ""}`
                  : "India"}
              </span>
            </div>

            <div className="border-outline-variant/50 bg-surface-container-low rounded-xl border p-3.5">
              <span className="text-on-surface-variant block font-semibold">
                Established Year
              </span>
              <span className="text-on-surface font-mono text-sm font-bold">
                {sellerProfile?.established_year || "N/A"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
