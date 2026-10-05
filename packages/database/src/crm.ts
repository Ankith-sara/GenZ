import type {
  CRMContact,
  CRMLead,
  CRMDeal,
  SellerOnboardingTracker,
  CRMLeadStage,
  CRMDealStage,
  PlatformSellerCandidate,
} from "@genz/types";
import { createAdminClient } from "./admin";
import fs from "fs";
import path from "path";

function getCrmStoragePath(file: string): string {
  const isTest = process.env.NODE_ENV === "test" || process.env.VITEST;
  const fileName = isTest ? `test-${file}` : file;
  const primaryDir = path.resolve(process.cwd(), "packages/database/src/storage");
  if (fs.existsSync(primaryDir)) return path.join(primaryDir, fileName);
  const altDir = path.resolve(process.cwd(), "../../packages/database/src/storage");
  if (fs.existsSync(altDir)) return path.join(altDir, fileName);
  try {
    fs.mkdirSync(primaryDir, { recursive: true });
    return path.join(primaryDir, fileName);
  } catch {
    return path.resolve(process.cwd(), fileName);
  }
}

function readLocalJson<T>(fileName: string): T[] {
  try {
    const filePath = getCrmStoragePath(fileName);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T[];
    }
  } catch {}
  return [];
}

function writeLocalJson<T>(fileName: string, data: T[]) {
  try {
    const filePath = getCrmStoragePath(fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

// 0. PLATFORM SELLER SYNC HELPER
export type { PlatformSellerCandidate };

export async function getPlatformSellersFromDatabase(): Promise<
  PlatformSellerCandidate[]
> {
  try {
    const supabase = createAdminClient();

    const [appsRes, profilesRes, userProfilesRes, productsRes] = await Promise.all([
      supabase
        .from("seller_applications")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("seller_profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, phone"),
      supabase.from("products").select("seller_id"),
    ]);

    const apps = appsRes.data || [];
    const profiles = profilesRes.data || [];
    const userProfiles = userProfilesRes.data || [];
    const products = productsRes.data || [];

    const productCounts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.seller_id) {
        productCounts[p.seller_id] = (productCounts[p.seller_id] || 0) + 1;
      }
    });

    const userProfileMap = new Map<
      string,
      { full_name?: string | null; phone?: string | null }
    >();
    userProfiles.forEach((u) => {
      userProfileMap.set(u.id, u);
    });

    const results: PlatformSellerCandidate[] = [];
    const seenEmails = new Set<string>();
    const seenIds = new Set<string>();

    profiles.forEach((sp) => {
      const spObj = sp as unknown as Record<string, unknown>;
      const matchedApp = apps.find(
        (a) =>
          a.id === sp.id ||
          (a.email &&
            spObj.email &&
            a.email.toLowerCase() === String(spObj.email).toLowerCase()) ||
          (a.business_name &&
            sp.business_name &&
            a.business_name.toLowerCase() === sp.business_name.toLowerCase())
      );
      const appFormData = (matchedApp?.form_data || {}) as Record<string, unknown>;
      const userProfile = userProfileMap.get(sp.id);
      const email = ((spObj.email as string) || matchedApp?.email || "")
        .toLowerCase()
        .trim();
      const phone =
        (spObj.phone as string) || matchedApp?.phone || userProfile?.phone || "";
      const name =
        matchedApp?.full_name ||
        userProfile?.full_name ||
        sp.business_name ||
        "Artisan Master";
      const businessName = sp.business_name || matchedApp?.business_name || name;
      const city = sp.city || (appFormData.city as string) || "Andhra Pradesh";
      const state = sp.state || (appFormData.state as string) || "Andhra Pradesh";

      const isEtikoppaka =
        city.toLowerCase().includes("etikoppaka") ||
        name.toLowerCase().includes("nageswara") ||
        businessName.toLowerCase().includes("etikoppaka");
      const isKondapalli =
        city.toLowerCase().includes("kondapall") ||
        businessName.toLowerCase().includes("kondapall") ||
        businessName.toLowerCase().includes("abburi");

      const craftCategory = isEtikoppaka
        ? "Etikoppaka Wooden Lacquerware"
        : isKondapalli
          ? "Kondapalli Traditional Toys"
          : (appFormData.craft_category as string) || "Traditional Craft & Handloom";

      const clusterName = isEtikoppaka
        ? "Etikoppaka Lacquer Craft Cluster"
        : isKondapalli
          ? "Kondapalli Toys Colony Cluster"
          : `${city} Artisan Cluster`;

      const pCount = productCounts[sp.id] || 0;

      if (email) seenEmails.add(email);
      seenIds.add(sp.id);

      results.push({
        seller_id: sp.id,
        name,
        business_name: businessName,
        email,
        phone,
        craft_category: craftCategory,
        city,
        state,
        cluster_name: clusterName,
        is_verified: sp.status === "verified" || matchedApp?.status === "approved",
        product_count: pCount,
        gi_certified: isEtikoppaka || isKondapalli || Boolean(appFormData.gi_certified),
        created_at: sp.created_at || matchedApp?.created_at || new Date().toISOString(),
      });
    });

    apps.forEach((a) => {
      const email = a.email?.toLowerCase().trim();
      if ((email && seenEmails.has(email)) || seenIds.has(a.id)) return;

      const formData = (a.form_data || {}) as Record<string, unknown>;
      const name =
        a.full_name || (formData.owner_name as string) || "Applicant Artisan";
      const businessName =
        a.business_name || (formData.business_name as string) || name;
      const city = (formData.city as string) || "Andhra Pradesh";
      const state = (formData.state as string) || "Andhra Pradesh";

      const isEtikoppaka =
        city.toLowerCase().includes("etikoppaka") ||
        name.toLowerCase().includes("nageswara") ||
        businessName.toLowerCase().includes("etikoppaka");
      const isKondapalli =
        city.toLowerCase().includes("kondapall") ||
        businessName.toLowerCase().includes("kondapall") ||
        businessName.toLowerCase().includes("abburi");

      const craftCategory = isEtikoppaka
        ? "Etikoppaka Wooden Lacquerware"
        : isKondapalli
          ? "Kondapalli Traditional Toys"
          : (formData.craft_category as string) || "Traditional Craft & Handloom";

      const clusterName = isEtikoppaka
        ? "Etikoppaka Lacquer Craft Cluster"
        : isKondapalli
          ? "Kondapalli Toys Colony Cluster"
          : `${city} Artisan Cluster`;

      if (email) seenEmails.add(email);
      seenIds.add(a.id);

      results.push({
        seller_id: a.id,
        name,
        business_name: businessName,
        email: a.email || "",
        phone: a.phone || "",
        craft_category: craftCategory,
        city,
        state,
        cluster_name: clusterName,
        is_verified: a.status === "approved",
        product_count: 0,
        gi_certified: isEtikoppaka || isKondapalli || Boolean(formData.gi_certified),
        created_at: a.created_at || new Date().toISOString(),
      });
    });

    return results;
  } catch (err) {
    console.error("Error fetching platform sellers from database:", err);
    return [];
  }
}

