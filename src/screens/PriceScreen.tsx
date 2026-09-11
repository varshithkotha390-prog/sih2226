import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { PriceCard } from '../components/PriceCard';
import { useLanguage } from '../i18n/LanguageContext';
import { useSellFlow } from '../context/SellFlowContext';
import { mockMaterials } from '../services/mockData';
import { checkPriceAnomaly } from '../services/recyclingService';

export const PriceScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { state } = useSellFlow();

  const weightKg = state.weightKg || 15;
  const materialKey = state.materialId || state.materialName || 'PCB';

  // Benchmark values dynamically matched from mockData / today's verified rates
  const material =
    mockMaterials.find(
      (m) =>
        m.id === state.materialId ||
        m.name.toLowerCase().includes(materialKey.toLowerCase()) ||
        materialKey.toLowerCase().includes(m.name.split(' ')[0].toLowerCase())
    ) || mockMaterials[0];

  const materialName = material.name.split(' (')[0];
  const minPrice = material.minPrice;
  const maxPrice = material.maxPrice;
  const avgPrice = material.avgPricePerKg;
  const estimatedValue = Math.round(weightKg * avgPrice);

  // Recycler offer rate (supports query param ?offer=... for test overrides or state)
  const queryOffer = searchParams.get('offer') || searchParams.get('rate');
  const bestOfferRate = queryOffer
    ? Number(queryOffer)
    : (state.selectedRecycler?.offerPerKg ?? (material.id === 'mat_pcb' ? 140 : Math.round(avgPrice * 1.1)));

  const bestOfferPayout = Math.round(weightKg * bestOfferRate);
  const bestOfferBonus = Math.max(0, bestOfferPayout - estimatedValue);

  // Anomaly check: flag if recycler offer or estimated price is below 60% of normal rate
  const anomaly = checkPriceAnomaly(material.id, bestOfferRate);
  const isAnomaly = anomaly.isAnomaly || (estimatedValue / weightKg) < (avgPrice * 0.6);

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-28">
      <Header title={t('priceTitle')} showBack onBack={() => navigate('/weight')} />

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-xl mx-auto px-4 sm:px-6 py-5 space-y-4"
      >
        {/* Step indicator: Stage 2 - Estimate */}
        <ProgressIndicator currentStage={2} />

        {/* Anomaly Detection Warning Banner */}
        {isAnomaly && (
          <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-950">
                ⚠️ Unusual price detected — this offer is below the fair market range for {materialName}.
              </p>
              <p className="text-xs text-amber-900 mt-1 font-medium">
                Fair market rate is <span className="font-mono font-bold">₹{avgPrice}/kg</span>. Offers below <span className="font-mono font-bold">₹{Math.round(avgPrice * 0.6)}/kg</span> (60% threshold) are flagged for collector protection.
              </p>
            </div>
          </div>
        )}

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
          recommendedRecyclerName={state.selectedRecycler?.name || 'GreenCycle'}
        />

        {/* CPCB Certification Guarantee note */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 flex items-center gap-3 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-[#0F3D2E] flex-shrink-0" />
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
            className="py-4 text-base font-black tracking-wide"
          >
            {t('viewBestOffers')}
          </Button>
        </div>
      </motion.main>
    </div>
  );
};
