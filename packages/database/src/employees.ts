import type {
  Employee,
  EmployeeDepartment,
  EmployeeStatus,
  Department,
} from "@genz/types";
import { createAdminClient } from "./admin";
import fs from "fs";
import path from "path";

function getEmployeesStoragePath(): string {
  const isTest = process.env.NODE_ENV === "test" || process.env.VITEST;
  const fileName = isTest ? "test-employees-store.json" : "employees-store.json";
  const primaryDir = path.resolve(process.cwd(), "packages/database/src/storage");
  if (fs.existsSync(primaryDir)) {
    return path.join(primaryDir, fileName);
  }
  const altDir = path.resolve(process.cwd(), "../../packages/database/src/storage");
  if (fs.existsSync(altDir)) {
    return path.join(altDir, fileName);
  }
  try {
    fs.mkdirSync(primaryDir, { recursive: true });
    return path.join(primaryDir, fileName);
  } catch {
    return path.resolve(process.cwd(), fileName);
  }
}

function getDepartmentsStoragePath(): string {
  const isTest = process.env.NODE_ENV === "test" || process.env.VITEST;
  const fileName = isTest ? "test-departments-store.json" : "departments-store.json";
  const primaryDir = path.resolve(process.cwd(), "packages/database/src/storage");
  if (fs.existsSync(primaryDir)) {
    return path.join(primaryDir, fileName);
  }
  const altDir = path.resolve(process.cwd(), "../../packages/database/src/storage");
  if (fs.existsSync(altDir)) {
    return path.join(altDir, fileName);
  }
  try {
    fs.mkdirSync(primaryDir, { recursive: true });
    return path.join(primaryDir, fileName);
  } catch {
    return path.resolve(process.cwd(), fileName);
  }
}

function readLocalEmployees(): Employee[] {
  try {
    const filePath = getEmployeesStoragePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw) as Employee[];
    }
  } catch (err) {
    console.error("[EmployeesRepo] Local read fallback error:", err);
  }
  return [];
}

function writeLocalEmployees(employees: Employee[]) {
  try {
    const filePath = getEmployeesStoragePath();
    fs.writeFileSync(filePath, JSON.stringify(employees, null, 2), "utf-8");
  } catch (err) {
    console.error("[EmployeesRepo] Local write fallback error:", err);
  }
}

const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: "dept-tech-001",
    name: "Technology & Platform",
    code: "TECH",
    description:
      "Core marketplace engineering, cloud infrastructure, AI models, and database systems",
    head_employee_name: "Admin User",
    head_employee_id: "admin-master-id",
    default_role: "Super Admin",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "dept-sales-002",
    name: "Sales & Seller Acquisition",
    code: "SALES",
    description:
      "GI artisan outreach, master craftsperson onboarding, cluster sourcing, and partnership pipelines",
    head_employee_name: "Pooja Hegde",
    head_employee_id: "emp-crm-001",
    default_role: "CRM Manager",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "dept-ops-003",
    name: "Operations & Fulfillment",
    code: "OPERATIONS",
    description:
      "Customer orders, catalog products curation, courier logistics dispatching, and quality audits",
    head_employee_name: "Karan Mehta",
    head_employee_id: "emp-ops-001",
    default_role: "Operation Manager",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "dept-support-004",
    name: "Customer & Artisan Support",
    code: "SUPPORT",
    description:
      "Buyer order inquiries, artisan helpline, delivery resolutions, and satisfaction monitoring",
    head_employee_name: "Divya Nair",
    head_employee_id: "emp-sup-001",
    default_role: "Operation Manager",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function sanitizeDepartments(list: Department[]): Department[] {
  const legacyCodes = new Set([
    "CATALOG_OPS",
    "SUPER_ADMIN",
    "CRM_MANAGER",
    "OPERATION_MANAGER",
  ]);
  const cleaned = list.filter((d) => !legacyCodes.has(d.code?.toUpperCase()));
  if (cleaned.length === 0) {
    return DEFAULT_DEPARTMENTS.map((d) => ({ ...d }));
  }
  // Ensure default departments are always present
  for (const defDept of DEFAULT_DEPARTMENTS) {
    if (!cleaned.some((d) => d.code === defDept.code)) {
      cleaned.push({ ...defDept });
    }
  }
  return cleaned;
}

