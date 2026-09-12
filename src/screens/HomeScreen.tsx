import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  AlertTriangle,
  ChevronRight,
  User,
  QrCode,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { StatusBadge } from '../components/StatusBadge';
import { useLanguage } from '../i18n/LanguageContext';
import { formatINR } from '../utils/formatters';
import { getEarnings, getMaterials } from '../services/recyclingService';
import { EarningsSummary, MaterialItem } from '../types';
import { getMaterialName } from '../services/mockData';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);

  useEffect(() => {
    getEarnings().then(setEarnings);
    getMaterials().then(setMaterials);
  }, []);

  const totalEarnings = earnings?.totalEarnings ?? 0;

  const dashboardTitle =
    language === 'hi' ? 'डैशबोर्ड' :
    language === 'te' ? 'డాష్‌బోర్డ్' :
    language === 'ta' ? 'டாஷ்போர்டு' :
    language === 'kn' ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' :
    language === 'ml' ? 'ഡാഷ്‌ബോർഡ്' :
    'Dashboard';

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Mobile Top Header */}
      <div className="lg:hidden">
        <Header
          title={dashboardTitle}
          subtitle={t('locationSubtitle')}
          rightAction={
            <button
              onClick={() => navigate('/profile')}
              className="p-2 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              aria-label="Profile"
            >
              <User className="w-5 h-5" />
            </button>
          }
        />
      </div>

      {/* Desktop Clean Industrial Sub-Header */}
      <div className="hidden lg:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-extrabold text-[#121820] tracking-tight">
            {dashboardTitle}
          </h1>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            {t('locationSubtitle')}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
              {t('totalEarningsLabel')}
            </span>
            <span className="text-2xl font-black font-mono text-[#0F3D2E]">
              {formatINR(totalEarnings)}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <button
            onClick={() => navigate('/sell')}
            className="bg-[#C86D2F] hover:bg-[#B85D19] text-white font-extrabold py-2.5 px-6 rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 text-sm"
          >
            <span className="text-base font-black">+</span>
            <span>{t('sellEWastePrimaryBtn')}</span>
          </button>
        </div>
      </div>

      {/* Main Section Responsive Grid */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Column (8 Cols on desktop) */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* 1. DOMINANT ACTIVE HANDOVER COMMAND CENTER CARD */}
            <div className="bg-[#0F3D2E] text-white rounded-3xl p-6 sm:p-7 shadow-xl border-2 border-emerald-800/80 relative overflow-hidden">
              {/* Background ambient accent */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />

              {/* Header inside Command Card */}
              <div className="flex flex-wrap justify-between items-center gap-2 mb-6 pb-4 border-b border-emerald-700/50 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-200">
                    {language === 'hi' ? 'सक्रिय हस्तांतरण' :
                     language === 'te' ? 'క్రియాశీల హ్యాండోవర్' :
                     language === 'ta' ? 'செயலில் உள்ள ஒப்படைப்பு' :
                     language === 'kn' ? 'ಸಕ್ರಿಯ ಹಸ್ತಾಂತರ' :
                     language === 'ml' ? 'സജീവ കൈമാറ്റം' : 'Active Manifest'} • SIH-CPCB/2026
                  </span>
                </div>
                <span className="bg-[#C86D2F] text-white text-xs px-3.5 py-1 rounded-full font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t('awaitingHandover')}</span>
                </span>
              </div>

              {/* Main Content: Left Spotlight & Right QR Box */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
                {/* Left Spotlight (7 cols) */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <span className="font-mono text-xs font-extrabold text-emerald-300 tracking-wider">
                      LOT IDENTIFIER: KC-00127
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                      {getMaterialName('mat_pcb', language)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-emerald-200/90 bg-emerald-900/70 px-2.5 py-0.5 rounded-lg border border-emerald-700/60 font-mono">
                        Weight: 15.0 kg (Tare Logged)
                      </span>
                    </div>
                  </div>

                  {/* Huge Payout Figure */}
                  <div className="bg-emerald-950/60 border border-emerald-700/60 p-4 rounded-2xl">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 block">
                      {language === 'hi' ? 'गारंटीकृत भुगतान' :
                       language === 'te' ? 'హామీతో కూడిన చెల్లింపు' :
                       language === 'ta' ? 'உத்தரவாதமான தீர்வு' :
                       language === 'kn' ? 'ಖಾತರಿಯ ಇತ್ಯರ್ಥ' :
                       language === 'ml' ? 'ഗ്യാരണ്ടീഡ് തീർപ്പാക്കൽ' : 'Guaranteed Recycler Settlement'}
                    </span>
                    <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white my-1">
                      ₹2,100
                    </div>
                    <span className="text-xs font-semibold text-emerald-200/80 block">
                      Rate: ₹140/kg locked • GreenCycle Facility
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-emerald-100/90 font-medium">
                    <Building2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                    <span>
                      {language === 'hi' ? 'रीसाइक्लर भागीदार:' :
                       language === 'te' ? 'రీసైక్లర్ భాగస్వామి:' :
                       language === 'ta' ? 'மறுசுழற்சி பங்குதாரர்:' :
                       language === 'kn' ? 'ಮರುಬಳಕೆದಾರ ಪಾಲುದಾರ:' :
                       language === 'ml' ? 'റീസൈക്ലർ പങ്കാളി:' : 'Recycler Partner:'} <b className="text-white">GreenCycle Cherlapally</b> (4.2 km)
                    </span>
                  </div>

                  {/* Primary CTA Button: Trace Copper */}
                  <button
                    onClick={() => navigate('/handover/KC-00127')}
                    className="w-full py-4 bg-[#C86D2F] hover:bg-[#B85D19] text-white rounded-2xl font-black text-base sm:text-lg shadow-lg shadow-black/30 flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <span>{t('confirmHandoverBtn')}</span>
                    <ArrowRight className="w-5 h-5 stroke-[3]" />
                  </button>
                </div>

                {/* Right QR Box (5 cols) */}
                <div
                  onClick={() => navigate('/handover/KC-00127')}
                  className="md:col-span-5 flex flex-col items-center justify-center pt-2 md:pt-0 cursor-pointer group"
                >
                  <div className="p-4 bg-white rounded-3xl shadow-lg border-2 border-emerald-600/40 group-hover:border-[#C86D2F] transition-colors w-full max-w-[220px]">
                    <div className="aspect-square bg-slate-900 rounded-2xl flex flex-col items-center justify-center p-3 relative overflow-hidden text-center">
                      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400" />
                      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400" />
                      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400" />
                      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400" />

                      <QrCode className="w-16 h-16 text-emerald-400 mb-1" />
                      <span className="font-mono text-[10px] font-black text-emerald-200 tracking-wider uppercase">
                        TAP TO SCAN
                      </span>
                    </div>
                    <p className="text-center text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-2">
                      Code: 5521 • Signed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Button for Mobile / Instant Sell */}
            <div className="lg:hidden">
              <button
                onClick={() => navigate('/sell')}
                className="w-full py-4 bg-[#C86D2F] hover:bg-[#B85D19] text-white rounded-2xl font-black text-base shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-5 h-5" />
                <span>{t('sellEWastePrimaryBtn')}</span>
              </button>
            </div>

            {/* 3. RECENT ACTIVITIES: CERTIFIED SETTLEMENT LEDGER */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <div>
                  <h2 className="font-black text-base sm:text-lg text-[#121820]">
                    {language === 'hi' ? 'हाल ही के कार्य' :
                     language === 'te' ? 'ఇటీవలి లావాదేవీలు' :
                     language === 'ta' ? 'சமீபத்திய நடவடிக்கைகள்' :
                     language === 'kn' ? 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆಗಳು' :
                     language === 'ml' ? 'സമീപകാല പ്രവർത്തനങ്ങൾ' : 'Recent Activities'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Verified CPCB settlement trail</p>
                </div>
                <button
                  onClick={() => navigate('/transactions')}
                  className="text-xs font-bold text-[#0F3D2E] hover:underline cursor-pointer"
                >
                  {t('viewAll')}
                </button>
              </div>

              <div className="space-y-2.5">
                {(earnings?.recentTransactions && earnings.recentTransactions.length > 0
                  ? earnings.recentTransactions.slice(0, 3)
                  : [
                      {
                        id: 'tx_001',
                        lotId: 'KC-00126',
                        material: 'PCB',
                        date: '2026-03-02',
                        amount: 1950,
                        status: 'Completed'
                      },
                      {
                        id: 'tx_002',
                        lotId: 'KC-00125',
                        material: 'Copper Cable',
                        date: '2026-02-27',
                        amount: 4000,
                        status: 'Completed'
                      }
                    ]
                ).map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => navigate(`/lot/${tx.lotId}`)}
                    className="flex items-center justify-between p-3.5 bg-[#F6F8F6] hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 bg-emerald-100 text-[#0F3D2E] rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0">
                        ✓
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">{tx.lotId}</span>
                          <span className="text-sm font-black text-[#121820]">{getMaterialName(tx.material, language)}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {tx.status} • {tx.date}
                        </p>
                      </div>
                    </div>
                    <span className="font-black font-mono text-[#0F3D2E] text-base">
                      +{formatINR(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Column (4 Cols on desktop) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* 2. TODAY'S SCRAP RATES: WEIGHBRIDGE TERMINAL TICKER */}
            <div className="bg-[#121820] text-white rounded-3xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                      {t('todayPrices')}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Hyderabad Terminal Index</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    CPCB Live
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'mat_pcb', fallbackName: 'PCB (Circuit Boards)', rate: '125', tag: 'High Yield' },
                    { id: 'mat_cable', fallbackName: 'Copper Wire & Cable', rate: '520', tag: 'Pure Non-Ferrous' },
                    { id: 'mat_battery', fallbackName: 'Lithium Battery', rate: '95', tag: 'Hazard Class IX' },
                    { id: 'mat_lcd', fallbackName: 'LCD Display Unit', rate: '70', tag: 'Mercury Contained' }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate('/sell')}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{getMaterialName(item.id, language)}</span>
                        <span className="text-[10px] font-semibold text-slate-400">{item.tag}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black font-mono text-emerald-400">
                          ₹{item.rate}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">/kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. SAFETY & COMPLIANCE: DISTINCT CAUTION AMBER HARNESS */}
            <div className="bg-white rounded-3xl p-6 border-2 border-amber-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-[#D97706] flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-950">
                      {t('safetyTitle')}
                    </h3>
                    <p className="text-[10px] text-amber-800 font-semibold">Mandatory CPCB guidelines</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/safety')}
                  className="text-xs text-[#0F3D2E] font-bold hover:underline cursor-pointer"
                >
                  {t('viewAll')}
                </button>
              </div>

              {/* Safety Cards: Formally distinct from action cards */}
              <div className="space-y-2.5">
                <div
                  onClick={() => navigate('/safety')}
                  className="p-3 bg-amber-50/70 hover:bg-amber-100/70 border-l-4 border-l-[#D97706] border border-amber-200/60 rounded-xl flex items-start gap-3 cursor-pointer transition-colors"
                >
                  <span className="text-base">🔋</span>
                  <div className="text-xs">
                    <p className="font-extrabold text-amber-950">{t('batterySafetyTitle')}</p>
                    <p className="text-amber-800/90 text-[11px] mt-0.5">
                      {t('batterySafetyDesc')}
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/safety')}
                  className="p-3 bg-amber-50/70 hover:bg-amber-100/70 border-l-4 border-l-[#D97706] border border-amber-200/60 rounded-xl flex items-start gap-3 cursor-pointer transition-colors"
                >
                  <span className="text-base">🚫</span>
                  <div className="text-xs">
                    <p className="font-extrabold text-amber-950">{t('cableSafetyTitle')}</p>
                    <p className="text-amber-800/90 text-[11px] mt-0.5">
                      {t('cableSafetyDesc')}
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/safety')}
                  className="p-3 bg-emerald-50/70 hover:bg-emerald-100/70 border-l-4 border-l-[#0F3D2E] border border-emerald-200/60 rounded-xl flex items-start gap-3 cursor-pointer transition-colors"
                >
                  <span className="text-base">🛡️</span>
                  <div className="text-xs">
                    <p className="font-extrabold text-emerald-950">{t('recyclingTitle')}</p>
                    <p className="text-emerald-800/90 text-[11px] mt-0.5">
                      {t('recyclingDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

