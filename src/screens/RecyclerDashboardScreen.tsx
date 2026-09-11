import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Package,
  Clock,
  CheckCircle2,
  Eye,
  Check,
  Scale,
  ArrowRight,
  TrendingUp,
  MapPin,
  Phone
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingState } from '../components/LoadingState';
import { useLanguage } from '../i18n/LanguageContext';
import { formatINR } from '../utils/formatters';
import { getAllLots, acceptLot } from '../services/recyclingService';
import { DigitalLot } from '../types';

export const RecyclerDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [lots, setLots] = useState<DigitalLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Incoming' | 'Completed'>('All');
  const [acceptedToast, setAcceptedToast] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getAllLots().then((data) => {
      setLots(data);
      setIsLoading(false);
    });
  }, []);

  const handleAccept = async (lotId: string) => {
    setAcceptingId(lotId);
    try {
      const updated = await acceptLot(lotId);
      if (updated) {
        setLots((prev) =>
          prev.map((l) => (l.id === lotId ? { ...l, verificationSteps: { ...l.verificationSteps, recyclerApproved: true } } : l))
        );
        setAcceptedToast(`Lot ${lotId} successfully accepted for GreenCycle facility pickup.`);
        setTimeout(() => setAcceptedToast(null), 4000);
      }
    } finally {
      setAcceptingId(null);
    }
  };

  // Summary Metrics calculations
  const incomingLots = lots.filter(
    (l) => l.status === 'awaiting_handover' && !l.verificationSteps?.recyclerApproved
  );
  const pendingLots = lots.filter((l) => l.status === 'awaiting_handover');
  const completedLots = lots.filter((l) => l.status === 'completed');
  const totalWeightKg = lots.reduce((sum, l) => sum + (l.weightKg || 0), 0);
  const totalWeightTons = (totalWeightKg / 1000).toFixed(2);

  // Filtered lots for the list
  const filteredLots = lots.filter((l) => {
    if (filter === 'Incoming') return l.status === 'awaiting_handover';
    if (filter === 'Completed') return l.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-24">
      <Header
        title="Recycler Dashboard"
        showBack
        onBack={() => navigate('/home')}
      />

      <main className="max-w-xl lg:max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Recycler Facility Hero Banner - Command Center */}
        <div className="bg-[#0F3D2E] text-white rounded-2xl p-6 shadow-md border border-emerald-800/60 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300 block mb-1">
                Authorized Formal Recycler
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                GreenCycle Facility
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 font-mono font-bold backdrop-blur-xs border border-white/20">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>TSPCB/E-WASTE/HYD/2023-881</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 font-medium border border-white/10">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  <span>IDA Cherlapally, Hyderabad</span>
                </span>
              </div>
            </div>
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs items-center justify-center border border-white/20">
              <Building2 className="w-6 h-6 text-emerald-200" />
            </div>
          </div>
        </div>

        {/* 4 Summary Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. Incoming Lots */}
          <Card padding="sm" className="bg-white text-center border border-slate-200/90 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Incoming Lots
            </span>
            <span className="text-xl sm:text-2xl font-mono font-black text-slate-900 block mt-1">
              {incomingLots.length}
            </span>
          </Card>

          {/* 2. Pending */}
          <Card padding="sm" className="bg-white text-center border border-slate-200/90 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Pending
            </span>
            <span className="text-xl sm:text-2xl font-mono font-black text-[#D97706] block mt-1">
              {pendingLots.length}
            </span>
          </Card>

          {/* 3. Completed */}
          <Card padding="sm" className="bg-white text-center border border-slate-200/90 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Completed
            </span>
            <span className="text-xl sm:text-2xl font-mono font-black text-[#0F3D2E] block mt-1">
              {completedLots.length}
            </span>
          </Card>

          {/* 4. Total Weight (Tons) */}
          <Card padding="sm" className="bg-white text-center border border-slate-200/90 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Total Weight (Tons)
            </span>
            <span className="text-xl sm:text-2xl font-mono font-black text-slate-900 block mt-1">
              {totalWeightTons} T
            </span>
          </Card>
        </div>

        {/* Acceptance Feedback Banner */}
        {acceptedToast && (
          <div className="p-4 bg-[#0F3D2E]/10 border-2 border-[#0F3D2E]/30 rounded-2xl flex items-center gap-3 text-[#0F3D2E] text-xs sm:text-sm font-bold shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-[#0F3D2E] flex-shrink-0" />
            <span>{acceptedToast}</span>
          </div>
        )}

        {/* Incoming Lots Section */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-base font-extrabold text-slate-900">
              Incoming Lots
            </h3>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(['All', 'Incoming', 'Completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filter === tab
                      ? 'bg-[#0F3D2E] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <LoadingState message="Loading recycler lots..." />
          ) : filteredLots.length > 0 ? (
            <div className="space-y-2.5">
              {filteredLots.map((lot) => {
                const isAccepted = lot.verificationSteps?.recyclerApproved;
                const isCompleted = lot.status === 'completed';

                return (
                  <Card
                    key={lot.id}
                    padding="sm"
                    className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Lot Details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            {lot.id}
                          </span>
                          <span className="text-sm font-extrabold text-slate-900">
                            {lot.materialName} ({lot.weightKg} kg)
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              isCompleted
                                ? 'bg-[#0F3D2E]/10 text-[#0F3D2E]'
                                : isAccepted
                                ? 'bg-blue-50 text-blue-800'
                                : 'bg-amber-50 text-amber-900'
                            }`}
                          >
                            {isCompleted ? 'Completed' : isAccepted ? 'Accepted' : 'Incoming'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                          <span>
                            Collector: <b className="text-slate-700">{lot.collectorName}</b>
                          </span>
                          <span>•</span>
                          <span>
                            Offered Price:{' '}
                            <b className="text-[#0F3D2E] font-mono font-extrabold">
                              {formatINR(lot.recyclerPayout)}
                            </b>{' '}
                            <span className="text-[11px] font-mono text-slate-400">
                              (₹{lot.recyclerOfferPerKg}/kg)
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions [View] [Accept] */}
                      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/lot/${lot.id}?from=recycler`)}
                          icon={<Eye className="w-3.5 h-3.5" />}
                          iconPosition="left"
                          className="px-3 py-1.5 text-xs font-bold text-slate-700"
                        >
                          View
                        </Button>

                        {isCompleted ? (
                          <span className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 rounded-xl inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        ) : isAccepted ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/lot/${lot.id}?from=recycler`)}
                            icon={<Scale className="w-3.5 h-3.5 text-[#0F3D2E]" />}
                            iconPosition="left"
                            className="px-3 py-1.5 text-xs font-bold border-[#0F3D2E]/40 text-[#0F3D2E] hover:bg-[#0F3D2E]/5"
                          >
                            Verify Weight
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={acceptingId === lot.id}
                            isLoading={acceptingId === lot.id}
                            onClick={() => handleAccept(lot.id)}
                            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            iconPosition="left"
                            className="px-3 py-1.5 text-xs font-black text-white shadow-sm"
                          >
                            Accept
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card padding="md" className="bg-white text-center border border-slate-200 py-8">
              <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No lots found under this filter</p>
              <p className="text-xs text-slate-400 mt-0.5">
                New collector handovers matched with GreenCycle will appear here.
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};
