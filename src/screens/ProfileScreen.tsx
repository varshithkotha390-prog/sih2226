import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Globe2,
  LogOut,
  Award,
  ChevronRight,
  ExternalLink,
  Building2
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { useLanguage } from '../i18n/LanguageContext';
import { mockUserProfile } from '../services/mockData';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, toggleLanguage } = useLanguage();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-24">
      <Header
        title={t('profileTitle')}
        showBack
        onBack={() => navigate('/home')}
      />

      <main className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Collector Profile Card */}
        <Card variant="elevated" className="border border-slate-200/90 rounded-2xl p-5 bg-white space-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-[#0F3D2E] text-white flex items-center justify-center font-black text-2xl shadow-md flex-shrink-0 font-mono">
              R
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#121820] truncate">
                  {mockUserProfile.name}
                </h2>
                <Badge variant="emerald" size="sm">
                  Verified
                </Badge>
              </div>
              <p className="text-xs font-bold text-[#0F3D2E] flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F3D2E]" />
                <span>{mockUserProfile.badge}</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Collector since {mockUserProfile.memberSince}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {t('phoneLabel')}
              </span>
              <span className="font-bold text-slate-900 font-mono">{mockUserProfile.phone}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {t('assignedHub')}
              </span>
              <span className="font-bold text-slate-900">{mockUserProfile.location}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                Tier Status
              </span>
              <span className="font-bold text-[#0F3D2E]">{t('memberTier')}</span>
            </div>
          </div>
        </Card>

        {/* Language Selection Card */}
        <Card variant="default" className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-[#0F3D2E]" />
              <span className="text-sm font-black text-[#121820]">Application Language</span>
            </div>
            <button
              onClick={toggleLanguage}
              className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-950/5 text-[#0F3D2E] border border-emerald-800/20 hover:bg-emerald-950/10 transition-all cursor-pointer"
            >
              {language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Currently active: {language === 'en' ? 'English (Standard)' : 'हिन्दी (देवनागरी)'}
          </p>
        </Card>

        {/* Portals & Dashboards Card */}
        <Card variant="default" className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2.5 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-[#0F3D2E]" />
            <span className="text-sm font-black text-[#121820]">Platform Portals</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => navigate('/recycler-dashboard')}
              className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 hover:border-[#0F3D2E]/40 text-left transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-800 block">🏭 Recycler Dashboard</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Incoming & verified lots</span>
            </button>
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 hover:border-[#0F3D2E]/40 text-left transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-800 block">📊 Admin Dashboard</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">CPCB metrics & totals</span>
            </button>
          </div>
        </Card>

        {/* SIH Hackathon Meta */}
        <Card variant="default" className="p-4 bg-slate-100/80 border border-slate-200/80 rounded-2xl text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">{t('appVersion')}</p>
          <p className="text-slate-500">
            Smart India Hackathon 2026 Innovation Challenge • Problem Statement: Formalization of E-Waste Material Handover.
          </p>
        </Card>

        {/* Logout Button */}
        <div className="pt-2">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="lg"
            icon={<LogOut className="w-5 h-5 text-rose-600" />}
            iconPosition="left"
            className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300"
          >
            {t('logoutBtn')}
          </Button>
        </div>
      </main>
    </div>
  );
};
