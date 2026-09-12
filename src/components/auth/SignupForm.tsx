import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, ArrowRight, AlertCircle, Mail } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { OTPVerification } from './OTPVerification';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import { UserRole, Language } from '../../types';
import { normalizeToE164, isValidE164 } from '../../utils/phoneAuth';

export const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const { registerPhoneUser } = useAuth();
  const { t, language } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(''); // Optional profile contact email
  const [role, setRole] = useState<UserRole>('user');
  const [preferredLang, setPreferredLang] = useState<Language>(language);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullPhone = normalizeToE164(phone, '+91');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t('fullNamePlaceholder'));
      return;
    }

    if (!isValidE164(fullPhone)) {
      setError(t('invalidPhone'));
      return;
    }

    if (!acceptTerms) {
      setError(t('termsRequired'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerPhoneUser({
        name: name.trim(),
        phone: fullPhone,
        email: email.trim() || undefined,
        role,
        preferredLanguage: preferredLang
      });

      if (res.success) {
        setStep('otp');
      } else {
        const errorMsg = res.errorKey ? t(res.errorKey) : t('otpSendFailed');
        setError(errorMsg);
      }
    } catch {
      setError(t('networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <OTPVerification
        phone={fullPhone}
        onChangePhone={() => setStep('form')}
        onSuccess={(verifiedRole) => {
          const target = verifiedRole || role;
          if (target === 'recycler') {
            navigate('/recycler-dashboard');
          } else if (target === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/home');
          }
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Selection */}
      <div>
        <label className="block mb-2 text-xs font-black uppercase tracking-wider text-slate-500">
          {t('selectRole')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              role === 'user'
                ? 'border-[#0F3D2E] bg-emerald-950/5 text-[#0F3D2E]'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
            }`}
          >
            <span className="block text-xs font-extrabold">{t('roleUser')}</span>
            <span className="block text-[10px] text-slate-500 mt-0.5 leading-tight">
              {t('roleCollectorDesc')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole('recycler')}
            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              role === 'recycler'
                ? 'border-[#0F3D2E] bg-emerald-950/5 text-[#0F3D2E]'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
            }`}
          >
            <span className="block text-xs font-extrabold">{t('roleRecycler')}</span>
            <span className="block text-[10px] text-slate-500 mt-0.5 leading-tight">
              {t('roleRecyclerDesc')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              role === 'admin'
                ? 'border-[#0F3D2E] bg-emerald-950/5 text-[#0F3D2E]'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
            }`}
          >
            <span className="block text-xs font-extrabold">{t('roleAdmin')}</span>
            <span className="block text-[10px] text-slate-500 mt-0.5 leading-tight">
              {t('roleAdminDesc')}
            </span>
          </button>
        </div>
      </div>

      {/* Full Name */}
      <Input
        label={t('fullName')}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('fullNamePlaceholder')}
        prefixIcon={<User className="w-5 h-5 text-slate-400" />}
        inputSize="md"
        required
      />

      {/* Phone Number */}
      <Input
        label={t('enterMobile')}
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder={t('mobilePlaceholder')}
        prefixIcon={<Phone className="w-5 h-5 text-slate-400" />}
        inputSize="md"
        required
      />

      {/* Profile Email (optional for receipt notifications, not used for auth) */}
      <Input
        label={`${t('enterEmail')} (Optional for Receipts)`}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('emailPlaceholder')}
        prefixIcon={<Mail className="w-5 h-5 text-slate-400" />}
        inputSize="md"
      />

      {/* Preferred Language */}
      <div>
        <label className="block mb-1.5 text-xs font-black uppercase tracking-wider text-slate-500">
          {t('preferredLanguage')}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === preferredLang;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setPreferredLang(lang.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F3D2E] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {lang.nativeName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Terms acceptance */}
      <label className="flex items-start gap-2.5 cursor-pointer pt-1 select-none">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="w-4 h-4 mt-0.5 rounded text-[#0F3D2E] focus:ring-[#0F3D2E]/30 cursor-pointer"
        />
        <span className="text-xs text-slate-600 font-medium leading-relaxed">
          {t('termsAcceptNotice')}
        </span>
      </label>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          icon={<ArrowRight className="w-5 h-5" />}
          iconPosition="right"
        >
          {t('sendOtpBtn')}
        </Button>
      </div>

      <div className="text-center pt-2">
        <Link
          to="/login"
          className="text-xs font-bold text-slate-600 hover:text-[#0F3D2E] transition-colors"
        >
          {t('alreadyHaveAccount')}
        </Link>
      </div>
    </form>
  );
};
