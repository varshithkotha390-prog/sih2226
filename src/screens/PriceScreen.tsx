import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { PriceCard } from '../components/PriceCard';
import { useLanguage } from '../i18n/LanguageContext';
import { useSellFlow } from '../context/SellFlowContext';

export const PriceScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { state } = useSellFlow();

  const weightKg = state.weightKg || 15;
  const materialName = state.materialName || 'PCB';

  // Benchmark values
  const minPrice = 110;
  const maxPrice = 145;
  const avgPrice = 125;
  const estimatedValue = Math.round(weightKg * avgPrice); // ₹1,875 for 15kg

  // GreenCycle authorized offer
  const bestOfferRate = 140;
  const bestOfferPayout = Math.round(weightKg * bestOfferRate); // ₹2,100 for 15kg
  const bestOfferBonus = Math.max(0, bestOfferPayout - estimatedValue); // +₹225

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <Header title={t('priceTitle')} showBack onBack={() => navigate('/weight')} />

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-xl mx-auto px-4 sm:px-6 py-5 space-y-4"
      >
        {/* Step indicator: Stage 2 - Estimate */}
        <ProgressIndicator currentStage={2} />

        {/* Pricing Breakdown & Better Offer Card */}
        <PriceCard
          materialName={materialName}
          weightKg={weightKg}
          minPrice={minPrice}
          maxPrice={maxPrice}
          avgPrice={avgPrice}
          estimatedValue={estimatedValue}
          bestOfferRate={bestOfferRate}
          bestOfferPayout={bestOfferPayout}
          bestOfferBonus={bestOfferBonus}
          recommendedRecyclerName="GreenCycle"
        />

        {/* CPCB Certification Guarantee note */}
        <div className="bg-slate-100/90 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            Authorized rates are backed by formal CPCB recycling credits under the E-Waste Management Rules.
          </p>
        </div>

        {/* PRIMARY ACTION: View Best Recycler Offers */}
        <div className="pt-2">
          <Button
            onClick={() => navigate('/recyclers')}
            variant="primary"
            size="xl"
            icon={<ArrowRight className="w-6 h-6" />}
            iconPosition="right"
            className="shadow-sm py-4 text-base font-black tracking-wide"
          >
            {t('viewBestOffers')}
          </Button>
        </div>
      </motion.main>
    </div>
  );
};
