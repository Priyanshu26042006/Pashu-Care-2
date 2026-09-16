import React, { useState } from 'react';
import { 
  Camera, 
  Sparkles, 
  Search, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Heart,
  Milk,
  LayoutGrid,
  Globe
} from 'lucide-react';
import { AnimalProfile, SupportedLanguage } from '../../types';
import { MOCK_OUTBREAK_ALERTS } from '../../data/mockLivestockData';
import { FarmerHerdMap } from './FarmerHerdMap';
import { getFarmerUIText } from '../../utils/farmerTranslations';
import { SUPPORTED_LANGUAGES } from '../../utils/languages';

interface FarmerDashboardProps {
  animals: AnimalProfile[];
  onOpenScan: (animal?: AnimalProfile) => void;
  onSelectAnimal: (animal: AnimalProfile) => void;
  onViewAssessment: (assessmentId?: string) => void;
  language: SupportedLanguage;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  animals,
  onOpenScan,
  onSelectAnimal,
  onViewAssessment,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<'All' | 'Cattle' | 'Buffalo'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const t = getFarmerUIText(language);

  // Stats calculation - simplified for farmers
  const totalCount = animals.length;
  const flaggedCount = animals.filter(a => a.currentStatus === 'Critical / Flagged' || a.currentStatus === 'Moderate Concern').length;
  const healthyCount = totalCount - flaggedCount;

