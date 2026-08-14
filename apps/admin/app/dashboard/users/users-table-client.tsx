"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@genz/ui";
import { StatusBadge } from "@genz/ui";
import { ActionDropdown } from "@genz/ui";
import { SlideOverDrawer } from "@genz/ui";
import { EmptyState } from "@genz/ui";
import {
  Search,
  Download,
  UserPlus,
  Filter,
  Users as UsersIcon,
  Shield,
  Building2,
  Calendar,
  MapPin,
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

export function UsersTableClient({ initialProfiles }: UsersTableClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<ProfileRecord | null>(null);

  const filteredProfiles = useMemo(() => {
    return initialProfiles.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        (p.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "all" || p.role?.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [initialProfiles, searchQuery, roleFilter]);

  const getOnlineState = (dateStr?: string | null) => {
    if (!dateStr) return { status: "offline", label: "Offline" };
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = (now.getTime() - date.getTime()) / (1000 * 60);
    if (diffMins <= 15) return { status: "active", label: "Online Now" };
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
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="User Profiles & Access Directory"
        description="Comprehensive directory of registered buyers, sellers, and system admin accounts."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Users" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="font-graphik h-9 rounded-lg border-[#E5E5E0] bg-white px-3 text-xs font-semibold text-black hover:bg-[#FAF7F0]"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-[#73736E]" />
              <span>Export CSV</span>
            </Button>
            <Button
              onClick={() => alert("Invite User modal opened")}
              className="font-graphik h-9 rounded-lg bg-black px-3.5 text-xs font-semibold text-white shadow-2xs hover:bg-neutral-800"
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              <span>Invite User</span>
            </Button>
          </div>
        }
      />

      {/* 2. TOOLBAR (Search, Filters) */}
      <div className="flex flex-col gap-3 border-b border-[#E5E5E0] pb-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#73736E]" />
          <input
            type="text"
            placeholder="Search by name, email, or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="font-graphik h-9 w-full rounded-lg border border-[#E5E5E0] bg-white pr-3 pl-9 text-xs text-black transition-all placeholder:text-[#A3A39D] focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-[#73736E]">
            <Filter className="h-3.5 w-3.5 text-[#73736E]" />
            <span className="font-semibold text-black">Role:</span>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="font-graphik h-9 rounded-lg border border-[#E5E5E0] bg-white px-3 text-xs font-semibold text-black focus:border-black focus:outline-none"
          >
            <option value="all">All Roles ({initialProfiles.length})</option>
            <option value="seller">Sellers Only</option>
            <option value="buyer">Buyers Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>
      </div>

      {/* 3. DATA TABLE */}
      {filteredProfiles.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="h-7 w-7 text-[#73736E]" />}
          title="No Users Found"
          description={`No registered account matching "${searchQuery || roleFilter}"`}
          primaryAction={{
            label: "Reset Filters",
            onClick: () => {
              setSearchQuery("");
              setRoleFilter("all");
            },
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E5E5E0] bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="font-graphik w-full text-left text-xs">
              <thead className="sticky top-0 z-10 border-b border-[#E5E5E0] bg-[#FAF8F4] text-[10px] font-bold tracking-wider text-[#73736E] uppercase">
                <tr>
                  <th className="p-3.5 pl-4">User Details</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Session Status</th>
                  <th className="p-3.5">Registered Date</th>
                  <th className="p-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EC] bg-white">
                {filteredProfiles.map((user) => {
                  const sessionState = getOnlineState(
                    user.last_active_at || user.created_at
                  );
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
                      className="group h-14 cursor-pointer transition-colors hover:bg-[#FAF7F0]/80"
                    >
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E5E0] bg-[#FAF7F0] text-xs font-bold text-black shadow-2xs">
                            {(user.full_name || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="block font-semibold text-[#1A1A18] group-hover:underline">
                              {user.full_name || "Anonymous User"}
                            </span>
                            <span className="block font-mono text-[10px] text-[#73736E]">
                              ID: {user.id.slice(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <StatusBadge
                          status={
                            user.role === "seller"
                              ? "processing"
                              : user.role === "admin"
                                ? "rejected"
                                : "active"
                          }
                          label={user.role || "buyer"}
                        />
                      </td>

                      <td className="p-3.5 text-[#52524E]">
                        {user.city
                          ? `${user.city}${user.state ? `, ${user.state}` : ""}`
                          : "India"}
                      </td>

                      <td className="p-3.5">
                        <StatusBadge
                          status={sessionState.status}
                          label={sessionState.label}
                        />
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-[#73736E]">
                        {createdFormatted}
                      </td>

                      <td className="p-3.5 pr-4 text-right">
                        <ActionDropdown
                          actions={[
                            {
                              label: "View Profile Drawer",
                              icon: <UsersIcon className="h-3.5 w-3.5" />,
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

      {/* 4. RIGHT-SIDE PROFILE SLIDE-OVER DRAWER */}
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
            <div className="flex items-center gap-4 rounded-xl border border-[#E5E5E0] bg-[#FAF8F4] p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black text-lg font-bold text-white shadow-2xs">
                {(selectedUser.full_name || "U")[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-graphik text-lg font-bold text-[#1A1A18]">
                  {selectedUser.full_name || "Anonymous User"}
                </h3>
                <p className="font-mono text-xs text-[#73736E]">
                  ID: {selectedUser.id}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={selectedUser.role || "active"} />
                  <StatusBadge status="active" label="Account Active" />
                </div>
              </div>
            </div>

            {/* Profile Overview Meta */}
            <div className="space-y-3 rounded-xl border border-[#E5E5E0] bg-white p-4">
              <h4 className="font-graphik border-b border-[#F0F0EC] pb-2 text-xs font-bold tracking-wider text-[#1A1A18] uppercase">
                Account Information
              </h4>

              <div className="font-graphik space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#73736E]">
                    <Shield className="h-3.5 w-3.5" /> Role Authorization
                  </span>
                  <span className="font-semibold text-black uppercase">
                    {selectedUser.role}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#73736E]">
                    <MapPin className="h-3.5 w-3.5" /> Primary Region
                  </span>
                  <span className="font-semibold text-black">
                    {selectedUser.city || "Tamil Nadu"}, India
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#73736E]">
                    <Calendar className="h-3.5 w-3.5" /> Joined Date
                  </span>
                  <span className="font-mono text-xs text-black">
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
              <div className="space-y-2 rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-800" />
                  <span className="font-graphik text-xs font-bold text-amber-900">
                    Seller Portal Access
                  </span>
                </div>
                <p className="font-graphik text-xs leading-relaxed text-amber-800/90">
                  This user has a registered factory profile. Clearance and audit
                  documents can be inspected in Verifications desk.
                </p>
              </div>
            )}
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
}
