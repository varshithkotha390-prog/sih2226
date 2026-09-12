import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlusCircle, History, TrendingUp, ShieldAlert, User } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const BottomNavigation: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();

  // Hide bottom navigation on auth screens and full-screen focused flows
  const hideOnPaths = ['/login', '/signup', '/detect'];
  if (hideOnPaths.includes(location.pathname)) {
    return null;
  }

  const navItems = [
    { to: '/home', icon: Home, label: t('home') },
    { to: '/sell', icon: PlusCircle, label: t('sell'), highlight: true },
    { to: '/transactions', icon: History, label: t('history') },
    { to: '/earnings', icon: TrendingUp, label: t('earnings') },
    { to: '/safety', icon: ShieldAlert, label: t('safety') }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 py-1.5 sm:py-2">
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => {
                if (item.highlight) {
                  return `flex flex-col items-center justify-center -mt-5 group transition-transform ${
                    isActive ? 'scale-105' : 'hover:scale-105'
                  }`;
                }
                return `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors min-w-[58px] ${
                  isActive
                    ? 'text-[#0F3D2E] font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`;
              }}
            >
              {({ isActive }) => {
                if (item.highlight) {
                  return (
                    <>
                      <div className="w-13 h-13 rounded-full bg-[#C86D2F] hover:bg-[#B85D19] active:bg-[#A35014] text-white flex items-center justify-center shadow-lg shadow-orange-950/25 border-4 border-white transition-all active:scale-95">
                        <Icon className="w-7 h-7 stroke-[2.5]" />
                      </div>
                      <span
                        className={`text-[11px] font-black mt-0.5 tracking-tight ${
                          isActive ? 'text-[#C86D2F]' : 'text-slate-700'
                        }`}
                      >
                        {item.label}
                      </span>
                    </>
                  );
                }

                return (
                  <>
                    <div
                      className={`p-1 rounded-lg transition-colors ${
                        isActive ? 'bg-emerald-950/5 text-[#0F3D2E]' : 'text-slate-500'
                      }`}
                    >
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[11px] mt-0.5 font-bold tracking-tight">{item.label}</span>
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
