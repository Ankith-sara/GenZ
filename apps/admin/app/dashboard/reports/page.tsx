import { requireRole } from "@/features/auth/lib/require-role";
import { getOrders } from "@genz/database/orders";
import { getTasksList } from "@genz/database/tasks";
import {
  getContactsList,
  getLeadsList,
  getDealsList,
  getSellerOnboardingList,
} from "@genz/database/crm";
import { getEmployeesList, getDepartmentsList } from "@genz/database/employees";
import { getRolesList } from "@genz/database/roles";
import { createAdminClient } from "@genz/database/admin";
import type {
  OrderRecord,
  InternalTask,
  CRMContact,
  CRMLead,
  CRMDeal,
  SellerOnboardingTracker,
  Employee,
  Department,
  RoleDefinition,
} from "@genz/types";
import { ReportsViewClient } from "./reports-view-client";

export const metadata = {
  title: "Reports & Analytics | Admin",
  description: "Cross-modular reporting for Admin, Operations, and CRM platform workflows.",
};

interface ReportsPageProps {
  searchParams: Promise<{ module?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  await requireRole("admin");
  const resolvedParams = await searchParams;
  const initialModule = resolvedParams.module || "admin";

  let orders: OrderRecord[] = [];
  let tasks: InternalTask[] = [];
  let contacts: CRMContact[] = [];
  let leads: CRMLead[] = [];
  let deals: CRMDeal[] = [];
  let onboardings: SellerOnboardingTracker[] = [];
  let employees: Employee[] = [];
  let departments: Department[] = [];
  let roles: RoleDefinition[] = [];
  let productCount = 0;
  let pendingVerificationsCount = 0;

  try {
    orders = await getOrders();
  } catch {}

  try {
    tasks = await getTasksList();
  } catch {}

  try {
    [contacts, leads, deals, onboardings] = await Promise.all([
      getContactsList(),
      getLeadsList(),
      getDealsList(),
      getSellerOnboardingList(),
    ]);
  } catch {}

  try {
    [employees, departments, roles] = await Promise.all([
      getEmployeesList(),
      getDepartmentsList(),
      getRolesList(),
    ]);
  } catch {}

  try {
    const supabase = createAdminClient();
    const [pRes, vRes] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("seller_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    productCount = pRes.count ?? 0;
    pendingVerificationsCount = vRes.count ?? 0;
  } catch {}

  return (
    <ReportsViewClient
      initialModule={initialModule}
      data={{
        orders,
        tasks,
        contacts,
        leads,
        deals,
        onboardings,
        employees,
        departments,
        roles,
        productCount,
        pendingVerificationsCount,
      }}
    />
  );
}