// 1. CONTACTS
export async function getContactsList(): Promise<CRMContact[]> {
  let list: CRMContact[] = [];
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("crm_contacts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) list = data as CRMContact[];
  } catch {}

  if (list.length === 0) {
    list = readLocalJson<CRMContact>("crm-contacts-store.json");
  }

  const platformSellers = await getPlatformSellersFromDatabase();
  const existingEmails = new Set(
    list.map((c) => c.email?.toLowerCase().trim()).filter(Boolean)
  );
  const existingNames = new Set(list.map((c) => c.name.toLowerCase().trim()));

  platformSellers.forEach((s) => {
    const email = s.email?.toLowerCase().trim();
    const name = s.name.toLowerCase().trim();
    if ((email && existingEmails.has(email)) || existingNames.has(name)) return;

    list.push({
      id: `contact-${s.seller_id}`,
      name: s.name,
      business_name: s.business_name,
      phone: s.phone || "+91 00000 00000",
      email: s.email || null,
      craft_category: s.craft_category,
      city: s.city,
      state: s.state,
      cluster_name: s.cluster_name,
      source: "platform_seller_db",
      status: s.is_verified ? "qualified" : "new",
      notes: `Platform seller from ${s.cluster_name}. Active marketplace inventory: ${s.product_count} SKUs.`,
      created_at: s.created_at,
      updated_at: s.created_at,
    });
  });

  return list;
}

