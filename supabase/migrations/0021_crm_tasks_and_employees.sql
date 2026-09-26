-- Migration: 0021_crm_tasks_and_employees.sql
-- Purpose: Complete schema for CRM (Contacts -> Leads -> Deals -> Onboarding), Employee Management, and Tasks

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE employee_department AS ENUM (
        'admin',
        'tech',
        'seller_acquisition',
        'catalog_operations',
        'operations',
        'support'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE employee_status AS ENUM (
        'active',
        'inactive',
        'on_leave'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE crm_contact_status AS ENUM (
        'new',
        'contacted',
        'qualified',
        'disqualified'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE crm_lead_stage AS ENUM (
        'discovery',
        'pitch_in_progress',
        'catalog_audit',
        'negotiating',
        'converted',
        'dropped'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE crm_deal_stage AS ENUM (
        'proposal_sent',
        'terms_negotiating',
        'contract_signed',
        'lost'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE onboarding_stage AS ENUM (
        'kyc_documents',
        'catalog_ingestion',
        'quality_packaging_check',
        'credentials_sent',
        'live_on_marketplace'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM (
        'low',
        'medium',
        'high',
        'urgent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM (
        'todo',
        'in_progress',
        'in_review',
        'done',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    employee_code VARCHAR(30) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    department employee_department NOT NULL DEFAULT 'seller_acquisition',
    designation VARCHAR(100) NOT NULL DEFAULT 'Operations Associate',
    status employee_status NOT NULL DEFAULT 'active',
    role_level VARCHAR(30) NOT NULL DEFAULT 'staff',
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CRM CONTACTS TABLE
CREATE TABLE IF NOT EXISTS crm_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    business_name VARCHAR(200),
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    craft_category VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    cluster_name VARCHAR(150),
    source VARCHAR(50) DEFAULT 'field_visit',
    status crm_contact_status NOT NULL DEFAULT 'new',
    assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CRM LEADS TABLE
CREATE TABLE IF NOT EXISTS crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
    artisan_or_business_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    craft_category VARCHAR(100) NOT NULL,
    cluster_name VARCHAR(150),
    city VARCHAR(100),
    state VARCHAR(100),
    gi_certified BOOLEAN DEFAULT false,
    monthly_capacity_units INTEGER DEFAULT 0,
    lead_score VARCHAR(50) DEFAULT 'tier_2_workshop',
    stage crm_lead_stage NOT NULL DEFAULT 'discovery',
    assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CRM DEALS TABLE
CREATE TABLE IF NOT EXISTS crm_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
    deal_name VARCHAR(200) NOT NULL,
    expected_sku_count INTEGER DEFAULT 10,
    commission_rate_percent NUMERIC(5,2) DEFAULT 12.50,
    target_onboarding_date DATE,
    estimated_annual_value_inr NUMERIC(12,2) DEFAULT 0,
    exclusive_contract BOOLEAN DEFAULT false,
    stage crm_deal_stage NOT NULL DEFAULT 'proposal_sent',
    assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SELLER ONBOARDING TRACKER (Newly added sellers & progression)
CREATE TABLE IF NOT EXISTS seller_onboarding_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
    seller_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    craft_category VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    current_stage onboarding_stage NOT NULL DEFAULT 'kyc_documents',
    kyc_completed BOOLEAN DEFAULT false,
    catalog_completed BOOLEAN DEFAULT false,
    quality_check_completed BOOLEAN DEFAULT false,
    credentials_sent BOOLEAN DEFAULT false,
    live_on_marketplace BOOLEAN DEFAULT false,
    seller_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_ops_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INTERNAL TASKS TABLE (Tech, Operations, Onboarding)
CREATE TABLE IF NOT EXISTS internal_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(250) NOT NULL,
    description TEXT,
    department employee_department NOT NULL DEFAULT 'tech',
    assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    priority task_priority NOT NULL DEFAULT 'medium',
    status task_status NOT NULL DEFAULT 'todo',
    due_date TIMESTAMPTZ,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CRM ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS crm_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- 'contact', 'lead', 'deal', 'onboarding'
    entity_id UUID NOT NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'call', 'visit', 'whatsapp', 'email', 'note', 'stage_change'
    summary TEXT NOT NULL,
    next_action_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INDEXES
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_phone ON crm_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_status ON crm_contacts(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON crm_leads(stage);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_seller_onboarding_stage ON seller_onboarding_tracker(current_stage);
CREATE INDEX IF NOT EXISTS idx_internal_tasks_department ON internal_tasks(department);
CREATE INDEX IF NOT EXISTS idx_internal_tasks_assigned_to ON internal_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_internal_tasks_status ON internal_tasks(status);

-- 10. RLS POLICIES (Gated to Admin / Authenticated Internal Staff)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_onboarding_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins and internal staff policies
CREATE POLICY "Admins full access to employees"
    ON employees FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins full access to crm_contacts"
    ON crm_contacts FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins full access to crm_leads"
    ON crm_leads FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins full access to crm_deals"
    ON crm_deals FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins full access to seller_onboarding_tracker"
    ON seller_onboarding_tracker FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins full access to internal_tasks"
    ON internal_tasks FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins full access to crm_activity_logs"
    ON crm_activity_logs FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
