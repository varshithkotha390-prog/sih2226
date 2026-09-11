import { UserProfile, MaterialItem, Recycler, DigitalLot, Transaction, EarningsSummary } from '../types';

export const mockUserProfile: UserProfile = {
  id: 'usr_ramesh_01',
  name: 'Ramesh',
  phone: '+91 98490 12345',
  location: 'Hyderabad, Telangana',
  role: 'Informal E-Waste Collector',
  badge: 'CPCB Registered Partner',
  memberSince: 'March 2024'
};

export const mockMaterials: MaterialItem[] = [
  {
    id: 'mat_pcb',
    name: 'PCB (Printed Circuit Board)',
    nameHi: 'पीसीबी (सर्किट बोर्ड)',
    category: 'Electronic Component',
    categoryHi: 'इलेक्ट्रॉनिक कंपोनेंट',
    avgPricePerKg: 125,
    minPrice: 110,
    maxPrice: 145,
    sampleImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    unit: 'kg',
    iconName: 'Cpu',
    safetyTip: 'Contains trace heavy metals. Avoid breaking or acid washing.',
    safetyTipHi: 'इसमें भारी धातुएं होती हैं। इसे न तोड़ें और न ही तेज़ाब से धोएं।'
  },
  {
    id: 'mat_cable',
    name: 'Copper Cable & Wiring',
    nameHi: 'कॉपर केबल और तार',
    category: 'Non-Ferrous Wire',
    categoryHi: 'धात्विक तार',
    avgPricePerKg: 520,
    minPrice: 480,
    maxPrice: 560,
    sampleImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    unit: 'kg',
    iconName: 'Cable',
    safetyTip: 'Do not burn PVC sheath in open air. Sell unburned.',
    safetyTipHi: 'तारों की प्लास्टिक को कभी आग में न जलाएं।'
  },
  {
    id: 'mat_battery',
    name: 'Lithium & Lead Battery',
    nameHi: 'लिथियम और लेड बैटरी',
    category: 'Hazardous Energy Storage',
    categoryHi: 'ऊर्जा भंडारण',
    avgPricePerKg: 95,
    minPrice: 85,
    maxPrice: 110,
    sampleImageUrl: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80',
    unit: 'kg',
    iconName: 'BatteryCharging',
    safetyTip: 'Puncture danger! Store in cool dry place away from sparks.',
    safetyTipHi: 'विस्फोट का खतरा! सूखी और ठंडी जगह पर रखें।'
  },
  {
    id: 'mat_lcd',
    name: 'LCD & Display Units',
    nameHi: 'एलसीडी और डिस्प्ले स्क्रीन',
    category: 'Display Electronics',
    categoryHi: 'डिस्प्ले उपकरण',
    avgPricePerKg: 70,
    minPrice: 60,
    maxPrice: 85,
    sampleImageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
    unit: 'kg',
    iconName: 'Tv',
    safetyTip: 'Handle glass edges carefully. Contains mercury backlights.',
    safetyTipHi: 'कांच टूटने से बचें। पीछे मरकरी लैंप हो सकते हैं।'
  }
];

