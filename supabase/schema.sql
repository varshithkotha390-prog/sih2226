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
