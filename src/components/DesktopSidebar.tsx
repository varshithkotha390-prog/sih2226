import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { mockUserProfile } from '../services/mockData';

export const DesktopSidebar: React.FC = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/home', icon: '🏠', labelEn: 'Home / मुख्य पृष्ठ', labelHi: 'मुख्य पृष्ठ / Home' },
    { to: '/sell', icon: '♻️', labelEn: 'Sell / कचरा बेचें', labelHi: 'कचरा बेचें / Sell' },
    { to: '/earnings', icon: '💰', labelEn: 'Earnings / कमाई', labelHi: 'कमाई / Earnings' },
    { to: '/safety', icon: '🛡️', labelEn: 'Safety / सुरक्षा', labelHi: 'सुरक्षा / Safety' },
    { to: '/transactions', icon: '📋', labelEn: 'History / लेन-देन', labelHi: 'लेन-देन / History' },
    { to: '/recycler-dashboard', icon: '🏭', labelEn: 'Recycler / रीसाइक्लर', labelHi: 'रीसाइक्लर / Recycler' },
    { to: '/admin-dashboard', icon: '📊', labelEn: 'Admin / व्यवस्थापक', labelHi: 'व्यवस्थापक / Admin' }
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <span className="font-bold text-xl tracking-tight text-emerald-900">KabadiConnect</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-bold border-r-4 border-emerald-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            <span className="text-base">{link.icon}</span>
            <span className="truncate">{language === 'hi' ? link.labelHi : link.labelEn}</span>
          </NavLink>
        ))}
      </nav>

      {/* Collector Profile & Language Switcher footer */}
      <div className="p-6 border-t border-slate-100 bg-slate-50">
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 mb-3 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-11 h-11 rounded-full bg-slate-300 border-2 border-white overflow-hidden shadow-sm flex-shrink-0">
            <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-base">
              R
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">Namaste, Ramesh 👋</p>
            <p className="text-xs text-slate-500 truncate">Hyderabad, TS</p>
          </div>
        </div>

        {/* Clean Minimalism Language Selector */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200/60">
          <button
            onClick={language === 'en' ? undefined : toggleLanguage}
            className={`text-[10px] font-bold px-2.5 py-1 rounded transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-white border border-slate-200 text-emerald-600 shadow-xs'
                : 'bg-slate-100 text-slate-400 hover:text-slate-600'
            }`}
          >
            English
          </button>
          <button
            onClick={language === 'hi' ? undefined : toggleLanguage}
            className={`text-[10px] font-bold px-2.5 py-1 rounded transition-all cursor-pointer ${
              language === 'hi'
                ? 'bg-white border border-slate-200 text-emerald-600 shadow-xs'
                : 'bg-slate-100 text-slate-400 hover:text-slate-600'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>
    </aside>
  );
};
