import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle2, ArrowRight, Cpu } from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { ErrorState } from '../components/ErrorState';
import { useLanguage } from '../i18n/LanguageContext';
import { useSellFlow } from '../context/SellFlowContext';
import { predictMaterial } from '../services/recyclingService';
import { AIDetectionResult } from '../types';

export const DetectScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { state, setDetectedMaterial } = useSellFlow();

  const [isScanning, setIsScanning] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [result, setResult] = useState<AIDetectionResult | null>(null);

  const photoUrl =
    state.photoUrl ||
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80';

  const runScan = () => {
    setIsScanning(true);
    setHasError(false);
    predictMaterial(photoUrl)
      .then((res) => {
        if (res) {
          setResult(res);
        } else {
          setHasError(true);
        }
        setIsScanning(false);
      })
      .catch(() => {
        setHasError(true);
        setIsScanning(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    setIsScanning(true);
    setHasError(false);

    predictMaterial(photoUrl)
      .then((res) => {
        if (isMounted) {
          if (res) {
            setResult(res);
          } else {
            setHasError(true);
          }
          setIsScanning(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasError(true);
          setIsScanning(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [photoUrl]);

  const handleUseResult = () => {
    if (result) {
      setDetectedMaterial({
        id: result.materialId,
        name: result.materialName,
        category: result.category,
        confidence: result.confidence
      });
    }
    navigate('/weight');
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-28">
      <Header title={t('detectionTitle')} showBack onBack={() => navigate('/sell')} />

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-xl mx-auto px-4 sm:px-6 py-5 space-y-4"
      >
        {/* Step indicator: Stage 1 - Identify */}
        <ProgressIndicator currentStage={1} />

        {/* Uploaded Image Card with Active Scan Visualizer */}
        <Card variant="default" padding="none" className="overflow-hidden border-2 border-slate-300 relative bg-[#121820] rounded-2xl">
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={photoUrl}
              alt="E-Waste Scan"
              className="w-full h-full object-cover opacity-90"
            />

            {/* AI HUD Overlay */}
            {isScanning ? (
              <div className="absolute inset-0 bg-[#121820]/50 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
                <div className="bg-[#121820]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#0F3D2E] flex items-center gap-2.5 text-white shadow-lg">
                  <Sparkles className="w-5 h-5 text-[#C86D2F] animate-spin" />
                  <span className="text-sm font-black tracking-wide">
                    {t('analyzingImage')}
                  </span>
                </div>
              </div>
            ) : hasError ? null : (
              /* Verified Recognition Bounding Box */
              <div className="absolute inset-5 border-2 border-[#0F3D2E] rounded-xl pointer-events-none flex flex-col justify-between p-2.5">
                <div className="flex justify-between items-center">
                  <span className="bg-[#0F3D2E] text-white text-xs font-mono font-black px-2.5 py-1 rounded-md shadow-xs">
                    PCB • 94% Match
                  </span>
                  <span className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                </div>
                <div className="self-end bg-[#121820]/90 text-slate-200 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-white/10">
                  FR-4 / Cu Trace
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* LOADING STATE, ERROR STATE, OR RESULT */}
        {isScanning ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-xs space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#0F3D2E]/10 text-[#0F3D2E] flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {t('analyzingImage')}
            </h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              {t('analyzingSubtitle')}
            </p>
          </div>
        ) : hasError ? (
          <ErrorState
            title={language === 'hi' ? 'स्कैन विफल रहा' : 'Scan Analysis Failed'}
            message={
              language === 'hi'
                ? 'छवि को पहचाना नहीं जा सका। कृपया पुनः प्रयास करें।'
                : 'Could not detect material clearly. Please retake the photo or try again.'
            }
            onRetry={runScan}
            retryLabel={language === 'hi' ? 'पुनः प्रयास करें' : 'Scan Again'}
          />
        ) : (
          result && (
            <div className="space-y-4">
              {/* Material Detected Card */}
              <Card variant="highlight" className="p-5 border-2 border-[#0F3D2E]/40 bg-[#0F3D2E]/5 shadow-xs rounded-2xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#0F3D2E] block">
                      {t('materialDetected')}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-0.5 flex items-center gap-2">
                      <Cpu className="w-7 h-7 sm:w-8 sm:h-8 text-[#0F3D2E] stroke-[2.2]" />
                      <span>{language === 'hi' ? result.materialNameHi : result.materialName}</span>
                    </h2>
                  </div>

                  <div className="text-right">
                    <Badge variant="emerald" size="lg" icon={<CheckCircle2 className="w-4 h-4 text-[#0F3D2E]" />}>
                      {t('confidence', { confidence: result.confidence })}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#0F3D2E]/20 grid grid-cols-2 gap-3 text-left">
                  <div>
                    <span className="text-xs font-bold text-slate-600 block">
                      {t('categoryLabel')}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900">
                      {language === 'hi' ? result.categoryHi : result.category}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-600 block">
                      Avg Market Index
                    </span>
                    <span className="text-sm sm:text-base font-mono font-black text-[#0F3D2E]">
                      ₹125/kg (Fair Base)
                    </span>
                  </div>
                </div>
              </Card>

              {/* PRIMARY ACTION: Use This Result */}
              <div className="pt-2 space-y-3">
                <Button
                  onClick={handleUseResult}
                  variant="primary"
                  size="xl"
                  icon={<ArrowRight className="w-6 h-6" />}
                  iconPosition="right"
                  className="py-4 text-base font-black tracking-wide"
                >
                  {t('useThisResult')}
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate('/sell')}
                  className="py-3 text-sm font-bold text-slate-700"
                >
                  {t('retakeOrChange')}
                </Button>
              </div>
            </div>
          )
        )}
      </motion.main>
    </div>
  );
};
