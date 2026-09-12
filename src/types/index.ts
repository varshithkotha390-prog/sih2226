export type Language = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml';

export type UserRole = 'collector' | 'recycler' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  location: string;
  role: string;
  badge: string;
  avatarUrl?: string;
  memberSince: string;
  email?: string;
  preferredLanguage?: Language;
  collectorId?: string;
  recyclerId?: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  nameHi: string;
  nameTe?: string;
  nameTa?: string;
  nameKn?: string;
  nameMl?: string;
  category: string;
  categoryHi: string;
  categoryTe?: string;
  categoryTa?: string;
  categoryKn?: string;
  categoryMl?: string;
  avgPricePerKg: number;
  minPrice: number;
  maxPrice: number;
  sampleImageUrl: string;
  unit: string;
  iconName: string;
  safetyTip: string;
  safetyTipHi: string;
  safetyTipTe?: string;
  safetyTipTa?: string;
  safetyTipKn?: string;
  safetyTipMl?: string;
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
