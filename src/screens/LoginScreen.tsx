import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Phone, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { useLanguage } from '../i18n/LanguageContext';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, toggleLanguage } = useLanguage();
  const [mobile, setMobile] = useState('98490 12345');
  const [pin, setPin] = useState('1234');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/home');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F3D2E] via-[#0b2b20] to-[#121820] text-white flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar with SIH Badge & Language Switch */}
      <div className="flex items-center justify-between pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121820]/60 border border-emerald-500/40 text-xs font-mono font-bold tracking-wider text-emerald-100">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{t('sihBadge')}</span>
        </div>

        <button
          type="button"
          onClick={toggleLanguage}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer"
        >
          {language === 'en' ? 'हिन्दी' : 'English'}
        </button>
      </div>

      {/* Main Content Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        {/* Emblem & Branding */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white/10 border-2 border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-2xl mb-4 backdrop-blur-sm">
            <ShieldCheck className="w-12 h-12 stroke-[2.2]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {t('appName')}
          </h1>
          <p className="text-sm font-medium text-emerald-100/80 mt-1 max-w-xs mx-auto">
            {t('tagline')}
          </p>
        </div>

        {/* Form Card */}
        <Card variant="elevated" className="bg-[#F6F8F6] text-slate-900 p-6 sm:p-7 shadow-2xl rounded-3xl border border-white/40">
          <div className="mb-5 text-center">
            <h2 className="text-xl font-black text-[#121820]">{t('loginTitle')}</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {t('loginSubtitle')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label={t('enterMobile')}
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder={t('mobilePlaceholder')}
              prefixIcon={<Phone className="w-5 h-5 text-[#0F3D2E]" />}
              inputSize="lg"
              required
            />

            <Input
              label={t('enterPin')}
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              inputSize="lg"
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="xl"
                isLoading={isLoading}
                icon={<ArrowRight className="w-6 h-6" />}
                iconPosition="right"
              >
                {t('loginBtn')}
              </Button>
            </div>
          </form>

          {/* Preloaded Demo Profile Hint */}
          <div className="mt-5 p-3.5 rounded-2xl bg-emerald-950/5 border border-emerald-800/20 text-left flex items-start gap-2.5">
            <UserCheck className="w-5 h-5 text-[#0F3D2E] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-[#0F3D2E]">
                {t('demoNotice')}
              </p>
              <p className="text-[11px] text-[#0F3D2E]/80 mt-0.5">
                Role: Informal Collector • Direct CPCB Formal Market Link
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer Disclaimer */}
      <div className="text-center py-2 max-w-sm mx-auto">
        <p className="text-[11px] text-emerald-200/50 leading-relaxed">
          {t('termsAccept')}
        </p>
      </div>
    </div>
  );
};
