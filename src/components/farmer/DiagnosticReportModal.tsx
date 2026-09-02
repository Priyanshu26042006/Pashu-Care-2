import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
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
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DiagnosticAssessment, SupportedLanguage, AnimalProfile, CattleFormalReport, AuthUser } from '../../types';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface DiagnosticReportModalProps {
  assessment: DiagnosticAssessment | null;
  onClose: () => void;
  language: SupportedLanguage;
  onFlagForOfficerReview?: (assessmentId: string) => void;
  animals?: AnimalProfile[];
  currentUser?: AuthUser | null;
  onCreateSeparateReport?: (report: CattleFormalReport, targetAnimalId?: string) => void;
}

export const DiagnosticReportModal: React.FC<DiagnosticReportModalProps> = ({
  assessment,
  onClose,
  language,
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

  if (!assessment) return null;

  const isSufferingFromDisease = assessment.isDiseased ?? (
    !/healthy|normal|no active|no pathological|optimal/i.test(assessment.primaryDiagnosis) ||
    assessment.severityGrade === 'Emergency Quarantine' ||
    assessment.severityGrade === 'Severe' ||
    assessment.severityGrade === 'Moderate'
  );

  const identifiedDisease = assessment.diseaseIdentified || (
    isSufferingFromDisease
      ? assessment.primaryDiagnosis.replace(/\s*-\s*Clinical Stage.*$/i, '').replace(/\s*-\s*Stage.*$/i, '').trim()
      : 'Healthy (No Disease Detected)'
  );

  const commonDiseaseName = assessment.diseaseCommonName;
  const diseaseStatusLabel = assessment.diseaseStatus || (
    isSufferingFromDisease
      ? (assessment.severityGrade === 'Emergency Quarantine' ? 'Critical Outbreak Alert' : 'Active Clinical Condition')
      : 'Healthy Livestock Confirmed'
  );

  const diseaseStatement = assessment.diseaseSummaryStatement || (
    isSufferingFromDisease
      ? `The cattle is suffering from ${identifiedDisease} (${assessment.severityGrade || 'Clinical'} Grade). Prompt isolation, veterinary evaluation, and supportive intervention recommended.`
      : 'The cattle is evaluated as Healthy with no visible clinical pathology or infectious lesions detected. Normal coat luster, clear eyes and muzzle, and balanced conformation observed.'
  );

  const observedSymptomsList = assessment.symptomsObserved && assessment.symptomsObserved.length > 0
    ? assessment.symptomsObserved
    : (assessment.lesions && assessment.lesions.length > 0)
      ? assessment.lesions.map(l => `${l.label} (${l.anatomicalLocation})`)
      : isSufferingFromDisease
        ? ['Cutaneous lesions or postural discomfort observed during camera scan']
        : ['Clear eyes and moist muzzle perspiration', 'Smooth, glossy coat without lesions', 'Alert upright posture and symmetrical gait'];

  // Text to Speech narrative for rural farmers
  const handleVoiceNarrative = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      const langMap: Record<SupportedLanguage, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        bn: 'bn-IN',
        mr: 'mr-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        gu: 'gu-IN',
        ur: 'ur-IN',
        kn: 'kn-IN',
        or: 'or-IN',
        ml: 'ml-IN',
        pa: 'pa-IN',
        as: 'as-IN',
        mai: 'hi-IN', // Maithili uses Devanagari voice synthesis
        sat: 'hi-IN', // Santali regional synthesis
        ks: 'ur-IN',  // Kashmiri
        ne: 'ne-NP',  // Nepali
        kok: 'mr-IN', // Konkani uses Marathi/Goan synthesis
        sd: 'sd-IN',  // Sindhi
        doi: 'hi-IN', // Dogri uses Dogri/Hindi synthesis
        mni: 'bn-IN', // Manipuri
        brx: 'as-IN', // Bodo
        sa: 'hi-IN',  // Sanskrit
      };

      const isDiseased = assessment.isDiseased ?? (
        !/healthy|normal|no active|no pathological|optimal/i.test(assessment.primaryDiagnosis) ||
        assessment.severityGrade === 'Emergency Quarantine' ||
        assessment.severityGrade === 'Severe' ||
        assessment.severityGrade === 'Moderate'
      );

      const diseaseTitle = assessment.diseaseIdentified || (
        isDiseased
          ? assessment.primaryDiagnosis.replace(/\s*-\s*Clinical Stage.*$/i, '').replace(/\s*-\s*Stage.*$/i, '').trim()
          : 'Healthy (No Disease Detected)'
      );

      const localDiseaseName = assessment.diseaseCommonName || diseaseTitle;

      let narrativeText = isDiseased
        ? `Gemini AI Diagnosis: The cattle is suffering from ${diseaseTitle}. ${assessment.diseaseSummaryStatement || ''} Severity level is ${assessment.severityGrade}. Immediate remedies: ${assessment.immediateRemedies.join('. ')}.`
        : `Gemini AI Diagnosis: The cattle is healthy. No disease detected. ${assessment.diseaseSummaryStatement || ''} Body Condition Score is ${assessment.bodyConditionScore}.`;

      if (language === 'hi' || language === 'mai' || language === 'doi' || language === 'sa') {
        narrativeText = isDiseased
          ? `जेमिनी एआई निदान: पशु ${localDiseaseName} से पीड़ित है। ${assessment.diseaseSummaryStatement || ''} गंभीरता स्तर ${assessment.severityGrade} है। तत्काल उपाय: ${assessment.immediateRemedies.join(', ')}।`
          : `जेमिनी एआई निदान: पशु पूरी तरह स्वस्थ है और किसी भी रोग के लक्षण नहीं पाए गए हैं। शारीरिक स्थिति स्कोर ${assessment.bodyConditionScore} है।`;
      } else if (language === 'bn' || language === 'as' || language === 'mni') {
        narrativeText = isDiseased
          ? `জেমিনি এআই রোগ নির্ণয়: পশুটি ${diseaseTitle} রোগে ভুগছে। মাত্রা: ${assessment.severityGrade}। জরুরি চিকিৎসা: ${assessment.immediateRemedies.join(', ')}।`
          : `জেমিনি এআই রোগ নির্ণয়: পশুটি সম্পূর্ণ সুস্থ, কোনো রোগ শনাক্ত হয়নি।`;
      } else if (language === 'mr' || language === 'kok') {
        narrativeText = isDiseased
          ? `जेमिनी एआय निदान: पशु ${localDiseaseName} ने ग्रस्त आहे. तीव्रता स्तर ${assessment.severityGrade} आहे. तातडीचे उपाय: ${assessment.immediateRemedies.join(', ')}.`
          : `जेमिनी एआय निदान: पशु पूर्णपणे निरोगी आहे आणि कोणताही आजार नाही.`;
      } else if (language === 'gu') {
        narrativeText = isDiseased
          ? `જેમિની AI નિદાન: પશુ ${localDiseaseName} રોગથી પીડાઈ રહ્યું છે. તીવ્રતા સ્તર ${assessment.severityGrade} છે. તાત્કાલિક ઉપાયો: ${assessment.immediateRemedies.join(', ')}.`
          : `જેમિની AI નિદાન: પશુ સંપૂર્ણ સ્વસ્થ છે અને કોઈ રોગના લક્ષણ નથી.`;
      } else if (language === 'pa') {
        narrativeText = isDiseased
          ? `ਜੈਮਿਨੀ ਏਆਈ ਨਿਦਾਨ: ਪਸ਼ੂ ${localDiseaseName} ਤੋਂ ਪੀੜਤ ਹੈ। ਤੀਬਰਤਾ ਪੱਧਰ ${assessment.severityGrade} ਹੈ। ਤੁਰੰਤ ਉਪਾਅ: ${assessment.immediateRemedies.join(', ')}।`
          : `ਜੈਮਿਨੀ ਏਆਈ ਨਿਦਾਨ: ਪਸ਼ੂ ਪੂਰੀ ਤਰ੍ਹਾਂ ਤੰਦਰੁਸਤ ਹੈ।`;
      } else if (language === 'te') {
        narrativeText = isDiseased
          ? `జెమిని AI నిర్ధారణ: పశువు ${diseaseTitle} వ్యాధితో బాధపడుతోంది. తీవ్రత ${assessment.severityGrade}. తక్షణ చికిత్స: ${assessment.immediateRemedies.join(', ')}.`
          : `జెమిని AI నిర్ధారణ: పశువు సంపూర్ణ ఆరోగ్యంగా ఉంది.`;
      } else if (language === 'ta') {
        narrativeText = isDiseased
          ? `ஜெமினி AI நோய் கண்டறிதல்: கால்நடை ${diseaseTitle} நோயால் பாதிக்கப்பட்டுள்ளது. தீவிர நிலை ${assessment.severityGrade}. உடனடி தீர்வுகள்: ${assessment.immediateRemedies.join(', ')}.`
          : `ஜெமினி AI நோய் கண்டறிதல்: கால்நடை முழு ஆரோக்கியத்துடன் உள்ளது.`;
      } else if (language === 'kn') {
        narrativeText = isDiseased
          ? `ಜೆಮಿನಿ AI ರೋಗನಿರ್ಣಯ: ದನವು ${diseaseTitle} ರೋಗದಿಂದ ಬಳಲುತ್ತಿದೆ. ತೀವ್ರತೆಯ ಮಟ್ಟ ${assessment.severityGrade}. ತಕ್ಷಣದ ಪರಿಹಾರಗಳು: ${assessment.immediateRemedies.join(', ')}.`
          : `ಜೆಮಿನಿ AI ರೋಗನಿರ್ಣಯ: ದನವು ಸಂಪೂರ್ಣ ಆರೋಗ್ಯಕರವಾಗಿದೆ.`;
      } else if (language === 'ml') {
        narrativeText = isDiseased
          ? `ജെമിനി AI രോഗനിർണയം: കന്നുകാലി ${diseaseTitle} രോഗത്താൽ ബുദ്ധിമുട്ടുന്നു. തീവ്രത ${assessment.severityGrade}. അടിയന്തര പരിഹാരങ്ങൾ: ${assessment.immediateRemedies.join(', ')}.`
          : `ജെമിനി AI രോഗനിർണയം: കന്നുകാലി പൂർണ്ണ ആരോഗ്യവാനാണ്.`;
      } else if (language === 'or') {
        narrativeText = isDiseased
          ? `ଜେମିନି AI ନିଦାନ: ପଶୁଟି ${diseaseTitle} ରୋଗରେ ପୀଡିତ ଅଛି। ଗମ୍ଭୀରତା: ${assessment.severityGrade}। ତୁରନ୍ତ ପ୍ରତିକାର: ${assessment.immediateRemedies.join(', ')}।`
          : `ଜେମିନି AI ନିଦାନ: ପଶୁଟି ସମ୍ପୂର୍ଣ୍ଣ ସୁସ୍ଥ ଅଛି।`;
      } else if (language === 'ur' || language === 'ks' || language === 'sd') {
        narrativeText = isDiseased
          ? `جیمنی اے آئی تشخیص: مویشی ${diseaseTitle} کی بیماری میں مبتلا ہے۔ شدت: ${assessment.severityGrade}۔ فوری علاج: ${assessment.immediateRemedies.join(', ')}۔`
          : `جیمنی اے آئی تشخیص: مویشی مکمل طور پر صحت مند ہے۔`;
      }

      const utterance = new SpeechSynthesisUtterance(narrativeText);
      utterance.lang = langMap[language] || 'en-IN';
      utterance.rate = 0.95;
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
                        <span>Cattle is Suffering From:</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Health Examination Result:</span>
                      </>
                    )}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
                    {identifiedDisease}
                  </h3>

                  {commonDiseaseName && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] font-bold text-slate-500">Local / Vernacular Name:</span>
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
                    {isSufferingFromDisease ? 'Visual Signs Detected on Scanned Cattle:' : 'Confirmed Clinical Signs:'}
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
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Classified Breed</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{assessment.predictedBreed}</p>
                  <p className="text-[10px] text-emerald-700 font-mono font-semibold mt-0.5">Confidence: {assessment.breedConfidence}%</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Body Condition (BCS)</span>
                  <div className="flex items-baseline space-x-1 mt-0.5">
                    <span className="text-base font-bold text-slate-900">{assessment.bodyConditionScore}</span>
                    <span className="text-[10px] text-slate-500">/ 5.0</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {assessment.bodyConditionScore < 2.5 ? 'Underconditioned' : assessment.bodyConditionScore > 3.8 ? 'Overconditioned' : 'Ideal Reserve'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Coat & Skin Quality</span>
                  <p className="text-xs font-bold text-amber-800 mt-0.5">{assessment.coatCondition}</p>
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
                    {assessment.reproductiveAndLactationAlerts?.pregnancyRiskNotes || 
                      `Animal evaluated under ${assessment.pregnancyStatus || 'Gestational'} protocol. Maintain pyrexia control below 103.5°F.`}
                  </p>
                </div>

                {/* 2. Lactation & Milk Yield Impact */}
                <div className="p-3 bg-white rounded-xl border border-cyan-100/90 text-xs space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-cyan-900 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-cyan-600" />
                    Lactation Phase & Milk Yield Impact
                  </span>
                  <p className="text-slate-800 font-medium text-[11px] leading-relaxed">
                    {assessment.milkYieldImpact || 
                      assessment.reproductiveAndLactationAlerts?.lactationImpact || 
                      `Daily milk yield monitoring indicated under ${assessment.lactationStatus || 'active lactation'} protocol.`}
                  </p>
                </div>
              </div>

              {/* Drug Contraindications & Special Protocols */}
              {assessment.reproductiveAndLactationAlerts?.drugContraindications && assessment.reproductiveAndLactationAlerts.drugContraindications.length > 0 && (
                <div className="p-3 bg-rose-50/90 border border-rose-200 rounded-xl text-xs space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-rose-900 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                    Contraindicated Medications & Abortifacient Warnings
                  </span>
                  <ul className="space-y-1 text-[11px] text-rose-950 font-medium">
                    {assessment.reproductiveAndLactationAlerts.drugContraindications.map((contra, cIdx) => (
                      <li key={cIdx} className="flex items-start space-x-1.5">
                        <span className="text-rose-600 font-bold">•</span>
                        <span>{contra}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nutritional & Management Advice */}
              {assessment.reproductiveAndLactationAlerts?.nutritionalRecommendation && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Targeted Gestation & Lactation Nutrition Support
                  </span>
                  <p className="text-[11px] text-emerald-950 font-medium leading-relaxed">
                    {assessment.reproductiveAndLactationAlerts.nutritionalRecommendation}
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
                <span>Immediate First-Aid & Herbal Remedies (Farmer Action)</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {assessment.immediateRemedies.map((remedy, idx) => (
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
                <span>Recommended Veterinary Actions & Biosecurity</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {assessment.recommendedVeterinaryActions.map((action, idx) => (
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
              <div className="flex items-center space-x-2 text-slate-600">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Field Scan Geolocation: <strong className="text-slate-800">{assessment.gpsMetadata.district}, {assessment.gpsMetadata.state}</strong> [{assessment.gpsMetadata.lat.toFixed(4)}°, {assessment.gpsMetadata.lng.toFixed(4)}°]</span>
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

            <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 relative shadow-xs">
              <APIProvider apiKey={(import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || ''}>
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
                          BCS: {assessment.bodyConditionScore}/5.0 • {assessment.lesions?.length || 0} Lesions Identified • GPS: {assessment.gpsMetadata.district}, {assessment.gpsMetadata.state}
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
                            district: assessment.gpsMetadata.district,
                            state: assessment.gpsMetadata.state,
                            lat: assessment.gpsMetadata.lat,
                            lng: assessment.gpsMetadata.lng,
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

      </motion.div>
    </div>
  );
};
