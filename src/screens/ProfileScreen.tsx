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
  ExternalLink
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
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header
        title={t('profileTitle')}
        showBack
        onBack={() => navigate('/home')}
      />

      <main className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Collector Profile Card */}
        <Card variant="elevated" className="border-2 border-slate-200 p-5 bg-white space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md flex-shrink-0">
              R
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 truncate">
                  {mockUserProfile.name}
                </h2>
                <Badge variant="emerald" size="sm">
                  Verified
                </Badge>
              </div>
              <p className="text-xs font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{mockUserProfile.badge}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
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
              <span className="font-bold text-slate-900">{mockUserProfile.phone}</span>
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
              <span className="font-bold text-emerald-800">{t('memberTier')}</span>
            </div>
          </div>
        </Card>

        {/* Language Selection Card */}
        <Card variant="default" className="p-4 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-slate-900">Application Language</span>
            </div>
            <button
              onClick={toggleLanguage}
              className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-all cursor-pointer"
            >
              {language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Currently active: {language === 'en' ? 'English (Standard)' : 'हिन्दी (देवनागरी)'}
          </p>
        </Card>

        {/* SIH Hackathon Meta */}
        <Card variant="default" className="p-4 bg-slate-100/80 border border-slate-200 text-xs text-slate-600 space-y-1">
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
