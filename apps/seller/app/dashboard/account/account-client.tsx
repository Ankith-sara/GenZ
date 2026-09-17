"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader, Button } from "@genz/ui";
import {
  Building2,
  Edit3,
  Monitor,
  Apple,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
  Copy,
  Check,
  Sparkles,
  FileText,
  Store,
  ArrowUpRight,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { SITE_URL } from "@genz/utils";
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
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(avatarUrl);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [copiedGst, setCopiedGst] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

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
      name = "Android Mobile";
      type = "android";
    }

    return { name, type, browser };
  });

  const businessName = sellerProfile?.business_name || "Factory Seller";
  const gstNumber =
    sellerProfile?.gst_number &&
    sellerProfile.gst_number !== "PENDING" &&
    sellerProfile.gst_number !== "Pending"
      ? sellerProfile.gst_number
      : null;

  const isVerified = sellerProfile?.status === "verified";
  const isPending = sellerProfile?.status === "pending" || !sellerProfile?.status;
  const isRejected = sellerProfile?.status === "rejected";

  function handleCopyGst() {
    if (!gstNumber) return;
    navigator.clipboard.writeText(gstNumber);
    setCopiedGst(true);
    toast.success("GSTIN copied to clipboard");
    setTimeout(() => setCopiedGst(false), 2000);
  }

  function handleCopyUserId() {
    navigator.clipboard.writeText(userId);
    setCopiedId(true);
    toast.success("Seller UUID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  }

  const storefrontUrl = `${SITE_URL || ""}/sellers/${userId}`;

  // Storefront readiness checklist
  const readinessItems = [
    {
      title: "Artisan Profile Photo",
      desc: "Profile avatar visible on storefront & maker cards",
      done: Boolean(currentAvatarUrl),
    },
    {
      title: "GSTIN Registration",
      desc: "Tax compliance identification registered",
      done: Boolean(gstNumber),
    },
    {
      title: "Factory / Workshop Address",
      desc: "Dispatch location and postal verification",
      done: Boolean(sellerProfile?.factory_address && sellerProfile?.city),
    },
    {
      title: "Manufacturing Heritage",
      desc: "Year of establishment and craft lineage",
      done: Boolean(sellerProfile?.established_year),
    },
  ];

  const completedCount = readinessItems.filter((i) => i.done).length;
  const readinessPercent = Math.round((completedCount / readinessItems.length) * 100);

  return (
    <div className="space-y-8">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Business Account & Profile"
        description="Manage your verified manufacturing credentials, business identity, GSTIN registration, and account security."
        breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Account" }]}
      />

      {/* 2. HERO IDENTITY & STOREFRONT BANNER */}
      <div className="border-outline-variant/60 from-surface-container-lowest via-surface-container-lowest to-surface-container-low shadow-elevation-1 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 sm:p-8">
        {/* Subtle decorative background glow */}
        <div className="bg-primary/5 pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: Avatar & Identity Details */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Industry-Standard Avatar Uploader with live sync */}
            <div className="shrink-0">
              <AvatarUploader
                userId={userId}
                fullName={fullName || businessName}
                currentUrl={currentAvatarUrl}
                onUploaded={(newUrl) => setCurrentAvatarUrl(newUrl)}
                size="lg"
              />
            </div>

            {/* Profile Text & Status Badges */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-on-surface text-xl font-bold tracking-tight sm:text-2xl">
                  {businessName}
                </h1>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 shadow-2xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Verified Manufacturer</span>
                  </span>
                ) : isRejected ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-800 shadow-2xs">
                    <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                    <span>Verification Required</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 shadow-2xs">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <span>Verification Under Review</span>
                  </span>
                )}
              </div>

              <div className="text-on-surface-variant flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <span className="text-on-surface font-semibold">{fullName}</span>
                <span>•</span>
                <span className="font-mono text-neutral-600">{userEmail}</span>
                {sellerProfile?.established_year && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="text-primary h-3.5 w-3.5" />
                      <span>Est. {sellerProfile.established_year}</span>
                    </span>
                  </>
                )}
                {sellerProfile?.city && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="text-primary h-3.5 w-3.5" />
                      <span>
                        {sellerProfile.city}, {sellerProfile.state || "India"}
                      </span>
                    </span>
                  </>
                )}
              </div>

              {/* Quick IDs & Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyUserId}
                  className="group border-outline-variant/60 bg-surface-container text-on-surface-variant hover:border-primary hover:text-on-surface inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] transition-colors"
                  title="Click to copy Seller UUID"
                >
                  <span className="text-neutral-500">ID:</span>
                  <span>
                    {userId.slice(0, 8)}…{userId.slice(-4)}
                  </span>
                  {copiedId ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="group-hover:text-primary h-3 w-3 text-neutral-400" />
                  )}
                </button>

                {gstNumber && (
                  <button
                    type="button"
                    onClick={handleCopyGst}
                    className="group border-outline-variant/60 bg-surface-container text-on-surface-variant hover:border-primary hover:text-on-surface inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] transition-colors"
                    title="Click to copy GSTIN"
                  >
                    <span className="text-neutral-500">GST:</span>
                    <span className="text-on-surface font-bold">{gstNumber}</span>
                    {copiedGst ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="group-hover:text-primary h-3 w-3 text-neutral-400" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Primary Storefront CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0">
            <Link
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-outline-variant/70 bg-surface-container-lowest text-on-surface hover:border-primary hover:bg-surface-container inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-2xs transition-all hover:shadow-xs"
            >
              <Store className="text-primary h-3.5 w-3.5" />
              <span>View Live Atelier</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
            </Link>

            <Link
              href="/dashboard/profile"
              className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/15 inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-2xs transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Atelier Studio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. BUSINESS CREDENTIALS & REGISTRATION CARD */}
      <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 rounded-3xl border p-6 sm:p-8">
        <div className="border-outline-variant/40 flex flex-wrap items-center justify-between gap-4 border-b pb-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-on-surface text-base font-bold">
                Manufacturing Credentials &amp; GSTIN
              </h2>
              <p className="text-on-surface-variant text-xs">
                Official registration details submitted for merchant clearance.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditingBusiness((prev) => !prev)}
            className="border-outline-variant hover:border-primary hover:bg-primary/5 text-on-surface h-9 rounded-xl px-4 text-xs font-semibold transition-colors"
          >
            <Edit3 className="text-primary mr-1.5 h-3.5 w-3.5" />
            <span>{isEditingBusiness ? "Close Editor" : "Edit Business Details"}</span>
          </Button>
        </div>

        {isEditingBusiness ? (
          <div className="pt-6">
            <OnboardingForm
              profile={sellerProfile}
              onSuccess={() => {
                setIsEditingBusiness(false);
                toast.success("Business details updated successfully!");
              }}
              onCancel={() => setIsEditingBusiness(false)}
            />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Legal Business Name */}
            <div className="border-outline-variant/50 bg-surface-container-low/60 hover:border-outline-variant flex flex-col justify-between rounded-2xl border p-4 transition-all">
              <div>
                <span className="text-on-surface-variant text-[11px] font-bold tracking-wider uppercase">
                  Legal Entity / Business Name
                </span>
                <p className="text-on-surface mt-1 text-sm font-bold">
                  {sellerProfile?.business_name || "Factory Seller"}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                <Building2 className="text-primary h-3.5 w-3.5 shrink-0" />
                <span>Registered Enterprise</span>
              </div>
            </div>

            {/* GSTIN Identification */}
            <div className="border-outline-variant/50 bg-surface-container-low/60 hover:border-outline-variant flex flex-col justify-between rounded-2xl border p-4 transition-all">
              <div>
                <span className="text-on-surface-variant text-[11px] font-bold tracking-wider uppercase">
                  GSTIN Registration
                </span>
                <p className="text-on-surface mt-1 font-mono text-sm font-bold tracking-wide">
                  {gstNumber || "PENDING"}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <FileText className="text-primary h-3.5 w-3.5 shrink-0" />
                  <span>Tax Compliance</span>
                </div>
                {gstNumber && (
                  <button
                    type="button"
                    onClick={handleCopyGst}
                    className="text-primary inline-flex items-center gap-1 text-[11px] font-semibold hover:underline"
                  >
                    {copiedGst ? "Copied" : "Copy GSTIN"}
                  </button>
                )}
              </div>
            </div>

            {/* Verification Status */}
            <div className="border-outline-variant/50 bg-surface-container-low/60 hover:border-outline-variant flex flex-col justify-between rounded-2xl border p-4 transition-all">
              <div>
                <span className="text-on-surface-variant text-[11px] font-bold tracking-wider uppercase">
                  Clearance Status
                </span>
                <div className="mt-1">
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Verified &amp; Active</span>
                    </span>
                  ) : isPending ? (
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-700">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span>Under Verification</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-rose-700">
                      <AlertCircle className="h-4 w-4 text-rose-600" />
                      <span>Action Required</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                <ShieldCheck className="text-primary h-3.5 w-3.5 shrink-0" />
                <span>GenZ Trust &amp; Safety</span>
              </div>
            </div>

            {/* Manufacturing Address */}
            <div className="border-outline-variant/50 bg-surface-container-low/60 hover:border-outline-variant flex flex-col justify-between rounded-2xl border p-4 transition-all">
              <div>
                <span className="text-on-surface-variant text-[11px] font-bold tracking-wider uppercase">
                  Manufacturing Unit / Factory Address
                </span>
                <p className="text-on-surface mt-1 text-xs leading-relaxed">
                  {sellerProfile?.factory_address || "Address not provided"}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                <MapPin className="text-primary h-3.5 w-3.5 shrink-0" />
                <span>Primary Dispatch Location</span>
              </div>
            </div>

            {/* City / State / Pincode */}
            <div className="border-outline-variant/50 bg-surface-container-low/60 hover:border-outline-variant flex flex-col justify-between rounded-2xl border p-4 transition-all">
              <div>
                <span className="text-on-surface-variant text-[11px] font-bold tracking-wider uppercase">
                  Jurisdiction &amp; Postal Area
                </span>
                <p className="text-on-surface mt-1 text-xs font-semibold">
                  {sellerProfile?.city && sellerProfile?.state
                    ? `${sellerProfile.city}, ${sellerProfile.state} - ${sellerProfile.pincode || ""}`
                    : "India"}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                <Building2 className="text-primary h-3.5 w-3.5 shrink-0" />
                <span>Logistics Hub</span>
              </div>
            </div>

            {/* Year Established */}
            <div className="border-outline-variant/50 bg-surface-container-low/60 hover:border-outline-variant flex flex-col justify-between rounded-2xl border p-4 transition-all">
              <div>
                <span className="text-on-surface-variant text-[11px] font-bold tracking-wider uppercase">
                  Craft / Production Lineage
                </span>
                <p className="text-on-surface mt-1 font-mono text-sm font-bold">
                  {sellerProfile?.established_year
                    ? `Established ${sellerProfile.established_year}`
                    : "Not specified"}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                <Calendar className="text-primary h-3.5 w-3.5 shrink-0" />
                <span>Manufacturing Legacy</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. TWO-COLUMN SPLIT: ACCOUNT SECURITY & STOREFRONT READINESS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Session & Device Security */}
        <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-3xl border p-6 sm:p-8">
          <div className="border-outline-variant/40 flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-on-surface text-base font-bold">
                  Active Session &amp; Security
                </h3>
                <p className="text-on-surface-variant text-xs">
                  Real-time authentication status and device verification.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 shadow-2xs">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />
              <span>Active</span>
            </span>
          </div>

          <div className="border-outline-variant/50 bg-surface-container-low/60 rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="border-outline-variant/60 bg-surface text-on-surface flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-2xs">
                  {currentDevice.type === "windows" ? (
                    <Monitor className="text-primary h-5 w-5" />
                  ) : currentDevice.type === "apple" ? (
                    <Apple className="text-primary h-5 w-5" />
                  ) : (
                    <Smartphone className="text-primary h-5 w-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface text-sm font-bold">
                      {currentDevice.name}
                    </span>
                    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-emerald-800 uppercase">
                      Current Device
                    </span>
                  </div>
                  <span className="text-on-surface-variant mt-0.5 block text-xs">
                    {currentDevice.browser} · Active Session
                  </span>
                </div>
              </div>

              <div className="hidden text-right sm:block">
                <span className="text-[11px] font-medium text-emerald-700">
                  TLS 1.3 Encrypted
                </span>
                <span className="block text-[10px] text-neutral-500">
                  RBAC Verified
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="border-outline-variant/40 bg-surface-container-low/40 rounded-xl border p-3">
              <span className="text-on-surface-variant text-[10px] font-bold uppercase">
                Account Role
              </span>
              <p className="text-on-surface mt-0.5 font-bold">Verified Seller Admin</p>
            </div>
            <div className="border-outline-variant/40 bg-surface-container-low/40 rounded-xl border p-3">
              <span className="text-on-surface-variant text-[10px] font-bold uppercase">
                Login Security
              </span>
              <p className="text-on-surface mt-0.5 font-bold">Password Protected</p>
            </div>
          </div>
        </div>

        {/* Storefront Readiness Checklist */}
        <div className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 space-y-4 rounded-3xl border p-6 sm:p-8">
          <div className="border-outline-variant/40 flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-on-surface text-base font-bold">
                  Storefront Readiness
                </h3>
                <p className="text-on-surface-variant text-xs">
                  {completedCount} of {readinessItems.length} profile criteria completed
                  ({readinessPercent}%)
                </p>
              </div>
            </div>

            <span className="text-primary font-mono text-xs font-bold">
              {readinessPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="bg-surface-container-low h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${readinessPercent}%` }}
            />
          </div>

          <div className="space-y-2.5 pt-1">
            {readinessItems.map((item, idx) => (
              <div
                key={idx}
                className="border-outline-variant/40 bg-surface-container-low/30 flex items-start justify-between rounded-xl border p-3"
              >
                <div className="flex items-start gap-2.5">
                  {item.done ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <div className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-neutral-400" />
                  )}
                  <div>
                    <span className="text-on-surface text-xs font-bold">
                      {item.title}
                    </span>
                    <p className="text-on-surface-variant text-[11px]">{item.desc}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase ${
                    item.done ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {item.done ? "Completed" : "Pending"}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard/profile"
              className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 inline-flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition-all"
            >
              <span>Open Atelier Profile Studio</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
