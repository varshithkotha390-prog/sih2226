import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Camera, Image as ImageIcon, Sparkles, CheckCircle, RefreshCw, Cpu, Cable, BatteryCharging, Tv, ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { useLanguage } from '../i18n/LanguageContext';
import { useSellFlow } from '../context/SellFlowContext';
import { mockMaterials } from '../services/mockData';

export const SellScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { state, setPhotoUrl, setDetectedMaterial } = useSellFlow();

  const [previewUrl, setPreviewUrl] = useState<string | null>(state.photoUrl);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(state.materialId || 'mat_pcb');
  const [isCapturing, setIsCapturing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const materialIcons: Record<string, React.ReactNode> = {
    mat_pcb: <Cpu className="w-5 h-5 text-emerald-600" />,
    mat_cable: <Cable className="w-5 h-5 text-emerald-600" />,
    mat_battery: <BatteryCharging className="w-5 h-5 text-emerald-600" />,
    mat_lcd: <Tv className="w-5 h-5 text-emerald-600" />
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPhotoUrl(url);
    }
  };

  const triggerGallery = () => {
    fileInputRef.current?.click();
  };

  const triggerCamera = () => {
    setIsCapturing(true);
    // Instant sample photo capture
    setTimeout(() => {
      const samplePcbPhoto = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80';
      setPreviewUrl(samplePcbPhoto);
      setPhotoUrl(samplePcbPhoto);
      setIsCapturing(false);
    }, 400);
  };

  const handleSelectManualMaterial = (matId: string) => {
    setSelectedMaterialId(matId);
    const found = mockMaterials.find((m) => m.id === matId);
    if (found) {
      setDetectedMaterial({
        id: found.id,
        name: found.name,
        category: found.category,
        confidence: 96
      });
      if (found.sampleImageUrl) {
        setPreviewUrl(found.sampleImageUrl);
        setPhotoUrl(found.sampleImageUrl);
      }
    }
  };

  const handleAnalyze = () => {
    if (!previewUrl) {
      const fallbackUrl = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80';
      setPreviewUrl(fallbackUrl);
      setPhotoUrl(fallbackUrl);
    }
    navigate('/detect');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header title={t('sellTitle')} showBack onBack={() => navigate('/home')} />

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-xl mx-auto px-4 py-4 space-y-4"
      >
        {/* Step indicator: Stage 1 - Identify */}
        <ProgressIndicator currentStage={1} />

        {/* Title Question */}
        <div className="text-left">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('sellQuestion')}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            {t('sellSubtitle')}
          </p>
        </div>

        {/* Hidden native input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* LARGE BUTTONS: Take Photo & Choose from Gallery */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Button 1: Take Photo */}
          <button
            type="button"
            onClick={triggerCamera}
            disabled={isCapturing}
            className="flex flex-col items-center justify-center gap-2.5 p-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-3xl shadow-sm transition-all cursor-pointer select-none group min-h-[120px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center transition-transform group-hover:scale-105">
              <Camera className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-base font-bold tracking-wide">
              {t('takePhoto')}
            </span>
          </button>

          {/* Button 2: Choose from Gallery */}
          <button
            type="button"
            onClick={triggerGallery}
            className="flex flex-col items-center justify-center gap-2.5 p-5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 rounded-3xl shadow-xs border-2 border-slate-200 hover:border-slate-300 transition-all cursor-pointer select-none group min-h-[120px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center transition-transform group-hover:scale-105 border border-emerald-100">
              <ImageIcon className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-base font-bold tracking-wide text-slate-800">
              {t('chooseGallery')}
            </span>
          </button>
        </div>

        {/* IMAGE PREVIEW (if selected/captured) */}
        {previewUrl && (
          <Card variant="elevated" className="overflow-hidden border-2 border-emerald-500/40 p-3 bg-white">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                {t('selectedImagePreview')}
              </span>
              <button
                onClick={triggerGallery}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                {t('reselectPhoto')}
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900">
              <img
                src={previewUrl}
                alt="Selected E-Waste"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-xs font-bold">
                ✓ Ready for AI Scan
              </div>
            </div>
          </Card>
        )}

        {/* MANUAL MATERIAL SELECTION */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              {t('orManual')}
            </span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {mockMaterials.map((mat) => {
              const isSelected = selectedMaterialId === mat.id;
              const name = language === 'hi' ? mat.nameHi : mat.name;

              return (
                <div
                  key={mat.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectManualMaterial(mat.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectManualMaterial(mat.id);
                    }
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-2.5 select-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/25 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0">
                    {materialIcons[mat.id] || <Cpu className="w-5 h-5 text-emerald-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-black truncate">{name}</p>
                    <p className="text-xs font-bold text-slate-600">₹{mat.avgPricePerKg}/kg</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PRIMARY ACTION: ANALYZE MATERIAL */}
        <div className="pt-3">
          <Button
            onClick={handleAnalyze}
            variant="primary"
            size="xl"
            icon={<ArrowRight className="w-6 h-6" />}
            iconPosition="right"
            className="shadow-lg shadow-emerald-700/20 py-4 text-base font-black tracking-wide"
          >
            {t('analyzeMaterial')}
          </Button>
        </div>
      </motion.main>
    </div>
  );
};
