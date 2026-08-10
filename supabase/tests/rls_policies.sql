-- ============================================================
-- Supabase RLS & Trigger Security Boundary Tests (pgTAP)
-- Execute with: supabase db test
-- ============================================================

BEGIN;
SELECT plan(12);

-- Ensure pgTAP extension is available
CREATE EXTENSION IF NOT EXISTS pgtap;

-- 1. Test Profiles Table Security & Trigger Protection
SELECT has_table('profiles', 'profiles table should exist');
SELECT tests.rls_enabled('profiles', 'RLS must be enabled on profiles table');
SELECT has_function('protect_profile_role', 'protect_profile_role trigger function must exist');
SELECT has_trigger('profiles', 'protect_profile_role_trigger', 'protect_profile_role_trigger must exist on profiles');

-- 2. Test Seller Profiles Table Security & Trigger Protection
SELECT has_table('seller_profiles', 'seller_profiles table should exist');
SELECT tests.rls_enabled('seller_profiles', 'RLS must be enabled on seller_profiles table');
SELECT has_function('protect_seller_verification_fields', 'protect_seller_verification_fields trigger function must exist');

-- 3. Test Products Table Security
SELECT has_table('products', 'products table should exist');
SELECT tests.rls_enabled('products', 'RLS must be enabled on products table');

-- 4. Test Seller Documents Security
SELECT has_table('seller_documents', 'seller_documents table should exist');
SELECT tests.rls_enabled('seller_documents', 'RLS must be enabled on seller_documents table');

-- 5. Test Helper Functions
SELECT has_function('is_admin', 'is_admin() helper function must exist');

SELECT * FROM finish();
ROLLBACK;
