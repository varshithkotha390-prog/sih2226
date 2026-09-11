import {
  MaterialItem,
  Recycler,
  DigitalLot,
  Transaction,
  EarningsSummary,
  AIDetectionResult,
  LotStatus
} from '../types';
import {
  mockMaterials,
  mockRecyclers,
  initialTransactions,
  initialLots,
  mockUserProfile
} from './mockData';
import {
  supabase,
  isSupabaseConfigured,
  withTimeout,
  seedSupabaseIfEmpty,
  isSupabaseOffline,
  markSupabaseOffline,
  markSupabaseOnline
} from './supabaseClient';

const LOTS_STORAGE_KEY = 'kc_lots_store';
const TRANSACTIONS_STORAGE_KEY = 'kc_transactions_store';

// ==============================================================================
// Local Storage Cache & Fallback Helpers
// ==============================================================================

function getStoredLots(): Record<string, DigitalLot> {
  const stored = localStorage.getItem(LOTS_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      let updated = false;
      for (const [key, lot] of Object.entries(initialLots)) {
        if (!parsed[key]) {
          parsed[key] = lot;
          updated = true;
        }
      }
      if (updated) {
        localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return { ...initialLots };
    }
  }
  localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(initialLots));
  return { ...initialLots };
}

function saveStoredLots(lots: Record<string, DigitalLot>) {
  try {
    localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(lots));
  } catch (e) {
    console.warn('Could not save lots to localStorage:', e);
  }
}

function updateLocalLotCache(lot: DigitalLot) {
  const current = getStoredLots();
  current[lot.id] = lot;
  saveStoredLots(current);
}

function getStoredTransactions(): Transaction[] {
  const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
  if (stored) {
    try {
      const parsed: Transaction[] = JSON.parse(stored);
      const lots = getStoredLots();
      return parsed.filter((tx) => {
        if (tx.lotId === 'KC-00127' && lots['KC-00127']?.status !== 'completed') {
          return false;
        }
        return true;
      });
    } catch {
      return [...initialTransactions];
    }
  }
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(initialTransactions));
  return [...initialTransactions];
}

function saveStoredTransactions(transactions: Transaction[]) {
  try {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.warn('Could not save transactions to localStorage:', e);
  }
}

function getHindiMaterialName(name: string): string {
  if (!name) return 'ई-कचरा';
  if (name.includes('PCB')) return 'पीसीबी (सर्किट बोर्ड)';
  if (name.includes('Cable')) return 'कॉपर केबल';
  if (name.includes('Battery')) return 'बैटरी';
  if (name.includes('LCD')) return 'एलसीडी स्क्रीन';
  return name;
}

// ==============================================================================
// Supabase Row Data Mapper
// ==============================================================================

