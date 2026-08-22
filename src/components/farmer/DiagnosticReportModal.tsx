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
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { DiagnosticAssessment, SupportedLanguage } from '../../types';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface DiagnosticReportModalProps {
  assessment: DiagnosticAssessment | null;
  onClose: () => void;
  language: SupportedLanguage;
  onFlagForOfficerReview?: (assessmentId: string) => void;
}

export const DiagnosticReportModal: React.FC<DiagnosticReportModalProps> = ({
  assessment,
  onClose,
  language,
  onFlagForOfficerReview,
}) => {
  const [showLesionBoxes, setShowLesionBoxes] = useState(true);
  const [selectedLesionId, setSelectedLesionId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [officerFlagged, setOfficerFlagged] = useState(false);

  if (!assessment) return null;

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

      let narrativeText = `Livestock Health Report: Primary finding is ${assessment.primaryDiagnosis}. Detected breed is ${assessment.predictedBreed} with ${assessment.breedConfidence}% confidence. Body Condition Score is ${assessment.bodyConditionScore}. Immediate remedies: ${assessment.immediateRemedies.join('. ')}.`;

      if (language === 'hi' || language === 'mai' || language === 'doi' || language === 'sa') {
        narrativeText = `पशु स्वास्थ्य रिपोर्ट: प्राथमिक निदान है ${assessment.primaryDiagnosis}. नस्ल है ${assessment.predictedBreed}. शारीरिक स्थिति स्कोर ${assessment.bodyConditionScore} है. तत्काल उपाय: ${assessment.immediateRemedies.join(', ')}.`;
      } else if (language === 'bn' || language === 'as' || language === 'mni') {
        narrativeText = `পশু স্বাস্থ্য রিপোর্ট: প্রাথমিক রোগ নির্ণয় ${assessment.primaryDiagnosis}। জাত ${assessment.predictedBreed}। বডি কন্ডিশন স্কোর ${assessment.bodyConditionScore}। জরুরি চিকিৎসা: ${assessment.immediateRemedies.join(', ')}।`;
      } else if (language === 'mr' || language === 'kok') {
        narrativeText = `पशु आरोग्य अहवाल: प्राथमिक निदान ${assessment.primaryDiagnosis} आहे. जात ${assessment.predictedBreed}. शरीर स्थिती गुण ${assessment.bodyConditionScore}. तातडीचे उपाय: ${assessment.immediateRemedies.join(', ')}.`;
      } else if (language === 'gu') {
        narrativeText = `પશુ આરોગ્ય અહેવાલ: પ્રાથમિક નિદાન ${assessment.primaryDiagnosis} છે. ઓલાદ ${assessment.predictedBreed}. શારીરિક સ્થિતિ સ્કોર ${assessment.bodyConditionScore}. તાત્કાલિક ઉપાયો: ${assessment.immediateRemedies.join(', ')}.`;
      } else if (language === 'pa') {
        narrativeText = `ਪਸ਼ੂ ਸਿਹਤ ਰਿਪੋਰਟ: ਮੁੱਖ ਨਿਦਾਨ ${assessment.primaryDiagnosis} ਹੈ। ਨਸਲ ${assessment.predictedBreed}। ਸਰੀਰਕ ਸਥਿਤੀ ਸਕੋਰ ${assessment.bodyConditionScore}। ਤੁਰੰਤ ਉਪਾਅ: ${assessment.immediateRemedies.join(', ')}।`;
      } else if (language === 'te') {
        narrativeText = `పశు ఆరోగ్య నివేదిక: ప్రాథమిక నిర్ధారణ ${assessment.primaryDiagnosis}. జాతి ${assessment.predictedBreed}. శరీర స్థితి స్కోరు ${assessment.bodyConditionScore}. తక్షణ నివారణోపాయాలు: ${assessment.immediateRemedies.join(', ')}.`;
      } else if (language === 'ta') {
        narrativeText = `கால்நடை சுகாதார அறிக்கை: முதன்மை நோய் கண்டறிதல் ${assessment.primaryDiagnosis}. இனம் ${assessment.predictedBreed}. உடல் நிலை மதிப்பீடு ${assessment.bodyConditionScore}. உடனடி தீர்வுகள்: ${assessment.immediateRemedies.join(', ')}.`;
      } else if (language === 'kn') {
        narrativeText = `ಪಶು ಆರೋಗ್ಯ ವರದಿ: ಪ್ರಾಥಮಿಕ ರೋಗನಿರ್ಣಯ ${assessment.primaryDiagnosis}. ತಳಿ ${assessment.predictedBreed}. ದೇಹ ಸ್ಥಿತಿ ಸ್ಕೋರ್ ${assessment.bodyConditionScore}. ತಕ್ಷಣದ ಪರಿಹಾರಗಳು: ${assessment.immediateRemedies.join(', ')}.`;
      } else if (language === 'ml') {
        narrativeText = `കന്നുകാലി ആരോഗ്യ റിപ്പോർട്ട്: പ്രാഥമിക രോഗനിർണയം ${assessment.primaryDiagnosis}. ഇനം ${assessment.predictedBreed}. ബോഡി കണ്ടീഷൻ സ്കോർ ${assessment.bodyConditionScore}. അടിയന്തര പരിഹാരങ്ങൾ: ${assessment.immediateRemedies.join(', ')}.`;
      } else if (language === 'or') {
        narrativeText = `ପଶୁ ସ୍ୱାସ୍ଥ୍ୟ ରିପୋର୍ଟ: ପ୍ରାଥମିକ ଚିହ୍ନଟ ${assessment.primaryDiagnosis}। ନସଲ ${assessment.predictedBreed}। ଶାରୀରିକ ସ୍ଥିତି ସ୍କୋର ${assessment.bodyConditionScore}। ତୁରନ୍ତ ପ୍ରତିକାର: ${assessment.immediateRemedies.join(', ')}।`;
      } else if (language === 'ur' || language === 'ks' || language === 'sd') {
        narrativeText = `مویشیوں کی صحت کی رپورٹ: بنیادی تشخیص ${assessment.primaryDiagnosis} ہے۔ نسل ${assessment.predictedBreed} ہے۔ جسمانی حالت کا اسکور ${assessment.bodyConditionScore} ہے۔ فوری تدابیر: ${assessment.immediateRemedies.join(', ')}۔`;
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
              
              {/* Primary Diagnosis Callout Banner */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Primary AI Diagnosis
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    NDLM Reference: {assessment.ragCitations[0]?.source || 'National Protocol'}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {assessment.primaryDiagnosis}
                </h3>
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
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/90">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
          >
            Close Report
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
