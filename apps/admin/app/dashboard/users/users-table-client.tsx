"use client";

import React, { useState, useMemo } from "react";
import { StatusBadge } from "@genz/ui";
import { ActionDropdown } from "@genz/ui";
import { SlideOverDrawer } from "@genz/ui";
import {
  Search,
  Download,
  UserPlus,
  Users as UsersIcon,
  Shield,
  Building2,
  Calendar,
  MapPin,
  RotateCcw,
  UserCheck,
} from "lucide-react";
import { Button } from "@genz/ui";

export interface ProfileRecord {
  id: string;
  full_name: string | null;
  role: string;
  city?: string | null;
  state?: string | null;
  created_at?: string | null;
  last_active_at?: string | null;
}

interface UsersTableClientProps {
  initialProfiles: ProfileRecord[];
}

const ICON_STROKE = 1.75;
const PRESSABLE =
  "cursor-pointer transition-all duration-150 ease-out active:scale-[0.98] disabled:active:scale-100 disabled:cursor-not-allowed";
const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]/20 focus-visible:ring-offset-1 focus-visible:ring-offset-white";

export function UsersTableClient({ initialProfiles }: UsersTableClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<ProfileRecord | null>(null);

  const counts = useMemo(() => {
    return {
      all: initialProfiles.length,
      buyer: initialProfiles.filter(
        (p) => (p.role || "buyer").toLowerCase() === "buyer"
      ).length,
      seller: initialProfiles.filter(
        (p) => p.role?.toLowerCase() === "seller"
      ).length,
      admin: initialProfiles.filter(
        (p) => p.role?.toLowerCase() === "admin"
      ).length,
    };
  }, [initialProfiles]);

  const filteredProfiles = useMemo(() => {
    return initialProfiles.filter((p) => {
      const userRole = (p.role || "buyer").toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (p.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "all" || userRole === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [initialProfiles, searchQuery, roleFilter]);

  const getOnlineState = (dateStr?: string | null) => {
    if (!dateStr) return { status: "offline", label: "Offline" };
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = (now.getTime() - date.getTime()) / (1000 * 60);
    if (diffMins <= 60) return { status: "active", label: "Online" };
    if (diffMins <= 1440) return { status: "processing", label: "Active Today" };
    return { status: "offline", label: "Offline" };
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Full Name,Role,Location,Created At"]
        .concat(
          filteredProfiles.map(
            (p) =>
              `${p.id},"${p.full_name || ""}",${p.role},"${p.city || ""} ${p.state || ""}",${p.created_at || ""}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `genz_users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 pb-12 text-[#171717]">
      {/* ENTERPRISE PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#E5E5E5] pb-5 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <nav className="flex items-center gap-1.5 text-xs text-[#737373]">
            <span>Admin</span>
            <span>/</span>
            <span className="font-medium text-[#171717]">Users</span>
          </nav>
          <h1 className="text-2xl font-semibold tracking-tight text-[#171717] sm:text-[30px] sm:leading-tight">
            User Directory
          </h1>
          <p className="text-xs text-[#737373] sm:text-sm">
            Comprehensive directory of registered buyers, sellers, and system administrator accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCSV}
            className={`h-9 flex-1 sm:flex-initial rounded-lg border-[#E5E5E5] bg-white px-3.5 text-xs font-medium text-[#171717] hover:bg-[#FAFAF9] ${PRESSABLE} ${FOCUS_RING}`}
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-[#737373]" strokeWidth={ICON_STROKE} />
            <span>Export CSV</span>
          </Button>
          <Button
            type="button"
            onClick={() => alert("Invite User modal opened")}
            className={`h-9 flex-1 sm:flex-initial rounded-lg bg-[#171717] px-3.5 text-xs font-medium text-white shadow-xs hover:bg-[#262626] ${PRESSABLE} ${FOCUS_RING}`}
          >
            <UserPlus className="mr-1.5 h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            <span>Invite User</span>
          </Button>
        </div>
      </div>

      {/* RESPONSIVE SEGMENTED ROLE NAVIGATION & SEARCH TOOLBAR */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Horizontal Scrollable Role Segmented Tabs on Mobile */}
        <div className="inline-flex max-w-full overflow-x-auto whitespace-nowrap scrollbar-none items-center gap-1.5 rounded-xl border border-[#E5E5E5] bg-[#FAFAF9] p-1">
          {[
            { value: "all", label: "All Users", count: counts.all },
            { value: "buyer", label: "Buyers", count: counts.buyer },
            { value: "seller", label: "Sellers", count: counts.seller },
            { value: "admin", label: "Admins", count: counts.admin },
          ].map((tab) => {
            const isActive = roleFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setRoleFilter(tab.value)}
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

        {/* Responsive Search Input */}
        <div className="relative w-full lg:w-96">
          <Search
            className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#737373]"
            strokeWidth={ICON_STROKE}
          />
          <input
            type="text"
            placeholder="Search by name, email, or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`h-11 w-full rounded-xl border border-[#E5E5E5] bg-white pr-3.5 pl-10 text-xs text-[#171717] transition-all placeholder:text-[#A3A3A3] focus:border-[#171717] focus:bg-white ${FOCUS_RING}`}
          />
        </div>
      </div>

      {/* RESULTS HEADER */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-sm font-semibold text-[#171717] sm:text-base">
          User Profiles
        </h2>
        <span className="text-xs text-[#737373]">
          {filteredProfiles.length} {filteredProfiles.length === 1 ? "result" : "results"}
        </span>
      </div>

      {/* DATA TABLE OR COMPACT EMPTY STATE */}
      {filteredProfiles.length === 0 ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-[#FAFAF9] px-6 py-10 text-center">
          <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[#525252] shadow-xs">
            <UsersIcon className="h-5 w-5 text-[#737373]" strokeWidth={ICON_STROKE} />
          </div>
          <h3 className="text-sm font-semibold text-[#171717] sm:text-base">
            No users found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-[#737373] sm:text-sm">
            There are no account profiles matching the selected role or search query.
          </p>
          {(searchQuery || roleFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
              }}
              className={`mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-white px-3 text-xs font-medium text-[#171717] hover:bg-[#F5F5F4] ${PRESSABLE} ${FOCUS_RING}`}
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#737373]" strokeWidth={ICON_STROKE} />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      ) : (
        /* RESPONSIVE DATA TABLE */
        <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="border-b border-[#E5E5E5] bg-[#FAFAF9] text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">User Details</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Session Status</th>
                  <th className="px-4 py-3">Registered Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] bg-white">
                {filteredProfiles.map((user) => {
                  const sessionState = getOnlineState(user.last_active_at);
                  const createdFormatted = user.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })
                    : "Unknown";

                  return (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="group cursor-pointer transition-colors duration-150 hover:bg-[#FAFAF9]/80"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E5E5] bg-[#FAFAF9] text-xs font-semibold text-[#171717]">
                            {(user.full_name || "U")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="block font-semibold text-[#171717] group-hover:underline truncate">
                              {user.full_name || "Anonymous User"}
                            </span>
                            <span className="block font-mono text-[10px] text-[#737373]">
                              ID: {user.id.slice(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge status={user.role || "buyer"} />
                      </td>

                      <td className="px-4 py-3.5 text-[#525252]">
                        {user.city
                          ? `${user.city}${user.state ? `, ${user.state}` : ""}`
                          : user.state || "-"}
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge
                          status={sessionState.status}
                          label={sessionState.label}
                        />
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-[#737373]">
                        {createdFormatted}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <ActionDropdown
                          actions={[
                            {
                              label: "View Profile Drawer",
                              icon: <UserCheck className="h-3.5 w-3.5 text-[#737373]" />,
                              onClick: () => setSelectedUser(user),
                            },
                            {
                              label: "Copy User ID",
                              onClick: () => navigator.clipboard.writeText(user.id),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROFILE SLIDE-OVER DRAWER */}
      <SlideOverDrawer
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.full_name || "User Details"}
        subtitle={`Role: ${selectedUser?.role || "buyer"} · Account ID: ${selectedUser?.id}`}
        maxWidth="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="flex items-center gap-4 rounded-xl border border-[#E5E5E5] bg-[#FAFAF9] p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#171717] text-base font-semibold text-white">
                {(selectedUser.full_name || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-[#171717] truncate">
                  {selectedUser.full_name || "Anonymous User"}
                </h3>
                <p className="font-mono text-xs text-[#737373] truncate">
                  ID: {selectedUser.id}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={selectedUser.role || "active"} />
                  <StatusBadge status="active" label="Account Active" />
                </div>
              </div>
            </div>

            {/* Profile Overview Meta */}
            <div className="space-y-3 rounded-xl border border-[#E5E5E5] bg-white p-4">
              <h4 className="border-b border-[#E5E5E5] pb-2 text-[10px] font-semibold tracking-wider text-[#171717] uppercase">
                Account Information
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#737373]">
                    <Shield className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} /> Role Authorization
                  </span>
                  <span className="font-semibold text-[#171717] uppercase">
                    {selectedUser.role}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#737373]">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} /> Primary Region
                  </span>
                  <span className="font-medium text-[#171717]">
                    {selectedUser.city
                      ? `${selectedUser.city}${selectedUser.state ? `, ${selectedUser.state}` : ""}`
                      : selectedUser.state || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#737373]">
                    <Calendar className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} /> Joined Date
                  </span>
                  <span className="font-mono text-xs text-[#171717]">
                    {selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "2026"}
                  </span>
                </div>
              </div>
            </div>

            {/* Seller Specific Box */}
            {selectedUser.role === "seller" && (
              <div className="space-y-2 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-800" strokeWidth={ICON_STROKE} />
                  <span className="text-xs font-semibold text-amber-900">
                    Seller Portal Access
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-amber-800/90">
                  This user has a registered factory profile. Clearance and audit
                  documents can be inspected in the Verifications desk.
                </p>
              </div>
            )}
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
}
