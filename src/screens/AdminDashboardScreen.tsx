import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Users,
  Building2,
  Scale,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Leaf,
  Layers,
  ArrowRight,
  Download,
  Clock,
  Sparkles,
  MapPin,
  FileText,
  Check
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { useLanguage } from '../i18n/LanguageContext';
import { formatINR } from '../utils/formatters';

interface MetricFilter {
  id: 'all' | 'year' | 'quarter' | 'month';
  labelEn: string;
  labelHi: string;
}

const FILTERS: MetricFilter[] = [
  { id: 'all', labelEn: 'All-Time', labelHi: 'कुल समय' },
  { id: 'year', labelEn: 'FY 2025-26', labelHi: 'वित्त वर्ष 2025-26' },
  { id: 'quarter', labelEn: 'This Quarter (Q4)', labelHi: 'यह तिमाही (Q4)' },
  { id: 'month', labelEn: 'This Month (March)', labelHi: 'इस महीने (मार्च)' }
];

export const AdminDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<'all' | 'year' | 'quarter' | 'month'>('all');
  const [downloadToast, setDownloadToast] = useState(false);

  // Scaled realistic mock metrics for Admin Central Dashboard
  const metricsData = {
    all: {
      totalCollectors: '1,248',
      totalRecyclers: '42',
      ewasteTons: '18.6 T',
      completedLots: '3,842',
      totalEarnings: '₹24,85,600',
      totalEarningsRaw: 2485600,
      collectorsDetail: '+112 registered this month',
      recyclersDetail: '100% CPCB / TSPCB authorized',
      ewasteDetail: '18,640 kg diverted from landfills',
      lotsDetail: '99.2% verified scale tare',
      earningsDetail: 'Direct UPI & Bank settlements'
    },
    year: {
      totalCollectors: '960',
      totalRecyclers: '38',
      ewasteTons: '14.2 T',
      completedLots: '2,910',
      totalEarnings: '₹19,20,400',
      totalEarningsRaw: 1920400,
      collectorsDetail: '85% active monthly participation',
      recyclersDetail: '100% audited for FY 25-26',
      ewasteDetail: '14,200 kg verified processing',
      lotsDetail: 'Zero compliance flags',
      earningsDetail: 'Average ₹20,000/collector'
    },
    quarter: {
      totalCollectors: '620',
      totalRecyclers: '32',
      ewasteTons: '5.8 T',
      completedLots: '1,180',
      totalEarnings: '₹7,92,000',
      totalEarningsRaw: 792000,
      collectorsDetail: '+44 onboarding batches',
      recyclersDetail: '4 newly onboarded facilities',
      ewasteDetail: '5,800 kg processed in Q4',
      lotsDetail: 'Average 4.9 kg/lot',
      earningsDetail: '₹671 avg rate/kg'
    },
    month: {
      totalCollectors: '410',
      totalRecyclers: '24',
      ewasteTons: '2.1 T',
      completedLots: '428',
      totalEarnings: '₹2,84,500',
      totalEarningsRaw: 284500,
      collectorsDetail: '+28 onboarding this week',
      recyclersDetail: 'Active intake pickups daily',
      ewasteDetail: '2,100 kg logged in March',
      lotsDetail: '100% verified digital tare',
      earningsDetail: 'Immediate T+0 settlement'
    }
  };

  const currentMetrics = metricsData[activeFilter];

  const handleExportManifest = () => {
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(null as any), 3500);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-24">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <Header
          title={language === 'hi' ? 'व्यवस्थापक डैशबोर्ड / Admin' : 'Admin Dashboard / व्यवस्थापक'}
          showBack
          onBack={() => navigate('/home')}
        />
      </div>

      {/* Desktop Minimalism Sticky Sub-Header */}
      <div className="hidden lg:flex h-16 bg-white border-b border-slate-200/90 px-8 items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0F3D2E] text-white flex items-center justify-center font-black shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-[#121820]">
              {language === 'hi' ? 'केंद्रीय व्यवस्थापक डैशबोर्ड' : 'Central Admin Dashboard'}
            </h1>
            <p className="text-[11px] font-semibold text-slate-500">
              CPCB National E-Waste Handover & Formalization Registry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="emerald" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            CPCB Central Node Active
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportManifest}
            icon={<Download className="w-3.5 h-3.5" />}
            iconPosition="left"
            className="text-xs font-bold text-slate-700 border-slate-300 hover:border-[#0F3D2E] hover:text-[#0F3D2E]"
          >
            Export CPCB Audit Log
          </Button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Export Notification Toast */}
        {downloadToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-950/5 border-2 border-emerald-800/30 text-[#0F3D2E] text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#0F3D2E] flex-shrink-0" />
              <span>CPCB Form-2 compliance manifest & lot audit logs exported successfully (JSON/CSV).</span>
            </div>
            <button
              onClick={() => setDownloadToast(false)}
              className="text-xs text-[#0F3D2E] font-extrabold px-1 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Hero Banner: Platform Level Overview */}
        <div className="bg-[#0F3D2E] text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden border border-emerald-800/40">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-200 bg-[#121820]/40 px-3 py-1 rounded-full border border-emerald-700/60">
                  SIH 2026 National Portal
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-100/90 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  Reg: CPCB/E-WASTE/2026-IND-094
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Formal E-Waste Handover Management
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl font-medium leading-relaxed">
                Central regulatory authority dashboard overseeing collector onboarding, digital tare scale verification, verified fair payouts, and authorized CPCB recycling stream diversion.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex-shrink-0 min-w-[220px]">
              <span className="text-[11px] uppercase tracking-wider text-emerald-200 font-bold block">
                Total Fair Payouts
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono block mt-1">
                {currentMetrics.totalEarnings}
              </span>
              <span className="text-[11px] text-emerald-200/90 font-medium block mt-1 font-mono">
                100% direct bank / UPI settlement
              </span>
            </div>
          </div>
        </div>

        {/* Filter Timeframe Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === f.id
                    ? 'bg-[#0F3D2E] text-white shadow-xs border border-[#0F3D2E]'
                    : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50'
                }`}
              >
                {language === 'hi' ? f.labelHi : f.labelEn}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-bold hidden sm:inline-block">
            Data aggregated from shared store & TSPCB registry
          </span>
        </div>

        {/* 5 STATIC PRIMARY CARDS (Matching existing card style) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Card 1: Total Collectors */}
          <Card
            padding="sm"
            className="bg-white text-center border border-slate-200/90 rounded-2xl shadow-sm hover:border-[#0F3D2E]/40 transition-all space-y-1.5"
          >
            <div className="w-8 h-8 mx-auto rounded-xl bg-emerald-950/5 text-[#0F3D2E] flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Collectors
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#121820] block font-mono">
              {currentMetrics.totalCollectors}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block truncate">
              {currentMetrics.collectorsDetail}
            </span>
          </Card>

          {/* Card 2: Total Recyclers */}
          <Card
            padding="sm"
            className="bg-white text-center border border-slate-200/90 rounded-2xl shadow-sm hover:border-[#0F3D2E]/40 transition-all space-y-1.5"
          >
            <div className="w-8 h-8 mx-auto rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Recyclers
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#121820] block font-mono">
              {currentMetrics.totalRecyclers}
            </span>
            <span className="text-[10px] text-blue-700 font-semibold block truncate">
              {currentMetrics.recyclersDetail}
            </span>
          </Card>

          {/* Card 3: E-Waste Collected (Tons) */}
          <Card
            padding="sm"
            className="bg-white text-center border border-slate-200/90 rounded-2xl shadow-sm hover:border-[#0F3D2E]/40 transition-all space-y-1.5"
          >
            <div className="w-8 h-8 mx-auto rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              E-Waste Collected
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#121820] block font-mono">
              {currentMetrics.ewasteTons}
            </span>
            <span className="text-[10px] text-purple-700 font-semibold block truncate">
              {currentMetrics.ewasteDetail}
            </span>
          </Card>

          {/* Card 4: Completed Lots */}
          <Card
            padding="sm"
            className="bg-white text-center border border-slate-200/90 rounded-2xl shadow-sm hover:border-[#0F3D2E]/40 transition-all space-y-1.5"
          >
            <div className="w-8 h-8 mx-auto rounded-xl bg-emerald-950/5 text-[#0F3D2E] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Completed Lots
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#0F3D2E] block font-mono">
              {currentMetrics.completedLots}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold block truncate">
              {currentMetrics.lotsDetail}
            </span>
          </Card>

          {/* Card 5: Total Collector Earnings */}
          <Card
            padding="sm"
            className="bg-white text-center border border-slate-200/90 rounded-2xl shadow-sm hover:border-[#C86D2F]/40 transition-all space-y-1.5 col-span-2 sm:col-span-1"
          >
            <div className="w-8 h-8 mx-auto rounded-xl bg-orange-50 text-[#C86D2F] flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Earnings
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#C86D2F] block font-mono">
              {currentMetrics.totalEarnings}
            </span>
            <span className="text-[10px] text-[#C86D2F] font-semibold block truncate">
              {currentMetrics.earningsDetail}
            </span>
          </Card>
        </div>

        {/* Secondary Row: Material Stream Distribution & Environmental Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* E-Waste Diversion by Material (8 cols) */}
          <Card variant="elevated" className="lg:col-span-8 p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0F3D2E]" />
                <h3 className="text-sm font-black uppercase tracking-wider text-[#121820]">
                  E-Waste Diversion by Material Stream
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#0F3D2E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">CPCB Category A/B</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. PCB Stream */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">Circuit Boards (PCB)</span>
                  <span className="text-xs font-mono font-black text-[#0F3D2E]">8.4 Tons (45%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-[#0F3D2E] rounded-full" style={{ width: '45%' }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold font-mono">
                  <span>Rate: ₹125 - ₹140/kg</span>
                  <span className="font-bold text-slate-900">₹11.2 Lakhs</span>
                </div>
              </div>

              {/* 2. Copper Stream */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">Copper Cable & Wiring</span>
                  <span className="text-xs font-mono font-black text-[#C86D2F]">4.8 Tons (26%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-[#C86D2F] rounded-full" style={{ width: '26%' }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold font-mono">
                  <span>Rate: ₹500 - ₹540/kg</span>
                  <span className="font-bold text-slate-900">₹7.4 Lakhs</span>
                </div>
              </div>

              {/* 3. Battery Stream */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">Lithium Batteries</span>
                  <span className="text-xs font-mono font-black text-purple-700">3.2 Tons (17%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: '17%' }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold font-mono">
                  <span>Hazardous Class IX</span>
                  <span className="font-bold text-slate-900">₹3.8 Lakhs</span>
                </div>
              </div>

              {/* 4. Display Stream */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">LCD Display Units</span>
                  <span className="text-xs font-mono font-black text-[#D97706]">2.2 Tons (12%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-[#D97706] rounded-full" style={{ width: '12%' }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold font-mono">
                  <span>Mercury Neutralized</span>
                  <span className="font-bold text-slate-900">₹2.45 Lakhs</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Environmental Net Impact (4 cols) */}
          <Card
            variant="default"
            className="lg:col-span-4 p-5 bg-emerald-950/5 border-2 border-[#0F3D2E]/30 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-[#0F3D2E]" />
                <h3 className="text-sm font-black text-[#0F3D2E] uppercase tracking-wide">
                  Environmental Impact
                </h3>
              </div>
              <p className="text-xs text-[#0F3D2E]/90 font-medium">
                Certified savings calculated via CPCB formal e-waste conversion algorithm:
              </p>

              <div className="space-y-3 mt-4 text-xs font-bold text-[#0F3D2E]">
                <div className="p-3 bg-white rounded-xl border border-emerald-200/60 shadow-xs">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Carbon Offset</span>
                  <span className="text-lg font-black text-[#0F3D2E] font-mono">41.2 Tons CO₂</span>
                  <span className="text-[10px] text-slate-500 block">Equivalent to 1,840 trees planted</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200/60 shadow-xs">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Heavy Metals Isolated</span>
                  <span className="text-lg font-black text-[#0F3D2E] font-mono">1,480 kg Toxic Metals</span>
                  <span className="text-[10px] text-slate-500 block">Lead, Cadmium & Mercury contained</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/safety')}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="w-full text-xs font-bold border-emerald-800/30 text-[#0F3D2E] bg-white hover:bg-[#0F3D2E] hover:text-white transition-colors"
              >
                View Safety & Compliance Protocols
              </Button>
            </div>
          </Card>
        </div>

        {/* Regional Cluster Breakdown & Recent Compliance Log */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Regional Clusters */}
          <Card className="lg:col-span-6 p-5 bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#121820] pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Authorized Regional Processing Hubs</span>
              <span className="text-xs text-slate-400 font-normal">Telangana Cluster</span>
            </h3>

            <div className="space-y-2.5">
              {[
                { name: 'Hyderabad Central (IDA Cherlapally & Nacharam)', tons: '7.6 Tons', recyclers: '16 Facilities', active: true },
                { name: 'Cyberabad Industrial Hub (Jeedimetla & Balanagar)', tons: '6.2 Tons', recyclers: '14 Facilities', active: true },
                { name: 'Secunderabad & Medchal Gateway', tons: '4.8 Tons', recyclers: '12 Facilities', active: true }
              ].map((hub, idx) => (
                <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/5 text-[#0F3D2E] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800">{hub.name}</p>
                      <p className="text-[11px] text-slate-500">{hub.recyclers} • 100% CPCB licensed</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#121820] font-mono">{hub.tons}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent CPCB Compliance Verification Logs */}
          <Card className="lg:col-span-6 p-5 bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#121820] pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Live Platform Audit Logs</span>
              <span className="text-[10px] font-mono font-bold text-[#0F3D2E] bg-emerald-950/5 px-2 py-0.5 rounded-full border border-emerald-800/20">
                Encrypted
              </span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                { log: 'Lot KC-00128 weight calibrated (25 kg Copper)', facility: 'GreenCycle Cherlapally', status: 'Audit Passed', time: '12 mins ago' },
                { log: 'TS-PCB Annual License Renewal Verified', facility: 'EcoRecover Hyd', status: 'Active', time: '1 hour ago' },
                { log: 'Instant UPI Payout Disbursed (Lot KC-00127)', facility: 'National Payment Gateway', status: 'Settled', time: '3 hours ago' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{item.log}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{item.facility} • {item.time}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950/10 text-[#0F3D2E] border border-emerald-800/20 flex-shrink-0">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Portal Switcher Actions */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#0F3D2E]" />
            <span>Switch portals to test collector or recycler perspectives in real time:</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/home')}
              className="text-xs font-bold hover:border-[#0F3D2E] hover:text-[#0F3D2E]"
            >
              Collector Home
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/recycler-dashboard')}
              className="text-xs font-bold hover:border-[#0F3D2E] hover:text-[#0F3D2E]"
            >
              Recycler Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
