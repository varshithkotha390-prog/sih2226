import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Scale,
  Phone,
  User,
  Check,
  Receipt,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { StatusBadge } from '../components/StatusBadge';
import { Badge } from '../components/Badge';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { LoadingState } from '../components/LoadingState';
import { useLanguage } from '../i18n/LanguageContext';
import { useSellFlow } from '../context/SellFlowContext';
import { getLot, acceptLot, confirmHandover } from '../services/recyclingService';
import { formatINR } from '../utils/formatters';
import { DigitalLot } from '../types';
import { getMaterialName, getMaterialCategory } from '../services/mockData';

export const LotScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { state, setActiveLot } = useSellFlow();

  const isFromRecycler = searchParams.get('from') === 'recycler';
  const lotId = id || 'KC-00127';

  // Determine active view mode: Recycler verification or Collector manifest
  const [viewMode, setViewMode] = useState<'recycler' | 'collector'>(
    isFromRecycler || lotId !== 'KC-00127' ? 'recycler' : 'collector'
  );

  const [lot, setLot] = useState<DigitalLot | null>(state.activeLot);
  const [isLoading, setIsLoading] = useState(!state.activeLot);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [weightInput, setWeightInput] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'info';
    text: string;
  } | null>(null);

  useEffect(() => {
    getLot(lotId).then((res) => {
      if (res) {
        setLot(res);
        setActiveLot(res);
        setWeightInput(res.weightKg.toString());
      }
      setIsLoading(false);
    });
  }, [lotId]);

  if (isLoading || !lot) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header
          title={viewMode === 'recycler' ? 'Recycler Lot Verification' : t('lotTitle')}
          showBack
          onBack={() => navigate(viewMode === 'recycler' ? '/recycler-dashboard' : '/recyclers')}
        />
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
          <LoadingState
            message={
              language === 'hi' ? 'लॉट विवरण लोड हो रहा है...' :
              language === 'te' ? 'లాట్ వివరాలు లోడ్ అవుతున్నాయి...' :
              language === 'ta' ? 'லாட் விவரங்கள் ஏற்றப்படுகின்றன...' :
              language === 'kn' ? 'ಲಾಟ್ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...' :
              language === 'ml' ? 'ലോട്ട് വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...' :
              'Loading lot verification details...'
            }
            submessage={
              language === 'hi' ? 'सीपीसीबी अनुपालन और वजन रिकॉर्ड सुरक्षित किया जा रहा है' :
              language === 'te' ? 'CPCB సమ్మతి మరియు బరువు రికార్డులను పొందుతోంది' :
              language === 'ta' ? 'சிபிசிபி இணக்கம் மற்றும் எடை பதிவுகள் பெறப்படுகின்றன' :
              language === 'kn' ? 'CPCB ಅನುಸರಣೆ ಮತ್ತು ತೂಕದ ದಾಖಲೆಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ' :
              language === 'ml' ? 'CPCB പാലിക്കലും ഭാര രേഖകളും ലഭ്യമാക്കുന്നു' :
              'Fetching CPCB compliance manifest'
            }
          />
        </div>
      </div>
    );
  }

  const isAccepted = Boolean(lot.verificationSteps?.recyclerApproved);
  const isCompleted = lot.status === 'completed';

  // Real-time recalculation based on verified weight
  const parsedWeight = parseFloat(weightInput) || 0;
  const recalculatedPayout = Math.round(parsedWeight * lot.recyclerOfferPerKg);
  const weightDiff = Number((parsedWeight - lot.weightKg).toFixed(2));
  const payoutDiff = recalculatedPayout - lot.recyclerPayout;

  // Recycler Action 1: Accept Lot
  const handleAcceptLot = async () => {
    setIsAccepting(true);
    try {
      const updated = await acceptLot(lot.id);
      if (updated) {
        setLot(updated);
        setActiveLot(updated);
        setToastMessage({
          type: 'success',
          text: `Lot ${lot.id} accepted! Please proceed to verify physical weight.`
        });
        setTimeout(() => setToastMessage(null), 4500);
      }
    } finally {
      setIsAccepting(false);
    }
  };

  // Recycler Action 2: Verify Weight & Confirm Handover
  const handleConfirmHandover = async () => {
    if (parsedWeight <= 0 || isNaN(parsedWeight)) {
      setToastMessage({
        type: 'info',
        text: 'Please enter a valid physical weight in kg.'
      });
      return;
    }

    setIsConfirming(true);
    try {
      const updated = await confirmHandover(lot.id, parsedWeight);
      setLot(updated);
      setActiveLot(updated);
      setToastMessage({
        type: 'success',
        text: `✓ Handover confirmed! Payment of ₹${updated.recyclerPayout.toLocaleString('en-IN')} disbursed to ${updated.collectorName}.`
      });
    } finally {
      setIsConfirming(false);
    }
  };

  // Collector Action: Proceed to Handover QR
  const handleProceedToHandover = () => {
    navigate(`/handover/${lot.id}`);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-28">
      <Header
        title={viewMode === 'recycler' ? 'Recycler Lot Verification' : t('lotTitle')}
        showBack
        onBack={() => navigate(viewMode === 'recycler' ? '/recycler-dashboard' : '/recyclers')}
      />

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-xl mx-auto px-4 sm:px-6 py-4 space-y-4"
      >
        {/* Role View Mode Switcher */}
        <div className="flex items-center justify-between bg-slate-200/80 p-1 rounded-2xl text-xs font-bold shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode('recycler')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              viewMode === 'recycler'
                ? 'bg-[#0F3D2E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Recycler Verification</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('collector')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              viewMode === 'collector'
                ? 'bg-[#0F3D2E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Collector Manifest</span>
          </button>
        </div>

        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-[#0F3D2E]/10 border-2 border-[#0F3D2E]/30 text-[#0F3D2E] text-sm font-bold flex items-center justify-between shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#0F3D2E] flex-shrink-0" />
                <span>{toastMessage.text}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-xs text-[#0F3D2E] hover:text-[#0B2F23] font-extrabold cursor-pointer px-1"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collector View Step Indicator */}
        {viewMode === 'collector' && <ProgressIndicator currentStage={4} />}

        {/* Lot Header Hero Badge - Command Center */}
        <div className="bg-[#0F3D2E] text-white p-5 rounded-2xl shadow-md space-y-2 relative overflow-hidden border border-emerald-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>
                {viewMode === 'recycler' ? 'Recycler Intake Manifest' : 'SIH Digital Manifest'}
              </span>
            </span>
            <StatusBadge status={lot.status === 'awaiting_handover' ? 'Pending' : lot.status} />
          </div>

          <div className="pt-1">
            <span className="text-xs font-bold text-emerald-200">Lot Identifier</span>
            <h2 className="text-3xl font-black font-mono tracking-tight text-white">
              {lot.id}
            </h2>
          </div>

          <div className="flex items-center justify-between text-xs text-emerald-100/90 font-mono font-medium">
            <span>Timestamped: {lot.createdAt}</span>
            <span>{lot.location || 'Hyderabad'}</span>
          </div>
        </div>

        {/* RECYCLER WORKFLOW SECTION */}
        {viewMode === 'recycler' ? (
          <div className="space-y-4">
            {/* Lot Details Summary Card */}
            <Card variant="elevated" className="border border-slate-200/90 p-5 bg-white space-y-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
                  Lot Specifications
                </h3>
                <span className="text-xs font-bold font-mono text-slate-400">CPCB-APPROVED</span>
              </div>

              {/* Material & Submitted Weight */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-500 block">Material</span>
                  <span className="text-lg font-black text-slate-900">{getMaterialName(lot.materialName || lot.materialId, language)}</span>
                  <span className="text-xs font-semibold text-slate-500 block">
                    {getMaterialCategory(lot.materialCategory, language)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 block">Submitted Weight</span>
                  <span className="text-lg font-mono font-black text-slate-900">{lot.weightKg} kg</span>
                  <span className="text-xs text-slate-400 font-medium block">Collector logged</span>
                </div>
              </div>

              {/* Collector Contact & Recycler Info */}
              <div className="space-y-2.5 pb-3 border-b border-slate-100 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Collector Name:</span>
                  </span>
                  <span className="font-bold text-slate-900">{lot.collectorName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>Collector Contact:</span>
                  </span>
                  <a
                    href={`tel:${lot.collectorPhone}`}
                    className="font-mono font-bold text-[#0F3D2E] hover:underline flex items-center gap-1"
                  >
                    <span>{lot.collectorPhone}</span>
                  </a>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>Recycler Facility:</span>
                  </span>
                  <span className="font-bold text-slate-900">{lot.recyclerName}</span>
                </div>
              </div>

              {/* Offered Price & Payout */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-600">Unit Offer Rate:</span>
                  <span className="font-mono font-bold text-slate-800">₹{lot.recyclerOfferPerKg}/kg</span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span className="font-bold text-slate-900">Offered Payout:</span>
                  <span className="font-mono font-black text-[#0F3D2E] text-2xl">
                    {formatINR(lot.recyclerPayout)}
                  </span>
                </div>
              </div>
            </Card>

            {/* STEP 1: If not yet accepted, show [Accept Lot] */}
            {!isAccepted && !isCompleted && (
              <Card variant="default" className="border-2 border-amber-300 bg-amber-50/70 p-5 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center flex-shrink-0 font-mono font-black">
                    1
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-amber-950">
                      Incoming Lot Intake Required
                    </h4>
                    <p className="text-xs font-semibold text-amber-900 mt-0.5">
                      Accept this lot to initiate physical weigh-in and calibrated scale tare verification.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleAcceptLot}
                  variant="primary"
                  size="xl"
                  isLoading={isAccepting}
                  icon={<CheckCircle2 className="w-6 h-6" />}
                  iconPosition="left"
                  className="w-full py-4 text-base font-black tracking-wide"
                >
                  Accept Lot
                </Button>
              </Card>
            )}

            {/* STEP 2: Once accepted & not completed, show [Verify Weight] Form & [Confirm Handover] */}
            {isAccepted && !isCompleted && (
              <Card variant="elevated" className="border border-slate-200/90 bg-white p-5 space-y-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#0F3D2E]/10 text-[#0F3D2E] flex items-center justify-center font-bold">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">
                        Step 2: Verify Weight
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Digital tare verification form
                      </p>
                    </div>
                  </div>
                  <Badge variant="emerald" size="sm">
                    Accepted ✓
                  </Badge>
                </div>

                {/* Pre-filled editable weight input */}
                <div className="space-y-2">
                  <Input
                    label="Verified Physical Weight (kg)"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    suffix="kg"
                    helperText={`Pre-filled with collector's submitted weight: ${lot.weightKg} kg. Edit to match calibrated facility scale tare.`}
                    inputSize="lg"
                  />
                </div>

                {/* Real-time Recalculated Payout Card */}
                <div className="p-4 rounded-2xl bg-[#0F3D2E]/5 border border-[#0F3D2E]/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Recycler Rate:</span>
                    <span className="font-mono">₹{lot.recyclerOfferPerKg} / kg</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Verified Scale Weight:</span>
                    <span className="font-mono">{parsedWeight} kg</span>
                  </div>

                  <div className="pt-2 border-t border-[#0F3D2E]/20 flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900">
                      Updated Handover Payout:
                    </span>
                    <span className="text-2xl font-mono font-black text-[#0F3D2E]">
                      {formatINR(recalculatedPayout)}
                    </span>
                  </div>

                  {/* Discrepancy indicator */}
                  {weightDiff !== 0 && (
                    <div className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200">
                      Tare adjustment: {weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg (
                      {payoutDiff >= 0 ? `+₹${payoutDiff}` : `-₹${Math.abs(payoutDiff)}`})
                    </div>
                  )}
                </div>

                {/* Confirm Handover Button */}
                <Button
                  onClick={handleConfirmHandover}
                  variant="primary"
                  size="xl"
                  isLoading={isConfirming}
                  icon={<CheckCircle2 className="w-6 h-6" />}
                  iconPosition="left"
                  className="w-full py-4 text-base font-black tracking-wide"
                >
                  Confirm Handover
                </Button>
                <p className="text-center text-xs font-semibold text-slate-400">
                  Marks lot as Completed and updates collector earnings immediately
                </p>
              </Card>
            )}

            {/* STEP 3: Completed Success State */}
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {/* Success Card - Command Center */}
                <Card variant="highlight" className="p-6 bg-[#0F3D2E] text-white rounded-2xl space-y-4 shadow-lg shadow-emerald-950/20 border border-emerald-800/60">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-full bg-white/10 text-emerald-300 flex items-center justify-center border border-white/20">
                      <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      ✓ Handover Completed
                    </h3>
                    <p className="text-xs font-bold text-emerald-200">
                      CPCB e-Waste Manifest Verified & Payment Disbursed
                    </p>
                  </div>

                  {/* Key Settlement Metrics */}
                  <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 space-y-2.5 text-xs sm:text-sm text-white">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-100">Final Verified Weight:</span>
                      <span className="font-mono font-black text-white">{lot.weightKg} kg</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-100">Settled Payout Amount:</span>
                      <span className="font-mono font-black text-white text-base sm:text-lg">
                        {formatINR(lot.recyclerPayout)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-100">Disbursed To Collector:</span>
                      <span className="font-bold text-white">{lot.collectorName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-100">Settled Timestamp:</span>
                      <span className="font-mono text-emerald-200">{lot.completedAt || 'Today'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white/10 rounded-xl text-xs font-bold text-emerald-100 flex items-center gap-2 border border-white/10">
                    <ShieldCheck className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                    <span>Shared store updated: Collector's Home, Earnings, & History reflect this instantly.</span>
                  </div>
                </Card>

                {/* Recycler Navigation Buttons */}
                <div className="space-y-2 pt-1">
                  <Button
                    onClick={() => navigate('/recycler-dashboard')}
                    variant="primary"
                    size="lg"
                    icon={<Building2 className="w-5 h-5" />}
                    iconPosition="left"
                    className="w-full py-3.5 text-base font-black"
                  >
                    Back to Recycler Dashboard
                  </Button>

                  <Button
                    onClick={() => navigate('/transactions')}
                    variant="outline"
                    size="md"
                    icon={<Receipt className="w-4 h-4" />}
                    iconPosition="left"
                    className="w-full py-3 text-slate-700 font-bold border-slate-300"
                  >
                    View in Transaction History
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* COLLECTOR WORKFLOW VIEW */
          <div className="space-y-4">
            {/* Detailed Breakdown Card */}
            <Card variant="elevated" className="border border-slate-200/90 p-5 bg-white space-y-4 rounded-2xl shadow-xs">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
                {t('lotDetails')}
              </h3>

              {/* Material & Weight */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-500 block">Material</span>
                  <span className="text-lg font-black text-slate-900">{getMaterialName(lot.materialName || lot.materialId, language)}</span>
                  <span className="text-xs font-semibold text-slate-500 block">
                    {getMaterialCategory(lot.materialCategory, language)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 block">Logged Weight</span>
                  <span className="text-lg font-mono font-black text-slate-900">{lot.weightKg} kg</span>
                  <span className="text-xs text-[#0F3D2E] font-bold">Verified digital tare</span>
                </div>
              </div>

              {/* Price Comparisons */}
              <div className="space-y-2 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between text-sm sm:text-base">
                  <span className="font-semibold text-slate-600">{t('marketEstimateLabel')}</span>
                  <span className="font-mono font-bold text-slate-800">{formatINR(lot.marketEstimate)}</span>
                </div>

                <div className="flex items-center justify-between text-sm sm:text-base">
                  <span className="font-bold text-slate-900">{t('recyclerOfferLabel')}</span>
                  <span className="font-mono font-black text-[#0F3D2E] text-xl">
                    {formatINR(lot.recyclerPayout)}
                  </span>
                </div>

                {lot.bonusAmount > 0 && (
                  <div className="bg-[#0F3D2E]/10 px-3.5 py-2 rounded-xl flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-[#0F3D2E] border border-[#0F3D2E]/20">
                    <span>Authorized Fair Bonus:</span>
                    <span>+₹{lot.bonusAmount}</span>
                  </div>
                )}
              </div>

              {/* Stakeholders: Collector & Recycler */}
              <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">{t('collectorLabel')}</span>
                  <span className="font-bold text-slate-900">
                    {lot.collectorName} (<span className="font-mono">{lot.collectorPhone}</span>)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">{t('recyclerLabel')}</span>
                  <span className="font-bold text-[#0F3D2E]">{lot.recyclerName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">{t('locationLabel')}</span>
                  <span className="font-bold text-slate-900">{lot.location}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-slate-500">{t('statusLabel')}</span>
                  <span className="font-black text-amber-800">
                    {lot.status === 'completed' ? 'Completed' : t('awaitingHandover')}
                  </span>
                </div>
              </div>
            </Card>

            {/* Collector Action: Create Digital Lot / Proceed to QR Handover */}
            {lot.status !== 'completed' ? (
              <div className="pt-2">
                <Button
                  onClick={handleProceedToHandover}
                  variant="primary"
                  size="xl"
                  icon={<QrCode className="w-6 h-6" />}
                  iconPosition="left"
                  className="w-full py-4 text-base font-black tracking-wide"
                >
                  {t('createLotBtn')}
                </Button>
                <p className="text-center text-xs font-medium text-slate-500 mt-2">
                  Opens secure QR code for authorized recycler scan
                </p>
              </div>
            ) : (
              <div className="pt-2">
                <Button
                  onClick={() => navigate('/transactions')}
                  variant="primary"
                  size="xl"
                  icon={<Receipt className="w-6 h-6" />}
                  iconPosition="left"
                  className="w-full py-4 text-base font-black tracking-wide"
                >
                  View Completed Transaction
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.main>
    </div>
  );
};
