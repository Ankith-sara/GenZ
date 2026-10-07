"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Briefcase,
  CheckCircle2,
  Eye,
  Building2,
  Shield,
  Search,
  X,
  LayoutGrid,
  List,
  Mail,
  Copy,
  Check,
  Edit2,
  Trash2,
  Power,
  ChevronRight,
  Loader2,
  AlertTriangle,
  FolderKanban,
  ShoppingBag,
  Package,
  Settings,
  Key,
} from "lucide-react";
import type {
  Employee,
  EmployeeDepartment,
  EmployeeStatus,
  PermissionKey,
  Department,
} from "@genz/types";
import { PREDEFINED_ROLES } from "@genz/types";
import { SlideOverDrawer } from "@genz/ui";
import { ActionDropdown, type ActionItem } from "@genz/ui";
import {
  addEmployeeAction,
  updateEmployeeAction,
  toggleEmployeeStatusAction,
  deleteEmployeeAction,
  resetEmployeePasswordAction,
} from "../actions";

interface EmployeesViewClientProps {
  employees: Employee[];
  departments?: Department[];
}

interface ModulePermissionDef {
  module: string;
  icon: React.ReactNode;
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
    icon: <Users className="h-4 w-4 text-amber-600" />,
    readKey: "crm:read",
    readLabel: "View Contacts, Leads, Deals & Onboarding",
    writeKey: "crm:write",
    writeLabel: "Create & Edit CRM Pipeline Data",
    deleteKey: "crm:delete",
    deleteLabel: "Delete Contacts & Records",
    specialKey: "crm:admin",
    specialLabel: "Administer Seller Onboarding Steps",
  },
  {
    module: "Tasks & Board",
    icon: <FolderKanban className="h-4 w-4 text-blue-600" />,
    readKey: "tasks:read",
    readLabel: "View Kanban Board & Team Queues",
    writeKey: "tasks:write",
    writeLabel: "Create & Update Internal Tasks",
    deleteKey: "tasks:delete",
    deleteLabel: "Delete Internal Tasks",
    specialKey: "tasks:assign",
    specialLabel: "Assign Tasks to Team Members",
  },
  {
    module: "Orders & Logistics",
    icon: <ShoppingBag className="h-4 w-4 text-indigo-600" />,
    readKey: "orders:read",
    readLabel: "View Orders & Shipping Status",
    writeKey: "orders:write",
    writeLabel: "Update Fulfillment & Courier Tracking",
    deleteKey: "orders:delete",
    deleteLabel: "Cancel & Archive Orders",
  },
  {
    module: "Catalog & Products",
    icon: <Package className="h-4 w-4 text-emerald-600" />,
    readKey: "products:read",
    readLabel: "View Catalog SKUs & GI Verification",
    writeKey: "products:write",
    writeLabel: "Create & Edit Artisan Products",
    deleteKey: "products:delete",
    deleteLabel: "Delete or Delist SKUs",
  },
  {
    module: "Team & Governance",
    icon: <Building2 className="h-4 w-4 text-purple-600" />,
    readKey: "employees:read",
    readLabel: "View Team Directory & Org Structure",
    writeKey: "employees:write",
    writeLabel: "Register Employees & Edit Units",
    deleteKey: "employees:delete",
    deleteLabel: "Remove Staff & Department Records",
  },
  {
    module: "Seller Verifications",
    icon: <CheckCircle2 className="h-4 w-4 text-teal-600" />,
    readKey: "verifications:read",
    readLabel: "View KYC & GI Certificate Audits",
    writeKey: "verifications:write",
    writeLabel: "Approve or Reject Seller Credentials",
    deleteKey: "verifications:delete",
    deleteLabel: "Revoke Verification Records",
  },
  {
    module: "System & Governance",
    icon: <Settings className="h-4 w-4 text-zinc-600" />,
    readKey: "system:read",
    readLabel: "View System Analytics & Audit Logs",
    writeKey: "system:write",
    writeLabel: "Configure Platform Settings & Parameters",
  },
];

const DEPARTMENT_METADATA: Record<
  string,
  { label: string; badgeBg: string; text: string; dot: string }
> = {
  tech: {
    label: "Technology & Platform",
    badgeBg: "bg-sky-50 border-sky-200",
    text: "text-sky-800",
    dot: "bg-sky-500",
  },
  seller_acquisition: {
    label: "Sales & Sourcing",
    badgeBg: "bg-amber-50 border-amber-200",
    text: "text-amber-800",
    dot: "bg-amber-500",
  },
  operations: {
    label: "Operations & Fulfillment",
    badgeBg: "bg-indigo-50 border-indigo-200",
    text: "text-indigo-800",
    dot: "bg-indigo-500",
  },
  catalog_operations: {
    label: "Catalog Operations",
    badgeBg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
  },
  support: {
    label: "Customer & Artisan Support",
    badgeBg: "bg-purple-50 border-purple-200",
    text: "text-purple-800",
    dot: "bg-purple-500",
  },
  admin: {
    label: "Administration",
    badgeBg: "bg-zinc-100 border-zinc-200",
    text: "text-zinc-800",
    dot: "bg-zinc-600",
  },
};

