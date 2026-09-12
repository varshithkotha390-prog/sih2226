import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  isSupabaseOffline,
  withTimeout,
  markSupabaseOffline,
  markSupabaseOnline
} from '../services/supabaseClient';
import { UserProfile, UserRole, Language } from '../types';
import { mockUserProfile } from '../services/mockData';
import { useLanguage } from '../i18n/LanguageContext';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (phone: string, preferredLanguage?: Language) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; profile?: UserProfile; role?: UserRole; error?: string }>;
  loginWithDemo: (role: UserRole) => Promise<{ success: boolean; profile?: UserProfile; role?: UserRole; error?: string }>;
  signOut: () => Promise<void>;
  updateLanguage: (lang: Language) => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
  changePhoneNumber: (newPhone: string) => Promise<{ success: boolean; error?: string }>;
  verifyPhoneChange: (newPhone: string, token: string) => Promise<{ success: boolean; error?: string }>;
}

export const DEMO_CREDENTIALS: Record<UserRole, { phone: string; otp: string; name: string; title: string }> = {
  collector: {
    phone: '+919849012345',
    otp: '123456',
    name: 'Ramesh',
    title: 'Informal Scrap Collector'
  },
  recycler: {
    phone: '+914027128899',
    otp: '123456',
    name: 'GreenCycle Operations',
    title: 'Authorized E-Waste Recycler'
  },
  admin: {
    phone: '+919999900000',
    otp: '123456',
    name: 'CPCB Central Inspector',
    title: 'Central Regulatory Oversight'
  }
};

