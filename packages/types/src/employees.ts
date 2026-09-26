export type EmployeeDepartment =
  | "admin"
  | "tech"
  | "seller_acquisition"
  | "catalog_operations"
  | "operations"
  | "support"
  | (string & {});

export type EmployeeStatus = "active" | "inactive" | "on_leave";

export type RoleLevel = "admin" | "manager" | "staff" | "emp";

export type PermissionKey =
  // CRM
  | "crm:read"
  | "crm:write"
  | "crm:delete"
  | "crm:admin"
  // Tasks
  | "tasks:read"
  | "tasks:write"
  | "tasks:delete"
  | "tasks:assign"
  // Employees / Team
  | "employees:read"
  | "employees:write"
  | "employees:delete"
  // Catalog / Products
  | "products:read"
  | "products:write"
  | "products:delete"
  // Orders & Shipments
  | "orders:read"
  | "orders:write"
  | "orders:delete"
  // Seller Verifications / KYC
  | "verifications:read"
  | "verifications:write"
  | "verifications:delete"
  // System Logs & Analytics
  | "system:read"
  | "system:write";

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  head_employee_name?: string | null;
  head_employee_id?: string | null;
  default_role?: string | null;
  member_count?: number;
  permissions?: PermissionKey[];
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface AdminModuleAction {
  key: PermissionKey;
  label: string;
  actionType: "read" | "write" | "delete" | "admin" | "assign";
}

export interface AdminModulePermissionConfig {
  id: string;
  name: string;
  description: string;
  actions: AdminModuleAction[];
}

export const ADMIN_MODULE_PERMISSIONS: AdminModulePermissionConfig[] = [
  {
    id: "products",
    name: "Products & Catalog",
    description: "GI artisan catalog, product curation, inventory items, and SKU publishing",
    actions: [
      { key: "products:read", label: "View / Read", actionType: "read" },
      { key: "products:write", label: "Create & Edit", actionType: "write" },
      { key: "products:delete", label: "Delete / Archive", actionType: "delete" },
    ],
  },
  {
    id: "orders",
    name: "Orders & Fulfillment",
    description: "Customer orders, courier dispatches, tracking updates, and delivery fulfillment",
    actions: [
      { key: "orders:read", label: "View / Read", actionType: "read" },
      { key: "orders:write", label: "Create & Update", actionType: "write" },
      { key: "orders:delete", label: "Cancel / Delete", actionType: "delete" },
    ],
  },
  {
    id: "tasks",
    name: "Internal Tasks",
    description: "Operational Kanban assignments, sprint tasks, and status workflow progression",
    actions: [
      { key: "tasks:read", label: "View / Read", actionType: "read" },
      { key: "tasks:write", label: "Create & Edit", actionType: "write" },
      { key: "tasks:delete", label: "Delete Task", actionType: "delete" },
      { key: "tasks:assign", label: "Assign to Team", actionType: "assign" },
    ],
  },
  {
    id: "crm",
    name: "CRM & Seller Acquisition",
    description: "Artisan pipeline, leads, master contacts, partnerships, and onboardings",
    actions: [
      { key: "crm:read", label: "View / Read", actionType: "read" },
      { key: "crm:write", label: "Create & Edit", actionType: "write" },
      { key: "crm:delete", label: "Delete Records", actionType: "delete" },
      { key: "crm:admin", label: "Full CRM Admin", actionType: "admin" },
    ],
  },
  {
    id: "employees",
    name: "Employees & Departments",
    description: "Internal team members, department units, role levels, and access administration",
    actions: [
      { key: "employees:read", label: "View / Read", actionType: "read" },
      { key: "employees:write", label: "Create & Edit", actionType: "write" },
      { key: "employees:delete", label: "Delete Records", actionType: "delete" },
    ],
  },
  {
    id: "verifications",
    name: "Seller KYC & Verifications",
    description: "Government artisan ID checks, GI craft certificates, and business document audits",
    actions: [
      { key: "verifications:read", label: "View / Read", actionType: "read" },
      { key: "verifications:write", label: "Approve / Reject", actionType: "write" },
      { key: "verifications:delete", label: "Revoke KYC", actionType: "delete" },
    ],
  },
  {
    id: "system",
    name: "Analytics & System",
    description: "Marketplace performance metrics, server activity, and system governance",
    actions: [
      { key: "system:read", label: "View Analytics", actionType: "read" },
      { key: "system:write", label: "System Config", actionType: "write" },
    ],
  },
];

export interface RoleDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
  role_level: RoleLevel;
  permissions: PermissionKey[];
  member_count?: number;
  is_system?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PredefinedRole {
  id: string;
  name: string;
  description: string;
  role_level: RoleLevel;
  permissions: PermissionKey[];
}

export const PREDEFINED_ROLES: Record<string, PredefinedRole> = {
  super_admin: {
    id: "super_admin",
    name: "Super Admin",
    description: "Full master access across all platform modules, configurations, and administrative actions",
    role_level: "admin",
    permissions: [
      "crm:read",
      "crm:write",
      "crm:delete",
      "crm:admin",
      "tasks:read",
      "tasks:write",
      "tasks:delete",
      "tasks:assign",
      "employees:read",
      "employees:write",
      "employees:delete",
      "products:read",
      "products:write",
      "products:delete",
      "orders:read",
      "orders:write",
      "orders:delete",
      "verifications:read",
      "verifications:write",
      "verifications:delete",
      "system:read",
      "system:write",
    ],
  },
  crm_manager: {
    id: "crm_manager",
    name: "CRM Manager",
    description: "Full management of Seller CRM, artisan onboarding, leads, pipeline deals, and assignable tasks",
    role_level: "manager",
    permissions: [
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
    ],
  },
  operation_manager: {
    id: "operation_manager",
    name: "Operation Manager",
    description: "Complete operational control over orders, catalog products, fulfillment logistics, and verification audits",
    role_level: "manager",
    permissions: [
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
    ],
  },
};

export type Employee = {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone?: string | null;
  department: EmployeeDepartment;
  designation: string;
  role?: string;
  role_id?: string;
  status: EmployeeStatus;
  role_level: RoleLevel;
  permissions: PermissionKey[];
  joined_at?: string;
  created_at: string;
  updated_at: string;
};
