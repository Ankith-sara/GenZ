"use client";

import React, { useState, useTransition } from "react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

export function VerificationsSplitClient({
  initialList,
}: VerificationsSplitClientProps) {
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialList.find((a) => a.status === "pending")?.id || initialList[0]?.id || null
  );

  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Rejection modal reason text
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const counts = {
    pending: initialList.filter((a) => a.status === "pending").length,
    approved: initialList.filter((a) => a.status === "approved").length,
    rejected: initialList.filter((a) => a.status === "rejected").length,
    all: initialList.length,
  };

  const filteredList = initialList.filter((app) => {
    const matchesStatus =
      activeStatusFilter === "all" || app.status === activeStatusFilter;
    const matchesSearch =
      !searchQuery ||
      app.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const selectedApp = initialList.find((a) => a.id === selectedId);

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setActionError(null);
    setActionSuccess(null);

    const formData = new FormData();
    formData.append("applicationId", selectedApp.id);
    formData.append("email", selectedApp.email);
    formData.append("sendEmail", "on");

    startTransition(async () => {
      const res = await approveSeller({}, formData);
      if (res.error) {
        setActionError(res.error);
      } else {
        setActionSuccess(
          `Application for "${selectedApp.business_name}" approved successfully! Credentials generated.`
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
        setShowRejectForm(false);
        setRejectionReason("");
        setActionSuccess(
          `Application for "${selectedApp.business_name}" marked as rejected.`
        );
      }
    });
  };

  return (
    <div className="space-y-6 select-none">
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
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
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
                className="font-graphik h-9 w-full rounded-lg border border-[#E5E5E0] bg-[#FAF8F4] pr-3 pl-9 text-xs text-black placeholder:text-[#A3A39D] focus:border-black focus:bg-white focus:outline-none"
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
                    className={`font-graphik flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-black text-white"
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
                title="No Applications"
                description={`No applications found under category "${activeStatusFilter}"`}
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
                        ? "border-black bg-[#FAF7F0] shadow-xs"
                        : "border-[#E5E5E0] bg-white hover:border-black/30 hover:bg-[#FAF8F4]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-graphik text-sm font-bold text-[#1A1A18] group-hover:underline">
                          {app.business_name}
                        </h4>
                        <p className="font-graphik mt-0.5 text-xs text-[#73736E]">
                          {app.full_name}
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    <div className="font-graphik mt-3 flex items-center justify-between border-t border-[#F0F0EC] pt-2 text-[11px] text-[#73736E]">
                      <span>{app.email}</span>
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
                    <h2 className="font-graphik text-xl font-bold text-[#1A1A18]">
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
                    <form onSubmit={handleApprove}>
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="font-graphik h-9 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {isPending ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <FileCheck className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        <span>Approve Seller</span>
                      </Button>
                    </form>

                    <Button
                      variant="outline"
                      onClick={() => setShowRejectForm(true)}
                      disabled={isPending}
                      className="font-graphik h-9 rounded-lg border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100"
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
                  <h4 className="font-graphik text-xs font-bold text-rose-900">
                    Provide Reason for Application Rejection
                  </h4>
                  <textarea
                    rows={3}
                    placeholder="State reason for missing documents, invalid GST, etc..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                    className="font-graphik w-full rounded-lg border border-rose-200 bg-white p-2.5 text-xs text-black focus:ring-1 focus:ring-rose-500 focus:outline-none"
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
                <div className="font-graphik space-y-2.5 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-4 text-xs">
                  <h4 className="border-b border-[#E5E5E0] pb-1.5 text-[10px] font-bold tracking-wider text-[#1A1A18] uppercase">
                    Contact & Key Person
                  </h4>
                  <div className="flex items-center gap-2 font-semibold text-black">
                    <Building2 className="h-3.5 w-3.5 text-[#73736E]" />
                    <span>{selectedApp.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#52524E]">
                    <Mail className="h-3.5 w-3.5 text-[#73736E]" />
                    <span>{selectedApp.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#52524E]">
                    <Phone className="h-3.5 w-3.5 text-[#73736E]" />
                    <span>{selectedApp.phone || "No phone provided"}</span>
                  </div>
                </div>

                <div className="font-graphik space-y-2.5 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-4 text-xs">
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
                <div className="font-graphik space-y-2 rounded-xl border border-[#E5E5E0] bg-white p-4 text-xs">
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
    </div>
  );
}
