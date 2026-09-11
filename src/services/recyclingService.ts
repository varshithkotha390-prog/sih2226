import {
  MaterialItem,
  Recycler,
  DigitalLot,
  Transaction,
  EarningsSummary,
  AIDetectionResult
} from '../types';
import {
  mockMaterials,
  mockRecyclers,
  initialTransactions,
  initialLots,
  mockUserProfile
} from './mockData';

const LOTS_STORAGE_KEY = 'kc_lots_store';
const TRANSACTIONS_STORAGE_KEY = 'kc_transactions_store';

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
  localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(lots));
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
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
}

// 1. getMaterials()
export async function getMaterials(): Promise<MaterialItem[]> {
  // Simulates brief network delay
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
      // Default to PCB as required by mock data specs
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
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'
      });
    }, 1200); // realistic AI scan timing
  });
}

// 4. getRecommendedRecyclers(materialId, weight)
export async function getRecommendedRecyclers(
  materialId: string = 'mat_pcb',
  weight: number = 15
): Promise<Recycler[]> {
  return new Promise((resolve) => {
    // Dynamic recalculation if non-standard weight
    const adjusted = mockRecyclers.map((rec) => {
      return {
        ...rec,
        estimatedPayout: Math.round(rec.offerPerKg * weight)
      };
    });
    setTimeout(() => resolve(adjusted), 150);
  });
}

// 5. getRecycler(id)
export async function getRecycler(id: string): Promise<Recycler | null> {
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
  return new Promise((resolve) => {
    const currentLots = getStoredLots();
    // Deterministic ID for default demo flow if matching mock specs, or sequential
    const lotId = 'KC-00127';
    const marketRatePerKg = 125;
    const marketEstimate = Math.round(payload.weightKg * marketRatePerKg);
    const recyclerPayout = Math.round(payload.weightKg * payload.recyclerOfferPerKg);
    const bonusAmount = Math.max(0, recyclerPayout - marketEstimate);

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
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
      qrPayload: `KABADICONNECT:LOT:${lotId}:COLL:${mockUserProfile.name}:REC:${payload.recyclerName}:AMT:${recyclerPayout}:MAT:${payload.materialName}:WT:${payload.weightKg}KG:CPCB_AUTH`,
      verificationSteps: {
        lotCreated: true,
        materialRecorded: true,
        weightRecorded: true,
        recyclerSelected: true,
        collectorVerified: true,
        recyclerApproved: false
      }
    };

    currentLots[lotId] = newLot;
    saveStoredLots(currentLots);

    setTimeout(() => resolve(newLot), 250);
  });
}

// 7. getLot(id)
export async function getLot(id: string): Promise<DigitalLot | null> {
  return new Promise((resolve) => {
    const lots = getStoredLots();
    const lot = lots[id] || lots['KC-00127'] || null;
    setTimeout(() => resolve(lot), 100);
  });
}

// 7b. getAllLots()
export async function getAllLots(): Promise<DigitalLot[]> {
  return new Promise((resolve) => {
    const lots = getStoredLots();
    const list = Object.values(lots);
    setTimeout(() => resolve(list), 100);
  });
}

// 7c. acceptLot(id)
export async function acceptLot(id: string): Promise<DigitalLot | null> {
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
  return new Promise((resolve) => {
    const lots = getStoredLots();
    const lot = lots[lotId] || lots['KC-00127'];
    if (!lot) {
      throw new Error(`Lot ${lotId} not found`);
    }

    if (verifiedWeight !== undefined && !isNaN(verifiedWeight) && verifiedWeight > 0) {
      lot.weightKg = Number(verifiedWeight.toFixed(2));
      lot.recyclerPayout = Math.round(lot.weightKg * lot.recyclerOfferPerKg);
      lot.marketEstimate = Math.round(lot.weightKg * lot.marketRatePerKg);
      lot.bonusAmount = Math.max(0, lot.recyclerPayout - lot.marketEstimate);
      lot.verificationSteps.weightRecorded = true;
    }

    lot.status = 'completed';
    lot.completedAt =
      new Date().toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) +
      ' ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    lot.verificationSteps.recyclerApproved = true;
    lot.qrPayload = `KABADICONNECT:LOT:${lot.id}:COMPLETED:AMT:${lot.recyclerPayout}:WT:${lot.weightKg}KG`;
    lots[lot.id] = lot;
    saveStoredLots(lots);

    // Add to completed transactions if not already present, or update existing
    const txs = getStoredTransactions();
    const existingIdx = txs.findIndex((t) => t.lotId === lot.id);
    const updatedTx: Transaction = {
      id: existingIdx >= 0 ? txs[existingIdx].id : `tx_${Date.now()}`,
      lotId: lot.id,
      material: lot.materialName,
      materialHi:
        lot.materialName === 'PCB'
          ? 'पीसीबी (सर्किट बोर्ड)'
          : lot.materialName === 'Copper Cable'
          ? 'कॉपर केबल'
          : lot.materialName.includes('Battery')
          ? 'बैटरी'
          : lot.materialName.includes('LCD')
          ? 'एलसीडी स्क्रीन'
          : lot.materialName,
      weightKg: lot.weightKg,
      amount: lot.recyclerPayout,
      recyclerName: lot.recyclerName,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed'
    };

    if (existingIdx >= 0) {
      txs[existingIdx] = updatedTx;
    } else {
      txs.unshift(updatedTx);
    }
    saveStoredTransactions(txs);

    setTimeout(() => resolve({ ...lot }), 250);
  });
}

// 9. getTransactions()
export async function getTransactions(): Promise<Transaction[]> {
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
  return new Promise((resolve) => {
    const txs = getStoredTransactions();
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

    setTimeout(() => {
      resolve({
        totalEarnings,
        thisMonth,
        completedTransactions,
        totalWasteKg,
        recentTransactions: sortedTxs
      });
    }, 100);
  });
}

// Helper to reset demo state
export function resetDemoState() {
  localStorage.removeItem(LOTS_STORAGE_KEY);
  localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
  localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(initialLots));
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(initialTransactions));
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
