-- Migration: 0022_native_accounting_ledger.sql
-- Purpose: Native Double-Entry General Ledger, Commission Engine, Seller Settlement Batches, and Reconciliation Core

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE accounting_account_type AS ENUM (
        'asset',
        'liability',
        'equity',
        'revenue',
        'expense'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE journal_event_type AS ENUM (
        'order_paid',
        'order_delivered',
        'settlement_approved',
        'settlement_paid',
        'refund_processed',
        'gateway_clearing',
        'manual_adjustment'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE commission_status AS ENUM (
        'accrued',
        'invoiced',
        'settled',
        'reversed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE settlement_status AS ENUM (
        'draft',
        'pending_approval',
        'approved',
        'disbursed',
        'failed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reconciliation_status AS ENUM (
        'open',
        'resolved',
        'ignored'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. CHART OF ACCOUNTS (accounting_accounts)
CREATE TABLE IF NOT EXISTS public.accounting_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type public.accounting_account_type NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    balance NUMERIC NOT NULL DEFAULT 0,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Standard ECO Chart of Accounts
INSERT INTO public.accounting_accounts (code, name, type, description)
VALUES
    ('1010', 'Bank Main Account', 'asset', 'Primary operational bank account for merchant payouts and customer collections'),
    ('1020', 'Razorpay Gateway Clearing Account', 'asset', 'Payment gateway receivables pending bank settlement'),
    ('1030', 'Undisbursed Settlement Reserve Account', 'asset', 'Rolling reserve funds retained against return risk'),
    ('2010', 'Seller Payables Clearing Account', 'liability', 'Net accrued payables owed to artisans/sellers for fulfilled orders'),
    ('2020', 'Customer Advances Account', 'liability', 'Unfulfilled customer orders collected via payment gateway'),
    ('2030', 'Statutory GST-TCS Payable', 'liability', '1% Tax Collected at Source under Section 52 of CGST Act for GSTR-8'),
    ('2040', 'Section 194-O TDS Payable', 'liability', 'Income tax withheld at source for e-commerce operator filings'),
    ('2050', 'Output GST on Commission Payable', 'liability', '18% GST (CGST/SGST/IGST) collected on GenZ marketplace commission'),
    ('4010', 'Marketplace Commission Income', 'revenue', 'Net platform service fee earned by GenZonline'),
    ('4020', 'Platform & Listing Services Income', 'revenue', 'Ancillary seller promotion and catalogue enhancement fees'),
    ('5010', 'Payment Gateway Processing Charges', 'expense', 'MDR fee and service charges deducted by Razorpay')
ON CONFLICT (code) DO NOTHING;

-- 3. DOUBLE-ENTRY GENERAL LEDGER JOURNALS (accounting_journals & journal_lines)
CREATE TABLE IF NOT EXISTS public.accounting_journals (
    id TEXT PRIMARY KEY, -- JRN-######
    reference_id TEXT,   -- ORD-######, PAY-######, SET-######, etc.
    event_type public.journal_event_type NOT NULL,
    narration TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'posted' CHECK (status IN ('draft', 'posted', 'reversed')),
    total_amount NUMERIC NOT NULL DEFAULT 0,
    posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.accounting_journal_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id TEXT NOT NULL REFERENCES public.accounting_journals(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounting_accounts(id),
    account_code TEXT NOT NULL,
    debit NUMERIC NOT NULL DEFAULT 0 CHECK (debit >= 0),
    credit NUMERIC NOT NULL DEFAULT 0 CHECK (credit >= 0),
    narration TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journal_lines_journal_id ON public.accounting_journal_lines(journal_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account_code ON public.accounting_journal_lines(account_code);
CREATE INDEX IF NOT EXISTS idx_journals_ref_id ON public.accounting_journals(reference_id);

-- 4. SELLER COMMISSION RECORDS (seller_commissions)
CREATE TABLE IF NOT EXISTS public.seller_commissions (
    id TEXT PRIMARY KEY, -- COM-######
    order_id TEXT NOT NULL,
    order_item_id TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    seller_name TEXT,
    product_name TEXT,
    gross_value NUMERIC NOT NULL DEFAULT 0,
    commission_rate NUMERIC NOT NULL DEFAULT 10, -- 10%
    commission_amount NUMERIC NOT NULL DEFAULT 0,
    gst_rate NUMERIC NOT NULL DEFAULT 18,        -- 18%
    gst_amount NUMERIC NOT NULL DEFAULT 0,
    total_commission NUMERIC NOT NULL DEFAULT 0,
    status public.commission_status NOT NULL DEFAULT 'accrued',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    settled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_seller_commissions_seller ON public.seller_commissions(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_commissions_order ON public.seller_commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_seller_commissions_status ON public.seller_commissions(status);

-- 5. SELLER SETTLEMENT BATCHES & ITEMS
CREATE TABLE IF NOT EXISTS public.seller_settlement_batches (
    id TEXT PRIMARY KEY, -- SET-######
    batch_number TEXT NOT NULL UNIQUE,
    seller_id TEXT NOT NULL,
    seller_name TEXT NOT NULL,
    seller_bank_name TEXT,
    seller_account_number TEXT,
    seller_ifsc TEXT,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    item_count INT NOT NULL DEFAULT 0,
    gross_amount NUMERIC NOT NULL DEFAULT 0,
    total_commission NUMERIC NOT NULL DEFAULT 0,
    total_commission_gst NUMERIC NOT NULL DEFAULT 0,
    total_tcs NUMERIC NOT NULL DEFAULT 0,
    total_tds NUMERIC NOT NULL DEFAULT 0,
    other_adjustments NUMERIC NOT NULL DEFAULT 0,
    net_payable NUMERIC NOT NULL DEFAULT 0,
    status public.settlement_status NOT NULL DEFAULT 'draft',
    maker_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    checker_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    bank_utr TEXT,
    disbursed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.seller_settlement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id TEXT NOT NULL REFERENCES public.seller_settlement_batches(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL,
    order_item_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    gross_amount NUMERIC NOT NULL DEFAULT 0,
    commission_amount NUMERIC NOT NULL DEFAULT 0,
    commission_gst NUMERIC NOT NULL DEFAULT 0,
    tcs_amount NUMERIC NOT NULL DEFAULT 0,
    tds_amount NUMERIC NOT NULL DEFAULT 0,
    net_payout NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_settlement_batches_seller ON public.seller_settlement_batches(seller_id);
CREATE INDEX IF NOT EXISTS idx_settlement_batches_status ON public.seller_settlement_batches(status);
CREATE INDEX IF NOT EXISTS idx_settlement_items_batch ON public.seller_settlement_items(batch_id);

-- 6. RECONCILIATION EXCEPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.reconciliation_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'order', 'payment', 'settlement', 'journal', 'tax'
    entity_id TEXT NOT NULL,
    discrepancy_type TEXT NOT NULL,
    expected_amount NUMERIC NOT NULL DEFAULT 0,
    actual_amount NUMERIC NOT NULL DEFAULT 0,
    difference NUMERIC NOT NULL DEFAULT 0,
    status public.reconciliation_status NOT NULL DEFAULT 'open',
    severity TEXT NOT NULL DEFAULT 'medium',
    notes TEXT,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON public.reconciliation_exceptions(status);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.accounting_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_settlement_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_settlement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_exceptions ENABLE ROW LEVEL SECURITY;

-- Admins have full access to all accounting tables
DROP POLICY IF EXISTS "Admins full access on accounting_accounts" ON public.accounting_accounts;
CREATE POLICY "Admins full access on accounting_accounts" ON public.accounting_accounts
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access on accounting_journals" ON public.accounting_journals;
CREATE POLICY "Admins full access on accounting_journals" ON public.accounting_journals
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access on accounting_journal_lines" ON public.accounting_journal_lines;
CREATE POLICY "Admins full access on accounting_journal_lines" ON public.accounting_journal_lines
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access on seller_commissions" ON public.seller_commissions;
CREATE POLICY "Admins full access on seller_commissions" ON public.seller_commissions
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access on seller_settlement_batches" ON public.seller_settlement_batches;
CREATE POLICY "Admins full access on seller_settlement_batches" ON public.seller_settlement_batches
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access on seller_settlement_items" ON public.seller_settlement_items;
CREATE POLICY "Admins full access on seller_settlement_items" ON public.seller_settlement_items
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access on reconciliation_exceptions" ON public.reconciliation_exceptions;
CREATE POLICY "Admins full access on reconciliation_exceptions" ON public.reconciliation_exceptions
    FOR ALL USING (public.is_admin());

-- Sellers can view their own commissions and settlements
DROP POLICY IF EXISTS "Sellers view own commissions" ON public.seller_commissions;
CREATE POLICY "Sellers view own commissions" ON public.seller_commissions
    FOR SELECT USING (auth.uid()::text = seller_id);

DROP POLICY IF EXISTS "Sellers view own settlement batches" ON public.seller_settlement_batches;
CREATE POLICY "Sellers view own settlement batches" ON public.seller_settlement_batches
    FOR SELECT USING (auth.uid()::text = seller_id);

DROP POLICY IF EXISTS "Sellers view own settlement items" ON public.seller_settlement_items;
CREATE POLICY "Sellers view own settlement items" ON public.seller_settlement_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.seller_settlement_batches b
            WHERE b.id = batch_id AND b.seller_id = auth.uid()::text
        )
    );
