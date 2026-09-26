import { requirePermission } from "@/features/auth/lib/require-role";
import { getOrders } from "@genz/database/orders";
import { getTasksList } from "@genz/database/tasks";
import { createAdminClient } from "@genz/database/admin";
import type { OrderRecord, InternalTask } from "@genz/types";
import { OperationsDashboardClient } from "./operations-dashboard-client";

export const metadata = {
  title: "Operations Module Dashboard | Admin",
  description: "Operational management of customer orders, products catalog, tasks, and verifications.",
};

export default async function OperationsMainPage() {
  await requirePermission("orders:read");

  let orders: OrderRecord[] = [];
  let tasks: InternalTask[] = [];
  let productCount = 0;
  let pendingVerificationsCount = 0;

  try {
    orders = await getOrders();
  } catch {}

  try {
    tasks = await getTasksList();
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
    <OperationsDashboardClient
      orders={orders}
      productCount={productCount}
      tasks={tasks}
      pendingVerificationsCount={pendingVerificationsCount}
    />
  );
}
