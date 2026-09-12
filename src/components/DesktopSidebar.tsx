import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';

export const DesktopSidebar: React.FC = () => {
  const { t } = useLanguage();
  const { user, signOut, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const hideOnPaths = ['/login', '/signup'];
  if (hideOnPaths.includes(location.pathname)) {
    return null;
  }

  const navLinks = [
    { to: '/home', icon: '🏠', label: t('home') },
    { to: '/sell', icon: '♻️', label: t('sell') },
    { to: '/earnings', icon: '💰', label: t('earnings') },
    { to: '/safety', icon: '🛡️', label: t('safety') },
    { to: '/transactions', icon: '📋', label: t('history') },
    { to: '/recycler-dashboard', icon: '🏭', label: t('recycler') },
    { to: '/admin-dashboard', icon: '📊', label: t('admin') }
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.name || 'Collector';
  const displayLocation = user?.location || 'Hyderabad, TS';
  const initial = displayName.charAt(0).toUpperCase();

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
        <div>
          <span className="font-black text-xl tracking-tight text-[#0F3D2E] block leading-none">
            {t('appName')}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
            {role === 'admin' ? t('admin') : role === 'recycler' ? t('recycler') : t('user')}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
        {navLinks.map((link) => (
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

      {/* Collector Profile, Theme Mode & 6-Language Selector Footer */}
      <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-90 transition-opacity flex-1"
          >
            <div className="w-9 h-9 rounded-full bg-slate-300 border-2 border-white overflow-hidden shadow-xs flex-shrink-0">
              <div className="w-full h-full bg-emerald-950/10 flex items-center justify-center text-[#0F3D2E] font-black text-sm font-mono">
                {initial}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">{displayLocation}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title={t('logoutBtn')}
            aria-label={t('logoutBtn')}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Laptop Display Mode: Light | Normal | Dark */}
        <ThemeToggle variant="expanded" />

        {/* Full 6-Language Popover Selector (opens upward above footer) */}
        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">{t('language')}:</span>
          <LanguageSelector variant="compact" direction="up" />
        </div>
      </div>
    </aside>
  );
};
