import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Globe, 
  Volume2, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Languages, 
  Activity, 
  Play, 
  Square,
  FileText,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportedLanguage, VoiceSymptomAnalysisResult } from '../../types';
import { analyzeVoiceSymptoms } from '../../services/apiService';

interface VoiceSymptomInputProps {
  value: string;
  onChange: (value: string) => void;
  language: SupportedLanguage;
  species?: string;
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  speechLocale: string;
}

const SUPPORTED_VOICE_LANGUAGES: LanguageOption[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechLocale: 'hi-IN' },
  { code: 'en', name: 'English (India)', nativeName: 'English', speechLocale: 'en-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechLocale: 'bn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechLocale: 'mr-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechLocale: 'te-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechLocale: 'ta-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechLocale: 'gu-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اُردُو', speechLocale: 'ur-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechLocale: 'kn-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', speechLocale: 'or-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechLocale: 'ml-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechLocale: 'pa-IN' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', speechLocale: 'as-IN' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', speechLocale: 'hi-IN' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', speechLocale: 'hi-IN' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر', speechLocale: 'ur-IN' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', speechLocale: 'ne-NP' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', speechLocale: 'mr-IN' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', speechLocale: 'sd-IN' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', speechLocale: 'hi-IN' },
  { code: 'mni', name: 'Manipuri', nativeName: 'ꯃꯤꯇែꯢꯂꯣꯟ', speechLocale: 'bn-IN' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', speechLocale: 'as-IN' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', speechLocale: 'hi-IN' },
];

