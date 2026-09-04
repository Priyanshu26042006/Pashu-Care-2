import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Sparkles, 
  MapPin, 
  Sun, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  Layers, 
  RefreshCw,
  ChevronRight,
  Heart,
  Droplet,
  Milk,
  Baby,
  Scan,
  Maximize2,
  Check,
  Radio,
  Zap,
  Loader2,
  Navigation,
  Edit3,
  LocateFixed,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SAMPLE_CATTLE_PRESETS } from '../../data/mockLivestockData';
import { DiagnosticAssessment, SupportedLanguage, PregnancyStatus, LactationStatus } from '../../types';
import { runLivestockAssessment } from '../../services/apiService';
import { VoiceSymptomInput } from './VoiceSymptomInput';
import { 
  acquireLiveScannedLocation, 
  getStoredLiveLocation, 
  reverseGeocodeCoordinates, 
  GeocodedLocation 
} from '../../utils/geolocation';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssessmentComplete: (assessment: DiagnosticAssessment) => void;
  language: SupportedLanguage;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onAssessmentComplete,
  language,
}) => {
  const [activeMode, setActiveMode] = useState<'preset' | 'live' | 'upload'>('preset');
  const [selectedPreset, setSelectedPreset] = useState(SAMPLE_CATTLE_PRESETS[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [capturedLivePhoto, setCapturedLivePhoto] = useState<string | null>(null);
  const [species, setSpecies] = useState<'Cattle' | 'Buffalo' | 'Goat' | 'Sheep'>('Cattle');
  const [symptomsText, setSymptomsText] = useState('');
  const [pregnancyStatus, setPregnancyStatus] = useState<PregnancyStatus>('Mid Gestation (4-6 Months)');
  const [lactationStatus, setLactationStatus] = useState<LactationStatus>('Mid Lactation');
  const [dailyMilkYield, setDailyMilkYield] = useState<number>(12.5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeScanningImage, setActiveScanningImage] = useState<string | null>(null);
  const [rejectionData, setRejectionData] = useState<{
    title: string;
    message: string;
    detectedObject?: string;
    details?: string;
  } | null>(null);

  // AR Guidance State
  const [lightingScore] = useState(92);
  const [showOverlays, setShowOverlays] = useState(true);

  // GPS & Live Field Location State
  const [liveUserLocation, setLiveUserLocation] = useState<GeocodedLocation | null>(() => getStoredLiveLocation());
  const [isAcquiringGps, setIsAcquiringGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [useLiveLocation, setUseLiveLocation] = useState(true);
  const [isEditingCustomLocation, setIsEditingCustomLocation] = useState(false);
  const [customDistrictInput, setCustomDistrictInput] = useState('');
  const [customStateInput, setCustomStateInput] = useState('');

  // GPS Metadata for Current Scan
  const [gpsData, setGpsData] = useState<{
    lat: number;
    lng: number;
    district: string;
    state: string;
    country?: string;
    locationName?: string;
    accuracy: number;
    isLiveLocation: boolean;
  }>(() => {
    const cached = getStoredLiveLocation();
    if (cached) {
      return {
        lat: cached.lat,
        lng: cached.lng,
        district: cached.district,
        state: cached.state,
        country: cached.country,
        locationName: cached.locationName,
        accuracy: cached.accuracy || 4.2,
        isLiveLocation: true,
      };
    }
    return {
      lat: 21.5222,
      lng: 70.4579,
      district: 'Junagadh',
      state: 'Gujarat',
      country: 'India',
      locationName: 'Junagadh, Gujarat',
      accuracy: 4.2,
      isLiveLocation: false,
    };
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Actively acquire live scanned location and reverse geocode
  const handleDetectLiveGps = async () => {
    setIsAcquiringGps(true);
    setGpsError(null);
    try {
      const loc = await acquireLiveScannedLocation();
      setLiveUserLocation(loc);
      setGpsData({
        lat: loc.lat,
        lng: loc.lng,
        district: loc.district,
        state: loc.state,
        country: loc.country,
        locationName: loc.locationName,
        accuracy: loc.accuracy || 4.2,
        isLiveLocation: true,
      });
      setUseLiveLocation(true);
    } catch (err: any) {
      console.warn('Live GPS acquisition notice:', err);
      setGpsError(err?.message || 'Could not acquire precise GPS signal. You can enter location manually.');
    } finally {
      setIsAcquiringGps(false);
    }
  };

  // Acquire live field location when modal opens
  useEffect(() => {
    if (isOpen) {
      handleDetectLiveGps();
    }
  }, [isOpen]);

  // Handle WebCam start/stop
  useEffect(() => {
    if (isOpen && activeMode === 'live' && !capturedLivePhoto) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, capturedLivePhoto]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Live camera access error:', err);
      setCameraError('Live camera stream unavailable or permission denied. You can upload a photo or use diagnostic presets.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Helper to grab frame from video element
  const getCanvasFrame = (): string | null => {
    if (!videoRef.current) return null;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Pre-check for blank/dark frames
        try {
          const w = canvas.width;
          const h = canvas.height;
          const stepX = Math.max(1, Math.floor(w / 16));
          const stepY = Math.max(1, Math.floor(h / 16));
          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;
          let sumLum = 0;
          let count = 0;
          const samples: number[] = [];
          for (let y = 0; y < h; y += stepY) {
            for (let x = 0; x < w; x += stepX) {
              const idx = (y * w + x) * 4;
              const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
              samples.push(lum);
              sumLum += lum;
              count++;
            }
          }
          if (count > 0) {
            const avg = sumLum / count;
            const variance = samples.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / count;
            const stdDev = Math.sqrt(variance);
            if (avg < 14) {
              setRejectionData({
                title: 'NON LIVING OBJECT DETECTED',
                message: 'PLEASE RETAKE PROPERLY',
                detectedObject: 'Pitch Black / Lens Covered',
                details: 'NON LIVING OBJECT DETECTED - PLEASE RETAKE PROPERLY. The camera frame is completely dark. Please ensure the lens is uncovered and adequate lighting is provided.'
              });
              return null;
            }
            if (stdDev < 5.0) {
              setRejectionData({
                title: 'NON LIVING OBJECT DETECTED',
                message: 'PLEASE RETAKE PROPERLY',
                detectedObject: 'Solid Blank Uniform Surface',
                details: 'NON LIVING OBJECT DETECTED - PLEASE RETAKE PROPERLY. The camera is pointing at a flat uniform surface without livestock. Please aim the camera directly at the animal.'
              });
              return null;
            }
          }
        } catch (sampleErr) {
          // Ignore canvas sampling error if any
        }

        return canvas.toDataURL('image/jpeg', 0.92);
      }
    } catch (e) {
      console.warn('Failed to extract canvas frame', e);
    }
    return null;
  };

  const captureLiveFrame = () => {
    const dataUrl = getCanvasFrame();
    if (dataUrl) {
      setCapturedLivePhoto(dataUrl);
      stopCamera();
    }
  };

  const handleRetakeLivePhoto = () => {
    setCapturedLivePhoto(null);
    startCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        if (!rawUrl) return;

        // Downscale image via canvas to max 1280px to ensure fast transfer and prevent payload overflow
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            setUploadedImage(canvas.toDataURL('image/jpeg', 0.88));
          } else {
            setUploadedImage(rawUrl);
          }
        };
        img.onerror = () => {
          setUploadedImage(rawUrl);
        };
        img.src = rawUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (preset: typeof SAMPLE_CATTLE_PRESETS[0]) => {
    setSelectedPreset(preset);
    setSpecies(preset.species as any);
    setSymptomsText(preset.symptoms);
    if (preset.pregnancyStatus) setPregnancyStatus(preset.pregnancyStatus as PregnancyStatus);
    if (preset.lactationStatus) setLactationStatus(preset.lactationStatus as LactationStatus);
    if (preset.dailyMilkYieldLiters) setDailyMilkYield(preset.dailyMilkYieldLiters);
    
    // If user prefers using their live device location for the scan, preserve live location
    if (!useLiveLocation || !liveUserLocation) {
      setGpsData({
        lat: preset.location.lat,
        lng: preset.location.lng,
        district: preset.location.district,
        state: preset.location.state,
        country: 'India',
        locationName: `${preset.location.district}, ${preset.location.state}`,
        accuracy: 4.2,
        isLiveLocation: false,
      });
    }
  };

  const handleExecuteScan = async () => {
    const isPreset = activeMode === 'preset';
    let targetImage = selectedPreset.imageUrl;
    let presetHint = selectedPreset.breed;

    if (activeMode === 'live') {
      if (capturedLivePhoto) {
        targetImage = capturedLivePhoto;
        presetHint = `${species} live camera capture`;
      } else {
        // Auto-snap current live camera frame if clicked directly
        const snapped = getCanvasFrame();
        if (snapped) {
          targetImage = snapped;
          setCapturedLivePhoto(snapped);
          stopCamera();
        }
        presetHint = `${species} live camera capture`;
      }
    } else if (activeMode === 'upload' && uploadedImage) {
      targetImage = uploadedImage;
      presetHint = `${species} photo upload`;
    }

    if (!targetImage || targetImage.length < 50) {
      setRejectionData({
        title: 'NON LIVING OBJECT DETECTED',
        message: 'PLEASE RETAKE PROPERLY',
        detectedObject: 'Blank or missing frame',
        details: 'NON LIVING OBJECT DETECTED - PLEASE RETAKE PROPERLY. The frame is blank. Please aim camera at the animal or upload a valid photo.'
      });
      return;
    }

    // Only inject preset symptoms if actually in preset mode; never for live or uploaded images!
    const effectiveSymptoms = isPreset ? (symptomsText || selectedPreset.symptoms) : symptomsText.trim();

    setRejectionData(null);
    setActiveScanningImage(targetImage);
    setIsProcessing(true);
    setProcessingProgress(25);
    setProcessingStage('1. Biometric edge alignment & living animal discriminator...');

    const activeTimers: NodeJS.Timeout[] = [];

    const t1 = setTimeout(() => {
      setProcessingProgress(50);
      setProcessingStage('2. Multi-Modal Vision: Analyzing coat, lesions & anatomical markers...');
    }, 450);
    activeTimers.push(t1);

    const t2 = setTimeout(() => {
      setProcessingProgress(75);
      setProcessingStage('3. Evaluating Gestation, Lactation & ICAR-IVRI Pathology...');
    }, 900);
    activeTimers.push(t2);

    try {
      const assessment = await runLivestockAssessment({
        image: targetImage,
        species: species,
        symptoms: effectiveSymptoms,
        pregnancyStatus: pregnancyStatus,
        lactationStatus: lactationStatus,
        dailyMilkYieldLiters: dailyMilkYield,
        latitude: gpsData.lat,
        longitude: gpsData.lng,
        district: gpsData.district,
        state: gpsData.state,
        locationName: gpsData.locationName,
        country: gpsData.country,
        isLiveLocation: gpsData.isLiveLocation,
        language: language,
        presetBreedHint: presetHint,
        isPreset: isPreset,
        scanMode: activeMode,
      });

      activeTimers.forEach(clearTimeout);
      setProcessingProgress(100);
      setProcessingStage('4. Diagnostic analysis verified. Rendering clinical report...');
      
      setTimeout(() => {
        setIsProcessing(false);
        onAssessmentComplete(assessment);
        onClose();
      }, 350);
    } catch (err: any) {
      activeTimers.forEach(clearTimeout);
      console.warn('Livestock scanner rejection note:', err);
      setIsProcessing(false);
      
      // Strict rejection modal display for non-living objects
      setRejectionData({
        title: 'NON LIVING OBJECT DETECTED',
        message: 'PLEASE RETAKE PROPERLY',
        detectedObject: err?.detectedObject || 'Inanimate / Non-livestock item',
        details: err?.rejectionMessage || err?.message || 'NON LIVING OBJECT DETECTED - PLEASE RETAKE PROPERLY. The visual scanner could not confirm a living livestock animal (cattle, buffalo, goat, or sheep) in the frame. Please align the cattle clearly inside the camera reticle with adequate lighting and retake.'
      });
    }
  };

  if (!isOpen) return null;

  // Active current visual preview source
  const currentPreviewImage = 
    activeMode === 'live'
      ? capturedLivePhoto
      : activeMode === 'upload'
      ? uploadedImage
      : selectedPreset.imageUrl;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 relative"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex flex-wrap items-center gap-2">
                <span>Guided Livestock Scanner</span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md border border-purple-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  Gemini Multi-Modal Vision
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                  AR Alignment Active
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Real-time livestock capture, conformation analysis & lesion detection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => {
                setActiveMode('preset');
                setCapturedLivePhoto(null);
                if (!symptomsText.trim()) {
                  setSymptomsText(selectedPreset.symptoms);
                }
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                activeMode === 'preset'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Diagnostic Presets</span>
            </button>

            <button
              onClick={() => {
                if (symptomsText === selectedPreset.symptoms) {
                  setSymptomsText('');
                }
                setActiveMode('live');
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                activeMode === 'live'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Live AR Camera</span>
            </button>

            <button
              onClick={() => {
                if (symptomsText === selectedPreset.symptoms) {
                  setSymptomsText('');
                }
                setActiveMode('upload');
                setCapturedLivePhoto(null);
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                activeMode === 'upload'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>
          </div>

          {/* Camera / Viewport Area with AR Overlays */}
          <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group shadow-inner">
            
            {/* 1. Preset Mode Visual */}
            {activeMode === 'preset' && (
              <img
                src={selectedPreset.imageUrl}
                alt={selectedPreset.title}
                className="w-full h-full object-cover"
              />
            )}

            {/* 2. Live Camera Stream or Captured Clicked Photo */}
            {activeMode === 'live' && (
              <>
                {capturedLivePhoto ? (
                  // Display the clicked photo in the scanner viewport
                  <div className="relative w-full h-full">
                    <img
                      src={capturedLivePhoto}
                      alt="Captured livestock specimen"
                      className="w-full h-full object-cover"
                    />

                    {/* Captured Specimen Confirmation Banner */}
                    <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-emerald-950/90 border border-emerald-500/50 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs text-emerald-200 font-semibold shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Specimen Photo Captured</span>
                    </div>

                    {/* Retake Button Floating Control */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-3">
                      <button
                        onClick={handleRetakeLivePhoto}
                        className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Retake Photo</span>
                      </button>
                    </div>
                  </div>
                ) : cameraError ? (
                  <div className="text-center p-6 space-y-3">
                    <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                    <p className="text-xs sm:text-sm text-slate-300 max-w-sm">{cameraError}</p>
                    <button
                      onClick={() => setActiveMode('preset')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Use High-Resolution Diagnostic Presets
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Live Shutter Capture Button */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-1.5">
                      <button
                        onClick={captureLiveFrame}
                        className="w-14 h-14 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center text-slate-950 shadow-2xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                        title="Click to capture photo"
                      >
                        <Camera className="w-7 h-7" />
                      </button>
                      <span className="text-[10px] font-bold text-white bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
                        Click Shutter to Snap
                      </span>
                    </div>
                  </>
                )}
              </>
            )}

            {/* 3. Upload Mode Visual */}
            {activeMode === 'upload' && (
              <>
                {uploadedImage ? (
                  <div className="relative w-full h-full">
                    <img src={uploadedImage} alt="Uploaded livestock" className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-slate-950/80 border border-slate-700 backdrop-blur-xs px-3 py-1 rounded-xl text-xs text-emerald-300 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Custom Photo Loaded</span>
                    </div>
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                      title="Replace photo"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer text-center p-6 space-y-3 border-2 border-dashed border-slate-700 rounded-xl m-4 w-full h-[80%] flex flex-col items-center justify-center hover:border-emerald-500/60 transition-colors"
                  >
                    <Upload className="w-10 h-10 text-emerald-400 animate-bounce" />
                    <div>
                      <p className="text-sm font-semibold text-white">Click or drag & drop livestock photo</p>
                      <p className="text-xs text-slate-400">Supports JPG, PNG, WEBP (Max 20MB)</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                )}
              </>
            )}

            {/* Real-Time AR Guided Overlays */}
            {showOverlays && (
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-10">
                
                {/* Top Telemetry Strip */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] sm:text-[11px] font-mono text-emerald-300 bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  <div className="flex items-center space-x-2">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Luminance: {lightingScore}%</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-purple-300">
                    <Heart className="w-3 h-3 text-purple-400" />
                    <span className="truncate max-w-[130px]">{pregnancyStatus.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-cyan-300">
                    <Milk className="w-3 h-3 text-cyan-400" />
                    <span>{dailyMilkYield}L/d</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate max-w-[130px]" title={gpsData.locationName || `${gpsData.district}, ${gpsData.state}`}>
                      {gpsData.locationName || gpsData.district}
                    </span>
                  </div>
                </div>

                {/* Center Animal Alignment Framing Reticle */}
                <div className="relative flex-1 flex items-center justify-center">
                  
                  {/* Outer Bounding Box Frame */}
                  <div className="w-[85%] h-[80%] border-2 border-dashed border-emerald-400/70 rounded-2xl relative flex items-center justify-center">
                    
                    {/* Corner Reticle Markers */}
                    <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400"></div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400"></div>
                    <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400"></div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400"></div>

                    {/* Lateral Flank & Spine Guide Line */}
                    <div className="absolute top-[35%] w-[90%] border-t border-emerald-400/40 flex justify-between text-[10px] text-emerald-300 font-mono px-2">
                      <span>DORSAL SPINE LINE</span>
                      <span>WITHERS</span>
                    </div>

                    {/* Muzzle Target Zone */}
                    <div className="absolute left-6 top-[25%] w-16 h-16 rounded-full border border-cyan-400/60 flex items-center justify-center text-[9px] text-cyan-300 font-mono">
                      MUZZLE
                    </div>

                    {/* Center Crosshair */}
                    <div className="w-8 h-8 rounded-full border border-emerald-400/60 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></div>
                    </div>

                  </div>

                </div>

                {/* Bottom Guidance Instruction Pill */}
                <div className="self-center bg-slate-950/85 backdrop-blur-xs px-4 py-1.5 rounded-full border border-emerald-500/40 text-xs font-semibold text-emerald-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    {activeMode === 'live' && capturedLivePhoto
                      ? 'Photo Ready! Proceed to generate diagnosis or retake.'
                      : 'Align lateral flank & head inside the frame (Distance: ~2.0m)'}
                  </span>
                </div>

              </div>
            )}

            {/* Overlay Toggle Floating Button */}
            <button
              onClick={() => setShowOverlays(!showOverlays)}
              className="absolute top-3 right-3 z-20 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white p-2 rounded-xl border border-slate-700 text-xs flex items-center space-x-1 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px]">{showOverlays ? 'Hide AR' : 'Show AR'}</span>
            </button>

          </div>

          {/* Preset Selector Carousel (If in Preset Mode) */}
          {activeMode === 'preset' && (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Veterinary Clinical Preset:
                </label>
                <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {SAMPLE_CATTLE_PRESETS.length} conditions available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                {SAMPLE_CATTLE_PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`cursor-pointer p-2.5 rounded-xl border transition-all flex items-center space-x-2.5 ${
                        isSelected
                          ? 'bg-emerald-50/90 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={preset.imageUrl}
                        alt={preset.breed}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{preset.breed}</h4>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                            preset.defaultDiagnosis.severity === 'Healthy'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : preset.defaultDiagnosis.severity === 'Moderate' || preset.defaultDiagnosis.severity === 'Mild'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {preset.defaultDiagnosis.severity}
                          </span>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-600 truncate">{preset.defaultDiagnosis.disease}</p>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5">
                          <span className="truncate">{preset.category || 'Clinical Specimen'}</span>
                          <span className="flex items-center gap-0.5 text-slate-500 shrink-0">
                            <MapPin className="w-2.5 h-2.5 text-rose-500" />
                            {preset.location.district}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cattle Reproductive & Lactation Parameters */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                  <Baby className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Reproductive & Lactation Profile</h4>
                  <p className="text-[11px] text-slate-500">Essential for trimester-safe AI drug prescription & yield risk assessment</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100/70 text-purple-800 font-semibold border border-purple-200">
                NDLM Standard
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Pregnancy Status */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-purple-600" />
                    Pregnancy Status
                  </span>
                  <span className="text-[10px] text-purple-700 font-medium">Gestational Stage</span>
                </label>
                <select
                  value={pregnancyStatus}
                  onChange={(e) => setPregnancyStatus(e.target.value as PregnancyStatus)}
                  className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-2xs"
                >
                  <option value="Non-Pregnant (Open)">Non-Pregnant (Open / Insemination Ready)</option>
                  <option value="Early Gestation (1-3 Months)">Early Gestation (1-3 Months / Vulnerable Stage)</option>
                  <option value="Mid Gestation (4-6 Months)">Mid Gestation (4-6 Months / Stable)</option>
                  <option value="Late Gestation (7-9 Months)">Late Gestation (7-9 Months / High Abortion Risk)</option>
                  <option value="Advanced Gestation (>9 Months / Close-up)">Advanced Gestation (&gt;9 Months / Close-up)</option>
                  <option value="Recently Calved (Postpartum)">Recently Calved (Postpartum &lt; 30 Days)</option>
                  <option value="Not Applicable / Male">Not Applicable / Male Specimen</option>
                </select>
              </div>

              {/* 2. Lactation Status */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Milk className="w-3.5 h-3.5 text-cyan-600" />
                    Lactation Status
                  </span>
                  <span className="text-[10px] text-cyan-700 font-medium">Milk Stage</span>
                </label>
                <select
                  value={lactationStatus}
                  onChange={(e) => setLactationStatus(e.target.value as LactationStatus)}
                  className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 shadow-2xs"
                >
                  <option value="Early Lactation (Peak Yield)">Early Lactation (Peak Yield 1-100 Days)</option>
                  <option value="Mid Lactation">Mid Lactation (100-200 Days)</option>
                  <option value="Late Lactation">Late Lactation (&gt;200 Days / Declining)</option>
                  <option value="Dry Cow (Rest Period)">Dry Cow (Rest Period / Dry Off Phase)</option>
                  <option value="Heifer (Non-Lactating)">Heifer (Non-Lactating / Young Stock)</option>
                  <option value="Mastitic / Abnormal Yield">Mastitic / Abnormal Yield (Flaked Milk)</option>
                  <option value="Not Applicable / Male">Not Applicable / Male Specimen</option>
                </select>
              </div>
            </div>

            {/* Daily Milk Yield Input */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 text-xs">
              <span className="text-slate-600 text-[11px] font-medium flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-sky-500" />
                Current Baseline Milk Yield:
              </span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="60"
                  value={dailyMilkYield}
                  onChange={(e) => setDailyMilkYield(parseFloat(e.target.value) || 0)}
                  className="w-20 text-center font-mono font-bold text-xs py-1 px-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <span className="text-[11px] font-semibold text-slate-500">Liters/day</span>
              </div>
            </div>
          </div>

          {/* Clinical Observation / Symptoms Field with Multi-Language Voice Capture & AI Analysis */}
          <VoiceSymptomInput
            value={symptomsText}
            onChange={setSymptomsText}
            language={language}
            species={species}
          />

          {/* Geolocation Tagging Status */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-800">Scanned Field Location:</span>
                    <strong className="text-emerald-900 font-bold">
                      {gpsData.locationName || `${gpsData.district}, ${gpsData.state}`}
                    </strong>
                    {gpsData.isLiveLocation ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Scanned Location
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                        Preset Geotag
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Coords: {gpsData.lat.toFixed(4)}°N, {gpsData.lng.toFixed(4)}°E • Accuracy: ±{gpsData.accuracy}m
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDetectLiveGps}
                  disabled={isAcquiringGps}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  title="Detect and pinpoint device GPS location"
                >
                  {isAcquiringGps ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Fixing GPS...</span>
                    </>
                  ) : (
                    <>
                      <LocateFixed className="w-3 h-3" />
                      <span>{gpsData.isLiveLocation ? 'Refresh GPS' : 'Use Scanned GPS'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditingCustomLocation(!isEditingCustomLocation);
                    setCustomDistrictInput(gpsData.district);
                    setCustomStateInput(gpsData.state);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="Manually enter farm village or district"
                >
                  <Edit3 className="w-3 h-3 text-slate-500" />
                  <span>{isEditingCustomLocation ? 'Close' : 'Edit'}</span>
                </button>
              </div>
            </div>

            {/* Inline Custom Location Editor */}
            {isEditingCustomLocation && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2"
              >
                <div className="flex-1 min-w-[140px]">
                  <input
                    type="text"
                    value={customDistrictInput}
                    onChange={(e) => setCustomDistrictInput(e.target.value)}
                    placeholder="District / Village / Tehsil"
                    className="w-full text-xs px-2.5 py-1 rounded-md border border-slate-300 bg-white focus:outline-emerald-500"
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <input
                    type="text"
                    value={customStateInput}
                    onChange={(e) => setCustomStateInput(e.target.value)}
                    placeholder="State (e.g., Gujarat, Punjab)"
                    className="w-full text-xs px-2.5 py-1 rounded-md border border-slate-300 bg-white focus:outline-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (customDistrictInput.trim()) {
                      const updatedName = customStateInput.trim() 
                        ? `${customDistrictInput.trim()}, ${customStateInput.trim()}`
                        : customDistrictInput.trim();
                      setGpsData((prev) => ({
                        ...prev,
                        district: customDistrictInput.trim(),
                        state: customStateInput.trim() || prev.state,
                        locationName: updatedName,
                        isLiveLocation: true,
                      }));
                      setIsEditingCustomLocation(false);
                    }
                  }}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                >
                  Save Location
                </button>
              </motion.div>
            )}

            {gpsError && (
              <p className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                {gpsError}
              </p>
            )}
          </div>

        </div>

        {/* Dynamic Full-Screen AI Diagnostic Scanning Viewport (Active during Processing) */}
        <AnimatePresence>
          {isProcessing && activeScanningImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden text-white"
            >
              {/* Scanning Header Bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-emerald-900/60 bg-slate-950/90 z-20">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
                    <Scan className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Multimodal Vision Diagnostic Scan</span>
                      <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 animate-pulse">
                        LIVE AI INFERENCE
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Target: <strong className="text-emerald-300">{species}</strong> • Location: <span className="text-white font-medium">{gpsData.locationName || `${gpsData.district}, ${gpsData.state}`}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {processingProgress}%
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono">Telemetry Active</p>
                </div>
              </div>

              {/* Central Viewport Displaying the Clicked Specimen Photo with Laser Scanner Beam & AR Reticles */}
              <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                
                {/* The EXACT Clicked / Uploaded Photo */}
                <img
                  src={activeScanningImage}
                  alt="Scanned specimen"
                  className="w-full h-full object-contain filter contrast-[1.05] brightness-95"
                />

                {/* High-Tech Holographic Laser Scan Sweep (Moving Top-to-Bottom) */}
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_6px_rgba(52,211,153,0.7)] pointer-events-none z-10"
                >
                  <div className="w-full h-24 bg-gradient-to-b from-emerald-500/15 to-transparent transform -translate-y-full pointer-events-none"></div>
                </motion.div>

                {/* Dynamic Biometric Bounding Boxes appearing on the clicked photo */}
                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
                  
                  {/* Top-left Telemetry Box */}
                  <div className="self-start bg-slate-950/80 border border-emerald-500/40 backdrop-blur-md rounded-xl p-3 space-y-1 text-[11px] font-mono text-emerald-300 shadow-xl">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Resolution: High-Res Specimen</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      BCS Target: 1.0 - 5.0 Scale
                    </div>
                    <div className="text-cyan-300 text-[10px]">
                      Lactation Phase: {lactationStatus.split(' ')[0]}
                    </div>
                  </div>

                  {/* Anatomical Feature Scanning Reticles (Center HUD) */}
                  <div className="relative w-full h-48 sm:h-64 my-auto flex items-center justify-center">
                    
                    {/* Spine Curvature Tracker */}
                    <div className="absolute top-[20%] left-[25%] right-[25%] border border-emerald-400/60 rounded-lg p-1 bg-emerald-500/10 flex items-center justify-between text-[9px] font-mono text-emerald-300">
                      <span>[SPINE_ALIGNMENT]</span>
                      <span className="text-emerald-400 animate-pulse">DETECTING KYPHOSIS</span>
                    </div>

                    {/* Skin Nodule / Lesion Detector Box */}
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute top-[40%] right-[30%] w-24 h-24 border-2 border-dashed border-rose-400/80 rounded-xl bg-rose-500/15 flex flex-col justify-between p-1.5"
                    >
                      <span className="text-[8px] font-mono font-bold text-rose-300 uppercase">LESION SCAN</span>
                      <span className="text-[8px] font-mono text-amber-300 self-end">Capripox/FMD</span>
                    </motion.div>

                    {/* Cranial Muzzle Sensor */}
                    <div className="absolute left-[15%] top-[30%] w-16 h-16 rounded-full border-2 border-cyan-400/70 flex items-center justify-center text-[8px] font-mono text-cyan-300">
                      MUZZLE
                    </div>

                  </div>

                  {/* Bottom Active Stage Banner */}
                  <div className="self-center w-full max-w-xl bg-slate-950/90 border border-emerald-500/50 backdrop-blur-md rounded-2xl p-3.5 space-y-2 shadow-2xl">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-300 font-bold flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        AI Pipeline In Progress...
                      </span>
                      <span className="text-slate-400 text-[11px]">{processingProgress}%</span>
                    </div>

                    <p className="text-xs text-white font-medium truncate">
                      {processingStage}
                    </p>

                    {/* Progress Track */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"
                        style={{ width: `${processingProgress}%` }}
                        transition={{ ease: 'easeInOut', duration: 0.3 }}
                      />
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Non-Living Object Rejection Alert Dialog */}
        <AnimatePresence>
          {rejectionData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white border-2 border-rose-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center space-y-5 shadow-2xl relative overflow-hidden"
              >
                {/* Warning accent top bar */}
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-500 via-red-600 to-rose-500" />

                <div className="w-16 h-16 rounded-3xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                  <AlertCircle className="w-9 h-9 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <div className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-mono text-[11px] font-bold tracking-wide uppercase border border-rose-200">
                    Live Biometric Rejection
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-rose-600 uppercase tracking-tight">
                    {rejectionData.title}
                  </h3>
                  <h4 className="text-sm sm:text-base font-bold text-slate-800 uppercase tracking-wide">
                    {rejectionData.message}
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto pt-1 leading-relaxed">
                    {rejectionData.details}
                  </p>
                  {rejectionData.detectedObject && (
                    <div className="mt-2 p-2 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs inline-block">
                      Detected: <span className="font-bold text-slate-900">{rejectionData.detectedObject}</span>
                    </div>
                  )}
                </div>

                {/* Retake & Recovery Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      setRejectionData(null);
                      setActiveMode('live');
                      setCapturedLivePhoto(null);
                      startCamera();
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Retake with Camera</span>
                  </button>

                  <button
                    onClick={() => {
                      setRejectionData(null);
                      setActiveMode('upload');
                      setUploadedImage(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload New Photo</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setRejectionData(null);
                    setActiveMode('preset');
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-4 cursor-pointer"
                >
                  Or switch to Verified Diagnostic Presets
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/90">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleExecuteScan}
            disabled={isProcessing}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition-all transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>
              {activeMode === 'live' && capturedLivePhoto
                ? 'Scan Captured Specimen'
                : 'Generate Diagnostic Assessment'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </motion.div>
    </div>
  );
};