export function EmployeesViewClient({
  employees,
  departments = [],
}: EmployeesViewClientProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "recent" | "name_asc" | "name_desc" | "dept" | "code"
  >("recent");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Drawer States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [inspectEmployee, setInspectEmployee] = useState<Employee | null>(null);
  const [deleteConfirmEmployee, setDeleteConfirmEmployee] = useState<Employee | null>(
    null
  );
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  // Add Employee Form State
  const [addRolePreset, setAddRolePreset] = useState<string>("crm_manager");
  const [addSelectedPerms, setAddSelectedPerms] = useState<Set<PermissionKey>>(
    new Set(PREDEFINED_ROLES.crm_manager.permissions)
  );

  // Edit Employee Form State
  const [editRolePreset, setEditRolePreset] = useState<string>("crm_manager");
  const [editSelectedPerms, setEditSelectedPerms] = useState<Set<PermissionKey>>(
    new Set()
  );

  const handleOpenAddModal = () => {
    setAddRolePreset("crm_manager");
    setAddSelectedPerms(new Set(PREDEFINED_ROLES.crm_manager.permissions));
    setShowAddModal(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
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

  const handleRolePresetChangeForAdd = (presetId: string) => {
    setAddRolePreset(presetId);
    if (presetId === "super_admin") {
      setAddSelectedPerms(new Set(PREDEFINED_ROLES.super_admin.permissions));
    } else if (presetId === "crm_manager") {
      setAddSelectedPerms(new Set(PREDEFINED_ROLES.crm_manager.permissions));
    } else if (presetId === "operation_manager") {
      setAddSelectedPerms(new Set(PREDEFINED_ROLES.operation_manager.permissions));
    }
  };

  const handleRolePresetChangeForEdit = (presetId: string) => {
    setEditRolePreset(presetId);
    if (presetId === "super_admin") {
      setEditSelectedPerms(new Set(PREDEFINED_ROLES.super_admin.permissions));
    } else if (presetId === "crm_manager") {
      setEditSelectedPerms(new Set(PREDEFINED_ROLES.crm_manager.permissions));
    } else if (presetId === "operation_manager") {
      setEditSelectedPerms(new Set(PREDEFINED_ROLES.operation_manager.permissions));
    }
  };

  const toggleAddPerm = (perm: PermissionKey) => {
    setAddSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm);
      else next.add(perm);
      return next;
    });
  };

  const toggleEditPerm = (perm: PermissionKey) => {
    setEditSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm);
      else next.add(perm);
      return next;
    });
  };

  const handleSelectAllPerms = (isAdd: boolean) => {
    const all = new Set<PermissionKey>();
    MODULE_PERMISSIONS.forEach((m) => {
      all.add(m.readKey);
      all.add(m.writeKey);
      if (m.deleteKey) all.add(m.deleteKey);
      if (m.specialKey) all.add(m.specialKey);
    });
    if (isAdd) {
      setAddSelectedPerms(all);
      setAddRolePreset("custom");
    } else {
      setEditSelectedPerms(all);
      setEditRolePreset("custom");
    }
  };

  const handleClearAllPerms = (isAdd: boolean) => {
    if (isAdd) {
      setAddSelectedPerms(new Set());
      setAddRolePreset("custom");
    } else {
      setEditSelectedPerms(new Set());
      setEditRolePreset("custom");
    }
  };

  // Actions execution
  const handleAddEmployeeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.delete("permissions");
    addSelectedPerms.forEach((p) => formData.append("permissions", p));

    startTransition(async () => {
      const res = await addEmployeeAction(formData);
      if ("error" in res && res.error) {
        toast.error(res.error);
      } else if ("employee" in res && res.employee) {
        toast.success(
          `Team member "${res.employee.full_name}" registered successfully`
        );
        setShowAddModal(false);
        if ("temporaryPassword" in res && res.temporaryPassword) {
          setCreatedCredentials({
            name: res.employee.full_name,
            email: res.employee.email,
            password: res.temporaryPassword,
          });
        }
      }
    });
  };

  const handleResetPassword = (emp: Employee) => {
    startTransition(async () => {
      const res = await resetEmployeePasswordAction(emp.email);
      if ("error" in res && res.error) {
        toast.error(res.error);
      } else if ("temporaryPassword" in res && res.temporaryPassword) {
        setCreatedCredentials({
          name: emp.full_name,
          email: emp.email,
          password: res.temporaryPassword,
        });
        toast.success(`Generated new password for ${emp.full_name}`);
      }
    });
  };

  const handleEditEmployeeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const formData = new FormData(e.currentTarget);
    const fullName =
      (formData.get("fullName") as string) ||
      editingEmployee.full_name ||
      "Team Member";
    const email = (formData.get("email") as string) || editingEmployee.email || "";
    const phone = (formData.get("phone") as string) || null;
    const department = formData.get("department") as EmployeeDepartment;
    const role = (formData.get("role") as string) || editingEmployee.role || "Staff";
    const designation =
      (formData.get("designation") as string) ||
      role ||
      editingEmployee.designation ||
      "Staff";
    const status = formData.get("status") as EmployeeStatus;
    const permissions = Array.from(editSelectedPerms);

    startTransition(async () => {
      const res = await updateEmployeeAction({
        id: editingEmployee.id,
        fullName,
        email,
        phone,
        department,
        role,
        designation,
        status,
        permissions,
      });

      if ("error" in res && res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Updated ${fullName}'s profile and access permissions`);
        setEditingEmployee(null);
        if (
          "employee" in res &&
          res.employee &&
          inspectEmployee?.id === editingEmployee.id
        ) {
          setInspectEmployee(res.employee);
        }
      }
    });
  };

  const handleToggleStatus = (emp: Employee) => {
    startTransition(async () => {
      const nextStatus = emp.status === "active" ? "inactive" : "active";
      const res = await toggleEmployeeStatusAction(emp.id);
      if ("error" in res && res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          `${emp.full_name} is now ${nextStatus === "active" ? "Active" : "Inactive"}`
        );
        if ("employee" in res && res.employee && inspectEmployee?.id === emp.id) {
          setInspectEmployee(res.employee);
        }
      }
    });
  };

  const handleDeleteEmployee = (emp: Employee) => {
    startTransition(async () => {
      const res = await deleteEmployeeAction(emp.id);
      if ("error" in res && res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Removed ${emp.full_name} from the platform team`);
        setDeleteConfirmEmployee(null);
        if (inspectEmployee?.id === emp.id) {
          setInspectEmployee(null);
        }
      }
    });
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    toast.success(`Copied employee code: ${code}`);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Filter & Sort Logic
  const filteredEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        const matchesDept = selectedDept === "all" || emp.department === selectedDept;
        const matchesStatus = selectedStatus === "all" || emp.status === selectedStatus;

        let matchesRole = true;
        if (selectedRole !== "all") {
          const r = (emp.role || emp.designation || "").toLowerCase();
          if (selectedRole === "admin") {
            matchesRole = r.includes("admin") || emp.role_level === "admin";
          } else if (selectedRole === "crm") {
            matchesRole = r.includes("crm") || emp.department === "seller_acquisition";
          } else if (selectedRole === "ops") {
            matchesRole = r.includes("operation") || emp.department === "operations";
          } else if (selectedRole === "staff") {
            matchesRole =
              !r.includes("admin") && !r.includes("crm") && !r.includes("operation");
          }
        }

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          emp.full_name.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.employee_code.toLowerCase().includes(q) ||
          (emp.role || "").toLowerCase().includes(q) ||
          emp.designation.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q);

        return matchesDept && matchesStatus && matchesRole && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "name_asc") return a.full_name.localeCompare(b.full_name);
        if (sortBy === "name_desc") return b.full_name.localeCompare(a.full_name);
        if (sortBy === "code") return a.employee_code.localeCompare(b.employee_code);
        if (sortBy === "dept") return a.department.localeCompare(b.department);
        // default: recent
        return (
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
      });
  }, [employees, selectedDept, selectedStatus, selectedRole, searchQuery, sortBy]);

  // Key Statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const adminEmployees = employees.filter((e) => {
    const r = (e.role || e.designation || "").toLowerCase();
    return r.includes("admin") || e.role_level === "admin";
  }).length;
  const totalDeptsCount = departments.length > 0 ? departments.length : 6;

  // Helper badges
  const getRoleBadge = (emp: Employee) => {
    const r = (emp.role || emp.designation || "").toLowerCase();
    if (r.includes("super admin") || emp.role_level === "admin") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-[#1A1A18] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
          <Shield className="h-3 w-3 text-[#C89D32]" />
          Super Admin
        </span>
      );
    }
    if (r.includes("crm") || emp.role_id === "crm_manager") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 shadow-2xs">
          <Users className="h-3 w-3 text-amber-600" />
          CRM Manager
        </span>
      );
    }
    if (r.includes("operation") || emp.role_id === "operation_manager") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-900 shadow-2xs">
          <Briefcase className="h-3 w-3 text-indigo-600" />
          Operation Lead
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#e4e4e7] bg-[#f4f4f5] px-2.5 py-0.5 text-[11px] font-medium text-[#111110]">
        {emp.role || emp.designation || "Staff Member"}
      </span>
    );
  };

  const getDepartmentBadge = (deptCode: string) => {
    const meta = DEPARTMENT_METADATA[deptCode] || {
      label: deptCode.replace(/_/g, " "),
      badgeBg: "bg-neutral-100 border-neutral-200",
      text: "text-neutral-700",
      dot: "bg-neutral-500",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-medium ${meta.badgeBg} ${meta.text}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
        {meta.label}
      </span>
    );
  };

  const getAccessibleModuleCount = (perms: PermissionKey[] = []) => {
    let count = 0;
    if (perms.some((p) => p.startsWith("crm:"))) count++;
    if (perms.some((p) => p.startsWith("tasks:"))) count++;
    if (perms.some((p) => p.startsWith("orders:"))) count++;
    if (perms.some((p) => p.startsWith("products:"))) count++;
    if (perms.some((p) => p.startsWith("employees:"))) count++;
    if (perms.some((p) => p.startsWith("verifications:"))) count++;
    if (perms.some((p) => p.startsWith("system:"))) count++;
    return count;
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
              <Shield className="h-3 w-3 text-amber-600" />
              Governance & RBAC
            </span>
            <span className="text-xs text-[#71717a]">•</span>
            <span className="text-xs font-medium text-[#71717a]">
              Platform Operations
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#111110] sm:text-4xl">
            Team Directory & Access Management
          </h1>
          <p className="mt-1 text-sm text-[#71717a]">
            Manage platform staff, assign predefined roles, and configure fine-grained
            module permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/employees/departments"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#e4e4e7] bg-white px-4 text-xs font-semibold text-[#111110] shadow-2xs transition hover:bg-[#f4f4f5]"
          >
            <Building2 className="h-4 w-4 text-[#C89D32]" />
            Manage Departments
          </Link>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#18181b] px-5 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800"
          >
            <UserPlus className="h-4 w-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div className="flex items-center gap-2 border-b border-[#e4e4e7] pb-3">
        <div className="flex items-center gap-1.5 rounded-full bg-[#18181b] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs">
          <Users className="h-3.5 w-3.5" />
          Team Directory ({totalEmployees})
        </div>
        <Link
          href="/dashboard/employees/departments"
          className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-[#71717a] transition hover:bg-[#f4f4f5] hover:text-[#111110]"
        >
          <Building2 className="h-3.5 w-3.5" />
          Departments ({totalDeptsCount})
        </Link>
        <Link
          href="/dashboard/roles"
          className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-[#71717a] transition hover:bg-[#f4f4f5] hover:text-[#111110]"
        >
          <Shield className="h-3.5 w-3.5 text-[#C89D32]" />
          Roles & Matrix
        </Link>
      </div>

      {/* ─── Top Stats Overview Strip (Exact Tasks Pattern) ─── */}
      <div className="grid grid-cols-2 divide-y overflow-hidden rounded-3xl border border-[#e4e4e7] bg-white shadow-2xs md:grid-cols-4 md:divide-x md:divide-y-0">
        <button
          onClick={() => {
            setSelectedStatus("all");
            setSelectedRole("all");
            setSelectedDept("all");
          }}
          className={`cursor-pointer px-6 py-5 text-left transition ${
            selectedStatus === "all" && selectedRole === "all" && selectedDept === "all"
              ? "bg-[#faf9f6]"
              : "hover:bg-[#faf9f6]"
          }`}
        >
          <p className="text-xs font-medium text-[#71717a]">Total Staff</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#111110] tabular-nums">
            {totalEmployees}
          </p>
          <p className="mt-1 text-xs text-[#71717a]">Across all business units</p>
        </button>

        <button
          onClick={() =>
            setSelectedStatus(selectedStatus === "active" ? "all" : "active")
          }
          className={`cursor-pointer px-6 py-5 text-left transition ${
            selectedStatus === "active" ? "bg-emerald-50/50" : "hover:bg-[#faf9f6]"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#71717a]">Active Members</p>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-emerald-600 tabular-nums">
            {activeEmployees}
          </p>
          <p className="mt-1 text-xs text-emerald-700">Operational & verified</p>
        </button>

        <button
          onClick={() => setSelectedRole(selectedRole === "admin" ? "all" : "admin")}
          className={`cursor-pointer px-6 py-5 text-left transition ${
            selectedRole === "admin" ? "bg-amber-50/50" : "hover:bg-[#faf9f6]"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#71717a]">Admins & Leads</p>
            <Shield className="h-3.5 w-3.5 text-[#C89D32]" />
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#111110] tabular-nums">
            {adminEmployees}
          </p>
          <p className="mt-1 text-xs text-[#71717a]">Full governance access</p>
        </button>

        <Link
          href="/dashboard/employees/departments"
          className="px-6 py-5 text-left transition hover:bg-[#faf9f6]"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#71717a]">Departments</p>
            <Building2 className="h-3.5 w-3.5 text-[#71717a]" />
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#111110] tabular-nums">
            {totalDeptsCount}
          </p>
          <p className="mt-1 text-xs text-[#71717a]">Configure units →</p>
        </Link>
      </div>

      {/* ─── Unified Main Directory Container ─── */}
      <section className="overflow-hidden rounded-3xl border border-[#e4e4e7] bg-white shadow-2xs">
        {/* Row 1: Search, Filter Dropdowns, View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4e4e7] px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-[#111110]">Team Directory</h2>
            <span className="rounded-full bg-[#f4f4f5] px-2.5 py-0.5 text-xs font-medium text-[#71717a]">
              {filteredEmployees.length} of {totalEmployees} members
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#71717a]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff, roles, codes..."
                className="h-9 w-full rounded-full border border-[#e4e4e7] bg-[#faf9f6] pr-8 pl-9 text-xs text-[#111110] placeholder-[#71717a] transition outline-none focus:border-[#111110] focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#71717a] hover:text-[#111110]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 rounded-full border border-[#e4e4e7] bg-white px-3 text-xs font-medium text-[#111110] outline-none focus:border-[#111110]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="h-9 rounded-full border border-[#e4e4e7] bg-white px-3 text-xs font-medium text-[#111110] outline-none focus:border-[#111110]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Super Admins</option>
              <option value="crm">CRM Leads</option>
              <option value="ops">Operations Leads</option>
              <option value="staff">Staff Members</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    "recent" | "name_asc" | "name_desc" | "dept" | "code"
                )
              }
              className="h-9 rounded-full border border-[#e4e4e7] bg-white px-3 text-xs font-medium text-[#111110] outline-none focus:border-[#111110]"
            >
              <option value="recent">Recently Joined</option>
              <option value="name_asc">Name (A–Z)</option>
              <option value="name_desc">Name (Z–A)</option>
              <option value="code">Employee Code</option>
              <option value="dept">Department</option>
            </select>

            {/* View Mode Switcher */}
            <div className="inline-flex h-9 items-center rounded-full border border-[#e4e4e7] bg-[#f4f4f5] p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid cards view"
                className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition ${
                  viewMode === "grid"
                    ? "bg-white text-[#111110] shadow-xs"
                    : "text-[#71717a] hover:text-[#111110]"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                title="Table list view"
                className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition ${
                  viewMode === "table"
                    ? "bg-white text-[#111110] shadow-xs"
                    : "text-[#71717a] hover:text-[#111110]"
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Department Filter Pills (wrap naturally with clean pill styling) */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#e4e4e7] bg-[#faf9f6]/60 px-6 py-2.5">
          <button
            onClick={() => setSelectedDept("all")}
            className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition ${
              selectedDept === "all"
                ? "bg-[#18181b] text-white shadow-xs"
                : "border border-[#e4e4e7] bg-white text-[#71717a] hover:text-[#111110]"
            }`}
          >
            All Units ({employees.length})
          </button>
          {Object.entries(DEPARTMENT_METADATA).map(([key, meta]) => {
            const count = employees.filter((e) => e.department === key).length;
            return (
              <button
                key={key}
                onClick={() => setSelectedDept(key)}
                className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedDept === key
                    ? "bg-[#18181b] text-white shadow-xs"
                    : "border border-[#e4e4e7] bg-white text-[#71717a] hover:text-[#111110]"
                }`}
              >
                {meta.label} ({count})
              </button>
            );
          })}
        </div>

        {/* ─── Empty State ─── */}
        {filteredEmployees.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faf9f6] text-[#71717a]">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-[#111110]">
              No employees found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-[#71717a]">
              No team members match your selected search or filters.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDept("all");
                  setSelectedStatus("all");
                  setSelectedRole("all");
                }}
                className="rounded-xl border border-[#e4e4e7] bg-white px-4 py-2 text-xs font-semibold text-[#111110] transition hover:bg-[#faf9f6]"
              >
                Clear Filters
              </button>
              <button
                onClick={handleOpenAddModal}
                className="rounded-xl bg-[#18181b] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800"
              >
                Add Employee
              </button>
            </div>
          </div>
        )}

        {/* ─── GRID VIEW (Cards Mode) ─── */}
        {viewMode === "grid" && filteredEmployees.length > 0 && (
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((emp) => {
              const moduleCount = getAccessibleModuleCount(emp.permissions);
              const initials = emp.full_name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              const actionItems: ActionItem[] = [
                {
                  label: "Inspect & Audit RBAC",
                  icon: <Eye className="h-3.5 w-3.5" />,
                  onClick: () => setInspectEmployee(emp),
                },
                {
                  label: "Edit Profile & Role",
                  icon: <Edit2 className="h-3.5 w-3.5" />,
                  onClick: () => handleOpenEditModal(emp),
                },
                {
                  label: "Reset Login Password",
                  icon: <Key className="h-3.5 w-3.5" />,
                  onClick: () => handleResetPassword(emp),
                },
                {
                  label: emp.status === "active" ? "Mark Inactive" : "Mark Active",
                  icon: <Power className="h-3.5 w-3.5" />,
                  onClick: () => handleToggleStatus(emp),
                },
                {
                  label: "Copy Email",
                  icon: <Mail className="h-3.5 w-3.5" />,
                  onClick: () => {
                    navigator.clipboard.writeText(emp.email);
                    toast.success(`Copied email: ${emp.email}`);
                  },
                },
                {
                  label: "Delete Member",
                  icon: <Trash2 className="h-3.5 w-3.5" />,
                  variant: "destructive",
                  onClick: () => setDeleteConfirmEmployee(emp),
                },
              ];

              return (
                <div
                  key={emp.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-2xs transition hover:border-[#a1a1aa] hover:shadow-xs"
                >
                  <div>
                    {/* Top Row: Avatar, Name, Code, Dropdown */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e4e4e7] bg-[#faf9f6] font-bold text-[#111110]">
                          <span>{initials}</span>
                          <span
                            className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                              emp.status === "active"
                                ? "bg-emerald-500"
                                : "bg-neutral-400"
                            }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-[#111110] group-hover:text-[#C89D32]">
                            {emp.full_name}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-[#71717a]">
                              {emp.employee_code}
                            </span>
                            <button
                              onClick={() => handleCopyCode(emp.employee_code, emp.id)}
                              title="Copy Employee ID"
                              className="cursor-pointer text-[#71717a] transition hover:text-[#111110]"
                            >
                              {copiedCodeId === emp.id ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <ActionDropdown actions={actionItems} align="right" />
                      </div>
                    </div>

                    {/* Badges Row */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                      {getRoleBadge(emp)}
                      {getDepartmentBadge(emp.department)}
                    </div>

                    {/* Metadata list */}
                    <div className="mt-4 space-y-2 border-t border-[#e4e4e7]/80 pt-3 text-xs">
                      <div className="flex items-center justify-between text-[#71717a]">
                        <span>Designation</span>
                        <span className="max-w-[170px] truncate font-medium text-[#111110]">
                          {emp.designation || emp.role}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[#71717a]">
                        <span>Email</span>
                        <a
                          href={`mailto:${emp.email}`}
                          className="max-w-[170px] truncate font-mono text-[11px] text-[#111110] hover:underline"
                          title={emp.email}
                        >
                          {emp.email}
                        </a>
                      </div>

                      {emp.phone && (
                        <div className="flex items-center justify-between text-[#71717a]">
                          <span>Phone</span>
                          <a
                            href={`tel:${emp.phone}`}
                            className="font-mono text-[11px] text-[#111110] hover:underline"
                          >
                            {emp.phone}
                          </a>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[#71717a]">
                        <span>Joined</span>
                        <span className="text-[11px] text-[#111110]">
                          {emp.joined_at
                            ? new Date(emp.joined_at).toLocaleDateString("en-GB", {
                                month: "short",
                                year: "numeric",
                              })
                            : "Active"}
                        </span>
                      </div>
                    </div>

                    {/* Permissions Mini Matrix */}
                    <div className="mt-4 rounded-xl border border-[#e4e4e7] bg-[#faf9f6] p-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-[#71717a]">RBAC Modules</span>
                        <span className="font-semibold text-[#111110]">
                          {moduleCount} / 7 Allowed
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {MODULE_PERMISSIONS.map((m) => {
                          const hasAccess = (emp.permissions || []).includes(m.readKey);
                          return (
                            <span
                              key={m.module}
                              title={`${m.module}: ${hasAccess ? "Allowed" : "No Access"}`}
                              className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] ${
                                hasAccess
                                  ? "border border-[#e4e4e7] bg-white text-[#111110] shadow-2xs"
                                  : "text-neutral-300"
                              }`}
                            >
                              {m.icon}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-5 flex items-center justify-between border-t border-[#e4e4e7]/80 pt-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        emp.status === "active" ? "text-emerald-700" : "text-[#71717a]"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          emp.status === "active" ? "bg-emerald-500" : "bg-neutral-400"
                        }`}
                      />
                      {emp.status === "active" ? "Active" : "Inactive"}
                    </span>

                    <button
                      onClick={() => setInspectEmployee(emp)}
                      className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#111110] hover:text-[#C89D32]"
                    >
                      View Details
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── TABLE VIEW (Data Grid Mode) ─── */}
        {viewMode === "table" && filteredEmployees.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#e4e4e7] bg-[#faf9f6] text-[11px] font-semibold text-[#71717a] uppercase">
                <tr>
                  <th className="py-3.5 pr-4 pl-6">Team Member</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Role & Access Tier</th>
                  <th className="px-4 py-3.5">Modules Allowed</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Joined</th>
                  <th className="py-3.5 pr-6 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e4e7]">
                {filteredEmployees.map((emp) => {
                  const initials = emp.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const moduleCount = getAccessibleModuleCount(emp.permissions);

                  const actionItems: ActionItem[] = [
                    {
                      label: "Inspect & Audit RBAC",
                      icon: <Eye className="h-3.5 w-3.5" />,
                      onClick: () => setInspectEmployee(emp),
                    },
                    {
                      label: "Edit Profile & Role",
                      icon: <Edit2 className="h-3.5 w-3.5" />,
                      onClick: () => handleOpenEditModal(emp),
                    },
                    {
                      label: "Reset Login Password",
                      icon: <Key className="h-3.5 w-3.5" />,
                      onClick: () => handleResetPassword(emp),
                    },
                    {
                      label: emp.status === "active" ? "Mark Inactive" : "Mark Active",
                      icon: <Power className="h-3.5 w-3.5" />,
                      onClick: () => handleToggleStatus(emp),
                    },
                    {
                      label: "Delete Member",
                      icon: <Trash2 className="h-3.5 w-3.5" />,
                      variant: "destructive",
                      onClick: () => setDeleteConfirmEmployee(emp),
                    },
                  ];

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => setInspectEmployee(emp)}
                      className="cursor-pointer transition hover:bg-[#faf9f6]/80"
                    >
                      <td className="py-3.5 pr-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e4e4e7] bg-[#faf9f6] font-bold text-[#111110]">
                            {initials}
                          </div>
                          <div>
                            <span className="font-semibold text-[#111110]">
                              {emp.full_name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#71717a]">
                              <span className="font-mono">{emp.employee_code}</span>
                              <span>•</span>
                              <span>{emp.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {getDepartmentBadge(emp.department)}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          {getRoleBadge(emp)}
                          <p className="text-[11px] text-[#71717a]">
                            {emp.designation || emp.role}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="rounded-md border border-[#e4e4e7] bg-[#faf9f6] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#111110]">
                          {moduleCount} / 7
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            emp.status === "active"
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              emp.status === "active"
                                ? "bg-emerald-500"
                                : "bg-neutral-400"
                            }`}
                          />
                          {emp.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-[#71717a]">
                        {emp.joined_at
                          ? new Date(emp.joined_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      <td
                        className="py-3.5 pr-6 pl-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ActionDropdown actions={actionItems} align="right" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ─── SLIDE OVER DRAWER (Inspection & Full RBAC Audit) ─── */}
      <SlideOverDrawer
        isOpen={Boolean(inspectEmployee)}
        onClose={() => setInspectEmployee(null)}
        title={inspectEmployee?.full_name || "Employee Profile"}
        subtitle={`Employee ID: ${inspectEmployee?.employee_code || ""}`}
        maxWidth="xl"
      >
        {inspectEmployee && (
          <div className="space-y-6">
            {/* Header Identity Card */}
            <div className="rounded-2xl border border-[#e4e4e7] bg-[#faf9f6] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e4e4e7] bg-white text-lg font-bold text-[#111110] shadow-xs">
                    {inspectEmployee.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#111110]">
                      {inspectEmployee.full_name}
                    </h3>
                    <p className="text-xs text-[#71717a]">
                      {inspectEmployee.designation || inspectEmployee.role}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      {getRoleBadge(inspectEmployee)}
                      {getDepartmentBadge(inspectEmployee.department)}
                    </div>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    inspectEmployee.status === "active"
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      inspectEmployee.status === "active"
                        ? "bg-emerald-500"
                        : "bg-neutral-400"
                    }`}
                  />
                  {inspectEmployee.status.toUpperCase()}
                </span>
              </div>

              {/* Quick Actions in Drawer */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#e4e4e7] pt-3">
                <button
                  onClick={() => handleOpenEditModal(inspectEmployee)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#e4e4e7] bg-white px-3 py-1.5 text-xs font-semibold text-[#111110] shadow-2xs hover:bg-[#faf9f6]"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Profile & Access
                </button>
                <button
                  onClick={() => handleResetPassword(inspectEmployee)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#e4e4e7] bg-white px-3 py-1.5 text-xs font-semibold text-[#111110] shadow-2xs hover:bg-[#faf9f6]"
                >
                  <Key className="h-3.5 w-3.5 text-[#C89D32]" />
                  Reset Password
                </button>
                <button
                  onClick={() => handleToggleStatus(inspectEmployee)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#e4e4e7] bg-white px-3 py-1.5 text-xs font-semibold text-[#111110] shadow-2xs hover:bg-[#faf9f6]"
                >
                  <Power className="h-3.5 w-3.5" />
                  {inspectEmployee.status === "active" ? "Set Inactive" : "Set Active"}
                </button>
                <button
                  onClick={() => setDeleteConfirmEmployee(inspectEmployee)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>

            {/* Profile Information Block */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold tracking-wider text-[#71717a] uppercase">
                Contact & Account Details
              </h4>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="rounded-xl border border-[#e4e4e7] bg-white p-3">
                  <span className="text-[10px] text-[#71717a]">Email Address</span>
                  <a
                    href={`mailto:${inspectEmployee.email}`}
                    className="mt-0.5 block truncate font-mono text-xs font-semibold text-[#111110] hover:underline"
                  >
                    {inspectEmployee.email}
                  </a>
                </div>

                <div className="rounded-xl border border-[#e4e4e7] bg-white p-3">
                  <span className="text-[10px] text-[#71717a]">Phone Number</span>
                  <p className="mt-0.5 font-mono text-xs font-semibold text-[#111110]">
                    {inspectEmployee.phone || "Not configured"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#e4e4e7] bg-white p-3">
                  <span className="text-[10px] text-[#71717a]">Employee Code</span>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#111110]">
                      {inspectEmployee.employee_code}
                    </span>
                    <button
                      onClick={() =>
                        handleCopyCode(
                          inspectEmployee.employee_code,
                          inspectEmployee.id
                        )
                      }
                      className="cursor-pointer text-[#71717a] hover:text-[#111110]"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-[#e4e4e7] bg-white p-3">
                  <span className="text-[10px] text-[#71717a]">Joined Date</span>
                  <p className="mt-0.5 text-xs font-semibold text-[#111110]">
                    {inspectEmployee.joined_at
                      ? new Date(inspectEmployee.joined_at).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "Recently Registered"}
                  </p>
                </div>
              </div>
            </div>

            {/* Granular RBAC Permissions Audit Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold tracking-wider text-[#71717a] uppercase">
                  Granular RBAC Permissions Matrix
                </h4>
                <span className="rounded-md bg-[#faf9f6] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#111110]">
                  {inspectEmployee.permissions?.length || 0} Permissions Active
                </span>
              </div>

              <div className="divide-y divide-[#e4e4e7] rounded-2xl border border-[#e4e4e7] bg-white">
                {MODULE_PERMISSIONS.map((mod) => {
                  const perms = inspectEmployee.permissions || [];
                  const hasRead = perms.includes(mod.readKey);
                  const hasWrite = perms.includes(mod.writeKey);
                  const hasDelete = mod.deleteKey
                    ? perms.includes(mod.deleteKey)
                    : null;
                  const hasSpecial = mod.specialKey
                    ? perms.includes(mod.specialKey)
                    : null;

                  return (
                    <div key={mod.module} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#faf9f6]">
                            {mod.icon}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-[#111110]">
                              {mod.module}
                            </h5>
                            <p className="text-[10px] text-[#71717a]">
                              {mod.readLabel}
                            </p>
                          </div>
                        </div>

                        {/* Badges for Read, Write, Delete, Special */}
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              hasRead
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-neutral-100 text-neutral-400"
                            }`}
                          >
                            Read {hasRead ? "✓" : "✗"}
                          </span>

                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              hasWrite
                                ? "bg-blue-50 text-blue-800"
                                : "bg-neutral-100 text-neutral-400"
                            }`}
                          >
                            Write {hasWrite ? "✓" : "✗"}
                          </span>

                          {mod.deleteKey && (
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                hasDelete
                                  ? "bg-rose-50 text-rose-800"
                                  : "bg-neutral-100 text-neutral-400"
                              }`}
                            >
                              Delete {hasDelete ? "✓" : "✗"}
                            </span>
                          )}

                          {mod.specialKey && (
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                hasSpecial
                                  ? "bg-amber-50 text-amber-800"
                                  : "bg-neutral-100 text-neutral-400"
                              }`}
                            >
                              Admin {hasSpecial ? "✓" : "✗"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </SlideOverDrawer>

      {/* ─── ADD EMPLOYEE DRAWER (Side View) ─── */}
      <SlideOverDrawer
        isOpen={showAddModal}
        onClose={() => !isPending && setShowAddModal(false)}
        title="Add New Team Member"
        subtitle="Register internal staff, assign department, and configure RBAC policies."
        maxWidth="2xl"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowAddModal(false)}
              className="cursor-pointer rounded-xl border border-[#e4e4e7] bg-white px-4 py-2 text-xs font-semibold text-[#111110] hover:bg-[#faf9f6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-employee-form"
              disabled={isPending}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#18181b] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Register Employee
            </button>
          </div>
        }
      >
        <form
          id="add-employee-form"
          onSubmit={handleAddEmployeeSubmit}
          className="space-y-5"
        >
          {/* Personal Information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#111110]">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                required
                placeholder="e.g. Radhika Sharma"
                className="mt-1 w-full rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 text-xs text-[#111110] outline-none focus:border-[#111110]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111110]">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="e.g. radhika@genz.in"
                className="mt-1 w-full rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 text-xs text-[#111110] outline-none focus:border-[#111110]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111110]">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                className="mt-1 w-full rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 text-xs text-[#111110] outline-none focus:border-[#111110]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111110]">
                Department
              </label>
              <select
                name="department"
                className="mt-1 w-full rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 text-xs text-[#111110] outline-none focus:border-[#111110]"
              >
                <option value="seller_acquisition">Sales & Sourcing (CRM)</option>
                <option value="operations">Operations & Fulfillment</option>
                <option value="catalog_operations">Catalog Operations</option>
                <option value="tech">Technology & Platform</option>
                <option value="support">Customer & Artisan Support</option>
                <option value="admin">Administration</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111110]">
              Designation / Role Title
            </label>
            <input
              type="text"
              name="designation"
              placeholder="e.g. Senior CRM Specialist"
              className="mt-1 w-full rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 text-xs text-[#111110] outline-none focus:border-[#111110]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111110]">
              Initial Login Password (Optional)
            </label>
            <input
              type="text"
              name="initialPassword"
              placeholder="Leave blank to auto-generate (e.g. GZ-648291#)"
              className="mt-1 w-full rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 font-mono text-xs text-[#111110] outline-none focus:border-[#111110]"
            />
            <p className="mt-1 text-[11px] text-[#71717a]">
              The employee logs in at{" "}
              <span className="font-mono font-semibold text-[#111110]">/login</span>{" "}
              using their email and this password.
            </p>
          </div>

          {/* Role Preset Selector Cards */}
          <div>
            <label className="block text-xs font-semibold text-[#111110]">
              Role Preset (Auto-provisions Permissions)
            </label>
            <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => handleRolePresetChangeForAdd("super_admin")}
                className={`cursor-pointer rounded-2xl border p-3 text-left transition ${
                  addRolePreset === "super_admin"
                    ? "border-[#111110] bg-[#faf9f6] ring-1 ring-[#111110]"
                    : "border-[#e4e4e7] bg-white hover:border-[#a1a1aa]"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#111110]">
                  <Shield className="h-3.5 w-3.5 text-[#C89D32]" />
                  Super Admin
                </div>
                <p className="mt-1 text-[11px] text-[#71717a]">
                  Unrestricted master access across all platform modules.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleRolePresetChangeForAdd("crm_manager")}
                className={`cursor-pointer rounded-2xl border p-3 text-left transition ${
                  addRolePreset === "crm_manager"
                    ? "border-amber-500 bg-amber-50/50 ring-1 ring-amber-500"
                    : "border-[#e4e4e7] bg-white hover:border-[#a1a1aa]"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Users className="h-3.5 w-3.5 text-amber-600" />
                  CRM Manager
                </div>
                <p className="mt-1 text-[11px] text-[#71717a]">
                  Seller pipeline, lead onboarding, tasks, and verifications.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleRolePresetChangeForAdd("operation_manager")}
                className={`cursor-pointer rounded-2xl border p-3 text-left transition ${
                  addRolePreset === "operation_manager"
                    ? "border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500"
                    : "border-[#e4e4e7] bg-white hover:border-[#a1a1aa]"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                  Operation Lead
                </div>
                <p className="mt-1 text-[11px] text-[#71717a]">
                  Orders fulfillment, shipping, product catalog curation.
                </p>
              </button>
            </div>
            <input type="hidden" name="rolePreset" value={addRolePreset} />
          </div>

          {/* Fine-grained Permissions Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#111110]">
                Module Access & Capabilities
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAllPerms(true)}
                  className="cursor-pointer text-[11px] font-semibold text-[#C89D32] hover:underline"
                >
                  Select All
                </button>
                <span className="text-[#71717a]">•</span>
                <button
                  type="button"
                  onClick={() => handleClearAllPerms(true)}
                  className="cursor-pointer text-[11px] text-[#71717a] hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="max-h-56 divide-y divide-[#e4e4e7] overflow-y-auto rounded-2xl border border-[#e4e4e7] bg-[#faf9f6] p-3 text-xs">
              {MODULE_PERMISSIONS.map((mod) => (
                <div key={mod.module} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2 font-bold text-[#111110]">
                    {mod.icon}
                    <span>{mod.module}</span>
                  </div>
                  <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-[#52524E]">
                      <input
                        type="checkbox"
                        checked={addSelectedPerms.has(mod.readKey)}
                        onChange={() => toggleAddPerm(mod.readKey)}
                        className="rounded border-[#e4e4e7]"
                      />
                      Read / View
                    </label>
                    <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-[#52524E]">
                      <input
                        type="checkbox"
                        checked={addSelectedPerms.has(mod.writeKey)}
                        onChange={() => toggleAddPerm(mod.writeKey)}
                        className="rounded border-[#e4e4e7]"
                      />
                      Write / Create
                    </label>
                    {mod.deleteKey && (
                      <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-[#52524E]">
                        <input
                          type="checkbox"
                          checked={addSelectedPerms.has(mod.deleteKey)}
                          onChange={() => toggleAddPerm(mod.deleteKey!)}
                          className="rounded border-[#e4e4e7]"
                        />
                        Delete
                      </label>
                    )}
                    {mod.specialKey && (
                      <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-[#52524E]">
                        <input
                          type="checkbox"
                          checked={addSelectedPerms.has(mod.specialKey)}
                          onChange={() => toggleAddPerm(mod.specialKey!)}
                          className="rounded border-[#e4e4e7]"
                        />
                        Special / Admin
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </SlideOverDrawer>

      {/* ─── EDIT EMPLOYEE DRAWER (Side View) ─── */}
      <SlideOverDrawer
        isOpen={Boolean(editingEmployee)}
        onClose={() => !isPending && setEditingEmployee(null)}
        title={editingEmployee ? `Edit ${editingEmployee.full_name}` : "Edit Employee"}
        subtitle="Update role profile, active status, and RBAC matrix permissions."
        maxWidth="2xl"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setEditingEmployee(null)}
              className="cursor-pointer rounded-xl border border-[#e4e4e7] bg-white px-4 py-2 text-xs font-semibold text-[#111110] hover:bg-[#faf9f6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-employee-form"
              disabled={isPending}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#18181b] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Changes
            </button>
          </div>
        }
      >
        {editingEmployee && (
          <form
            id="edit-employee-form"
            onSubmit={handleEditEmployeeSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#111110]">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  defaultValue={editingEmployee.full_name}
                  required
                  className="mt-1 w-full rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 text-xs text-[#111110] outline-none focus:border-[#111110]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111110]">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingEmployee.email}
                  required
                  className="mt-1 w-full rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 text-xs text-[#111110] outline-none focus:border-[#111110]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111110]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingEmployee.phone || ""}
                  placeholder="+91 98765 43210"
                  className="mt-1 w-full rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 text-xs text-[#111110] outline-none focus:border-[#111110]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111110]">
                  Account Status
                </label>
                <select
                  name="status"
                  defaultValue={editingEmployee.status}
                  className="mt-1 w-full rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 text-xs text-[#111110] outline-none focus:border-[#111110]"
                >
                  <option value="active">Active (Full Access)</option>
                  <option value="inactive">Inactive (Suspended)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#111110]">
                  Department
                </label>
                <select
                  name="department"
                  defaultValue={editingEmployee.department}
                  className="mt-1 w-full rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 text-xs text-[#111110] outline-none focus:border-[#111110]"
                >
                  <option value="seller_acquisition">Sales & Sourcing (CRM)</option>
                  <option value="operations">Operations & Fulfillment</option>
                  <option value="catalog_operations">Catalog Operations</option>
                  <option value="tech">Technology & Platform</option>
                  <option value="support">Customer & Artisan Support</option>
                  <option value="admin">Administration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111110]">
                  Designation / Title
                </label>
                <input
                  type="text"
                  name="designation"
                  defaultValue={editingEmployee.designation || editingEmployee.role}
                  className="mt-1 w-full rounded-xl border border-[#e4e4e7] bg-white px-3 py-2 text-xs text-[#111110] outline-none focus:border-[#111110]"
                />
                <input type="hidden" name="role" value={editingEmployee.role} />
              </div>
            </div>

            {/* Quick Role Preset Change */}
            <div>
              <label className="block text-xs font-semibold text-[#111110]">
                Quick Role Preset
              </label>
              <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => handleRolePresetChangeForEdit("super_admin")}
                  className={`cursor-pointer rounded-2xl border p-3 text-left transition ${
                    editRolePreset === "super_admin"
                      ? "border-[#111110] bg-[#faf9f6] ring-1 ring-[#111110]"
                      : "border-[#e4e4e7] bg-white hover:border-[#a1a1aa]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#111110]">
                    <Shield className="h-3.5 w-3.5 text-[#C89D32]" />
                    Super Admin
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRolePresetChangeForEdit("crm_manager")}
                  className={`cursor-pointer rounded-2xl border p-3 text-left transition ${
                    editRolePreset === "crm_manager"
                      ? "border-amber-500 bg-amber-50/50 ring-1 ring-amber-500"
                      : "border-[#e4e4e7] bg-white hover:border-[#a1a1aa]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Users className="h-3.5 w-3.5 text-amber-600" />
                    CRM Manager
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRolePresetChangeForEdit("operation_manager")}
                  className={`cursor-pointer rounded-2xl border p-3 text-left transition ${
                    editRolePreset === "operation_manager"
                      ? "border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500"
                      : "border-[#e4e4e7] bg-white hover:border-[#a1a1aa]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                    Operation Lead
                  </div>
                </button>
              </div>
            </div>

            {/* Module Access Checkboxes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#111110]">
                  Module Access & Capabilities
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAllPerms(false)}
                    className="cursor-pointer text-[11px] font-semibold text-[#C89D32] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[#71717a]">•</span>
                  <button
                    type="button"
                    onClick={() => handleClearAllPerms(false)}
                    className="cursor-pointer text-[11px] text-[#71717a] hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="max-h-56 divide-y divide-[#e4e4e7] overflow-y-auto rounded-2xl border border-[#e4e4e7] bg-[#faf9f6] p-3 text-xs">
                {MODULE_PERMISSIONS.map((mod) => (
                  <div key={mod.module} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2 font-bold text-[#111110]">
                      {mod.icon}
                      <span>{mod.module}</span>
                    </div>
                    <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-[#52524E]">
                        <input
                          type="checkbox"
                          checked={editSelectedPerms.has(mod.readKey)}
                          onChange={() => toggleEditPerm(mod.readKey)}
                          className="rounded border-[#e4e4e7]"
                        />
                        Read
                      </label>
                      <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-[#52524E]">
                        <input
                          type="checkbox"
                          checked={editSelectedPerms.has(mod.writeKey)}
                          onChange={() => toggleEditPerm(mod.writeKey)}
                          className="rounded border-[#e4e4e7]"
                        />
                        Write
                      </label>
                      {mod.deleteKey && (
                        <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-[#52524E]">
                          <input
                            type="checkbox"
                            checked={editSelectedPerms.has(mod.deleteKey)}
                            onChange={() => toggleEditPerm(mod.deleteKey!)}
                            className="rounded border-[#e4e4e7]"
                          />
                          Delete
                        </label>
                      )}
                      {mod.specialKey && (
                        <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-[#52524E]">
                          <input
                            type="checkbox"
                            checked={editSelectedPerms.has(mod.specialKey)}
                            onChange={() => toggleEditPerm(mod.specialKey!)}
                            className="rounded border-[#e4e4e7]"
                          />
                          Admin
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        )}
      </SlideOverDrawer>

      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      {deleteConfirmEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1A1A18]/50 backdrop-blur-xs"
            onClick={() => !isPending && setDeleteConfirmEmployee(null)}
          />

          <div className="relative w-full max-w-md rounded-3xl border border-[#e4e4e7] bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="mt-3 text-base font-bold text-[#111110]">
              Remove Employee?
            </h3>
            <p className="mt-1 text-xs text-[#71717a]">
              Are you sure you want to remove{" "}
              <strong className="text-[#111110]">
                {deleteConfirmEmployee.full_name}
              </strong>{" "}
              ({deleteConfirmEmployee.employee_code})? This will revoke all their active
              permissions and platform logins immediately.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#e4e4e7] pt-4">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setDeleteConfirmEmployee(null)}
                className="cursor-pointer rounded-xl border border-[#e4e4e7] bg-white px-4 py-2 text-xs font-semibold text-[#111110] hover:bg-[#faf9f6]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDeleteEmployee(deleteConfirmEmployee)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CREATED / RESET CREDENTIALS MODAL ─── */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1A1A18]/50 backdrop-blur-xs"
            onClick={() => setCreatedCredentials(null)}
          />

          <div className="relative w-full max-w-md rounded-3xl border border-[#e4e4e7] bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Key className="h-6 w-6 text-[#C89D32]" />
            </div>

            <h3 className="mt-3 text-base font-bold text-[#111110]">
              Employee Login Credentials
            </h3>
            <p className="mt-1 text-xs text-[#71717a]">
              Account configured for{" "}
              <strong className="text-[#111110]">{createdCredentials.name}</strong>.
              Share these credentials with the team member to allow them to access the
              Studio Admin Dashboard.
            </p>

            <div className="mt-4 space-y-2.5 rounded-2xl border border-[#e4e4e7] bg-[#faf9f6] p-4 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-[#71717a] uppercase">
                  Login Portal URL
                </span>
                <div className="mt-0.5 flex items-center justify-between font-mono font-bold text-[#111110]">
                  <span>/login</span>
                  <button
                    onClick={() => {
                      const url =
                        typeof window !== "undefined"
                          ? `${window.location.origin}/login`
                          : "/login";
                      navigator.clipboard.writeText(url);
                      toast.success("Copied Login URL!");
                    }}
                    className="cursor-pointer text-[#71717a] hover:text-[#111110]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="border-t border-[#e4e4e7] pt-2">
                <span className="text-[10px] font-semibold text-[#71717a] uppercase">
                  Corporate Email
                </span>
                <div className="mt-0.5 flex items-center justify-between font-mono font-bold text-[#111110]">
                  <span>{createdCredentials.email}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.email);
                      toast.success("Copied Email!");
                    }}
                    className="cursor-pointer text-[#71717a] hover:text-[#111110]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="border-t border-[#e4e4e7] pt-2">
                <span className="text-[10px] font-semibold text-[#71717a] uppercase">
                  Login Password
                </span>
                <div className="mt-0.5 flex items-center justify-between font-mono font-bold text-emerald-700">
                  <span>{createdCredentials.password}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.password);
                      toast.success("Copied Password!");
                    }}
                    className="cursor-pointer text-[#71717a] hover:text-[#111110]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#e4e4e7] pt-4">
              <button
                type="button"
                onClick={() => {
                  const origin =
                    typeof window !== "undefined" ? window.location.origin : "";
                  const details = `GenZ Admin Login:\nURL: ${origin}/login\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
                  navigator.clipboard.writeText(details);
                  toast.success("Copied full login instructions!");
                  setCreatedCredentials(null);
                }}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#18181b] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy All & Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
