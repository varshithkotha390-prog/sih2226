import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  Package,
  Calendar,
  Leaf,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingState } from '../components/LoadingState';
import { useLanguage } from '../i18n/LanguageContext';
import { getEarnings } from '../services/recyclingService';
import { formatINR } from '../utils/formatters';
import { EarningsSummary } from '../types';

export const EarningsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getEarnings().then((data) => {
      setEarnings(data);
      setIsLoading(false);
    });
  }, []);

  const totalEarnings = earnings?.totalEarnings ?? 0;
  const thisMonth = earnings?.thisMonth ?? 0;
  const completedTransactions = earnings?.completedTransactions ?? 0;
  const totalWasteKg = earnings?.totalWasteKg ?? 0;

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-24">
      <Header
        title={t('earningsTitle')}
        showBack
        onBack={() => navigate('/home')}
      />

      <main className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Total Earnings Hero Banner */}
        <div className="bg-[#0F3D2E] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-emerald-800/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-200/90 block mb-1">
              {t('totalEarningsLabel')}
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60">
              Direct Bank / UPI
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-3 font-mono">
            {formatINR(totalEarnings)}
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-emerald-100 border border-white/15 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>100% Direct Payouts Received</span>
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* 1. This Month */}
          <Card padding="sm" className="bg-white text-center border border-slate-200/90 rounded-2xl shadow-sm">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {t('thisMonthLabel')}
            </span>
            <span className="text-base sm:text-lg font-black text-[#121820] block mt-1 font-mono">
              {formatINR(thisMonth)}
            </span>
          </Card>

          {/* 2. Completed Transactions */}
          <Card padding="sm" className="bg-white text-center border border-slate-200/90 rounded-2xl shadow-sm">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {t('completedLotsLabel')}
            </span>
            <span className="text-base sm:text-lg font-black text-[#121820] block mt-1 font-mono">
              {completedTransactions}
            </span>
          </Card>

          {/* 3. Total E-Waste Kg */}
          <Card padding="sm" className="bg-white text-center border border-slate-200/90 rounded-2xl shadow-sm">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {t('totalWasteLabel')}
            </span>
            <span className="text-base sm:text-lg font-black text-[#121820] block mt-1 font-mono">
              {totalWasteKg} <span className="text-xs font-semibold text-slate-500 font-mono">kg</span>
            </span>
          </Card>
        </div>

        {/* Green Impact Certificate Card */}
        <Card variant="default" className="bg-emerald-950/5 p-4 border border-emerald-800/20 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-[#0F3D2E]" />
            <h3 className="text-xs sm:text-sm font-black text-[#0F3D2E] uppercase tracking-wider">
              {t('environmentalImpact')}
            </h3>
          </div>
          <div className="space-y-1.5 text-xs font-bold text-[#0F3D2E]">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F3D2E]" />
              <span>{t('co2Saved')}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F3D2E]" />
              <span>{t('toxicPrevented')}</span>
            </p>
          </div>
        </Card>

        {/* Recent Payouts */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-black text-[#121820]">
              {t('recentActivity')}
            </h3>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs font-bold text-[#0F3D2E] hover:underline cursor-pointer"
            >
              {t('viewAll')}
            </button>
          </div>

          <div className="space-y-2.5">
            {(earnings?.recentTransactions?.filter(
              (tx) => tx.status.toLowerCase() === 'completed'
            ).slice(0, 3) || []).map((tx) => (
              <Card
                key={tx.id}
                padding="sm"
                className="bg-white flex items-center justify-between border border-slate-200/90 rounded-2xl cursor-pointer hover:border-[#0F3D2E]/40 hover:shadow-sm transition-all"
                onClick={() => navigate(`/lot/${tx.lotId}`)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#0F3D2E] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">{tx.lotId}</span>
                    <span className="text-sm font-black text-[#121820]">
                      {tx.material} <span className="font-mono text-xs text-slate-500 font-bold">({tx.weightKg} kg)</span>
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{tx.recyclerName} • {tx.status}</span>
                </div>
                <span className="text-base font-black text-[#0F3D2E] font-mono tracking-tight">+{formatINR(tx.amount)}</span>
              </Card>
            ))}
          </div>
        </div>

        {/* Sell Button CTA */}
        <div className="pt-2">
          <Button
            onClick={() => navigate('/sell')}
            variant="primary"
            size="lg"
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
          >
            {t('sellEWastePrimaryBtn')}
          </Button>
        </div>
      </main>
    </div>
  );
};
