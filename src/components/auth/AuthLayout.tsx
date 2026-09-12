import React from 'react';
import { ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector';
import { ThemeToggle } from '../ThemeToggle';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showDemoSwitcher?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showDemoSwitcher = false
}) => {
  const { t } = useLanguage();
  const { quickDemoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F3D2E] via-[#0B261D] to-[#121820] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative selection:bg-emerald-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar with SIH Badge & Language Selector */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between gap-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-emerald-500/30 text-xs font-mono font-bold tracking-wider text-emerald-100">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('sihBadge')}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle variant="compact" />
          <LanguageSelector variant="compact" />
        </div>
      </header>

      {/* Center Main Stage */}
      <main className="relative z-10 w-full max-w-lg mx-auto my-auto py-6 sm:py-8">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-white/10 border-2 border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-2xl mb-4 backdrop-blur-md">
            <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {t('appName')}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-emerald-100/80 mt-1 max-w-xs mx-auto">
            {t('tagline')}
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60">
          {title && (
            <div className="mb-6 text-center">
              <h2 className="text-xl sm:text-2xl font-black text-[#121820] tracking-tight">{title}</h2>
              {subtitle && <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">{subtitle}</p>}
            </div>
          )}

          {children}

          {/* Quick Demo Switcher for Evaluation */}
          {showDemoSwitcher && (
            <div className="mt-6 pt-5 border-t border-slate-100 text-left">
              <div className="flex items-center gap-1.5 mb-2.5">
                <UserCheck className="w-4 h-4 text-[#0F3D2E]" />
                <span className="text-xs font-black text-slate-700 tracking-wide uppercase">
                  {t('demoNotice')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                {t('demoNoticeDesc')}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => quickDemoLogin('user')}
                  className="px-2 py-2 rounded-xl bg-emerald-950/5 hover:bg-emerald-950/10 border border-emerald-800/20 text-[#0F3D2E] text-xs font-extrabold text-center transition-all cursor-pointer"
                >
                  {t('demoCollector')}
                </button>
                <button
                  type="button"
                  onClick={() => quickDemoLogin('recycler')}
                  className="px-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-extrabold text-center transition-all cursor-pointer"
                >
                  {t('demoRecycler')}
                </button>
                <button
                  type="button"
                  onClick={() => quickDemoLogin('admin')}
                  className="px-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-extrabold text-center transition-all cursor-pointer"
                >
                  {t('demoAdmin')}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="relative z-10 text-center py-2 max-w-md mx-auto">
        <p className="text-[11px] text-emerald-200/60 leading-relaxed">
          {t('termsAccept')}
        </p>
      </footer>
    </div>
  );
};
