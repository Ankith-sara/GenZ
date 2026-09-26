export type CRMContactStatus = "new" | "contacted" | "qualified" | "disqualified";

export type CRMLeadStage =
  | "discovery"
  | "pitch_in_progress"
  | "catalog_audit"
  | "negotiating"
  | "converted"
  | "dropped";

export type CRMDealStage =
  | "proposal_sent"
  | "terms_negotiating"
  | "contract_signed"
  | "lost";

export type OnboardingStage =
  | "kyc_documents"
  | "catalog_ingestion"
  | "quality_packaging_check"
  | "credentials_sent"
  | "live_on_marketplace";

export type CRMContact = {
  id: string;
  name: string;
  business_name?: string | null;
  phone: string;
  email?: string | null;
  craft_category?: string | null;
  city?: string | null;
  state?: string | null;
  cluster_name?: string | null;
  source?: string | null;
  status: CRMContactStatus;
  assigned_to?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  assignee_name?: string | null;
};

export type CRMLead = {
  id: string;
  contact_id?: string | null;
  artisan_or_business_name: string;
  contact_person: string;
  phone: string;
  email?: string | null;
  craft_category: string;
  cluster_name?: string | null;
  city?: string | null;
  state?: string | null;
  gi_certified?: boolean;
  monthly_capacity_units?: number;
  lead_score?: string;
  stage: CRMLeadStage;
  assigned_to?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  assignee_name?: string | null;
};

export type CRMDeal = {
  id: string;
  lead_id: string;
  deal_name: string;
  expected_sku_count: number;
  commission_rate_percent: number;
  target_onboarding_date?: string | null;
  estimated_annual_value_inr?: number;
  exclusive_contract?: boolean;
  stage: CRMDealStage;
  assigned_to?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  lead_name?: string | null;
  assignee_name?: string | null;
};

export type SellerOnboardingTracker = {
  id: string;
  deal_id?: string | null;
  seller_name: string;
  contact_person: string;
  email: string;
  phone: string;
  craft_category: string;
  city?: string | null;
  state?: string | null;
  current_stage: OnboardingStage;
  kyc_completed: boolean;
  catalog_completed: boolean;
  quality_check_completed: boolean;
  credentials_sent: boolean;
  live_on_marketplace: boolean;
  seller_profile_id?: string | null;
  assigned_ops_employee_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  assigned_ops_name?: string | null;
};

export type CRMActivityLog = {
  id: string;
  entity_type: "contact" | "lead" | "deal" | "onboarding";
  entity_id: string;
  employee_id?: string | null;
  activity_type: "call" | "visit" | "whatsapp" | "email" | "note" | "stage_change";
  summary: string;
  next_action_date?: string | null;
  created_at: string;
  employee_name?: string | null;
};