function readLocalDepartments(): Department[] {
  try {
    const filePath = getDepartmentsStoragePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw) as Department[];
      if (parsed && parsed.length > 0) {
        return sanitizeDepartments(parsed);
      }
    }
  } catch (err) {
    console.error("[DepartmentsRepo] Local read fallback error:", err);
  }
  return DEFAULT_DEPARTMENTS.map((d) => ({ ...d }));
}

function writeLocalDepartments(departments: Department[]) {
  try {
    const filePath = getDepartmentsStoragePath();
    fs.writeFileSync(filePath, JSON.stringify(departments, null, 2), "utf-8");
  } catch (err) {
    console.error("[DepartmentsRepo] Local write fallback error:", err);
  }
}

export async function getEmployeesList(filters?: {
  department?: EmployeeDepartment;
  status?: EmployeeStatus;
}): Promise<Employee[]> {
  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.department) {
      query = query.eq("department", filters.department);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as Employee[];
    }
  } catch {
    // Database table not present or connection offline - proceed to fallback
  }

  let list = readLocalEmployees();

  if (filters?.department) {
    list = list.filter((e) => e.department === filters.department);
  }
  if (filters?.status) {
    list = list.filter((e) => e.status === filters.status);
  }
  return list;
}

export async function upsertEmployee(
  employee: Partial<Employee> & { email?: string; full_name?: string }
): Promise<Employee> {
  const now = new Date().toISOString();
  const list = readLocalEmployees();
  const existing = list.find(
    (e) =>
      (employee.id && e.id === employee.id) ||
      (employee.email && e.email === employee.email)
  );

  const id = employee.id || existing?.id || crypto.randomUUID();
  const roleName =
    employee.role ||
    employee.designation ||
    existing?.role ||
    existing?.designation ||
    "Operations Associate";

  const fullEmployee: Employee = {
    id,
    employee_code:
      employee.employee_code ||
      existing?.employee_code ||
      `GZ-EMP-${Math.floor(100 + Math.random() * 900)}`,
    full_name:
      employee.full_name && employee.full_name.trim().length > 0
        ? employee.full_name
        : existing?.full_name || "Team Member",
    email:
      employee.email && employee.email.trim().length > 0
        ? employee.email
        : existing?.email || "",
    phone: employee.phone !== undefined ? employee.phone : existing?.phone || null,
    department: employee.department || existing?.department || "seller_acquisition",
    designation: employee.designation || existing?.designation || roleName,
    role: roleName,
    role_id: employee.role_id || existing?.role_id,
    status: employee.status || existing?.status || "active",
    role_level: employee.role_level || existing?.role_level || "staff",
    permissions: employee.permissions ||
      existing?.permissions || ["crm:read", "crm:write", "tasks:read", "tasks:write"],
    joined_at: employee.joined_at || existing?.joined_at || now,
    created_at: existing?.created_at || employee.created_at || now,
    updated_at: now,
  };

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("employees").upsert(fullEmployee);
    if (!error) {
      return fullEmployee;
    }
  } catch {}

  const idx = list.findIndex(
    (e) => e.id === fullEmployee.id || e.email === fullEmployee.email
  );
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...fullEmployee, updated_at: now };
  } else {
    list.unshift(fullEmployee);
  }
  writeLocalEmployees(list);
  return fullEmployee;
}

export async function deleteEmployee(id: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    await supabase.from("employees").delete().eq("id", id);
  } catch {}

  const list = readLocalEmployees();
  const filtered = list.filter((e) => e.id !== id);
  writeLocalEmployees(filtered);
  return true;
}