function mapLotRowToDigitalLot(row: any): DigitalLot {
  const collector = row.collectors || {};
  const recycler = row.recyclers || {};

  const materialName = row.material || 'PCB';
  const weightKg = Number(row.verified_weight_kg ?? row.weight_kg ?? 15);
  const recyclerOfferPerKg = Number(
    row.recycler_offer_per_kg ??
      (row.offered_price && row.weight_kg
        ? Math.round(row.offered_price / row.weight_kg)
        : 140)
  );
  const marketRatePerKg = Number(row.market_rate_per_kg ?? 125);
  const marketEstimate = Number(
    row.market_estimate ?? Math.round(weightKg * marketRatePerKg)
  );
  const recyclerPayout = Number(
    row.final_payout ?? row.offered_price ?? Math.round(weightKg * recyclerOfferPerKg)
  );
  const bonusAmount = Number(
    row.bonus_amount ?? Math.max(0, recyclerPayout - marketEstimate)
  );

  const verificationSteps = row.verification_steps || {
    lotCreated: true,
    materialRecorded: true,
    weightRecorded: row.verified_weight_kg != null,
    recyclerSelected: true,
    collectorVerified: true,
    recyclerApproved: row.status === 'completed'
  };

  let createdAtFormatted = '10:30 AM, Today';
  if (row.created_at) {
    try {
      const d = new Date(row.created_at);
      if (!isNaN(d.getTime())) {
        createdAtFormatted =
          d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
          ', ' +
          d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      }
    } catch {}
  }

  let completedAtFormatted: string | undefined = undefined;
  if (row.completed_at) {
    try {
      const d = new Date(row.completed_at);
      if (!isNaN(d.getTime())) {
        completedAtFormatted =
          d.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) +
          ' ' +
          d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch {}
  }

  return {
    id: row.id,
    collectorName:
      collector.name ||
      (row.collector_id === 'usr_suresh_02'
        ? 'Suresh Kumar'
        : row.collector_id === 'usr_anil_03'
        ? 'Anil Rao'
        : row.collector_id === 'usr_mohammed_04'
        ? 'Mohammed K.'
        : 'Ramesh'),
    collectorPhone:
      collector.phone ||
      (row.collector_id === 'usr_suresh_02'
        ? '+91 98765 23456'
        : row.collector_id === 'usr_anil_03'
        ? '+91 98480 34567'
        : row.collector_id === 'usr_mohammed_04'
        ? '+91 97000 45678'
        : '+91 98490 12345'),
    location:
      collector.location ||
      (row.collector_id === 'usr_suresh_02'
        ? 'Secunderabad'
        : row.collector_id === 'usr_anil_03'
        ? 'Kukatpally, Hyderabad'
        : row.collector_id === 'usr_mohammed_04'
        ? 'Charminar, Hyderabad'
        : 'Hyderabad'),
    materialId:
      row.material_id ||
      (materialName.toLowerCase().includes('pcb')
        ? 'mat_pcb'
        : materialName.toLowerCase().includes('cable')
        ? 'mat_cable'
        : materialName.toLowerCase().includes('battery')
        ? 'mat_battery'
        : 'mat_lcd'),
    materialName,
    materialCategory:
      row.material_category ||
      (materialName.includes('PCB')
        ? 'Electronic Component'
        : materialName.includes('Cable')
        ? 'Non-Ferrous Wire'
        : materialName.includes('Battery')
        ? 'Hazardous Energy Storage'
        : 'Display Electronics'),
    weightKg,
    marketRatePerKg,
    marketEstimate,
    recyclerId: row.recycler_id || recycler.id || 'rec_greencycle',
    recyclerName:
      recycler.name ||
      (row.recycler_id === 'rec_ecorecover'
        ? 'EcoRecover'
        : row.recycler_id === 'rec_renewtech'
        ? 'ReNewTech'
        : 'GreenCycle'),
    recyclerOfferPerKg,
    recyclerPayout,
    bonusAmount,
    status: row.status as LotStatus,
    createdAt: createdAtFormatted,
    completedAt: completedAtFormatted,
    qrPayload: row.qr_payload || `KABADICONNECT:LOT:${row.id}:${row.status.toUpperCase()}`,
    verificationSteps
  };
}

// ==============================================================================
// Public Service API Functions
// ==============================================================================

// 1. getMaterials()
export async function getMaterials(): Promise<MaterialItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockMaterials]), 100);
  });
}

// 2. getPrices()
export async function getPrices(): Promise<Record<string, { price: number; min: number; max: number }>> {
  return new Promise((resolve) => {
    const prices: Record<string, { price: number; min: number; max: number }> = {};
    mockMaterials.forEach((m) => {
      prices[m.name] = {
        price: m.avgPricePerKg,
        min: m.minPrice,
        max: m.maxPrice
      };
    });
    setTimeout(() => resolve(prices), 100);
  });
}

