"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Building2, Shield, Save, Sparkles,
  ArrowRight,
} from "lucide-react";
import type { Department, Employee } from "@genz/types";
import { addDepartmentAction, updateDepartmentAction } from "./actions";

interface DepartmentEditorFormProps {
  initialDepartment?: Department | null;
  employees: Employee[];
}

export function DepartmentEditorForm({
  initialDepartment,
  employees,
}: DepartmentEditorFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialDepartment?.id);

  const [name, setName] = useState(initialDepartment?.name || "");
  const [code, setCode] = useState(initialDepartment?.code || "");
  const [description, setDescription] = useState(initialDepartment?.description || "");
  const [headEmployeeId, setHeadEmployeeId] = useState(initialDepartment?.head_employee_id || "");
  const [defaultRole, setDefaultRole] = useState(initialDepartment?.default_role || "Operation Manager");
  const [status, setStatus] = useState<"active" | "inactive">(initialDepartment?.status || "active");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const applyPreset = (preset: "tech" | "sales" | "operations" | "support") => {
    if (preset === "tech") {
      setName("Technology & Platform");
      setCode("TECH");
      setDescription("Core marketplace engineering, cloud infrastructure, AI models, and database systems");
      setDefaultRole("Super Admin");
    } else if (preset === "sales") {
      setName("Sales & Seller Acquisition");
      setCode("SALES");
      setDescription("GI artisan outreach, master craftsperson onboarding, cluster sourcing, and partnership pipelines");
      setDefaultRole("CRM Manager");
    } else if (preset === "operations") {
      setName("Operations & Fulfillment");
      setCode("OPERATIONS");
      setDescription("Customer orders, catalog products curation, courier logistics dispatching, and quality audits");
      setDefaultRole("Operation Manager");
    } else if (preset === "support") {
      setName("Customer & Artisan Support");
      setCode("SUPPORT");
      setDescription("Buyer order inquiries, artisan helpline, delivery resolutions, and satisfaction monitoring");
      setDefaultRole("Operation Manager");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const selectedHead = employees.find((emp) => emp.id === headEmployeeId);

      const formData = new FormData();
      if (initialDepartment?.id) {
        formData.append("id", initialDepartment.id);
      }
      formData.append("name", name.trim());
      formData.append("code", code.trim().toUpperCase());
      formData.append("description", description.trim());
      formData.append("defaultRole", defaultRole);
      formData.append("status", status);
      formData.append("headEmployeeId", headEmployeeId || "");
      formData.append("headEmployeeName", selectedHead?.full_name || "");

      const res = isEditing
        ? await updateDepartmentAction(formData)
        : await addDepartmentAction(formData);

      if (res.error) {
        setErrorMessage(res.error);
        setIsSubmitting(false);
      } else {
        router.push("/dashboard/employees/departments");
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/dashboard/employees/departments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Departments
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-amber-400 shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                {isEditing ? `Edit Department: ${initialDepartment?.name}` : "Create New Department"}
              </h1>
              <p className="text-xs text-neutral-500">
                Configure organizational units, department leadership, and default employee designation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/employees/departments"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 shadow-xs hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="department-editor-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </span>
            ) : (
              <>
                <Save className="h-4 w-4 text-[#C89D32]" />
                {isEditing ? "Save Changes" : "Create Department"}
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 shadow-xs">
          {errorMessage}
        </div>
      )}

      {/* Preset Quick Fill Bar */}
      <div className="rounded-2xl border border-neutral-200/80 bg-linear-to-r from-amber-500/5 via-neutral-50 to-indigo-500/5 p-4 backdrop-blur-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
            <Sparkles className="h-4 w-4 text-[#C89D32]" />
            <span>Apply Department Template:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyPreset("tech")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-900 hover:text-white transition-all"
            >
              Technology & Platform
            </button>
            <button
              type="button"
              onClick={() => applyPreset("sales")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-100 transition-all"
            >
              Sales & Acquisition
            </button>
            <button
              type="button"
              onClick={() => applyPreset("operations")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-900 shadow-2xs hover:bg-indigo-100 transition-all"
            >
              Operations & Logistics
            </button>
            <button
              type="button"
              onClick={() => applyPreset("support")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-900 shadow-2xs hover:bg-teal-100 transition-all"
            >
              Customer Support
            </button>
          </div>
        </div>
      </div>

      <form id="department-editor-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Department Information */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-xs font-bold text-neutral-800">
                1
              </span>
              <div>
                <h2 className="text-base font-bold text-neutral-900">Organizational Department Information</h2>
                <p className="text-xs text-neutral-500">
                  Basic administrative identifiers, organizational name, and code
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              Required
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Department Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Technology & Platform, Sales, Operations"
                className="mt-1.5 block w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-hidden"
              />
              <p className="mt-1 text-[11px] text-neutral-400">
                Display name visible in employee rosters and department listings.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Department Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. TECH, SALES, OPERATIONS, SUPPORT"
                className="mt-1.5 block w-full font-mono rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-hidden"
              />
              <p className="mt-1 text-[11px] text-neutral-400">
                Unique uppercase code for organization mapping and employee filtering.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700">
                Department Scope & Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this department's role within the organization..."
                className="mt-1.5 block w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-hidden resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Department Head / Lead (Optional)
              </label>
              <select
                value={headEmployeeId}
                onChange={(e) => setHeadEmployeeId(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-hidden"
              >
                <option value="">-- No designated department head --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.employee_code}) - {emp.designation}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-neutral-400">
                Assigned team leader accountable for tasks and approvals in this unit.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Default Role Template
              </label>
              <select
                value={defaultRole}
                onChange={(e) => setDefaultRole(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-hidden"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="CRM Manager">CRM Manager</option>
                <option value="Operation Manager">Operation Manager</option>
              </select>
              <p className="mt-1 text-[11px] text-neutral-400">
                Default role assigned to staff members joining this department.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Department Status
              </label>
              <div className="mt-2.5 flex items-center gap-6">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={status === "active"}
                    onChange={() => setStatus("active")}
                    className="h-4 w-4 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-600">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={status === "inactive"}
                    onChange={() => setStatus("inactive")}
                    className="h-4 w-4 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-neutral-300" />
                    Inactive / Archived
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Roles & Permissions Reference Banner */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-900">Need to manage Roles & CRUD Permissions?</h3>
                <p className="text-[11px] text-neutral-500">
                  Roles (Super Admin, CRM Manager, Operation Manager) with page-by-page CRUD matrices are managed in the Roles Management section.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/roles"
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors"
            >
              <span>Manage Roles</span>
              <ArrowRight className="h-3.5 w-3.5 text-neutral-500" />
            </Link>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
          <Link
            href="/dashboard/employees/departments"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </span>
            ) : (
              <>
                <Save className="h-4 w-4 text-[#C89D32]" />
                {isEditing ? "Update Department" : "Save Department"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
