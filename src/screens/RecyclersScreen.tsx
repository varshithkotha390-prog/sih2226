import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { RecyclerCard } from '../components/RecyclerCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useLanguage } from '../i18n/LanguageContext';
import { useSellFlow } from '../context/SellFlowContext';
import { getRecommendedRecyclers } from '../services/recyclingService';
import { Recycler } from '../types';

export const RecyclersScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { state, setSelectedRecycler } = useSellFlow();

  const [recyclers, setRecyclers] = useState<Recycler[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const weightKg = state.weightKg || 15;

  const loadRecyclers = () => {
    setIsLoading(true);
    setHasError(false);
    getRecommendedRecyclers(state.materialId, weightKg)
      .then((data) => {
        setRecyclers(data || []);
        setIsLoading(false);
      })
      .catch(() => {
        setHasError(true);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadRecyclers();
  }, [state.materialId, weightKg]);

  const handleSelectRecycler = (rec: Recycler) => {
    setSelectedRecycler(rec);
    navigate(`/recycler/${rec.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <Header title={t('recyclersTitle')} showBack onBack={() => navigate('/price')} />

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-xl mx-auto px-4 sm:px-6 py-5 space-y-4"
      >
        {/* Step indicator: Stage 3 - Choose Recycler */}
        <ProgressIndicator currentStage={3} />

        {/* Section Heading */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('recyclersSubtitle')}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
            Verified formal units in Hyderabad providing doorstep pickup & digital receipts.
          </p>
        </div>

        {/* Loading / Error / Recycler Cards List */}
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <LoadingState
              message={language === 'hi' ? 'पुनर्चक्रणकर्ताओं की खोज...' : 'Finding best authorized recyclers...'}
              submessage={language === 'hi' ? 'उच्चतम दरों का मिलान किया जा रहा है' : 'Matching highest rates and nearest certified facilities'}
            />
          </div>
        ) : hasError || recyclers.length === 0 ? (
          <ErrorState
            title={language === 'hi' ? 'कोई पुनर्चक्रणकर्ता नहीं मिला' : 'No Recyclers Found'}
            message={
              language === 'hi'
                ? 'इस क्षेत्र में कोई उपलब्ध पुनर्चक्रणकर्ता नहीं मिला। कृपया पुनः प्रयास करें।'
                : 'Unable to load recycler offers at this time. Please try again.'
            }
            onRetry={loadRecyclers}
            retryLabel={language === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}
          />
        ) : (
          <div className="space-y-3.5">
            {recyclers.map((rec, idx) => (
              <RecyclerCard
                key={rec.id}
                recycler={rec}
                weightKg={weightKg}
                isRecommended={idx === 0} // GreenCycle is first and visually highlighted
                onSelect={handleSelectRecycler}
              />
            ))}
          </div>
        )}

        {/* Informational reassurance */}
        <div className="bg-slate-100/90 p-4 rounded-2xl border border-slate-200 flex items-start gap-3 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <p>
            All recyclers listed are state-certified. Payouts are transferred immediately upon physical verification.
          </p>
        </div>
      </motion.main>
    </div>
  );
};