export const mockRecyclers: Recycler[] = [
  {
    id: 'rec_greencycle',
    name: 'GreenCycle',
    rating: 4.9,
    distanceKm: 4.2,
    offerPerKg: 140,
    matchScore: 94,
    isAuthorized: true,
    hasPickup: true,
    address: 'Plot 42, IDA Cherlapally, Phase 2, Hyderabad',
    phone: '+91 40 2712 8899',
    licenseNumber: 'TSPCB/E-WASTE/HYD/2023-881',
    acceptedMaterials: ['PCB', 'Cable', 'Battery', 'LCD'],
    acceptedMaterialsHi: ['पीसीबी', 'केबल', 'बैटरी', 'एलसीडी'],
    processingTime: '2 hours door pickup'
  },
  {
    id: 'rec_ecorecover',
    name: 'EcoRecover',
    rating: 4.7,
    distanceKm: 7.8,
    offerPerKg: 135,
    matchScore: 87,
    isAuthorized: true,
    hasPickup: true,
    address: 'Industrial Area, Jeedimetla, Hyderabad',
    phone: '+91 40 2319 4411',
    licenseNumber: 'TSPCB/E-WASTE/HYD/2022-419',
    acceptedMaterials: ['PCB', 'Cable', 'Battery'],
    acceptedMaterialsHi: ['पीसीबी', 'केबल', 'बैटरी'],
    processingTime: 'Same day pickup'
  },
  {
    id: 'rec_renewtech',
    name: 'ReNewTech',
    rating: 4.4,
    distanceKm: 11.2,
    offerPerKg: 128,
    matchScore: 76,
    isAuthorized: true,
    hasPickup: false,
    address: 'Near Balanagar Circle, Hyderabad',
    phone: '+91 40 2377 1200',
    licenseNumber: 'TSPCB/E-WASTE/HYD/2021-105',
    acceptedMaterials: ['PCB', 'LCD'],
    acceptedMaterialsHi: ['पीसीबी', 'एलसीडी'],
    processingTime: 'Facility Drop-off only'
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx_001',
    lotId: 'KC-00126',
    material: 'PCB',
    materialHi: 'पीसीबी (सर्किट बोर्ड)',
    weightKg: 14,
    amount: 1950,
    recyclerName: 'GreenCycle',
    date: '2026-03-02',
    status: 'Completed'
  },
  {
    id: 'tx_002',
    lotId: 'KC-00125',
    material: 'Copper Cable',
    materialHi: 'कॉपर केबल',
    weightKg: 8,
    amount: 4000,
    recyclerName: 'EcoRecover',
    date: '2026-02-27',
    status: 'Completed'
  },
  {
    id: 'tx_003',
    lotId: 'KC-00124',
    material: 'Battery',
    materialHi: 'बैटरी',
    weightKg: 12,
    amount: 1140,
    recyclerName: 'GreenCycle',
    date: '2026-02-21',
    status: 'Completed'
  },
  {
    id: 'tx_004',
    lotId: 'KC-00123',
    material: 'LCD Screen',
    materialHi: 'एलसीडी स्क्रीन',
    weightKg: 19.5,
    amount: 1360,
    recyclerName: 'ReNewTech',
    date: '2026-02-14',
    status: 'Completed'
  }
];

