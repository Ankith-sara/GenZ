"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@genz/database/authorization";
import {
  getContactsList,
  createCRMContact,
  updateCRMContact,
  getLeadsList,
  createCRMLead,
  updateCRMLead,
  updateLeadStage,
  getDealsList,
  createCRMDeal,
  updateCRMDeal,
  updateDealStage,
  createSellerOnboarding,
  updateOnboardingStage,
} from "@genz/database/crm";
import type {
  CRMContact,
  CRMLead,
  CRMLeadStage,
  CRMDeal,
  CRMDealStage,
  SellerOnboardingTracker,
  OnboardingStage,
} from "@genz/types";

function revalidateCRMRoutes() {
  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard/crm/contacts");
  revalidatePath("/dashboard/crm/leads");
  revalidatePath("/dashboard/crm/deals");
  revalidatePath("/dashboard/crm/onboarding");
}

export async function createContactAction(formData: FormData) {
  await requireRole("admin");
  const name = (formData.get("name") as string)?.trim();
  const businessName = ((formData.get("business_name") as string) || (formData.get("businessName") as string))?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const craftCategory = ((formData.get("craft_category") as string) || (formData.get("craftCategory") as string))?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const state = (formData.get("state") as string)?.trim() || null;
  const clusterName = ((formData.get("cluster_name") as string) || (formData.get("clusterName") as string))?.trim() || null;
  const source = (formData.get("source") as string) || "field_visit";
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name || !phone) {
    return { error: "Name and Phone are required" };
  }

  const contact = await createCRMContact({
    name,
    business_name: businessName,
    phone,
    email,
    craft_category: craftCategory,
    city,
    state,
    cluster_name: clusterName,
    source,
    status: "new",
    notes,
  });

  revalidateCRMRoutes();
  return { success: true, contact };
}

export async function convertContactToLeadAction(contactId: string, craftCategory?: string) {
  await requireRole("admin");
  const contacts = await getContactsList();
  const contact = contacts.find((c) => c.id === contactId);
  if (!contact) {
    return { error: "Contact not found" };
  }

  const lead = await createCRMLead({
    contact_id: contact.id,
    artisan_or_business_name: contact.business_name || contact.name,
    contact_person: contact.name,
    phone: contact.phone,
    email: contact.email,
    craft_category: craftCategory || contact.craft_category || "Traditional Crafts",
    cluster_name: contact.cluster_name,
    city: contact.city,
    state: contact.state,
    gi_certified: false,
    monthly_capacity_units: 100,
    lead_score: "tier_2_workshop",
    stage: "discovery",
    assigned_to: contact.assigned_to,
    notes: `Converted from contact. Original notes: ${contact.notes || "None"}`,
  });

  revalidateCRMRoutes();
  return { success: true, lead };
}

export async function updateLeadStageAction(leadId: string, stage: CRMLeadStage) {
  await requireRole("admin");
  const lead = await updateLeadStage(leadId, stage);
  revalidateCRMRoutes();
  return { success: true, lead };
}

export async function convertLeadToDealAction(
  leadId: string,
  dealName: string,
  expectedSkuCount = 10,
  commissionRate = 12.5
) {
  await requireRole("admin");
  const leads = await getLeadsList();
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) {
    return { error: "Lead not found" };
  }

  const deal = await createCRMDeal({
    lead_id: lead.id,
    deal_name: dealName || `${lead.artisan_or_business_name} Seller Partnership`,
    expected_sku_count: expectedSkuCount,
    commission_rate_percent: commissionRate,
    target_onboarding_date: new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
    estimated_annual_value_inr: expectedSkuCount * 25000,
    exclusive_contract: false,
    stage: "proposal_sent",
    assigned_to: lead.assigned_to,
    notes: `Created from lead ${lead.artisan_or_business_name}. Category: ${lead.craft_category}`,
  });

  await updateLeadStage(leadId, "negotiating");

  revalidateCRMRoutes();
  return { success: true, deal };
}

export async function updateDealStageAction(dealId: string, stage: CRMDealStage) {
  await requireRole("admin");
  const deal = await updateDealStage(dealId, stage);
  revalidateCRMRoutes();
  return { success: true, deal };
}

