"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2, Users, Plus, Search, Shield, Briefcase, 
  ChevronRight, Edit2, Trash2, CheckCircle2,
} from "lucide-react";
import type { Department, Employee } from "@genz/types";
import { deleteDepartmentAction } from "./actions";

interface DepartmentsViewClientProps {
  departments: Department[];
  employees: Employee[];
}

export function DepartmentsViewClient({
  departments,
  employees,
}: DepartmentsViewClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filteredDepartments = departments.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q) ||
      d.head_employee_name?.toLowerCase().includes(q)
    );
  });

  const totalMembers = departments.reduce((acc, d) => acc + (d.member_count ?? 0), 0);
  const activeCount = departments.filter((d) => d.status === "active").length;

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the department "${name}"?`)) return;
    setIsDeletingId(id);
    const res = await deleteDepartmentAction(id);
    setIsDeletingId(null);
    if (res?.error) {
      setFeedbackMsg({ type: "error", text: res.error });
    } else {
      setFeedbackMsg({ type: "success", text: `Department "${name}" removed successfully` });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const getRoleBadge = (roleName?: string | null) => {
    switch (roleName) {
      case "Super Admin":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#1A1A18] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
            <Shield className="h-2.5 w-2.5 text-[#C89D32]" />
            Super Admin
          </span>
        );
      case "CRM Manager":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 shadow-xs">
            <Users className="h-2.5 w-2.5 text-amber-700" />
            CRM Manager
          </span>
        );
      case "Operation Manager":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-900 shadow-xs">
            <Briefcase className="h-2.5 w-2.5 text-indigo-700" />
            Operation Manager
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 border border-[#E5E5E0] px-2.5 py-0.5 text-[10px] font-semibold text-neutral-800">
            {roleName || "Standard Staff"}
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
              <span className="text-xs font-semibold text-[#1A1A18]">Departments</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1A1A18]">
              Department Governance & Organizational Units
            </h1>
            <p className="mt-0.5 text-xs text-[#73736E]">
              Organize company divisions (Technology, Sales, Operations, Support), department heads, and team rosters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/roles"
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-800 transition hover:bg-[#FAF8F4]"
            >
              <Shield className="h-3.5 w-3.5 text-[#C89D32]" />
              Roles & Permissions
            </Link>
            <Link
              href="/dashboard/employees/departments/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1A1A18] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800"
            >
              <Plus className="h-3.5 w-3.5" />
              New Department
            </Link>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-4 flex items-center gap-2">
          <Link
            href="/dashboard/employees"
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#73736E] hover:bg-neutral-100 hover:text-black transition"
          >
            All Employees ({employees.length})
          </Link>
          <div className="rounded-lg bg-[#1A1A18] px-3 py-1.5 text-xs font-semibold text-white shadow-xs">
            Departments ({departments.length})
          </div>
          <Link
            href="/dashboard/roles"
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#73736E] hover:bg-neutral-100 hover:text-black transition"
          >
            Roles & Permissions
          </Link>
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
            <span className="text-xs font-medium text-[#73736E]">Active Departments</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1A1A18]">{activeCount}</span>
            <span className="text-xs text-[#73736E]">/ {departments.length} total</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#73736E]">Assigned Workforce</span>
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
            <span className="text-xs font-medium text-[#73736E]">Roles & Access</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1A1A18]">RBAC Roles</span>
            <Link
              href="/dashboard/roles"
              className="text-xs font-semibold text-neutral-600 hover:text-black flex items-center gap-1"
            >
              <span>Manage &rarr;</span>
            </Link>
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
            placeholder="Search department name, code, or department head..."
            className="w-full rounded-xl border border-[#E5E5E0] bg-white py-2 pl-9 pr-3 text-xs text-[#1A1A18] placeholder-[#73736E] outline-none transition focus:border-[#1A1A18]"
          />
        </div>
        <span className="text-xs text-[#73736E]">
          Showing {filteredDepartments.length} of {departments.length} departments
        </span>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredDepartments.map((dept) => (
          <div
            key={dept.id}
            className="group flex flex-col justify-between rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs transition hover:border-[#A3A39E] hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF8F4] border border-[#E5E5E0] text-[#1A1A18] font-bold">
                    <Building2 className="h-5 w-5 text-[#C89D32]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A1A18] text-sm group-hover:text-black">
                      {dept.name}
                    </h3>
                    <span className="font-mono text-[10px] font-bold tracking-wider text-[#73736E] bg-neutral-100 px-2 py-0.5 rounded border border-[#E5E5E0]">
                      {dept.code}
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    dept.status === "active"
                      ? "bg-neutral-100 text-neutral-800"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {dept.status.toUpperCase()}
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[#73736E] line-clamp-2">
                {dept.description || "No unit description provided."}
              </p>

              <div className="mt-4 space-y-2 border-t border-[#F0F0EC] pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#73736E]">Department Head</span>
                  <span className="font-medium text-[#1A1A18]">
                    {dept.head_employee_name || "Unassigned"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#73736E]">Default Role</span>
                  <div>{getRoleBadge(dept.default_role)}</div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#73736E]">Team Members</span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#FAF8F4] border border-[#E5E5E0] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#1A1A18]">
                    <Users className="h-3 w-3 text-[#73736E]" />
                    {dept.member_count ?? 0} members
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#F0F0EC] pt-3">
              <Link
                href={`/dashboard/employees/departments/${dept.id}/edit`}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E5E5E0] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#1A1A18] hover:bg-[#FAF8F4] transition"
              >
                <Edit2 className="h-3 w-3 text-[#73736E]" />
                Edit Department
              </Link>
              <button
                onClick={() => handleDelete(dept.id, dept.name)}
                disabled={isDeletingId === dept.id}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 transition"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
