"use client";

import React, { useState, useTransition } from "react";
import { PageHeader } from "@genz/ui";
import { StatusBadge } from "@genz/ui";
import { EmptyState } from "@genz/ui";
import { SlideOverDrawer } from "@genz/ui";
import { approveSeller, rejectSeller } from "./actions";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  FileCheck,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@genz/ui";

export interface SellerAppRecord {
  id: string;
  business_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  form_data?: Record<string, unknown> | null;
  business_type?: string | null;
  rejection_reason?: string | null;
}

interface VerificationsSplitClientProps {
  initialList: SellerAppRecord[];
  initialStatus?: string;
}

function generateRandomPassword(length = 14): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

const FIELD_LABEL_MAP: Record<string, string> = {
  gst_number: "GSTIN / Trade License",
  business_name: "Business Name",
  full_name: "Applicant Full Name",
  owner_name: "Owner / Authorized Person",
  email: "Email Address",
  phone: "Phone Number",
  factory_address: "Factory Address",
  city: "City",
  state: "State",
  pincode: "PIN Code",
  established_year: "Year Established",
  employee_count: "Staff / Employees",
  product_categories: "Product Categories",
  products_manufactured: "Products Manufactured",
  manufacturing_capacity: "Monthly Capacity",
  moq: "Minimum Order Qty",
  google_maps_location: "Google Maps Location",
  oem_odm: "OEM / ODM Support",
  export_available: "Export Readiness",
  walkthrough_video: "Factory Walkthrough Video",
  pan_number: "PAN Number",
  cin_number: "CIN Number",
  company_logo: "Company Logo",
  factory_exterior: "Factory Exterior Photo",
  factory_interior: "Factory Interior Photo",
  machinery_photo: "Machinery Photo",
  production_line: "Production Line Photo",
  udyam_certificate_file: "UDYAM Registration Certificate",
  factory_license_file: "Factory License",
};

function formatFieldLabel(key: string): string {
  if (FIELD_LABEL_MAP[key]) return FIELD_LABEL_MAP[key];
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getBusinessCategoryLabel(app: SellerAppRecord): string {
  const rawType = String(
    app.business_type || app.form_data?.business_type || ""
  ).toLowerCase();
  if (rawType === "manufacturer" || rawType === "seller")
    return "Manufacturer / Factory";
  if (rawType === "startup") return "Startup / Brand";
  if (rawType === "artisan") return "Artisan / MSME";
  if (app.form_data?.product_categories)
    return String(app.form_data.product_categories);
  return rawType || "Manufacturer / Factory";
}

// Icon stroke is standardized to 1.75 across the panel (Lucide defaults to 2,
// which reads slightly heavy at these small sizes) — one deliberate choice
// applied consistently rather than left to each icon's default.
const ICON_STROKE = 1.75;

// Shared button press/hover physics so every control in the panel feels
// like the same material, not a grab-bag of default states.
const PRESSABLE =
  "transition-all duration-150 ease-out active:scale-[0.97] disabled:active:scale-100";
const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A18]/15 focus-visible:ring-offset-1 focus-visible:ring-offset-white";

