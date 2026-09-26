"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users, UserPlus, Briefcase,
  CheckCircle2, Eye, Sliders,
  Building2, Shield,
} from "lucide-react";
import type {
  Employee,
  EmployeeDepartment,
  EmployeeStatus,
  RoleLevel,
  PermissionKey,
  Department,
} from "@genz/types";
import { PREDEFINED_ROLES } from "@genz/types";
import { addEmployeeAction, updateEmployeePermissionsAction } from "./actions";

interface EmployeesViewClientProps {
  employees: Employee[];
  departments?: Department[];
}

interface ModulePermissionDef {
  module: string;
  readKey: PermissionKey;
  readLabel: string;
  writeKey: PermissionKey;
  writeLabel: string;
  deleteKey?: PermissionKey;
  deleteLabel?: string;
  specialKey?: PermissionKey;
  specialLabel?: string;
}

const MODULE_PERMISSIONS: ModulePermissionDef[] = [
  {
    module: "CRM & Pipeline",
    readKey: "crm:read",
    readLabel: "Access CRM Pages (Contacts, Leads, Deals, Onboarding)",
    writeKey: "crm:write",
    writeLabel: "Create & Edit CRM Pipeline Data",
    deleteKey: "crm:delete",
    deleteLabel: "Delete Contacts & Deals",
    specialKey: "crm:admin",
    specialLabel: "Administer Seller Onboarding Steps",
  },
  {
    module: "Tasks & Board",
    readKey: "tasks:read",
    readLabel: "Access Tasks Kanban Board & Team Queues",
    writeKey: "tasks:write",
    writeLabel: "Create & Update Tasks",
    deleteKey: "tasks:delete",
    deleteLabel: "Delete Tasks",
    specialKey: "tasks:assign",
    specialLabel: "Assign Tasks to Team Members",
  },
  {
    module: "Orders & Fulfillment",
    readKey: "orders:read",
    readLabel: "Access Orders & Logistics Pages",
    writeKey: "orders:write",
    writeLabel: "Update Fulfillment & Courier Tracking",
    deleteKey: "orders:delete",
    deleteLabel: "Cancel & Archive Orders",
  },
  {
    module: "Catalog & Products",
    readKey: "products:read",
    readLabel: "Access Product Inventory & GI Catalog Pages",
    writeKey: "products:write",
    writeLabel: "Create & Update Artisan Products",
    deleteKey: "products:delete",
    deleteLabel: "Delete / Delist SKUs",
  },
  {
    module: "Team & Departments",
    readKey: "employees:read",
    readLabel: "Access Team Directory & Department Governance",
    writeKey: "employees:write",
    writeLabel: "Register Employees & Edit Departments",
    deleteKey: "employees:delete",
    deleteLabel: "Delete Team Members & Units",
  },
  {
    module: "Seller Verifications",
    readKey: "verifications:read",
    readLabel: "Access KYC & GI Certificate Audit Pages",
    writeKey: "verifications:write",
    writeLabel: "Approve / Reject Seller Credentials",
    deleteKey: "verifications:delete",
    deleteLabel: "Revoke Verification Records",
  },
  {
    module: "System & Governance",
    readKey: "system:read",
    readLabel: "Access System Analytics & Audit Logs",
    writeKey: "system:write",
    writeLabel: "Configure Platform Settings & Parameters",
  },
];

