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
      return JSON.parse(stored);
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
      return JSON.parse(stored);
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

// 8. confirmHandover(lotId)
export async function confirmHandover(lotId: string): Promise<DigitalLot> {
  return new Promise((resolve) => {
    const lots = getStoredLots();
    const lot = lots[lotId] || lots['KC-00127'];

    lot.status = 'completed';
    lot.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today';
    lot.verificationSteps.recyclerApproved = true;
    lots[lot.id] = lot;
    saveStoredLots(lots);

    // Add to completed transactions if not already present
    const txs = getStoredTransactions();
    const alreadyExists = txs.some((t) => t.lotId === lot.id);
    if (!alreadyExists) {
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        lotId: lot.id,
        material: lot.materialName,
        materialHi: lot.materialName === 'PCB' ? 'पीसीबी (सर्किट बोर्ड)' : lot.materialName,
        weightKg: lot.weightKg,
        amount: lot.recyclerPayout,
        recyclerName: lot.recyclerName,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed'
      };
      txs.unshift(newTx);
      saveStoredTransactions(txs);
    }

    setTimeout(() => resolve(lot), 300);
  });
}

// 9. getTransactions()
export async function getTransactions(): Promise<Transaction[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getStoredTransactions()), 100);
  });
}

// 10. getEarnings()
export async function getEarnings(): Promise<EarningsSummary> {
  return new Promise((resolve) => {
    const txs = getStoredTransactions();
    const lots = getStoredLots();
    const hasActiveCompleted = lots['KC-00127']?.status === 'completed';

    // Base mock specs:
    // If KC-00127 is completed, total is 8450 + 2100 = 10,550
    // Otherwise 8,450 base
    const baseEarnings = 8450;
    const totalEarnings = hasActiveCompleted ? baseEarnings + 2100 : baseEarnings;
    const thisMonth = hasActiveCompleted ? 6250 + 2100 : 6250;
    const completedTransactions = hasActiveCompleted ? 13 : 12;
    const totalWasteKg = hasActiveCompleted ? 68.5 + 15 : 68.5;

    setTimeout(() => {
      resolve({
        totalEarnings,
        thisMonth,
        completedTransactions,
        totalWasteKg,
        recentTransactions: txs
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
