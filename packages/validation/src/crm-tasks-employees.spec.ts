import { describe, it, expect } from "vitest";
import {
  createContactSchema,
  createLeadSchema,
  createDealSchema,
  createTaskSchema,
  createEmployeeSchema,
} from "./index";

describe("CRM, Tasks & Employee Validation Schemas", () => {
  it("validates contact creation input correctly", () => {
    const validContact = {
      name: "Polumuri Nageswara Rao",
      phone: "+91 94401 23456",
      craftCategory: "Kondapalli Toys",
      clusterName: "Kondapalli Craft Village",
    };
    expect(createContactSchema.safeParse(validContact).success).toBe(true);

    const invalidContact = {
      name: "",
      phone: "",
    };
    expect(createContactSchema.safeParse(invalidContact).success).toBe(false);
  });

  it("validates lead and deal creation inputs correctly", () => {
    const validLead = {
      artisanOrBusinessName: "Sri Venkateswara Toys",
      contactPerson: "Nageswara Rao",
      phone: "+91 94401 23456",
      craftCategory: "Kondapalli Toys",
      monthlyCapacityUnits: 1000,
    };
    expect(createLeadSchema.safeParse(validLead).success).toBe(true);

    const validDeal = {
      leadId: "123e4567-e89b-12d3-a456-426614174000",
      dealName: "Master Artisan Deal",
      expectedSkuCount: 15,
      commissionRatePercent: 12.5,
    };
    expect(createDealSchema.safeParse(validDeal).success).toBe(true);
  });

  it("validates task creation and department assignment", () => {
    const validTask = {
      title: "Develop artisan commission payout ledger",
      department: "tech",
      priority: "high",
    };
    expect(createTaskSchema.safeParse(validTask).success).toBe(true);

    const invalidTask = {
      title: "ab", // Min length 3
    };
    expect(createTaskSchema.safeParse(invalidTask).success).toBe(false);
  });

  it("validates employee registration and permissions", () => {
    const validEmp = {
      employeeCode: "GZ-OPS-042",
      fullName: "Kavita Reddy",
      email: "kavita.reddy@genz.in",
      department: "seller_acquisition",
      designation: "Cluster Onboarding Officer",
    };
    expect(createEmployeeSchema.safeParse(validEmp).success).toBe(true);

    const invalidEmp = {
      employeeCode: "GZ",
      fullName: "",
      email: "not-an-email",
      department: "invalid_dept",
    };
    expect(createEmployeeSchema.safeParse(invalidEmp).success).toBe(false);
  });
});