export async function createCRMContact(
  contact: Omit<CRMContact, "id" | "created_at" | "updated_at">
): Promise<CRMContact> {
  const now = new Date().toISOString();
  const newContact: CRMContact = {
    ...contact,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  try {
    const supabase = createAdminClient();
    await supabase.from("crm_contacts").insert(newContact);
  } catch {}
  const list = readLocalJson<CRMContact>("crm-contacts-store.json");
  list.unshift(newContact);
  writeLocalJson("crm-contacts-store.json", list);
  return newContact;
}

export async function updateCRMContact(
  contactId: string,
  updates: Partial<CRMContact>
): Promise<CRMContact | null> {
  const now = new Date().toISOString();
  try {
    const supabase = createAdminClient();
    await supabase
      .from("crm_contacts")
      .update({ ...updates, updated_at: now })
      .eq("id", contactId);
  } catch {}
  const list = readLocalJson<CRMContact>("crm-contacts-store.json");
  const idx = list.findIndex((c) => c.id === contactId);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates, updated_at: now };
    writeLocalJson("crm-contacts-store.json", list);
    return list[idx];
  }
  return null;
}

// 2. LEADS
export async function getLeadsList(): Promise<CRMLead[]> {
  let list: CRMLead[] = [];
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("crm_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) list = data as CRMLead[];
  } catch {}

  if (list.length === 0) {
    list = readLocalJson<CRMLead>("crm-leads-store.json");
  }

  const platformSellers = await getPlatformSellersFromDatabase();
  const existingEmails = new Set(
    list.map((l) => l.email?.toLowerCase().trim()).filter(Boolean)
  );
  const existingNames = new Set(list.map((l) => l.contact_person.toLowerCase().trim()));

  platformSellers.forEach((s) => {
    const email = s.email?.toLowerCase().trim();
    const name = s.name.toLowerCase().trim();
    if ((email && existingEmails.has(email)) || existingNames.has(name)) return;

    list.push({
      id: `lead-${s.seller_id}`,
      contact_id: `contact-${s.seller_id}`,
      artisan_or_business_name: s.business_name,
      contact_person: s.name,
      phone: s.phone || "+91 00000 00000",
      email: s.email || null,
      craft_category: s.craft_category,
      cluster_name: s.cluster_name,
      city: s.city,
      state: s.state,
      gi_certified: s.gi_certified,
      monthly_capacity_units: s.product_count > 0 ? 500 : 150,
      lead_score: s.gi_certified ? "tier_1_master_artisan" : "tier_2_workshop",
      stage: s.is_verified ? "catalog_audit" : "discovery",
      notes: `Lead synced from seller database. Cluster: ${s.cluster_name}.`,
      created_at: s.created_at,
      updated_at: s.created_at,
    });
  });

  return list;
}

