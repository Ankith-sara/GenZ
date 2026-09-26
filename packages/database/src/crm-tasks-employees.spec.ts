import { describe, it, expect, afterAll } from "vitest";
import {
  getContactsList,
  createCRMContact,
  getLeadsList,
  createCRMLead,
  updateLeadStage,
  getDealsList,
  createCRMDeal,
  updateDealStage,
  getSellerOnboardingList,
  createSellerOnboarding,
  updateOnboardingStage,
} from "./crm";
import { getTasksList, createInternalTask, updateInternalTaskStatus } from "./tasks";
import { getEmployeesList, upsertEmployee } from "./employees";

describe("CRM & Sourcing Pipeline Repository", () => {
  it("creates contact and persists in list", async () => {
    const contact = await createCRMContact({
      name: "Raju Master Artisan",
      business_name: "Kondapalli Traditional Guild",
      phone: "+91 98480 12345",
      craft_category: "Kondapalli Toys",
      city: "Vijayawada",
      state: "Andhra Pradesh",
      source: "field_visit",
      status: "new",
    });

    expect(contact.id).toBeDefined();
    expect(contact.name).toBe("Raju Master Artisan");

    const list = await getContactsList();
    expect(list.some((c) => c.id === contact.id)).toBe(true);
  });

  it("creates lead and advances pipeline stage", async () => {
    const lead = await createCRMLead({
      artisan_or_business_name: "Etikoppaka Lacquer Workshop",
      contact_person: "Chinniah",
      phone: "+91 94400 54321",
      craft_category: "Etikoppaka Wooden Toys",
      gi_certified: true,
      monthly_capacity_units: 500,
      stage: "discovery",
    });

    expect(lead.stage).toBe("discovery");

    const updated = await updateLeadStage(lead.id, "catalog_audit");
    expect(updated?.stage).toBe("catalog_audit");
  });

  it("creates deal and moves to seller onboarding tracker", async () => {
    const deal = await createCRMDeal({
      lead_id: "00000000-0000-0000-0000-000000000001",
      deal_name: "Kondapalli Master Partnership",
      expected_sku_count: 20,
      commission_rate_percent: 12,
      stage: "proposal_sent",
    });

    expect(deal.id).toBeDefined();

    const onboarding = await createSellerOnboarding({
      deal_id: deal.id,
      seller_name: deal.deal_name,
      contact_person: "Raju",
      email: "raju@artisan.in",
      phone: "+91 98480 12345",
      craft_category: "Kondapalli Toys",
      current_stage: "kyc_documents",
      kyc_completed: false,
      catalog_completed: false,
      quality_check_completed: false,
      credentials_sent: false,
      live_on_marketplace: false,
    });

    expect(onboarding.current_stage).toBe("kyc_documents");

    const updatedOnboarding = await updateOnboardingStage(onboarding.id, {
      current_stage: "catalog_ingestion",
      kyc_completed: true,
    });

    expect(updatedOnboarding?.kyc_completed).toBe(true);
    expect(updatedOnboarding?.current_stage).toBe("catalog_ingestion");
  });
});

describe("Internal Task Management Repository", () => {
  it("creates task and updates status across Kanban columns", async () => {
    const task = await createInternalTask({
      title: "Build API integration for seller inventory sync",
      department: "tech",
      priority: "urgent",
      status: "todo",
    });

    expect(task.status).toBe("todo");

    const inProgress = await updateInternalTaskStatus(task.id, "in_progress");
    expect(inProgress?.status).toBe("in_progress");

    const completed = await updateInternalTaskStatus(task.id, "done");
    expect(completed?.status).toBe("done");
    expect(completed?.completed_at).toBeDefined();
  });
});

describe("Employee Management Repository", () => {
  it("registers employee with role template and retrieves from list", async () => {
    const emp = await upsertEmployee({
      employee_code: "GZ-TECH-099",
      full_name: "Pooja Hegde",
      email: "pooja.hegde@genz.in",
      department: "tech",
      role: "Operation Manager",
      designation: "Platform Operations Lead",
      role_level: "manager",
      permissions: ["orders:read", "products:read", "tasks:read", "tasks:write"],
    });

    expect(emp.employee_code).toBe("GZ-TECH-099");
    expect(emp.department).toBe("tech");
    expect(emp.role).toBe("Operation Manager");

    const list = await getEmployeesList();
    expect(list.some((e) => e.email === "pooja.hegde@genz.in")).toBe(true);
  });
});

