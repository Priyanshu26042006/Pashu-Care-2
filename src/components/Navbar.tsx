import React from 'react';
import { 
  Activity, 
  MapPin, 
  PhoneCall, 
  ShieldCheck, 
  Globe, 
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { SupportedLanguage } from '../types';

interface NavbarProps {
  activeTab: 'farmer' | 'officer';
  setActiveTab: (tab: 'farmer' | 'officer') => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  onOpenNewScan: () => void;
  flaggedCount: number;
}

const LANGUAGES: { code: SupportedLanguage; label: string; native: string; region: string }[] = [
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', region: 'North / Central' },
  { code: 'en', label: 'English', native: 'English', region: 'National' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', region: 'West Bengal / Tripura' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', region: 'Maharashtra' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', region: 'Andhra Pradesh / Telangana' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', region: 'Tamil Nadu' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', region: 'Gujarat' },
  { code: 'ur', label: 'Urdu', native: 'اُردُو', region: 'National / Telangana / J&K' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', region: 'Kerala' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'Punjab' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া', region: 'Assam' },
  { code: 'mai', label: 'Maithili', native: 'मैथिली', region: 'Bihar / Jharkhand' },
  { code: 'sat', label: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', region: 'Jharkhand / Odisha / WB' },
  { code: 'ks', label: 'Kashmiri', native: 'کٲشُر', region: 'Jammu & Kashmir' },
  { code: 'ne', label: 'Nepali', native: 'नेपाली', region: 'Sikkim / West Bengal' },
  { code: 'kok', label: 'Konkani', native: 'कोंकणी', region: 'Goa / Maharashtra / Karnataka' },
  { code: 'sd', label: 'Sindhi', native: 'سنڌي / सिन्धी', region: 'Gujarat / Maharashtra / Rajasthan' },
  { code: 'doi', label: 'Dogri', native: 'डोगरी', region: 'Jammu & Kashmir / HP' },
  { code: 'mni', label: 'Manipuri', native: 'ꯃꯤꯇែꯢꯂꯣꯟ', region: 'Manipur' },
  { code: 'brx', label: 'Bodo', native: 'बड़ो', region: 'Assam / Bodoland' },
  { code: 'sa', label: 'Sanskrit', native: 'संस्कृतम्', region: 'Classical / All-India' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  onOpenNewScan,
  flaggedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & National System Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('farmer')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5 font-display">
                  PashuHealth <span className="text-emerald-700 font-extrabold text-xs tracking-wide bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">AI</span>
                </span>
                <span className="hidden md:inline-flex items-center text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  NDLM Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Multi-Modal Livestock Health Intelligence & RAG Triage
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('farmer')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'farmer'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span>🌾 Farmer Herd Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('officer')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'officer'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Veterinary Officer</span>
              {flaggedCount > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {flaggedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Quick Scan CTA Button */}
            <button
              onClick={onOpenNewScan}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all transform active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white stroke-[2.5]" />
              <span className="hidden xs:inline">Scan Livestock</span>
              <span className="xs:hidden">Scan</span>
            </button>

            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold text-xs uppercase">{language}</span>
                <span className="hidden md:inline text-[11px] text-slate-500 font-normal">
                  ({LANGUAGES.find(l => l.code === language)?.native || 'हिन्दी'})
                </span>
              </button>

              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 hidden group-hover:block z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    22 Constitutional Languages + English
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                    All-India
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto py-1 divide-y divide-slate-50">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-emerald-50/70 transition-colors cursor-pointer ${
                        language === l.code ? 'text-emerald-800 font-bold bg-emerald-50 border-l-2 border-emerald-600' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-slate-900">{l.native}</span>
                        <span className="text-[11px] text-slate-500">{l.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                          {l.region}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Hotline Button */}
            <a
              href="tel:1962"
              title="National Animal Helpline (1962)"
              className="p-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs flex items-center transition-colors font-semibold"
            >
              <PhoneCall className="w-4 h-4 text-amber-600" />
              <span className="hidden xl:inline ml-1 font-bold text-xs">1962 Toll-Free</span>
            </a>

          </div>

        </div>

        {/* Mobile Navigation Strip */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-200 space-x-2 no-scrollbar">
          <button
            onClick={() => setActiveTab('farmer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'farmer'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            🌾 Farmer Portal
          </button>
          <button
            onClick={() => setActiveTab('officer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTab === 'officer'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <Stethoscope className="w-3 h-3" />
            <span>Veterinary Officer</span>
            {flaggedCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                {flaggedCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
