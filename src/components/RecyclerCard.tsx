import React from 'react';
import { ShieldCheck, Truck, MapPin, Award, ArrowRight } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Recycler } from '../types';
import { formatINR } from '../utils/formatters';
import { useLanguage } from '../i18n/LanguageContext';

export interface RecyclerCardProps {
  recycler: Recycler;
  weightKg?: number;
  isRecommended?: boolean;
  onSelect: (recycler: Recycler) => void;
}

export const RecyclerCard: React.FC<RecyclerCardProps> = ({
  recycler,
  weightKg = 15,
  isRecommended = false,
  onSelect
}) => {
  const { t } = useLanguage();
  const estimatedPayout = Math.round(recycler.offerPerKg * weightKg);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(recycler)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(recycler);
        }
      }}
      className="cursor-pointer group select-none transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0F3D2E]/25 rounded-2xl"
    >
      <Card
        variant={isRecommended ? 'highlight' : 'default'}
        className={`relative overflow-hidden transition-all duration-200 rounded-2xl group-hover:shadow-md ${
          isRecommended ? 'border-2 border-[#0F3D2E] shadow-sm bg-white' : 'border border-slate-200/90 bg-white hover:border-slate-300'
        }`}
      >
        {isRecommended && (
          <div className="absolute top-0 right-0 bg-[#0F3D2E] text-white text-xs font-black uppercase tracking-wider py-1 px-3 rounded-bl-xl shadow-xs flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('bestChoice')}</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0F3D2E] transition-colors">
                {recycler.name}
              </h3>
              <span className="text-xs font-bold text-amber-500 flex items-center">
                ★ {recycler.rating}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('distanceAway', { distance: recycler.distanceKm })}</span>
            </div>
          </div>

          <div className="text-right pt-1">
            <Badge variant={isRecommended ? 'emerald' : 'blue'} size="sm">
              {t('matchScore', { score: recycler.matchScore })}
            </Badge>
          </div>
        </div>

        {/* Badges row: Authorized + Pickup */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          {recycler.isAuthorized && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#0F3D2E]/10 text-[#0F3D2E] px-2.5 py-1 rounded-lg border border-[#0F3D2E]/25">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F3D2E]" />
              <span>✓ {t('authorized')}</span>
            </span>
          )}
          {recycler.hasPickup ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200">
              <Truck className="w-3.5 h-3.5 text-blue-700" />
              <span>✓ {t('pickupAvailable')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
              {t('dropoffOnly')}
            </span>
          )}
        </div>

        {/* Pricing Block */}
        <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between border border-slate-200/90 group-hover:bg-[#0F3D2E]/5 transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase block">
              {t('recyclerOfferRate')}
            </span>
            <span className="text-base font-mono font-black text-slate-900">
              ₹{recycler.offerPerKg}/kg
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 uppercase block">
              {t('estimatedPayout')}
            </span>
            <span className="text-xl font-mono font-black text-[#0F3D2E]">
              {formatINR(estimatedPayout)}
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="mt-3.5">
          <div className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
            isRecommended
              ? 'bg-[#C86D2F] hover:bg-[#B85D19] text-white shadow-md shadow-orange-950/20'
              : 'bg-slate-100 text-slate-800 border border-slate-300 group-hover:bg-slate-200'
          }`}>
            <span>{t('selectRecyclerBtn')}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Card>
    </div>
  );
};
