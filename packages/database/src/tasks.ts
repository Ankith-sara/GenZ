import type { InternalTask, TaskPriority, TaskStatus, EmployeeDepartment } from "@genz/types";
import { createAdminClient } from "./admin";
import fs from "fs";
import path from "path";

function getTasksStoragePath(): string {
  const isTest = process.env.NODE_ENV === "test" || process.env.VITEST;
  const fileName = isTest ? "test-tasks-store.json" : "tasks-store.json";
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

function readLocalTasks(): InternalTask[] {
  try {
    const filePath = getTasksStoragePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw) as InternalTask[];
    }
  } catch (err) {
    console.error("[TasksRepo] Local read fallback error:", err);
  }
  return [];
}

function writeLocalTasks(tasks: InternalTask[]) {
  try {
    const filePath = getTasksStoragePath();
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), "utf-8");
  } catch (err) {
    console.error("[TasksRepo] Local write fallback error:", err);
  }
}

export async function getTasksList(filters?: {
  department?: EmployeeDepartment;
  status?: TaskStatus;
  assignedTo?: string;
  priority?: TaskPriority;
}): Promise<InternalTask[]> {
  try {
    const supabase = createAdminClient();
    let query = supabase.from("internal_tasks").select("*").order("created_at", { ascending: false });

    if (filters?.department) query = query.eq("department", filters.department);
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.assignedTo) query = query.eq("assigned_to", filters.assignedTo);
    if (filters?.priority) query = query.eq("priority", filters.priority);

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as InternalTask[];
    }
  } catch (err) {}

  let list = readLocalTasks();

  if (filters?.department) list = list.filter((t) => t.department === filters.department);
  if (filters?.status) list = list.filter((t) => t.status === filters.status);
  if (filters?.assignedTo) list = list.filter((t) => t.assigned_to === filters.assignedTo);
  if (filters?.priority) list = list.filter((t) => t.priority === filters.priority);

  return list;
}

export async function createInternalTask(task: Omit<InternalTask, "id" | "created_at" | "updated_at">): Promise<InternalTask> {
  const now = new Date().toISOString();
  const newTask: InternalTask = {
    ...task,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = createAdminClient();
    await supabase.from("internal_tasks").insert(newTask);
  } catch (err) {}

  const list = readLocalTasks();
  list.unshift(newTask);
  writeLocalTasks(list);
  return newTask;
}

export async function updateInternalTaskStatus(taskId: string, status: TaskStatus): Promise<InternalTask | null> {
  const now = new Date().toISOString();
  try {
    const supabase = createAdminClient();
    await supabase.from("internal_tasks").update({ status, updated_at: now }).eq("id", taskId);
  } catch (err) {}

  const list = readLocalTasks();
  const idx = list.findIndex((t) => t.id === taskId);
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      status,
      completed_at: status === "done" ? now : null,
      updated_at: now,
    };
    writeLocalTasks(list);
    return list[idx];
  }
  return null;
}
