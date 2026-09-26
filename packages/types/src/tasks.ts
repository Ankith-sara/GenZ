import { EmployeeDepartment } from "./employees";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskStatus = "todo" | "in_progress" | "in_review" | "done" | "cancelled";

export type TaskEntityType =
  | "crm_contact"
  | "crm_lead"
  | "crm_deal"
  | "seller_onboarding"
  | "seller_application"
  | "product"
  | "order"
  | "tech_feature"
  | "general";

export type InternalTask = {
  id: string;
  title: string;
  description?: string | null;
  department: EmployeeDepartment;
  assigned_to?: string | null;
  created_by?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null;
  related_entity_type?: TaskEntityType | null;
  related_entity_id?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields for UI convenience
  assignee_name?: string | null;
  creator_name?: string | null;
};