export const initialLots: Record<string, DigitalLot> = {
  'KC-00127': {
    id: 'KC-00127',
    collectorName: 'Ramesh',
    collectorPhone: '+91 98490 12345',
    location: 'Hyderabad',
    materialId: 'mat_pcb',
    materialName: 'PCB',
    materialCategory: 'Electronic Component',
    weightKg: 15,
    marketRatePerKg: 125,
    marketEstimate: 1875,
    recyclerId: 'rec_greencycle',
    recyclerName: 'GreenCycle',
    recyclerOfferPerKg: 140,
    recyclerPayout: 2100,
    bonusAmount: 225,
    status: 'awaiting_handover',
    createdAt: '2026-03-04 10:30 AM',
    qrPayload: 'KABADICONNECT:LOT:KC-00127:COLL:RAMESH:REC:GREENCYCLE:AMT:2100:MAT:PCB:WT:15KG:CPCB_AUTH',
    verificationSteps: {
      lotCreated: true,
      materialRecorded: true,
      weightRecorded: true,
      recyclerSelected: true,
      collectorVerified: true,
      recyclerApproved: false
    }
  },
  'KC-00126': {
    id: 'KC-00126',
    collectorName: 'Ramesh',
    collectorPhone: '+91 98490 12345',
    location: 'Hyderabad',
    materialId: 'mat_pcb',
    materialName: 'PCB',
    materialCategory: 'Electronic Component',
    weightKg: 14,
    marketRatePerKg: 125,
    marketEstimate: 1750,
    recyclerId: 'rec_greencycle',
    recyclerName: 'GreenCycle',
    recyclerOfferPerKg: 139.28,
    recyclerPayout: 1950,
    bonusAmount: 200,
    status: 'completed',
    createdAt: '2026-03-02 02:15 PM',
    completedAt: '2026-03-02 03:45 PM',
    qrPayload: 'KABADICONNECT:LOT:KC-00126:COMPLETED',
    verificationSteps: {
      lotCreated: true,
      materialRecorded: true,
      weightRecorded: true,
      recyclerSelected: true,
      collectorVerified: true,
      recyclerApproved: true
    }
  },
  'KC-00128': {
    id: 'KC-00128',
    collectorName: 'Suresh Kumar',
    collectorPhone: '+91 98765 23456',
    location: 'Secunderabad',
    materialId: 'mat_cable',
    materialName: 'Copper Cable',
    materialCategory: 'Non-Ferrous Wire',
    weightKg: 25,
    marketRatePerKg: 520,
    marketEstimate: 13000,
    recyclerId: 'rec_greencycle',
    recyclerName: 'GreenCycle',
    recyclerOfferPerKg: 540,
    recyclerPayout: 13500,
    bonusAmount: 500,
    status: 'awaiting_handover',
    createdAt: '2026-03-05 11:15 AM',
    qrPayload: 'KABADICONNECT:LOT:KC-00128:COLL:SURESH:REC:GREENCYCLE:AMT:13500:MAT:CABLE:WT:25KG:CPCB_AUTH',
    verificationSteps: {
      lotCreated: true,
      materialRecorded: true,
      weightRecorded: true,
      recyclerSelected: true,
      collectorVerified: true,
      recyclerApproved: false
    }
  },
  'KC-00129': {
    id: 'KC-00129',
    collectorName: 'Anil Rao',
    collectorPhone: '+91 98480 34567',
    location: 'Kukatpally, Hyderabad',
    materialId: 'mat_battery',
    materialName: 'Lithium Battery',
    materialCategory: 'Hazardous Energy Storage',
    weightKg: 30,
    marketRatePerKg: 95,
    marketEstimate: 2850,
    recyclerId: 'rec_greencycle',
    recyclerName: 'GreenCycle',
    recyclerOfferPerKg: 105,
    recyclerPayout: 3150,
    bonusAmount: 300,
    status: 'awaiting_handover',
    createdAt: '2026-03-05 02:40 PM',
    qrPayload: 'KABADICONNECT:LOT:KC-00129:COLL:ANIL:REC:GREENCYCLE:AMT:3150:MAT:BATTERY:WT:30KG:CPCB_AUTH',
    verificationSteps: {
      lotCreated: true,
      materialRecorded: true,
      weightRecorded: true,
      recyclerSelected: true,
      collectorVerified: true,
      recyclerApproved: false
    }
  },
  'KC-00130': {
    id: 'KC-00130',
    collectorName: 'Mohammed K.',
    collectorPhone: '+91 97000 45678',
    location: 'Charminar, Hyderabad',
    materialId: 'mat_lcd',
    materialName: 'LCD Display Units',
    materialCategory: 'Display Electronics',
    weightKg: 40,
    marketRatePerKg: 70,
    marketEstimate: 2800,
    recyclerId: 'rec_greencycle',
    recyclerName: 'GreenCycle',
    recyclerOfferPerKg: 75,
    recyclerPayout: 3000,
    bonusAmount: 200,
    status: 'completed',
    createdAt: '2026-03-01 09:30 AM',
    completedAt: '2026-03-01 11:00 AM',
    qrPayload: 'KABADICONNECT:LOT:KC-00130:COMPLETED',
    verificationSteps: {
      lotCreated: true,
      materialRecorded: true,
      weightRecorded: true,
      recyclerSelected: true,
      collectorVerified: true,
      recyclerApproved: true
    }
  }
};
