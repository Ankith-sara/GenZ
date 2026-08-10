"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { Button } from "@/components/ui/atoms/button";
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
import type { SellerProfile } from "@/types/database";

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
    <div className="font-graphik space-y-6">
      <PageHeader
        title="Seller Account"
        description="View and update your personal user details, factory business profile, and active session details."
        breadcrumbs={[
          { label: "Seller Desk", href: "/seller/dashboard" },
          { label: "Account" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. PERSONAL USER ACCOUNT CARD */}
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

            <div className="space-y-2.5 border-t border-[#F0F0EC] pt-3 text-xs">
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

        {/* 2. CURRENT ACTIVE DEVICE LOG */}
        <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-black" />
              <h3 className="text-sm font-bold text-[#1A1A18]">
                Current Device Session
              </h3>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
              Active Session
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-emerald-200/60 bg-emerald-50/30 p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5E5E0] bg-[#FAF8F4] text-black">
                {currentDevice.type === "windows" ? (
                  <Monitor className="h-5 w-5 text-[#1A1A18]" />
                ) : currentDevice.type === "apple" ? (
                  <Apple className="h-5 w-5 text-[#1A1A18]" />
                ) : (
                  <Smartphone className="h-5 w-5 text-[#1A1A18]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1A1A18]">{currentDevice.name}</span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-800 uppercase">
                    Current Device
                  </span>
                </div>
                <span className="block font-mono text-[11px] text-[#73736E]">
                  {currentDevice.browser} · Active now
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FACTORY & BUSINESS PROFILE WITH EDIT OPTION */}
      <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-black" />
            <h3 className="text-sm font-bold text-[#1A1A18]">
              Factory & Business Profile Details
            </h3>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditingBusiness((prev) => !prev)}
            className="h-8 border-[#E5E5E0] text-xs font-semibold hover:bg-[#FAF8F4]"
          >
            <Edit3 className="mr-1.5 h-3.5 w-3.5" />
            <span>{isEditingBusiness ? "Close Editor" : "Edit Business Profile"}</span>
          </Button>
        </div>

        {isEditingBusiness ? (
          <div className="pt-2">
            <OnboardingForm profile={sellerProfile} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-[#F0F0EC] bg-[#FAF8F4] p-3.5">
              <span className="block font-semibold text-[#73736E]">Business Name</span>
              <span className="text-sm font-bold text-black">
                {sellerProfile?.business_name || "Not specified"}
              </span>
            </div>

            <div className="rounded-xl border border-[#F0F0EC] bg-[#FAF8F4] p-3.5">
              <span className="block font-semibold text-[#73736E]">
                GSTIN Identification
              </span>
              <span className="font-mono text-sm font-bold text-[#1A1A18]">
                {sellerProfile?.gst_number || "Pending"}
              </span>
            </div>

            <div className="rounded-xl border border-[#F0F0EC] bg-[#FAF8F4] p-3.5">
              <span className="block font-semibold text-[#73736E]">
                Clearance Status
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 capitalize">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{sellerProfile?.status || "Pending"}</span>
              </span>
            </div>

            <div className="rounded-xl border border-[#F0F0EC] bg-[#FAF8F4] p-3.5">
              <span className="block font-semibold text-[#73736E]">
                Factory Address
              </span>
              <span className="text-[#1A1A18]">
                {sellerProfile?.factory_address || "Not specified"}
              </span>
            </div>

            <div className="rounded-xl border border-[#F0F0EC] bg-[#FAF8F4] p-3.5">
              <span className="block font-semibold text-[#73736E]">
                City / State / Pincode
              </span>
              <span className="text-[#1A1A18]">
                {sellerProfile?.city && sellerProfile?.state
                  ? `${sellerProfile.city}, ${sellerProfile.state} - ${sellerProfile.pincode || ""}`
                  : "India"}
              </span>
            </div>

            <div className="rounded-xl border border-[#F0F0EC] bg-[#FAF8F4] p-3.5">
              <span className="block font-semibold text-[#73736E]">
                Established Year
              </span>
              <span className="font-mono text-sm font-bold text-[#1A1A18]">
                {sellerProfile?.established_year || "N/A"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
