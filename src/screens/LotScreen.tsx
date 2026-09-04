import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FileText,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { LoadingState } from '../components/LoadingState';
import { useLanguage } from '../i18n/LanguageContext';
import { useSellFlow } from '../context/SellFlowContext';
import { getLot } from '../services/recyclingService';
import { formatINR } from '../utils/formatters';
import { DigitalLot } from '../types';

export const LotScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { state, setActiveLot } = useSellFlow();

  const [lot, setLot] = useState<DigitalLot | null>(state.activeLot);
  const [isLoading, setIsLoading] = useState(!state.activeLot);

  const lotId = id || 'KC-00127';

  useEffect(() => {
    getLot(lotId).then((res) => {
      if (res) {
        setLot(res);
        setActiveLot(res);
      }
      setIsLoading(false);
    });
  }, [lotId]);

  if (isLoading || !lot) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header title={t('lotTitle')} showBack onBack={() => navigate('/recyclers')} />
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
          <LoadingState
            message={language === 'hi' ? 'डिजिटल लॉट तैयार किया जा रहा है...' : 'Generating formal digital lot manifest...'}
            submessage={language === 'hi' ? 'सीपीसीबी अनुपालन और वजन रिकॉर्ड सुरक्षित किया जा रहा है' : 'Securing CPCB compliance and weight logs'}
          />
        </div>
      </div>
    );
  }

  const handleProceedToHandover = () => {
    navigate(`/handover/${lot.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <Header
        title={t('lotTitle')}
        showBack
        onBack={() => navigate('/recyclers')}
      />

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-xl mx-auto px-4 sm:px-6 py-5 space-y-4"
      >
        {/* Step indicator: Stage 4 - Handover */}
        <ProgressIndicator currentStage={4} />

        {/* Lot Header Badge */}
        <div className="bg-emerald-800 text-white p-5 rounded-3xl shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>SIH Digital Manifest</span>
            </span>
            <StatusBadge status={lot.status === 'awaiting_handover' ? 'Pending' : lot.status} />
          </div>

          <div className="pt-1">
            <span className="text-xs font-bold text-emerald-200">Lot Identifier</span>
            <h2 className="text-3xl font-black font-mono tracking-tight text-white">
              {lot.id}
            </h2>
          </div>

          <p className="text-xs text-emerald-100/90 font-medium">
            Timestamped: {lot.createdAt}
          </p>
        </div>

        {/* Detailed Breakdown Card */}
        <Card variant="elevated" className="border-2 border-slate-200 p-5 bg-white space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
            {t('lotDetails')}
          </h3>

          {/* Material & Weight */}
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-500 block">Material</span>
              <span className="text-lg font-black text-slate-900">{lot.materialName}</span>
              <span className="text-xs font-semibold text-slate-500 block">{lot.materialCategory}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 block">Logged Weight</span>
              <span className="text-lg font-black text-slate-900">{lot.weightKg} kg</span>
              <span className="text-xs text-emerald-700 font-bold">Verified digital tare</span>
            </div>
          </div>

          {/* Price Comparisons */}
          <div className="space-y-2 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between text-sm sm:text-base">
              <span className="font-semibold text-slate-600">{t('marketEstimateLabel')}</span>
              <span className="font-bold text-slate-800">{formatINR(lot.marketEstimate)}</span>
            </div>

            <div className="flex items-center justify-between text-sm sm:text-base">
              <span className="font-bold text-emerald-900">{t('recyclerOfferLabel')}</span>
              <span className="font-black text-emerald-700 text-lg">
                {formatINR(lot.recyclerPayout)}
              </span>
            </div>

            {lot.bonusAmount > 0 && (
              <div className="bg-emerald-50 px-3.5 py-2 rounded-xl flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-800 border border-emerald-200">
                <span>Authorized Fair Bonus:</span>
                <span>+₹{lot.bonusAmount}</span>
              </div>
            )}
          </div>

          {/* Stakeholders: Collector & Recycler */}
          <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">{t('collectorLabel')}</span>
              <span className="font-bold text-slate-900">{lot.collectorName} ({lot.collectorPhone})</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">{t('recyclerLabel')}</span>
              <span className="font-bold text-slate-900">{lot.recyclerName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">{t('locationLabel')}</span>
              <span className="font-bold text-slate-900">{lot.location}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-slate-500">{t('statusLabel')}</span>
              <span className="font-black text-amber-700">{t('awaitingHandover')}</span>
            </div>
          </div>
        </Card>

        {/* PRIMARY ACTION: Create Digital Lot / Proceed to QR Handover */}
        <div className="pt-2">
          <Button
            onClick={handleProceedToHandover}
            variant="primary"
            size="xl"
            icon={<QrCode className="w-6 h-6" />}
            iconPosition="left"
            className="shadow-sm py-4 text-base font-black tracking-wide"
          >
            {t('createLotBtn')}
          </Button>
          <p className="text-center text-xs font-medium text-slate-500 mt-2">
            Opens secure QR code for authorized recycler scan
          </p>
        </div>
      </motion.main>
    </div>
  );
};