export function EmployeesViewClient({
  employees,
  departments = [],
}: EmployeesViewClientProps) {
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectEmployee, setInspectEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal form states for Add Employee
  const [addRolePreset, setAddRolePreset] = useState<string>("crm_manager");
  const [addSelectedPerms, setAddSelectedPerms] = useState<Set<PermissionKey>>(
    new Set(PREDEFINED_ROLES.crm_manager.permissions)
  );

  // Modal form states for Edit Employee
  const [editRolePreset, setEditRolePreset] = useState<string>("crm_manager");
  const [editSelectedPerms, setEditSelectedPerms] = useState<Set<PermissionKey>>(new Set());

  const handleOpenAddModal = () => {
    setAddRolePreset("crm_manager");
    setAddSelectedPerms(new Set(PREDEFINED_ROLES.crm_manager.permissions));
    setShowAddModal(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setInspectEmployee(emp);
    const existingPerms = new Set<PermissionKey>(emp.permissions || []);
    setEditSelectedPerms(existingPerms);

    const r = (emp.role || emp.designation || "").toLowerCase();
    if (r.includes("super admin") || emp.role_level === "admin") {
      setEditRolePreset("super_admin");
    } else if (r.includes("operation")) {
      setEditRolePreset("operation_manager");
    } else if (r.includes("crm")) {
      setEditRolePreset("crm_manager");
    } else {
      setEditRolePreset("custom");
    }
  };

  const handleRolePresetChangeForAdd = (roleId: string) => {
    setAddRolePreset(roleId);
    if (roleId === "super_admin") {
      setAddSelectedPerms(new Set(PREDEFINED_ROLES.super_admin.permissions));
    } else if (roleId === "crm_manager") {
      setAddSelectedPerms(new Set(PREDEFINED_ROLES.crm_manager.permissions));
    } else if (roleId === "operation_manager") {
      setAddSelectedPerms(new Set(PREDEFINED_ROLES.operation_manager.permissions));
    }
  };

  const handleRolePresetChangeForEdit = (roleId: string) => {
    setEditRolePreset(roleId);
    if (roleId === "super_admin") {
      setEditSelectedPerms(new Set(PREDEFINED_ROLES.super_admin.permissions));
    } else if (roleId === "crm_manager") {
      setEditSelectedPerms(new Set(PREDEFINED_ROLES.crm_manager.permissions));
    } else if (roleId === "operation_manager") {
      setEditSelectedPerms(new Set(PREDEFINED_ROLES.operation_manager.permissions));
    }
  };

  const toggleAddPerm = (perm: PermissionKey) => {
    setAddSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) {
        next.delete(perm);
      } else {
        next.add(perm);
      }
      return next;
    });
  };

  const toggleEditPerm = (perm: PermissionKey) => {
    setEditSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) {
        next.delete(perm);
      } else {
        next.add(perm);
      }
      return next;
    });
  };

  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg(null);
    const formData = new FormData(e.currentTarget);
    formData.delete("permissions");
    addSelectedPerms.forEach((p) => formData.append("permissions", p));

    const res = await addEmployeeAction(formData);
    setIsSubmitting(false);

    if (res.error) {
      setFeedbackMsg({ type: "error", text: res.error });
    } else {
      setShowAddModal(false);
      setFeedbackMsg({ type: "success", text: "Team member registered successfully" });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleSavePermissions = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inspectEmployee) return;
    setIsSubmitting(true);
    setFeedbackMsg(null);
    const formData = new FormData(e.currentTarget);
    const department = formData.get("department") as EmployeeDepartment;
    const role = formData.get("role") as string;
    const designation = formData.get("designation") as string;
    const status = formData.get("status") as EmployeeStatus;
    const perms = Array.from(editSelectedPerms);

    await updateEmployeePermissionsAction(
      inspectEmployee.id,
      department,
      role || designation,
      designation || role,
      status,
      perms
    );

    setIsSubmitting(false);
    setInspectEmployee(null);
    setFeedbackMsg({ type: "success", text: "Permissions & Role updated successfully" });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDept === "all" || emp.department === selectedDept;
    const matchesSearch =
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.role || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const getRoleBadge = (roleName?: string, designation?: string, roleLevel?: RoleLevel) => {
    const r = (roleName || designation || "").toLowerCase();
    if (r.includes("super admin") || roleLevel === "admin") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#1A1A18] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
          <Shield className="h-2.5 w-2.5 text-[#C89D32]" />
          Super Admin
        </span>
      );
    }
    if (r.includes("crm") || roleLevel === "manager") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 shadow-xs">
          <Users className="h-2.5 w-2.5 text-amber-700" />
          CRM Manager
        </span>
      );
    }
    if (r.includes("operation")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-900 shadow-xs">
          <Briefcase className="h-2.5 w-2.5 text-indigo-700" />
          Operation Manager
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF8F4] border border-[#E5E5E0] px-2.5 py-0.5 text-[10px] font-medium text-[#1A1A18]">
        {roleName || designation || "Staff Associate"}
      </span>
    );
  };

  const getAccessiblePages = (perms: PermissionKey[]) => {
    const pages: string[] = [];
    if (perms.includes("crm:read")) pages.push("CRM");
    if (perms.includes("tasks:read")) pages.push("Tasks");
    if (perms.includes("orders:read")) pages.push("Orders");
    if (perms.includes("products:read")) pages.push("Catalog");
    if (perms.includes("employees:read")) pages.push("Team");
    if (perms.includes("verifications:read")) pages.push("Verifications");
    if (perms.includes("system:read")) pages.push("Analytics");
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header and Navigation Tabs */}
      <div className="border-b border-[#E5E5E0] pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1A1A18]">Employees & Governance</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1A1A18]">
              Team Directory & Role-Based Access Control
            </h1>
            <p className="mt-0.5 text-xs text-[#73736E]">
              Manage internal employees, roles (Super Admin, CRM Manager, Operation Manager), and CRUD page permissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/employees/departments"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E5E0] bg-white px-3.5 py-2 text-xs font-semibold text-[#1A1A18] transition hover:bg-[#FAF8F4]"
            >
              <Building2 className="h-3.5 w-3.5 text-[#C89D32]" />
              Manage Departments
            </Link>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1A1A18] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add Employee
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-4 flex items-center gap-2">
          <div className="rounded-lg bg-[#1A1A18] px-3 py-1.5 text-xs font-semibold text-white shadow-xs">
            All Employees ({employees.length})
          </div>
          <Link
            href="/dashboard/employees/departments"
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#73736E] hover:bg-neutral-100 hover:text-black transition"
          >
            Departments ({departments.length > 0 ? departments.length : 6})
          </Link>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-medium ${
            feedbackMsg.type === "success"
              ? "border-[#E5E5E0] bg-[#FAF8F4] text-[#1A1A18]"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 text-[#C89D32]" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#73736E]">
            Total Staff
          </span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#1A1A18]">
            {employees.length}
          </p>
          <p className="text-[11px] text-[#73736E] mt-0.5">Active team members</p>
        </div>

        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#73736E]">
            Super Admins
          </span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#1A1A18]">
            {employees.filter((e) => (e.role || e.designation || "").toLowerCase().includes("admin")).length || 1}
          </p>
          <p className="text-[11px] text-[#73736E] mt-0.5">Full master access</p>
        </div>

        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#73736E]">
            Managers
          </span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#1A1A18]">
            {employees.filter((e) => (e.role || e.designation || "").toLowerCase().includes("manager")).length || 3}
          </p>
          <p className="text-[11px] text-[#73736E] mt-0.5">CRM & Operations leads</p>
        </div>

        <div className="rounded-2xl border border-[#E5E5E0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#73736E]">
            Departments
          </span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#1A1A18]">
            {departments.length > 0 ? departments.length : 6}
          </p>
          <p className="text-[11px] text-[#73736E] mt-0.5">Operational units</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, code, or department..."
            className="w-full rounded-xl border border-[#E5E5E0] bg-white py-2 pl-3 pr-3 text-xs text-[#1A1A18] placeholder-[#73736E] outline-none transition focus:border-[#1A1A18]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedDept("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              selectedDept === "all"
                ? "bg-[#1A1A18] text-white"
                : "border border-[#E5E5E0] bg-white text-[#73736E] hover:text-black"
            }`}
          >
            All Units
          </button>
          <button
            onClick={() => setSelectedDept("seller_acquisition")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              selectedDept === "seller_acquisition"
                ? "bg-[#1A1A18] text-white"
                : "border border-[#E5E5E0] bg-white text-[#73736E] hover:text-black"
            }`}
          >
            Seller Acquisition
          </button>
          <button
            onClick={() => setSelectedDept("operations")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              selectedDept === "operations"
                ? "bg-[#1A1A18] text-white"
                : "border border-[#E5E5E0] bg-white text-[#73736E] hover:text-black"
            }`}
          >
            Operations
          </button>
          <button
            onClick={() => setSelectedDept("tech")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              selectedDept === "tech"
                ? "bg-[#1A1A18] text-white"
                : "border border-[#E5E5E0] bg-white text-[#73736E] hover:text-black"
            }`}
          >
            Platform / Tech
          </button>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((emp) => {
          const accessiblePages = getAccessiblePages(emp.permissions || []);
          return (
            <div
              key={emp.id}
              className="flex flex-col justify-between rounded-2xl border border-[#E5E5E0] bg-white p-5 shadow-xs transition hover:border-[#A3A39E] hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF8F4] border border-[#E5E5E0] font-bold text-[#1A1A18]">
                      {emp.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1A1A18] text-sm">{emp.full_name}</h3>
                      <span className="font-mono text-[10px] text-[#73736E]">
                        {emp.employee_code}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      emp.status === "active"
                        ? "bg-neutral-100 text-neutral-800"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {emp.status.toUpperCase()}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#73736E]">Assigned Role</span>
                    <div>{getRoleBadge(emp.role, emp.designation, emp.role_level)}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#73736E]">Department</span>
                    <span className="font-medium text-[#1A1A18] uppercase text-[11px]">
                      {emp.department}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#73736E]">Designation</span>
                    <span className="text-[#1A1A18] font-medium text-[11px]">
                      {emp.designation || emp.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#73736E]">Contact</span>
                    <span className="text-[#1A1A18] font-mono text-[11px] truncate max-w-[150px]">
                      {emp.email}
                    </span>
                  </div>
                </div>

                {/* Page Access Badges */}
                <div className="mt-4 border-t border-[#F0F0EC] pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#73736E]">
                    Allowed Dashboard Pages (Read)
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {accessiblePages.map((pg) => (
                      <span
                        key={pg}
                        className="inline-flex items-center gap-0.5 rounded-md bg-[#FAF8F4] border border-[#E5E5E0] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#1A1A18]"
                      >
                        <Eye className="h-2.5 w-2.5 text-[#C89D32]" />
                        {pg}
                      </span>
                    ))}
                    {accessiblePages.length === 0 && (
                      <span className="text-[10px] text-[#A3A39E]">No page permissions assigned</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-[#F0F0EC] pt-3 flex items-center justify-between">
                <span className="text-[11px] text-[#73736E]">
                  {emp.permissions?.length || 0} permissions
                </span>
                <button
                  onClick={() => handleOpenEditModal(emp)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E5E0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1A18] hover:bg-[#FAF8F4] transition"
                >
                  <Sliders className="h-3 w-3 text-[#73736E]" />
                  Configure Roles & CRUD
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONFIGURE PERMISSIONS & ROLES MODAL (EDIT) */}
      {inspectEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
              <div>
                <h3 className="font-bold text-[#1A1A18] text-base">
                  Configure Roles & CRUD Page Permissions
                </h3>
                <p className="text-xs text-[#73736E] mt-0.5">
                  {inspectEmployee.full_name} ({inspectEmployee.employee_code}) - {inspectEmployee.email}
                </p>
              </div>
              <button
                onClick={() => setInspectEmployee(null)}
                className="text-neutral-400 hover:text-black font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePermissions} className="mt-4 space-y-4">
              {/* Role Preset Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A18] mb-1.5">
                  Assigned Role Template *
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => handleRolePresetChangeForEdit("super_admin")}
                    className={`rounded-xl border p-2.5 text-left text-xs transition ${
                      editRolePreset === "super_admin"
                        ? "border-[#1A1A18] bg-[#1A1A18] text-white font-semibold"
                        : "border-[#E5E5E0] bg-[#FAF8F4] text-[#1A1A18] hover:border-black"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-[#C89D32]" />
                      Super Admin
                    </div>
                    <p className={`text-[10px] mt-0.5 ${editRolePreset === "super_admin" ? "text-neutral-300" : "text-[#73736E]"}`}>
                      Full CRUD All
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRolePresetChangeForEdit("crm_manager")}
                    className={`rounded-xl border p-2.5 text-left text-xs transition ${
                      editRolePreset === "crm_manager"
                        ? "border-[#1A1A18] bg-[#1A1A18] text-white font-semibold"
                        : "border-[#E5E5E0] bg-[#FAF8F4] text-[#1A1A18] hover:border-black"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-amber-500" />
                      CRM Manager
                    </div>
                    <p className={`text-[10px] mt-0.5 ${editRolePreset === "crm_manager" ? "text-neutral-300" : "text-[#73736E]"}`}>
                      CRM + Tasks
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRolePresetChangeForEdit("operation_manager")}
                    className={`rounded-xl border p-2.5 text-left text-xs transition ${
                      editRolePreset === "operation_manager"
                        ? "border-[#1A1A18] bg-[#1A1A18] text-white font-semibold"
                        : "border-[#E5E5E0] bg-[#FAF8F4] text-[#1A1A18] hover:border-black"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3 text-indigo-400" />
                      Operation Manager
                    </div>
                    <p className={`text-[10px] mt-0.5 ${editRolePreset === "operation_manager" ? "text-neutral-300" : "text-[#73736E]"}`}>
                      Orders + Catalog
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRolePresetChangeForEdit("custom")}
                    className={`rounded-xl border p-2.5 text-left text-xs transition ${
                      editRolePreset === "custom"
                        ? "border-[#1A1A18] bg-[#1A1A18] text-white font-semibold"
                        : "border-[#E5E5E0] bg-[#FAF8F4] text-[#1A1A18] hover:border-black"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Sliders className="h-3 w-3 text-[#73736E]" />
                      Custom Role
                    </div>
                    <p className={`text-[10px] mt-0.5 ${editRolePreset === "custom" ? "text-neutral-300" : "text-[#73736E]"}`}>
                      Manual Select
                    </p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A18]">Role Title</label>
                  <input
                    name="role"
                    defaultValue={
                      editRolePreset === "super_admin"
                        ? "Super Admin"
                        : editRolePreset === "crm_manager"
                        ? "CRM Manager"
                        : editRolePreset === "operation_manager"
                        ? "Operation Manager"
                        : inspectEmployee.role || inspectEmployee.designation
                    }
                    className="mt-1 w-full rounded-xl border border-[#E5E5E0] p-2 text-xs text-[#1A1A18] outline-none focus:border-[#1A1A18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A18]">Department</label>
                  <select
                    name="department"
                    defaultValue={inspectEmployee.department}
                    className="mt-1 w-full rounded-xl border border-[#E5E5E0] p-2 text-xs text-[#1A1A18] outline-none bg-white focus:border-[#1A1A18]"
                  >
                    {departments.length > 0 ? (
                      departments.map((d) => (
                        <option key={d.id} value={d.code.toLowerCase()}>
                          {d.name} ({d.code})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="super_admin">Super Administrator</option>
                        <option value="crm_manager">CRM Manager</option>
                        <option value="operation_manager">Operation Manager</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A18]">Account Status</label>
                  <select
                    name="status"
                    defaultValue={inspectEmployee.status}
                    className="mt-1 w-full rounded-xl border border-[#E5E5E0] p-2 text-xs text-[#1A1A18] outline-none bg-white focus:border-[#1A1A18]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A18]">
                  Designation (Job Description)
                </label>
                <input
                  name="designation"
                  defaultValue={inspectEmployee.designation || inspectEmployee.role || ""}
                  className="mt-1 w-full rounded-xl border border-[#E5E5E0] p-2 text-xs text-[#1A1A18] outline-none focus:border-[#1A1A18]"
                />
              </div>

              {/* GRANULAR CRUD MATRIX */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A18]">
                    Granular CRUD & Page Access Matrix
                  </label>
                  <span className="text-[11px] text-[#73736E]">
                    Read permission grants page access
                  </span>
                </div>

                <div className="space-y-2 border border-[#E5E5E0] rounded-xl p-3 bg-[#FAF8F4] max-h-64 overflow-y-auto">
                  {MODULE_PERMISSIONS.map((mod) => {
                    const hasRead = editSelectedPerms.has(mod.readKey);
                    const hasWrite = editSelectedPerms.has(mod.writeKey);
                    const hasDelete = mod.deleteKey ? editSelectedPerms.has(mod.deleteKey) : false;
                    const hasSpecial = mod.specialKey ? editSelectedPerms.has(mod.specialKey) : false;

                    return (
                      <div
                        key={mod.module}
                        className="rounded-xl border border-[#E5E5E0] bg-white p-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#F0F0EC]">
                          <span className="font-bold text-xs text-[#1A1A18]">{mod.module}</span>
                          <span className="font-mono text-[10px] text-[#73736E] bg-[#FAF8F4] px-1.5 py-0.5 rounded border border-[#E5E5E0]">
                            {hasRead ? "Page Enabled" : "Page Locked"}
                          </span>
                        </div>

                        <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                          {/* READ / ACCESS */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasRead}
                              onChange={() => toggleEditPerm(mod.readKey)}
                              className="h-3.5 w-3.5 rounded border-[#E5E5E0] text-black focus:ring-black"
                            />
                            <span className="font-semibold text-[11px] text-[#1A1A18]">
                              Read (Page)
                            </span>
                          </label>

                          {/* CREATE / WRITE */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasWrite}
                              onChange={() => toggleEditPerm(mod.writeKey)}
                              className="h-3.5 w-3.5 rounded border-[#E5E5E0] text-black focus:ring-black"
                            />
                            <span className="text-[11px] text-[#73736E]">Create / Edit</span>
                          </label>

                          {/* DELETE */}
                          {mod.deleteKey && (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hasDelete}
                                onChange={() => mod.deleteKey && toggleEditPerm(mod.deleteKey)}
                                className="h-3.5 w-3.5 rounded border-[#E5E5E0] text-black focus:ring-black"
                              />
                              <span className="text-[11px] text-[#73736E]">Delete</span>
                            </label>
                          )}

                          {/* SPECIAL */}
                          {mod.specialKey && (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hasSpecial}
                                onChange={() => mod.specialKey && toggleEditPerm(mod.specialKey)}
                                className="h-3.5 w-3.5 rounded border-[#E5E5E0] text-black focus:ring-black"
                              />
                              <span className="text-[11px] text-[#73736E]">
                                {mod.specialKey.includes("admin") ? "Onboard Admin" : "Assign"}
                              </span>
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F0F0EC]">
                <button
                  type="button"
                  onClick={() => setInspectEmployee(null)}
                  className="rounded-xl border border-[#E5E5E0] px-4 py-2 text-xs font-medium text-[#73736E] hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#1A1A18] px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Role & Permissions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
              <div>
                <h3 className="font-bold text-[#1A1A18] text-base">Add New Employee</h3>
                <p className="text-xs text-[#73736E]">
                  Assign standard role templates (Super Admin, CRM Manager, Operation Manager) with granular CRUD access.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-black font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="mt-4 space-y-4">
              {/* Role Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A18] mb-1.5">
                  Select Role Template *
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => handleRolePresetChangeForAdd("super_admin")}
                    className={`rounded-xl border p-2.5 text-left text-xs transition ${
                      addRolePreset === "super_admin"
                        ? "border-[#1A1A18] bg-[#1A1A18] text-white font-semibold"
                        : "border-[#E5E5E0] bg-[#FAF8F4] text-[#1A1A18] hover:border-black"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-[#C89D32]" />
                      Super Admin
                    </div>
                    <p className={`text-[10px] mt-0.5 ${addRolePreset === "super_admin" ? "text-neutral-300" : "text-[#73736E]"}`}>
                      Full CRUD All
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRolePresetChangeForAdd("crm_manager")}
                    className={`rounded-xl border p-2.5 text-left text-xs transition ${
                      addRolePreset === "crm_manager"
                        ? "border-[#1A1A18] bg-[#1A1A18] text-white font-semibold"
                        : "border-[#E5E5E0] bg-[#FAF8F4] text-[#1A1A18] hover:border-black"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-amber-500" />
                      CRM Manager
                    </div>
                    <p className={`text-[10px] mt-0.5 ${addRolePreset === "crm_manager" ? "text-neutral-300" : "text-[#73736E]"}`}>
                      CRM + Tasks
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRolePresetChangeForAdd("operation_manager")}
                    className={`rounded-xl border p-2.5 text-left text-xs transition ${
                      addRolePreset === "operation_manager"
                        ? "border-[#1A1A18] bg-[#1A1A18] text-white font-semibold"
                        : "border-[#E5E5E0] bg-[#FAF8F4] text-[#1A1A18] hover:border-black"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3 text-indigo-400" />
                      Operation Manager
                    </div>
                    <p className={`text-[10px] mt-0.5 ${addRolePreset === "operation_manager" ? "text-neutral-300" : "text-[#73736E]"}`}>
                      Orders + Catalog
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRolePresetChangeForAdd("custom")}
                    className={`rounded-xl border p-2.5 text-left text-xs transition ${
                      addRolePreset === "custom"
                        ? "border-[#1A1A18] bg-[#1A1A18] text-white font-semibold"
                        : "border-[#E5E5E0] bg-[#FAF8F4] text-[#1A1A18] hover:border-black"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Sliders className="h-3 w-3 text-[#73736E]" />
                      Custom Role
                    </div>
                    <p className={`text-[10px] mt-0.5 ${addRolePreset === "custom" ? "text-neutral-300" : "text-[#73736E]"}`}>
                      Manual Select
                    </p>
                  </button>
                </div>
              </div>

              <input type="hidden" name="rolePreset" value={addRolePreset} />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A18]">Full Name *</label>
                  <input
                    name="fullName"
                    required
                    placeholder="e.g. Arjun Verma"
                    className="mt-1 w-full rounded-xl border border-[#E5E5E0] p-2.5 text-xs text-[#1A1A18] outline-none focus:border-[#1A1A18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A18]">Email Address *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="arjun@genz.in"
                    className="mt-1 w-full rounded-xl border border-[#E5E5E0] p-2.5 text-xs text-[#1A1A18] outline-none focus:border-[#1A1A18]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A18]">Phone</label>
                  <input
                    name="phone"
                    placeholder="+91 98450 11223"
                    className="mt-1 w-full rounded-xl border border-[#E5E5E0] p-2.5 text-xs text-[#1A1A18] outline-none focus:border-[#1A1A18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A18]">Department</label>
                  <select
                    name="department"
                    className="mt-1 w-full rounded-xl border border-[#E5E5E0] p-2.5 text-xs text-[#1A1A18] outline-none bg-white focus:border-[#1A1A18]"
                  >
                    {departments.length > 0 ? (
                      departments.map((d) => (
                        <option key={d.id} value={d.code.toLowerCase()}>
                          {d.name} ({d.code})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="super_admin">Super Administrator</option>
                        <option value="crm_manager">CRM Manager</option>
                        <option value="operation_manager">Operation Manager</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A18]">Role Title</label>
                  <input
                    name="designation"
                    defaultValue={
                      addRolePreset === "super_admin"
                        ? "Super Admin"
                        : addRolePreset === "crm_manager"
                        ? "CRM Manager"
                        : addRolePreset === "operation_manager"
                        ? "Operation Manager"
                        : "Staff Associate"
                    }
                    className="mt-1 w-full rounded-xl border border-[#E5E5E0] p-2.5 text-xs text-[#1A1A18] outline-none focus:border-[#1A1A18]"
                  />
                </div>
              </div>

              {/* CRUD PERMISSIONS CHECKBOX MATRIX */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A18]">
                    Granular CRUD & Page Access Matrix
                  </label>
                  <span className="text-[11px] text-[#73736E]">
                    Read permission grants page access
                  </span>
                </div>

                <div className="space-y-2 border border-[#E5E5E0] rounded-xl p-3 bg-[#FAF8F4] max-h-64 overflow-y-auto">
                  {MODULE_PERMISSIONS.map((mod) => {
                    const hasRead = addSelectedPerms.has(mod.readKey);
                    const hasWrite = addSelectedPerms.has(mod.writeKey);
                    const hasDelete = mod.deleteKey ? addSelectedPerms.has(mod.deleteKey) : false;
                    const hasSpecial = mod.specialKey ? addSelectedPerms.has(mod.specialKey) : false;

                    return (
                      <div
                        key={mod.module}
                        className="rounded-xl border border-[#E5E5E0] bg-white p-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#F0F0EC]">
                          <span className="font-bold text-xs text-[#1A1A18]">{mod.module}</span>
                          <span className="font-mono text-[10px] text-[#73736E] bg-[#FAF8F4] px-1.5 py-0.5 rounded border border-[#E5E5E0]">
                            {hasRead ? "Page Enabled" : "Page Locked"}
                          </span>
                        </div>

                        <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                          {/* READ / ACCESS */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasRead}
                              onChange={() => toggleAddPerm(mod.readKey)}
                              className="h-3.5 w-3.5 rounded border-[#E5E5E0] text-black focus:ring-black"
                            />
                            <span className="font-semibold text-[11px] text-[#1A1A18]">
                              Read (Page)
                            </span>
                          </label>

                          {/* CREATE / WRITE */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasWrite}
                              onChange={() => toggleAddPerm(mod.writeKey)}
                              className="h-3.5 w-3.5 rounded border-[#E5E5E0] text-black focus:ring-black"
                            />
                            <span className="text-[11px] text-[#73736E]">Create / Edit</span>
                          </label>

                          {/* DELETE */}
                          {mod.deleteKey && (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hasDelete}
                                onChange={() => mod.deleteKey && toggleAddPerm(mod.deleteKey)}
                                className="h-3.5 w-3.5 rounded border-[#E5E5E0] text-black focus:ring-black"
                              />
                              <span className="text-[11px] text-[#73736E]">Delete</span>
                            </label>
                          )}

                          {/* SPECIAL */}
                          {mod.specialKey && (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hasSpecial}
                                onChange={() => mod.specialKey && toggleAddPerm(mod.specialKey)}
                                className="h-3.5 w-3.5 rounded border-[#E5E5E0] text-black focus:ring-black"
                              />
                              <span className="text-[11px] text-[#73736E]">
                                {mod.specialKey.includes("admin") ? "Onboard Admin" : "Assign"}
                              </span>
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F0F0EC]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-[#E5E5E0] px-4 py-2 text-xs font-medium text-[#73736E] hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#1A1A18] px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Registering..." : "Register Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
