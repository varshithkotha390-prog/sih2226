import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BatteryWarning,
  Flame,
  Cpu,
  ShieldCheck,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useLanguage } from '../i18n/LanguageContext';

export const SafetyScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-24">
      <Header
        title={t('safetyTitle')}
        showBack
        onBack={() => navigate('/home')}
      />

      <main className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Banner */}
        <div className="bg-[#D97706] text-white p-5 rounded-3xl shadow-lg space-y-1 relative overflow-hidden border border-amber-600/40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            <h2 className="text-xl font-black tracking-tight">{t('safetyTitle')}</h2>
          </div>
          <p className="text-xs font-bold text-amber-100">
            {t('safetySubtitle')}
          </p>
        </div>

        {/* 1. Battery Safety */}
        <div className="p-4 bg-red-50/90 rounded-2xl border border-red-200/80 flex gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0 text-xl shadow-xs">
            🔋
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-red-950">
              {t('batterySafetyTitle')}
            </h3>
            <p className="text-xs text-red-700 font-black uppercase mt-0.5 tracking-wide">
              Do not burn or puncture. Handle with gloves.
            </p>
            <p className="text-xs text-red-900/80 leading-relaxed mt-1 font-medium">
              {t('batterySafetyDesc')}
            </p>
          </div>
        </div>

        {/* 2. Cable Safety / Wear Protection */}
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300/70 flex gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center flex-shrink-0 text-xl shadow-xs">
            🧤
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-amber-950">
              {t('cableSafetyTitle')}
            </h3>
            <p className="text-xs text-[#D97706] font-black uppercase mt-0.5 tracking-wide">
              Avoid open-air burning. Always use gloves.
            </p>
            <p className="text-xs text-amber-950/80 leading-relaxed mt-1 font-medium">
              {t('cableSafetyDesc')}
            </p>
          </div>
        </div>

        {/* 3. Electronic Components */}
        <div className="p-4 bg-blue-50/90 rounded-2xl border border-blue-200/80 flex gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 text-xl shadow-xs">
            ⚙️
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-blue-950">
              {t('componentSafetyTitle')}
            </h3>
            <p className="text-xs text-blue-700 font-black uppercase mt-0.5 tracking-wide">
              Handle carefully. Avoid inhalation of dust.
            </p>
            <p className="text-xs text-blue-900/80 leading-relaxed mt-1 font-medium">
              {t('componentSafetyDesc')}
            </p>
          </div>
        </div>

        {/* 4. Recycling - Authorized Only */}
        <div className="p-4 bg-emerald-950/5 rounded-2xl border border-emerald-800/20 flex gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/10 text-[#0F3D2E] flex items-center justify-center flex-shrink-0 text-xl shadow-xs">
            🏭
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#0F3D2E]">
              {t('recyclingTitle')}
            </h3>
            <p className="text-xs text-[#0F3D2E] font-black uppercase mt-0.5 tracking-wide">
              Authorized Only • Full formal payout guarantee
            </p>
            <p className="text-xs text-[#0F3D2E]/80 leading-relaxed mt-1 font-medium">
              {t('recyclingDesc')}
            </p>
          </div>
        </div>

        {/* Emergency Helpline */}
        <div className="p-4 rounded-2xl bg-[#121820] text-white flex items-center justify-between gap-3 shadow-md border border-slate-800">
          <div className="flex items-center gap-3">
            <PhoneCall className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-400">CPCB Waste Help Desk</p>
              <p className="text-sm sm:text-base font-black text-white font-mono tracking-wide">1800-11-0031 (Toll Free)</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/60">
            24x7
          </span>
        </div>
      </main>
    </div>
  );
};