// 3. predictMaterial(imageUrl?: string)
export async function predictMaterial(imageUrl?: string): Promise<AIDetectionResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        materialId: 'mat_pcb',
        materialName: 'PCB',
        materialNameHi: 'पीसीबी (सर्किट बोर्ड)',
        category: 'Electronic Component',
        categoryHi: 'इलेक्ट्रॉनिक कंपोनेंट',
        confidence: 94,
        estimatedWeightHint: 15,
        detectedFeatures: [
          'High density copper routing traces',
          'FR-4 glass epoxy substrate base',
          'Surface mount IC chip solder pads',
          'Electrolytic capacitor cluster'
        ],
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'
      });
    }, 1200);
  });
}

// 4. getRecommendedRecyclers(materialId, weight)
export async function getRecommendedRecyclers(
  materialId: string = 'mat_pcb',
  weight: number = 15
): Promise<Recycler[]> {
  if (supabase && isSupabaseConfigured() && !isSupabaseOffline()) {
    try {
      await seedSupabaseIfEmpty();
      const { data, error } = await withTimeout(
        supabase.from('recyclers').select('*'),
        2500
      );

      if (!error && data && data.length > 0) {
        markSupabaseOnline();
        return data.map((row) => {
          const rates = row.offer_rates || {};
          let offerRate = rates.default || 140;
          if (materialId.includes('cable') || materialId === 'mat_cable') {
            offerRate = rates.Cable || rates.default || 540;
          } else if (materialId.includes('battery') || materialId === 'mat_battery') {
            offerRate = rates.Battery || rates.default || 105;
          } else if (materialId.includes('lcd') || materialId === 'mat_lcd') {
            offerRate = rates.LCD || rates.default || 75;
          } else if (materialId.includes('pcb') || materialId === 'mat_pcb') {
            offerRate = rates.PCB || rates.default || 140;
          }

          return {
            id: row.id,
            name: row.name,
            rating: rates.rating ?? 4.8,
            distanceKm: rates.distanceKm ?? 5.0,
            offerPerKg: offerRate,
            matchScore: rates.matchScore ?? 90,
            isAuthorized: rates.isAuthorized ?? true,
            hasPickup: rates.hasPickup ?? true,
            address: row.location,
            phone: rates.phone ?? '+91 40 2712 8899',
            licenseNumber: row.license_id,
            acceptedMaterials: rates.acceptedMaterials ?? ['PCB', 'Cable', 'Battery', 'LCD'],
            acceptedMaterialsHi: ['पीसीबी', 'केबल', 'बैटरी', 'एलसीडी'],
            processingTime: rates.processingTime ?? '2 hours door pickup',
            estimatedPayout: Math.round(offerRate * weight)
          };
        });
      }
    } catch (err) {
      console.warn('[Supabase] getRecommendedRecyclers failed, using fallback:', err);
      markSupabaseOffline();
    }
  }

  // Fallback to mock recyclers
  return new Promise((resolve) => {
    const adjusted = mockRecyclers.map((rec) => ({
      ...rec,
      estimatedPayout: Math.round(rec.offerPerKg * weight)
    }));
    setTimeout(() => resolve(adjusted), 150);
  });
}

// 5. getRecycler(id)
export async function getRecycler(id: string): Promise<Recycler | null> {
  if (supabase && isSupabaseConfigured() && !isSupabaseOffline()) {
    try {
      await seedSupabaseIfEmpty();
      const { data, error } = await withTimeout(
        supabase.from('recyclers').select('*').eq('id', id).maybeSingle(),
        2500
      );

      if (!error && data) {
        markSupabaseOnline();
        const rates = data.offer_rates || {};
        return {
          id: data.id,
          name: data.name,
          rating: rates.rating ?? 4.8,
          distanceKm: rates.distanceKm ?? 5.0,
          offerPerKg: rates.default ?? 140,
          matchScore: rates.matchScore ?? 90,
          isAuthorized: rates.isAuthorized ?? true,
          hasPickup: rates.hasPickup ?? true,
          address: data.location,
          phone: rates.phone ?? '+91 40 2712 8899',
          licenseNumber: data.license_id,
          acceptedMaterials: rates.acceptedMaterials ?? ['PCB', 'Cable', 'Battery', 'LCD'],
          acceptedMaterialsHi: ['पीसीबी', 'केबल', 'बैटरी', 'एलसीडी'],
          processingTime: rates.processingTime ?? '2 hours door pickup'
        };
      }
    } catch (err) {
      console.warn('[Supabase] getRecycler failed, using fallback:', err);
      markSupabaseOffline();
    }
  }

  return new Promise((resolve) => {
    const found = mockRecyclers.find((r) => r.id === id) || mockRecyclers[0];
    setTimeout(() => resolve(found), 100);
  });
}

