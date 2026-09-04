export type Language = 'en' | 'hi';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  location: string;
  role: string;
  badge: string;
  avatarUrl?: string;
  memberSince: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  nameHi: string;
  category: string;
  categoryHi: string;
  avgPricePerKg: number;
  minPrice: number;
  maxPrice: number;
  sampleImageUrl: string;
  unit: string;
  iconName: string;
  safetyTip: string;
  safetyTipHi: string;
}

export interface Recycler {
  id: string;
  name: string;
  rating: number;
  distanceKm: number;
  offerPerKg: number;
  matchScore: number;
  isAuthorized: boolean;
  hasPickup: boolean;
  address: string;
  phone: string;
  licenseNumber: string;
  acceptedMaterials: string[];
  acceptedMaterialsHi: string[];
  processingTime: string;
}

export type LotStatus = 'draft' | 'awaiting_handover' | 'completed' | 'cancelled';

export interface DigitalLot {
  id: string;
  collectorName: string;
  collectorPhone: string;
  location: string;
  materialId: string;
  materialName: string;
  materialCategory: string;
  weightKg: number;
  marketRatePerKg: number;
  marketEstimate: number;
  recyclerId: string;
  recyclerName: string;
  recyclerOfferPerKg: number;
  recyclerPayout: number;
  bonusAmount: number;
  status: LotStatus;
  createdAt: string;
  completedAt?: string;
  qrPayload: string;
  verificationSteps: {
    lotCreated: boolean;
    materialRecorded: boolean;
    weightRecorded: boolean;
    recyclerSelected: boolean;
    collectorVerified: boolean;
    recyclerApproved: boolean;
  };
}

export interface Transaction {
  id: string;
  lotId: string;
  material: string;
  materialHi: string;
  weightKg: number;
  amount: number;
  recyclerName: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
}

export interface EarningsSummary {
  totalEarnings: number;
  thisMonth: number;
  completedTransactions: number;
  totalWasteKg: number;
  recentTransactions: Transaction[];
}

export interface AIDetectionResult {
  materialId: string;
  materialName: string;
  materialNameHi: string;
  category: string;
  categoryHi: string;
  confidence: number;
  estimatedWeightHint?: number;
  detectedFeatures: string[];
  imageUrl: string;
}
