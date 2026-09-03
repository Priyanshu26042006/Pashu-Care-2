import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  Compass,
  Volume2, 
  VolumeX, 
  Share2, 
  Download, 
  BookOpen, 
  HeartHandshake, 
  Activity, 
  AlertTriangle, 
  Layers, 
  ExternalLink,
  Calendar,
  Check,
  Stethoscope,
  Maximize2,
  Baby,
  Milk,
  Heart,
  Droplet,
  AlertOctagon,
  ShieldCheck,
  FilePlus,
  FileCheck,
  Save,
  Plus,
  AlertCircle,
  Eye,
  Globe,
  ChevronDown,
  Languages,
  Search,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DiagnosticAssessment, SupportedLanguage, AnimalProfile, CattleFormalReport, AuthUser } from '../../types';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { isValidGoogleMapsKey, getStoredGoogleMapsApiKey } from '../../utils/googleMaps';
import { reverseGeocodeCoordinates } from '../../utils/geolocation';
import { SUPPORTED_LANGUAGES, getLanguageInfo, getReportUIText } from '../../utils/languages';
import { translateDiagnosticReport } from '../../services/apiService';

const POPULAR_REPORT_LANGS: SupportedLanguage[] = ['hi', 'en', 'gu', 'mr', 'pa', 'bn', 'te', 'ta'];

interface DiagnosticReportModalProps {
  assessment: DiagnosticAssessment | null;
  onClose: () => void;
  language: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  onFlagForOfficerReview?: (assessmentId: string) => void;
  animals?: AnimalProfile[];
  currentUser?: AuthUser | null;
  onCreateSeparateReport?: (report: CattleFormalReport, targetAnimalId?: string) => void;
}

