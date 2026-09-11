import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Scale, ArrowRight, Plus, Minus, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { useLanguage } from '../i18n/LanguageContext';
import { useSellFlow } from '../context/SellFlowContext';

export const WeightScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { state, setWeightKg } = useSellFlow();

  const [weight, setWeight] = useState<string>(String(state.weightKg || 15));

  const materialName = state.materialName || 'PCB';

  const handleWeightChange = (val: string) => {
    // Only allow numbers and one decimal
    if (/^\d*\.?\d*$/.test(val)) {
      setWeight(val);
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        setWeightKg(num);
      }
    }
  };

  const adjustWeight = (delta: number) => {
    const current = parseFloat(weight) || 0;
    const next = Math.max(1, Math.round((current + delta) * 10) / 10);
    setWeight(String(next));
    setWeightKg(next);
  };

  const handleContinue = () => {
    const finalWeight = parseFloat(weight) || 15;
    setWeightKg(finalWeight);
    navigate('/price');
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-28">
      <Header title={t('weightTitle')} showBack onBack={() => navigate('/detect')} />

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-xl mx-auto px-4 sm:px-6 py-5 space-y-4"
      >
        {/* Step indicator: Stage 2 - Estimate */}
        <ProgressIndicator currentStage={2} />

        {/* Selected Material Header Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0F3D2E]/10 text-[#0F3D2E] flex items-center justify-center font-black text-lg border border-[#0F3D2E]/20">
              PCB
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Selected Material
              </span>
              <h3 className="text-xl font-black text-slate-900">{materialName}</h3>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#0F3D2E] bg-[#0F3D2E]/5 px-2.5 py-1 rounded-lg border border-[#0F3D2E]/20">
            ₹125/kg Index
          </span>
        </div>

        {/* Big Weight Input Card */}
        <Card variant="elevated" className="p-6 text-center border-2 border-slate-200 bg-white rounded-2xl shadow-xs">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1">
            {t('approxWeight')}
          </span>

          {/* Stepper and Big Input */}
          <div className="flex items-center justify-center gap-3 my-4">
            <button
              type="button"
              onClick={() => adjustWeight(-1)}
              className="w-14 h-14 rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 flex items-center justify-center text-2xl font-black transition-colors cursor-pointer border-2 border-slate-300 flex-shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0F3D2E]/25"
              aria-label="Decrease weight"
            >
              <Minus className="w-6 h-6 stroke-[3]" />
            </button>

            <div className="relative flex-1 max-w-[200px]">
              <input
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={(e) => handleWeightChange(e.target.value)}
                aria-label="Weight in kilograms"
                className="w-full text-center text-4xl sm:text-5xl font-mono font-black text-slate-950 bg-slate-50 py-3 px-2 rounded-2xl border-2 border-[#0F3D2E] focus:outline-none focus:ring-4 focus:ring-[#0F3D2E]/25 shadow-inner"
              />
              <span className="absolute right-3.5 bottom-4 text-sm font-mono font-black text-slate-500 pointer-events-none">
                kg
              </span>
            </div>

            <button
              type="button"
              onClick={() => adjustWeight(1)}
              className="w-14 h-14 rounded-2xl bg-[#C86D2F] hover:bg-[#B85D19] active:bg-[#A35014] text-white flex items-center justify-center text-2xl font-black transition-colors cursor-pointer shadow-md shadow-orange-950/20 flex-shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C86D2F]/25 active:scale-95"
              aria-label="Increase weight"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Quick Add Presets for Informal Collectors */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-600 block mb-2.5">
              {t('quickWeightAdd')}
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 25].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setWeight(String(preset));
                    setWeightKg(preset);
                  }}
                  className={`min-h-[44px] py-2 px-2 rounded-xl text-xs sm:text-sm font-mono font-black border-2 transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0F3D2E]/25 ${
                    parseFloat(weight) === preset
                      ? 'bg-[#0F3D2E] text-white border-[#0F3D2E] shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {preset} kg
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Accuracy Tip */}
        <div className="bg-[#0F3D2E]/5 p-4 rounded-2xl border border-[#0F3D2E]/20 flex items-start gap-3 text-left">
          <Info className="w-5 h-5 text-[#0F3D2E] flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
            {t('weightAccuracyTip')}
          </p>
        </div>

        {/* PRIMARY ACTION: Continue to Price Estimate */}
        <div className="pt-2">
          <Button
            onClick={handleContinue}
            variant="primary"
            size="xl"
            icon={<ArrowRight className="w-6 h-6" />}
            iconPosition="right"
            className="py-4 text-base font-black tracking-wide"
          >
            {t('continueToPrice')}
          </Button>
        </div>
      </motion.main>
    </div>
  );
};
