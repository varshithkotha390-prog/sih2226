import { UserProfile, MaterialItem, Recycler, DigitalLot, Transaction, EarningsSummary, Language } from '../types';

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
    nameTe: 'పిసిబి (సర్క్యూట్ బోర్డ్)',
    nameTa: 'பிசிபி (மின்சுற்று பலகை)',
    nameKn: 'ಪಿಸಿಬಿ (ಸರ್ಕ್ಯೂಟ್ ಬೋರ್ಡ್)',
    nameMl: 'പിസിബി (സർക്യൂട്ട് ബോർഡ്)',
    category: 'Electronic Component',
    categoryHi: 'इलेक्ट्रॉनिक कंपोनेंट',
    categoryTe: 'ఎలక్ట్రానిక్ కాంపోనెంట్',
    categoryTa: 'மின்னணு கூறு',
    categoryKn: 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಘಟಕ',
    categoryMl: 'ഇലക്ട്രോണിക് ഘടകം',
    avgPricePerKg: 125,
    minPrice: 110,
    maxPrice: 145,
    sampleImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    unit: 'kg',
    iconName: 'Cpu',
    safetyTip: 'Contains trace heavy metals. Avoid breaking or acid washing.',
    safetyTipHi: 'इसमें भारी धातुएं होती हैं। इसे न तोड़ें और न ही तेज़ाब से धोएं।',
    safetyTipTe: 'ఇందులో భార లోహాలు ఉంటాయి. పగలగొట్టడం లేదా యాసిడ్ వాషింగ్ చేయవద్దు.',
    safetyTipTa: 'கன உலோகங்கள் உள்ளன. உடைக்கவோ அமிலத்தில் கழுவவோ வேண்டாம்.',
    safetyTipKn: 'ಭಾರ ಲೋಹಗಳಿವೆ. ಒಡೆಯಬೇಡಿ ಅಥವಾ ಆಮ್ಲದಿಂದ ತೊಳೆಯಬೇಡಿ.',
    safetyTipMl: 'കനത്ത ലോഹങ്ങൾ അടങ്ങിയിരിക്കുന്നു. തകർക്കുകയോ ആസിഡ് വാഷ് ചെയ്യുകയോ അരുത്.'
  },
  {
    id: 'mat_cable',
    name: 'Copper Cable & Wiring',
    nameHi: 'कॉपर केबल और तार',
    nameTe: 'రాగి కేబుల్ & వైరింగ్',
    nameTa: 'செப்பு கம்பி & வயரிங்',
    nameKn: 'ತಾಮ್ರದ ಕೇಬಲ್ & ವೈರಿಂಗ್',
    nameMl: 'ചെമ്പ് കേബിൾ & വയറിംഗ്',
    category: 'Non-Ferrous Wire',
    categoryHi: 'धात्विक तार',
    categoryTe: 'నాన్-ఫెర్రస్ వైర్',
    categoryTa: 'இரும்பு அல்லாத உலோகம்',
    categoryKn: 'ನಾನ್-ಫೆರಸ್ ತಂತಿ',
    categoryMl: 'നോൺ-ഫെറസ് വയർ',
    avgPricePerKg: 520,
    minPrice: 480,
    maxPrice: 560,
    sampleImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    unit: 'kg',
    iconName: 'Cable',
    safetyTip: 'Do not burn PVC sheath in open air. Sell unburned.',
    safetyTipHi: 'तारों की प्लास्टिक को कभी आग में न जलाएं।',
    safetyTipTe: 'వైర్ల ప్లాస్టిక్ కోటింగ్‌ను ఎప్పుడూ బహిరంగ మంటల్లో కాల్చవద్దు.',
    safetyTipTa: 'பிளாஸ்டிக் பூச்சுகளை ஒருபோதும் திறந்தவெளியில் எரிக்க வேண்டாம்.',
    safetyTipKn: 'ಕೇಬಲ್‌ಗಳನ್ನು ತೆರೆದ ಬೆಂಕಿಯಲ್ಲಿ ಸುಡಬೇಡಿ.',
    safetyTipMl: 'പ്ലാസ്റ്റിക് ഇൻസുലേഷൻ ഒരിക്കലും തുറന്ന തീയിൽ കത്തിക്കരുത്.'
  },
  {
    id: 'mat_battery',
    name: 'Lithium & Lead Battery',
    nameHi: 'लिथियम और लेड बैटरी',
    nameTe: 'లిథియం & లెడ్ బ్యాటరీ',
    nameTa: 'லித்தியம் & ஈய பேட்டரி',
    nameKn: 'ಲಿಥಿಯಂ & ಸೀಸದ ಬ್ಯಾಟರಿ',
    nameMl: 'ലിഥിയം & ലെഡ് ബാറ്ററി',
    category: 'Hazardous Energy Storage',
    categoryHi: 'ऊर्जा भंडारण',
    categoryTe: 'ప్రమాదకర విద్యుత్ నిల్వ',
    categoryTa: 'அபாயகரமான ஆற்றல் சேமிப்பு',
    categoryKn: 'ಅಪಾಯಕಾರಿ ಇಂಧನ ಸಂಗ್ರಹ',
    categoryMl: 'അപകടകരമായ ഊർജ്ജ സംഭരണം',
    avgPricePerKg: 95,
    minPrice: 85,
    maxPrice: 110,
    sampleImageUrl: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80',
    unit: 'kg',
    iconName: 'BatteryCharging',
    safetyTip: 'Puncture danger! Store in cool dry place away from sparks.',
    safetyTipHi: 'विस्फोट का खतरा! सूखी और ठंडी जगह पर रखें।',
    safetyTipTe: 'పేలుడు ప్రమాదం! మంటలకు దూరంగా చల్లని పొడి ప్రదేశంలో భద్రపరచండి.',
    safetyTipTa: 'வெடிப்பு ஆபத்து! தீப்பொறிகளிலிருந்து விலகி உலர்ந்த இடத்தில் சேமிக்கவும்.',
    safetyTipKn: 'ಸ್ಫೋಟದ ಅಪಾಯ! ಕಿಡಿಗಳಿಂದ ದೂರವಿರುವ ತಂಪಾದ ಒಣ ಸ್ಥಳದಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ.',
    safetyTipMl: 'സ്ഫോടന സാധ്യത! തീപ്പൊരികളിൽ നിന്ന് മാറി തണുത്ത ഉണങ്ങിയ സ്ഥലത്ത് സൂക്ഷിക്കുക.'
  },
  {
    id: 'mat_lcd',
    name: 'LCD & Display Units',
    nameHi: 'एलसीडी और डिस्प्ले स्क्रीन',
    nameTe: 'ఎల్‌సిడి & డిస్‌ప్లే యూనిట్లు',
    nameTa: 'எல்சிடி & காட்சி திரை',
    nameKn: 'ಎಲ್‌ಸಿಡಿ & ಡಿಸ್ಪ್ಲೇ ಘಟಕಗಳು',
    nameMl: 'എൽസിഡി & ഡിസ്പ്ലേ യൂണിറ്റുകൾ',
    category: 'Display Electronics',
    categoryHi: 'डिस्प्ले उपकरण',
    categoryTe: 'డిస్‌ప్లే పరికరాలు',
    categoryTa: 'காட்சி மின்னணுவியல்',
    categoryKn: 'ಡಿಸ್ಪ್ಲೇ ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್',
    categoryMl: 'ഡിസ്പ്ലേ ഇലക്ട്രോണിക്സ്',
    avgPricePerKg: 70,
    minPrice: 60,
    maxPrice: 85,
    sampleImageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
    unit: 'kg',
    iconName: 'Tv',
    safetyTip: 'Handle glass edges carefully. Contains mercury backlights.',
    safetyTipHi: 'कांच टूटने से बचें। पीछे मरकरी लैंप हो सकते हैं।',
    safetyTipTe: 'గాజు అంచులను జాగ్రత్తగా పట్టుకోండి. మెర్క్యురీ ఉండవచ్చు.',
    safetyTipTa: 'கண்ணாடி விளிம்புகளை கவனமாக கையாளவும். பாதரசம் இருக்கலாம்.',
    safetyTipKn: 'ಗಾಜಿನ ಅಂಚುಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ನಿರ್ವಹಿಸಿ. ಪಾದರಸ ಇರಬಹುದು.',
    safetyTipMl: 'ഗ്ലാസ് അരികുകൾ ശ്രദ്ധയോടെ കൈകാര്യം ചെയ്യുക. മെർക്കുറി അടങ്ങിയിരിക്കാം.'
  }
];

