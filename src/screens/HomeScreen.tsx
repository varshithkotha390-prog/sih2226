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

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);

  useEffect(() => {
    getEarnings().then(setEarnings);
    getMaterials().then(setMaterials);
  }, []);

  const totalEarnings = earnings ? earnings.totalEarnings : 8450;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Mobile Top Header */}
      <div className="lg:hidden">
        <Header
          title={language === 'hi' ? 'डैशबोर्ड / Dashboard' : 'Dashboard / डैशबोर्ड'}
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

      {/* Desktop Clean Minimalism Sub-Header */}
      <div className="hidden lg:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-20">
        <h1 className="text-lg font-bold text-slate-800">
          {language === 'hi' ? 'डैशबोर्ड / Dashboard' : 'Dashboard / डैशबोर्ड'}
        </h1>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
              {t('totalEarningsLabel')}
            </span>
            <span className="text-xl font-black text-emerald-600">{formatINR(totalEarnings)}</span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <button
            onClick={() => navigate('/sell')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
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
            {/* Active Handover Card (Clean Minimalism Design) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                  <span>{language === 'hi' ? 'सक्रिय हस्तांतरण / Active Handover' : 'Active Handover / सक्रिय हस्तांतरण'}</span>
                </h2>
                <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  {t('awaitingHandover')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div
                    onClick={() => navigate('/lot/KC-00127')}
                    className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/80 transition-colors cursor-pointer group"
                  >
                    <div className="w-20 h-20 bg-slate-200 rounded-xl overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-emerald-50 flex flex-col items-center justify-center p-2 text-center">
                        <div className="text-[10px] font-bold text-emerald-600 uppercase">AI Matched</div>
                        <div className="text-lg font-black text-emerald-800">PCB</div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400">LOT ID: KC-00127</p>
                      <p className="text-lg font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                        Circuit Boards (15 kg)
                      </p>
                      <p className="text-emerald-600 font-black text-2xl mt-0.5">₹2,100</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-2 text-slate-600 text-sm">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p>
                      Recycler: <b className="text-slate-900">GreenCycle</b> (4.2 km)
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/handover/KC-00127')}
                    className="w-full py-3.5 sm:py-4 bg-emerald-900 hover:bg-emerald-950 text-white rounded-2xl font-bold text-base sm:text-lg shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-95"
                  >
                    <span>{t('confirmHandoverBtn')}</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>

                {/* QR Code Preview Box */}
                <div
                  onClick={() => navigate('/handover/KC-00127')}
                  className="flex flex-col items-center justify-center md:border-l md:border-slate-100 pt-4 md:pt-0 cursor-pointer group"
                >
                  <div className="p-4 bg-white border-4 border-slate-50 rounded-3xl shadow-inner group-hover:border-emerald-100 transition-colors">
                    <div className="w-44 h-44 bg-slate-100 flex items-center justify-center relative rounded-xl overflow-hidden">
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-slate-400" />
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-slate-400" />
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-slate-400" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-slate-400" />

                      <div className="grid grid-cols-4 gap-2 opacity-20">
                        <div className="w-6 h-6 bg-slate-900 rounded-sm" />
                        <div className="w-6 h-6 bg-slate-900 rounded-sm" />
                        <div className="w-6 h-6 bg-slate-900 rounded-sm" />
                        <div className="w-6 h-6 bg-slate-900 rounded-sm" />
                        <div className="w-6 h-6 bg-slate-900 rounded-sm" />
                        <div className="w-6 h-6 bg-slate-900 rounded-sm" />
                        <div className="w-6 h-6 bg-slate-900 rounded-sm" />
                        <div className="w-6 h-6 bg-slate-900 rounded-sm" />
                      </div>

                      <div className="absolute inset-0 flex flex-col items-center justify-center font-mono font-bold text-slate-500 text-[11px] text-center p-6 bg-slate-100/80">
                        <QrCode className="w-8 h-8 text-emerald-700 mb-1" />
                        <span>SCAN QR TO FINALIZE HANDOVER</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Verification Code: 5521
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Button for Mobile / Instant Sell */}
            <div className="lg:hidden">
              <Button
                onClick={() => navigate('/sell')}
                variant="primary"
                size="xl"
                icon={<Sparkles className="w-6 h-6 text-amber-300 fill-amber-300" />}
                iconPosition="left"
                className="shadow-md shadow-emerald-100 text-lg font-bold py-4"
              >
                {t('sellEWastePrimaryBtn')}
              </Button>
            </div>

            {/* Recent Activities (Clean Minimalism Design) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-slate-800">
                  {language === 'hi' ? 'हाल ही के कार्य / Recent Activities' : 'Recent Activities / हाल ही के कार्य'}
                </h2>
                <button
                  onClick={() => navigate('/transactions')}
                  className="text-emerald-600 text-xs font-bold hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  {t('viewAll')}
                </button>
              </div>

              <div className="space-y-3">
                {/* Activity 1 */}
                <div
                  onClick={() => navigate('/lot/KC-00126')}
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">KC-00126 | PCB</p>
                      <p className="text-xs text-slate-500">Completed • 24 Oct 2025</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800 text-base">+₹1,950</span>
                </div>

                {/* Activity 2 */}
                <div
                  onClick={() => navigate('/lot/KC-00125')}
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      ⚡
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">KC-00125 | Copper Cable</p>
                      <p className="text-xs text-slate-500">Completed • 22 Oct 2025</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800 text-base">+₹4,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side Column (4 Cols on desktop) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Today's Rates Card (Clean Minimalism Design) */}
            <div className="bg-emerald-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-emerald-100 font-bold text-sm uppercase tracking-widest">
                    {t('todayPrices')}
                  </h3>
                  <span className="text-[10px] font-bold bg-emerald-700/60 text-emerald-200 px-2 py-0.5 rounded-full">
                    Live
                  </span>
                </div>

                <div className="space-y-4">
                  <div
                    onClick={() => navigate('/sell')}
                    className="flex justify-between items-center border-b border-emerald-700 pb-2 cursor-pointer hover:opacity-90"
                  >
                    <span className="font-bold">PCB</span>
                    <span className="text-xl font-black">
                      ₹125 <small className="font-normal text-xs">/kg</small>
                    </span>
                  </div>

                  <div
                    onClick={() => navigate('/sell')}
                    className="flex justify-between items-center border-b border-emerald-700 pb-2 cursor-pointer hover:opacity-90"
                  >
                    <span className="font-bold">Copper</span>
                    <span className="text-xl font-black">
                      ₹520 <small className="font-normal text-xs">/kg</small>
                    </span>
                  </div>

                  <div
                    onClick={() => navigate('/sell')}
                    className="flex justify-between items-center border-b border-emerald-700 pb-2 cursor-pointer hover:opacity-90"
                  >
                    <span className="font-bold">Battery</span>
                    <span className="text-xl font-black">
                      ₹95 <small className="font-normal text-xs">/kg</small>
                    </span>
                  </div>

                  <div
                    onClick={() => navigate('/sell')}
                    className="flex justify-between items-center pb-2 cursor-pointer hover:opacity-90"
                  >
                    <span className="font-bold">LCD</span>
                    <span className="text-xl font-black">
                      ₹70 <small className="font-normal text-xs">/kg</small>
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative circle from Clean Minimalism design */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-700 rounded-full opacity-50 pointer-events-none" />
            </div>

            {/* Safety Tips Card (Clean Minimalism Design) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">
                  {language === 'hi' ? 'सुरक्षा टिप्स / Safety Tips' : 'Safety Tips / सुरक्षा टिप्स'}
                </h3>
                <button
                  onClick={() => navigate('/safety')}
                  className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  {t('viewAll')}
                </button>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => navigate('/safety')}
                  className="p-3 bg-red-50 rounded-xl flex gap-3 cursor-pointer hover:bg-red-100/70 transition-colors"
                >
                  <div className="text-xl">🔋</div>
                  <div>
                    <p className="text-sm font-bold text-red-900">Battery Safety</p>
                    <p className="text-xs text-red-700">Do not burn or puncture. Handle with gloves.</p>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/safety')}
                  className="p-3 bg-amber-50 rounded-xl flex gap-3 cursor-pointer hover:bg-amber-100/70 transition-colors"
                >
                  <div className="text-xl">🧤</div>
                  <div>
                    <p className="text-sm font-bold text-amber-900">Wear Protection</p>
                    <p className="text-xs text-amber-700">Always use gloves for sharp PCB edges.</p>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/safety')}
                  className="p-3 bg-emerald-50 rounded-xl flex gap-3 cursor-pointer hover:bg-emerald-100/70 transition-colors"
                >
                  <div className="text-xl">🏭</div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Authorized Only</p>
                    <p className="text-xs text-emerald-700">Only use formal recyclers for full payment.</p>
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