const SAMPLE_MULTILINGUAL_QUERIES = [
  {
    langCode: 'hi',
    langLabel: 'Hindi (हिन्दी - उत्तर भारत)',
    text: 'गाय को दो दिन से 104 डिग्री बुखार है, गर्दन और पीठ पर बड़ी-बड़ी सख्त गांठें उभर आई हैं और दूध आधा हो गया है।',
    hint: 'Lumpy Skin Disease (LSD) symptoms',
  },
  {
    langCode: 'bn',
    langLabel: 'Bengali (বাংলা - পশ্চিমবঙ্গ / ত্রিপুরা)',
    text: 'গরুটির দুই দিন ধরে খুব জ্বর, গায়ে চাকা চাকা গোটা বের হয়েছে আর হাঁটাচলা করতে কষ্ট হচ্ছে।',
    hint: 'Nodular dermatitis & fever',
  },
  {
    langCode: 'mr',
    langLabel: 'Marathi (मराठी - महाराष्ट्र)',
    text: 'गाईला तीव्र ताप आहे आणि कासेला सूज आली आहे, दूध काढताना वेदना होतात आणि दुधात गुठळ्या आहेत.',
    hint: 'Bovine Mastitis indications',
  },
  {
    langCode: 'te',
    langLabel: 'Telugu (తెలుగు - ఆంధ్రప్రదేశ్ / తెలంగాణ)',
    text: 'ఆవుకు 2 రోజులుగా అధిక జ్వరం ఉంది, శరీరమంతా గడ్డలు ఏర్పడ్డాయి, పాలు ఇవ్వడం బాగా తగ్గించింది.',
    hint: 'Cattle fever & skin eruption',
  },
  {
    langCode: 'ta',
    langLabel: 'Tamil (தமிழ் - தமிழ்நாடு)',
    text: 'மாட்டுக்கு 2 நாட்களாக கடுமையான காய்ச்சல் உள்ளது, தோலில் கட்டிகள் வந்துள்ளன, பால் உற்பத்தி குறைந்துள்ளது.',
    hint: 'Pyrexia and dermal nodules',
  },
  {
    langCode: 'gu',
    langLabel: 'Gujarati (ગુજરાતી - ગુજરાત)',
    text: 'ભેંસને 3 દિવસથી પગમાં સોજો અને લંગડાપણું છે, મોંમાંથી લાળ પડે છે અને ઘાસ ખાતી નથી.',
    hint: 'Foot & Mouth Disease (FMD) signs',
  },
  {
    langCode: 'kn',
    langLabel: 'Kannada (ಕನ್ನಡ - ಕರ್ನಾಟಕ)',
    text: 'ಹಸುವಿಗೆ ತೀವ್ರ ಜ್ವರವಿದೆ, ಮೈಮೇಲೆ ಗಂಟುಗಳು ಎದ್ದಿವೆ ಮತ್ತು ಕಂದು ಬಣ್ಣದ ಜೊಲ್ಲು ಸುರಿಸುತ್ತಿದೆ.',
    hint: 'Acute fever & salivation',
  },
  {
    langCode: 'ml',
    langLabel: 'Malayalam (മലയാളം - കേരളം)',
    text: 'പശുവിന് രണ്ട് ദിവസമായി കടുത്ത പനിയുണ്ട്, ത്വക്കിൽ മുഴകൾ കാണുന്നുണ്ട്, തീറ്റ എടുക്കുന്നില്ല.',
    hint: 'Skin nodules & anorexia',
  },
  {
    langCode: 'pa',
    langLabel: 'Punjabi (ਪੰਜਾਬੀ - ਪੰਜਾਬ)',
    text: 'ਗਾਂ ਨੂੰ ਦੋ ਦਿਨਾਂ ਤੋਂ ਤੇਜ਼ ਬੁਖਾਰ ਹੈ, ਚਮੜੀ ਤੇ ਗਿਲ੍ਹਟੀਆਂ ਬਣ ਗਈਆਂ ਹਨ ਅਤੇ ਚਾਰਾ ਖਾਣਾ ਬੰਦ ਕਰ ਦਿੱਤਾ ਹੈ।',
    hint: 'Acute fever & nodular dermis',
  },
  {
    langCode: 'or',
    langLabel: 'Odia (ଓଡ଼ିଆ - ଓଡ଼ିଶା)',
    text: 'ଗାଈକୁ ଦୁଇ ଦିନ ହେବ ତୀବ୍ର ଜ୍ୱର ଅଛି, ଚର୍ମରେ ଗୋଟା ଗୋଟା ଫୋଟକା ବାହାରିଛି ଏବଂ କ୍ଷୀର କମିଯାଇଛି।',
    hint: 'Odia LSD & lactation drop',
  },
  {
    langCode: 'as',
    langLabel: 'Assamese (অসমীয়া - অসম)',
    text: 'গৰুটোৰ দুদিন ধৰি তীব্ৰ জ্বৰ, গাৰ ছালত টেমুনা ওলাইছে আৰু ঘা হৈছে, ঘাঁহ খাব পৰা নাই।',
    hint: 'Nodular lesions & weakness',
  },
  {
    langCode: 'ur',
    langLabel: 'Urdu (اُردُو)',
    text: 'گائے کو شدید بخار ہے، جلد پر موٹی گلٹیاں نکل آئی ہیں اور دودھ کی پیداوار نصف رہ گئی ہے۔',
    hint: 'Pyrexia & nodular rash',
  },
  {
    langCode: 'mai',
    langLabel: 'Maithili (मैथिली - बिहार)',
    text: 'गाय के दू दिन सँ कड़ा बुखार अछि, देह पर बड़का-बड़का गांठ भ गेल अछि आ चारा नहि खा रहल अछि।',
    hint: 'Maithili fever & anorexia',
  },
  {
    langCode: 'ks',
    langLabel: 'Kashmiri (کٲشُر - کشمیر)',
    text: 'گاوِ چھُ زَن زَن تَپھ تہٕ ژَمَس پؠٹھ بَڑؠ بَڑؠ گَنڈٕ، کِھین چِھنہٕ کھؠوان۔',
    hint: 'Kashmiri bovine pyrexia',
  },
  {
    langCode: 'ne',
    langLabel: 'Nepali (नेपाली - सिक्किम/पहाडी)',
    text: 'गाईलाई दुई दिनदेखि चर्को ज्वरो आएको छ, छालामा ठूला-ठूला गाँठाहरू देखिएका छन् र दूध घटेको छ।',
    hint: 'Nepali bovine dermal lesions',
  },
];

