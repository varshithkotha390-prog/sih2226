import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { AuthUser, UserRole, Language } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { TranslationKey } from '../i18n';
import { normalizeToE164, isValidE164, mapAuthErrorToKey } from '../utils/phoneAuth';

export interface PhoneRegistrationData {
  name: string;
  phone: string;
  role: UserRole;
  email?: string;
  preferredLanguage?: Language;
}

interface AuthResult {
  success: boolean;
  role?: UserRole;
  errorKey?: TranslationKey;
  error?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  signInWithPhone: (phone: string) => Promise<AuthResult>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<AuthResult>;
  resendPhoneOtp: (phone: string) => Promise<AuthResult>;
  registerPhoneUser: (data: PhoneRegistrationData) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  quickDemoLogin: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'kc_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setLanguage } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const applyUserLanguage = useCallback(
    (preferredLang?: Language) => {
      if (preferredLang && ['en', 'hi', 'te', 'ta', 'kn', 'ml'].includes(preferredLang)) {
        setLanguage(preferredLang);
      }
    },
    [setLanguage]
  );

  const persistUser = useCallback(
    (newUser: AuthUser | null) => {
      setUser(newUser);
      if (newUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
        applyUserLanguage(newUser.preferred_language);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    },
    [applyUserLanguage]
  );

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        // 1. Check Supabase session first
        if (supabase && isSupabaseConfigured()) {
          try {
            const { data, error: sessionErr } = await supabase.auth.getSession();
            if (!sessionErr && data?.session?.user) {
              const sbUser = data.session.user;
              const meta = sbUser.user_metadata || {};
              const role: UserRole = (meta.role as UserRole) || 'user';
              const authUser: AuthUser = {
                id: sbUser.id,
                email: sbUser.email,
                phone: sbUser.phone || meta.phone,
                name: meta.name || 'Verified Collector',
                role,
                location: meta.location || 'Hyderabad, TS',
                badge: meta.badge || (role === 'recycler' ? 'Authorized Recycler' : 'CPCB Registered Partner'),
                preferred_language: meta.preferred_language
              };
              if (mounted) {
                setUser(authUser);
                applyUserLanguage(authUser.preferred_language);
                setIsLoading(false);
                return;
              }
            }
          } catch (sbErr) {
            console.warn('[Auth] Supabase session check error:', sbErr);
          }
        }

        // 2. Check local storage session
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as AuthUser;
            if (parsed && parsed.id && parsed.role) {
              if (mounted) {
                setUser(parsed);
                applyUserLanguage(parsed.preferred_language);
              }
            }
          } catch {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
        // If unauthenticated, user stays null. No automatic fake login.
      } catch (err) {
        console.warn('[Auth] Session initialization error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initSession();

    // Listen to Supabase auth state changes
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const meta = session.user.user_metadata || {};
            const role: UserRole = (meta.role as UserRole) || 'user';
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email,
              phone: session.user.phone || meta.phone,
              name: meta.name || 'Verified Collector',
              role,
              location: meta.location || 'Hyderabad, TS',
              badge: meta.badge || (role === 'recycler' ? 'Authorized Recycler' : 'CPCB Registered Partner'),
              preferred_language: meta.preferred_language
            };
            setUser(authUser);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
            applyUserLanguage(authUser.preferred_language);
          } else if (_event === 'SIGNED_OUT') {
            setUser(null);
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        });
        authListener = data;
      } catch (e) {
        console.warn('Could not register supabase auth listener:', e);
      }
    }

    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [applyUserLanguage]);

  // Real Supabase Sign In with Phone (Request SMS OTP)
  const signInWithPhone = async (
    phone: string,
    options?: { data?: Record<string, any> }
  ): Promise<AuthResult> => {
    setError(null);
    const normalizedPhone = normalizeToE164(phone);

    if (!isValidE164(normalizedPhone)) {
      setError('invalidPhone');
      return { success: false, errorKey: 'invalidPhone', error: 'Invalid phone number' };
    }

    if (!supabase || !isSupabaseConfigured()) {
      setError('networkError');
      return {
        success: false,
        errorKey: 'networkError',
        error: 'Supabase client is not configured with valid credentials'
      };
    }

    try {
      const { error: sbError } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: options?.data ? { data: options.data } : undefined
      });

      if (sbError) {
        const errorKey = mapAuthErrorToKey(sbError);
        setError(errorKey);
        return { success: false, errorKey, error: sbError.message };
      }

      return { success: true };
    } catch (err: any) {
      const errorKey = mapAuthErrorToKey(err);
      setError(errorKey);
      return { success: false, errorKey, error: err?.message || 'Failed to send OTP' };
    }
  };

  // Real Supabase Verify Phone OTP
  const verifyPhoneOtp = async (phone: string, token: string): Promise<AuthResult> => {
    setError(null);
    const normalizedPhone = normalizeToE164(phone);
    const cleanToken = token.trim();

    if (!isValidE164(normalizedPhone)) {
      setError('invalidPhone');
      return { success: false, errorKey: 'invalidPhone', error: 'Invalid phone number' };
    }

    if (!cleanToken || cleanToken.length !== 6) {
      setError('wrongOtp');
      return { success: false, errorKey: 'wrongOtp', error: 'Invalid OTP entered' };
    }

    if (!supabase || !isSupabaseConfigured()) {
      setError('networkError');
      return {
        success: false,
        errorKey: 'networkError',
        error: 'Supabase client is not configured'
      };
    }

    try {
      const { data, error: sbError } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: cleanToken,
        type: 'sms'
      });

      if (sbError) {
        const errorKey = mapAuthErrorToKey(sbError);
        setError(errorKey);
        return { success: false, errorKey, error: sbError.message };
      }

      if (data?.user) {
        const sbUser = data.user;
        const meta = sbUser.user_metadata || {};
        const role: UserRole = (meta.role as UserRole) || 'user';
        const authUser: AuthUser = {
          id: sbUser.id,
          email: sbUser.email,
          phone: sbUser.phone || normalizedPhone,
          name: meta.name || 'Verified Collector',
          role,
          location: meta.location || 'Hyderabad, TS',
          badge: meta.badge || (role === 'recycler' ? 'Authorized Recycler' : 'CPCB Registered Partner'),
          preferred_language: meta.preferred_language
        };
        persistUser(authUser);
        return { success: true, role };
      }

      setError('authError');
      return { success: false, errorKey: 'authError', error: 'Authentication failed' };
    } catch (err: any) {
      const errorKey = mapAuthErrorToKey(err);
      setError(errorKey);
      return { success: false, errorKey, error: err?.message || 'Verification failed' };
    }
  };

  // Real Supabase Resend Phone OTP
  const resendPhoneOtp = async (phone: string): Promise<AuthResult> => {
    return signInWithPhone(phone);
  };

  // Register Phone User with Supabase metadata
  const registerPhoneUser = async (data: PhoneRegistrationData): Promise<AuthResult> => {
    setError(null);
    return signInWithPhone(data.phone, {
      data: {
        name: data.name,
        role: data.role,
        email: data.email,
        preferred_language: data.preferredLanguage || 'en',
        location: 'Hyderabad, Telangana'
      }
    });
  };

  // Real Supabase Sign Out
  const signOut = async (): Promise<void> => {
    try {
      if (supabase && isSupabaseConfigured()) {
        await supabase.auth.signOut().catch(() => {});
      }
    } finally {
      persistUser(null);
    }
  };

  // Internal fallback for test/dev inspection if explicitly called elsewhere
  const quickDemoLogin = (targetRole: UserRole) => {
    const demoUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: targetRole === 'recycler' ? 'GreenCycle Facility Manager' : targetRole === 'admin' ? 'CPCB Regional Officer' : 'Ramesh Kumar',
      phone: '+91 98490 12345',
      role: targetRole,
      email: `${targetRole}@kabadiconnect.in`,
      location: 'Hyderabad, TS',
      badge: targetRole === 'recycler' ? 'Authorized Recycler' : 'CPCB Registered Partner',
      preferred_language: 'en'
    };
    persistUser(demoUser);
  };

  const role: UserRole = user?.role || 'user';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        error,
        clearError,
        signInWithPhone,
        verifyPhoneOtp,
        resendPhoneOtp,
        registerPhoneUser,
        signOut,
        quickDemoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
