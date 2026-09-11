import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  mockUserProfile,
  mockRecyclers,
  initialLots,
  initialTransactions
} from './mockData';

const env: Record<string, string | undefined> =
  (typeof import.meta !== 'undefined' && import.meta.env)
    ? (import.meta.env as unknown as Record<string, string | undefined>)
    : (typeof process !== 'undefined' && process.env ? process.env : {});

const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim();

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }
  // Check if still placeholder
  if (
    supabaseUrl.includes('your-project-id') ||
    supabaseUrl.includes('example.supabase.co') ||
    !supabaseUrl.startsWith('http') ||
    supabaseAnonKey.includes('your-anon-key')
  ) {
    return false;
  }
  return true;
}

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

/**
 * Execute a promise with a safety timeout so network hangs fail gracefully to fallback.
 */
export async function withTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMs: number = 3000,
  fallbackMsg: string = 'Supabase request timed out'
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(fallbackMsg));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result;
  } catch (err) {
    clearTimeout(timeoutHandle!);
    throw err;
  }
}
let isOfflineMode = false;
let lastOfflineCheck = 0;
const OFFLINE_COOLDOWN_MS = 30000;

export function markSupabaseOffline() {
  isOfflineMode = true;
  lastOfflineCheck = Date.now();
}

export function isSupabaseOffline(): boolean {
  if (!isOfflineMode) return false;
  if (Date.now() - lastOfflineCheck > OFFLINE_COOLDOWN_MS) {
    // Cooldown passed, allow a probe
    isOfflineMode = false;
    return false;
  }
  return true;
}

export function markSupabaseOnline() {
  isOfflineMode = false;
}

let isSeeding = false;
let hasSeeded = false;

/**
 * Seeds the Supabase database with the mock data if tables are empty.
 */
