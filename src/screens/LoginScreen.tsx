import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Phone,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  UserCheck,
  Building2,
  Shield,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  X,
  HelpCircle
} from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { useAuth, DEMO_CREDENTIALS, normalizePhoneNumber } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { sendOtp, verifyOtp, loginWithDemo } = useAuth();

  // Screen State
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobile, setMobile] = useState('98490 12345');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState<UserRole | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Navigate to appropriate landing screen according to user role
  const routeByRole = (role?: UserRole) => {
    if (role === 'admin') {
      navigate('/admin-dashboard', { replace: true });
    } else if (role === 'recycler') {
      navigate('/recycler-dashboard', { replace: true });
    } else {
      navigate('/home', { replace: true });
    }
  };

  // Step 1: Send OTP to Phone
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formatted = normalizePhoneNumber(mobile);
    if (!formatted || formatted.length < 10) {
      setErrorMsg(language === 'hi' ? 'कृपया सही 10-अंकों का मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(mobile, language);
      if (res.success) {
        setStep('otp');
        setResendCooldown(60);
        // Pre-populate demo OTP hint for seamless testing
        if (!otp) setOtp('123456');
      } else {
        setErrorMsg(res.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err: unknown) {
      setErrorMsg('Network error. You can continue using demo credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (otp.trim().length < 6) {
      setErrorMsg(language === 'hi' ? 'कृपया 6-अंकों का ओटीपी कोड दर्ज करें' : 'Please enter the complete 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyOtp(mobile, otp);
      if (res.success) {
        routeByRole(res.role);
      } else {
        setErrorMsg(res.error || 'Invalid OTP code. For testing, use: 123456');
      }
    } catch (err: unknown) {
      setErrorMsg('Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await sendOtp(mobile, language);
      if (res.success) {
        setResendCooldown(60);
      } else {
        setErrorMsg(res.error || 'Could not resend code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Tap Demo Quick-Login Handler
  const handleDemoQuickLogin = async (demoRole: UserRole) => {
    setErrorMsg(null);
    setActiveDemoRole(demoRole);
    try {
      const creds = DEMO_CREDENTIALS[demoRole];
      setMobile(creds.phone);
      setOtp(creds.otp);

      const res = await loginWithDemo(demoRole);
      if (res.success) {
        routeByRole(res.role || demoRole);
      } else {
        setErrorMsg(res.error || 'Could not log in with demo account.');
      }
    } catch (err) {
      console.warn('Demo login error:', err);
      routeByRole(demoRole);
    } finally {
      setActiveDemoRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F3D2E] via-[#0b2b20] to-[#121820] text-white flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Bar with SIH Badge & Language Switch */}
      <div className="flex items-center justify-between pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121820]/60 border border-emerald-500/40 text-xs font-mono font-bold tracking-wider text-emerald-100">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{t('sihBadge')}</span>
        </div>

        <button
          type="button"
          onClick={() => setShowLangModal(true)}
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-sm shadow-sm"
          title="Select Language / भाषा चुनें"
        >
          <span>{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.flag || '🌐'}</span>
          <span>{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.native || 'English'}</span>
          <span className="text-[10px] text-emerald-300 font-mono">▼</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        {/* Emblem & Branding */}
        <div className="text-center mb-6">
          <div className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-white/10 border-2 border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-2xl mb-3.5 backdrop-blur-sm">
            <ShieldCheck className="w-11 h-11 sm:w-12 sm:h-12 stroke-[2.2]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {t('appName')}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-emerald-100/80 mt-1 max-w-xs mx-auto">
            {t('tagline')}
          </p>
        </div>

        {/* Form Card */}
        <Card variant="elevated" className="bg-[#F6F8F6] text-slate-900 p-6 sm:p-7 shadow-2xl rounded-3xl border border-white/40">
          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {step === 'phone' ? (
            /* STEP 1: Phone Number Entry */
            <div>
              <div className="mb-5 text-center">
                <h2 className="text-xl font-black text-[#121820]">{t('loginTitle')}</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {t('loginSubtitle')}
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <Input
                  label={t('enterMobile')}
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder={t('mobilePlaceholder')}
                  prefixIcon={<Phone className="w-5 h-5 text-[#0F3D2E]" />}
                  inputSize="lg"
                  required
                  autoFocus
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
                    {t('sendOtpBtn')}
                  </Button>
                </div>

                <div className="pt-3 text-center border-t border-slate-100 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(true)}
                    className="text-xs font-bold text-slate-600 hover:text-[#0F3D2E] transition-colors inline-flex items-center gap-1.5 cursor-pointer py-0.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>{t('troubleLoggingIn')}</span>
                  </button>
                  <p className="text-[11px] text-slate-500 leading-snug mt-1.5 max-w-xs mx-auto">
                    {t('troubleLoggingInDesc')}
                  </p>
                </div>
              </form>
            </div>
          ) : (
            /* STEP 2: OTP Verification */
            <div>
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setErrorMsg(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F3D2E] hover:text-emerald-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('changePhone')}</span>
                </button>
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                  Step 2 of 2
                </span>
              </div>

              <div className="mb-5 text-center">
                <h2 className="text-xl font-black text-[#121820]">{t('enterOtp')}</h2>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  {t('otpSubtitle', { phone: mobile })}
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    prefixIcon={<KeyRound className="w-5 h-5 text-[#0F3D2E]" />}
                    inputSize="xl"
                    className="tracking-[0.4em] font-mono text-center text-2xl"
                    required
                    autoFocus
                  />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Test OTP: <strong>123456</strong></span>
                    </span>

                    {resendCooldown > 0 ? (
                      <span className="text-slate-400 font-medium text-[11px]">
                        {t('resendIn', { seconds: resendCooldown })}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="font-bold text-[#0F3D2E] hover:underline text-[11px] inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{t('resendOtp')}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="xl"
                    isLoading={isLoading}
                    icon={<ShieldCheck className="w-6 h-6" />}
                    iconPosition="right"
                  >
                    {t('verifyOtpBtn')}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* 1-Tap Quick Evaluator Demo Access Section (Tier 2) */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('demoQuickAccess')}</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                1-TAP
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Ramesh - Collector */}
              <button
                type="button"
                onClick={() => handleDemoQuickLogin('collector')}
                disabled={isLoading || activeDemoRole !== null}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white hover:bg-emerald-50/80 active:bg-emerald-100/60 border border-slate-200/90 hover:border-emerald-500 transition-all text-center shadow-xs cursor-pointer disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-950/10 text-[#0F3D2E] flex items-center justify-center mb-1">
                  {activeDemoRole === 'collector' ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#0F3D2E]" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs font-black text-slate-900 leading-tight">
                  Ramesh
                </span>
                <span className="text-[10px] text-emerald-700 font-bold mt-0.5">
                  Collector
                </span>
              </button>

              {/* GreenCycle - Recycler */}
              <button
                type="button"
                onClick={() => handleDemoQuickLogin('recycler')}
                disabled={isLoading || activeDemoRole !== null}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white hover:bg-orange-50/80 active:bg-orange-100/60 border border-slate-200/90 hover:border-orange-500 transition-all text-center shadow-xs cursor-pointer disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-950/10 text-[#C86D2F] flex items-center justify-center mb-1">
                  {activeDemoRole === 'recycler' ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#C86D2F]" />
                  ) : (
                    <Building2 className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs font-black text-slate-900 leading-tight">
                  GreenCycle
                </span>
                <span className="text-[10px] text-[#C86D2F] font-bold mt-0.5">
                  Recycler
                </span>
              </button>

              {/* CPCB Admin */}
              <button
                type="button"
                onClick={() => handleDemoQuickLogin('admin')}
                disabled={isLoading || activeDemoRole !== null}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white hover:bg-purple-50/80 active:bg-purple-100/60 border border-slate-200/90 hover:border-purple-500 transition-all text-center shadow-xs cursor-pointer disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-950/10 text-purple-700 flex items-center justify-center mb-1">
                  {activeDemoRole === 'admin' ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-700" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs font-black text-slate-900 leading-tight">
                  CPCB
                </span>
                <span className="text-[10px] text-purple-700 font-bold mt-0.5">
                  Admin
                </span>
              </button>
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

      {/* Account Recovery / Lost Access Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{t('lostSimHelpTitle')}</h3>
                  <p className="text-xs text-slate-500 font-medium">Passwordless Phone Security & Recovery</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {t('lostSimHelpDesc')}
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-[#0F3D2E]">
                <Phone className="w-4 h-4" />
                <span>{t('cpcbHelpline')}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Toll-free national e-waste compliance and collector grievance desk, active 9:00 AM – 6:00 PM IST.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setShowRecoveryModal(false)}
              className="w-full"
            >
              {t('done')}
            </Button>
          </div>
        </div>
      )}

      {/* 6-Language Selection Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#0F3D2E] flex items-center justify-center text-xl shadow-xs">
                  🌐
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Choose Language / भाषा चुनें</h3>
                  <p className="text-xs text-slate-500 font-medium">Select your regional native script</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLangModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto py-1">
              {SUPPORTED_LANGUAGES.map((langOpt) => {
                const isSelected = language === langOpt.code;
                return (
                  <button
                    key={langOpt.code}
                    type="button"
                    onClick={() => {
                      setLanguage(langOpt.code);
                      setShowLangModal(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/90 border-2 border-[#0F3D2E] text-[#0F3D2E] shadow-sm'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/90 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-base">{langOpt.flag}</span>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
                          {langOpt.code}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-base font-black leading-tight tracking-tight text-slate-900">
                        {langOpt.native}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                        {langOpt.label}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {langOpt.state}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setShowLangModal(false)}
                className="w-full"
              >
                {t('done')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