export const VoiceSymptomInput: React.FC<VoiceSymptomInputProps> = ({
  value,
  onChange,
  language,
  species = 'Cattle',
}) => {
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<string>(
    SUPPORTED_VOICE_LANGUAGES.some(l => l.code === language) ? language : 'hi'
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [interimText, setInterimText] = useState('');
  const [lastAnalysis, setLastAnalysis] = useState<VoiceSymptomAnalysisResult | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showSamplesModal, setShowSamplesModal] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Sync default voice language if prop changes
  useEffect(() => {
    if (SUPPORTED_VOICE_LANGUAGES.some(l => l.code === language)) {
      setSelectedVoiceLang(language);
    }
  }, [language]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, []);

  const currentLangObj = SUPPORTED_VOICE_LANGUAGES.find(l => l.code === selectedVoiceLang) || SUPPORTED_VOICE_LANGUAGES[0];

  const startRecording = async () => {
    setAudioError(null);
    setInterimText('');
    setLastAnalysis(null);
    audioChunksRef.current = [];

    // Check browser speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    try {
      // 1. Setup Audio Stream for Visualizer & MediaRecorder fallback
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup AudioContext for live frequency visualizer
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animationFrameRef.current = requestAnimationFrame(updateLevel);
          }
        };
        updateLevel();
      } catch (e) {
        console.warn('AudioContext visualizer notice:', e);
      }

      // Setup MediaRecorder
      try {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        mediaRecorder.start(250);
      } catch (recErr) {
        console.warn('MediaRecorder notice:', recErr);
      }

      // 2. Setup Speech Recognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = currentLangObj.speechLocale;

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setInterimText((prev) => (prev ? `${prev} ${transcript}` : transcript));
            } else {
              currentTranscript += transcript;
            }
          }
          if (currentTranscript) {
            setInterimText(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition notice:', event.error);
          if (event.error === 'not-allowed') {
            setAudioError('Microphone permission blocked. Please enable microphone permissions in your browser.');
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Microphone access failed:', err);
      setAudioError(err.message || 'Could not access microphone. Try selecting a multilingual sample query below.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;
    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLevel(0);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      } catch (e) {}
    }

    // Process spoken input
    const spokenText = interimText.trim();
    if (spokenText) {
      await handleAnalyzeText(spokenText, selectedVoiceLang);
    } else if (audioChunksRef.current.length > 0) {
      // Analyze recorded audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      await handleAnalyzeAudioBlob(audioBlob, selectedVoiceLang);
    }
  };

  const handleAnalyzeAudioBlob = async (blob: Blob, langCode: string) => {
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const analysis = await analyzeVoiceSymptoms({
          audioData: base64Audio,
          mimeType: blob.type || 'audio/webm',
          language: langCode,
          species: species,
        });
        setLastAnalysis(analysis);
        if (analysis.clinicalSummary) {
          onChange(analysis.clinicalSummary);
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error('Voice analysis failed:', err);
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeText = async (text: string, langCode: string) => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeVoiceSymptoms({
        transcribedText: text,
        language: langCode,
        species: species,
      });
      setLastAnalysis(analysis);
      if (analysis.clinicalSummary) {
        onChange(analysis.clinicalSummary);
      }
    } catch (err: any) {
      console.error('Voice text analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_MULTILINGUAL_QUERIES[0]) => {
    setSelectedVoiceLang(sample.langCode);
    setInterimText(sample.text);
    setShowSamplesModal(false);
    handleAnalyzeText(sample.text, sample.langCode);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {/* Field Label & Multi-Language Voice Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          <span>Reported Symptoms / Field Notes</span>
        </label>

        {/* Language dialect selector & Audio CTA */}
        <div className="flex items-center space-x-2">
          {/* Dialect Selector Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <Globe className="w-3 h-3 text-emerald-600" />
              <span>{currentLangObj.nativeName} ({currentLangObj.name})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showLanguageDropdown && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select Spoken Language
                </div>
                <div className="max-h-48 overflow-y-auto py-1">
                  {SUPPORTED_VOICE_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setSelectedVoiceLang(lang.code);
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-emerald-50 transition-colors cursor-pointer ${
                        selectedVoiceLang === lang.code ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span className="font-medium">{lang.nativeName}</span>
                      <span className="text-[11px] text-slate-400">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preset Sample Audio Prompts CTA */}
          <button
            type="button"
            onClick={() => setShowSamplesModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Voice Presets</span>
          </button>
        </div>
      </div>

      {/* Main Symptoms Input Box with Integrated Microphone Record Button */}
      <div className="relative">
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Describe visible symptoms in ${currentLangObj.name} or English (e.g. High fever, nodular skin bumps, reduced lactation, mouth lesions, lameness)...`}
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 pr-28 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all resize-none shadow-inner"
        />

        {/* Action Controls in bottom right of textarea */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center space-x-1.5">
          {/* Main Microphone Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isAnalyzing}
            className={`p-2 rounded-xl transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title={isRecording ? 'Stop Voice Recording' : `Record voice symptoms in ${currentLangObj.name}`}
          >
            {isRecording ? <Square className="w-4 h-4 fill-white" /> : <Mic className="w-4 h-4" />}
            <span className="text-[11px] font-bold pr-1">
              {isRecording ? formatTimer(recordingDuration) : 'Speak'}
            </span>
          </button>
        </div>
      </div>

      {/* Live Recording Telemetry & Audio Waveform Banner */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-rose-800 font-semibold">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
                <span>Listening in {currentLangObj.nativeName} ({currentLangObj.name})...</span>
              </div>
              <span className="font-mono text-rose-700 font-bold text-xs">
                {formatTimer(recordingDuration)}
              </span>
            </div>

            {/* Audio waveform visualization bars */}
            <div className="flex items-center justify-center space-x-1 h-6 py-1">
              {[...Array(16)].map((_, i) => {
                const heightPercent = Math.max(
                  15,
                  Math.min(100, (audioLevel * Math.sin((i / 16) * Math.PI)) + Math.random() * 20)
                );
                return (
                  <div
                    key={i}
                    className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                    style={{ height: `${heightPercent}%` }}
                  />
                );
              })}
            </div>

            {interimText && (
              <p className="text-slate-700 bg-white/80 p-2 rounded-lg border border-rose-100 text-[11px] italic">
                "{interimText}"
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={stopRecording}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Done Speaking & Analyze
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Voice Analysis in Progress Banner */}
      {isAnalyzing && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-800 font-medium">
          <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
          <span>Gemini Multi-Lingual NLP is transcribing, translating, and structuring clinical symptom entities...</span>
        </div>
      )}

      {/* Audio Error Alert if any */}
      {audioError && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{audioError}</span>
          </div>
          <button
            type="button"
            onClick={() => setAudioError(null)}
            className="text-amber-600 hover:text-amber-900 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Multi-Lingual AI Symptom Analysis Results Card */}
      {lastAnalysis && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2.5 text-xs text-slate-800 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
            <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Lingual Clinical Anamnesis</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                {lastAnalysis.detectedLanguage}
              </span>
              {lastAnalysis.severity && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  lastAnalysis.severity === 'Critical' || lastAnalysis.severity === 'Severe'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {lastAnalysis.severity}
                </span>
              )}
            </div>
          </div>

          {/* Original Vernacular vs Translated English */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Original Vernacular Audio</span>
              <p className="text-slate-800 font-medium italic">"{lastAnalysis.originalTranscription}"</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Clinical English Translation</span>
              <p className="text-slate-800 font-medium">"{lastAnalysis.translatedEnglish}"</p>
            </div>
          </div>

          {/* Extracted Symptoms Tags */}
          {lastAnalysis.extractedSymptoms && lastAnalysis.extractedSymptoms.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Extracted Clinical Entities:</span>
              <div className="flex flex-wrap gap-1.5">
                {lastAnalysis.extractedSymptoms.map((sym, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 bg-white text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-medium"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{sym}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suspected Conditions from Voice */}
          {lastAnalysis.suspectedConditions && lastAnalysis.suspectedConditions.length > 0 && (
            <div className="flex items-center space-x-1 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-700">Differential Triggers:</span>
              <span className="text-emerald-700 font-medium">{lastAnalysis.suspectedConditions.join(', ')}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Multi-Lingual Spoken Voice Presets Modal */}
      {showSamplesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Languages className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Multi-Language Field Voice Presets</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSamplesModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Click any regional voice sample below to simulate multi-lingual speech capture, English translation, and Gemini clinical symptom extraction:
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {SAMPLE_MULTILINGUAL_QUERIES.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSample(sample)}
                  className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">{sample.langLabel}</span>
                    <span className="text-[10px] bg-slate-200 group-hover:bg-emerald-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      {sample.hint}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-serif italic">"{sample.text}"</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSamplesModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