export interface CreateLotPayload {
  materialId: string;
  materialName: string;
  materialCategory: string;
  weightKg: number;
  recyclerId: string;
  recyclerName: string;
  recyclerOfferPerKg: number;
}

// 6. createLot(payload)
export async function createLot(payload: CreateLotPayload): Promise<DigitalLot> {
  const lotId = 'KC-00127';
  const marketRatePerKg = 125;
  const marketEstimate = Math.round(payload.weightKg * marketRatePerKg);
  const recyclerPayout = Math.round(payload.weightKg * payload.recyclerOfferPerKg);
  const bonusAmount = Math.max(0, recyclerPayout - marketEstimate);

  const verificationSteps = {
    lotCreated: true,
    materialRecorded: true,
    weightRecorded: true,
    recyclerSelected: true,
    collectorVerified: true,
    recyclerApproved: false
  };

  const newLot: DigitalLot = {
    id: lotId,
    collectorName: mockUserProfile.name,
    collectorPhone: mockUserProfile.phone,
    location: 'Hyderabad',
    materialId: payload.materialId,
    materialName: payload.materialName,
    materialCategory: payload.materialCategory,
    weightKg: payload.weightKg,
    marketRatePerKg,
    marketEstimate,
    recyclerId: payload.recyclerId,
    recyclerName: payload.recyclerName,
    recyclerOfferPerKg: payload.recyclerOfferPerKg,
    recyclerPayout,
    bonusAmount,
    status: 'awaiting_handover',
    createdAt:
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
    qrPayload: `KABADICONNECT:LOT:${lotId}:COLL:${mockUserProfile.name}:REC:${payload.recyclerName}:AMT:${recyclerPayout}:MAT:${payload.materialName}:WT:${payload.weightKg}KG:CPCB_AUTH`,
    verificationSteps
  };

  // 1. Save to Supabase if configured
  if (supabase && isSupabaseConfigured() && !isSupabaseOffline()) {
    try {
      await seedSupabaseIfEmpty();
      await withTimeout(
        supabase.from('lots').upsert({
          id: lotId,
          collector_id: mockUserProfile.id,
          recycler_id: payload.recyclerId,
          material: payload.materialName,
          weight_kg: payload.weightKg,
          status: 'awaiting_handover',
          offered_price: recyclerPayout,
          verified_weight_kg: null,
          final_payout: recyclerPayout,
          created_at: new Date().toISOString(),
          material_id: payload.materialId,
          material_category: payload.materialCategory,
          market_rate_per_kg: marketRatePerKg,
          market_estimate: marketEstimate,
          recycler_offer_per_kg: payload.recyclerOfferPerKg,
          bonus_amount: bonusAmount,
          qr_payload: newLot.qrPayload,
          verification_steps: verificationSteps
        }),
        3000
      );
      markSupabaseOnline();
    } catch (err) {
      console.warn('[Supabase] createLot failed, persisting to localStorage only:', err);
      markSupabaseOffline();
    }
  }

  // 2. Always maintain local cache
  updateLocalLotCache(newLot);

  return new Promise((resolve) => {
    setTimeout(() => resolve(newLot), 250);
  });
}