export function VerificationsSplitClient({
  initialList,
}: VerificationsSplitClientProps) {
  const [appsList, setAppsList] = useState<SellerAppRecord[]>(initialList);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Rejection form
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Custom Approval Modal
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvalEmail, setApprovalEmail] = useState("");
  const [approvalPassword, setApprovalPassword] = useState("");
  const [sendEmailOption, setSendEmailOption] = useState(true);

  // Credentials Summary Modal State
  const [credentialsModal, setCredentialsModal] = useState<{
    email: string;
    password: string;
    businessName: string;
    emailSent: boolean;
    emailError?: string;
  } | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const counts = {
    pending: appsList.filter((a) => a.status === "pending").length,
    approved: appsList.filter((a) => a.status === "approved").length,
    rejected: appsList.filter((a) => a.status === "rejected").length,
    all: appsList.length,
  };

  const filteredList = appsList.filter((app) => {
    const matchesStatus =
      activeStatusFilter === "all" || app.status === activeStatusFilter;
    const matchesSearch =
      !searchQuery ||
      app.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const selectedApp = appsList.find((a) => a.id === selectedId) || null;

  const openApproveModal = () => {
    if (!selectedApp) return;
    setApprovalEmail(selectedApp.email);
    setApprovalPassword(generateRandomPassword(14));
    setSendEmailOption(true);
    setShowApproveModal(true);
  };

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setActionError(null);
    setActionSuccess(null);

    const formData = new FormData();
    formData.append("applicationId", selectedApp.id);
    formData.append("email", approvalEmail || selectedApp.email);
    formData.append("password", approvalPassword);
    if (sendEmailOption) {
      formData.append("sendEmail", "on");
    }

    startTransition(async () => {
      const res = await approveSeller({}, formData);
      if (res.error) {
        setActionError(res.error);
      } else if (res.credentials) {
        // Update local app list status instantly
        setAppsList((prev) =>
          prev.map((item) =>
            item.id === selectedApp.id ? { ...item, status: "approved" } : item
          )
        );

        setShowApproveModal(false);
        setCredentialsModal({
          email: res.credentials.email,
          password: res.credentials.password,
          businessName: selectedApp.business_name,
          emailSent: res.credentials.emailSent,
          emailError: res.credentials.emailError,
        });

        setActionSuccess(`Approved "${selectedApp.business_name}".`);
      }
    });
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !rejectionReason.trim()) return;

    setActionError(null);
    setActionSuccess(null);

    const formData = new FormData();
    formData.append("sellerId", selectedApp.id);
    formData.append("reason", rejectionReason);

    startTransition(async () => {
      const res = await rejectSeller({}, formData);
      if (res.error) {
        setActionError(res.error);
      } else {
        setAppsList((prev) =>
          prev.map((item) =>
            item.id === selectedApp.id ? { ...item, status: "rejected" } : item
          )
        );

        setShowRejectForm(false);
        setRejectionReason("");
        setActionSuccess(`Marked "${selectedApp.business_name}" as rejected.`);
      }
    });
  };

  const copyToClipboard = (text: string, type: "email" | "password" | "all") => {
    navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else if (type === "password") {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  return (
    <div className="font-graphik space-y-6">
      <PageHeader
        title="Seller Audit & Verification Center"
        description="Review manufacturing verification applications, GST certificates, and clearance status."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Verifications" },
        ]}
      />

      {/* Action Notification Banners — desaturated to sit inside the
          cream/ink palette instead of stock Tailwind emerald/rose */}
      {actionError && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl border border-[#E3B9B2] bg-[#FBF1EF] p-3.5 text-xs font-semibold text-[#7A2E24] shadow-[0_1px_2px_rgba(122,46,36,0.06)]"
        >
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={ICON_STROKE} />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-xl border border-[#B9CDB6] bg-[#F1F5EF] p-3.5 text-xs font-semibold text-[#2F5233] shadow-[0_1px_2px_rgba(47,82,51,0.06)]"
        >
          <CheckCircle2
            className="h-4 w-4 shrink-0 text-[#3D6B45]"
            strokeWidth={ICON_STROKE}
          />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* CONTROL TOOLBAR: SEARCH & STATUS TABS */}
      <div className="flex flex-col gap-4 border-b border-[#E5E5E0] pb-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search
            className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#73736E]"
            strokeWidth={ICON_STROKE}
          />
          <input
            type="text"
            placeholder="Search business name, applicant, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`h-9 w-full rounded-lg border border-[#E5E5E0] bg-white pr-3 pl-9 text-xs text-black transition-colors placeholder:text-[#A3A39D] focus:border-black ${FOCUS_RING}`}
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { value: "pending", label: "Pending Review", count: counts.pending },
            { value: "approved", label: "Approved", count: counts.approved },
            { value: "rejected", label: "Rejected", count: counts.rejected },
            { value: "all", label: "All Records", count: counts.all },
          ].map((tab) => {
            const isActive = activeStatusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveStatusFilter(tab.value)}
                className={`flex h-9 items-center gap-2 rounded-lg px-3.5 text-xs font-bold ${PRESSABLE} ${FOCUS_RING} ${
                  isActive
                    ? "bg-black text-white shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
                    : "border border-[#E5E5E0] bg-white text-[#52524E] hover:border-black/30 hover:bg-[#FAF8F4]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums ${
                    isActive ? "bg-white/20 text-white" : "bg-[#E5E5E0] text-black"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FULL-WIDTH DATA TABLE VIEW */}
      {filteredList.length === 0 ? (
        <EmptyState
          icon={
            <Building2 className="h-7 w-7 text-[#73736E]" strokeWidth={ICON_STROKE} />
          }
          title="No applications found"
          description={`No seller profiles listed under "${activeStatusFilter}" matching your search.`}
          primaryAction={{
            label: "Reset filters",
            onClick: () => {
              setSearchQuery("");
              setActiveStatusFilter("all");
            },
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E5E5E0] bg-white shadow-[0_1px_2px_rgba(26,26,24,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 border-b border-[#E5E5E0] bg-[#FAF8F4] text-[10px] font-bold tracking-wider text-[#73736E] uppercase shadow-[0_1px_0_rgba(26,26,24,0.04)]">
                <tr>
                  <th className="p-3.5 pl-4">Factory / Business Name</th>
                  <th className="p-3.5">Key Person & Contact</th>
                  <th className="p-3.5">Location & Category</th>
                  <th className="p-3.5">Clearance Status</th>
                  <th className="p-3.5">Filing Date</th>
                  <th className="p-3.5 pr-4 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EC] bg-white">
                {filteredList.map((app) => {
                  const isSelected = selectedId === app.id;
                  return (
                    <tr
                      key={app.id}
                      onClick={() => setSelectedId(app.id)}
                      className={`group h-16 cursor-pointer transition-colors duration-150 ${
                        isSelected
                          ? "border-l-2 border-l-black bg-[#FAF7F0] font-medium"
                          : "border-l-2 border-l-transparent hover:bg-[#FAF7F0]/70"
                      }`}
                    >
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5E5E0] bg-[#FAF7F0] font-bold text-black shadow-[0_1px_2px_rgba(26,26,24,0.05)]">
                            <Building2
                              className="h-5 w-5 text-[#52524E]"
                              strokeWidth={ICON_STROKE}
                            />
                          </div>
                          <div>
                            <span className="block font-bold text-[#1A1A18] group-hover:underline">
                              {app.business_name}
                            </span>
                            <span className="block font-mono text-[10px] text-[#73736E]">
                              ID: {app.id.slice(0, 12)}…
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div>
                          <span className="block font-semibold text-[#1A1A18]">
                            {app.full_name}
                          </span>
                          <span className="block font-mono text-[11px] text-[#73736E]">
                            {app.email}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 text-[#52524E]">
                        <div>
                          <span className="block font-medium">
                            {String(app.form_data?.city || "India")},{" "}
                            {String(app.form_data?.state || "")}
                          </span>
                          <span className="block font-mono text-[10px] text-[#73736E]">
                            {getBusinessCategoryLabel(app)}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <StatusBadge status={app.status} />
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-[#73736E] tabular-nums">
                        {new Date(app.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      <td className="p-3.5 pr-4 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(app.id);
                          }}
                          className={`h-8 rounded-lg border-[#E5E5E0] bg-white px-3 text-xs font-bold text-black group-hover:border-black group-hover:bg-black group-hover:text-white ${PRESSABLE} ${FOCUS_RING}`}
                        >
                          <span>Review application</span>
                          <ChevronRight
                            className="ml-1 h-3.5 w-3.5 text-[#73736E] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-white"
                            strokeWidth={ICON_STROKE}
                          />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SIDE DRAWER FOR AUDIT & APPLICATION REVIEW */}
      {selectedApp && (
        <SlideOverDrawer
          isOpen={!!selectedApp}
          onClose={() => {
            setSelectedId(null);
            setShowRejectForm(false);
          }}
          title={selectedApp.business_name}
          subtitle={`Application ID: ${selectedApp.id}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Header Clearance Status & Actions */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E5E5E0] bg-[#FAF8F4] p-5 sm:flex-row sm:items-center">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
                    Current Status:
                  </span>
                  <StatusBadge status={selectedApp.status} />
                </div>
              </div>

              {/* Clearance Action Buttons */}
              {selectedApp.status === "pending" && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={openApproveModal}
                    disabled={isPending}
                    className={`h-9 rounded-lg bg-[#2F6B4F] px-4 text-xs font-semibold text-white shadow-[0_1px_2px_rgba(47,107,79,0.3)] hover:bg-[#28593F] disabled:opacity-50 ${PRESSABLE} ${FOCUS_RING}`}
                  >
                    <FileCheck
                      className="mr-1.5 h-3.5 w-3.5"
                      strokeWidth={ICON_STROKE}
                    />
                    <span>Approve</span>
                  </Button>

                  <Button
                    onClick={() => setShowRejectForm(true)}
                    disabled={isPending}
                    className={`h-9 rounded-lg border border-[#B3423A] bg-[#B3423A] px-4 text-xs font-semibold text-white shadow-[0_1px_2px_rgba(179,66,58,0.25)] hover:bg-[#963830] disabled:opacity-50 ${PRESSABLE} ${FOCUS_RING}`}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                    <span>Reject</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Rejection Form Box */}
            {showRejectForm && (
              <form
                onSubmit={handleRejectSubmit}
                className="space-y-3 rounded-xl border border-[#E3B9B2] bg-[#FBF1EF] p-4"
              >
                <h4 className="text-xs font-bold text-[#7A2E24]">
                  Reason for rejection
                </h4>
                <textarea
                  rows={3}
                  placeholder="Missing documents, invalid GST number, unreadable factory photos…"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  className={`w-full rounded-lg border border-[#E3B9B2] bg-white p-2.5 text-xs text-black transition-colors focus:border-[#7A2E24] ${FOCUS_RING}`}
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRejectForm(false)}
                    className={`h-8 text-xs font-semibold ${PRESSABLE} ${FOCUS_RING}`}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending || !rejectionReason.trim()}
                    className={`h-8 bg-[#B3423A] text-xs font-semibold text-white hover:bg-[#963830] disabled:opacity-50 ${PRESSABLE} ${FOCUS_RING}`}
                  >
                    Confirm rejection
                  </Button>
                </div>
              </form>
            )}

            {/* Applicant Metadata Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2.5 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-4 text-xs">
                <h4 className="border-b border-[#E5E5E0] pb-1.5 text-[10px] font-bold tracking-wider text-[#1A1A18] uppercase">
                  Contact & Key Person
                </h4>
                <div className="flex items-center gap-2 font-semibold text-black">
                  <Building2
                    className="h-3.5 w-3.5 text-[#73736E]"
                    strokeWidth={ICON_STROKE}
                  />
                  <span>{selectedApp.full_name}</span>
                </div>
                <div className="flex items-center gap-2 text-[#52524E]">
                  <Mail
                    className="h-3.5 w-3.5 text-[#73736E]"
                    strokeWidth={ICON_STROKE}
                  />
                  <span className="truncate">{selectedApp.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#52524E]">
                  <Phone
                    className="h-3.5 w-3.5 text-[#73736E]"
                    strokeWidth={ICON_STROKE}
                  />
                  <span>{selectedApp.phone || "No phone provided"}</span>
                </div>
              </div>

              <div className="space-y-2.5 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-4 text-xs">
                <h4 className="border-b border-[#E5E5E0] pb-1.5 text-[10px] font-bold tracking-wider text-[#1A1A18] uppercase">
                  Filing Timeline & Origin
                </h4>
                <div className="flex items-center gap-2 font-semibold text-black">
                  <Calendar
                    className="h-3.5 w-3.5 text-[#73736E]"
                    strokeWidth={ICON_STROKE}
                  />
                  <span>
                    Submitted:{" "}
                    {new Date(selectedApp.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(selectedApp.created_at).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#52524E]">
                  <MapPin
                    className="h-3.5 w-3.5 text-[#73736E]"
                    strokeWidth={ICON_STROKE}
                  />
                  <span>
                    {String(selectedApp.form_data?.city || "India")},{" "}
                    {String(selectedApp.form_data?.state || "")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#52524E]">
                  <Clock
                    className="h-3.5 w-3.5 text-[#73736E]"
                    strokeWidth={ICON_STROKE}
                  />
                  <span>Category: {getBusinessCategoryLabel(selectedApp)}</span>
                </div>
              </div>
            </div>

            {/* Form Data Application Details View */}
            {selectedApp.form_data && (
              <div className="space-y-4 rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-[0_1px_2px_rgba(26,26,24,0.04)]">
                <h4 className="text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
                  Submitted Application Details
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {(() => {
                    const formData = selectedApp.form_data;
                    const combinedEntries: [string, string][] = [];
                    const countryCode = String(formData.country_code ?? "").trim();
                    const phoneNum = String(formData.phone ?? "").trim();

                    Object.entries(formData).forEach(([key, val]) => {
                      const stringVal = String(val ?? "").trim();
                      if (!stringVal) return;
                      if (key === "country_code") return;
                      if (key === "phone") {
                        const formattedPhone =
                          countryCode && !phoneNum.startsWith(countryCode)
                            ? `${countryCode} ${phoneNum}`
                            : phoneNum;
                        combinedEntries.push(["phone", formattedPhone]);
                      } else {
                        combinedEntries.push([key, stringVal]);
                      }
                    });

                    return combinedEntries.map(([key, stringVal]) => {
                      const label = formatFieldLabel(key);
                      const isUrl =
                        stringVal.startsWith("http://") ||
                        stringVal.startsWith("https://");
                      const isFullWidth =
                        stringVal.length > 45 ||
                        key.includes("address") ||
                        key.includes("description") ||
                        key.includes("categories");

                      return (
                        <div
                          key={key}
                          className={`space-y-1.5 ${isFullWidth ? "sm:col-span-2" : ""}`}
                        >
                          <label className="block text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
                            {label}
                          </label>
                          <div className="flex min-h-[40px] items-center rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] px-3.5 py-2 text-xs font-semibold text-[#1A1A18]">
                            {isUrl ? (
                              <a
                                href={stringVal}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 rounded font-semibold break-all text-[#1A4B8C] hover:underline ${FOCUS_RING}`}
                              >
                                <span>Open document / link</span>
                                <ExternalLink
                                  className="h-3.5 w-3.5"
                                  strokeWidth={ICON_STROKE}
                                />
                              </a>
                            ) : (
                              <span className="font-sans text-xs break-words text-[#1A1A18]">
                                {stringVal}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        </SlideOverDrawer>
      )}

      {/* APPROVAL & CUSTOM CREDENTIALS MODAL */}
      {showApproveModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A18]/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleApproveSubmit}
            className="animate-in fade-in-80 zoom-in-95 w-full max-w-md space-y-5 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-[0_20px_50px_-12px_rgba(26,26,24,0.35)]"
          >
            <div>
              <h3 className="text-lg font-bold text-[#1A1A18]">
                Approve seller & set credentials
              </h3>
              <p className="text-xs text-[#73736E]">
                Configure access for{" "}
                <strong className="text-black">{selectedApp.business_name}</strong>
              </p>
            </div>

            <div className="space-y-3.5 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-4 text-xs">
              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
                  Login Email Address
                </label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    required
                    value={approvalEmail}
                    onChange={(e) => setApprovalEmail(e.target.value)}
                    className={`h-10 w-full rounded-xl border border-[#E5E5E0] bg-white pr-10 pl-3.5 font-mono text-xs text-black transition-colors focus:border-black ${FOCUS_RING}`}
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(approvalEmail, "email")}
                    className={`absolute right-2 flex h-7 w-7 items-center justify-center rounded-lg text-[#73736E] hover:bg-[#FAF8F4] hover:text-black ${PRESSABLE} ${FOCUS_RING}`}
                    title="Copy email address"
                  >
                    {copiedEmail ? (
                      <Check
                        className="h-4 w-4 text-[#3D6B45]"
                        strokeWidth={ICON_STROKE}
                      />
                    ) : (
                      <Copy className="h-4 w-4" strokeWidth={ICON_STROKE} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
                    Set Custom Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setApprovalPassword(generateRandomPassword(14))}
                    className={`flex items-center gap-1 rounded text-[11px] font-medium text-[#2F6B4F] hover:underline ${FOCUS_RING}`}
                  >
                    <RefreshCw className="h-3 w-3" strokeWidth={ICON_STROKE} />
                    <span>Generate random</span>
                  </button>
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={approvalPassword}
                    onChange={(e) => setApprovalPassword(e.target.value)}
                    className={`h-10 w-full rounded-xl border border-[#E5E5E0] bg-white pr-20 pl-3.5 font-mono text-xs text-black transition-colors focus:border-black ${FOCUS_RING}`}
                  />
                  <div className="absolute right-2 flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-[#73736E] hover:bg-[#FAF8F4] hover:text-black ${PRESSABLE} ${FOCUS_RING}`}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" strokeWidth={ICON_STROKE} />
                      ) : (
                        <Eye className="h-4 w-4" strokeWidth={ICON_STROKE} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(approvalPassword, "password")}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-[#73736E] hover:bg-[#FAF8F4] hover:text-black ${PRESSABLE} ${FOCUS_RING}`}
                      title="Copy password"
                    >
                      {copiedPassword ? (
                        <Check
                          className="h-4 w-4 text-[#3D6B45]"
                          strokeWidth={ICON_STROKE}
                        />
                      ) : (
                        <Copy className="h-4 w-4" strokeWidth={ICON_STROKE} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <label
                htmlFor="sendEmailCheck"
                className="flex cursor-pointer items-center gap-2 pt-1 select-none"
              >
                <input
                  type="checkbox"
                  id="sendEmailCheck"
                  checked={sendEmailOption}
                  onChange={(e) => setSendEmailOption(e.target.checked)}
                  className={`h-4 w-4 rounded border-[#E5E5E0] text-black focus:ring-black ${FOCUS_RING}`}
                />
                <span className="text-xs text-[#52524E]">
                  Dispatch email notification with credentials
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowApproveModal(false)}
                className={`h-9 text-xs font-semibold ${PRESSABLE} ${FOCUS_RING}`}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isPending}
                className={`h-9 bg-[#2F6B4F] text-xs font-semibold text-white hover:bg-[#28593F] disabled:opacity-50 ${PRESSABLE} ${FOCUS_RING}`}
              >
                {isPending ? (
                  <Loader2
                    className="mr-1.5 h-3.5 w-3.5 animate-spin"
                    strokeWidth={ICON_STROKE}
                  />
                ) : (
                  <FileCheck className="mr-1.5 h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                )}
                <span>Confirm & approve</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* CREDENTIALS PROVISIONED SUMMARY MODAL */}
      {credentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A18]/60 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in-80 zoom-in-95 w-full max-w-md space-y-5 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-[0_20px_50px_-12px_rgba(26,26,24,0.35)]">
            <div className="border-b border-[#F0F0EC] pb-3">
              <h3 className="text-base font-bold text-[#1A1A18]">
                Seller credentials provisioned
              </h3>
              <p className="text-xs text-[#73736E]">
                Account generated for{" "}
                <strong className="text-black">{credentialsModal.businessName}</strong>
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-4 text-xs">
              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
                  Login Email
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={credentialsModal.email}
                    className={`h-10 w-full rounded-xl border border-[#E5E5E0] bg-white pr-10 pl-3.5 font-mono text-xs text-black transition-colors focus:border-black ${FOCUS_RING}`}
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(credentialsModal.email, "email")}
                    className={`absolute right-2 flex h-7 w-7 items-center justify-center rounded-lg text-[#73736E] hover:bg-[#FAF8F4] hover:text-black ${PRESSABLE} ${FOCUS_RING}`}
                    title="Copy email address"
                  >
                    {copiedEmail ? (
                      <Check
                        className="h-4 w-4 text-[#3D6B45]"
                        strokeWidth={ICON_STROKE}
                      />
                    ) : (
                      <Copy className="h-4 w-4" strokeWidth={ICON_STROKE} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
                  Password Credentials
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    readOnly
                    value={credentialsModal.password}
                    className={`h-10 w-full rounded-xl border border-[#E5E5E0] bg-white pr-20 pl-3.5 font-mono text-xs text-black transition-colors focus:border-black ${FOCUS_RING}`}
                  />
                  <div className="absolute right-2 flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-[#73736E] hover:bg-[#FAF8F4] hover:text-black ${PRESSABLE} ${FOCUS_RING}`}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" strokeWidth={ICON_STROKE} />
                      ) : (
                        <Eye className="h-4 w-4" strokeWidth={ICON_STROKE} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(credentialsModal.password, "password")
                      }
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-[#73736E] hover:bg-[#FAF8F4] hover:text-black ${PRESSABLE} ${FOCUS_RING}`}
                      title="Copy password"
                    >
                      {copiedPassword ? (
                        <Check
                          className="h-4 w-4 text-[#3D6B45]"
                          strokeWidth={ICON_STROKE}
                        />
                      ) : (
                        <Copy className="h-4 w-4" strokeWidth={ICON_STROKE} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#73736E]">
                <span>Email dispatch:</span>
                <span
                  className={`rounded-md border px-2 py-0.5 font-semibold ${
                    credentialsModal.emailSent
                      ? "border-[#B9CDB6] bg-[#F1F5EF] text-[#2F5233]"
                      : "border-[#E6CBA0] bg-[#FBF3E7] text-[#8A5A1E]"
                  }`}
                >
                  {credentialsModal.emailSent
                    ? "Sent successfully"
                    : "Not sent — manual copy required"}
                </span>
              </div>
              {!credentialsModal.emailSent && (
                <div className="mt-2 rounded-lg border border-[#E6CBA0] bg-[#FBF3E7] p-2.5 text-xs text-[#8A5A1E]">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle
                      className="h-4 w-4 shrink-0 text-[#B3822E]"
                      strokeWidth={ICON_STROKE}
                    />
                    <span>Email dispatch failed</span>
                  </div>
                  <p className="mt-1 text-[11px]">
                    {credentialsModal.emailError
                      ? `Reason: ${credentialsModal.emailError}.`
                      : "Credentials were provisioned."}{" "}
                    Copy and relay these credentials to the seller directly using the
                    button below.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const allText = `GenZ Seller Account Credentials\nBusiness: ${credentialsModal.businessName}\nLogin Email: ${credentialsModal.email}\nPassword: ${credentialsModal.password}`;
                  copyToClipboard(allText, "all");
                }}
                className={`h-9 text-xs font-semibold ${PRESSABLE} ${FOCUS_RING}`}
              >
                {copiedAll ? (
                  <Check
                    className="mr-1.5 h-3.5 w-3.5 text-[#3D6B45]"
                    strokeWidth={ICON_STROKE}
                  />
                ) : (
                  <Copy className="mr-1.5 h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                )}
                <span>{copiedAll ? "Copied all" : "Copy all details"}</span>
              </Button>

              <Button
                type="button"
                onClick={() => {
                  setCredentialsModal(null);
                  setActiveStatusFilter("approved");
                }}
                className={`h-9 bg-black text-xs font-semibold text-white hover:bg-neutral-800 ${PRESSABLE} ${FOCUS_RING}`}
              >
                View approved sellers
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
