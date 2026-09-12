import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Globe2,
  LogOut,
  Award,
  Building2
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { mockUserProfile } from '../services/mockData';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, signOut, role } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.name || mockUserProfile.name;
  const displayPhone = user?.phone || mockUserProfile.phone;
  const displayEmail = user?.email || 'ramesh.collector@kabadiconnect.in';
  const displayLocation = user?.location || mockUserProfile.location;
  const displayBadge = user?.badge || mockUserProfile.badge;
  const displayMemberSince = user?.memberSince || mockUserProfile.memberSince;
  const initial = displayName.charAt(0).toUpperCase();

  const roleLabel =
    role === 'admin'
      ? t('roleAdmin')
      : role === 'recycler'
      ? t('roleRecycler')
      : t('roleUser');

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-24">
      <Header
        title={t('profileTitle')}
        showBack
        onBack={() => navigate('/home')}
      />

      <main className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* User Profile Card */}
        <Card variant="elevated" className="border border-slate-200/90 rounded-2xl p-5 bg-white space-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-[#0F3D2E] text-white flex items-center justify-center font-black text-2xl shadow-md flex-shrink-0 font-mono">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#121820] truncate">
                  {displayName}
                </h2>
                <Badge variant="emerald" size="sm">
                  {t('verified')}
                </Badge>
              </div>
              <p className="text-xs font-bold text-[#0F3D2E] flex items-center gap-1 mt-0.5 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F3D2E] flex-shrink-0" />
                <span>{displayBadge}</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Member since {displayMemberSince}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {t('phoneLabel')}
              </span>
              <span className="font-bold text-slate-900 font-mono">{displayPhone}</span>
            </div>

            {displayEmail && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {t('enterEmail')}
                </span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{displayEmail}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {t('assignedHub')}
              </span>
              <span className="font-bold text-slate-900">{displayLocation}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                {t('role')}
              </span>
              <span className="font-bold text-[#0F3D2E] truncate max-w-[220px]">{roleLabel}</span>
            </div>
          </div>
        </Card>

        {/* 6-Language Selection Card */}
        <Card variant="default" className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-[#0F3D2E]" />
              <span className="text-sm font-black text-[#121820]">{t('language')} (6 Languages)</span>
            </div>
            <LanguageSelector variant="compact" />
          </div>
          <LanguageSelector variant="inline" />
        </Card>

        {/* Display Mode / Theme Card */}
        <Card variant="default" className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-sm">
          <ThemeToggle variant="expanded" />
          <p className="text-xs text-slate-500">
            Switch between Light (daylight/outdoor), Normal (SIH brand mineral), and Dark (low-light technical charcoal) modes.
          </p>
        </Card>

        {/* Portals & Dashboards Card */}
        <Card variant="default" className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2.5 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-[#0F3D2E]" />
            <span className="text-sm font-black text-[#121820]">{t('platformPortals')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => navigate('/recycler-dashboard')}
              className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 hover:border-[#0F3D2E]/40 text-left transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-800 block">🏭 {t('recycler')}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{t('recyclerDashboardTitle')}</span>
            </button>
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 hover:border-[#0F3D2E]/40 text-left transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-800 block">📊 {t('admin')}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{t('adminDashboardTitle')}</span>
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
