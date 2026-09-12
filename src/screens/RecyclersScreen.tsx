import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { RecyclerCard } from '../components/RecyclerCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useLanguage } from '../i18n/LanguageContext';
import { useSellFlow } from '../context/SellFlowContext';
import { getRecommendedRecyclers } from '../services/recyclingService';
import { Recycler } from '../types';

export const RecyclersScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { state, setSelectedRecycler } = useSellFlow();

  const [recyclers, setRecyclers] = useState<Recycler[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const weightKg = state.weightKg || 15;

  const loadRecyclers = () => {
    setIsLoading(true);
    setHasError(false);
    getRecommendedRecyclers(state.materialId, weightKg)
      .then((data) => {
        setRecyclers(data || []);
        setIsLoading(false);
      })
      .catch(() => {
        setHasError(true);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadRecyclers();
  }, [state.materialId, weightKg]);

  const handleSelectRecycler = (rec: Recycler) => {
    setSelectedRecycler(rec);
    navigate(`/recycler/${rec.id}`);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-28">
      <Header title={t('recyclersTitle')} showBack onBack={() => navigate('/price')} />

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-xl mx-auto px-4 sm:px-6 py-5 space-y-4"
      >
        {/* Step indicator: Stage 3 - Choose Recycler */}
        <ProgressIndicator currentStage={3} />

        {/* Section Heading */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-[#0F3D2E] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#0F3D2E]" />
            <span>{t('recyclersSubtitle')}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
            Verified formal units in Hyderabad providing doorstep pickup & digital receipts.
          </p>
        </div>

        {/* Loading / Error / Recycler Cards List */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <LoadingState
              message={
                language === 'hi' ? 'पुनर्चक्रणकर्ताओं की खोज...' :
                language === 'te' ? 'ఉత్తమ రీసైక్లర్ల కోసం వెతుకుతోంది...' :
                language === 'ta' ? 'சிறந்த மறுசுழற்சியாளர்களைத் தேடுகிறது...' :
                language === 'kn' ? 'ಉತ್ತಮ ಮರುಬಳಕೆದಾರರನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...' :
                language === 'ml' ? 'മികച്ച റീസൈക്ലർമാരെ കണ്ടെത്തുന്നു...' :
                'Finding best authorized recyclers...'
              }
              submessage={
                language === 'hi' ? 'उच्चतम दरों का मिलान किया जा रहा है' :
                language === 'te' ? 'అత్యధిక ధరలు మరియు సమీప కేంద్రాలతో సరిపోలుస్తోంది' :
                language === 'ta' ? 'அதிகபட்ச விகிதங்கள் மற்றும் சான்றளிக்கப்பட்ட மையங்களை பொருத்துகிறது' :
                language === 'kn' ? 'ಹೆಚ್ಚಿನ ದರಗಳು ಮತ್ತು ಪ್ರಮಾಣೀಕೃತ ಸೌಲಭ್ಯಗಳನ್ನು ಹೊಂದಿಸಲಾಗುತ್ತಿದೆ' :
                language === 'ml' ? 'ഉയർന്ന നിരക്കുകളും സർട്ടിഫൈഡ് സൗകര്യങ്ങളും പൊരുത്തപ്പെടുത്തുന്നു' :
                'Matching highest rates and nearest certified facilities'
              }
            />
          </div>
        ) : hasError || recyclers.length === 0 ? (
          <ErrorState
            title={
              language === 'hi' ? 'कोई पुनर्चक्रणकर्ता नहीं मिला' :
              language === 'te' ? 'రీసైక్లర్లు కనుగొనబడలేదు' :
              language === 'ta' ? 'மறுசுழற்சியாளர்கள் கிடைக்கவில்லை' :
              language === 'kn' ? 'ಯಾವುದೇ ಮರುಬಳಕೆದಾರರು ಕಂಡುಬಂದಿಲ್ಲ' :
              language === 'ml' ? 'റീസൈക്ലർമാരെ കണ്ടെത്തിയില്ല' :
              'No Recyclers Found'
            }
            message={
              language === 'hi'
                ? 'इस क्षेत्र में कोई उपलब्ध पुनर्चक्रणकर्ता नहीं मिला। कृपया पुनः प्रयास करें।'
                : language === 'te'
                ? 'ఈ ప్రాంతంలో అధీకృత రీసైక్లర్లు అందుబాటులో లేరు. దయచేసి మళ్లీ ప్రయత్నించండి.'
                : language === 'ta'
                ? 'இந்த பகுதியில் அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளர்கள் இல்லை. மீண்டும் முயற்சிக்கவும்.'
                : language === 'kn'
                ? 'ಈ ಪ್ರದೇಶದಲ್ಲಿ ಯಾವುದೇ ಅಧಿಕೃತ ಮರುಬಳಕೆದಾರರು ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
                : language === 'ml'
                ? 'ഈ പ്രദേശത്ത് അംഗീകൃത റീസൈക്ലർമാർ ലഭ്യമല്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക.'
                : 'Unable to load recycler offers at this time. Please try again.'
            }
            onRetry={loadRecyclers}
            retryLabel={
              language === 'hi' ? 'पुनः प्रयास करें' :
              language === 'te' ? 'మళ్లీ ప్రయత్నించండి' :
              language === 'ta' ? 'மீண்டும் முயற்சி செய்' :
              language === 'kn' ? 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' :
              language === 'ml' ? 'വീണ്ടും ശ്രമിക്കുക' :
              'Retry'
            }
          />
        ) : (
          <div className="space-y-3.5">
            {recyclers.map((rec, idx) => (
              <RecyclerCard
                key={rec.id}
                recycler={rec}
                weightKg={weightKg}
                isRecommended={idx === 0} // GreenCycle is first and visually highlighted
                onSelect={handleSelectRecycler}
              />
            ))}
          </div>
        )}

        {/* Informational reassurance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 flex items-start gap-3 text-slate-700 text-xs sm:text-sm leading-relaxed shadow-xs">
          <Info className="w-5 h-5 text-[#0F3D2E] flex-shrink-0 mt-0.5" />
          <p>
            All recyclers listed are state-certified. Payouts are transferred immediately upon physical verification.
          </p>
        </div>
      </motion.main>
    </div>
  );
};
