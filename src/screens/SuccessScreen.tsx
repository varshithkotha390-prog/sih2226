import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Home,
  Receipt,
  ShieldCheck,
  Building2,
  Package,
  Sparkles
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useLanguage } from '../i18n/LanguageContext';
import { useSellFlow } from '../context/SellFlowContext';
import { getLot } from '../services/recyclingService';
import { formatINR } from '../utils/formatters';
import { DigitalLot } from '../types';

export const SuccessScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { state, resetFlow } = useSellFlow();

  const [lot, setLot] = useState<DigitalLot | null>(state.activeLot);
  const lotId = id || 'KC-00127';

  useEffect(() => {
    // Fire festive celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    getLot(lotId).then((res) => {
      if (res) setLot(res);
    });
  }, [lotId]);

  const payoutAmount = lot ? lot.recyclerPayout : 2100;
  const materialName = lot ? lot.materialName : 'PCB';
  const weightKg = lot ? lot.weightKg : 15;
  const recyclerName = lot ? lot.recyclerName : 'GreenCycle';

  const handleBackHome = () => {
    resetFlow();
    navigate('/home');
  };

  const handleViewTransaction = () => {
    navigate('/transactions');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 flex flex-col justify-between">
      <Header title={t('appName')} showLanguageToggle={true} />

      <motion.main
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-xl mx-auto px-4 sm:px-6 py-6 w-full space-y-4 my-auto"
      >
        {/* Success Icon & Header */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center border-2 border-emerald-200">
            <CheckCircle className="w-12 h-12 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ✓ {t('successTitle')}
          </h2>

          <p className="text-sm sm:text-base font-semibold text-slate-600">
            {t('paymentRecorded')}
          </p>
        </div>

        {/* Payout Hero Card */}
        <div className="bg-emerald-800 text-white p-6 rounded-3xl text-center shadow-sm space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-200 block">
            Total Payout Disbursed
          </span>
          <h1 className="text-5xl font-black tracking-tight my-1">
            {formatINR(payoutAmount)}
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-900/60 text-xs font-bold text-emerald-100 border border-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Instant Bank / UPI Transfer Settled</span>
          </div>
        </div>

        {/* Lot Breakdown Details Card */}
        <Card variant="default" className="p-5 bg-white border-2 border-slate-200 rounded-3xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase">Lot Number</span>
            <span className="text-sm font-mono font-black text-slate-900">{lotId}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 py-1">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Material</span>
              <span className="text-base font-black text-slate-900">{materialName}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 block">Verified Weight</span>
              <span className="text-base font-black text-slate-900">{weightKg} kg</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Authorized Recycler:</span>
            <span className="text-sm font-black text-emerald-800 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              {recyclerName}
            </span>
          </div>
        </Card>

        {/* Action Buttons: View Transaction & Back to Home */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={handleViewTransaction}
            variant="primary"
            size="xl"
            icon={<Receipt className="w-6 h-6" />}
            iconPosition="left"
            className="shadow-sm py-4 text-base font-black tracking-wide"
          >
            {t('viewTransactionBtn')}
          </Button>

          <Button
            onClick={handleBackHome}
            variant="outline"
            size="lg"
            icon={<Home className="w-5 h-5" />}
            iconPosition="left"
            className="py-3.5 text-slate-800 font-bold border-2 border-slate-300 hover:bg-slate-100"
          >
            {t('backToHomeBtn')}
          </Button>
        </div>
      </motion.main>

      <footer className="text-center text-xs text-slate-400 py-2">
        SIH 2026 • Formal E-Waste Digital Verification System
      </footer>
    </div>
  );
};
