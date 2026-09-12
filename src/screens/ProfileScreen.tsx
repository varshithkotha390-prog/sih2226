import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Globe2,
  LogOut,
  Award,
  ChevronRight,
  ExternalLink,
  Building2,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ThemeToggle } from '../components/ThemeToggle';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { useAuth } from '../context/AuthContext';
import { mockUserProfile } from '../services/mockData';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { profile, role, signOut, updateLanguage, changePhoneNumber, verifyPhoneChange } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Phone Change & Account Recovery State
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [phoneChangeStep, setPhoneChangeStep] = useState<'input' | 'otp' | 'success'>('input');
  const [newPhone, setNewPhone] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [phoneChangeLoading, setPhoneChangeLoading] = useState(false);
  const [phoneChangeError, setPhoneChangeError] = useState<string | null>(null);
  const [phoneChangeSuccess, setPhoneChangeSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Lost Access / Help Modal State
  const [showRecoveryInfo, setShowRecoveryInfo] = useState(false);

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const activeProfile = profile || mockUserProfile;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.warn('Logout error:', err);
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSelectLanguage = async (newLang: typeof language) => {
    if (newLang === language) return;
    await updateLanguage(newLang);
  };

  // Phone Change & Account Recovery Handlers
  const handleStartPhoneChange = () => {
    setIsChangingPhone(true);
    setPhoneChangeStep('input');
    setNewPhone('');
    setOtpToken('');
    setPhoneChangeError(null);
    setPhoneChangeSuccess(null);
  };

  const handleCancelPhoneChange = () => {
    setIsChangingPhone(false);
    setPhoneChangeStep('input');
    setNewPhone('');
    setOtpToken('');
    setPhoneChangeError(null);
    setPhoneChangeSuccess(null);
  };

  const handleSendNewPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneChangeError(null);
    const cleaned = newPhone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setPhoneChangeError(language === 'hi' ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    setPhoneChangeLoading(true);
    try {
      const res = await changePhoneNumber(newPhone);
      if (res.success) {
        setPhoneChangeStep('otp');
        setResendCooldown(60);
        // Pre-populate test OTP in development/demo mode
        if (!otpToken) setOtpToken('123456');
      } else {
        setPhoneChangeError(res.error || 'Failed to send OTP to new number');
      }
    } catch (err: any) {
      setPhoneChangeError(err.message || 'Error requesting phone update');
    } finally {
      setPhoneChangeLoading(false);
    }
  };

  const handleVerifyNewPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneChangeError(null);
    if (otpToken.length !== 6) {
      setPhoneChangeError(language === 'hi' ? 'कृपया 6 अंकों का ओटीपी दर्ज करें' : 'Please enter the 6-digit OTP');
      return;
    }

    setPhoneChangeLoading(true);
    try {
      const res = await verifyPhoneChange(newPhone, otpToken);
      if (res.success) {
        setPhoneChangeStep('success');
        setPhoneChangeSuccess(t('phoneUpdatedSuccess'));
      } else {
        setPhoneChangeError(res.error || 'Invalid OTP code');
      }
    } catch (err: any) {
      setPhoneChangeError(err.message || 'Verification failed');
    } finally {
      setPhoneChangeLoading(false);
    }
  };

  const handleResendChangeOtp = async () => {
    if (resendCooldown > 0) return;
    setPhoneChangeError(null);
    setPhoneChangeLoading(true);
    try {
      const res = await changePhoneNumber(newPhone);
      if (res.success) {
        setResendCooldown(60);
      } else {
        setPhoneChangeError(res.error || 'Could not resend OTP');
      }
    } finally {
      setPhoneChangeLoading(false);
    }
  };

  const handleBack = () => {
    if (role === 'admin') {
      navigate('/admin-dashboard');
    } else if (role === 'recycler') {
      navigate('/recycler-dashboard');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-24 select-none">
      <Header
        title={t('profileTitle')}
        showBack
        onBack={handleBack}
      />

      <main className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* User Profile Card */}
        <Card variant="elevated" className="border border-slate-200/90 rounded-2xl p-5 bg-white space-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-[#0F3D2E] text-white flex items-center justify-center font-black text-2xl shadow-md flex-shrink-0 font-mono">
              {activeProfile.name ? activeProfile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#121820] truncate">
                  {activeProfile.name}
                </h2>
                <Badge variant={role === 'admin' ? 'purple' : role === 'recycler' ? 'orange' : 'emerald'} size="sm">
                  {role === 'admin' ? 'Admin' : role === 'recycler' ? 'Recycler' : 'Verified'}
                </Badge>
              </div>
              <p className="text-xs font-bold text-[#0F3D2E] flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F3D2E]" />
                <span className="truncate">{activeProfile.badge || activeProfile.role}</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Member since {activeProfile.memberSince || '2024'}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {t('phoneLabel')}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 font-mono">{activeProfile.phone}</span>
                <button
                  type="button"
                  onClick={handleStartPhoneChange}
                  className="text-[11px] font-bold text-[#0F3D2E] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>{t('changePhoneBtn')}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {t('assignedHub')}
              </span>
              <span className="font-bold text-slate-900">{activeProfile.location}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                Account Role
              </span>
              <span className="font-bold text-[#0F3D2E]">{activeProfile.role}</span>
            </div>
          </div>
        </Card>

        {/* Account Security & Recovery Card (Phone Change Flow) */}
        <Card variant="elevated" className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-950/10 text-[#0F3D2E] flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#121820]">{t('accountSecurityTitle')}</h3>
                <p className="text-[11px] text-slate-500 font-medium">Passwordless Phone + OTP Verification</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
              Active Key
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {t('accountSecurityDesc')}
          </p>

          {!isChangingPhone ? (
            <div className="pt-1 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleStartPhoneChange}
                icon={<Phone className="w-4 h-4" />}
                iconPosition="left"
                className="flex-1"
              >
                {t('changePhoneBtn')}
              </Button>

              <button
                type="button"
                onClick={() => setShowRecoveryInfo(true)}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('lostSimHelpTitle')}</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-black text-slate-900">
                    {phoneChangeStep === 'input' && 'Step 1: Enter New Phone Number'}
                    {phoneChangeStep === 'otp' && 'Step 2: Verify OTP Sent to New Number'}
                    {phoneChangeStep === 'success' && 'Verification Complete'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelPhoneChange}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {phoneChangeError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{phoneChangeError}</span>
                </div>
              )}

              {phoneChangeStep === 'input' && (
                <form onSubmit={handleSendNewPhoneOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('newPhoneLabel')}
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center gap-1.5 pointer-events-none">
                        <span className="text-base">🇮🇳</span>
                        <span className="text-xs font-bold text-slate-600 font-mono">+91</span>
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="98765 43210"
                        className="w-full pl-18 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:border-[#0F3D2E] focus:ring-1 focus:ring-[#0F3D2E] outline-none"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{t('currentPhoneLabel')}: <strong>{activeProfile.phone}</strong></span>
                      <span className="text-emerald-700 font-bold">10 digits</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{t('changePhoneTestingTip')}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-bold text-slate-500">Quick Test Numbers:</span>
                      <button
                        type="button"
                        onClick={() => setNewPhone('9876523456')}
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 border border-slate-300 transition-colors cursor-pointer"
                      >
                        98765 23456 (Suresh)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewPhone('9848034567')}
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 border border-slate-300 transition-colors cursor-pointer"
                      >
                        98480 34567 (Anil)
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={handleCancelPhoneChange}
                      className="flex-1"
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={phoneChangeLoading}
                      icon={<ArrowRight className="w-4 h-4" />}
                      iconPosition="right"
                      className="flex-1"
                    >
                      {t('sendChangeOtpBtn')}
                    </Button>
                  </div>
                </form>
              )}

              {phoneChangeStep === 'otp' && (
                <form onSubmit={handleVerifyNewPhoneOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('enterOtp')}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full py-2.5 text-center tracking-[0.4em] font-mono text-xl font-bold rounded-xl border border-slate-300 focus:border-[#0F3D2E] focus:ring-1 focus:ring-[#0F3D2E] outline-none"
                      required
                      autoFocus
                    />
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                        Test OTP: <strong>123456</strong>
                      </span>
                      {resendCooldown > 0 ? (
                        <span className="text-slate-400 text-[11px] font-medium">
                          {t('resendIn', { seconds: resendCooldown })}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendChangeOtp}
                          className="font-bold text-[#0F3D2E] hover:underline text-[11px] flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{t('resendOtp')}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={() => setPhoneChangeStep('input')}
                      className="flex-1"
                    >
                      {t('back')}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={phoneChangeLoading}
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      iconPosition="right"
                      className="flex-1"
                    >
                      {t('verifyChangeOtpBtn')}
                    </Button>
                  </div>
                </form>
              )}

              {phoneChangeStep === 'success' && (
                <div className="text-center py-2 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{t('phoneUpdatedSuccess')}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {t('phoneUpdatedSuccessSub', { phone: activeProfile.phone })}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleCancelPhoneChange}
                    className="w-full mt-2"
                  >
                    {t('done')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Language Selection Card with Supabase Persistence */}
        <Card variant="default" className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-[#0F3D2E]" />
              <div>
                <span className="text-sm font-black text-[#121820]">Application Language</span>
                <p className="text-[11px] text-slate-500">Choose your preferred vernacular language</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-[#0F3D2E] px-2 py-0.5 rounded border border-emerald-200">
              Synced to Cloud
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {SUPPORTED_LANGUAGES.map((langOpt) => {
              const isSelected = language === langOpt.code;
              return (
                <button
                  key={langOpt.code}
                  type="button"
                  onClick={() => handleSelectLanguage(langOpt.code)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50/90 border-[#0F3D2E] text-[#0F3D2E] shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{langOpt.flag}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#0F3D2E]" />}
                  </div>
                  <div className="mt-1">
                    <div className="text-sm font-black leading-tight">{langOpt.native}</div>
                    <div className="text-[10px] text-slate-500 font-medium truncate">{langOpt.label}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 pt-1">
            Currently active: <strong>{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.native} ({SUPPORTED_LANGUAGES.find((l) => l.code === language)?.label})</strong> • Automatically syncs with your Supabase profile.
          </p>
        </Card>

        {/* Display Mode / Theme Card */}
        <Card variant="default" className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-sm">
          <ThemeToggle variant="expanded" />
          <p className="text-xs text-slate-500">
            Switch between Light (daylight/outdoor), Normal (SIH brand mineral), and Dark (low-light technical charcoal) modes.
          </p>
        </Card>

        {/* Portals & Dashboards Card */}
        <Card variant="default" className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2.5 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-[#0F3D2E]" />
            <span className="text-sm font-black text-[#121820]">Platform Portals</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => navigate('/recycler-dashboard')}
              className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 hover:border-[#0F3D2E]/40 text-left transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-800 block">🏭 Recycler Dashboard</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Incoming & verified lots</span>
            </button>
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 hover:border-[#0F3D2E]/40 text-left transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-800 block">📊 Admin Dashboard</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">CPCB metrics & totals</span>
            </button>
          </div>
        </Card>

        {/* SIH Hackathon Meta */}
        <Card variant="default" className="p-4 bg-slate-100/80 border border-slate-200/80 rounded-2xl text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">{t('appVersion')}</p>
          <p className="text-slate-500">
            Smart India Hackathon 2026 Innovation Challenge • Problem Statement: Formalization of E-Waste Material Handover.
          </p>
        </Card>

        {/* Logout Button */}
        <div className="pt-2">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="lg"
            isLoading={isLoggingOut}
            icon={<LogOut className="w-5 h-5 text-rose-600" />}
            iconPosition="left"
            className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 active:scale-[0.99] cursor-pointer"
          >
            {t('logoutBtn')}
          </Button>
        </div>

        {/* Lost SIM / Physical Recovery Info Modal */}
        {showRecoveryInfo && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{t('lostSimHelpTitle')}</h3>
                    <p className="text-xs text-slate-500 font-medium">Informal Collector Identity Protection</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRecoveryInfo(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {t('lostSimHelpDesc')}
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Phone className="w-4 h-4 text-[#0F3D2E]" />
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
                onClick={() => setShowRecoveryInfo(false)}
                className="w-full"
              >
                {t('done')}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
