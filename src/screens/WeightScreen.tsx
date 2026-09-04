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
    <div className="min-h-screen bg-slate-50 pb-28">
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
        <div className="bg-white p-4 rounded-3xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg border border-emerald-200">
              PCB
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Selected Material
              </span>
              <h3 className="text-xl font-black text-slate-900">{materialName}</h3>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            ₹125/kg Index
          </span>
        </div>

        {/* Big Weight Input Card */}
        <Card variant="elevated" className="p-6 text-center border-2 border-slate-200 bg-white">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1">
            {t('approxWeight')}
          </span>

          {/* Stepper and Big Input */}
          <div className="flex items-center justify-center gap-3 my-4">
            <button
              type="button"
              onClick={() => adjustWeight(-1)}
              className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 flex items-center justify-center text-2xl font-black transition-colors cursor-pointer border-2 border-slate-300 flex-shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/25"
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
                className="w-full text-center text-4xl sm:text-5xl font-black text-slate-950 bg-slate-50 py-3 px-2 rounded-2xl border-2 border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/25 shadow-inner"
              />
              <span className="absolute right-3.5 bottom-4 text-sm font-black text-slate-500 pointer-events-none">
                kg
              </span>
            </div>

            <button
              type="button"
              onClick={() => adjustWeight(1)}
              className="w-14 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center text-2xl font-black transition-colors cursor-pointer shadow-xs flex-shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/25"
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
                  className={`min-h-[44px] py-2 px-2 rounded-xl text-xs sm:text-sm font-black border-2 transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/25 ${
                    parseFloat(weight) === preset
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
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
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 flex items-start gap-3 text-left">
          <Info className="w-5 h-5 text-emerald-800 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-semibold text-emerald-950 leading-relaxed">
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
            className="shadow-sm py-4 text-base font-black tracking-wide"
          >
            {t('continueToPrice')}
          </Button>
        </div>
      </motion.main>
    </div>
  );
};