export async function seedSupabaseIfEmpty(): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured() || isSupabaseOffline() || isSeeding || hasSeeded) {
    return false;
  }

  isSeeding = true;
  try {
    // Check if lots table already has data
    const { data: existingLots, error: checkError } = await withTimeout(
      supabase.from('lots').select('id').limit(1),
      2500
    );

    if (checkError) {
      console.warn('[Supabase] Health check or table query failed:', checkError.message);
      markSupabaseOffline();
      isSeeding = false;
      return false;
    }

    markSupabaseOnline();

    if (existingLots && existingLots.length > 0) {
      hasSeeded = true;
      isSeeding = false;
      return false;
    }

    console.info('[Supabase] Initializing database seed with demo data...');

    // 1. Seed Collectors
    const collectorsData = [
      {
        id: mockUserProfile.id,
        name: mockUserProfile.name,
        phone: mockUserProfile.phone,
        location: mockUserProfile.location,
        tier_status: mockUserProfile.badge,
        verified: true
      },
      {
        id: 'usr_suresh_02',
        name: 'Suresh Kumar',
        phone: '+91 98765 23456',
        location: 'Secunderabad',
        tier_status: 'CPCB Registered Partner',
        verified: true
      },
      {
        id: 'usr_anil_03',
        name: 'Anil Rao',
        phone: '+91 98480 34567',
        location: 'Kukatpally, Hyderabad',
        tier_status: 'CPCB Registered Partner',
        verified: true
      },
      {
        id: 'usr_mohammed_04',
        name: 'Mohammed K.',
        phone: '+91 97000 45678',
        location: 'Charminar, Hyderabad',
        tier_status: 'CPCB Registered Partner',
        verified: true
      }
    ];

    await supabase.from('collectors').upsert(collectorsData);

    // 2. Seed Recyclers
    const recyclersData = mockRecyclers.map((r) => ({
      id: r.id,
      name: r.name,
      license_id: r.licenseNumber,
      location: r.address,
      offer_rates: {
        default: r.offerPerKg,
        PCB: r.id === 'rec_greencycle' ? 140 : r.id === 'rec_ecorecover' ? 135 : 128,
        Cable: r.id === 'rec_greencycle' ? 540 : 500,
        Battery: r.id === 'rec_greencycle' ? 105 : 98,
        LCD: r.id === 'rec_greencycle' ? 75 : 72,
        rating: r.rating,
        distanceKm: r.distanceKm,
        matchScore: r.matchScore,
        isAuthorized: r.isAuthorized,
        hasPickup: r.hasPickup,
        phone: r.phone,
        processingTime: r.processingTime,
        acceptedMaterials: r.acceptedMaterials
      }
    }));

    await supabase.from('recyclers').upsert(recyclersData);

    // 3. Seed Lots (KC-00123 through KC-00130, including KC-00125 through KC-00130)
    const lotsList = [
      {
        id: 'KC-00123',
        collector_id: 'usr_ramesh_01',
        recycler_id: 'rec_renewtech',
        material: 'LCD Screen',
        weight_kg: 19.5,
        status: 'completed',
        offered_price: 1360,
        verified_weight_kg: 19.5,
        final_payout: 1360,
        created_at: new Date('2026-02-14T11:00:00Z').toISOString(),
        completed_at: new Date('2026-02-14T12:45:00Z').toISOString(),
        material_id: 'mat_lcd',
        material_category: 'Display Electronics',
        market_rate_per_kg: 70,
        market_estimate: 1365,
        recycler_offer_per_kg: 70,
        bonus_amount: 0,
        qr_payload: 'KABADICONNECT:LOT:KC-00123:COMPLETED',
        verification_steps: {
          lotCreated: true,
          materialRecorded: true,
          weightRecorded: true,
          recyclerSelected: true,
          collectorVerified: true,
          recyclerApproved: true
        }
      },
      {
        id: 'KC-00124',
        collector_id: 'usr_ramesh_01',
        recycler_id: 'rec_greencycle',
        material: 'Battery',
        weight_kg: 12,
        status: 'completed',
        offered_price: 1140,
        verified_weight_kg: 12,
        final_payout: 1140,
        created_at: new Date('2026-02-21T09:00:00Z').toISOString(),
        completed_at: new Date('2026-02-21T10:30:00Z').toISOString(),
        material_id: 'mat_battery',
        material_category: 'Hazardous Energy Storage',
        market_rate_per_kg: 95,
        market_estimate: 1140,
        recycler_offer_per_kg: 95,
        bonus_amount: 0,
        qr_payload: 'KABADICONNECT:LOT:KC-00124:COMPLETED',
        verification_steps: {
          lotCreated: true,
          materialRecorded: true,
          weightRecorded: true,
          recyclerSelected: true,
          collectorVerified: true,
          recyclerApproved: true
        }
      },
      ...Object.values(initialLots).map((lot) => {
        let collectorId = 'usr_ramesh_01';
        if (lot.collectorName.includes('Suresh')) collectorId = 'usr_suresh_02';
        else if (lot.collectorName.includes('Anil')) collectorId = 'usr_anil_03';
        else if (lot.collectorName.includes('Mohammed')) collectorId = 'usr_mohammed_04';

        return {
          id: lot.id,
          collector_id: collectorId,
          recycler_id: lot.recyclerId || 'rec_greencycle',
          material: lot.materialName,
          weight_kg: lot.weightKg,
          status: lot.status,
          offered_price: lot.recyclerPayout,
          verified_weight_kg: lot.status === 'completed' ? lot.weightKg : null,
          final_payout: lot.status === 'completed' ? lot.recyclerPayout : null,
          created_at: new Date().toISOString(),
          completed_at: lot.completedAt ? new Date().toISOString() : null,
          material_id: lot.materialId,
          material_category: lot.materialCategory,
          market_rate_per_kg: lot.marketRatePerKg,
          market_estimate: lot.marketEstimate,
          recycler_offer_per_kg: lot.recyclerOfferPerKg,
          bonus_amount: lot.bonusAmount,
          qr_payload: lot.qrPayload,
          verification_steps: lot.verificationSteps
        };
      })
    ];

    await supabase.from('lots').upsert(lotsList);

    // 4. Seed Transactions
    const txsList = initialTransactions.map((tx) => ({
      id: tx.id,
      lot_id: tx.lotId,
      amount: tx.amount,
      status: tx.status,
      date: tx.date,
      material: tx.material,
      material_hi: tx.materialHi,
      weight_kg: tx.weightKg,
      recycler_name: tx.recyclerName
    }));

    await supabase.from('transactions').upsert(txsList);

    console.info('[Supabase] Seed completed successfully.');
    hasSeeded = true;
    return true;
  } catch (err) {
    console.warn('[Supabase] Auto-seeding encountered an error, using local fallback:', err);
    markSupabaseOffline();
    return false;
  } finally {
    isSeeding = false;
  }
}