export function getMaterialName(matOrIdOrName: MaterialItem | string | undefined, lang: Language): string {
  if (!matOrIdOrName) return '';
  if (typeof matOrIdOrName === 'object') {
    if (lang === 'hi' && matOrIdOrName.nameHi) return matOrIdOrName.nameHi;
    if (lang === 'te' && matOrIdOrName.nameTe) return matOrIdOrName.nameTe;
    if (lang === 'ta' && matOrIdOrName.nameTa) return matOrIdOrName.nameTa;
    if (lang === 'kn' && matOrIdOrName.nameKn) return matOrIdOrName.nameKn;
    if (lang === 'ml' && matOrIdOrName.nameMl) return matOrIdOrName.nameMl;
    return matOrIdOrName.name;
  }

  const str = String(matOrIdOrName);
  const found = mockMaterials.find((m) => m.id === str || m.name.toLowerCase().includes(str.toLowerCase()));
  if (found) {
    return getMaterialName(found, lang);
  }

  const lower = str.toLowerCase();
  if (lower.includes('pcb') || lower.includes('circuit')) {
    if (lang === 'hi') return 'पीसीबी (सर्किट बोर्ड)';
    if (lang === 'te') return 'పిసిబి (సర్క్యూట్ బోర్డ్)';
    if (lang === 'ta') return 'பிசிபி (மின்சுற்று பலகை)';
    if (lang === 'kn') return 'ಪಿಸಿಬಿ (ಸರ್ಕ್ಯೂಟ್ ಬೋರ್ಡ್)';
    if (lang === 'ml') return 'പിസിബി (സർക്യൂട്ട് ബോർഡ്)';
    return 'PCB (Circuit Boards)';
  }
  if (lower.includes('copper') || lower.includes('cable') || lower.includes('wire')) {
    if (lang === 'hi') return 'कॉपर केबल और तार';
    if (lang === 'te') return 'రాగి కేబుల్ & వైరింగ్';
    if (lang === 'ta') return 'செப்பு கம்பி & வயரிங்';
    if (lang === 'kn') return 'ತಾಮ್ರದ ಕೇಬಲ್ & ವೈರಿಂಗ್';
    if (lang === 'ml') return 'ചെമ്പ് കേബിൾ & വയറിംഗ്';
    return 'Copper Wire & Cable';
  }
  if (lower.includes('battery') || lower.includes('lithium')) {
    if (lang === 'hi') return 'लिथियम और लेड बैटरी';
    if (lang === 'te') return 'లిథియం & లెడ్ బ్యాటరీ';
    if (lang === 'ta') return 'லித்தியம் & ஈய பேட்டரி';
    if (lang === 'kn') return 'ಲಿಥಿಯಂ & ಸೀಸದ ಬ್ಯಾಟರಿ';
    if (lang === 'ml') return 'ലിഥിയം & ലെഡ് ബാറ്ററി';
    return 'Lithium Battery';
  }
  if (lower.includes('lcd') || lower.includes('display') || lower.includes('screen')) {
    if (lang === 'hi') return 'एलसीडी और डिस्प्ले स्क्रीन';
    if (lang === 'te') return 'ఎల్‌సిడి & డిస్‌ప్లే యూనిట్లు';
    if (lang === 'ta') return 'எல்சிடி & காட்சி திரை';
    if (lang === 'kn') return 'ಎಲ್‌ಸಿಡಿ & ಡಿಸ್ಪ್ಲೇ ಘಟಕಗಳು';
    if (lang === 'ml') return 'എൽസിഡി & డిస్പ്లే యూనిറ്റുകൾ';
    return 'LCD Display Unit';
  }
  return str;
}