describe("Department Governance & Role Templates", () => {
  it("retrieves standard department list with member counts", async () => {
    const { getDepartmentsList, upsertDepartment, deleteDepartment } = await import("./employees");
    const depts = await getDepartmentsList();
    expect(depts.length).toBeGreaterThanOrEqual(3);

    const techDept = depts.find((d) => d.code === "TECH");
    expect(techDept).toBeDefined();
    expect(techDept?.default_role).toBe("Super Admin");

    const opsDept = depts.find((d) => d.code === "OPERATIONS");
    expect(opsDept).toBeDefined();
    expect(opsDept?.default_role).toBe("Operation Manager");
  });

  it("retrieves, creates, and deletes role units via roles repository", async () => {
    const { getRolesList, upsertRole, deleteRole } = await import("./roles");
    const roles = await getRolesList();
    expect(roles.length).toBeGreaterThanOrEqual(3);

    const superAdminRole = roles.find((r) => r.code === "SUPER_ADMIN");
    expect(superAdminRole).toBeDefined();
    expect(superAdminRole?.permissions).toContain("crm:read");
    expect(superAdminRole?.permissions).toContain("orders:read");

    const opsRole = roles.find((r) => r.code === "OPERATION_MANAGER");
    expect(opsRole).toBeDefined();
    expect(opsRole?.permissions).toContain("orders:read");
    expect(opsRole?.permissions).toContain("products:read");

    const newRole = await upsertRole({
      name: "Field Quality Inspector",
      code: "QUALITY_INSPECTOR",
      description: "GI artisanal craft quality inspector",
      role_level: "staff",
      permissions: ["products:read", "verifications:read", "verifications:write"],
    });

    expect(newRole.id).toBeDefined();
    expect(newRole.code).toBe("QUALITY_INSPECTOR");

    const list = await getRolesList();
    expect(list.some((r) => r.code === "QUALITY_INSPECTOR")).toBe(true);

    const deleted = await deleteRole(newRole.id);
    expect(deleted).toBe(true);

    const afterDelete = await getRolesList();
    expect(afterDelete.some((r) => r.id === newRole.id)).toBe(false);
  });

  it("creates, updates, and deletes department unit", async () => {
    const { getDepartmentsList, upsertDepartment, deleteDepartment } = await import("./employees");
    const newDept = await upsertDepartment({
      name: "Handloom Craft Cluster Hub",
      code: "HANDLOOM_HUB",
      description: "Field center for GI handloom artisan onboarding",
      default_role: "CRM Manager",
      head_employee_name: "Arjun Verma",
      status: "active",
    });

    expect(newDept.id).toBeDefined();
    expect(newDept.code).toBe("HANDLOOM_HUB");

    const list = await getDepartmentsList();
    expect(list.some((d) => d.code === "HANDLOOM_HUB")).toBe(true);

    const deleted = await deleteDepartment(newDept.id);
    expect(deleted).toBe(true);

    const afterDelete = await getDepartmentsList();
    expect(afterDelete.some((d) => d.id === newDept.id)).toBe(false);
  });

  it("validates predefined roles have default permissions", async () => {
    const { PREDEFINED_ROLES } = await import("@genz/types");
    expect(PREDEFINED_ROLES.super_admin).toBeDefined();
    expect(PREDEFINED_ROLES.crm_manager).toBeDefined();
    expect(PREDEFINED_ROLES.operation_manager).toBeDefined();

    // Super Admin has all CRUD permissions
    expect(PREDEFINED_ROLES.super_admin.permissions).toContain("crm:read");
    expect(PREDEFINED_ROLES.super_admin.permissions).toContain("orders:read");
    expect(PREDEFINED_ROLES.super_admin.permissions).toContain("employees:delete");

    // CRM Manager has CRM and tasks permissions
    expect(PREDEFINED_ROLES.crm_manager.permissions).toContain("crm:read");
    expect(PREDEFINED_ROLES.crm_manager.permissions).toContain("crm:write");
    expect(PREDEFINED_ROLES.crm_manager.permissions).toContain("tasks:read");

    // Operation Manager has Orders, Products, and Tasks permissions
    expect(PREDEFINED_ROLES.operation_manager.permissions).toContain("orders:read");
    expect(PREDEFINED_ROLES.operation_manager.permissions).toContain("products:read");
    expect(PREDEFINED_ROLES.operation_manager.permissions).toContain("tasks:read");
  });

  afterAll(() => {
    const fs = require("fs");
    const path = require("path");
    const testFiles = [
      "test-crm-contacts-store.json",
      "test-crm-deals-store.json",
      "test-crm-leads-store.json",
      "test-crm-onboarding-store.json",
      "test-employees-store.json",
      "test-departments-store.json",
      "test-tasks-store.json",
    ];
    testFiles.forEach((file) => {
      const p = path.resolve(__dirname, "storage", file);
      if (fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
        } catch {}
      }
    });
  });
});
