import { z } from "zod";

export const crmContactStatusSchema = z.enum(["new", "contacted", "qualified", "disqualified"]);

export const crmLeadStageSchema = z.enum([
  "discovery",
  "pitch_in_progress",
  "catalog_audit",
  "negotiating",
  "converted",
  "dropped",
]);

export const crmDealStageSchema = z.enum([
  "proposal_sent",
  "terms_negotiating",
  "contract_signed",
  "lost",
]);

export const onboardingStageSchema = z.enum([
  "kyc_documents",
  "catalog_ingestion",
  "quality_packaging_check",
  "credentials_sent",
  "live_on_marketplace",
]);

// 1. Contact Schemas
export const createContactSchema = z.object({
  name: z.string().min(2, "Contact name is required").max(150).trim(),
  businessName: z.string().max(200).optional().nullable(),
  phone: z.string().min(7, "Valid phone number is required").max(30).trim(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  craftCategory: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  clusterName: z.string().max(150).optional().nullable(),
  source: z.string().max(50).default("field_visit"),
  status: crmContactStatusSchema.default("new"),
  assignedTo: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// 2. Lead Schemas
export const createLeadSchema = z.object({
  contactId: z.string().uuid().optional().nullable(),
  artisanOrBusinessName: z.string().min(2).max(200).trim(),
  contactPerson: z.string().min(2).max(150).trim(),
  phone: z.string().min(7).max(30).trim(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  craftCategory: z.string().min(2).max(100).trim(),
  clusterName: z.string().max(150).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  giCertified: z.boolean().default(false),
  monthlyCapacityUnits: z.number().int().nonnegative().default(0),
  leadScore: z.string().default("tier_2_workshop"),
  stage: crmLeadStageSchema.default("discovery"),
  assignedTo: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateLeadStageSchema = z.object({
  leadId: z.string().uuid(),
  stage: crmLeadStageSchema,
});

// 3. Deal Schemas
export const createDealSchema = z.object({
  leadId: z.string().uuid(),
  dealName: z.string().min(2).max(200).trim(),
  expectedSkuCount: z.number().int().positive().default(10),
  commissionRatePercent: z.number().min(0).max(100).default(12.5),
  targetOnboardingDate: z.string().optional().nullable(),
  estimatedAnnualValueInr: z.number().nonnegative().default(0),
  exclusiveContract: z.boolean().default(false),
  stage: crmDealStageSchema.default("proposal_sent"),
  assignedTo: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateDealStageSchema = z.object({
  dealId: z.string().uuid(),
  stage: crmDealStageSchema,
});

// 4. Onboarding Tracker Schemas
export const updateOnboardingStageSchema = z.object({
  onboardingId: z.string().uuid(),
  stage: onboardingStageSchema,
  kycCompleted: z.boolean().optional(),
  catalogCompleted: z.boolean().optional(),
  qualityCheckCompleted: z.boolean().optional(),
  credentialsSent: z.boolean().optional(),
  liveOnMarketplace: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

// 5. Activity Log Schemas
export const createActivityLogSchema = z.object({
  entityType: z.enum(["contact", "lead", "deal", "onboarding"]),
  entityId: z.string().uuid(),
  activityType: z.enum(["call", "visit", "whatsapp", "email", "note", "stage_change"]),
  summary: z.string().min(1, "Activity summary is required").trim(),
  nextActionDate: z.string().optional().nullable(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateOnboardingStageInput = z.infer<typeof updateOnboardingStageSchema>;
export type CreateActivityLogInput = z.infer<typeof createActivityLogSchema>;