export function getMaterialCategory(cat: string | undefined, lang: Language): string {
  if (!cat) return '';
  const lower = cat.toLowerCase();
  if (lower.includes('component')) {
    if (lang === 'hi') return 'इलेक्ट्रॉनिक कंपोनेंट';
    if (lang === 'te') return 'ఎలక్ట్రానిక్ కాంపోనెంట్';
    if (lang === 'ta') return 'மின்னணு கூறு';
    if (lang === 'kn') return 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಘಟಕ';
    if (lang === 'ml') return 'ഇലക്ട്രോണിക് ഘടകം';
  }
  if (lower.includes('wire') || lower.includes('ferrous')) {
    if (lang === 'hi') return 'धात्विक तार';
    if (lang === 'te') return 'నాన్-ఫెర్రస్ వైర్';
    if (lang === 'ta') return 'இரும்பு அல்லாத உலோகம்';
    if (lang === 'kn') return 'ನಾನ್-ಫೆರಸ್ ತಂತಿ';
    if (lang === 'ml') return 'நோൺ-ഫെറസ് വയർ';
  }
  if (lower.includes('energy') || lower.includes('hazard') || lower.includes('storage')) {
    if (lang === 'hi') return 'ऊर्जा भंडारण';
    if (lang === 'te') return 'ప్రమాదకర విద్యుత్ నిల్వ';
    if (lang === 'ta') return 'அபாயகரமான ஆற்றல் சேமிப்பு';
    if (lang === 'kn') return 'ಅಪಾಯಕಾರಿ ಇಂಧನ ಸಂಗ್ರಹ';
    if (lang === 'ml') return 'അപകടകരമായ ഊർജ്ജ സംഭരണം';
  }
  if (lower.includes('display')) {
    if (lang === 'hi') return 'डिस्प्ले उपकरण';
    if (lang === 'te') return 'డిస్‌ప్లే పరికరాలు';
    if (lang === 'ta') return 'காட்சி மின்னணுவியல்';
    if (lang === 'kn') return 'ಡಿಸ್ಪ್ಲೇ ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್';
    if (lang === 'ml') return 'ഡിസ്പ്ലേ ഇലക്ട്രോണിക്സ്';
  }
  return cat;
}

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
  'KC-00125': {
    id: 'KC-00125',
    collectorName: 'Ramesh',
    collectorPhone: '+91 98490 12345',
    location: 'Hyderabad',
    materialId: 'mat_cable',
    materialName: 'Copper Cable',
    materialCategory: 'Non-Ferrous Wire',
    weightKg: 8,
    marketRatePerKg: 500,
    marketEstimate: 4000,
    recyclerId: 'rec_ecorecover',
    recyclerName: 'EcoRecover',
    recyclerOfferPerKg: 500,
    recyclerPayout: 4000,
    bonusAmount: 0,
    status: 'completed',
    createdAt: '2026-02-27 10:00 AM',
    completedAt: '2026-02-27 11:30 AM',
    qrPayload: 'KABADICONNECT:LOT:KC-00125:COMPLETED',
    verificationSteps: {
      lotCreated: true,
      materialRecorded: true,
      weightRecorded: true,
      recyclerSelected: true,
      collectorVerified: true,
      recyclerApproved: true
    }
  },
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