export async function createCRMLead(
  lead: Omit<CRMLead, "id" | "created_at" | "updated_at">
): Promise<CRMLead> {
  const now = new Date().toISOString();
  const newLead: CRMLead = {
    ...lead,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  try {
    const supabase = createAdminClient();
    await supabase.from("crm_leads").insert(newLead);
  } catch {}
  const list = readLocalJson<CRMLead>("crm-leads-store.json");
  list.unshift(newLead);
  writeLocalJson("crm-leads-store.json", list);
  return newLead;
}

export async function updateLeadStage(
  leadId: string,
  stage: CRMLeadStage
): Promise<CRMLead | null> {
  const now = new Date().toISOString();
  try {
    const supabase = createAdminClient();
    await supabase
      .from("crm_leads")
      .update({ stage, updated_at: now })
      .eq("id", leadId);
  } catch {}
  const list = readLocalJson<CRMLead>("crm-leads-store.json");
  const idx = list.findIndex((l) => l.id === leadId);
  if (idx >= 0) {
    list[idx] = { ...list[idx], stage, updated_at: now };
    writeLocalJson("crm-leads-store.json", list);
    return list[idx];
  }
  return null;
}

export async function updateCRMLead(
  leadId: string,
  updates: Partial<CRMLead>
): Promise<CRMLead | null> {
  const now = new Date().toISOString();
  try {
    const supabase = createAdminClient();
    await supabase
      .from("crm_leads")
      .update({ ...updates, updated_at: now })
      .eq("id", leadId);
  } catch {}
  const list = readLocalJson<CRMLead>("crm-leads-store.json");
  const idx = list.findIndex((l) => l.id === leadId);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates, updated_at: now };
    writeLocalJson("crm-leads-store.json", list);
    return list[idx];
  }
  return null;
}

// 3. DEALS
export async function getDealsList(): Promise<CRMDeal[]> {
  let list: CRMDeal[] = [];
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("crm_deals")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) list = data as CRMDeal[];
  } catch {}

  if (list.length === 0) {
    list = readLocalJson<CRMDeal>("crm-deals-store.json");
  }

  const platformSellers = await getPlatformSellersFromDatabase();
  const existingLeadIds = new Set(list.map((d) => d.lead_id));
  const existingNames = new Set(list.map((d) => d.deal_name.toLowerCase().trim()));

  platformSellers.forEach((s) => {
    if (!s.is_verified) return;
    const dealName = `${s.business_name} Master Partnership`;
    if (
      existingLeadIds.has(`lead-${s.seller_id}`) ||
      existingNames.has(dealName.toLowerCase().trim())
    )
      return;

    list.push({
      id: `deal-${s.seller_id}`,
      lead_id: `lead-${s.seller_id}`,
      deal_name: dealName,
      expected_sku_count: Math.max(s.product_count, 10),
      commission_rate_percent: 10,
      target_onboarding_date: "2026-10-15",
      estimated_annual_value_inr: s.product_count > 0 ? 1250000 : 500000,
      exclusive_contract: s.gi_certified,
      stage: "contract_signed",
      notes: `Official partnership agreement for GI-certified ${s.craft_category}.`,
      created_at: s.created_at,
      updated_at: s.created_at,
    });
  });

  return list;
}

export async function createCRMDeal(
  deal: Omit<CRMDeal, "id" | "created_at" | "updated_at">
): Promise<CRMDeal> {
  const now = new Date().toISOString();
  const newDeal: CRMDeal = {
    ...deal,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  try {
    const supabase = createAdminClient();
    await supabase.from("crm_deals").insert(newDeal);
  } catch {}
  const list = readLocalJson<CRMDeal>("crm-deals-store.json");
  list.unshift(newDeal);
  writeLocalJson("crm-deals-store.json", list);
  return newDeal;
}

export async function updateDealStage(
  dealId: string,
  stage: CRMDealStage
): Promise<CRMDeal | null> {
  const now = new Date().toISOString();
  try {
    const supabase = createAdminClient();
    await supabase
      .from("crm_deals")
      .update({ stage, updated_at: now })
      .eq("id", dealId);
  } catch {}
  const list = readLocalJson<CRMDeal>("crm-deals-store.json");
  const idx = list.findIndex((d) => d.id === dealId);
  if (idx >= 0) {
    list[idx] = { ...list[idx], stage, updated_at: now };
    writeLocalJson("crm-deals-store.json", list);
    return list[idx];
  }
  return null;
}

export async function updateCRMDeal(
  dealId: string,
  updates: Partial<CRMDeal>
): Promise<CRMDeal | null> {
  const now = new Date().toISOString();
  try {
    const supabase = createAdminClient();
    await supabase
      .from("crm_deals")
      .update({ ...updates, updated_at: now })
      .eq("id", dealId);
  } catch {}
  const list = readLocalJson<CRMDeal>("crm-deals-store.json");
  const idx = list.findIndex((d) => d.id === dealId);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates, updated_at: now };
    writeLocalJson("crm-deals-store.json", list);
    return list[idx];
  }
  return null;
}

