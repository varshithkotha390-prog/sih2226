import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export interface ProgressIndicatorProps {
  currentStage?: 1 | 2 | 3 | 4; // 1: Identify, 2: Estimate, 3: Choose Recycler, 4: Handover
  currentStep?: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStage,
  currentStep,
  className = ''
}) => {
  const { language } = useLanguage();

  // Resolve stage from currentStage or fallback from legacy step
  const activeStage: 1 | 2 | 3 | 4 =
    currentStage ??
    (currentStep === 1 || currentStep === 2
      ? 1
      : currentStep === 3 || currentStep === 4
      ? 2
      : currentStep === 5
      ? 3
      : 4);

  const stages = [
    { number: 1, titleEn: 'Identify', titleHi: 'पहचानें' },
    { number: 2, titleEn: 'Estimate', titleHi: 'अनुमान' },
    { number: 3, titleEn: 'Choose Recycler', titleHi: 'रीसाइक्लर' },
    { number: 4, titleEn: 'Handover', titleHi: 'हस्तांतरण' }
  ];

  return (
    <div className={`w-full max-w-xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs mb-4 ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute left-6 right-6 top-3.5 h-0.5 bg-slate-200 -z-0" />

        {/* Active progress connector line */}
        <div
          className="absolute left-6 top-3.5 h-0.5 bg-emerald-600 transition-all duration-500 ease-out -z-0"
          style={{
            width: `${((activeStage - 1) / (stages.length - 1)) * 100}%`
          }}
        />

        {stages.map((stage) => {
          const isCompleted = stage.number < activeStage;
          const isCurrent = stage.number === activeStage;
          const label = language === 'hi' ? stage.titleHi : stage.titleEn;

          return (
            <div key={stage.number} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-emerald-700 text-white ring-4 ring-emerald-100 shadow-sm'
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : stage.number}
              </div>

              <span
                className={`text-[11px] font-bold mt-1.5 transition-colors text-center whitespace-nowrap ${
                  isCurrent
                    ? 'text-emerald-800 font-extrabold'
                    : isCompleted
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
