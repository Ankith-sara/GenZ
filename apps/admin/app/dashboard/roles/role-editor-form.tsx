"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Users,
  Briefcase,
  CheckCircle2,
  Save,
  Sparkles,
  CheckSquare,
  Square,
} from "lucide-react";
import type { RoleDefinition, RoleLevel, PermissionKey } from "@genz/types";
import { ADMIN_MODULE_PERMISSIONS } from "@genz/types";
import { addRoleAction, updateRoleAction } from "./actions";

interface RoleEditorFormProps {
  initialRole?: RoleDefinition | null;
}

export function RoleEditorForm({ initialRole }: RoleEditorFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialRole?.id);

  const [name, setName] = useState(initialRole?.name || "");
  const [code, setCode] = useState(initialRole?.code || "");
  const [description, setDescription] = useState(initialRole?.description || "");
  const [roleLevel, setRoleLevel] = useState<RoleLevel>(initialRole?.role_level || "manager");
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>(
    initialRole?.permissions && initialRole.permissions.length > 0
      ? initialRole.permissions
      : [
          "orders:read",
          "orders:write",
          "orders:delete",
          "products:read",
          "products:write",
          "products:delete",
          "tasks:read",
          "tasks:write",
          "tasks:assign",
        ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allAvailablePermissions = ADMIN_MODULE_PERMISSIONS.flatMap((m) =>
    m.actions.map((a) => a.key)
  );

  const togglePermission = (key: PermissionKey) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const toggleModuleAll = (moduleActions: { key: PermissionKey }[]) => {
    const moduleKeys = moduleActions.map((a) => a.key);
    const hasAll = moduleKeys.every((k) => selectedPermissions.includes(k));
    if (hasAll) {
      setSelectedPermissions((prev) => prev.filter((k) => !moduleKeys.includes(k)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...moduleKeys])));
    }
  };

  // Presets
  const applyPreset = (preset: "super_admin" | "crm_manager" | "operation_manager") => {
    if (preset === "super_admin") {
      setSelectedPermissions([...allAvailablePermissions]);
      setRoleLevel("admin");
      if (!name) setName("Super Administrator");
      if (!code) setCode("SUPER_ADMIN");
    } else if (preset === "crm_manager") {
      setSelectedPermissions([
        "crm:read",
        "crm:write",
        "crm:delete",
        "crm:admin",
        "tasks:read",
        "tasks:write",
        "tasks:assign",
        "verifications:read",
        "employees:read",
        "system:read",
      ]);
      setRoleLevel("manager");
      if (!name) setName("CRM Manager");
      if (!code) setCode("CRM_MANAGER");
    } else if (preset === "operation_manager") {
      setSelectedPermissions([
        "orders:read",
        "orders:write",
        "orders:delete",
        "products:read",
        "products:write",
        "products:delete",
        "tasks:read",
        "tasks:write",
        "tasks:assign",
        "verifications:read",
        "verifications:write",
        "crm:read",
        "system:read",
      ]);
      setRoleLevel("manager");
      if (!name) setName("Operation Manager");
      if (!code) setCode("OPERATION_MANAGER");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (initialRole?.id) {
        formData.append("id", initialRole.id);
      }
      formData.append("name", name.trim());
      formData.append("code", code.trim().toUpperCase());
      formData.append("description", description.trim());
      formData.append("roleLevel", roleLevel);
      formData.append("permissionsJson", JSON.stringify(selectedPermissions));

      const res = isEditing
        ? await updateRoleAction(formData)
        : await addRoleAction(formData);

      if (res.error) {
        setErrorMessage(res.error);
        setIsSubmitting(false);
      } else {
        router.push("/dashboard/roles");
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
            href="/dashboard/roles"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Roles
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-amber-400 shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                {isEditing ? `Edit Role: ${initialRole?.name}` : "Create New Role"}
              </h1>
              <p className="text-xs text-neutral-500">
                Define role authority level and configure page-level CRUD permissions across the platform.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/roles"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 shadow-xs hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="role-editor-form"
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
                {isEditing ? "Save Changes" : "Create Role"}
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
            <span>Apply Role Template Preset:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyPreset("super_admin")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-900 hover:text-white transition-all"
            >
              <Shield className="h-3.5 w-3.5 text-[#C89D32]" />
              Super Administrator
            </button>
            <button
              type="button"
              onClick={() => applyPreset("crm_manager")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-100 transition-all"
            >
              <Users className="h-3.5 w-3.5 text-amber-700" />
              CRM Manager
            </button>
            <button
              type="button"
              onClick={() => applyPreset("operation_manager")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-900 shadow-2xs hover:bg-indigo-100 transition-all"
            >
              <Briefcase className="h-3.5 w-3.5 text-indigo-700" />
              Operation Manager (Orders & Products)
            </button>
          </div>
        </div>
      </div>

      <form id="role-editor-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Role Information */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-xs font-bold text-neutral-800">
                1
              </span>
              <div>
                <h2 className="text-base font-bold text-neutral-900">Role Information</h2>
                <p className="text-xs text-neutral-500">
                  Role identity, code slug, and hierarchical authority level
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
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Super Administrator, Operation Manager, CRM Lead"
                className="mt-1.5 block w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-hidden"
              />
              <p className="mt-1 text-[11px] text-neutral-400">
                Designation displayed on staff profile badges.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Role Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUPER_ADMIN, OPERATION_MANAGER"
                className="mt-1.5 block w-full font-mono rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-hidden"
              />
              <p className="mt-1 text-[11px] text-neutral-400">
                Unique system key for programmatic role resolution.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700">
                Role Description & Responsibility Scope
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the administrative scope and responsibilities assigned to this role..."
                className="mt-1.5 block w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-hidden resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Authority Level (RBAC)
              </label>
              <select
                value={roleLevel}
                onChange={(e) => setRoleLevel(e.target.value as RoleLevel)}
                className="mt-1.5 block w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-xs font-medium text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-hidden"
              >
                <option value="admin">Admin (Full System Authority)</option>
                <option value="manager">Manager (Departmental Management)</option>
                <option value="staff">Staff (Operational Execution)</option>
              </select>
              <p className="mt-1 text-[11px] text-neutral-400">
                Admins bypass individual permission checks; Managers & Staff require explicit module permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Role Permission Matrix (CRUD per Admin Page) */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-xs font-bold text-neutral-800">
                2
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-neutral-900">
                    Granular Page CRUD Permissions Matrix
                  </h2>
                  <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                    {selectedPermissions.length} active permissions
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Select permissions for each admin module: Products CRUD, Tasks CRUD, Orders CRUD, CRM CRUD, etc.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedPermissions([...allAvailablePermissions])}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
                Select All
              </button>
              <button
                type="button"
                onClick={() => setSelectedPermissions([])}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Square className="h-3.5 w-3.5 text-neutral-400" />
                Clear All
              </button>
            </div>
          </div>

          {/* Module List with CRUD Checkboxes */}
          <div className="space-y-4">
            {ADMIN_MODULE_PERMISSIONS.map((module) => {
              const moduleKeys = module.actions.map((a) => a.key);
              const allChecked = moduleKeys.every((k) => selectedPermissions.includes(k));
              const someChecked = moduleKeys.some((k) => selectedPermissions.includes(k));

              return (
                <div
                  key={module.id}
                  className={`rounded-xl border p-4.5 transition-all ${
                    someChecked
                      ? "border-neutral-300 bg-neutral-50/40"
                      : "border-neutral-200/80 bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">{module.name}</span>
                        {module.id === "products" || module.id === "orders" ? (
                          <span className="rounded-md bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                            Operations Core
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-neutral-500">{module.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleModuleAll(module.actions)}
                      className="self-start sm:self-auto text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      {allChecked ? "Deselect Module" : "Select Module All"}
                    </button>
                  </div>

                  {/* Action Checkboxes for this Module */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {module.actions.map((act) => {
                      const isChecked = selectedPermissions.includes(act.key);
                      return (
                        <label
                          key={act.key}
                          className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs font-medium cursor-pointer transition-all ${
                            isChecked
                              ? "border-neutral-900 bg-neutral-900 text-white shadow-2xs"
                              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            value={act.key}
                            checked={isChecked}
                            onChange={() => togglePermission(act.key)}
                            className="sr-only"
                          />
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                              isChecked
                                ? "border-[#C89D32] bg-[#C89D32] text-neutral-900"
                                : "border-neutral-300 bg-white"
                            }`}
                          >
                            {isChecked && <CheckCircle2 className="h-3 w-3" />}
                          </span>
                          <span className="truncate">{act.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
          <Link
            href="/dashboard/roles"
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
                {isEditing ? "Update Role" : "Save Role"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
