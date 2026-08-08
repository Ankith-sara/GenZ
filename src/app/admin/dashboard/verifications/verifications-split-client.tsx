"use client";

import React, { useState, useTransition } from "react";
import { PageHeader } from "@/components/ui/organisms/page-header";
import { StatusBadge } from "@/components/ui/atoms/status-badge";
import { EmptyState } from "@/components/ui/organisms/empty-state";
import { approveSeller, rejectSeller } from "./actions";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  FileText,
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
} from "lucide-react";
import { Button } from "@/components/ui/atoms/button";

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
  initialStatus: string;
}

function generateRandomPassword(length = 14): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

export function VerificationsSplitClient({
  initialList,
}: VerificationsSplitClientProps) {
  const [appsList, setAppsList] = useState<SellerAppRecord[]>(initialList);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialList.find((a) => a.status === "pending")?.id || initialList[0]?.id || null
  );

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

  const selectedApp = appsList.find((a) => a.id === selectedId);

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
        });

        setActionSuccess(
          `Application for "${selectedApp.business_name}" approved successfully!`
        );
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
        setActionSuccess(
          `Application for "${selectedApp.business_name}" marked as rejected.`
        );
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
    <div className="font-graphik space-y-6 select-none">
      <PageHeader
        title="Seller Audit & Verification Center"
        description="Review manufacturing verification applications, GST certificates, and clearance status."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Verifications" },
        ]}
      />

      {/* Action Notification Banners */}
      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 shadow-2xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 shadow-2xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* SPLIT LAYOUT GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: APPLICATION LIST (5 Columns) */}
        <div className="space-y-4 lg:col-span-5">
          {/* Status Tabs & Search */}
          <div className="space-y-3 rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-2xs">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#73736E]" />
              <input
                type="text"
                placeholder="Search business, applicant, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg border border-[#E5E5E0] bg-[#FAF8F4] pr-3 pl-9 text-xs text-black placeholder:text-[#A3A39D] focus:border-black focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { value: "pending", label: "Pending", count: counts.pending },
                { value: "approved", label: "Approved", count: counts.approved },
                { value: "rejected", label: "Rejected", count: counts.rejected },
                { value: "all", label: "All", count: counts.all },
              ].map((tab) => {
                const isActive = activeStatusFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveStatusFilter(tab.value)}
                    className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-black text-white shadow-2xs"
                        : "border border-[#E5E5E0] bg-[#FAF8F4] text-[#52524E] hover:bg-[#EBEBE6] hover:text-black"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`py-0.2 rounded-full px-1.5 font-mono text-[10px] ${
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

          {/* Application Stream Cards */}
          <div className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
            {filteredList.length === 0 ? (
              <EmptyState
                icon={<Building2 className="h-6 w-6 text-[#73736E]" />}
                title="No Applications Found"
                description={`No seller profiles listed under "${activeStatusFilter}"`}
              />
            ) : (
              filteredList.map((app) => {
                const isSelected = app.id === selectedId;
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedId(app.id)}
                    className={`group cursor-pointer rounded-xl border p-4 transition-all ${
                      isSelected
                        ? "border-black bg-[#FAF7F0] shadow-2xs"
                        : "border-[#E5E5E0] bg-white hover:border-black/30 hover:bg-[#FAF8F4]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-[#1A1A18] group-hover:underline">
                          {app.business_name}
                        </h4>
                        <p className="mt-0.5 text-xs text-[#73736E]">{app.full_name}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#F0F0EC] pt-2 text-[11px] text-[#73736E]">
                      <span className="max-w-[200px] truncate">{app.email}</span>
                      <span className="font-mono">
                        {new Date(app.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INSPECTOR DETAILS PANEL (7 Columns) */}
        <div className="lg:col-span-7">
          {!selectedApp ? (
            <EmptyState
              icon={<FileText className="h-7 w-7 text-[#73736E]" />}
              title="Select an Application"
              description="Click any seller application from the list on the left to inspect documents and take review actions."
            />
          ) : (
            <div className="space-y-6 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xs">
              {/* Header Inspector */}
              <div className="flex flex-col justify-between gap-4 border-b border-[#F0F0EC] pb-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-[#1A1A18]">
                      {selectedApp.business_name}
                    </h2>
                    <StatusBadge status={selectedApp.status} />
                  </div>
                  <p className="mt-1 font-mono text-xs text-[#73736E]">
                    Application ID: {selectedApp.id}
                  </p>
                </div>

                {/* Primary Clearance Action Buttons */}
                {selectedApp.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={openApproveModal}
                      disabled={isPending}
                      className="h-9 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <FileCheck className="mr-1.5 h-3.5 w-3.5" />
                      <span>Approve Seller</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setShowRejectForm(true)}
                      disabled={isPending}
                      className="h-9 rounded-lg border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      <span>Reject</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Rejection Form Box */}
              {showRejectForm && (
                <form
                  onSubmit={handleRejectSubmit}
                  className="space-y-3 rounded-xl border border-rose-200 bg-rose-50/50 p-4"
                >
                  <h4 className="text-xs font-bold text-rose-900">
                    Provide Reason for Application Rejection
                  </h4>
                  <textarea
                    rows={3}
                    placeholder="State reason for missing documents, invalid GST, etc..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                    className="w-full rounded-lg border border-rose-200 bg-white p-2.5 text-xs text-black focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRejectForm(false)}
                      className="h-8 text-xs font-semibold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPending || !rejectionReason.trim()}
                      className="h-8 bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700"
                    >
                      Confirm Rejection
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
                    <Building2 className="h-3.5 w-3.5 text-[#73736E]" />
                    <span>{selectedApp.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#52524E]">
                    <Mail className="h-3.5 w-3.5 text-[#73736E]" />
                    <span className="truncate">{selectedApp.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#52524E]">
                    <Phone className="h-3.5 w-3.5 text-[#73736E]" />
                    <span>{selectedApp.phone || "No phone provided"}</span>
                  </div>
                </div>

                <div className="space-y-2.5 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-4 text-xs">
                  <h4 className="border-b border-[#E5E5E0] pb-1.5 text-[10px] font-bold tracking-wider text-[#1A1A18] uppercase">
                    Filing Timeline & Origin
                  </h4>
                  <div className="flex items-center gap-2 font-semibold text-black">
                    <Calendar className="h-3.5 w-3.5 text-[#73736E]" />
                    <span>
                      Submitted:{" "}
                      {new Date(selectedApp.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#52524E]">
                    <MapPin className="h-3.5 w-3.5 text-[#73736E]" />
                    <span>
                      {String(selectedApp.form_data?.city || "India")},{" "}
                      {String(selectedApp.form_data?.state || "")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#52524E]">
                    <Clock className="h-3.5 w-3.5 text-[#73736E]" />
                    <span>Type: {selectedApp.business_type || "Manufacturer"}</span>
                  </div>
                </div>
              </div>

              {/* Form Data Metadata Raw View */}
              {selectedApp.form_data && (
                <div className="space-y-2 rounded-xl border border-[#E5E5E0] bg-white p-4 text-xs">
                  <h4 className="border-b border-[#F0F0EC] pb-2 text-[10px] font-bold tracking-wider text-[#1A1A18] uppercase">
                    Submitted Application Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pt-1 font-mono text-[11px]">
                    {Object.entries(selectedApp.form_data).map(([key, val]) => (
                      <div key={key} className="space-y-0.5">
                        <span className="block text-[9px] text-[#73736E] uppercase">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="block truncate font-bold text-black">
                          {String(val || "N/A")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* APPROVAL & CUSTOM CREDENTIALS MODAL */}
      {showApproveModal && selectedApp && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleApproveSubmit}
            className="animate-in fade-in-80 zoom-in-95 w-full max-w-md space-y-5 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xl"
          >
            <div>
              <h3 className="text-lg font-bold text-[#1A1A18]">
                Approve Seller & Set Credentials
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
                <input
                  type="email"
                  required
                  value={approvalEmail}
                  onChange={(e) => setApprovalEmail(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[#E5E5E0] bg-white px-3 font-mono text-xs text-black focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
                    Set Custom Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setApprovalPassword(generateRandomPassword(14))}
                    className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:underline"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Generate Random</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={approvalPassword}
                    onChange={(e) => setApprovalPassword(e.target.value)}
                    className="h-9 flex-1 rounded-lg border border-[#E5E5E0] bg-white px-3 font-mono text-xs text-black focus:border-black focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-9 px-2.5 text-xs"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sendEmailCheck"
                  checked={sendEmailOption}
                  onChange={(e) => setSendEmailOption(e.target.checked)}
                  className="h-4 w-4 rounded border-[#E5E5E0] text-black focus:ring-black"
                />
                <label
                  htmlFor="sendEmailCheck"
                  className="cursor-pointer text-xs text-[#52524E] select-none"
                >
                  Dispatch email notification with credentials
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowApproveModal(false)}
                className="h-9 text-xs font-semibold"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isPending}
                className="h-9 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileCheck className="mr-1.5 h-3.5 w-3.5" />
                )}
                <span>Confirm & Approve</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* CREDENTIALS PROVISIONED SUMMARY MODAL */}
      {credentialsModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="animate-in fade-in-80 zoom-in-95 w-full max-w-md space-y-5 rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xl">
            <div className="border-b border-[#F0F0EC] pb-3">
              <h3 className="text-base font-bold text-[#1A1A18]">
                Seller Credentials Provisioned
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
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={credentialsModal.email}
                    className="h-9 flex-1 rounded-lg border border-[#E5E5E0] bg-white px-3 font-mono text-xs text-black"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copyToClipboard(credentialsModal.email, "email")}
                    className="h-9 px-3 text-xs"
                  >
                    {copiedEmail ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
                  Password Credentials
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    readOnly
                    value={credentialsModal.password}
                    className="h-9 flex-1 rounded-lg border border-[#E5E5E0] bg-white px-3 font-mono text-xs text-black"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-9 px-2.5 text-xs"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(credentialsModal.password, "password")
                    }
                    className="h-9 px-3 text-xs"
                  >
                    {copiedPassword ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#73736E]">
              <span>Dispatch Status:</span>
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                {credentialsModal.emailSent ? "Email Dispatched" : "Credentials Ready"}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const allText = `GenZ Seller Account Credentials\nBusiness: ${credentialsModal.businessName}\nLogin Email: ${credentialsModal.email}\nPassword: ${credentialsModal.password}`;
                  copyToClipboard(allText, "all");
                }}
                className="h-9 text-xs font-semibold"
              >
                {copiedAll ? (
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                )}
                <span>{copiedAll ? "Copied All!" : "Copy All Details"}</span>
              </Button>

              <Button
                type="button"
                onClick={() => {
                  setCredentialsModal(null);
                  setActiveStatusFilter("approved");
                }}
                className="h-9 bg-black text-xs font-semibold text-white hover:bg-neutral-800"
              >
                View Approved Sellers
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
