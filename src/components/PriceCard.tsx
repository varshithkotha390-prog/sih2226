import React from 'react';
import { TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { Card } from './Card';
import { formatINR } from '../utils/formatters';
import { useLanguage } from '../i18n/LanguageContext';

export interface PriceCardProps {
  materialName: string;
  weightKg: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  estimatedValue: number;
  bestOfferRate?: number;
  bestOfferPayout?: number;
  bestOfferBonus?: number;
  recommendedRecyclerName?: string;
  onViewOffers?: () => void;
}

export const PriceCard: React.FC<PriceCardProps> = ({
  materialName,
  weightKg,
  minPrice,
  maxPrice,
  avgPrice,
  estimatedValue,
  bestOfferRate,
  bestOfferPayout,
  bestOfferBonus,
  recommendedRecyclerName = 'GreenCycle',
  onViewOffers
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {/* Base Market Estimate */}
      <Card variant="default" className="border-slate-300 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {materialName}
            </span>
            <h3 className="text-xl font-black text-slate-900">{weightKg} kg</h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 block">
              {t('marketRangeLabel')}
            </span>
            <span className="text-sm font-black text-slate-700">
              ₹{minPrice}–₹{maxPrice}/kg
            </span>
          </div>
        </div>

        {/* Visual Slider / Range Meter */}
        <div className="my-4 pt-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
            <span>Min: ₹{minPrice}/kg</span>
            <span className="text-emerald-800 font-bold">Avg: ₹{avgPrice}/kg</span>
            <span>Max: ₹{maxPrice}/kg</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 relative border border-slate-200">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: '68%' }}
            />
            <div
              className="absolute top-0 bottom-0 w-3 bg-slate-900 rounded-full shadow-xs -ml-1 border-2 border-white"
              style={{ left: '60%' }}
            />
          </div>
        </div>

        {/* Estimated Value */}
        <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-200">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">{t('estimatedValueLabel')}</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{formatINR(estimatedValue)}</p>
          </div>
          <span className="text-xs font-medium text-slate-500 max-w-[140px] text-right">
            {t('marketFormula')}
          </span>
        </div>
      </Card>

      {/* Better Offer Highlight */}
      {bestOfferRate && bestOfferPayout && (
        <Card variant="highlight" className="bg-emerald-50/70 border-2 border-emerald-500 p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5 fill-current" />
              </span>
              <div>
                <span className="text-xs font-extrabold text-emerald-800 tracking-wider uppercase block">
                  {t('betterOfferAlert')}
                </span>
                <h4 className="text-lg font-black text-slate-900">
                  {recommendedRecyclerName}
                </h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-600 block">{t('recyclerOfferRate')}</span>
              <span className="text-lg font-black text-emerald-700">₹{bestOfferRate}/kg</span>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-600 block">{t('estimatedPayout')}</span>
              <span className="text-3xl font-black text-emerald-800">
                {formatINR(bestOfferPayout)}
              </span>
            </div>
            {bestOfferBonus && (
              <div className="text-right bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-xs">
                <span className="text-xs font-black text-emerald-700 flex items-center gap-1 justify-end">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +₹{bestOfferBonus}
                </span>
                <span className="text-xs font-semibold text-slate-600 block">
                  vs market rate
                </span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