export async function toggleEmployeeStatus(id: string): Promise<Employee | null> {
  const list = readLocalEmployees();
  const emp = list.find((e) => e.id === id);
  if (!emp) return null;

  const nextStatus: EmployeeStatus = emp.status === "active" ? "inactive" : "active";
  return upsertEmployee({
    ...emp,
    status: nextStatus,
  });
}

interface SupabaseDepartmentsClient {
  from: (table: string) => {
    select: (cols: string) => {
      order: (
        col: string,
        opts: { ascending: boolean }
      ) => Promise<{ data: Department[] | null; error: unknown }>;
    };
    upsert: (val: Department) => Promise<{ error: unknown }>;
    delete: () => {
      eq: (col: string, val: string) => Promise<{ error: unknown }>;
    };
  };
}

/**
 * Department Management Functions
 */
export async function getDepartmentsList(): Promise<Department[]> {
  const employees = await getEmployeesList();

  let depts: Department[] = [];
  try {
    const supabase = createAdminClient();
    const client = supabase as unknown as SupabaseDepartmentsClient;
    const { data, error } = await client
      .from("departments")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data && data.length > 0) {
      depts = data as Department[];
    }
  } catch {}

  if (depts.length === 0) {
    depts = readLocalDepartments();
  }

  // Calculate dynamic member count from employees
  return depts.map((d) => {
    const count = employees.filter((e) => {
      const empDept = e.department?.toLowerCase();
      const dCode = d.code?.toLowerCase();
      const dName = d.name?.toLowerCase();
      return (
        empDept === dCode ||
        empDept === d.id?.toLowerCase() ||
        (dCode === "super_admin" &&
          (empDept === "admin" || empDept === "super_admin")) ||
        (dCode === "crm_manager" &&
          (empDept === "seller_acquisition" || empDept === "crm_manager")) ||
        (dCode === "operation_manager" &&
          (empDept === "operations" ||
            empDept === "catalog_operations" ||
            empDept === "operation_manager")) ||
        (dCode === "admin" && empDept === "admin") ||
        (dCode === "operations" && empDept === "operations") ||
        dName.includes(empDept)
      );
    }).length;

    return {
      ...d,
      member_count: Math.max(d.member_count ?? 0, count),
    };
  });
}

export async function getDepartmentById(id: string): Promise<Department | null> {
  const depts = await getDepartmentsList();
  return (
    depts.find((d) => d.id === id || d.code.toLowerCase() === id.toLowerCase()) || null
  );
}

export async function upsertDepartment(
  dept: Partial<Department> & { name: string; code: string }
): Promise<Department> {
  const now = new Date().toISOString();
  const id =
    dept.id ||
    `dept-${dept.code.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;

  const fullDept: Department = {
    id,
    name: dept.name.trim(),
    code: dept.code.toUpperCase().trim(),
    description: dept.description || "",
    head_employee_name: dept.head_employee_name || null,
    head_employee_id: dept.head_employee_id || null,
    default_role: dept.default_role || "Operation Manager",
    permissions: dept.permissions || [],
    member_count: dept.member_count ?? 0,
    status: dept.status || "active",
    created_at: dept.created_at || now,
    updated_at: now,
  };

  try {
    const supabase = createAdminClient();
    const client = supabase as unknown as SupabaseDepartmentsClient;
    const { error } = await client.from("departments").upsert(fullDept);
    if (!error) {
      return fullDept;
    }
  } catch {}

  const list = readLocalDepartments();
  const idx = list.findIndex((d) => d.id === fullDept.id || d.code === fullDept.code);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...fullDept, updated_at: now };
  } else {
    list.push(fullDept);
  }
  writeLocalDepartments(list);
  return fullDept;
}

export async function deleteDepartment(id: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const client = supabase as unknown as SupabaseDepartmentsClient;
    await client.from("departments").delete().eq("id", id);
  } catch {}

  const list = readLocalDepartments();
  const filtered = list.filter((d) => d.id !== id);
  writeLocalDepartments(filtered);
  return true;
}
