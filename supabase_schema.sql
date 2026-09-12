-- ==============================================================================
-- KabadiConnect: Supabase (Postgres) Database Schema & Initial Seed
-- ==============================================================================

-- 1. Create Tables matching the existing data model

-- Collectors table
CREATE TABLE IF NOT EXISTS collectors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    tier_status TEXT DEFAULT 'CPCB Registered Partner',
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recyclers table
CREATE TABLE IF NOT EXISTS recyclers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    license_id TEXT NOT NULL,
    location TEXT NOT NULL,
    offer_rates JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Lots table
CREATE TABLE IF NOT EXISTS lots (
    id TEXT PRIMARY KEY,
    collector_id TEXT REFERENCES collectors(id) ON DELETE SET NULL,
    recycler_id TEXT REFERENCES recyclers(id) ON DELETE SET NULL,
    material TEXT NOT NULL,
    weight_kg NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'awaiting_handover',
    offered_price NUMERIC,
    verified_weight_kg NUMERIC,
    final_payout NUMERIC,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMPTZ,
    material_id TEXT,
    material_category TEXT,
    market_rate_per_kg NUMERIC,
    market_estimate NUMERIC,
    recycler_offer_per_kg NUMERIC,
    bonus_amount NUMERIC,
    qr_payload TEXT,
    verification_steps JSONB DEFAULT '{"lotCreated": true, "materialRecorded": true, "weightRecorded": true, "recyclerSelected": true, "collectorVerified": true, "recyclerApproved": false}'::jsonb
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    lot_id TEXT REFERENCES lots(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Completed',
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    material TEXT,
    material_hi TEXT,
    weight_kg NUMERIC,
    recycler_name TEXT
);

-- 2. Enable Row Level Security (RLS) and grant public anon permissions
ALTER TABLE collectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE recyclers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Collectors RLS Policies
DROP POLICY IF EXISTS "Public can view collectors" ON collectors;
CREATE POLICY "Public can view collectors" ON collectors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert collectors" ON collectors;
CREATE POLICY "Public can insert collectors" ON collectors FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update collectors" ON collectors;
CREATE POLICY "Public can update collectors" ON collectors FOR UPDATE USING (true);

-- Recyclers RLS Policies
DROP POLICY IF EXISTS "Public can view recyclers" ON recyclers;
CREATE POLICY "Public can view recyclers" ON recyclers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert recyclers" ON recyclers;
CREATE POLICY "Public can insert recyclers" ON recyclers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update recyclers" ON recyclers;
CREATE POLICY "Public can update recyclers" ON recyclers FOR UPDATE USING (true);

-- Lots RLS Policies
DROP POLICY IF EXISTS "Public can view lots" ON lots;
CREATE POLICY "Public can view lots" ON lots FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert lots" ON lots;
CREATE POLICY "Public can insert lots" ON lots FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update lots" ON lots;
CREATE POLICY "Public can update lots" ON lots FOR UPDATE USING (true);

-- Transactions RLS Policies
DROP POLICY IF EXISTS "Public can view transactions" ON transactions;
CREATE POLICY "Public can view transactions" ON transactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can insert transactions" ON transactions;
CREATE POLICY "Public can insert transactions" ON transactions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update transactions" ON transactions;
CREATE POLICY "Public can update transactions" ON transactions FOR UPDATE USING (true);

-- ==============================================================================
-- 3. Seed Database with Initial Mock Data
-- ==============================================================================

-- Seed Collectors (including primary demo collector "Ramesh")
INSERT INTO collectors (id, name, phone, location, tier_status, verified)
VALUES
  ('usr_ramesh_01', 'Ramesh', '+91 98490 12345', 'Hyderabad, Telangana', 'CPCB Registered Partner', true),
  ('usr_suresh_02', 'Suresh Kumar', '+91 98765 23456', 'Secunderabad', 'CPCB Registered Partner', true),
  ('usr_anil_03', 'Anil Rao', '+91 98480 34567', 'Kukatpally, Hyderabad', 'CPCB Registered Partner', true),
  ('usr_mohammed_04', 'Mohammed K.', '+91 97000 45678', 'Charminar, Hyderabad', 'CPCB Registered Partner', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  location = EXCLUDED.location,
  tier_status = EXCLUDED.tier_status,
  verified = EXCLUDED.verified;

-- Seed Recyclers (GreenCycle, EcoRecover, ReNewTech)
INSERT INTO recyclers (id, name, license_id, location, offer_rates)
VALUES
  (
    'rec_greencycle',
    'GreenCycle',
    'TSPCB/E-WASTE/HYD/2023-881',
    'Plot 42, IDA Cherlapally, Phase 2, Hyderabad',
    '{"PCB": 140, "Cable": 540, "Battery": 105, "LCD": 75, "rating": 4.9, "distanceKm": 4.2, "offerPerKg": 140, "matchScore": 94, "isAuthorized": true, "hasPickup": true, "phone": "+91 40 2712 8899", "processingTime": "2 hours door pickup", "acceptedMaterials": ["PCB", "Cable", "Battery", "LCD"]}'::jsonb
  ),
  (
    'rec_ecorecover',
    'EcoRecover',
    'TSPCB/E-WASTE/HYD/2022-419',
    'Industrial Area, Jeedimetla, Hyderabad',
    '{"PCB": 135, "Cable": 500, "Battery": 98, "rating": 4.7, "distanceKm": 7.8, "offerPerKg": 135, "matchScore": 87, "isAuthorized": true, "hasPickup": true, "phone": "+91 40 2319 4411", "processingTime": "Same day pickup", "acceptedMaterials": ["PCB", "Cable", "Battery"]}'::jsonb
  ),
  (
    'rec_renewtech',
    'ReNewTech',
    'TSPCB/E-WASTE/HYD/2021-105',
    'Near Balanagar Circle, Hyderabad',
    '{"PCB": 128, "LCD": 72, "rating": 4.4, "distanceKm": 11.2, "offerPerKg": 128, "matchScore": 76, "isAuthorized": true, "hasPickup": false, "phone": "+91 40 2377 1200", "processingTime": "Facility Drop-off only", "acceptedMaterials": ["PCB", "LCD"]}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  license_id = EXCLUDED.license_id,
  location = EXCLUDED.location,
  offer_rates = EXCLUDED.offer_rates;

-- Seed Lots (KC-00123 through KC-00130, covering KC-00125 through KC-00130)
INSERT INTO lots (id, collector_id, recycler_id, material, weight_kg, status, offered_price, verified_weight_kg, final_payout, created_at, completed_at, material_id, material_category, market_rate_per_kg, market_estimate, recycler_offer_per_kg, bonus_amount, qr_payload, verification_steps)
VALUES
  (
    'KC-00123',
    'usr_ramesh_01',
    'rec_renewtech',
    'LCD Screen',
    19.5,
    'completed',
    1360,
    19.5,
    1360,
    '2026-02-14 11:00:00+00',
    '2026-02-14 12:45:00+00',
    'mat_lcd',
    'Display Electronics',
    70,
    1365,
    70,
    0,
    'KABADICONNECT:LOT:KC-00123:COMPLETED',
    '{"lotCreated": true, "materialRecorded": true, "weightRecorded": true, "recyclerSelected": true, "collectorVerified": true, "recyclerApproved": true}'::jsonb
  ),
  (
    'KC-00124',
    'usr_ramesh_01',
    'rec_greencycle',
    'Battery',
    12,
    'completed',
    1140,
    12,
    1140,
    '2026-02-21 09:00:00+00',
    '2026-02-21 10:30:00+00',
    'mat_battery',
    'Hazardous Energy Storage',
    95,
    1140,
    95,
    0,
    'KABADICONNECT:LOT:KC-00124:COMPLETED',
    '{"lotCreated": true, "materialRecorded": true, "weightRecorded": true, "recyclerSelected": true, "collectorVerified": true, "recyclerApproved": true}'::jsonb
  ),
  (
    'KC-00125',
    'usr_ramesh_01',
    'rec_ecorecover',
    'Copper Cable',
    8,
    'completed',
    4000,
    8,
    4000,
    '2026-02-27 10:00:00+00',
    '2026-02-27 11:30:00+00',
    'mat_cable',
    'Non-Ferrous Wire',
    500,
    4000,
    500,
    0,
    'KABADICONNECT:LOT:KC-00125:COMPLETED',
    '{"lotCreated": true, "materialRecorded": true, "weightRecorded": true, "recyclerSelected": true, "collectorVerified": true, "recyclerApproved": true}'::jsonb
  ),
  (
    'KC-00126',
    'usr_ramesh_01',
    'rec_greencycle',
    'PCB',
    14,
    'completed',
    1950,
    14,
    1950,
    '2026-03-02 14:15:00+00',
    '2026-03-02 15:45:00+00',
    'mat_pcb',
    'Electronic Component',
    125,
    1750,
    139.28,
    200,
    'KABADICONNECT:LOT:KC-00126:COMPLETED',
    '{"lotCreated": true, "materialRecorded": true, "weightRecorded": true, "recyclerSelected": true, "collectorVerified": true, "recyclerApproved": true}'::jsonb
  ),
  (
    'KC-00127',
    'usr_ramesh_01',
    'rec_greencycle',
    'PCB',
    15,
    'awaiting_handover',
    2100,
    NULL,
    2100,
    '2026-03-04 10:30:00+00',
    NULL,
    'mat_pcb',
    'Electronic Component',
    125,
    1875,
    140,
    225,
    'KABADICONNECT:LOT:KC-00127:COLL:RAMESH:REC:GREENCYCLE:AMT:2100:MAT:PCB:WT:15KG:CPCB_AUTH',
    '{"lotCreated": true, "materialRecorded": true, "weightRecorded": true, "recyclerSelected": true, "collectorVerified": true, "recyclerApproved": false}'::jsonb
  ),
  (
    'KC-00128',
    'usr_suresh_02',
    'rec_greencycle',
    'Copper Cable',
    25,
    'awaiting_handover',
    13500,
    NULL,
    13500,
    '2026-03-05 11:15:00+00',
    NULL,
    'mat_cable',
    'Non-Ferrous Wire',
    520,
    13000,
    540,
    500,
    'KABADICONNECT:LOT:KC-00128:COLL:SURESH:REC:GREENCYCLE:AMT:13500:MAT:CABLE:WT:25KG:CPCB_AUTH',
    '{"lotCreated": true, "materialRecorded": true, "weightRecorded": true, "recyclerSelected": true, "collectorVerified": true, "recyclerApproved": false}'::jsonb
  ),
  (
    'KC-00129',
    'usr_anil_03',
    'rec_greencycle',
    'Lithium Battery',
    30,
    'awaiting_handover',
    3150,
    NULL,
    3150,
    '2026-03-05 14:40:00+00',
    NULL,
    'mat_battery',
    'Hazardous Energy Storage',
    95,
    2850,
    105,
    300,
    'KABADICONNECT:LOT:KC-00129:COLL:ANIL:REC:GREENCYCLE:AMT:3150:MAT:BATTERY:WT:30KG:CPCB_AUTH',
    '{"lotCreated": true, "materialRecorded": true, "weightRecorded": true, "recyclerSelected": true, "collectorVerified": true, "recyclerApproved": false}'::jsonb
  ),
  (
    'KC-00130',
    'usr_mohammed_04',
    'rec_greencycle',
    'LCD Display Units',
    40,
    'completed',
    3000,
    40,
    3000,
    '2026-03-01 09:30:00+00',
    '2026-03-01 11:00:00+00',
    'mat_lcd',
    'Display Electronics',
    70,
    2800,
    75,
    200,
    'KABADICONNECT:LOT:KC-00130:COMPLETED',
    '{"lotCreated": true, "materialRecorded": true, "weightRecorded": true, "recyclerSelected": true, "collectorVerified": true, "recyclerApproved": true}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  collector_id = EXCLUDED.collector_id,
  recycler_id = EXCLUDED.recycler_id,
  material = EXCLUDED.material,
  weight_kg = EXCLUDED.weight_kg,
  status = EXCLUDED.status,
  offered_price = EXCLUDED.offered_price,
  verified_weight_kg = EXCLUDED.verified_weight_kg,
  final_payout = EXCLUDED.final_payout,
  completed_at = EXCLUDED.completed_at,
  verification_steps = EXCLUDED.verification_steps;

-- Seed Transactions
INSERT INTO transactions (id, lot_id, amount, status, date, material, material_hi, weight_kg, recycler_name)
VALUES
  ('tx_001', 'KC-00126', 1950, 'Completed', '2026-03-02', 'PCB', 'पीसीबी (सर्किट बोर्ड)', 14, 'GreenCycle'),
  ('tx_002', 'KC-00125', 4000, 'Completed', '2026-02-27', 'Copper Cable', 'कॉपर केबल', 8, 'EcoRecover'),
  ('tx_003', 'KC-00124', 1140, 'Completed', '2026-02-21', 'Battery', 'बैटरी', 12, 'GreenCycle'),
  ('tx_004', 'KC-00123', 1360, 'Completed', '2026-02-14', 'LCD Screen', 'एलसीडी स्क्रीन', 19.5, 'ReNewTech')
ON CONFLICT (id) DO UPDATE SET
  lot_id = EXCLUDED.lot_id,
  amount = EXCLUDED.amount,
  status = EXCLUDED.status,
  date = EXCLUDED.date,
  material = EXCLUDED.material,
  material_hi = EXCLUDED.material_hi,
  weight_kg = EXCLUDED.weight_kg,
  recycler_name = EXCLUDED.recycler_name;

-- ==============================================================================
-- 4. User Profiles & Role-Based Authentication (Phone + OTP)
-- ==============================================================================

-- Create Profiles table linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    email TEXT,
    phone TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'collector' CHECK (role IN ('collector', 'recycler', 'admin')),
    preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi', 'te', 'ta', 'kn', 'ml')),
    collector_id TEXT REFERENCES public.collectors(id) ON DELETE SET NULL,
    recycler_id TEXT REFERENCES public.recyclers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch current auth user role without circular RLS recursion
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql;

-- Profiles RLS Policies
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND (role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid()))
  );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Trigger function to automatically create profile on phone OTP signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_name TEXT;
    user_lang TEXT;
    matched_collector TEXT;
    matched_recycler TEXT;
    clean_phone TEXT;
BEGIN
    clean_phone := REPLACE(REPLACE(COALESCE(NEW.phone, ''), ' ', ''), '+', '');

    -- 1. Read metadata if passed in client options
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', NULL);
    user_name := COALESCE(NEW.raw_user_meta_data->>'name', NULL);
    user_lang := COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en');

    -- 2. Link predefined demo personas by test phone number (digits only match)
    IF clean_phone = '919849012345' THEN
        user_name := COALESCE(user_name, 'Ramesh');
        user_role := COALESCE(user_role, 'collector');
        matched_collector := 'usr_ramesh_01';
    ELSIF clean_phone = '914027128899' THEN
        user_name := COALESCE(user_name, 'GreenCycle Recycler');
        user_role := COALESCE(user_role, 'recycler');
        matched_recycler := 'rec_greencycle';
    ELSIF clean_phone = '919999900000' THEN
        user_name := COALESCE(user_name, 'CPCB Central Inspector');
        user_role := COALESCE(user_role, 'admin');
    ELSE
        user_role := COALESCE(user_role, 'collector');
        user_name := COALESCE(user_name, 'Collector ' || RIGHT(clean_phone, 4));
    END IF;

    -- 3. Upsert into public.profiles
    INSERT INTO public.profiles (
        id,
        phone,
        email,
        name,
        role,
        preferred_language,
        collector_id,
        recycler_id
    )
    VALUES (
        NEW.id,
        NEW.phone,
        NEW.email,
        user_name,
        user_role,
        user_lang,
        matched_collector,
        matched_recycler
    )
    ON CONFLICT (id) DO UPDATE SET
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        name = CASE WHEN public.profiles.name = '' THEN EXCLUDED.name ELSE public.profiles.name END,
        collector_id = COALESCE(public.profiles.collector_id, EXCLUDED.collector_id),
        recycler_id = COALESCE(public.profiles.recycler_id, EXCLUDED.recycler_id),
        updated_at = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 5. Hardened Row Level Security (RLS) Across ALL Tables
-- ==============================================================================

-- Helper functions to fetch role and linked IDs without recursive RLS checks
CREATE OR REPLACE FUNCTION public.get_auth_collector_id()
RETURNS TEXT STABLE SECURITY DEFINER AS $$
  SELECT collector_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION public.get_auth_recycler_id()
RETURNS TEXT STABLE SECURITY DEFINER AS $$
  SELECT recycler_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql;

-- ------------------------------------------------------------------------------
-- A. LOTS TABLE RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view lots" ON lots;
DROP POLICY IF EXISTS "Public can insert lots" ON lots;
DROP POLICY IF EXISTS "Public can update lots" ON lots;
DROP POLICY IF EXISTS "Recyclers can update lot status" ON lots;
DROP POLICY IF EXISTS "Collectors can create lots" ON lots;
DROP POLICY IF EXISTS "Role-based lot visibility" ON lots;
DROP POLICY IF EXISTS "Recyclers and admins can update lots" ON lots;
DROP POLICY IF EXISTS "Anon can view lots for demo" ON lots;

-- SELECT: Collectors see their lots, Recyclers see assigned or awaiting lots, Admins see all
CREATE POLICY "Role-based lot visibility"
  ON public.lots FOR SELECT
  TO authenticated
  USING (
    public.get_auth_role() = 'admin'
    OR (public.get_auth_role() = 'collector' AND (collector_id = public.get_auth_collector_id() OR collector_id IS NULL))
    OR (public.get_auth_role() = 'recycler' AND (recycler_id = public.get_auth_recycler_id() OR status = 'awaiting_handover'))
  );

-- Public anon read for demo fallback
CREATE POLICY "Anon can view lots for demo"
  ON public.lots FOR SELECT
  TO anon
  USING (true);

-- INSERT: Only Collectors & Admins can create new lots
CREATE POLICY "Collectors can create lots"
  ON public.lots FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_auth_role() IN ('collector', 'admin')
  );

-- UPDATE: Recyclers & Admins can accept/verify/complete; Collectors can only update their own unaccepted lots
CREATE POLICY "Recyclers and admins can update lots"
  ON public.lots FOR UPDATE
  TO authenticated
  USING (
    public.get_auth_role() IN ('recycler', 'admin')
    OR (
      public.get_auth_role() = 'collector'
      AND collector_id = public.get_auth_collector_id()
      AND status = 'awaiting_handover'
    )
  )
  WITH CHECK (
    public.get_auth_role() IN ('recycler', 'admin')
    OR (
      public.get_auth_role() = 'collector'
      AND collector_id = public.get_auth_collector_id()
      AND status = 'awaiting_handover'
    )
  );

-- ------------------------------------------------------------------------------
-- B. TRANSACTIONS TABLE RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view transactions" ON transactions;
DROP POLICY IF EXISTS "Public can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Public can update transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can view transactions" ON transactions;
DROP POLICY IF EXISTS "Recyclers and admins can create transactions" ON transactions;
DROP POLICY IF EXISTS "Only admins can update transactions" ON transactions;
DROP POLICY IF EXISTS "Anon can view transactions for demo" ON transactions;

-- SELECT: Authenticated users can view transaction history
CREATE POLICY "Authenticated users can view transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anon can view transactions for demo"
  ON public.transactions FOR SELECT
  TO anon
  USING (true);

-- INSERT: Only Recyclers and Admins can create completed payout transactions
CREATE POLICY "Recyclers and admins can create transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_auth_role() IN ('recycler', 'admin')
  );

