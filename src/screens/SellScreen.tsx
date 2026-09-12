import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  CheckCircle,
  RefreshCw,
  Cpu,
  Cable,
  BatteryCharging,
  Tv,
  ArrowRight,
  SwitchCamera,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { useLanguage } from '../i18n/LanguageContext';
import { useSellFlow } from '../context/SellFlowContext';
import { mockMaterials, getMaterialName } from '../services/mockData';

export const SellScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { state, setPhotoUrl, setDetectedMaterial } = useSellFlow();

  const [previewUrl, setPreviewUrl] = useState<string | null>(state.photoUrl);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(state.materialId || 'mat_pcb');

  // Camera capture state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const materialIcons: Record<string, React.ReactNode> = {
    mat_pcb: <Cpu className="w-5 h-5 text-emerald-600" />,
    mat_cable: <Cable className="w-5 h-5 text-emerald-600" />,
    mat_battery: <BatteryCharging className="w-5 h-5 text-emerald-600" />,
    mat_lcd: <Tv className="w-5 h-5 text-emerald-600" />
  };

  /**
   * 1. Detect how many camera devices are available on page load and during lifecycle
   */
  const enumerateVideoDevices = useCallback(async (): Promise<MediaDeviceInfo[]> => {
    if (!navigator?.mediaDevices?.enumerateDevices) return [];
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setAvailableCameras(videoInputs);
      return videoInputs;
    } catch (err) {
      console.warn('enumerateDevices error:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    enumerateVideoDevices();
  }, [enumerateVideoDevices]);

  /**
   * Stop previous stream tracks cleanly to prevent camera freeze or lock conflicts
   */
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Ensure stream stops on component unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  /**
   * Start camera stream with appropriate deviceId / facingMode
   */
  const startCamera = async (targetDeviceId?: string) => {
    setIsStartingCamera(true);
    setCameraError(null);
    setIsCameraActive(true);

    // Stop previous stream first to avoid camera hardware lock
    stopCameraStream();

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError(
        'Camera access is not supported by your browser or is restricted. Please use "Choose from Gallery" below.'
      );
      setIsStartingCamera(false);
      return;
    }

    try {
      // Refresh list of devices
      const devices = await enumerateVideoDevices();

      let videoConstraint: MediaTrackConstraints | boolean = true;

      if (targetDeviceId) {
        // Explicit deviceId specified (from camera cycling)
        videoConstraint = { deviceId: { exact: targetDeviceId } };
      } else if (devices.length > 1) {
        // 4. Default to rear/environment camera when available on multi-camera devices
        const rearCamera = devices.find((d) =>
          /back|rear|environment/i.test(d.label)
        );
        if (rearCamera && rearCamera.deviceId) {
          videoConstraint = { deviceId: { exact: rearCamera.deviceId } };
          const idx = devices.findIndex((d) => d.deviceId === rearCamera.deviceId);
          if (idx !== -1) setActiveCameraIndex(idx);
        } else {
          // Ideal environment request for mobile
          videoConstraint = { facingMode: { ideal: 'environment' } };
        }
      } else if (devices.length === 1 && devices[0].deviceId) {
        // Single camera (typical laptop webcam)
        videoConstraint = { deviceId: { exact: devices[0].deviceId } };
        setActiveCameraIndex(0);
      } else {
        videoConstraint = { facingMode: { ideal: 'environment' } };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraint,
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Re-enumerate to get full labels now that permission is granted
      const updatedDevices = await enumerateVideoDevices();
      if (updatedDevices.length > 0) {
        const currentTrack = stream.getVideoTracks()[0];
        const currentSettings = currentTrack?.getSettings();
        if (currentSettings?.deviceId) {
          const foundIdx = updatedDevices.findIndex(
            (d) => d.deviceId === currentSettings.deviceId
          );
          if (foundIdx !== -1) {
            setActiveCameraIndex(foundIdx);
          }
        }
      }
    } catch (err: any) {
      console.error('Camera acquisition error:', err);
      stopCameraStream();

      let message = 'Unable to access camera. Please choose a photo from your gallery instead.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission denied. Please allow camera permissions in your browser or choose from gallery.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera found on this device. Please connect a camera or choose from gallery.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera is in use by another application. Please close it or choose from gallery.';
      } else if (err.name === 'OverconstrainedError') {
        // Fallback to simple unconstrained video
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = fallbackStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            await videoRef.current.play();
          }
          await enumerateVideoDevices();
          setIsStartingCamera(false);
          return;
        } catch {
          message = 'Camera could not be started. Please choose from gallery instead.';
        }
      }

      setCameraError(message);
    } finally {
      setIsStartingCamera(false);
    }
  };

  /**
   * 3. Switch between available cameras by deviceId (only shown when 2+ cameras exist)
   */
  const handleSwitchCamera = async () => {
    if (availableCameras.length <= 1 || isStartingCamera) return;
    const nextIndex = (activeCameraIndex + 1) % availableCameras.length;
    setActiveCameraIndex(nextIndex);
    const nextDevice = availableCameras[nextIndex];
    if (nextDevice?.deviceId) {
      await startCamera(nextDevice.deviceId);
    }
  };

  /**
   * Capture photo from active video stream
   */
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setPreviewUrl(photoDataUrl);
      setPhotoUrl(photoDataUrl);
    }

    stopCameraStream();
    setIsCameraActive(false);
    setCameraError(null);
  };

  /**
   * Close camera without taking photo
   */
  const handleCloseCamera = () => {
    stopCameraStream();
    setIsCameraActive(false);
    setCameraError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPhotoUrl(url);
      handleCloseCamera();
    }
  };

  const triggerGallery = () => {
    handleCloseCamera();
    fileInputRef.current?.click();
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

  const activeCameraLabel =
    availableCameras[activeCameraIndex]?.label ||
    (availableCameras.length > 1
      ? `Camera ${activeCameraIndex + 1} of ${availableCameras.length}`
      : 'Default Camera');

  return (
    <div className="min-h-screen bg-[#F6F8F6] pb-24">
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

        {/* Hidden native file input for gallery */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Hidden canvas for capturing video frames */}
        <canvas ref={canvasRef} className="hidden" />

        {/* INLINE PERMISSION OR NO-CAMERA ERROR BANNER */}
        <AnimatePresence>
          {cameraError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-900 space-y-3 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm font-semibold leading-relaxed">
                  <p className="font-bold text-rose-950 mb-0.5">Camera Notice</p>
                  <p>{cameraError}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={triggerGallery}
                  icon={<ImageIcon className="w-4 h-4" />}
                  iconPosition="left"
                  className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800"
                >
                  {t('chooseGallery')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCameraError(null)}
                  className="text-xs font-bold text-slate-600 border-slate-300"
                >
                  Dismiss
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LIVE CAMERA VIEWFINDER COMPONENT */}
        {isCameraActive && (
          <Card
            variant="elevated"
            className="overflow-hidden border-2 border-[#0F3D2E] p-0 bg-[#121820] text-white rounded-2xl shadow-lg relative"
          >
            {/* Camera Top Bar */}
            <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-3.5 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200 tracking-wide truncate max-w-[220px]">
                  {activeCameraLabel}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCloseCamera}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
                aria-label="Close Camera"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Video Feed */}
            <div className="relative aspect-[4/3] sm:aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Framing Brackets */}
              <div className="absolute inset-8 pointer-events-none border-2 border-dashed border-[#C86D2F]/50 rounded-2xl flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-[#C86D2F]" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-[#C86D2F]" />
                </div>
                <p className="text-center text-[11px] font-bold text-slate-200 bg-black/60 backdrop-blur-xs py-1 px-3 rounded-full mx-auto border border-white/10">
                  Align e-waste material inside frame
                </p>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-[#C86D2F]" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-[#C86D2F]" />
                </div>
              </div>

              {isStartingCamera && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 z-10">
                  <Loader2 className="w-8 h-8 text-[#C86D2F] animate-spin" />
                  <span className="text-xs font-bold text-slate-200">
                    Initializing camera sensor...
                  </span>
                </div>
              )}
            </div>

            {/* Camera Bottom Controls */}
            <div className="p-4 bg-[#121820] border-t border-slate-800 flex items-center justify-between">
              {/* Gallery fallback */}
              <button
                type="button"
                onClick={triggerGallery}
                className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Choose from Gallery"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={handleCapturePhoto}
                disabled={isStartingCamera}
                className="w-16 h-16 rounded-full bg-[#C86D2F] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:bg-[#B85D19] cursor-pointer ring-4 ring-[#C86D2F]/30"
                aria-label="Snap Photo"
              >
                <Camera className="w-8 h-8 stroke-[2.2]" />
              </button>

              {/* 2 & 3. Flip / Switch Camera Button: ONLY rendered if 2 or more cameras detected */}
              {availableCameras.length > 1 ? (
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  disabled={isStartingCamera}
                  className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 transition-all cursor-pointer"
                  title={`Switch Camera (${activeCameraIndex + 1}/${availableCameras.length})`}
                  aria-label="Switch Camera"
                >
                  <SwitchCamera className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-11 h-11" /> // Balance spacer when only 1 camera exists
              )}
            </div>
          </Card>
        )}

        {/* PRIMARY ACTION BUTTONS: Take Photo & Choose from Gallery (when camera not active) */}
        {!isCameraActive && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Button 1: Take Photo */}
            <button
              type="button"
              onClick={() => startCamera()}
              disabled={isStartingCamera}
              className="flex flex-col items-center justify-center gap-2.5 p-5 bg-[#C86D2F] hover:bg-[#B85D19] active:bg-[#A35014] text-white rounded-2xl shadow-md shadow-orange-950/20 active:scale-[0.98] transition-all cursor-pointer select-none group min-h-[120px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C86D2F]/30"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center transition-transform group-hover:scale-105">
                <Camera className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-base font-black tracking-wide">
                {t('takePhoto')}
              </span>
            </button>

            {/* Button 2: Choose from Gallery (preserved unchanged) */}
            <button
              type="button"
              onClick={triggerGallery}
              className="flex flex-col items-center justify-center gap-2.5 p-5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 rounded-2xl shadow-xs border-2 border-slate-300 hover:border-slate-400 transition-all cursor-pointer select-none group min-h-[120px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C86D2F]/30"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center transition-transform group-hover:scale-105 border border-slate-200">
                <ImageIcon className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-base font-bold tracking-wide text-slate-800">
                {t('chooseGallery')}
              </span>
            </button>
          </div>
        )}

        {/* CAPTURED / SELECTED IMAGE PREVIEW CARD */}
        {previewUrl && !isCameraActive && (
          <Card variant="elevated" className="overflow-hidden border-2 border-[#0F3D2E]/40 p-3 bg-white space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-[#0F3D2E] flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#0F3D2E]" />
                {t('selectedImagePreview')}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="text-xs font-bold text-[#0F3D2E] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  onClick={triggerGallery}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  {t('reselectPhoto')}
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900">
              <img
                src={previewUrl}
                alt="Selected E-Waste"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-[#121820]/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-[#C86D2F]" />
                <span>Ready for AI Material Scan</span>
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
              const name = getMaterialName(mat, language);

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
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-2.5 select-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0F3D2E]/25 ${
                    isSelected
                      ? 'bg-[#0F3D2E]/8 border-[#0F3D2E] text-[#0F3D2E] shadow-xs'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0">
                    {materialIcons[mat.id] || <Cpu className="w-5 h-5 text-[#0F3D2E]" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-black truncate">{name}</p>
                    <p className="text-xs font-mono font-bold text-slate-600">₹{mat.avgPricePerKg}/kg</p>
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
            className="py-4 text-base font-black tracking-wide"
          >
            {t('analyzeMaterial')}
          </Button>
        </div>
      </motion.main>
    </div>
  );
};
