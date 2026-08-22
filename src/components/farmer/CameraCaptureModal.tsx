import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Sparkles, 
  MapPin, 
  Compass, 
  Sun, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  Layers, 
  RefreshCw,
  Sliders,
  ChevronRight,
  Info,
  Maximize2,
  Heart,
  Droplet,
  Milk,
  Baby
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SAMPLE_CATTLE_PRESETS } from '../../data/mockLivestockData';
import { DiagnosticAssessment, SupportedLanguage, PregnancyStatus, LactationStatus } from '../../types';
import { runLivestockAssessment } from '../../services/apiService';
import { VoiceSymptomInput } from './VoiceSymptomInput';

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
  const [species, setSpecies] = useState<'Cattle' | 'Buffalo' | 'Goat' | 'Sheep'>('Cattle');
  const [symptomsText, setSymptomsText] = useState('');
  const [pregnancyStatus, setPregnancyStatus] = useState<PregnancyStatus>('Mid Gestation (4-6 Months)');
  const [lactationStatus, setLactationStatus] = useState<LactationStatus>('Mid Lactation');
  const [dailyMilkYield, setDailyMilkYield] = useState<number>(12.5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // AR Guidance State
  const [lightingScore, setLightingScore] = useState(92);
  const [alignmentScore, setAlignmentScore] = useState(88);
  const [tiltAngle, setTiltAngle] = useState(1.5);
  const [showOverlays, setShowOverlays] = useState(true);

  // GPS Metadata
  const [gpsData, setGpsData] = useState({
    lat: 21.5222,
    lng: 70.4579,
    district: 'Junagadh',
    state: 'Gujarat',
    accuracy: 4.2
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Get browser GPS if available
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsData((prev) => ({
            ...prev,
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
            accuracy: Number(pos.coords.accuracy.toFixed(1)) || 5.0,
          }));
        },
        (err) => {
          console.warn('Geolocation permission not granted, using regional default:', err.message);
        }
      );
    }
  }, []);

  // Handle WebCam start/stop
  useEffect(() => {
    if (isOpen && activeMode === 'live') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode]);

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
      setCameraError('Camera access unavailable. You can use sample cattle presets or upload a photo.');
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

  const captureLiveFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 800;
    canvas.height = videoRef.current.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setUploadedImage(dataUrl);
      setActiveMode('upload');
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
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
    setGpsData((prev) => ({
      ...prev,
      lat: preset.location.lat,
      lng: preset.location.lng,
      district: preset.location.district,
      state: preset.location.state,
    }));
  };

  const handleExecuteScan = async () => {
    setIsProcessing(true);
    setProcessingStage('1. Calibrating camera frame & edge biometric alignment...');

    let targetImage = selectedPreset.imageUrl;
    let presetHint = selectedPreset.breed;

    if (activeMode === 'upload' && uploadedImage) {
      targetImage = uploadedImage;
      presetHint = `${species} custom specimen`;
    }

    try {
      setTimeout(() => {
        setProcessingStage('2. Multi-Modal Vision: Analyzing breed traits, spine curvature & skin nodules...');
      }, 700);

      setTimeout(() => {
        setProcessingStage('3. Evaluating Pregnancy Risk, Lactation Phase & Contraindicated Drug Protocols...');
      }, 1500);

      setTimeout(() => {
        setProcessingStage('4. Dense Vector Retrieval: Querying Bharat Pashudhan (NDLM) & IEEE Dataport...');
      }, 2200);

      const assessment = await runLivestockAssessment({
        image: targetImage,
        species: species,
        symptoms: symptomsText || selectedPreset.symptoms,
        pregnancyStatus: pregnancyStatus,
        lactationStatus: lactationStatus,
        dailyMilkYieldLiters: dailyMilkYield,
        latitude: gpsData.lat,
        longitude: gpsData.lng,
        district: gpsData.district,
        state: gpsData.state,
        language: language,
        presetBreedHint: presetHint,
      });

      setTimeout(() => {
        setIsProcessing(false);
        onAssessmentComplete(assessment);
        onClose();
      }, 2900);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
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
                  Gemini Pro AI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                  AR Alignment Active
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Multi-modal AI vision with instant conformational & lesion screening
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
              onClick={() => setActiveMode('preset')}
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
              onClick={() => setActiveMode('live')}
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
              onClick={() => setActiveMode('upload')}
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

            {/* 2. Live Camera Stream */}
            {activeMode === 'live' && (
              <>
                {cameraError ? (
                  <div className="text-center p-6 space-y-3">
                    <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                    <p className="text-xs sm:text-sm text-slate-300 max-w-sm">{cameraError}</p>
                    <button
                      onClick={() => setActiveMode('preset')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs"
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
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                      <button
                        onClick={captureLiveFrame}
                        className="w-14 h-14 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center text-slate-950 shadow-2xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                      >
                        <Camera className="w-7 h-7" />
                      </button>
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
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white"
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
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{gpsData.district}</span>
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
                  <span>Align full lateral flank & head inside the frame (Distance: ~2.0m)</span>
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
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Select Veterinary Clinical Preset:</span>
                <span className="text-emerald-700 lowercase font-medium">{SAMPLE_CATTLE_PRESETS.length} curated case studies</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SAMPLE_CATTLE_PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center space-x-3 ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={preset.imageUrl}
                        alt={preset.breed}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{preset.breed}</h4>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                            preset.defaultDiagnosis.severity === 'Healthy'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : preset.defaultDiagnosis.severity === 'Moderate'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {preset.defaultDiagnosis.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{preset.defaultDiagnosis.disease}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                          <MapPin className="w-2.5 h-2.5 text-rose-500" />
                          {preset.location.district}, {preset.location.state}
                        </p>
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
          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-100 rounded-xl border border-slate-200 text-[11px] text-slate-600">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Geo-Tag: <strong className="text-slate-800">{gpsData.district}, {gpsData.state}</strong> ({gpsData.lat}, {gpsData.lng})</span>
            </div>
            <span className="text-emerald-700 font-mono font-bold">Accuracy ±{gpsData.accuracy}m</span>
          </div>

        </div>

        {/* Processing State Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4"
            >
              <div className="relative w-20 h-20">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
                <Sparkles className="w-8 h-8 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
              </div>

              <div className="space-y-1 max-w-md">
                <h3 className="text-lg font-bold text-slate-900">Running Multi-Modal Diagnostic AI</h3>
                <p className="text-xs text-emerald-700 font-mono transition-all font-semibold">{processingStage}</p>
              </div>

              <div className="w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 animate-pulse w-full"></div>
              </div>
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
            <span>Generate Diagnostic Assessment</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </motion.div>
    </div>
  );
};