-- UPDATE: Only Admins can modify transaction records
CREATE POLICY "Only admins can update transactions"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (public.get_auth_role() = 'admin')
  WITH CHECK (public.get_auth_role() = 'admin');

-- ------------------------------------------------------------------------------
-- C. COLLECTORS & RECYCLERS DIRECTORY RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.collectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recyclers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view collectors" ON collectors;
DROP POLICY IF EXISTS "Public can insert collectors" ON collectors;
DROP POLICY IF EXISTS "Public can update collectors" ON collectors;
DROP POLICY IF EXISTS "Anyone can view collectors" ON collectors;
DROP POLICY IF EXISTS "Collectors can update own info" ON collectors;

DROP POLICY IF EXISTS "Public can view recyclers" ON recyclers;
DROP POLICY IF EXISTS "Public can insert recyclers" ON recyclers;
DROP POLICY IF EXISTS "Public can update recyclers" ON recyclers;
DROP POLICY IF EXISTS "Anyone can view recyclers" ON recyclers;
DROP POLICY IF EXISTS "Recyclers can update own facility info" ON recyclers;
DROP POLICY IF EXISTS "Admins can insert recyclers" ON recyclers;

-- Directory lookups: Anyone can view registered partners
CREATE POLICY "Anyone can view collectors"
  ON public.collectors FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view recyclers"
  ON public.recyclers FOR SELECT
  USING (true);

-- Collectors can update only their own profile
CREATE POLICY "Collectors can update own info"
  ON public.collectors FOR UPDATE
  TO authenticated
  USING (
    id = public.get_auth_collector_id()
    OR public.get_auth_role() = 'admin'
  );

-- Recyclers can update only their own facility rates
CREATE POLICY "Recyclers can update own facility info"
  ON public.recyclers FOR UPDATE
  TO authenticated
  USING (
    id = public.get_auth_recycler_id()
    OR public.get_auth_role() = 'admin'
  );

-- Only Admins can register new formal recycling facilities
CREATE POLICY "Admins can insert recyclers"
  ON public.recyclers FOR INSERT
  TO authenticated
  WITH CHECK (public.get_auth_role() = 'admin');

