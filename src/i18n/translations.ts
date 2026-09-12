import { en } from './locales/en';
import { hi } from './locales/hi';
import { te } from './locales/te';
import { ta } from './locales/ta';
import { kn } from './locales/kn';
import { ml } from './locales/ml';
import { Language } from '../types';

export const translations: Record<Language, typeof en> = {
  en,
  hi,
  te,
  ta,
  kn,
  ml
};

export type TranslationKey = keyof typeof en;

export interface LanguageOption {
  code: Language;
  label: string;
  native: string;
  flag: string;
  state: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🌐', state: 'Standard / National' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', state: 'National / North & Central' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', state: 'Telangana & Andhra Pradesh' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', state: 'Tamil Nadu & Puducherry' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', state: 'Karnataka' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', state: 'Kerala' }
];
