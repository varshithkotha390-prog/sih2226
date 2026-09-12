import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { OTPVerification } from './OTPVerification';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { normalizeToE164, isValidE164 } from '../../utils/phoneAuth';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: 'India (+91)' },
  { code: '+1', country: 'US', label: 'USA (+1)' },
  { code: '+44', country: 'UK', label: 'UK (+44)' },
  { code: '+971', country: 'AE', label: 'UAE (+971)' }
];

export const PhoneLoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithPhone } = useAuth();
  const { t } = useLanguage();

  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullPhone = normalizeToE164(`${countryCode} ${phoneNumber.trim()}`, countryCode);
    if (!isValidE164(fullPhone)) {
      setError(t('invalidPhone'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await signInWithPhone(fullPhone);
      if (res.success) {
        setNormalizedPhone(fullPhone);
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
        phone={normalizedPhone}
        onChangePhone={() => {
          setError(null);
          setStep('input');
        }}
        onSuccess={(role) => {
          if (role === 'recycler') {
            navigate('/recycler-dashboard');
          } else if (role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/home');
          }
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSendOtp} className="space-y-4 text-left">
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block mb-2 text-sm font-bold text-slate-700 tracking-wide">
          {t('enterMobile')}
        </label>
        <div className="flex gap-2">
          {/* Country code selector */}
          <div className="w-28 flex-shrink-0">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 border-2 border-slate-300/90 rounded-2xl py-3 px-2 text-sm font-bold focus:border-[#0F3D2E] focus:ring-4 focus:ring-[#0F3D2E]/20 focus:outline-none transition-all cursor-pointer"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.country})
                </option>
              ))}
            </select>
          </div>

          {/* Phone number input */}
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              inputMode="numeric"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t('mobilePlaceholder')}
              className="w-full bg-white text-slate-900 border-2 border-slate-300/90 focus:border-[#0F3D2E] focus:ring-4 focus:ring-[#0F3D2E]/20 shadow-inner focus:outline-none transition-all pl-10 pr-4 py-3 text-base rounded-2xl font-bold font-mono tracking-wider"
              required
              autoFocus
            />
          </div>
        </div>
      </div>

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

      <div className="text-center pt-1">
        <a
          href="/signup"
          onClick={(e) => {
            e.preventDefault();
            navigate('/signup');
          }}
          className="text-xs font-bold text-slate-600 hover:text-[#0F3D2E] transition-colors cursor-pointer"
        >
          {t('dontHaveAccount')}
        </a>
      </div>
    </form>
  );
};