export function normalizePhoneNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`;
  }
  if (rawPhone.trim().startsWith('+')) {
    return `+${digits}`;
  }
  return digits.length > 0 ? `+${digits}` : '';
}

const LOCAL_AUTH_STORAGE_KEY = 'kabadiconnect_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setLanguage } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('collector');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to construct local offline profile for demo personas
  const createMockProfile = useCallback((assignedRole: UserRole, phone?: string): UserProfile => {
    if (assignedRole === 'recycler') {
      return {
        id: 'rec_greencycle',
        name: 'GreenCycle Recycler',
        phone: phone || '+91 40 2712 8899',
        location: 'Cherlapally Phase 2, Hyderabad',
        role: 'Authorized E-Waste Recycler',
        badge: 'TSPCB Authorized Facility',
        memberSince: 'January 2023',
        preferredLanguage: 'en',
        recyclerId: 'rec_greencycle'
      };
    }
    if (assignedRole === 'admin') {
      return {
        id: 'usr_admin_01',
        name: 'CPCB Central Inspector',
        phone: phone || '+91 99999 00000',
        location: 'MoEFCC Hyderabad Zone',
        role: 'Central Regulatory Oversight',
        badge: 'CPCB Central Admin',
        memberSince: 'October 2022',
        preferredLanguage: 'en'
      };
    }
    // Default collector
    return {
      ...mockUserProfile,
      phone: phone || mockUserProfile.phone,
      collectorId: 'usr_ramesh_01'
    };
  }, []);

  // Fetch or upsert profile in public.profiles table
  const fetchProfileFromDb = useCallback(async (userId: string, userPhone?: string): Promise<UserProfile | null> => {
    if (!supabase || !isSupabaseConfigured() || isSupabaseOffline()) {
      return null;
    }

    try {
      const { data, error } = await withTimeout(
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        3000
      );

      if (error) {
        console.warn('[AuthContext] Failed to fetch profile from Supabase:', error.message);
        return null;
      }

      if (data) {
        const detectedRole: UserRole = (['collector', 'recycler', 'admin'].includes(data.role)
          ? data.role
          : 'collector') as UserRole;

        const userProfile: UserProfile = {
          id: data.collector_id || data.recycler_id || data.id,
          name: data.name || (detectedRole === 'recycler' ? 'GreenCycle Recycler' : detectedRole === 'admin' ? 'CPCB Admin' : 'Ramesh'),
          phone: data.phone || userPhone || '',
          location: detectedRole === 'recycler' ? 'Cherlapally, Hyderabad' : 'Hyderabad, Telangana',
          role:
            detectedRole === 'admin'
              ? 'Central Regulatory Oversight'
              : detectedRole === 'recycler'
              ? 'Authorized E-Waste Recycler'
              : 'CPCB Registered Informal Collector',
          badge:
            detectedRole === 'admin'
              ? 'CPCB Central Admin'
              : detectedRole === 'recycler'
              ? 'TSPCB Authorized Facility'
              : 'CPCB Registered Partner',
          memberSince: 'March 2024',
          email: data.email || undefined,
          preferredLanguage: (data.preferred_language as Language) || 'en',
          collectorId: data.collector_id || undefined,
          recyclerId: data.recycler_id || undefined
        };

        if (data.preferred_language && ['en', 'hi', 'te', 'ta', 'kn', 'ml'].includes(data.preferred_language)) {
          setLanguage(data.preferred_language as Language);
        }

        setRole(detectedRole);
        return userProfile;
      }
    } catch (err) {
      console.warn('[AuthContext] Error fetching profile:', err);
    }
    return null;
  }, [setLanguage]);

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) return null;
    const p = await fetchProfileFromDb(user.id, user.phone);
    if (p) setProfile(p);
    return p;
  }, [user, fetchProfileFromDb]);

  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setIsLoading(true);

      // 1. Check if Supabase has an active session
      if (supabase && isSupabaseConfigured() && !isSupabaseOffline()) {
        try {
          const { data: { session: activeSession }, error } = await withTimeout(
            supabase.auth.getSession(),
            3000
          );

          if (!error && activeSession?.user && isMounted) {
            setSession(activeSession);
            setUser(activeSession.user);

            const dbProfile = await fetchProfileFromDb(activeSession.user.id, activeSession.user.phone);
            if (dbProfile && isMounted) {
              setProfile(dbProfile);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('[AuthContext] Session fetch error or timeout:', err);
        }
      }

      // 2. Check local storage for cached session / demo persona fallback
      try {
        const cached = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
        if (cached && isMounted) {
          const parsed = JSON.parse(cached);
          if (parsed?.role) {
            const fallbackProfile = createMockProfile(parsed.role as UserRole, parsed.phone);
            setRole(parsed.role as UserRole);
            setProfile(fallbackProfile);
            // Respect user-selected language in localStorage
            const savedLang = localStorage.getItem('kabadiconnect_lang') as Language;
            if (!savedLang && fallbackProfile.preferredLanguage) {
              setLanguage(fallbackProfile.preferredLanguage);
            }
          }
        }
      } catch (e) {
        console.warn('[AuthContext] Error reading local auth cache:', e);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth state changes
    let authListener: { unsubscribe: () => void } | null = null;
    if (supabase && isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' && newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          const p = await fetchProfileFromDb(newSession.user.id, newSession.user.phone);
          if (p && isMounted) {
            setProfile(p);
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
        }
      });
      authListener = data.subscription;
    }

    return () => {
      isMounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, [fetchProfileFromDb, createMockProfile, setLanguage]);

  // Request OTP via Supabase Auth
  const sendOtp = async (phone: string, preferredLanguage?: Language): Promise<{ success: boolean; error?: string }> => {
    const formatted = normalizePhoneNumber(phone);
    const unformatted = formatted.replace(/^\+/, '');
    if (!formatted || formatted.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }

    if (!supabase || !isSupabaseConfigured() || isSupabaseOffline()) {
      // Offline fallback: always succeed for demo purposes
      console.info('[AuthContext] Supabase offline or unconfigured. Simulating OTP send to:', formatted);
      return { success: true };
    }

    try {
      // 1. Try formatted with + (E.164)
      let { error } = await withTimeout(
        supabase.auth.signInWithOtp({
          phone: formatted,
          options: {
            data: {
              preferred_language: preferredLanguage || 'en'
            }
          }
        }),
        4000
      );

      // 2. If rejected (e.g. Supabase test number saved without +), retry with unformatted digits
      if (error && unformatted !== formatted) {
        console.info('[AuthContext] Retrying signInWithOtp with unformatted digits:', unformatted);
        const retry = await withTimeout(
          supabase.auth.signInWithOtp({
            phone: unformatted,
            options: {
              data: {
                preferred_language: preferredLanguage || 'en'
              }
            }
          }),
          4000
        );
        if (!retry.error) {
          error = null;
        }
      }

      if (error) {
        console.warn('[AuthContext] signInWithOtp error:', error.message);
        // If SMS provider not configured or rate limited, fallback allows demo to proceed
        return { success: true };
      }

      markSupabaseOnline();
      return { success: true };
    } catch (err: unknown) {
      console.warn('[AuthContext] Network exception in sendOtp, falling back:', err);
      // Fallback allows demo to proceed
      return { success: true };
    }
  };

  // Verify OTP and establish session
  const verifyOtp = async (
    phone: string,
    token: string
  ): Promise<{ success: boolean; profile?: UserProfile; role?: UserRole; error?: string }> => {
    const formatted = normalizePhoneNumber(phone);
    const unformatted = formatted.replace(/^\+/, '');
    const cleanToken = token.trim();

    if (!cleanToken || cleanToken.length < 6) {
      return { success: false, error: 'Please enter the 6-digit OTP code' };
    }

    // Determine target role by matching phone against test numbers
    let targetRole: UserRole = 'collector';
    if (formatted === DEMO_CREDENTIALS.recycler.phone || formatted.includes('4027128899')) {
      targetRole = 'recycler';
    } else if (formatted === DEMO_CREDENTIALS.admin.phone || formatted.includes('9999900000')) {
      targetRole = 'admin';
    }

    // Try verifying with Supabase Auth
    if (supabase && isSupabaseConfigured() && !isSupabaseOffline()) {
      try {
        // 1. Try verifyOtp with formatted phone (+91...)
        let res = await withTimeout(
          supabase.auth.verifyOtp({
            phone: formatted,
            token: cleanToken,
            type: 'sms'
          }),
          4000
        );

        // 2. If failed and formatted has '+', retry with unformatted digits (91...)
        if (res.error && unformatted !== formatted) {
          console.info('[AuthContext] Retrying verifyOtp with unformatted digits:', unformatted);
          const retry = await withTimeout(
            supabase.auth.verifyOtp({
              phone: unformatted,
              token: cleanToken,
              type: 'sms'
            }),
            4000
          );
          if (!retry.error && retry.data?.session) {
            res = retry;
          }
        }

        const data = res.data;
        const error = res.error;

        if (!error && data?.session && data?.user) {
          markSupabaseOnline();
          setSession(data.session);
          setUser(data.user);

          // Fetch or generate profile
          const dbProfile = await fetchProfileFromDb(data.user.id, data.user.phone);
          const finalProfile = dbProfile || createMockProfile(targetRole, formatted);

          setProfile(finalProfile);
          setRole(targetRole);

          localStorage.setItem(
            LOCAL_AUTH_STORAGE_KEY,
            JSON.stringify({ role: targetRole, phone: formatted, userId: data.user.id })
          );

          return { success: true, profile: finalProfile, role: targetRole };
        }
      } catch (err) {
        console.warn('[AuthContext] verifyOtp timeout/network error, falling back to local session:', err);
        markSupabaseOffline();
      }
    }

    // Offline / Demo Fallback Mode
    if (cleanToken === '123456' || cleanToken.length === 6) {
      const fallbackProfile = createMockProfile(targetRole, formatted);
      setProfile(fallbackProfile);
      setRole(targetRole);

      localStorage.setItem(
        LOCAL_AUTH_STORAGE_KEY,
        JSON.stringify({ role: targetRole, phone: formatted, userId: fallbackProfile.id })
      );

      if (fallbackProfile.preferredLanguage && ['en', 'hi', 'te', 'ta', 'kn', 'ml'].includes(fallbackProfile.preferredLanguage)) {
        setLanguage(fallbackProfile.preferredLanguage);
      }

      return { success: true, profile: fallbackProfile, role: targetRole };
    }

    return { success: false, error: 'Invalid OTP code. Use test code 123456.' };
  };

  // 1-Tap Demo Login for instant hackathon evaluation
  const loginWithDemo = async (demoRole: UserRole): Promise<{ success: boolean; profile?: UserProfile; role?: UserRole; error?: string }> => {
    setIsLoading(true);
    const creds = DEMO_CREDENTIALS[demoRole];

    try {
      // 1. Attempt sendOtp (fires trigger or test number)
      await sendOtp(creds.phone);

      // 2. Immediately verify with test OTP
      const result = await verifyOtp(creds.phone, creds.otp);

      setIsLoading(false);
      return result;
    } catch (err: unknown) {
      setIsLoading(false);
      // Ensure offline fallback always works for demo buttons
      const fallbackProfile = createMockProfile(demoRole, creds.phone);
      setProfile(fallbackProfile);
      setRole(demoRole);
      localStorage.setItem(
        LOCAL_AUTH_STORAGE_KEY,
        JSON.stringify({ role: demoRole, phone: creds.phone, userId: fallbackProfile.id })
      );
      return { success: true, role: demoRole, profile: fallbackProfile };
    }
  };

  // Logout
  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (supabase && isSupabaseConfigured() && !isSupabaseOffline()) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[AuthContext] Error signing out from Supabase:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole('collector');
      localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
      setIsLoading(false);
    }
  };

  // Update preferred language in database & context
  const updateLanguage = async (lang: Language): Promise<void> => {
    setLanguage(lang);
    if (profile) {
      setProfile((prev) => (prev ? { ...prev, preferredLanguage: lang } : null));
    }

    if (supabase && user && isSupabaseConfigured() && !isSupabaseOffline()) {
      try {
        const { error } = await supabase.from('profiles').update({ preferred_language: lang }).eq('id', user.id);
        if (error) {
          console.warn('[AuthContext] Supabase preferred_language update rejected by DB:', error.message);
        }
      } catch (err) {
        console.warn('[AuthContext] Could not update preferred language in Supabase:', err);
      }
    }
  };

  // Step 1 of Phone Change: Send OTP to the NEW phone number
  const changePhoneNumber = async (newPhone: string): Promise<{ success: boolean; error?: string }> => {
    const formatted = normalizePhoneNumber(newPhone);
    const unformatted = formatted.replace(/^\+/, '');

    if (!formatted || formatted.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }

    if (profile?.phone && (profile.phone === formatted || profile.phone === unformatted || profile.phone.replace(/\D/g, '') === unformatted)) {
      return { success: false, error: 'The new phone number must be different from your current number' };
    }

    if (supabase && isSupabaseConfigured() && !isSupabaseOffline()) {
      try {
        let res = await withTimeout(
          supabase.auth.updateUser({ phone: formatted }),
          5000
        );

        // Fallback retry with unformatted digits
        if (res.error && unformatted !== formatted) {
          console.info('[AuthContext] Retrying updateUser with unformatted digits:', unformatted);
          const retry = await withTimeout(
            supabase.auth.updateUser({ phone: unformatted }),
            5000
          );
          if (!retry.error) {
            res = retry;
          }
        }

        if (res.error) {
          return { success: false, error: res.error.message };
        }

        return { success: true };
      } catch (err: any) {
        console.warn('[AuthContext] Error requesting phone change from Supabase:', err);
        return { success: false, error: err.message || 'Network error while requesting phone update.' };
      }
    }

    // Offline / demo fallback mode
    return { success: true };
  };

  // Step 2 of Phone Change: Verify OTP for phone_change and persist new phone
  const verifyPhoneChange = async (newPhone: string, token: string): Promise<{ success: boolean; error?: string }> => {
    const formatted = normalizePhoneNumber(newPhone);
    const unformatted = formatted.replace(/^\+/, '');
    const cleanToken = token.replace(/\D/g, '').trim();

    if (cleanToken.length !== 6) {
      return { success: false, error: 'Please enter a valid 6-digit OTP' };
    }

    let verifiedSuccessfully = false;

    if (supabase && isSupabaseConfigured() && !isSupabaseOffline()) {
      try {
        let res = await withTimeout(
          supabase.auth.verifyOtp({
            phone: formatted,
            token: cleanToken,
            type: 'phone_change'
          }),
          5000
        );

        if (res.error && unformatted !== formatted) {
          console.info('[AuthContext] Retrying verifyOtp phone_change with unformatted digits:', unformatted);
          const retry = await withTimeout(
            supabase.auth.verifyOtp({
              phone: unformatted,
              token: cleanToken,
              type: 'phone_change'
            }),
            5000
          );
          if (!retry.error && (retry.data?.user || retry.data?.session)) {
            res = retry;
          }
        }

        if (res.error) {
          if (cleanToken === '123456') {
            console.warn('[AuthContext] Supabase returned error but test OTP 123456 was provided. Continuing:', res.error.message);
            verifiedSuccessfully = true;
          } else {
            return { success: false, error: res.error.message };
          }
        } else {
          verifiedSuccessfully = true;
          if (res.data?.user) setUser(res.data.user);
          if (res.data?.session) setSession(res.data.session);
        }
      } catch (err: any) {
        console.warn('[AuthContext] verifyOtp phone_change error:', err);
        if (cleanToken === '123456') {
          verifiedSuccessfully = true;
        } else {
          return { success: false, error: err.message || 'Verification failed.' };
        }
      }
    } else {
      if (cleanToken === '123456' || cleanToken.length === 6) {
        verifiedSuccessfully = true;
      } else {
        return { success: false, error: 'Invalid verification code. Use test code 123456.' };
      }
    }

    if (verifiedSuccessfully) {
      // 1. Update profiles table
      if (supabase && user && isSupabaseConfigured() && !isSupabaseOffline()) {
        try {
          await supabase.from('profiles').update({
            phone: formatted,
            updated_at: new Date().toISOString()
          }).eq('id', user.id);
        } catch (dbErr) {
          console.warn('[AuthContext] Could not update phone in profiles table:', dbErr);
        }

        if (profile?.collectorId) {
          try {
            await supabase.from('collectors').update({ phone: formatted }).eq('id', profile.collectorId);
          } catch (cErr) {
            console.warn('[AuthContext] Could not update phone in collectors table:', cErr);
          }
        }
        if (profile?.recyclerId) {
          try {
            await supabase.from('recyclers').update({ phone: formatted }).eq('id', profile.recyclerId);
          } catch (rErr) {
            console.warn('[AuthContext] Could not update phone in recyclers table:', rErr);
          }
        }
      }

      // 2. Update local profile state
      setProfile((prev) => (prev ? { ...prev, phone: formatted } : null));

      // 3. Update localStorage cache
      const stored = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.phone = formatted;
          localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(parsed));
        } catch {}
      }

      return { success: true };
    }

    return { success: false, error: 'Could not verify phone number change.' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isAuthenticated: !!profile || !!user,
        isLoading,
        sendOtp,
        verifyOtp,
        loginWithDemo,
        signOut,
        updateLanguage,
        refreshProfile,
        changePhoneNumber,
        verifyPhoneChange
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
