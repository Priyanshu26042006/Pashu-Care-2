import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Activity, 
  MapPin, 
  PhoneCall, 
  ShieldCheck, 
  Globe, 
  Stethoscope,
  Sparkles,
  Camera,
  LogOut,
  User,
  ChevronDown,
  Shield,
  Layers,
  ArrowLeftRight,
  Search,
  X,
  Check
} from 'lucide-react';
import { AuthUser, SupportedLanguage, UserRole } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import { getFarmerUIText } from '../utils/farmerTranslations';

interface NavbarProps {
  activeTab: 'farmer' | 'officer';
  setActiveTab: (tab: 'farmer' | 'officer') => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  onOpenNewScan: () => void;
  flaggedCount: number;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onSwitchUserPrompt: () => void;
}

const LANGUAGES = SUPPORTED_LANGUAGES;

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  onOpenNewScan,
  flaggedCount,
  currentUser,
  onLogout,
  onSwitchUserPrompt
}) => {
  const isVeterinarian = currentUser?.role === 'veterinarian';
  const isFarmer = currentUser?.role === 'farmer';
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const langRef = useRef<HTMLDivElement>(null);
  const tFarmer = getFarmerUIText(language);

  // Close language menu on click/touch outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };
    if (isLanguageMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isLanguageMenuOpen]);

  const filteredLanguages = useMemo(() => {
    if (!langSearch.trim()) return LANGUAGES;
    const q = langSearch.toLowerCase().trim();
    return LANGUAGES.filter(
      (l) =>
        l.native.toLowerCase().includes(q) ||
        l.label.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q)
    );
  }, [langSearch]);

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
                  Gausehat <span className="text-emerald-700 font-extrabold text-xs tracking-wide bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">AI</span>
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

          {/* Center Navigation Tabs - STRICTLY ROLE-RESTRICTED */}
          {/* 1. Veterinarian: Can switch between BOTH Farmer and Officer portals */}
          {/* 2. Farmer: Can ONLY access Farmer Portal; Officer tab is completely omitted */}
          <nav className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            {isVeterinarian ? (
              <>
                <button
                  id="nav-tab-farmer-portal"
                  onClick={() => setActiveTab('farmer')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'farmer'
                      ? 'bg-white text-emerald-800 shadow-xs font-bold border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <span>🌾 {tFarmer.navFarmerPortal}</span>
                </button>

                <button
                  id="nav-tab-officer-portal"
                  onClick={() => setActiveTab('officer')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative cursor-pointer ${
                    activeTab === 'officer'
                      ? 'bg-white text-emerald-800 shadow-xs font-bold border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Veterinary Officer</span>
                  {flaggedCount > 0 && (
                    <span className="ml-1 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-2xs">
                      {flaggedCount}
                    </span>
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1 text-xs font-bold text-emerald-800 bg-white rounded-lg border border-emerald-200 shadow-xs">
                <span>🌾 {tFarmer.navFarmerPortal}</span>
                <span className="text-[10px] text-emerald-600 font-normal">({currentUser?.village || 'My Livestock'})</span>
              </div>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Quick Scan CTA Button */}
            <div className="relative group p-[2px] rounded-2xl ai-glow-border shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 transition-all">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 rounded-2xl blur-xs opacity-75 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>

              <button
                id="nav-scan-livestock-btn"
                onClick={onOpenNewScan}
                aria-label="Scan Livestock with AI Camera"
                className="relative inline-flex items-center justify-center space-x-2 sm:space-x-3 bg-emerald-700 hover:bg-emerald-650 active:bg-emerald-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-[14px] text-sm sm:text-base font-extrabold transition-all transform active:scale-95 cursor-pointer min-h-[46px] sm:min-h-[50px]"
              >
                <div className="relative flex items-center justify-center">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5] shrink-0" />
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200 absolute -top-1.5 -right-1.5 animate-pulse" />
                </div>
                <span className="tracking-tight text-white font-black text-sm sm:text-base">{tFarmer.navScanAi}</span>
                <span className="inline-flex items-center text-[10px] sm:text-xs uppercase font-black px-1.5 py-0.5 rounded-md bg-emerald-900/80 border border-emerald-400/50 text-emerald-200 tracking-wider">
                  {tFarmer.navLiveBadge}
                </span>
              </button>
            </div>

            {/* Language Selector (Touch-Friendly Button & Mobile Drawer) */}
            <div ref={langRef} className="relative">
              <button
                id="nav-language-selector-btn"
                type="button"
                aria-label="Change Language / भाषा चुनें"
                aria-expanded={isLanguageMenuOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLanguageMenuOpen((prev) => !prev);
                  setIsProfileMenuOpen(false);
                }}
                className={`flex items-center space-x-1.5 sm:space-x-2 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 ${
                  isLanguageMenuOpen
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200 hover:border-emerald-300'
                } text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer min-h-[44px] touch-manipulation`}
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/80">
                  <Globe className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wide">
                    {language}
                  </span>
                  <span className="text-[11px] sm:text-xs text-emerald-700 font-semibold truncate max-w-[70px] sm:max-w-[110px]">
                    {LANGUAGES.find((l) => l.code === language)?.native || 'हिन्दी'}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isLanguageMenuOpen ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>

              {/* Desktop Dropdown Menu (sm screens and above) */}
              {isLanguageMenuOpen && (
                <div className="hidden sm:block absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3.5 border-b border-slate-100 bg-slate-50/90">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Select Language / भाषा चुनें
                        </span>
                      </div>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                        23 Languages
                      </span>
                    </div>
                    {/* Instant Search Bar */}
                    <div className="relative mt-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search language / भाषा खोजें..."
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder-slate-400"
                      />
                      {langSearch && (
                        <button
                          type="button"
                          onClick={() => setLangSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {filteredLanguages.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No languages found matching "{langSearch}"
                      </div>
                    ) : (
                      filteredLanguages.map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => {
                            setLanguage(l.code);
                            setIsLanguageMenuOpen(false);
                            setLangSearch('');
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between hover:bg-emerald-50/80 transition-colors cursor-pointer ${
                            language === l.code
                              ? 'text-emerald-900 font-extrabold bg-emerald-50/90 border-l-4 border-emerald-600'
                              : 'text-slate-700'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                              {l.native}
                              {language === l.code && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">{l.label}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] sm:text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              {l.region}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dedicated Mobile Language Drawer (sm:hidden) - 100% Touch-Friendly */}
            {isLanguageMenuOpen && (
              <div
                className="sm:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150"
                onClick={() => setIsLanguageMenuOpen(false)}
              >
                <div
                  className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Top Drag Handle & Header */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col space-y-3">
                    <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <Globe className="w-4 h-4 text-emerald-700" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900">
                            Select Language / अपनी भाषा चुनें
                          </h3>
                          <p className="text-[11px] text-slate-500">23 Constitutional Languages of India</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsLanguageMenuOpen(false)}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 bg-slate-200/80 active:bg-slate-300 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quick Search */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search language / भाषा खोजें (Hindi, Punjabi, বাংলা...)"
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder-slate-400"
                      />
                      {langSearch && (
                        <button
                          type="button"
                          onClick={() => setLangSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Languages List (Big Touch Targets, min-h-[52px]) */}
                  <div className="overflow-y-auto divide-y divide-slate-100 p-2 max-h-[60vh] overscroll-contain">
                    {filteredLanguages.length === 0 ? (
                      <div className="p-8 text-center text-sm text-slate-500">
                        No languages found matching "{langSearch}"
                      </div>
                    ) : (
                      filteredLanguages.map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => {
                            setLanguage(l.code);
                            setIsLanguageMenuOpen(false);
                            setLangSearch('');
                          }}
                          className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center justify-between transition-colors active:bg-emerald-100 cursor-pointer min-h-[52px] ${
                            language === l.code
                              ? 'bg-emerald-50 text-emerald-950 border-2 border-emerald-500 font-bold shadow-xs'
                              : 'text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                              {l.native}
                              {language === l.code && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3 text-emerald-700" /> Active
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {l.label} • {l.region}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                            {l.code}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Authenticated User Profile Pill & Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  id="user-profile-btn"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    isVeterinarian
                      ? 'bg-cyan-50/80 border-cyan-200 text-cyan-900 hover:bg-cyan-100/70'
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shadow-xs ${
                    isVeterinarian ? 'bg-cyan-600' : 'bg-emerald-600'
                  }`}>
                    {isVeterinarian ? <Stethoscope className="w-3.5 h-3.5" /> : '🌾'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="font-bold text-[11px] leading-tight truncate max-w-[120px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[9px] opacity-75 font-medium">
                      {isVeterinarian ? 'Veterinary Officer' : 'Livestock Farmer'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 space-y-2.5 text-xs">
                    
                    {/* User bio header */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isVeterinarian ? 'bg-cyan-100 text-cyan-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isVeterinarian ? 'Veterinary Officer (Full Access)' : 'Livestock Farmer'}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-xs mt-1">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {currentUser.village ? `${currentUser.village}, ` : ''}{currentUser.district}, {currentUser.state}
                      </p>
                      {currentUser.registrationNumber && (
                        <p className="text-[10px] font-mono text-cyan-700 font-bold mt-0.5">
                          Reg: {currentUser.registrationNumber}
                        </p>
                      )}
                      {currentUser.phone && (
                        <p className="text-[10px] font-mono text-slate-500">
                          📞 {currentUser.phone}
                        </p>
                      )}
                    </div>

                    {/* Permissions summary */}
                    <div className="p-2 bg-slate-50/60 rounded-lg text-[10px] text-slate-600 space-y-1">
                      <span className="font-bold text-slate-700 block">Access Scope:</span>
                      {isVeterinarian ? (
                        <span className="text-cyan-800 font-medium block">
                          ✓ Full access: Farmer diagnostic portal + Veterinary command center, GIS map & Rx queue.
                        </span>
                      ) : (
                        <span className="text-emerald-800 font-medium block">
                          ✓ Farmer Portal: My Cattle herd, AI disease scan, voice audio analysis & remedies. (Veterinary command portal restricted).
                        </span>
                      )}
                    </div>

                    {/* Switch / Logout Actions */}
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onSwitchUserPrompt();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 font-medium flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
                          <span>Switch Role / Account</span>
                        </span>
                      </button>

                      <button
                        id="btn-logout"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-700 font-semibold flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Sign Out</span>
                        </span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* Emergency Helpline */}
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

        {/* Mobile Navigation Strip - STRICTLY ROLE-RESTRICTED */}
        {isVeterinarian && (
          <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-200 space-x-2 no-scrollbar items-center">
            <button
              onClick={() => setActiveTab('farmer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'farmer'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              🌾 Farmer Portal
            </button>
            <button
              onClick={() => setActiveTab('officer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                activeTab === 'officer'
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <Stethoscope className="w-3 h-3" />
              <span>Veterinary Officer</span>
              {flaggedCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                  {flaggedCount}
                </span>
              )}
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