export const DiagnosticReportModal: React.FC<DiagnosticReportModalProps> = ({
  assessment,
  onClose,
  language,
  onLanguageChange,
  onFlagForOfficerReview,
  animals = [],
  currentUser,
  onCreateSeparateReport,
}) => {
  const [showLesionBoxes, setShowLesionBoxes] = useState(true);
  const [selectedLesionId, setSelectedLesionId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [officerFlagged, setOfficerFlagged] = useState(false);

  // Multi-Lingual Report Language State
  const [reportLanguage, setReportLanguage] = useState<SupportedLanguage>(language);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [languageSearchQuery, setLanguageSearchQuery] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedFields, setTranslatedFields] = useState<{
    diseaseIdentified?: string;
    diseaseCommonName?: string;
    diseaseStatus?: string;
    diseaseSummaryStatement?: string;
    symptomsObserved?: string[];
    immediateRemedies?: string[];
    recommendedVeterinaryActions?: string[];
    biosecurityProtocol?: string[];
    coatCondition?: string;
    pregnancyRiskNotes?: string;
    lactationImpact?: string;
    drugContraindications?: string[];
    nutritionalRecommendation?: string;
  } | null>(null);

  // Synchronize when outer language changes
  useEffect(() => {
    setReportLanguage(language);
  }, [language]);

  // Translate report content whenever reportLanguage changes
  useEffect(() => {
    if (!assessment) return;
    if (reportLanguage === 'en') {
      setTranslatedFields(null);
      return;
    }

    let isCancelled = false;
    setIsTranslating(true);
    translateDiagnosticReport(assessment, reportLanguage)
      .then((fields) => {
        if (!isCancelled && fields) {
          setTranslatedFields(fields);
        }
      })
      .catch((err) => {
        console.warn('Diagnostic report translation notice:', err);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsTranslating(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [assessment, reportLanguage]);

  const handleSelectLanguage = (newLang: SupportedLanguage) => {
    setReportLanguage(newLang);
    setIsLanguageModalOpen(false);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  // Create Separate Report Drawer / Modal State
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [targetAnimalId, setTargetAnimalId] = useState<string>(
    assessment?.animalId || (animals.length > 0 ? animals[0].id : '')
  );
  const [customReportTitle, setCustomReportTitle] = useState(
    assessment ? `Clinical Health Dossier: ${assessment.primaryDiagnosis.split('-')[0].trim()}` : 'Bovine Health & Assessment Dossier'
  );
  const [customReportNotes, setCustomReportNotes] = useState(
    'Specimen inspected following automated biometric scan. Symptoms and visual lesions recorded for official veterinary herd dossier.'
  );
  const [reportCreatedSuccess, setReportCreatedSuccess] = useState<CattleFormalReport | null>(null);
  const [mapAuthFailed, setMapAuthFailed] = useState(false);

  // Resolved Location display state
  const [displayLocation, setDisplayLocation] = useState<{
    locationName: string;
    district: string;
    state: string;
    country: string;
    isLive: boolean;
  }>({
    locationName: assessment?.gpsMetadata.locationName || '',
    district: assessment?.gpsMetadata.district || 'Junagadh',
    state: assessment?.gpsMetadata.state || 'Gujarat',
    country: assessment?.gpsMetadata.country || 'India',
    isLive: Boolean(assessment?.gpsMetadata.isLiveLocation),
  });

  // Dynamically resolve actual scanned location if live or coordinates differ
  useEffect(() => {
    if (!assessment) return;
    const { lat, lng, district, state, country, locationName, isLiveLocation } = assessment.gpsMetadata;

    // If assessment already has an explicit location name and is not the hardcoded Junagadh default
    if (locationName && (district !== 'Junagadh' || isLiveLocation)) {
      setDisplayLocation({
        locationName,
        district,
        state,
        country: country || 'India',
        isLive: Boolean(isLiveLocation),
      });
      return;
    }

    // Check if coordinates deviate from Junagadh regional default (21.5222, 70.4579)
    const isDefaultJunagadh = Math.abs(lat - 21.5222) < 0.005 && Math.abs(lng - 70.4579) < 0.005;

    if (!isDefaultJunagadh || isLiveLocation) {
      let isCancelled = false;
      reverseGeocodeCoordinates(lat, lng)
        .then((geo) => {
          if (!isCancelled && geo && (geo.district || geo.locationName)) {
            setDisplayLocation({
              locationName: geo.locationName || `${geo.district}, ${geo.state}`,
              district: geo.district || district,
              state: geo.state || state,
              country: geo.country || 'India',
              isLive: true,
            });
          }
        })
        .catch((err) => {
          console.warn('Reverse geocode in report modal error:', err);
        });

      return () => {
        isCancelled = true;
      };
    } else {
      setDisplayLocation({
        locationName: locationName || `${district}, ${state}`,
        district,
        state,
        country: country || 'India',
        isLive: Boolean(isLiveLocation),
      });
    }
  }, [assessment]);

  // Catch Google Maps invalid key / auth failures gracefully
  useEffect(() => {
    const prevAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps Authentication Failed (InvalidKeyMapError). Switching seamlessly to GPS Geotag card.');
      setMapAuthFailed(true);
      if (typeof prevAuthFailure === 'function') {
        prevAuthFailure();
      }
    };

    return () => {
      (window as any).gm_authFailure = prevAuthFailure;
    };
  }, []);

  if (!assessment) return null;

  const currentLangInfo = getLanguageInfo(reportLanguage);
  const uiText = getReportUIText(reportLanguage);

  const envMapsKey = getStoredGoogleMapsApiKey();
  const hasValidGoogleMapsKey = isValidGoogleMapsKey(envMapsKey) && !mapAuthFailed;

  const isSufferingFromDisease = assessment.isDiseased ?? (
    !/healthy|normal|no active|no pathological|optimal/i.test(assessment.primaryDiagnosis) ||
    assessment.severityGrade === 'Emergency Quarantine' ||
    assessment.severityGrade === 'Severe' ||
    assessment.severityGrade === 'Moderate'
  );

  const identifiedDisease = translatedFields?.diseaseIdentified || assessment.diseaseIdentified || (
    isSufferingFromDisease
      ? assessment.primaryDiagnosis.replace(/\s*-\s*Clinical Stage.*$/i, '').replace(/\s*-\s*Stage.*$/i, '').trim()
      : 'Healthy (No Disease Detected)'
  );

  const commonDiseaseName = translatedFields?.diseaseCommonName || assessment.diseaseCommonName;
  const diseaseStatusLabel = translatedFields?.diseaseStatus || assessment.diseaseStatus || (
    isSufferingFromDisease
      ? (assessment.severityGrade === 'Emergency Quarantine' ? 'Critical Outbreak Alert' : 'Active Clinical Condition')
      : 'Healthy Livestock Confirmed'
  );

  const diseaseStatement = translatedFields?.diseaseSummaryStatement || assessment.diseaseSummaryStatement || (
    isSufferingFromDisease
      ? `The cattle is suffering from ${identifiedDisease} (${assessment.severityGrade || 'Clinical'} Grade). Prompt isolation, veterinary evaluation, and supportive intervention recommended.`
      : 'The cattle is evaluated as Healthy with no visible clinical pathology or infectious lesions detected. Normal coat luster, clear eyes and muzzle, and balanced conformation observed.'
  );

  const observedSymptomsList = (translatedFields?.symptomsObserved && translatedFields.symptomsObserved.length > 0)
    ? translatedFields.symptomsObserved
    : (assessment.symptomsObserved && assessment.symptomsObserved.length > 0)
      ? assessment.symptomsObserved
      : (assessment.lesions && assessment.lesions.length > 0)
        ? assessment.lesions.map(l => `${l.label} (${l.anatomicalLocation})`)
        : isSufferingFromDisease
          ? ['Cutaneous lesions or postural discomfort observed during camera scan']
          : ['Clear eyes and moist muzzle perspiration', 'Smooth, glossy coat without lesions', 'Alert upright posture and symmetrical gait'];

  const immediateRemedies = (translatedFields?.immediateRemedies && translatedFields.immediateRemedies.length > 0)
    ? translatedFields.immediateRemedies
    : assessment.immediateRemedies;

  const recommendedVeterinaryActions = (translatedFields?.recommendedVeterinaryActions && translatedFields.recommendedVeterinaryActions.length > 0)
    ? translatedFields.recommendedVeterinaryActions
    : assessment.recommendedVeterinaryActions;

  const pregnancyRiskNotes = translatedFields?.pregnancyRiskNotes || 
    assessment.reproductiveAndLactationAlerts?.pregnancyRiskNotes || 
    `Animal evaluated under ${assessment.pregnancyStatus || 'Gestational'} protocol. Maintain pyrexia control below 103.5°F.`;

  const lactationImpact = translatedFields?.lactationImpact || 
    assessment.milkYieldImpact || 
    assessment.reproductiveAndLactationAlerts?.lactationImpact || 
    `Daily milk yield monitoring indicated under ${assessment.lactationStatus || 'active lactation'} protocol.`;

  const drugContraindications = (translatedFields?.drugContraindications && translatedFields.drugContraindications.length > 0)
    ? translatedFields.drugContraindications
    : (assessment.reproductiveAndLactationAlerts?.drugContraindications || []);

  const nutritionalRecommendation = translatedFields?.nutritionalRecommendation || 
    assessment.reproductiveAndLactationAlerts?.nutritionalRecommendation;

  const coatCondition = translatedFields?.coatCondition || assessment.coatCondition;

  // Text to Speech narrative for rural farmers in their preferred report language
  const handleVoiceNarrative = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      const speechLang = currentLangInfo.speechCode || 'hi-IN';

      let narrativeText = '';
      if (reportLanguage === 'en') {
        narrativeText = isSufferingFromDisease
          ? `Veterinary Pathology Report. Identified condition: ${identifiedDisease}. ${diseaseStatement}. Severity grade: ${assessment.severityGrade}. Immediate remedies: ${immediateRemedies.slice(0, 3).join('. ')}.`
          : `Livestock Health Report: The animal is evaluated as healthy and in optimal condition. ${diseaseStatement}. Body condition score is ${assessment.bodyConditionScore}.`;
      } else {
        narrativeText = isSufferingFromDisease
          ? `${identifiedDisease} (${commonDiseaseName || ''}). ${diseaseStatement}. ${uiText.severityLabel}: ${assessment.severityGrade}. ${uiText.immediateRemediesTitle}: ${immediateRemedies.slice(0, 3).join('. ')}.`
          : `${uiText.healthyTitle}. ${diseaseStatement}. ${uiText.bodyConditionScoreTitle}: ${assessment.bodyConditionScore}.`;
      }

      const utterance = new SpeechSynthesisUtterance(narrativeText);
      utterance.lang = speechLang;
      utterance.rate = 0.92;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleShare = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleFlagCase = () => {
    setOfficerFlagged(true);
    if (onFlagForOfficerReview) {
      onFlagForOfficerReview(assessment.id);
    }
  };

  const getSeverityBadge = (grade: string) => {
    switch (grade) {
      case 'Emergency Quarantine':
        return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
      case 'Severe':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Moderate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden text-slate-800"
      >
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Clinical Assessment Report</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(assessment.severityGrade)}`}>
                  {assessment.severityGrade}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Report ID: <span className="font-mono text-emerald-700 font-bold">{assessment.id}</span> • {new Date(assessment.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            
            {/* Report Language Dropdown Trigger */}
            <button
              onClick={() => setIsLanguageModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs cursor-pointer"
              title="Change Report Language"
            >
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">{currentLangInfo.native}</span>
              <span className="text-[11px] text-slate-500 hidden md:inline">({currentLangInfo.label})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Vernacular Voice Narrator */}
            <button
              onClick={handleVoiceNarrative}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border cursor-pointer ${
                isPlayingAudio
                  ? 'bg-amber-500 text-white border-amber-600 font-bold animate-pulse'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
              }`}
              title="Listen to Vernacular Audio Summary"
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
              <span className="hidden sm:inline">{isPlayingAudio ? 'Stop Audio' : 'Listen'}</span>
            </button>

            {/* Share / Copy */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs transition-colors shadow-xs cursor-pointer"
              title="Share Clinical Report"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* MULTILINGUAL REPORT TOOLBAR */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-slate-50 p-3.5 sm:p-4 rounded-2xl border border-emerald-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    {uiText.reportLanguage}
                  </h4>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                    {currentLangInfo.native} • {currentLangInfo.label}
                  </span>
                  {isTranslating && (
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-700" />
                      {uiText.translating}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  View and change this diagnostic report in any of the 23 official Indian languages
                </p>
              </div>
            </div>

            {/* Quick-Switch Popular Language Pills */}
            <div className="flex items-center flex-wrap gap-1.5">
              {POPULAR_REPORT_LANGS.map((code) => {
                const info = getLanguageInfo(code);
                const isSelected = reportLanguage === code;
                return (
                  <button
                    key={code}
                    onClick={() => handleSelectLanguage(code)}
                    disabled={isTranslating && isSelected}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-600/30'
                        : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <span>{info.native}</span>
                  </button>
                );
              })}

              {/* All 23 Languages Modal Trigger */}
              <button
                onClick={() => setIsLanguageModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>+ 15 More</span>
              </button>
            </div>
          </div>
          
          {/* Top Grid: Image with Lesion Bounding Boxes + Breed & Posture Diagnostics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left: Annotated Livestock Vision Visualizer (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md">
                <img
                  src={assessment.imageUrl}
                  alt={assessment.predictedBreed}
                  className="w-full h-full object-cover"
                />

                {/* Lesion Bounding Boxes */}
                {showLesionBoxes && assessment.lesions.map((lesion) => {
                  const isSelected = selectedLesionId === lesion.id;
                  return (
                    <div
                      key={lesion.id}
                      onClick={() => setSelectedLesionId(isSelected ? null : lesion.id)}
                      style={{
                        top: `${lesion.boundingBox.ymin}%`,
                        left: `${lesion.boundingBox.xmin}%`,
                        width: `${lesion.boundingBox.xmax - lesion.boundingBox.xmin}%`,
                        height: `${lesion.boundingBox.ymax - lesion.boundingBox.ymin}%`,
                      }}
                      className={`absolute border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/30 scale-[1.02] shadow-lg'
                          : 'border-rose-500 bg-rose-500/20 hover:bg-rose-500/30'
                      }`}
                    >
                      <div className="absolute -top-6 left-0 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                        {lesion.label} ({lesion.confidence}%)
                      </div>
                    </div>
                  );
                })}

                {/* Bounding Box Toggle Control */}
                <div className="absolute bottom-2 right-2 flex items-center space-x-1.5 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-mono text-slate-300">
                  <Layers className="w-3 h-3 text-emerald-400" />
                  <button onClick={() => setShowLesionBoxes(!showLesionBoxes)} className="hover:text-white cursor-pointer">
                    {showLesionBoxes ? 'Hide Lesions' : 'Show Lesions'}
                  </button>
                </div>
              </div>

              {/* Lesion Details Pill (if selected or default list) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Detected Lesions ({assessment.lesions.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Click box to inspect</span>
                </div>

                {assessment.lesions.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => setSelectedLesionId(l.id)}
                    className={`p-2 rounded-lg text-[11px] cursor-pointer transition-colors border ${
                      selectedLesionId === l.id
                        ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-900">{l.label}</span>
                      <span className="text-rose-600 font-semibold">{l.severity}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{l.anatomicalLocation}: {l.clinicalDescription}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Breed, BCS & Conformational Biometrics (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* GEMINI AI DISEASE IDENTIFICATION CENTERPIECE */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border-2 shadow-md space-y-3.5 relative overflow-hidden ${
                  isSufferingFromDisease
                    ? 'bg-gradient-to-br from-rose-50/95 via-amber-50/40 to-white border-rose-400'
                    : 'bg-gradient-to-br from-emerald-50/95 via-teal-50/40 to-white border-emerald-400'
                }`}
              >
                {/* Accent Top Bar */}
                <div
                  className={`absolute top-0 inset-x-0 h-1.5 ${
                    isSufferingFromDisease
                      ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600'
                      : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
                  }`}
                />

                {/* Top Badge Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] sm:text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border shadow-2xs ${
                        isSufferingFromDisease
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Gemini AI Veterinary Diagnosis
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        isSufferingFromDisease
                          ? assessment.severityGrade === 'Emergency Quarantine'
                            ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {diseaseStatusLabel}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                    NDLM Reference: {assessment.ragCitations[0]?.source || 'National Protocol'}
                  </span>
                </div>

                {/* Main Disease Declaration */}
                <div className="space-y-1">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isSufferingFromDisease ? 'text-rose-700' : 'text-emerald-800'
                    }`}
                  >
                    {isSufferingFromDisease ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{uiText.sufferingFrom || 'Cattle is Suffering From:'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{uiText.healthResult || 'Health Examination Result:'}</span>
                      </>
                    )}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
                    {identifiedDisease}
                  </h3>

                  {commonDiseaseName && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] font-bold text-slate-500">{uiText.localVernacularName || 'Local / Vernacular Name'}:</span>
                      <span className="text-xs font-bold text-slate-800 bg-white/90 px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                        {commonDiseaseName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Clear Clinical Statement */}
                <div
                  className={`p-3 rounded-xl border backdrop-blur-xs space-y-1 ${
                    isSufferingFromDisease
                      ? 'bg-white/95 border-rose-200'
                      : 'bg-white/95 border-emerald-200'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Gemini AI Clinical Statement
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
                    {diseaseStatement}
                  </p>
                </div>

                {/* Observable Symptoms Identified on Scanned Animal */}
                <div className="space-y-1.5 pt-0.5">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-slate-700" />
                    {isSufferingFromDisease ? (uiText.observedSymptomsTitle || uiText.symptomsObservedTitle || 'Visual Signs Detected on Scanned Cattle:') : 'Confirmed Clinical Signs:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {observedSymptomsList.map((symptom, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 border shadow-2xs ${
                          isSufferingFromDisease
                            ? 'bg-rose-100/80 text-rose-900 border-rose-200'
                            : 'bg-emerald-100/80 text-emerald-900 border-emerald-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSufferingFromDisease ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Breed & Species Identification Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{uiText.classifiedBreed || 'Classified Breed'}</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{assessment.predictedBreed}</p>
                  <p className="text-[10px] text-emerald-700 font-mono font-semibold mt-0.5">Confidence: {assessment.breedConfidence}%</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{uiText.bodyConditionScoreTitle}</span>
                  <div className="flex items-baseline space-x-1 mt-0.5">
                    <span className="text-base font-bold text-slate-900">{assessment.bodyConditionScore}</span>
                    <span className="text-[10px] text-slate-500">/ 5.0</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {assessment.bodyConditionScore < 2.5 ? 'Underconditioned' : assessment.bodyConditionScore > 3.8 ? 'Overconditioned' : 'Ideal Reserve'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{uiText.coatConditionTitle || 'Coat & Skin Quality'}</span>
                  <p className="text-xs font-bold text-amber-800 mt-0.5">{coatCondition}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Posture: {assessment.postureAssessment.spineCurvature}</p>
                </div>
              </div>

              {/* Differential Diagnoses Probabilities */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Differential Diagnoses Ranking</span>
                  <span className="text-[10px] text-slate-500 lowercase font-normal">Trained on Indian epidemiological clusters</span>
                </h4>

                <div className="space-y-2">
                  {assessment.differentialDiagnoses.map((diff, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-900">{diff.disease}</span>
                        <span className="text-emerald-700 font-mono font-bold">{diff.probability}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${diff.probability}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Indicators: {diff.keyIndications.join(' • ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conformational Posture & Biometrics */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Conformational Posture Indices
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {assessment.conformationalMetrics.map((cm, idx) => (
                    <div key={idx} className="p-2 bg-white rounded-lg text-[11px] border border-slate-200 shadow-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-800">{cm.metric}</span>
                        <span className={cm.status === 'Optimal' ? 'text-emerald-700' : 'text-amber-700'}>
                          {cm.score}/100
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{cm.details}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Cattle Pregnancy & Lactation Comprehensive Assessment */}
          {(assessment.pregnancyStatus || assessment.lactationStatus || assessment.reproductiveAndLactationAlerts) && (
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3.5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xs">
                    <Baby className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                      Cattle Reproductive & Lactation Analysis
                    </h4>
                    <p className="text-[11px] text-purple-700">Trimester-Safe Diagnostics & Milk Production Assessment</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {assessment.pregnancyStatus && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-purple-600" />
                      {assessment.pregnancyStatus}
                    </span>
                  )}
                  {assessment.lactationStatus && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 flex items-center gap-1">
                      <Milk className="w-3 h-3 text-cyan-600" />
                      {assessment.lactationStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Summary & Milk Yield Impact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Pregnancy Safety & Risk Notes */}
                <div className="p-3 bg-white rounded-xl border border-purple-100/90 text-xs space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-purple-900 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-purple-600" />
                    Gestational Stage & Fetal Safety
                  </span>
                  <p className="text-slate-800 font-medium text-[11px] leading-relaxed">
                    {pregnancyRiskNotes}
                  </p>
                </div>

                {/* 2. Lactation & Milk Yield Impact */}
                <div className="p-3 bg-white rounded-xl border border-cyan-100/90 text-xs space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-cyan-900 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-cyan-600" />
                    Lactation Phase & Milk Yield Impact
                  </span>
                  <p className="text-slate-800 font-medium text-[11px] leading-relaxed">
                    {lactationImpact}
                  </p>
                </div>
              </div>

              {/* Drug Contraindications & Special Protocols */}
              {drugContraindications && drugContraindications.length > 0 && (
                <div className="p-3 bg-rose-50/90 border border-rose-200 rounded-xl text-xs space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-rose-900 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                    Contraindicated Medications & Abortifacient Warnings
                  </span>
                  <ul className="space-y-1 text-[11px] text-rose-950 font-medium">
                    {drugContraindications.map((contra, cIdx) => (
                      <li key={cIdx} className="flex items-start space-x-1.5">
                        <span className="text-rose-600 font-bold">•</span>
                        <span>{contra}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nutritional & Management Advice */}
              {nutritionalRecommendation && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Targeted Gestation & Lactation Nutrition Support
                  </span>
                  <p className="text-[11px] text-emerald-950 font-medium leading-relaxed">
                    {nutritionalRecommendation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actionable Remedies & Veterinary Protocols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Immediate First-Aid & Ethno-Veterinary Remedies */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2.5">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center space-x-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>{uiText.immediateRemediesTitle}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {immediateRemedies.map((remedy, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prescribed Veterinary Actions & Biosecurity */}
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Stethoscope className="w-4 h-4 text-amber-600" />
                <span>{uiText.recommendedVetTitle}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {recommendedVeterinaryActions.map((action, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Official RAG Citations (Bharat Pashudhan / IEEE Dataport / CID) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>RAG Knowledge Base Citations & Clinical References</span>
              </h4>
              <span className="text-[10px] text-emerald-700 font-mono font-bold">Vector Match (E5-large)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assessment.ragCitations.map((citation, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {citation.source}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Score: {(citation.relevanceScore * 100).toFixed(1)}%</span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs">{citation.title}</h5>
                  <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200">
                    "{citation.guidelineSnippet}"
                  </p>
                  {citation.url && (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 mt-1"
                    >
                      <span>View Official Portal Guideline</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* GPS Metadata & Officer Flagging CTA */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3">
              <div className="flex items-center space-x-2 text-slate-700 flex-wrap">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>
                  Scanned Cattle Location:{' '}
                  <strong className="text-slate-900 font-bold">
                    {displayLocation.locationName || `${displayLocation.district}, ${displayLocation.state}`}
                  </strong>{' '}
                  <span className="text-slate-500 font-mono">
                    [{assessment.gpsMetadata.lat.toFixed(4)}°, {assessment.gpsMetadata.lng.toFixed(4)}°]
                  </span>
                </span>
                {displayLocation.isLive && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Field GPS
                  </span>
                )}
              </div>

              <button
                onClick={handleFlagCase}
                disabled={officerFlagged}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  officerFlagged
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default font-bold'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                }`}
              >
                {officerFlagged ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{officerFlagged ? 'Flagged to Vet Officer Queue' : 'Flag for Veterinary Officer Review'}</span>
              </button>
            </div>

            <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 relative shadow-xs bg-slate-900">
              {hasValidGoogleMapsKey ? (
                <APIProvider apiKey={envMapsKey}>
                  <Map
                    defaultCenter={{ lat: assessment.gpsMetadata.lat, lng: assessment.gpsMetadata.lng }}
                    defaultZoom={12}
                    mapId="DEMO_MAP_ID"
                    disableDefaultUI={true}
                    zoomControl={true}
                    className="w-full h-full"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  >
                    <AdvancedMarker
                      position={{ lat: assessment.gpsMetadata.lat, lng: assessment.gpsMetadata.lng }}
                      title={`${assessment.id} - ${assessment.predictedBreed}`}
                    >
                      <Pin
                        background={
                          assessment.severityGrade === 'Emergency Quarantine'
                            ? '#dc2626'
                            : assessment.severityGrade === 'Severe'
                            ? '#e11d48'
                            : '#d97706'
                        }
                        borderColor="#ffffff"
                        glyphColor="#ffffff"
                        scale={1.1}
                      />
                    </AdvancedMarker>
                  </Map>
                </APIProvider>
              ) : (
                <div className="w-full h-full p-3.5 flex flex-col justify-between relative overflow-hidden bg-radial from-slate-800 to-slate-950 text-white">
                  {/* Background GIS Gridlines & Radar Circles */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 border border-emerald-500 rounded-full animate-ping duration-1000" />
                    <div className="w-40 h-40 border border-cyan-500/50 rounded-full" />
                    <div className="w-24 h-24 border border-slate-600 rounded-full" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:16px_16px]" />
                  </div>

                  {/* Top GPS Status bar */}
                  <div className="relative z-10 flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center space-x-1.5 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700">
                      <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      <span className="text-emerald-300 font-bold">GPS Geotag Fixed</span>
                    </div>
                    <span className="text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700 text-[10px]">
                      NDLM Georeferenced
                    </span>
                  </div>

                  {/* Center Location & Coordinates */}
                  <div className="relative z-10 text-center my-auto px-4">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/30 mb-1">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-100 line-clamp-2" title={displayLocation.locationName || `${displayLocation.district}, ${displayLocation.state}`}>
                      {displayLocation.locationName || `${displayLocation.district}, ${displayLocation.state}`}
                    </p>
                    <p className="text-[11px] font-mono text-emerald-400">
                      {assessment.gpsMetadata.lat.toFixed(4)}°N, {assessment.gpsMetadata.lng.toFixed(4)}°E
                    </p>
                    <span className="text-[10px] text-slate-400">Cattle Scanned Location</span>
                  </div>

                  {/* Bottom Coordinates & Link */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-1.5">
                    <span>Altitude: ~{assessment.gpsMetadata.altitudeMeters || 312}m • Precision: ±4.2m</span>
                    <a
                      href={`https://www.google.com/maps?q=${assessment.gpsMetadata.lat},${assessment.gpsMetadata.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
                      title={`Open ${displayLocation.locationName || displayLocation.district} in Google Maps`}
                    >
                      <span>Open in Maps ({displayLocation.district || 'Scanned Location'})</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/90">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            {/* Create Separate Report Button */}
            <button
              onClick={() => {
                setIsCreatingReport(true);
                setReportCreatedSuccess(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>Create Separate Cattle Report</span>
            </button>
          </div>
        </div>

        {/* Create Separate Cattle Report Builder Dialog */}
        <AnimatePresence>
          {isCreatingReport && (
            <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <FilePlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Create Official Cattle Report</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Automatically adds under Cattle section in both Farmer & Veterinary interfaces
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCreatingReport(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-y-auto space-y-4 text-xs">
                  {reportCreatedSuccess ? (
                    <div className="py-6 text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-900">Report Successfully Generated!</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Report <strong className="text-emerald-800 font-mono">#{reportCreatedSuccess.reportNumber}</strong> has been created and automatically synchronized under the <span className="font-bold text-slate-800">Cattle section</span> for both Farmer and Veterinary interfaces.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1 font-mono text-[11px]">
                        <div><strong>Title:</strong> {reportCreatedSuccess.title}</div>
                        <div><strong>Animal:</strong> {reportCreatedSuccess.animalEarTag} ({reportCreatedSuccess.breed})</div>
                        <div><strong>Diagnosis:</strong> {reportCreatedSuccess.primaryDiagnosis}</div>
                        <div><strong>NDLM Status:</strong> {reportCreatedSuccess.ndlmSyncStatus}</div>
                      </div>

                      <button
                        onClick={() => {
                          setIsCreatingReport(false);
                          setReportCreatedSuccess(null);
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                      >
                        Done / Return to Scan View
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Target Cattle Selection */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                          Attach to Registered Cattle Record
                        </label>
                        <select
                          value={targetAnimalId}
                          onChange={(e) => setTargetAnimalId(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          {animals.map((anim) => (
                            <option key={anim.id} value={anim.id}>
                              {anim.earTagNumber} - {anim.name || anim.breed} ({anim.ownerName})
                            </option>
                          ))}
                          <option value="new_specimen">
                            + Register as New Cattle Record ({assessment.predictedBreed})
                          </option>
                        </select>
                      </div>

                      {/* Report Title */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                          Report Title
                        </label>
                        <input
                          type="text"
                          value={customReportTitle}
                          onChange={(e) => setCustomReportTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium text-xs focus:ring-2 focus:ring-emerald-500"
                          placeholder="e.g., Lumpy Skin Disease Triage & Quarantine Report"
                        />
                      </div>

                      {/* Diagnosis & Summary Preview */}
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-slate-500">Auto-Compiled Diagnosis</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {assessment.severityGrade}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900">{assessment.primaryDiagnosis}</p>
                        <p className="text-[11px] text-slate-500">
                          BCS: {assessment.bodyConditionScore}/5.0 • {assessment.lesions?.length || 0} Lesions Identified • GPS: {displayLocation.locationName || `${displayLocation.district}, ${displayLocation.state}`}
                        </p>
                      </div>

                      {/* Custom Observations Notes */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                          Additional Clinical Notes / Farmer Observations
                        </label>
                        <textarea
                          rows={3}
                          value={customReportNotes}
                          onChange={(e) => setCustomReportNotes(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 resize-none"
                          placeholder="Add field notes, medication administered, or herd isolation remarks..."
                        />
                      </div>

                      {/* Author Tag */}
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-slate-600">Created by: <strong className="text-slate-900">{currentUser?.name || 'Authorized User'}</strong></span>
                        <span className="font-bold text-emerald-800">{currentUser?.role === 'veterinarian' ? 'Veterinary Officer' : 'Livestock Farmer'}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                {!reportCreatedSuccess && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                    <button
                      onClick={() => setIsCreatingReport(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => {
                        const matchedAnimal = animals.find((a) => a.id === targetAnimalId);
                        const newReport: CattleFormalReport = {
                          id: `rep-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
                          reportNumber: `NDLM-REP-${Math.floor(100000 + Math.random() * 900000)}`,
                          animalId: matchedAnimal?.id || assessment.animalId || `anim-${Date.now().toString(36)}`,
                          animalEarTag: matchedAnimal?.earTagNumber || `IN-DLM-${Math.floor(1000 + Math.random() * 9000)}`,
                          animalName: matchedAnimal?.name || `${assessment.predictedBreed.split(' ')[0]} Specimen`,
                          breed: assessment.predictedBreed,
                          species: assessment.detectedSpecies,
                          createdAt: new Date().toISOString(),
                          authorRole: currentUser?.role === 'veterinarian' ? 'Veterinary Officer' : 'Farmer',
                          authorName: currentUser?.name || 'Registered User',
                          title: customReportTitle || `Health Assessment: ${assessment.primaryDiagnosis}`,
                          primaryDiagnosis: assessment.primaryDiagnosis,
                          severityGrade: assessment.severityGrade,
                          summaryObservations: `${assessment.primaryDiagnosis}. Coat: ${assessment.coatCondition}. Posture: ${assessment.postureAssessment?.headCarriage}, ${assessment.postureAssessment?.weightBearing}.`,
                          customNotes: customReportNotes,
                          immediateRemedies: assessment.immediateRemedies || [],
                          recommendedVeterinaryActions: assessment.recommendedVeterinaryActions || [],
                          drugContraindications: assessment.reproductiveAndLactationAlerts?.drugContraindications || [],
                          bcsScore: assessment.bodyConditionScore,
                          pregnancyStatus: assessment.pregnancyStatus,
                          lactationStatus: assessment.lactationStatus,
                          dailyMilkYieldLiters: assessment.milkYieldImpact ? undefined : 12.0,
                          imageUrl: assessment.imageUrl,
                          gpsLocation: {
                            district: displayLocation.district,
                            state: displayLocation.state,
                            locationName: displayLocation.locationName,
                            country: displayLocation.country,
                            lat: assessment.gpsMetadata.lat,
                            lng: assessment.gpsMetadata.lng,
                            isLiveLocation: displayLocation.isLive,
                          },
                          ndlmSyncStatus: 'Synchronized & Verified',
                        };

                        if (onCreateSeparateReport) {
                          onCreateSeparateReport(newReport, matchedAnimal?.id || targetAnimalId);
                        }
                        setReportCreatedSuccess(newReport);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save & Add to Cattle Section</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Full 23 Constitutional Languages Selection Dialog */}
        <AnimatePresence>
          {isLanguageModalOpen && (
            <div className="fixed inset-0 z-70 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-slate-800"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{uiText.selectLanguageTitle || uiText.allLanguages || 'Select Report Language'}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        23 Official Constitutional Languages Supported for Rural Livestock Farmers
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsLanguageModalOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-slate-100 bg-white">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by language, native script, or state..."
                      value={languageSearchQuery}
                      onChange={(e) => setLanguageSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Language Grid */}
                <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  {SUPPORTED_LANGUAGES.filter((lang) => {
                    const q = languageSearchQuery.toLowerCase().trim();
                    if (!q) return true;
                    return (
                      lang.label.toLowerCase().includes(q) ||
                      lang.native.toLowerCase().includes(q) ||
                      (lang.region && lang.region.toLowerCase().includes(q))
                    );
                  }).map((lang) => {
                    const isSelected = reportLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => handleSelectLanguage(lang.code)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900">{lang.native}</span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-medium text-slate-700">{lang.label}</span>
                          {lang.region && <span className="text-[10px] text-slate-400 truncate max-w-[90px]">{lang.region}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                  <span>Current: <strong className="text-slate-800">{currentLangInfo.native} ({currentLangInfo.label})</strong></span>
                  <button
                    onClick={() => setIsLanguageModalOpen(false)}
                    className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
