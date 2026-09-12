import { en } from './en';
import { hi } from './hi';
import { te } from './te';
import { ta } from './ta';
import { kn } from './kn';
import { ml } from './ml';
import { Language } from '../types';

export const translations = {
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
  name: string;
  nativeName: string;
  badge: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', badge: 'EN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', badge: 'HI' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', badge: 'TE' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', badge: 'TA' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', badge: 'KN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', badge: 'ML' }
];

export { en, hi, te, ta, kn, ml };
