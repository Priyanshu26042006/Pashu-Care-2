import React, { useState } from 'react';
import { 
  Plus, 
  Camera, 
  Sparkles, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ChevronRight, 
  ThermometerSun, 
  Info,
  Layers,
  Heart,
  Droplets,
  Baby,
  Milk,
  Droplet,
  LayoutGrid,
  Map as MapIcon
} from 'lucide-react';
import { AnimalProfile, DiagnosticAssessment, SupportedLanguage } from '../../types';
import { MOCK_OUTBREAK_ALERTS } from '../../data/mockLivestockData';
import { FarmerHerdMap } from './FarmerHerdMap';

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

  // Stats calculation
  const totalCount = animals.length;
  const flaggedCount = animals.filter(a => a.currentStatus === 'Critical / Flagged' || a.currentStatus === 'Moderate Concern').length;
  const avgBcs = (animals.reduce((acc, a) => acc + a.bodyConditionScore, 0) / (totalCount || 1)).toFixed(1);

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

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Heat Stress & Farmer Advisory */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border border-emerald-800/80 rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden text-white">
        
        {/* Subtle Decorative Backdrop Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Bharat Pashudhan Integrated Herd Management
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Livestock Health & Diagnostic Station
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Instant multi-modal AI screening for Indian indigenous breeds, skin lesion biometrics, and veterinary RAG protocols.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'map' ? 'grid' : 'map')}
              className="relative flex items-center space-x-2 bg-emerald-800/60 hover:bg-emerald-700/80 active:bg-emerald-900 text-white font-bold px-4 py-3 rounded-[14px] text-xs sm:text-sm border border-emerald-500/40 transition-all cursor-pointer min-h-[44px]"
            >
              <MapPin className="w-4 h-4 text-emerald-300" />
              <span>{viewMode === 'map' ? 'Switch to Herd Cards' : 'Open Herd Google Map'}</span>
            </button>

            <div className="relative group p-[2px] rounded-2xl ai-glow-border shadow-lg hover:shadow-emerald-400/30 transition-all">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 rounded-2xl blur-xs opacity-70 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
              <button
                onClick={() => onOpenScan()}
                className="relative flex items-center space-x-2.5 bg-slate-900 hover:bg-slate-850 active:bg-black text-emerald-300 font-bold px-5 sm:px-6 py-3 rounded-[14px] text-xs sm:text-sm transition-all transform active:scale-95 cursor-pointer min-h-[44px]"
              >
                <div className="relative flex items-center justify-center">
                  <Camera className="w-4 h-4 stroke-[2.5] text-emerald-400" />
                  <Sparkles className="w-3 h-3 text-cyan-300 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="text-white font-bold">Start Guided Camera Scan</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  AI
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* THI Weather & Microclimate Advisory Bar */}
        <div className="mt-5 pt-4 border-t border-emerald-700/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-emerald-100">
          <div className="flex items-center space-x-2.5 bg-black/20 p-2.5 rounded-xl border border-white/10 backdrop-blur-xs">
            <ThermometerSun className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="font-bold text-white">THI Index: 72 (Mild Stress)</span>
              <p className="text-[11px] text-emerald-200/80">Ensure shade & mineral electrolytes</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 bg-black/20 p-2.5 rounded-xl border border-white/10 backdrop-blur-xs">
            <Droplets className="w-4 h-4 text-cyan-300 shrink-0" />
            <div>
              <span className="font-bold text-white">Monsoon Vector Watch</span>
              <p className="text-[11px] text-emerald-200/80">Spray fly repellent for LSD prevention</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 bg-black/20 p-2.5 rounded-xl border border-white/10 backdrop-blur-xs">
            <Calendar className="w-4 h-4 text-emerald-300 shrink-0" />
            <div>
              <span className="font-bold text-white">FMD Booster Camp</span>
              <p className="text-[11px] text-emerald-200/80">Next round in Junagadh: 28th Aug</p>
            </div>
          </div>
        </div>

      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Registered Herd</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalCount}</span>
            <span className="text-xs text-emerald-700 font-semibold">Bovine Tagged</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Active Health Concerns</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{flaggedCount}</span>
            <span className="text-xs text-amber-700 font-medium">Need Monitoring</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Average Herd BCS</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{avgBcs}</span>
            <span className="text-xs text-slate-500 font-medium">/ 5.0 Ideal</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500">NDLM Sync Status</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-600">Live</span>
            <span className="text-xs text-teal-700 font-medium">100% Synced</span>
          </div>
        </div>

      </div>

      {/* Livestock Roster Section */}
      <div className="space-y-4">
        
        {/* Controls Bar: Search & Filter & View Mode Toggle */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ear tag, name, breed, district..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-2">
            {/* Species Filter Tabs */}
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              {(['All', 'Cattle', 'Buffalo'] as const).map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpeciesFilter(spec)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedSpeciesFilter === spec
                      ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>

            {/* View Mode Switcher: Grid vs Live Google Map */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
                <span>Roster Grid</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Google Maps</span>
              </button>
            </div>
          </div>

        </div>

        {/* View Content: Google Map OR Grid */}
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
              className="bg-white border border-slate-200 hover:border-emerald-500/60 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group"
            >
              <div className="flex space-x-4">
                
                {/* Animal Thumbnail */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={animal.thumbnailUrl}
                    alt={animal.breed}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-800 font-bold border border-slate-200 shadow-xs">
                    BCS {animal.bodyConditionScore}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {animal.earTagNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(animal.currentStatus)}`}>
                      {animal.currentStatus}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {animal.name || 'Unnamed Bovine'} <span className="text-xs text-slate-500 font-normal">({animal.breed})</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500">
                    <div>Age: <strong className="text-slate-800">{animal.estimatedAgeMonths} mo</strong></div>
                    <div>Weight: <strong className="text-slate-800">{animal.weightKg} kg</strong></div>
                    <div>Owner: <strong className="text-slate-800">{animal.ownerName}</strong></div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span className="truncate">{animal.district}</span>
                    </div>
                  </div>

                  {/* Cattle Pregnancy & Lactation Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {animal.reports && animal.reports.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        📄 {animal.reports.length} {animal.reports.length === 1 ? 'Report' : 'Reports'}
                      </span>
                    )}
                    {animal.pregnancyStatus && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <Heart className="w-2.5 h-2.5 text-purple-600" />
                        <span className="truncate max-w-[120px]">{animal.pregnancyStatus}</span>
                      </span>
                    )}
                    {animal.lactationStatus && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center gap-1">
                        <Milk className="w-2.5 h-2.5 text-cyan-600" />
                        <span className="truncate max-w-[110px]">{animal.dailyMilkYieldLiters ? `${animal.dailyMilkYieldLiters}L/d` : animal.lactationStatus}</span>
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  Last Scanned: {new Date(animal.lastAssessmentDate).toLocaleDateString()}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectAnimal(animal)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View History
                  </button>

                  <button
                    onClick={() => onOpenScan(animal)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan Now</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
          </div>
        )}

      </div>

    </div>
  );
};