// 4. SELLER ONBOARDING TRACKER
export async function getSellerOnboardingList(): Promise<SellerOnboardingTracker[]> {
  let list: SellerOnboardingTracker[] = [];
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("seller_onboarding_tracker")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) list = data as SellerOnboardingTracker[];
  } catch {}

  if (list.length === 0) {
    list = readLocalJson<SellerOnboardingTracker>("crm-onboarding-store.json");
  }

  const platformSellers = await getPlatformSellersFromDatabase();
  const existingEmails = new Set(
    list.map((o) => o.email?.toLowerCase().trim()).filter(Boolean)
  );
  const existingNames = new Set(list.map((o) => o.seller_name.toLowerCase().trim()));

  platformSellers.forEach((s) => {
    const email = s.email?.toLowerCase().trim();
    const name = s.business_name.toLowerCase().trim();
    if ((email && existingEmails.has(email)) || existingNames.has(name)) return;

    list.push({
      id: `onboarding-${s.seller_id}`,
      deal_id: `deal-${s.seller_id}`,
      seller_name: s.business_name,
      contact_person: s.name,
      email: s.email || "seller@genz.in",
      phone: s.phone || "+91 00000 00000",
      craft_category: s.craft_category,
      city: s.city,
      state: s.state,
      current_stage:
        s.product_count > 0
          ? "live_on_marketplace"
          : s.is_verified
            ? "catalog_ingestion"
            : "kyc_documents",
      kyc_completed: s.is_verified,
      catalog_completed: s.product_count > 0,
      quality_check_completed: s.product_count > 0,
      credentials_sent: s.is_verified,
      live_on_marketplace: s.product_count > 0,
      notes: `Artisan onboarded from seller DB. Active catalog: ${s.product_count} verified product SKUs.`,
      created_at: s.created_at,
      updated_at: s.created_at,
    });
  });

  return list;
}

export async function createSellerOnboarding(
  item: Omit<SellerOnboardingTracker, "id" | "created_at" | "updated_at">
): Promise<SellerOnboardingTracker> {
  const now = new Date().toISOString();
  const newItem: SellerOnboardingTracker = {
    ...item,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  try {
    const supabase = createAdminClient();
    await supabase.from("seller_onboarding_tracker").insert(newItem);
  } catch {}
  const list = readLocalJson<SellerOnboardingTracker>("crm-onboarding-store.json");
  list.unshift(newItem);
  writeLocalJson("crm-onboarding-store.json", list);
  return newItem;
}

export async function updateOnboardingStage(
  id: string,
  updates: Partial<SellerOnboardingTracker>
): Promise<SellerOnboardingTracker | null> {
  const now = new Date().toISOString();
  try {
    const supabase = createAdminClient();
    await supabase
      .from("seller_onboarding_tracker")
      .update({ ...updates, updated_at: now })
      .eq("id", id);
  } catch {}
  const list = readLocalJson<SellerOnboardingTracker>("crm-onboarding-store.json");
  const idx = list.findIndex((o) => o.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates, updated_at: now };
    writeLocalJson("crm-onboarding-store.json", list);
    return list[idx];
  }
  return null;
}
