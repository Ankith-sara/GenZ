"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Plus,
  Search,
  Briefcase,
  ChevronRight,
  Edit2,
  Trash2,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";
import type { RoleDefinition } from "@genz/types";
import { deleteRoleAction } from "./actions";

interface RolesViewClientProps {
  roles: RoleDefinition[];
}

export function RolesViewClient({ roles }: RolesViewClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filteredRoles = roles.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.role_level.toLowerCase().includes(q)
    );
  });

  const totalMembers = roles.reduce((acc, r) => acc + (r.member_count ?? 0), 0);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the role "${name}"?`)) return;
    setIsDeletingId(id);
    const res = await deleteRoleAction(id);
    setIsDeletingId(null);
    if (res?.error) {
      setFeedbackMsg({ type: "error", text: res.error });
    } else {
      setFeedbackMsg({ type: "success", text: `Role "${name}" removed successfully` });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const getRoleLevelBadge = (level: string) => {
    switch (level) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#1A1A18] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
            <Shield className="h-2.5 w-2.5 text-[#C89D32]" />
            Admin Level
          </span>
        );
      case "manager":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-900 shadow-xs">
            <Briefcase className="h-2.5 w-2.5 text-indigo-700" />
            Manager Level
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-800">
            Staff Level
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs Header */}
      <div className="border-b border-[#E5E5E0] pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/employees"
                className="text-xs font-semibold text-[#73736E] hover:text-[#1A1A18] transition-colors"
              >
                Team Directory
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-[#A3A39E]" />
              <span className="text-xs font-semibold text-[#1A1A18]">Roles & Permissions</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1A1A18]">
              Role Governance & Access Control
            </h1>
            <p className="mt-0.5 text-xs text-[#73736E]">
              Configure administrative roles (Super Administrator, CRM Manager, Operation Manager) with granular page CRUD permissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/employees/departments"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E5E0] bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1A18] transition hover:bg-[#FAF8F4]"
            >
              <Layers className="h-3.5 w-3.5 text-[#73736E]" />
              Departments
            </Link>
            <Link
              href="/dashboard/roles/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1A1A18] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800"
            >
              <Plus className="h-3.5 w-3.5" />
              New Role
            </Link>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-4 flex items-center gap-2">
          <Link
            href="/dashboard/employees"
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#73736E] hover:bg-neutral-100 hover:text-black transition"
          >
            All Employees
          </Link>
          <Link
            href="/dashboard/employees/departments"
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#73736E] hover:bg-neutral-100 hover:text-black transition"
          >
            Departments
          </Link>
          <div className="rounded-lg bg-[#1A1A18] px-3 py-1.5 text-xs font-semibold text-white shadow-xs">
            Roles ({roles.length})
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {feedbackMsg.text}
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#73736E]">Defined Roles</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1A1A18]">{roles.length}</span>
            <span className="text-xs text-[#73736E]">roles configured</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#73736E]">Active Staff Assigned</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1A1A18]">{totalMembers}</span>
            <span className="text-xs text-[#73736E]">team members</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#73736E]">Granular RBAC</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
              <Sparkles className="h-4 w-4 text-[#C89D32]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1A1A18]">Per-Page CRUD</span>
            <span className="text-xs text-[#73736E]">Matrix Enforced</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#73736E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search role name, code, or level..."
            className="w-full rounded-xl border border-[#E5E5E0] bg-white py-2 pl-9 pr-3 text-xs text-[#1A1A18] placeholder-[#73736E] outline-none transition focus:border-[#1A1A18]"
          />
        </div>
        <span className="text-xs text-[#73736E]">
          Showing {filteredRoles.length} of {roles.length} roles
        </span>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoles.map((role) => {
          const permList = role.permissions || [];
          const hasProducts = permList.some((p) => p.startsWith("products:"));
          const hasOrders = permList.some((p) => p.startsWith("orders:"));
          const hasTasks = permList.some((p) => p.startsWith("tasks:"));
          const hasCrm = permList.some((p) => p.startsWith("crm:"));
          const hasEmployees = permList.some((p) => p.startsWith("employees:"));
          const hasVerifications = permList.some((p) => p.startsWith("verifications:"));

          return (
            <div
              key={role.id}
              className="group flex flex-col justify-between rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs transition hover:border-[#A3A39E] hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF8F4] border border-[#E5E5E0] text-[#1A1A18] font-bold">
                      <Shield className="h-5 w-5 text-[#C89D32]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1A1A18] text-sm group-hover:text-black">
                        {role.name}
                      </h3>
                      <span className="font-mono text-[10px] font-bold tracking-wider text-[#73736E] bg-neutral-100 px-2 py-0.5 rounded border border-[#E5E5E0]">
                        {role.code}
                      </span>
                    </div>
                  </div>

                  <div>{getRoleLevelBadge(role.role_level)}</div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-[#73736E] line-clamp-2">
                  {role.description || "No role description provided."}
                </p>

                {/* Permissions Highlight Badges */}
                <div className="mt-3 rounded-xl border border-neutral-100 bg-neutral-50/60 p-2.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-700 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3 text-neutral-500" />
                      Role Permissions
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {permList.length} active
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {hasOrders && (
                      <span className="rounded-md bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.5 text-[9px] font-bold text-indigo-800">
                        Orders CRUD
                      </span>
                    )}
                    {hasProducts && (
                      <span className="rounded-md bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                        Products CRUD
                      </span>
                    )}
                    {hasCrm && (
                      <span className="rounded-md bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                        CRM / Leads
                      </span>
                    )}
                    {hasTasks && (
                      <span className="rounded-md bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 text-[9px] font-bold text-blue-800">
                        Tasks CRUD
                      </span>
                    )}
                    {hasEmployees && (
                      <span className="rounded-md bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 text-[9px] font-bold text-purple-800">
                        Employees
                      </span>
                    )}
                    {hasVerifications && (
                      <span className="rounded-md bg-teal-50 border border-teal-200/60 px-1.5 py-0.5 text-[9px] font-bold text-teal-800">
                        KYC / GI
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#F0F0EC] pt-3 text-xs">
                  <span className="text-[#73736E]">Active Staff Count</span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#FAF8F4] border border-[#E5E5E0] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#1A1A18]">
                    <Users className="h-3 w-3 text-[#73736E]" />
                    {role.member_count ?? 0} members
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#F0F0EC] pt-3">
                <Link
                  href={`/dashboard/roles/${role.id}/edit`}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E5E5E0] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#1A1A18] hover:bg-[#FAF8F4] transition"
                >
                  <Edit2 className="h-3 w-3 text-[#73736E]" />
                  Edit Role
                </Link>
                {!role.is_system && (
                  <button
                    onClick={() => handleDelete(role.id, role.name)}
                    disabled={isDeletingId === role.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
