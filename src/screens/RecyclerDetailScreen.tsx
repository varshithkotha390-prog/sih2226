import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { LoadingState } from '../components/LoadingState';
import { useLanguage } from '../i18n/LanguageContext';
import { useSellFlow } from '../context/SellFlowContext';
import { getRecycler, createLot } from '../services/recyclingService';
import { formatINR } from '../utils/formatters';
import { Recycler } from '../types';
import { getMaterialName } from '../services/mockData';

export const RecyclerDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { state, setSelectedRecycler, setActiveLot } = useSellFlow();

  const [recycler, setRecycler] = useState<Recycler | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weightKg = state.weightKg || 15;
  const materialName = state.materialName || 'PCB';

  useEffect(() => {
    setIsLoading(true);
    getRecycler(id || 'rec_greencycle').then((res) => {
      setRecycler(res);
      if (res) {
        setSelectedRecycler(res);
      }
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading || !recycler) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header title={t('recyclerDetailTitle')} showBack onBack={() => navigate('/recyclers')} />
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
          <LoadingState
            message={
              language === 'hi' ? 'पुनर्चक्रणकर्ता का विवरण लोड हो रहा है...' :
              language === 'te' ? 'రీసైక్లర్ వివరాలు లోడ్ అవుతున్నాయి...' :
              language === 'ta' ? 'மறுசுழற்சியாளர் சான்றுகள் ஏற்றப்படுகின்றன...' :
              language === 'kn' ? 'ಮರುಬಳಕೆದಾರರ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...' :
              language === 'ml' ? 'റീസൈക്ലർ വിശദാംശങ്ങൾ ലോഡ് ചെയ്യുന്നു...' :
              'Loading recycler credentials...'
            }
            submessage={
              language === 'hi' ? 'प्रमाणपत्रों और दरों की पुष्टि की जा रही है' :
              language === 'te' ? 'CPCB లైసెన్సులు మరియు ధరల ధృవీకరణ' :
              language === 'ta' ? 'சிபிசிபி உரிமங்கள் மற்றும் விகிதங்களை சரிபார்க்கிறது' :
              language === 'kn' ? 'CPCB ಪರವಾನಗಿಗಳು ಮತ್ತು ದರಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ' :
              language === 'ml' ? 'CPCB ലൈസൻസുകളും നിരക്കുകളും പരിശോധിക്കുന്നു' :
              'Verifying CPCB licenses and offer rates'
            }
          />
        </div>
      </div>
    );
  }

  const offerRate = recycler.offerPerKg;
  const estimatedPayout = Math.round(weightKg * offerRate);

  const handleSelectRecycler = async () => {
    setIsSubmitting(true);
    const newLot = await createLot({
      materialId: state.materialId,
      materialName: state.materialName,
      materialCategory: state.materialCategory,
      weightKg,
      recyclerId: recycler.id,
      recyclerName: recycler.name,
      recyclerOfferPerKg: offerRate
    });

    setActiveLot(newLot);
    setIsSubmitting(false);
    navigate(`/lot/${newLot.id}`);
  };

  const acceptedMaterialsList = recycler.acceptedMaterials.map((mat) => getMaterialName(mat, language));

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-28">
      <Header
        title={t('recyclerDetailTitle')}
        showBack
        onBack={() => navigate('/recyclers')}
      />

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-xl mx-auto px-4 sm:px-6 py-5 space-y-4"
      >
        {/* Step indicator: Stage 3 - Choose Recycler */}
        <ProgressIndicator currentStage={3} />

        {/* Recycler Hero Card */}
        <Card variant="elevated" className="border border-slate-200/90 p-5 bg-white space-y-4 rounded-2xl shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900">{recycler.name}</h2>
                <Badge variant="emerald" size="sm">
                  {recycler.matchScore}% Match
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{recycler.distanceKm} km away • {recycler.address}</span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-xl bg-[#0F3D2E]/10 text-[#0F3D2E] flex items-center justify-center font-black text-lg flex-shrink-0 border border-[#0F3D2E]/20">
              {recycler.rating} ★
            </div>
          </div>

          {/* Badges: Authorized Recycler & Pickup Available */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
            {recycler.isAuthorized && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#0F3D2E]/10 text-[#0F3D2E] px-3 py-1 rounded-xl border border-[#0F3D2E]/25">
                <ShieldCheck className="w-4 h-4 text-[#0F3D2E]" />
                <span>{t('authorizedRecyclerBadge')}</span>
              </span>
            )}
            {recycler.hasPickup && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-900 px-3 py-1 rounded-xl border border-blue-200">
                <Truck className="w-4 h-4 text-blue-700" />
                <span>{t('pickupAvailable')}</span>
              </span>
            )}
          </div>

          {/* License */}
          <p className="text-xs font-mono font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            {t('cpcbLicense', { license: recycler.licenseNumber })}
          </p>
        </Card>

        {/* Accepted Materials */}
        <Card variant="default" className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-2.5">
            {t('acceptedMaterialsLabel')}
          </span>
          <div className="flex flex-wrap gap-2">
            {acceptedMaterialsList.map((item, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200"
              >
                {item}
              </span>
            ))}
          </div>
        </Card>

        {/* Payout Calculation Card - Command Center */}
        <div className="bg-[#0F3D2E] text-white p-5 rounded-2xl space-y-3 shadow-lg shadow-emerald-950/20 border border-emerald-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-200">
              {t('currentMaterialOffer', { material: materialName })}
            </span>
            <span className="text-base font-mono font-black text-white">₹{offerRate}/kg</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-200">{t('totalWeightLabel')}</span>
            <span className="text-base font-mono font-black text-white">{weightKg} kg</span>
          </div>

          <div className="pt-3 border-t border-emerald-800/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase text-emerald-200 block">
                {t('totalPayoutLabel')}
              </span>
              <span className="text-3xl sm:text-4xl font-mono font-black text-white">
                {formatINR(estimatedPayout)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-200 bg-white/10 px-2.5 py-1 rounded-lg border border-white/20 shadow-xs">
                Instant UPI / Cash
              </span>
            </div>
          </div>
        </div>

        {/* PRIMARY ACTION: Select Recycler */}
        <div className="pt-2">
          <Button
            onClick={handleSelectRecycler}
            variant="primary"
            size="xl"
            isLoading={isSubmitting}
            icon={<ArrowRight className="w-6 h-6" />}
            iconPosition="right"
            className="py-4 text-base font-black tracking-wide"
          >
            {t('selectRecyclerBtn')}
          </Button>
        </div>
      </motion.main>
    </div>
  );
};