export async function moveDealToOnboardingAction(dealId: string) {
  await requireRole("admin");
  const deals = await getDealsList();
  const deal = deals.find((d) => d.id === dealId);
  if (!deal) return { error: "Deal not found" };

  const leads = await getLeadsList();
  const lead = leads.find((l) => l.id === deal.lead_id);

  const onboarding = await createSellerOnboarding({
    deal_id: deal.id,
    seller_name: lead?.artisan_or_business_name || deal.deal_name,
    contact_person: lead?.contact_person || "Proprietor",
    email: lead?.email || "seller@genz.in",
    phone: lead?.phone || "+91 9999999999",
    craft_category: lead?.craft_category || "Handicrafts",
    city: lead?.city || null,
    state: lead?.state || null,
    current_stage: "kyc_documents",
    kyc_completed: false,
    catalog_completed: false,
    quality_check_completed: false,
    credentials_sent: false,
    live_on_marketplace: false,
    assigned_ops_employee_id: deal.assigned_to,
    notes: `Onboarding initiated from Deal "${deal.deal_name}"`,
  });

  await updateDealStage(dealId, "contract_signed");
  if (deal.lead_id) {
    await updateLeadStage(deal.lead_id, "converted");
  }

  revalidateCRMRoutes();
  return { success: true, onboarding };
}

export async function updateContactAction(
  contactId: string,
  updates: Partial<CRMContact>
) {
  await requireRole("admin");
  const contact = await updateCRMContact(contactId, updates);
  revalidateCRMRoutes();
  return { success: true, contact };
}

export async function createLeadAction(formData: FormData) {
  await requireRole("admin");
  const businessName = formData.get("businessName") as string;
  const contactPerson = formData.get("contactPerson") as string;
  const phone = formData.get("phone") as string;
  const email = (formData.get("email") as string) || null;
  const craftCategory = (formData.get("craftCategory") as string) || "Traditional Crafts";
  const city = (formData.get("city") as string) || null;
  const state = (formData.get("state") as string) || null;
  const clusterName = (formData.get("clusterName") as string) || null;
  const giCertified = formData.get("giCertified") === "true";
  const monthlyCapacityUnits = parseInt(formData.get("monthlyCapacityUnits") as string, 10) || 100;
  const leadScore = (formData.get("leadScore") as string) || "warm";
  const stage = (formData.get("stage") as CRMLeadStage) || "discovery";
  const notes = (formData.get("notes") as string) || null;

  if (!businessName || !contactPerson || !phone) {
    return { error: "Business name, contact person, and phone are required" };
  }

  const lead = await createCRMLead({
    artisan_or_business_name: businessName,
    contact_person: contactPerson,
    phone,
    email,
    craft_category: craftCategory,
    cluster_name: clusterName,
    city,
    state,
    gi_certified: giCertified,
    monthly_capacity_units: monthlyCapacityUnits,
    lead_score: leadScore,
    stage,
    notes,
  });

  revalidateCRMRoutes();
  return { success: true, lead };
}

export async function updateLeadAction(
  leadId: string,
  updates: Partial<CRMLead>
) {
  await requireRole("admin");
  const lead = await updateCRMLead(leadId, updates);
  revalidateCRMRoutes();
  return { success: true, lead };
}

export async function createDealAction(formData: FormData) {
  await requireRole("admin");
  const dealName = formData.get("dealName") as string;
  const leadId = (formData.get("leadId") as string) || null;
  const expectedSkuCount = parseInt(formData.get("expectedSkuCount") as string, 10) || 10;
  const commissionRate = parseFloat(formData.get("commissionRate") as string) || 12.5;
  const estimatedAnnualValue = parseInt(formData.get("estimatedAnnualValue") as string, 10) || expectedSkuCount * 25000;
  const targetDate = (formData.get("targetDate") as string) || new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0];
  const stage = (formData.get("stage") as CRMDealStage) || "proposal_sent";
  const notes = (formData.get("notes") as string) || null;

  if (!dealName) {
    return { error: "Deal name is required" };
  }

  const deal = await createCRMDeal({
    deal_name: dealName,
    lead_id: leadId || crypto.randomUUID(),
    expected_sku_count: expectedSkuCount,
    commission_rate_percent: commissionRate,
    target_onboarding_date: targetDate,
    estimated_annual_value_inr: estimatedAnnualValue,
    exclusive_contract: false,
    stage,
    notes,
  });

  revalidateCRMRoutes();
  return { success: true, deal };
}

export async function updateDealAction(
  dealId: string,
  updates: Partial<CRMDeal>
) {
  await requireRole("admin");
  const deal = await updateCRMDeal(dealId, updates);
  revalidateCRMRoutes();
  return { success: true, deal };
}

export async function updateOnboardingAction(
  id: string,
  updates: Partial<SellerOnboardingTracker>
) {
  await requireRole("admin");
  const updated = await updateOnboardingStage(id, updates);
  revalidateCRMRoutes();
  return { success: true, updated };
}

export async function updateOnboardingStageAction(
  id: string,
  stage: OnboardingStage,
  checkboxes?: Partial<SellerOnboardingTracker>
) {
  return updateOnboardingAction(id, { current_stage: stage, ...checkboxes });
}