// 7. getLot(id)
export async function getLot(id: string): Promise<DigitalLot | null> {
  if (supabase && isSupabaseConfigured() && !isSupabaseOffline()) {
    try {
      await seedSupabaseIfEmpty();
      const { data, error } = await withTimeout(
        supabase
          .from('lots')
          .select('*, collectors(*), recyclers(*)')
          .eq('id', id)
          .maybeSingle(),
        2500
      );

      if (!error && data) {
        markSupabaseOnline();
        const mapped = mapLotRowToDigitalLot(data);
        updateLocalLotCache(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn(`[Supabase] getLot(${id}) failed, using fallback:`, err);
      markSupabaseOffline();
    }
  }

  return new Promise((resolve) => {
    const lots = getStoredLots();
    const lot = lots[id] || lots['KC-00127'] || null;
    setTimeout(() => resolve(lot), 100);
  });
}

// 7b. getAllLots()
export async function getAllLots(): Promise<DigitalLot[]> {
  if (supabase && isSupabaseConfigured() && !isSupabaseOffline()) {
    try {
      await seedSupabaseIfEmpty();
      const { data, error } = await withTimeout(
        supabase
          .from('lots')
          .select('*, collectors(*), recyclers(*)')
          .order('created_at', { ascending: false }),
        3000
      );

      if (!error && data && data.length > 0) {
        markSupabaseOnline();
        const list = data.map(mapLotRowToDigitalLot);
        // Synchronize local cache
        for (const lot of list) {
          updateLocalLotCache(lot);
        }
        return list;
      }
    } catch (err) {
      console.warn('[Supabase] getAllLots failed, using fallback:', err);
      markSupabaseOffline();
    }
  }

  return new Promise((resolve) => {
    const lots = getStoredLots();
    const list = Object.values(lots);
    setTimeout(() => resolve(list), 100);
  });
}

// 7c. acceptLot(id)
export async function acceptLot(id: string): Promise<DigitalLot | null> {
  // Update in Supabase if configured
  if (supabase && isSupabaseConfigured() && !isSupabaseOffline()) {
    try {
      await seedSupabaseIfEmpty();
      const { data: existing } = await withTimeout(
        supabase.from('lots').select('*').eq('id', id).maybeSingle(),
        2000
      );

      const currentSteps = existing?.verification_steps || {
        lotCreated: true,
        materialRecorded: true,
        weightRecorded: true,
        recyclerSelected: true,
        collectorVerified: true,
        recyclerApproved: false
      };
      const updatedSteps = { ...currentSteps, recyclerApproved: true };

      const { data: updated, error } = await withTimeout(
        supabase
          .from('lots')
          .update({ verification_steps: updatedSteps })
          .eq('id', id)
          .select('*, collectors(*), recyclers(*)')
          .maybeSingle(),
        2500
      );

      if (!error && updated) {
        markSupabaseOnline();
        const mapped = mapLotRowToDigitalLot(updated);
        updateLocalLotCache(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn(`[Supabase] acceptLot(${id}) failed, using fallback:`, err);
      markSupabaseOffline();
    }
  }

  // Fallback to localStorage
  return new Promise((resolve) => {
    const lots = getStoredLots();
    const lot = lots[id];
    if (lot) {
      lot.verificationSteps.recyclerApproved = true;
      lots[id] = lot;
      saveStoredLots(lots);
      resolve({ ...lot });
    } else {
      resolve(null);
    }
  });
}

// 8. confirmHandover(lotId, verifiedWeight)
export async function confirmHandover(
  lotId: string,
  verifiedWeight?: number
): Promise<DigitalLot> {
  // First, get the lot state from either database or storage
  const currentLots = getStoredLots();
  let baseLot = currentLots[lotId] || currentLots['KC-00127'];

  // If Supabase is active, try to fetch the latest lot row
  if (supabase && isSupabaseConfigured() && !isSupabaseOffline()) {
    try {
      const { data: remoteLot } = await withTimeout(
        supabase
          .from('lots')
          .select('*, collectors(*), recyclers(*)')
          .eq('id', lotId)
          .maybeSingle(),
        2500
      );
      if (remoteLot) {
        markSupabaseOnline();
        baseLot = mapLotRowToDigitalLot(remoteLot);
      }
    } catch {
      markSupabaseOffline();
    }
  }

  if (!baseLot) {
    throw new Error(`Lot ${lotId} not found`);
  }

  const finalWeight =
    verifiedWeight !== undefined && !isNaN(verifiedWeight) && verifiedWeight > 0
      ? Number(verifiedWeight.toFixed(2))
      : baseLot.weightKg;

  const finalPayout = Math.round(finalWeight * baseLot.recyclerOfferPerKg);
  const marketEstimate = Math.round(finalWeight * baseLot.marketRatePerKg);
  const bonusAmount = Math.max(0, finalPayout - marketEstimate);
  const completedAtFormatted =
    new Date().toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) +
    ' ' +
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const updatedSteps = {
    ...baseLot.verificationSteps,
    weightRecorded: true,
    recyclerApproved: true
  };

  const updatedLot: DigitalLot = {
    ...baseLot,
    weightKg: finalWeight,
    recyclerPayout: finalPayout,
    marketEstimate,
    bonusAmount,
    status: 'completed',
    completedAt: completedAtFormatted,
    verificationSteps: updatedSteps,
    qrPayload: `KABADICONNECT:LOT:${baseLot.id}:COMPLETED:AMT:${finalPayout}:WT:${finalWeight}KG`
  };

  const todayDateStr = new Date().toISOString().split('T')[0];

  // 1. Persist to Supabase if configured
  if (supabase && isSupabaseConfigured() && !isSupabaseOffline()) {
    try {
      await seedSupabaseIfEmpty();
      // Update lot in Supabase
      await withTimeout(
        supabase
          .from('lots')
          .update({
            status: 'completed',
            weight_kg: finalWeight,
            verified_weight_kg: finalWeight,
            final_payout: finalPayout,
            completed_at: new Date().toISOString(),
            qr_payload: updatedLot.qrPayload,
            verification_steps: updatedSteps,
            bonus_amount: bonusAmount
          })
          .eq('id', baseLot.id),
        3000
      );

      // Check if transaction already exists for this lot
      const { data: existingTx } = await withTimeout(
        supabase
          .from('transactions')
          .select('id')
          .eq('lot_id', baseLot.id)
          .maybeSingle(),
        2500
      );

      const txId = existingTx?.id || `tx_${Date.now()}`;
      await withTimeout(
        supabase.from('transactions').upsert({
          id: txId,
          lot_id: baseLot.id,
          amount: finalPayout,
          status: 'Completed',
          date: todayDateStr,
          material: baseLot.materialName,
          material_hi: getHindiMaterialName(baseLot.materialName),
          weight_kg: finalWeight,
          recycler_name: baseLot.recyclerName
        }),
        3000
      );
      markSupabaseOnline();
    } catch (err) {
      console.warn('[Supabase] confirmHandover failed, persisting to localStorage only:', err);
      markSupabaseOffline();
    }
  }

  // 2. Always persist to localStorage for redundancy / fallback
  updateLocalLotCache(updatedLot);

  const txs = getStoredTransactions();
  const existingIdx = txs.findIndex((t) => t.lotId === updatedLot.id);
  const updatedTx: Transaction = {
    id: existingIdx >= 0 ? txs[existingIdx].id : `tx_${Date.now()}`,
    lotId: updatedLot.id,
    material: updatedLot.materialName,
    materialHi: getHindiMaterialName(updatedLot.materialName),
    weightKg: updatedLot.weightKg,
    amount: updatedLot.recyclerPayout,
    recyclerName: updatedLot.recyclerName,
    date: todayDateStr,
    status: 'Completed'
  };

  if (existingIdx >= 0) {
    txs[existingIdx] = updatedTx;
  } else {
    txs.unshift(updatedTx);
  }
  saveStoredTransactions(txs);

  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...updatedLot }), 250);
  });
}

