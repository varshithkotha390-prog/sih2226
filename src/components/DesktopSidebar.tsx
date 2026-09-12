import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

export const DesktopSidebar: React.FC = () => {
  const { language, t } = useLanguage();
  const { isAuthenticated, role, profile, signOut, updateLanguage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide sidebar on login screen or if unauthenticated
  if (location.pathname === '/login' || !isAuthenticated) {
    return null;
  }

  const allNavLinks = [
    { to: '/home', icon: '🏠', label: t('home'), roles: ['collector', 'admin'] },
    { to: '/sell', icon: '♻️', label: t('sell'), roles: ['collector', 'admin'] },
    { to: '/earnings', icon: '💰', label: t('earnings'), roles: ['collector', 'admin'] },
    { to: '/safety', icon: '🛡️', label: t('safety'), roles: ['collector', 'recycler', 'admin'] },
    { to: '/transactions', icon: '📋', label: t('history'), roles: ['collector', 'recycler', 'admin'] },
    {
      to: '/recycler-dashboard',
      icon: '🏭',
      label:
        language === 'hi'
          ? 'रीसाइक्लर'
          : language === 'te'
          ? 'రీసైక్లర్'
          : language === 'ta'
          ? 'மறுசுழற்சியாளர்'
          : language === 'kn'
          ? 'ಮರುಬಳಕೆದಾರ'
          : language === 'ml'
          ? 'റീസൈക്ലർ'
          : 'Recycler Hub',
      roles: ['recycler', 'admin']
    },
    {
      to: '/admin-dashboard',
      icon: '📊',
      label:
        language === 'hi'
          ? 'व्यवस्थापक'
          : language === 'te'
          ? 'అడ్మిన్'
          : language === 'ta'
          ? 'நிர்வாகி'
          : language === 'kn'
          ? 'ನಿರ್ವಾಹಕ'
          : language === 'ml'
          ? 'അഡ്മിൻ'
          : 'Admin Portal',
      roles: ['admin']
    }
  ];

  const visibleNavLinks = allNavLinks.filter((link) => link.roles.includes(role));

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0F3D2E] rounded-xl flex items-center justify-center shadow-md shadow-emerald-950/20 flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <span className="font-black text-xl tracking-tight text-[#0F3D2E]">KabadiConnect</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        {visibleNavLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                isActive
                  ? 'bg-emerald-950/5 text-[#0F3D2E] font-extrabold border-r-4 border-[#0F3D2E]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            <span className="text-base">{link.icon}</span>
            <span className="truncate">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Collector Profile, Laptop Display Mode & Language Switcher footer */}
      <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 space-y-3">
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-white overflow-hidden shadow-sm flex-shrink-0">
            <div className="w-full h-full bg-emerald-950/10 flex items-center justify-center text-[#0F3D2E] font-black text-sm font-mono">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'R'}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate">
              {profile?.name ? `Namaste, ${profile.name}` : 'Namaste, Ramesh 👋'}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {profile?.badge || (role === 'admin' ? 'CPCB Admin' : role === 'recycler' ? 'Authorized Recycler' : 'CPCB Registered')}
            </p>
          </div>
          <button
            type="button"
            title="Sign Out"
            onClick={async (e) => {
              e.stopPropagation();
              await signOut();
              navigate('/login', { replace: true });
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Laptop Display Mode: Light | Normal | Dark */}
        <ThemeToggle variant="expanded" />

        {/* 6-Language Vernacular Selector */}
        <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Language / भाषा</span>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-200">
              {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.native}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {SUPPORTED_LANGUAGES.map((langOpt) => {
              const isSelected = language === langOpt.code;
              return (
                <button
                  key={langOpt.code}
                  type="button"
                  onClick={async () => {
                    if (langOpt.code === language) return;
                    await updateLanguage(langOpt.code);
                  }}
                  className={`py-1.5 px-1 rounded-lg text-center text-[10px] font-bold transition-all cursor-pointer truncate ${
                    isSelected
                      ? 'bg-[#0F3D2E] text-white shadow-xs font-black'
                      : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title={`${langOpt.native} (${langOpt.label})`}
                >
                  {langOpt.native}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
