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
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header
        title={t('earningsTitle')}
        showBack
        onBack={() => navigate('/home')}
      />

      <main className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Total Earnings Hero Banner */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-200 block mb-1">
            {t('totalEarningsLabel')}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-3">
            {formatINR(totalEarnings)}
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            <span>100% Direct Payouts Received</span>
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* 1. This Month */}
          <Card padding="sm" className="bg-white text-center border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              {t('thisMonthLabel')}
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 block mt-1">
              {formatINR(thisMonth)}
            </span>
          </Card>

          {/* 2. Completed Transactions */}
          <Card padding="sm" className="bg-white text-center border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              {t('completedLotsLabel')}
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 block mt-1">
              {completedTransactions}
            </span>
          </Card>

          {/* 3. Total E-Waste Kg */}
          <Card padding="sm" className="bg-white text-center border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              {t('totalWasteLabel')}
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 block mt-1">
              {totalWasteKg} kg
            </span>
          </Card>
        </div>

        {/* Green Impact Certificate Card */}
        <Card variant="highlight" className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 p-4 border-2 border-emerald-400">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
              {t('environmentalImpact')}
            </h3>
          </div>
          <div className="space-y-1 text-xs font-bold text-emerald-900">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{t('co2Saved')}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{t('toxicPrevented')}</span>
            </p>
          </div>
        </Card>

        {/* Recent Payouts */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-extrabold text-slate-900">
              {t('recentActivity')}
            </h3>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
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
                className="bg-white flex items-center justify-between border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => navigate(`/lot/${tx.lotId}`)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{tx.lotId}</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {tx.material} ({tx.weightKg} kg)
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{tx.recyclerName} • {tx.status}</span>
                </div>
                <span className="text-base font-black text-emerald-700">+{formatINR(tx.amount)}</span>
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