// 9. getTransactions()
export async function getTransactions(): Promise<Transaction[]> {
  if (supabase && isSupabaseConfigured() && !isSupabaseOffline()) {
    try {
      await seedSupabaseIfEmpty();
      const { data, error } = await withTimeout(
        supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false }),
        3000
      );

      if (!error && data && data.length > 0) {
        markSupabaseOnline();
        const list: Transaction[] = data.map((row) => ({
          id: row.id,
          lotId: row.lot_id,
          material: row.material || 'PCB',
          materialHi: row.material_hi || getHindiMaterialName(row.material),
          weightKg: Number(row.weight_kg || 0),
          amount: Number(row.amount || 0),
          recyclerName: row.recycler_name || 'GreenCycle',
          date: typeof row.date === 'string' ? row.date.split('T')[0] : String(row.date),
          status: (row.status || 'Completed') as 'Completed' | 'Pending' | 'Cancelled'
        }));

        saveStoredTransactions(list);
        return list;
      }
    } catch (err) {
      console.warn('[Supabase] getTransactions failed, using fallback:', err);
      markSupabaseOffline();
    }
  }

  // Fallback
  return new Promise((resolve) => {
    const txs = getStoredTransactions();
    const sorted = [...txs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setTimeout(() => resolve(sorted), 100);
  });
}

