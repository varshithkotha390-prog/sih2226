import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, RotateCw, AlertCircle, Edit3 } from 'lucide-react';
import { Button } from '../Button';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { UserRole } from '../../types';

interface OTPVerificationProps {
  phone: string;
  onChangePhone: () => void;
  onSuccess?: (role?: UserRole) => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  phone,
  onChangePhone,
  onSuccess
}) => {
  const navigate = useNavigate();
  const { verifyPhoneOtp, resendPhoneOtp } = useAuth();
  const { t } = useLanguage();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // 60-second cooldown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Focus the first input on load
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    setError(null);
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const char = cleaned[cleaned.length - 1];
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto advance to next input
    if (index < 5 && char) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const token = otp.join('');
    if (token.length !== 6) {
      setError(t('wrongOtp'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyPhoneOtp(phone, token);
      if (res.success) {
        if (onSuccess) {
          onSuccess(res.role);
        } else {
          // Navigate to correct dashboard based on verified user role
          if (res.role === 'recycler') {
            navigate('/recycler-dashboard');
          } else if (res.role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/home');
          }
        }
      } else {
        const errorMsg = res.errorKey ? t(res.errorKey) : t('wrongOtp');
        setError(errorMsg);
      }
    } catch {
      setError(t('networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    setError(null);

    try {
      const res = await resendPhoneOtp(phone);
      if (res.success) {
        setCountdown(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputsRef.current[0]?.focus();
      } else {
        const errorMsg = res.errorKey ? t(res.errorKey) : t('otpSendFailed');
        setError(errorMsg);
      }
    } catch {
      setError(t('networkError'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-5 text-left">
      {/* Sent notice with phone pill and change button */}
      <div className="p-3.5 rounded-2xl bg-emerald-950/5 border border-emerald-800/20 text-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Phone className="w-4 h-4 text-[#0F3D2E] flex-shrink-0" />
          <div className="truncate">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              {t('otpSentNotice', { phone })}
            </p>
            <p className="text-xs font-black font-mono text-[#0F3D2E]">{phone}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onChangePhone}
          className="flex items-center gap-1 text-xs font-black text-[#C86D2F] hover:text-[#B85D19] p-1.5 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer flex-shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{t('changePhone')}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 6 Digit Cells */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-2.5 text-center">
          {t('enterOtp')}
        </label>
        <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-13 sm:w-13 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono bg-white border-2 border-slate-300 focus:border-[#0F3D2E] focus:ring-4 focus:ring-[#0F3D2E]/20 rounded-2xl shadow-inner focus:outline-none transition-all"
            />
          ))}
        </div>
      </div>

      {/* Resend OTP Row with 60s cooldown */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <span className="text-slate-500 font-semibold">
          {!canResend ? (
            <span>{t('resendIn', { seconds: countdown })}</span>
          ) : (
            <span>{t('expiredOtp')}</span>
          )}
        </span>

        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || isResending}
          className={`font-black flex items-center gap-1.5 transition-colors cursor-pointer ${
            canResend && !isResending
              ? 'text-[#0F3D2E] hover:underline'
              : 'text-slate-300 pointer-events-none'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
          <span>{t('resendOtpBtn')}</span>
        </button>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="button"
          onClick={() => handleVerify()}
          variant="primary"
          size="lg"
          isLoading={isLoading}
          icon={<ArrowRight className="w-5 h-5" />}
          iconPosition="right"
        >
          {t('verifyOtpBtn')}
        </Button>
      </div>
    </div>
  );
};
