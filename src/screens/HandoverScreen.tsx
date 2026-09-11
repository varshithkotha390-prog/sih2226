import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { QRCard } from '../components/QRCard';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { LoadingState } from '../components/LoadingState';
import { useLanguage } from '../i18n/LanguageContext';
import { useSellFlow } from '../context/SellFlowContext';
import { getLot, confirmHandover } from '../services/recyclingService';
import { DigitalLot } from '../types';

export const HandoverScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { state, setActiveLot } = useSellFlow();

  const [lot, setLot] = useState<DigitalLot | null>(state.activeLot);
  const [isLoading, setIsLoading] = useState(!state.activeLot);
  const [isConfirming, setIsConfirming] = useState(false);

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
        <Header title={t('handoverTitle')} showBack onBack={() => navigate(-1)} />
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
          <LoadingState
            message={language === 'hi' ? 'हस्तांतरण QR कोड तैयार किया जा रहा है...' : 'Generating cryptographic QR manifest...'}
            submessage={language === 'hi' ? 'पुनर्चक्रणकर्ता सत्यापन के लिए तैयार' : 'Ready for authorized recycler scanner'}
          />
        </div>
      </div>
    );
  }

  const handleConfirmHandover = async () => {
    setIsConfirming(true);
    const updatedLot = await confirmHandover(lot.id);
    setActiveLot(updatedLot);
    setIsConfirming(false);
    navigate(`/success/${lot.id}`);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-28">
      <Header
        title={t('handoverTitle')}
        showBack
        onBack={() => navigate(`/lot/${lot.id}`)}
      />

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-xl mx-auto px-4 sm:px-6 py-5 space-y-4"
      >
        {/* Step indicator: Stage 4 - Handover */}
        <ProgressIndicator currentStage={4} />

        {/* Helper Subtitle */}
        <p className="text-xs sm:text-sm text-slate-600 font-medium text-center leading-relaxed">
          {t('handoverSubtitle')}
        </p>

        {/* LARGE QR CODE CARD */}
        <QRCard
          lotId={lot.id}
          materialName={lot.materialName}
          weightKg={lot.weightKg}
          payoutAmount={lot.recyclerPayout}
          collectorName={lot.collectorName}
          recyclerName={lot.recyclerName}
          location={lot.location}
          qrValue={lot.qrPayload}
        />

        {/* VERIFICATION CHECKLIST */}
        <Card variant="default" className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0F3D2E]" />
              <span>{t('verificationHeader')}</span>
            </h4>
            <span className="text-xs font-mono font-bold text-[#0F3D2E] bg-[#0F3D2E]/10 px-2.5 py-0.5 rounded-full border border-[#0F3D2E]/20">
              4/4 Ready
            </span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm font-semibold text-slate-800">
            <div className="flex items-center gap-2.5 text-slate-900 bg-[#0F3D2E]/5 p-2.5 rounded-xl border border-[#0F3D2E]/15">
              <CheckCircle2 className="w-4 h-4 text-[#0F3D2E] flex-shrink-0" />
              <span>{t('stepLotCreated')}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-900 bg-[#0F3D2E]/5 p-2.5 rounded-xl border border-[#0F3D2E]/15">
              <CheckCircle2 className="w-4 h-4 text-[#0F3D2E] flex-shrink-0" />
              <span>{t('stepMaterialRecorded')}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-900 bg-[#0F3D2E]/5 p-2.5 rounded-xl border border-[#0F3D2E]/15">
              <CheckCircle2 className="w-4 h-4 text-[#0F3D2E] flex-shrink-0" />
              <span>{t('stepWeightRecorded')}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-900 bg-[#0F3D2E]/5 p-2.5 rounded-xl border border-[#0F3D2E]/15">
              <CheckCircle2 className="w-4 h-4 text-[#0F3D2E] flex-shrink-0" />
              <span>{t('stepRecyclerSelected')}</span>
            </div>
          </div>

          {/* Current Status */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <span className="text-xs font-black text-amber-950 flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300">
              <Clock className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Awaiting Recycler Confirmation</span>
            </span>
          </div>
        </Card>

        {/* PRIMARY ACTION: Confirm Handover */}
        <div className="pt-2">
          <Button
            onClick={handleConfirmHandover}
            variant="primary"
            size="xl"
            isLoading={isConfirming}
            icon={<CheckCircle2 className="w-6 h-6 text-white" />}
            iconPosition="left"
            className="py-4 text-base font-black tracking-wide"
          >
            {t('confirmHandoverBtn')}
          </Button>
          <p className="text-center text-xs font-medium text-slate-500 mt-2">
            {t('handoverHelper')}
          </p>
        </div>
      </motion.main>
    </div>
  );
};