// 10. getEarnings()
export async function getEarnings(): Promise<EarningsSummary> {
  const txs = await getTransactions();
  const completedTxs = txs.filter((t) => t.status.toLowerCase() === 'completed');

  // Mathematically computed from completed transactions
  const totalEarnings = completedTxs.reduce((sum, t) => sum + t.amount, 0);
  const completedTransactions = completedTxs.length;
  const totalWasteKg = Number(
    completedTxs.reduce((sum, t) => sum + t.weightKg, 0).toFixed(1)
  );

  // Calculate "This Month" based on completed transactions in the current calendar month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const currentMonthTxs = completedTxs.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const thisMonth =
    currentMonthTxs.length > 0
      ? currentMonthTxs.reduce((sum, t) => sum + t.amount, 0)
      : completedTxs.length > 0
      ? completedTxs
          .filter((t) => {
            const latestDate = new Date(completedTxs[0].date);
            const d = new Date(t.date);
            return (
              d.getFullYear() === latestDate.getFullYear() &&
              d.getMonth() === latestDate.getMonth()
            );
          })
          .reduce((sum, t) => sum + t.amount, 0)
      : 0;

  const sortedTxs = [...txs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return {
    totalEarnings,
    thisMonth,
    completedTransactions,
    totalWasteKg,
    recentTransactions: sortedTxs
  };
}

// Helper to reset demo state
export function resetDemoState() {
  localStorage.removeItem(LOTS_STORAGE_KEY);
  localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
  localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(initialLots));
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(initialTransactions));

  if (supabase && isSupabaseConfigured()) {
    seedSupabaseIfEmpty().catch((err) => {
      console.warn('Could not reset Supabase seed:', err);
    });
  }
}

export interface PriceAnomalyResult {
  isAnomaly: boolean;
  normalRate: number;
  thresholdRate: number;
  offerOrEstimatedRate: number;
  materialName: string;
}

/**
 * Anomaly Detection: Checks if a recycler's offer or estimated price is below 60%
 * of the standard normal rate for that material type.
 */
export function checkPriceAnomaly(
  materialIdOrName: string,
  offerOrEstimatedRate: number
): PriceAnomalyResult {
  const normalized = (materialIdOrName || 'mat_pcb').toLowerCase();
  const material =
    mockMaterials.find(
      (m) =>
        m.id.toLowerCase() === normalized ||
        m.name.toLowerCase().includes(normalized) ||
        normalized.includes(m.name.split(' ')[0].toLowerCase())
    ) || mockMaterials[0];

  const normalRate = material.avgPricePerKg;
  const thresholdRate = normalRate * 0.6; // 60% threshold
  const isAnomaly = offerOrEstimatedRate < thresholdRate;
  const materialName = material.name.split(' (')[0];

  return {
    isAnomaly,
    normalRate,
    thresholdRate,
    offerOrEstimatedRate,
    materialName
  };
}
