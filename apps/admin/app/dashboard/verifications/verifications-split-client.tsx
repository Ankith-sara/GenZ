"use client";

import React, { useState, useTransition } from "react";
import { StatusBadge } from "@genz/ui";
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
  ShieldCheck,
  RotateCcw,
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

const ICON_STROKE = 1.75;
const PRESSABLE =
  "cursor-pointer transition-all duration-150 ease-out active:scale-[0.98] disabled:active:scale-100 disabled:cursor-not-allowed";
const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/20 focus-visible:ring-offset-1 focus-visible:ring-offset-white";

export function VerificationsSplitClient({
  initialList,
  initialStatus = "pending",
}: VerificationsSplitClientProps) {
  const [appsList, setAppsList] = useState<SellerAppRecord[]>(initialList);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>(initialStatus);
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
    all: appsList.length,
    pending: appsList.filter((a) => a.status === "pending").length,
    approved: appsList.filter((a) => a.status === "approved").length,
    rejected: appsList.filter((a) => a.status === "rejected").length,
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
    <div className="mx-auto max-w-[1440px] space-y-6 pb-12 text-[#171717]">
      {/* COMPACT ENTERPRISE PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#E5E5E5] pb-5 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <nav className="flex items-center gap-1.5 text-xs text-[#737373]">
            <span>Admin</span>
            <span>/</span>
            <span className="font-medium text-[#171717]">Verifications</span>
          </nav>
          <h1 className="text-2xl font-semibold tracking-tight text-[#171717] sm:text-[30px] sm:leading-tight">
            Seller Verification
          </h1>
          <p className="text-xs text-[#737373] sm:text-sm">
            Review seller applications, manufacturing verification, GST documentation, and compliance status.
          </p>
        </div>
      </div>

      {/* ACTION NOTIFICATION BANNERS */}
      {actionError && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl border border-[#FCA5A5]/60 bg-[#FEF2F2] px-4 py-3 text-xs font-medium text-[#991B1B]"
        >
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={ICON_STROKE} />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-xl border border-[#86EFAC]/60 bg-[#F0FDF4] px-4 py-3 text-xs font-medium text-[#166534]"
        >
          <CheckCircle2
            className="h-4 w-4 shrink-0 text-[#15803D]"
            strokeWidth={ICON_STROKE}
          />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* RESPONSIVE SEGMENTED STATUS NAVIGATION & SEARCH TOOLBAR */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Horizontal Scrollable Status Tabs on Mobile */}
        <div className="inline-flex max-w-full overflow-x-auto whitespace-nowrap scrollbar-none items-center gap-1.5 rounded-xl border border-[#E5E5E5] bg-[#FAFAF9] p-1">
          {[
            { value: "all", label: "All", count: counts.all },
            { value: "pending", label: "Pending Review", count: counts.pending },
            { value: "approved", label: "Approved", count: counts.approved },
            { value: "rejected", label: "Rejected", count: counts.rejected },
          ].map((tab) => {
            const isActive = activeStatusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveStatusFilter(tab.value)}
                className={`flex h-8 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-medium ${PRESSABLE} ${FOCUS_RING} ${
                  isActive
                    ? "bg-[#171717] text-white shadow-xs"
                    : "bg-transparent text-[#525252] hover:bg-white hover:text-[#171717]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-md px-1.5 py-0.25 font-mono text-[10px] tabular-nums ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#E5E5E5]/70 text-[#737373]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Responsive Search Field */}
        <div className="relative w-full lg:w-96">
          <Search
            className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#737373]"
            strokeWidth={ICON_STROKE}
          />
          <input
            type="text"
            placeholder="Search business name, applicant, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`h-11 w-full rounded-xl border border-[#E5E5E5] bg-white pr-3.5 pl-10 text-xs text-[#171717] transition-all placeholder:text-[#A3A3A3] focus:border-[#171717] focus:bg-white ${FOCUS_RING}`}
          />
        </div>
      </div>

      {/* RESULTS SECTION HEADER */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-sm font-semibold text-[#171717] sm:text-base">
          Seller Applications
        </h2>
        <span className="text-xs text-[#737373]">
          {filteredList.length} {filteredList.length === 1 ? "result" : "results"}
        </span>
      </div>

      {/* POPULATED RESULTS OR POLISHED COMPACT EMPTY STATE */}
      {filteredList.length === 0 ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-[#FAFAF9] px-6 py-10 text-center">
          <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[#525252] shadow-xs">
            <ShieldCheck className="h-5 w-5 text-[#737373]" strokeWidth={ICON_STROKE} />
          </div>
          <h3 className="text-sm font-semibold text-[#171717] sm:text-base">
            No seller applications found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-[#737373] sm:text-sm">
            There are no applications matching the selected status or search criteria.
          </p>
          {(searchQuery || activeStatusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveStatusFilter("all");
              }}
              className={`mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs font-medium text-[#171717] hover:bg-[#F5F5F4] ${PRESSABLE} ${FOCUS_RING}`}
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#737373]" strokeWidth={ICON_STROKE} />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      ) : (
        /* RESPONSIVE VERIFICATION TABLE */
        <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[768px] text-left text-xs">
              <thead className="border-b border-[#E5E5E5] bg-[#FAFAF9] text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Verification & Location</th>
                  <th className="px-4 py-3">GST / Tax ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] bg-white">
                {filteredList.map((app) => {
                  const isSelected = selectedId === app.id;
                  const gstVal = String(app.form_data?.gst_number || "Pending");
                  return (
                    <tr
                      key={app.id}
                      onClick={() => setSelectedId(app.id)}
                      className={`group cursor-pointer transition-colors duration-150 ${
                        isSelected
                          ? "bg-[#FAFAF9]"
                          : "hover:bg-[#FAFAF9]/80"
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] text-[#171717]">
                            <Building2
                              className="h-4 w-4 text-[#525252]"
                              strokeWidth={ICON_STROKE}
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="block font-semibold text-[#171717] group-hover:underline truncate">
                              {app.business_name}
                            </span>
                            <span className="block font-mono text-[10px] text-[#737373]">
                              ID: {app.id.slice(0, 8)}…
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div>
                          <span className="block font-medium text-[#171717]">
                            {app.full_name}
                          </span>
                          <span className="block font-mono text-[11px] text-[#737373]">
                            {app.email}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-[#525252]">
                        <div>
                          <span className="block font-medium">
                            {String(app.form_data?.city || "India")},{" "}
                            {String(app.form_data?.state || "")}
                          </span>
                          <span className="block text-[11px] text-[#737373]">
                            {getBusinessCategoryLabel(app)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-[#525252]">
                        {gstVal}
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge status={app.status} />
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-[#737373] tabular-nums">
                        {new Date(app.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(app.id);
                          }}
                          className={`h-8 rounded-lg border-[#E5E5E5] bg-white px-2.5 text-xs font-medium text-[#171717] hover:border-[#171717] hover:bg-[#171717] hover:text-white ${PRESSABLE} ${FOCUS_RING}`}
                        >
                          <span>Review</span>
                          <ChevronRight
                            className="ml-1 h-3.5 w-3.5 text-[#737373] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-white"
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

      {/* RESPONSIVE AUDIT SLIDE-OVER DRAWER */}
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
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#E5E5E5] bg-[#FAFAF9] p-4 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                    Current Status:
                  </span>
                  <StatusBadge status={selectedApp.status} />
                </div>
              </div>

              {/* Clearance Action Buttons */}
              {selectedApp.status === "pending" && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={openApproveModal}
                    disabled={isPending}
                    className={`h-8 flex-1 sm:flex-initial rounded-lg bg-[#166534] px-3.5 text-xs font-medium text-white shadow-xs hover:bg-[#14532D] disabled:opacity-50 ${PRESSABLE} ${FOCUS_RING}`}
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
                    className={`h-8 flex-1 sm:flex-initial rounded-lg border border-[#991B1B] bg-[#991B1B] px-3.5 text-xs font-medium text-white shadow-xs hover:bg-[#7F1D1D] disabled:opacity-50 ${PRESSABLE} ${FOCUS_RING}`}
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
                className="space-y-3 rounded-xl border border-[#FCA5A5]/60 bg-[#FEF2F2] p-4"
              >
                <h4 className="text-xs font-semibold text-[#991B1B]">
                  Reason for rejection
                </h4>
                <textarea
                  rows={3}
                  placeholder="Missing documents, invalid GST number, unreadable factory photos…"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  className={`w-full rounded-lg border border-[#FCA5A5] bg-white p-2.5 text-xs text-[#171717] transition-colors focus:border-[#991B1B] ${FOCUS_RING}`}
                />
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRejectForm(false)}
                    className={`h-8 w-full sm:w-auto text-xs font-medium ${PRESSABLE} ${FOCUS_RING}`}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending || !rejectionReason.trim()}
                    className={`h-8 w-full sm:w-auto bg-[#991B1B] text-xs font-medium text-white hover:bg-[#7F1D1D] disabled:opacity-50 ${PRESSABLE} ${FOCUS_RING}`}
                  >
                    Confirm rejection
                  </Button>
                </div>
              </form>
            )}

            {/* Applicant Metadata Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2.5 rounded-xl border border-[#E5E5E5] bg-[#FAFAF9] p-4 text-xs">
                <h4 className="border-b border-[#E5E5E5] pb-1.5 text-[10px] font-semibold tracking-wider text-[#171717] uppercase">
                  Contact & Key Person
                </h4>
                <div className="flex items-center gap-2 font-medium text-[#171717]">
                  <Building2
                    className="h-3.5 w-3.5 text-[#737373]"
                    strokeWidth={ICON_STROKE}
                  />
                  <span>{selectedApp.full_name}</span>
                </div>
                <div className="flex items-center gap-2 text-[#525252]">
                  <Mail
                    className="h-3.5 w-3.5 text-[#737373]"
                    strokeWidth={ICON_STROKE}
                  />
                  <span className="truncate">{selectedApp.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#525252]">
                  <Phone
                    className="h-3.5 w-3.5 text-[#737373]"
                    strokeWidth={ICON_STROKE}
                  />
                  <span>{selectedApp.phone || "No phone provided"}</span>
                </div>
              </div>

              <div className="space-y-2.5 rounded-xl border border-[#E5E5E5] bg-[#FAFAF9] p-4 text-xs">
                <h4 className="border-b border-[#E5E5E5] pb-1.5 text-[10px] font-semibold tracking-wider text-[#171717] uppercase">
                  Filing Timeline & Origin
                </h4>
                <div className="flex items-center gap-2 font-medium text-[#171717]">
                  <Calendar
                    className="h-3.5 w-3.5 text-[#737373]"
                    strokeWidth={ICON_STROKE}
                  />
                  <span>
                    Submitted:{" "}
                    {new Date(selectedApp.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#525252]">
                  <MapPin
                    className="h-3.5 w-3.5 text-[#737373]"
                    strokeWidth={ICON_STROKE}
                  />
                  <span>
                    {String(selectedApp.form_data?.city || "India")},{" "}
                    {String(selectedApp.form_data?.state || "")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#525252]">
                  <Clock
                    className="h-3.5 w-3.5 text-[#737373]"
                    strokeWidth={ICON_STROKE}
                  />
                  <span>Category: {getBusinessCategoryLabel(selectedApp)}</span>
                </div>
              </div>
            </div>

            {/* Form Data Application Details View */}
            {selectedApp.form_data && (
              <div className="space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-4 sm:p-5 shadow-xs">
                <h4 className="text-xs font-semibold tracking-wider text-[#171717] uppercase">
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
                          <label className="block text-[10px] font-semibold tracking-wider text-[#737373] uppercase">
                            {label}
                          </label>
                          <div className="flex min-h-[38px] items-center rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] px-3 py-2 text-xs font-medium text-[#171717]">
                            {isUrl ? (
                              <a
                                href={stringVal}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 font-medium break-all text-[#1D4ED8] hover:underline ${FOCUS_RING}`}
                              >
                                <span>Open document / link</span>
                                <ExternalLink
                                  className="h-3.5 w-3.5"
                                  strokeWidth={ICON_STROKE}
                                />
                              </a>
                            ) : (
                              <span className="font-sans text-xs break-words text-[#171717]">
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

      {/* RESPONSIVE APPROVAL & CUSTOM CREDENTIALS MODAL */}
      {showApproveModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleApproveSubmit}
            className="w-full max-w-md space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-lg"
          >
            <div>
              <h3 className="text-base font-semibold text-[#171717]">
                Approve seller & set credentials
              </h3>
              <p className="text-xs text-[#737373]">
                Configure access for{" "}
                <strong className="text-[#171717]">{selectedApp.business_name}</strong>
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] p-3.5 text-xs">
              <div>
                <label className="mb-1 block text-[10px] font-semibold tracking-wider text-[#737373] uppercase">
                  Login Email Address
                </label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    required
                    value={approvalEmail}
                    onChange={(e) => setApprovalEmail(e.target.value)}
                    className={`h-9 w-full rounded-lg border border-[#E5E5E5] bg-white pr-9 pl-3 font-mono text-xs text-[#171717] transition-colors focus:border-[#171717] ${FOCUS_RING}`}
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(approvalEmail, "email")}
                    className={`absolute right-1.5 flex h-6 w-6 items-center justify-center rounded text-[#737373] hover:bg-[#FAFAF9] hover:text-[#171717] ${PRESSABLE} ${FOCUS_RING}`}
                    title="Copy email address"
                  >
                    {copiedEmail ? (
                      <Check
                        className="h-3.5 w-3.5 text-[#166534]"
                        strokeWidth={ICON_STROKE}
                      />
                    ) : (
                      <Copy className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-[10px] font-semibold tracking-wider text-[#737373] uppercase">
                    Set Custom Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setApprovalPassword(generateRandomPassword(14))}
                    className={`flex items-center gap-1 text-[11px] font-medium text-[#166534] hover:underline ${FOCUS_RING}`}
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
                    className={`h-9 w-full rounded-lg border border-[#E5E5E5] bg-white pr-16 pl-3 font-mono text-xs text-[#171717] transition-colors focus:border-[#171717] ${FOCUS_RING}`}
                  />
                  <div className="absolute right-1.5 flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`flex h-6 w-6 items-center justify-center rounded text-[#737373] hover:bg-[#FAFAF9] hover:text-[#171717] ${PRESSABLE} ${FOCUS_RING}`}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                      ) : (
                        <Eye className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(approvalPassword, "password")}
                      className={`flex h-6 w-6 items-center justify-center rounded text-[#737373] hover:bg-[#FAFAF9] hover:text-[#171717] ${PRESSABLE} ${FOCUS_RING}`}
                      title="Copy password"
                    >
                      {copiedPassword ? (
                        <Check
                          className="h-3.5 w-3.5 text-[#166534]"
                          strokeWidth={ICON_STROKE}
                        />
                      ) : (
                        <Copy className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <label
                htmlFor="sendEmailCheck"
                className="flex cursor-pointer items-center gap-2 pt-1"
              >
                <input
                  type="checkbox"
                  id="sendEmailCheck"
                  checked={sendEmailOption}
                  onChange={(e) => setSendEmailOption(e.target.checked)}
                  className={`h-4 w-4 rounded border-[#E5E5E5] text-[#171717] focus:ring-[#171717] ${FOCUS_RING}`}
                />
                <span className="text-xs text-[#525252]">
                  Dispatch email notification with credentials
                </span>
              </label>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowApproveModal(false)}
                className={`h-8 w-full sm:w-auto text-xs font-medium ${PRESSABLE} ${FOCUS_RING}`}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isPending}
                className={`h-8 w-full sm:w-auto bg-[#166534] text-xs font-medium text-white hover:bg-[#14532D] disabled:opacity-50 ${PRESSABLE} ${FOCUS_RING}`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-lg">
            <div className="border-b border-[#E5E5E5] pb-3">
              <h3 className="text-base font-semibold text-[#171717]">
                Seller credentials provisioned
              </h3>
              <p className="text-xs text-[#737373]">
                Account generated for{" "}
                <strong className="text-[#171717]">{credentialsModal.businessName}</strong>
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] p-3.5 text-xs">
              <div>
                <label className="mb-1 block text-[10px] font-semibold tracking-wider text-[#737373] uppercase">
                  Login Email
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={credentialsModal.email}
                    className={`h-9 w-full rounded-lg border border-[#E5E5E5] bg-white pr-9 pl-3 font-mono text-xs text-[#171717] ${FOCUS_RING}`}
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(credentialsModal.email, "email")}
                    className={`absolute right-1.5 flex h-6 w-6 items-center justify-center rounded text-[#737373] hover:bg-[#FAFAF9] hover:text-[#171717] ${PRESSABLE} ${FOCUS_RING}`}
                    title="Copy email address"
                  >
                    {copiedEmail ? (
                      <Check
                        className="h-3.5 w-3.5 text-[#166534]"
                        strokeWidth={ICON_STROKE}
                      />
                    ) : (
                      <Copy className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold tracking-wider text-[#737373] uppercase">
                  Password Credentials
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    readOnly
                    value={credentialsModal.password}
                    className={`h-9 w-full rounded-lg border border-[#E5E5E5] bg-white pr-16 pl-3 font-mono text-xs text-[#171717] ${FOCUS_RING}`}
                  />
                  <div className="absolute right-1.5 flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`flex h-6 w-6 items-center justify-center rounded text-[#737373] hover:bg-[#FAFAF9] hover:text-[#171717] ${PRESSABLE} ${FOCUS_RING}`}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                      ) : (
                        <Eye className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(credentialsModal.password, "password")
                      }
                      className={`flex h-6 w-6 items-center justify-center rounded text-[#737373] hover:bg-[#FAFAF9] hover:text-[#171717] ${PRESSABLE} ${FOCUS_RING}`}
                      title="Copy password"
                    >
                      {copiedPassword ? (
                        <Check
                          className="h-3.5 w-3.5 text-[#166534]"
                          strokeWidth={ICON_STROKE}
                        />
                      ) : (
                        <Copy className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#737373]">
                <span>Email dispatch:</span>
                <span
                  className={`rounded-md border px-2 py-0.5 font-semibold ${
                    credentialsModal.emailSent
                      ? "border-[#86EFAC] bg-[#F0FDF4] text-[#166534]"
                      : "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]"
                  }`}
                >
                  {credentialsModal.emailSent
                    ? "Sent successfully"
                    : "Not sent — manual copy required"}
                </span>
              </div>
              {!credentialsModal.emailSent && (
                <div className="mt-2 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-2.5 text-xs text-[#92400E]">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle
                      className="h-4 w-4 shrink-0 text-[#D97706]"
                      strokeWidth={ICON_STROKE}
                    />
                    <span>Email dispatch failed</span>
                  </div>
                  <p className="mt-1 text-[11px]">
                    {credentialsModal.emailError
                      ? `Reason: ${credentialsModal.emailError}.`
                      : "Credentials were provisioned."}{" "}
                    Copy and relay these credentials to the seller directly.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const allText = `GenZ Seller Account Credentials\nBusiness: ${credentialsModal.businessName}\nLogin Email: ${credentialsModal.email}\nPassword: ${credentialsModal.password}`;
                  copyToClipboard(allText, "all");
                }}
                className={`h-8 w-full sm:w-auto text-xs font-medium ${PRESSABLE} ${FOCUS_RING}`}
              >
                {copiedAll ? (
                  <Check
                    className="mr-1.5 h-3.5 w-3.5 text-[#166534]"
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
                className={`h-8 w-full sm:w-auto bg-[#171717] text-xs font-medium text-white hover:bg-[#262626] ${PRESSABLE} ${FOCUS_RING}`}
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