  const filteredAnimals = animals.filter((animal) => {
    if (selectedSpeciesFilter !== 'All' && animal.species !== selectedSpeciesFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      animal.name?.toLowerCase().includes(q) ||
      animal.earTagNumber.toLowerCase().includes(q) ||
      animal.breed.toLowerCase().includes(q) ||
      animal.district.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: AnimalProfile['currentStatus']) => {
    switch (status) {
      case 'Critical / Flagged':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Moderate Concern':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Observation':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getTranslatedStatus = (status: AnimalProfile['currentStatus']) => {
    switch (status) {
      case 'Critical / Flagged':
        return t.statusCritical;
      case 'Moderate Concern':
        return t.statusModerate;
      case 'Observation':
        return t.statusObservation;
      default:
        return t.statusHealthy;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Farmer Portal Hero with Large Scan AI Button */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border border-emerald-800/80 rounded-3xl p-6 sm:p-7 shadow-md relative overflow-hidden text-white">
        
        {/* Subtle Decorative Backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                {t.farmerHealthPortal}
              </span>
              <button
                type="button"
                id="farmer-dashboard-change-lang-btn"
                onClick={() => {
                  const btn = document.getElementById('nav-language-selector-btn');
                  if (btn) btn.click();
                }}
                className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 backdrop-blur-xs transition-colors cursor-pointer"
                title="Change Language / भाषा बदलें"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-300" />
                <span>{SUPPORTED_LANGUAGES.find(l => l.code === language)?.native || 'हिन्दी'}</span>
                <span className="text-[10px] text-emerald-200">({SUPPORTED_LANGUAGES.find(l => l.code === language)?.label})</span>
                <span className="text-[10px] bg-emerald-500/50 px-1.5 py-0.5 rounded text-white font-bold ml-0.5">बदलें / Change</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {t.myLivestockHealth}
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Primary Action Controls: Enormous Scan AI Button */}
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="relative group p-[2px] rounded-2xl ai-glow-border shadow-xl hover:shadow-emerald-400/40 transition-all w-full sm:w-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 rounded-2xl blur-sm opacity-80 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
              <button
                id="farmer-hero-scan-ai-btn"
                onClick={() => onOpenScan()}
                className="relative w-full sm:w-auto flex items-center justify-center space-x-3.5 bg-slate-950 hover:bg-slate-900 active:bg-black text-white font-black px-6 sm:px-8 py-4 sm:py-4.5 rounded-[14px] text-base sm:text-lg transition-all transform active:scale-95 cursor-pointer min-h-[58px] sm:min-h-[64px]"
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <Camera className="w-6 h-6 stroke-[2.5] text-emerald-400" />
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300 absolute -top-1.5 -right-1.5 animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-black text-base sm:text-lg tracking-tight">{t.scanAnimalWithAi}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 border border-emerald-300 tracking-wide">
                      {t.aiCamera}
                    </span>
                  </div>
                  <p className="text-xs font-normal text-emerald-200/90 hidden sm:block">{t.tapToScan}</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setViewMode(viewMode === 'map' ? 'grid' : 'map')}
              className="flex items-center justify-center space-x-2 bg-emerald-800/60 hover:bg-emerald-700/80 active:bg-emerald-900 text-white font-bold px-4 sm:px-5 py-3.5 rounded-[14px] text-xs sm:text-sm border border-emerald-500/40 transition-all cursor-pointer min-h-[48px] w-full sm:w-auto"
            >
              <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{viewMode === 'map' ? t.showCattleCards : t.viewCattleMap}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Simplified Metric Counters Grid for Farmers (THI, Vector Watch, NDLM Sync, and Average BCS Removed) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t.totalAnimals}</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">{totalCount}</span>
              <span className="text-xs text-slate-500 font-medium">{t.registered}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <LayoutGrid className="w-6 h-6 text-slate-600" />
          </div>
        </div>

        <div className="bg-white border border-emerald-200/80 p-4 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between bg-emerald-50/30">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">{t.healthyAnimals}</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-600">{healthyCount}</span>
              <span className="text-xs text-emerald-700 font-medium">{t.inGoodHealth}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white border border-amber-200/80 p-4 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between bg-amber-50/30">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">{t.needsCheckup}</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-amber-600">{flaggedCount}</span>
              <span className="text-xs text-amber-700 font-medium">{flaggedCount === 0 ? t.allClear : t.attentionAdvised}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
        </div>

      </div>

      {/* Livestock Roster Section - Simplified for Farmers */}
      <div className="space-y-4">
        
        {/* Controls Bar: Clean Search & Species Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-2">
            {/* Species Filter Tabs */}
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              {(['All', 'Cattle', 'Buffalo'] as const).map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpeciesFilter(spec)}
                  className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                    selectedSpeciesFilter === spec
                      ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {spec === 'All' ? t.allSpecies : spec === 'Cattle' ? t.cattle : t.buffalo}
                </button>
              ))}
            </div>

            {/* View Mode Switcher: Cards vs Map */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.cards}</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{t.map}</span>
              </button>
            </div>
          </div>

        </div>

        {/* View Content: Map OR Simplified Animal Cards */}
        {viewMode === 'map' ? (
          <FarmerHerdMap
            animals={filteredAnimals}
            outbreaks={MOCK_OUTBREAK_ALERTS}
            onSelectAnimal={onSelectAnimal}
            onOpenScan={onOpenScan}
            language={language}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAnimals.map((animal, idx) => (
            <div
              key={`farmer-animal-${animal.id}-${idx}`}
              className="bg-white border border-slate-200 hover:border-emerald-500/60 rounded-2xl p-4 sm:p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group"
            >
              <div className="flex space-x-4">
                
                {/* Animal Thumbnail - Cleaned without technical BCS overlay */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={animal.thumbnailUrl}
                    alt={animal.breed}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Simplified Details for Farmer */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {animal.earTagNumber}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(animal.currentStatus)}`}>
                      {getTranslatedStatus(animal.currentStatus)}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {animal.name || t.unnamedBovine} <span className="text-xs text-slate-500 font-medium">({animal.breed})</span>
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    <span>{t.age}: <strong className="text-slate-800">{animal.estimatedAgeMonths} {t.months}</strong></span>
                    <span>•</span>
                    <span>{t.weight}: <strong className="text-slate-800">{animal.weightKg} {t.kg}</strong></span>
                    {animal.dailyMilkYieldLiters && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Milk className="w-3 h-3 text-emerald-600" />
                          {animal.dailyMilkYieldLiters} {t.literPerDay}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Status Badges - Simplified */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {animal.reports && animal.reports.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        📄 {animal.reports.length} {t.reports}
                      </span>
                    )}
                    {animal.pregnancyStatus && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <Heart className="w-2.5 h-2.5 text-purple-600" />
                        <span className="truncate max-w-[120px]">{animal.pregnancyStatus}</span>
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Action Buttons Footer: Large, easily clickable Scan AI Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-medium truncate">
                  {t.lastScanned}: {new Date(animal.lastAssessmentDate).toLocaleDateString(language === 'en' ? 'en-US' : `${language}-IN`)}
                </span>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onSelectAnimal(animal)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer min-h-[40px]"
                  >
                    {t.viewDetails}
                  </button>

                  <button
                    onClick={() => onOpenScan(animal)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-sm transition-all transform active:scale-95 cursor-pointer min-h-[40px]"
                  >
                    <Camera className="w-4 h-4 stroke-[2.5]" />
                    <span>{t.scanAi}</span>
                  </button>
                </div>
              </div>

            </div>
          ))}

          {filteredAnimals.length === 0 && (
            <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
              <p className="text-slate-600 text-sm font-medium">{t.noAnimalsFound}</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedSpeciesFilter('All'); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                {t.clearSearch}
              </button>
            </div>
          )}
          </div>
        )}

      </div>

    </div>
  );
};
