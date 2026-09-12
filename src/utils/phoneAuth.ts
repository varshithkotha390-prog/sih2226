import { TranslationKey } from '../i18n';

/**
 * Normalizes user-entered phone number to standard E.164 format.
 * Defaults to India (+91) if no country code is present.
 */
export function normalizeToE164(input: string, defaultCountryCode = '+91'): string {
  const trimmed = (input || '').trim();
  if (!trimmed) return '';

  // If already starts with '+', keep '+' and strip non-digits
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '');
    return digits ? `+${digits}` : '';
  }

  // Strip all non-digit characters
  let digits = trimmed.replace(/\D/g, '');

  // Strip leading zero common in domestic Indian dialing (e.g. 09849012345 -> 9849012345)
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // If user entered 12 digits starting with '91', prepend '+'
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  const cleanCountryCode = defaultCountryCode.replace(/\D/g, '') || '91';
  return `+${cleanCountryCode}${digits}`;
}

/**
 * Validates whether the normalized E.164 phone number has a plausible length.
 * E.164 requires at least 10 digits (including country code) and at most 15 digits.
 */
export function isValidE164(phone: string): boolean {
  if (!phone || !phone.startsWith('+')) return false;
  const digits = phone.slice(1);
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Maps Supabase Auth errors and network exceptions to localized translation keys.
 */
export function mapAuthErrorToKey(error: any): TranslationKey {
  if (!error) return 'authError';

  const status = error.status || error.statusCode;
  const message = (error.message || error.error_description || error.name || '').toLowerCase();

  // 1. Rate Limiting / Too Many Requests
  if (
    status === 429 ||
    message.includes('429') ||
    message.includes('too many') ||
    message.includes('rate limit') ||
    message.includes('over_sms_send_rate_limit') ||
    message.includes('security purposes')
  ) {
    return 'tooManyAttempts';
  }

  // 2. Expired Token
  if (message.includes('expired') || message.includes('token has expired')) {
    return 'expiredOtp';
  }

  // 3. Invalid Token / OTP
  if (
    message.includes('invalid token') ||
    message.includes('token is invalid') ||
    message.includes('wrong token') ||
    message.includes('otp') && message.includes('invalid')
  ) {
    return 'wrongOtp';
  }

  // 4. Invalid Phone Number
  if (
    message.includes('invalid phone') ||
    message.includes('invalid mobile') ||
    message.includes('phone format') ||
    message.includes('e.164') ||
    message.includes('unsupported phone')
  ) {
    return 'invalidPhone';
  }

  // 5. Network / Connection Errors
  if (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('failed to fetch') ||
    message.includes('connection') ||
    message.includes('timed out') ||
    message.includes('offline')
  ) {
    return 'networkError';
  }

  // 6. OTP Delivery / Gateway Failure
  if (
    message.includes('sms') ||
    message.includes('twilio') ||
    message.includes('provider') ||
    message.includes('error sending') ||
    message.includes('send')
  ) {
    return 'otpSendFailed';
  }

  return 'authError';
}
