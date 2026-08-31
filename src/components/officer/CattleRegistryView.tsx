import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MapPin, 
  Syringe, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ChevronRight, 
  Calendar, 
  Phone, 
  User, 
  Heart, 
  Milk, 
  Droplet, 
  Clock, 
  Layers, 
  Sparkles, 
  Eye, 
  X, 
  Scale, 
  Baby, 
  Radio, 
  Stethoscope,
  ExternalLink,
  ShieldCheck,
  AlertOctagon,
  TrendingDown,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimalProfile, DiagnosticAssessment, SupportedLanguage, CattleFormalReport } from '../../types';

interface CattleRegistryViewProps {
  animals: AnimalProfile[];
  assessments: DiagnosticAssessment[];
  onViewAssessment: (assessment: DiagnosticAssessment) => void;
  onIssuePrescription: (assessment: DiagnosticAssessment) => void;
}

export type RiskTier = 'Critical' | 'High' | 'Moderate' | 'Low';

export interface CattleRiskProfile {
  animal: AnimalProfile;
  riskScore: number; // 0 to 100
  riskTier: RiskTier;
  riskReasons: string[];
  latestAssessment?: DiagnosticAssessment;
  allAssessments: DiagnosticAssessment[];
  hasOverdueVaccine: boolean;
  isQuarantined: boolean;
}

// Compute comprehensive risk assessment score for veterinary triage
export function computeCattleRisk(animal: AnimalProfile, assessments: DiagnosticAssessment[]): CattleRiskProfile {
  const animalAssessments = assessments
    .filter((a) => a.animalId === animal.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const latest = animalAssessments[0];
  let score = 15; // Baseline healthy score
  const reasons: string[] = [];

  // Factor 1: Clinical Diagnosis Severity from recent scan
  if (latest) {
    if (latest.severityGrade === 'Emergency Quarantine') {
      score += 65;
      reasons.push(`Emergency AI Diagnosis: ${latest.primaryDiagnosis}`);
    } else if (latest.severityGrade === 'Severe') {
      score += 50;
      reasons.push(`Severe Clinical Pathology: ${latest.primaryDiagnosis}`);
    } else if (latest.severityGrade === 'Moderate') {
      score += 35;
      reasons.push(`Moderate Disease Signs: ${latest.primaryDiagnosis}`);
    } else if (latest.severityGrade === 'Mild') {
      score += 10;
      reasons.push(`Sub-acute / Minor Symptoms`);
    }

    // Active Lesions count
    if (latest.lesions && latest.lesions.length > 0) {
      score += Math.min(latest.lesions.length * 5, 15);
      reasons.push(`${latest.lesions.length} active cutaneous/mucosal lesions detected`);
    }

    // Posture impairment
    if (latest.postureAssessment?.weightBearing && latest.postureAssessment.weightBearing.includes('Antalgic')) {
      score += 10;
      reasons.push('Antalgic posture & gait lameness');
    }
  }

  // Factor 2: Quarantine Status
  const isQuarantined = animal.quarantineStatus === 'Enforced' || animal.quarantineStatus === 'Recommended';
  if (animal.quarantineStatus === 'Enforced') {
    score += 15;
    reasons.push('Official Quarantine Enforced');
  } else if (animal.quarantineStatus === 'Recommended') {
    score += 10;
    reasons.push('Quarantine Recommended');
  }

  // Factor 3: Body Condition Score (BCS) Deviation
  if (animal.bodyConditionScore < 3.0) {
    score += 12;
    reasons.push(`Low BCS (${animal.bodyConditionScore}/5.0) - Malnourishment / Cachexia`);
  } else if (animal.bodyConditionScore > 4.5) {
    score += 5;
    reasons.push(`High BCS (${animal.bodyConditionScore}/5.0) - Obese`);
  }

  // Factor 4: Overdue Vaccination Check
  const now = new Date('2026-08-25'); // reference current mock date
  const hasOverdueVaccine = animal.vaccinations.some((v) => {
    if (!v.nextDueDate) return false;
    const due = new Date(v.nextDueDate);
    return due < now;
  });

  if (hasOverdueVaccine) {
    score += 8;
    reasons.push('Overdue National Immunization Schedule');
  }

  // Factor 5: Gestation Vulnerability
  if (animal.pregnancyStatus && animal.pregnancyStatus.includes('Late Gestation')) {
    if (score > 35) {
      score += 8;
      reasons.push('Late Gestation vulnerability under systemic stress');
    }
  }

  // Clamp score between 5 and 99
  const finalScore = Math.min(Math.max(score, 5), 99);

  let tier: RiskTier = 'Low';
  if (finalScore >= 80) tier = 'Critical';
  else if (finalScore >= 55) tier = 'High';
  else if (finalScore >= 35) tier = 'Moderate';
  else tier = 'Low';

  return {
    animal,
    riskScore: finalScore,
    riskTier: tier,
    riskReasons: reasons.length > 0 ? reasons : ['Optimal Health, Normal Vital Signs & Conformational Baselines'],
    latestAssessment: latest,
    allAssessments: animalAssessments,
    hasOverdueVaccine,
    isQuarantined
  };
}

export const CattleRegistryView: React.FC<CattleRegistryViewProps> = ({
  animals,
  assessments,
  onViewAssessment,
  onIssuePrescription
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH_MODERATE' | 'LOW' | 'QUARANTINE' | 'VACCINE_OVERDUE'>('ALL');
  const [sortBy, setSortBy] = useState<'RISK_DESC' | 'RISK_ASC' | 'BCS_ASC' | 'DATE_DESC' | 'TAG_ASC' | 'YIELD_DESC'>('RISK_DESC');
  const [selectedBreedFilter, setSelectedBreedFilter] = useState<string>('ALL');
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<string>('ALL');
  const [inspectedCattle, setInspectedCattle] = useState<CattleRiskProfile | null>(null);
  const [selectedFormalReport, setSelectedFormalReport] = useState<CattleFormalReport | null>(null);

  // Compute risk profile for all cattles
  const cattleRiskProfiles = useMemo(() => {
    return animals.map((a) => computeCattleRisk(a, assessments));
  }, [animals, assessments]);

  // Unique breeds and species
  const breeds = useMemo(() => {
    const set = new Set(animals.map((a) => a.breed));
    return Array.from(set);
  }, [animals]);

  const speciesList = useMemo(() => {
    const set = new Set(animals.map((a) => a.species));
    return Array.from(set);
  }, [animals]);

  // Filtered & Sorted cattle list
  const filteredAndSortedCattles = useMemo(() => {
    let result = cattleRiskProfiles.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        item.animal.earTagNumber.toLowerCase().includes(q) ||
        (item.animal.name && item.animal.name.toLowerCase().includes(q)) ||
        item.animal.ownerName.toLowerCase().includes(q) ||
        item.animal.ownerVillage.toLowerCase().includes(q) ||
        item.animal.district.toLowerCase().includes(q) ||
        item.animal.breed.toLowerCase().includes(q) ||
        (item.latestAssessment?.primaryDiagnosis && item.latestAssessment.primaryDiagnosis.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // Risk category filter
      if (selectedRiskFilter === 'CRITICAL' && item.riskTier !== 'Critical') return false;
      if (selectedRiskFilter === 'HIGH_MODERATE' && !(item.riskTier === 'High' || item.riskTier === 'Moderate')) return false;
      if (selectedRiskFilter === 'LOW' && item.riskTier !== 'Low') return false;
      if (selectedRiskFilter === 'QUARANTINE' && !item.isQuarantined) return false;
      if (selectedRiskFilter === 'VACCINE_OVERDUE' && !item.hasOverdueVaccine) return false;

      // Breed filter
      if (selectedBreedFilter !== 'ALL' && item.animal.breed !== selectedBreedFilter) return false;

      // Species filter
      if (selectedSpeciesFilter !== 'ALL' && item.animal.species !== selectedSpeciesFilter) return false;

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'RISK_DESC') return b.riskScore - a.riskScore;
      if (sortBy === 'RISK_ASC') return a.riskScore - b.riskScore;
      if (sortBy === 'BCS_ASC') return a.animal.bodyConditionScore - b.animal.bodyConditionScore;
      if (sortBy === 'DATE_DESC') {
        const timeA = a.latestAssessment ? new Date(a.latestAssessment.timestamp).getTime() : 0;
        const timeB = b.latestAssessment ? new Date(b.latestAssessment.timestamp).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === 'TAG_ASC') return a.animal.earTagNumber.localeCompare(b.animal.earTagNumber);
      if (sortBy === 'YIELD_DESC') return (b.animal.dailyMilkYieldLiters || 0) - (a.animal.dailyMilkYieldLiters || 0);
      return 0;
    });

    return result;
  }, [cattleRiskProfiles, searchTerm, selectedRiskFilter, sortBy, selectedBreedFilter, selectedSpeciesFilter]);

  // Aggregate statistics
  const totalCount = cattleRiskProfiles.length;
  const criticalCount = cattleRiskProfiles.filter((c) => c.riskTier === 'Critical').length;
  const highModCount = cattleRiskProfiles.filter((c) => c.riskTier === 'High' || c.riskTier === 'Moderate').length;
  const healthyCount = cattleRiskProfiles.filter((c) => c.riskTier === 'Low').length;
  const quarantineCount = cattleRiskProfiles.filter((c) => c.isQuarantined).length;
  const overdueCount = cattleRiskProfiles.filter((c) => c.hasOverdueVaccine).length;

  return (
    <div className="space-y-6">
      
      {/* Top Statistics Bar for Veterinary Officer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setSelectedRiskFilter('ALL')}
          className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
            selectedRiskFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs opacity-80 mb-1">
            <span>Total Bovines</span>
            <Layers className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold">{totalCount}</p>
          <span className="text-[10px] opacity-75">Full Herd Registry</span>
        </button>

        <button
          onClick={() => setSelectedRiskFilter('CRITICAL')}
          className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
            selectedRiskFilter === 'CRITICAL'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md'
              : 'bg-rose-50/70 text-rose-900 border-rose-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span>Critical Risk</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-xl font-bold text-rose-700">{criticalCount}</p>
          <span className="text-[10px] font-medium text-rose-600">Urgent Intervention</span>
        </button>

        <button
          onClick={() => setSelectedRiskFilter('HIGH_MODERATE')}
          className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
            selectedRiskFilter === 'HIGH_MODERATE'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md'
              : 'bg-amber-50/70 text-amber-900 border-amber-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span>Moderate Concern</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-700">{highModCount}</p>
          <span className="text-[10px] font-medium text-amber-600">Observation & Rx</span>
        </button>

        <button
          onClick={() => setSelectedRiskFilter('LOW')}
          className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
            selectedRiskFilter === 'LOW'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span>Healthy / Low Risk</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-700">{healthyCount}</p>
          <span className="text-[10px] font-medium text-emerald-600">Normal Baseline</span>
        </button>

        <button
          onClick={() => setSelectedRiskFilter('QUARANTINE')}
          className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
            selectedRiskFilter === 'QUARANTINE'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md'
              : 'bg-purple-50/70 text-purple-900 border-purple-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span>Quarantine Active</span>
            <Radio className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <p className="text-xl font-bold text-purple-700">{quarantineCount}</p>
          <span className="text-[10px] font-medium text-purple-600">Movement Barricade</span>
        </button>

        <button
          onClick={() => setSelectedRiskFilter('VACCINE_OVERDUE')}
          className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
            selectedRiskFilter === 'VACCINE_OVERDUE'
              ? 'bg-orange-600 text-white border-orange-600 shadow-md'
              : 'bg-orange-50/70 text-orange-900 border-orange-200 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span>Vaccines Overdue</span>
            <Syringe className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <p className="text-xl font-bold text-orange-700">{overdueCount}</p>
          <span className="text-[10px] font-medium text-orange-600">NDLM Booster Due</span>
        </button>
      </div>

      {/* Search & Sort Controls Toolbar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Ear Tag #, Cattle Name, Farmer, Village, Breed, or Disease..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Sort and Dropdown filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            
            {/* Risk Assessment Sort Dropdown */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-slate-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="RISK_DESC">🔴 Highest Risk First (Default Triage)</option>
                <option value="RISK_ASC">🟢 Lowest Risk First</option>
                <option value="BCS_ASC">🩺 Lowest BCS (Malnourished)</option>
                <option value="DATE_DESC">📅 Most Recent Assessment</option>
                <option value="TAG_ASC">🏷️ Ear Tag ID (A-Z)</option>
                <option value="YIELD_DESC">🥛 Daily Milk Yield (High to Low)</option>
              </select>
            </div>

            {/* Breed Filter */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedBreedFilter}
                onChange={(e) => setSelectedBreedFilter(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="ALL">All Breeds ({breeds.length})</option>
                {breeds.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Species Filter */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 gap-1.5">
              <select
                value={selectedSpeciesFilter}
                onChange={(e) => setSelectedSpeciesFilter(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="ALL">All Species</option>
                {speciesList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Active Filter Pills Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mr-1">Risk Tiers:</span>
            
            <button
              onClick={() => setSelectedRiskFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedRiskFilter === 'ALL'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({totalCount})
            </button>

            <button
              onClick={() => setSelectedRiskFilter('CRITICAL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                selectedRiskFilter === 'CRITICAL'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Critical ({criticalCount})
            </button>

            <button
              onClick={() => setSelectedRiskFilter('HIGH_MODERATE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedRiskFilter === 'HIGH_MODERATE'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              Moderate ({highModCount})
            </button>

            <button
              onClick={() => setSelectedRiskFilter('LOW')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedRiskFilter === 'LOW'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              Healthy ({healthyCount})
            </button>

            <button
              onClick={() => setSelectedRiskFilter('QUARANTINE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedRiskFilter === 'QUARANTINE'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              Quarantined ({quarantineCount})
            </button>

            <button
              onClick={() => setSelectedRiskFilter('VACCINE_OVERDUE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedRiskFilter === 'VACCINE_OVERDUE'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200'
              }`}
            >
              Overdue ({overdueCount})
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredAndSortedCattles.length}</strong> of {totalCount} bovines
          </div>
        </div>
      </div>

      {/* Cattle Risk & History Cards Directory */}
      {filteredAndSortedCattles.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Bovine Profiles Match Filter Criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try resetting your search keyword or switching the risk tier filter to "All".
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedRiskFilter('ALL');
              setSelectedBreedFilter('ALL');
              setSelectedSpeciesFilter('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedCattles.map((item) => {
            const { animal, riskScore, riskTier, riskReasons, latestAssessment, allAssessments, hasOverdueVaccine, isQuarantined } = item;

            // Risk styling badges
            const tierBadgeColor = 
              riskTier === 'Critical'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : riskTier === 'High'
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : riskTier === 'Moderate'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200';

            const scoreGaugeColor =
              riskScore >= 80 ? 'text-rose-600 bg-rose-50 border-rose-200' :
              riskScore >= 55 ? 'text-orange-600 bg-orange-50 border-orange-200' :
              riskScore >= 35 ? 'text-amber-600 bg-amber-50 border-amber-200' :
              'text-emerald-600 bg-emerald-50 border-emerald-200';

            return (
              <div
                key={animal.id}
                className={`bg-white border rounded-3xl p-5 sm:p-6 transition-all shadow-xs hover:shadow-md space-y-4 ${
                  riskTier === 'Critical'
                    ? 'border-rose-300 hover:border-rose-500'
                    : riskTier === 'High'
                    ? 'border-orange-300 hover:border-orange-500'
                    : 'border-slate-200 hover:border-emerald-400'
                }`}
              >
                {/* Header Row: Thumbnail, Identity, Risk Gauge, and Quick Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Animal Identity & Photo */}
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className="relative shrink-0">
                      <img
                        src={animal.thumbnailUrl}
                        alt={animal.breed}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shadow-xs"
                      />
                      <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[9px] font-bold shadow-xs">
                        {animal.species}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs sm:text-sm text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {animal.earTagNumber}
                        </span>
                        
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                          {animal.name || animal.breed}
                        </h3>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${tierBadgeColor}`}>
                          {riskTier === 'Critical' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                          {riskTier.toUpperCase()} RISK
                        </span>

                        {isQuarantined && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                            Quarantine Enforced
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span><strong>Breed:</strong> {animal.breed}</span>
                        <span>•</span>
                        <span><strong>Age:</strong> {animal.estimatedAgeMonths}m</span>
                        <span>•</span>
                        <span><strong>Gender:</strong> {animal.gender}</span>
                        <span>•</span>
                        <span><strong>Weight:</strong> {animal.weightKg} kg</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">BCS: {animal.bodyConditionScore}/5.0</span>
                        <span>•</span>
                        <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {animal.reports?.length || 0} Reports
                        </span>
                      </div>

                      {/* Farmer & Location details */}
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium text-slate-900">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {animal.ownerName}
                        </span>
                        <span className="text-slate-400">({animal.ownerContact})</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          {animal.ownerVillage}, {animal.district}, {animal.state}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment Score Gauge */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className={`px-3 py-2 rounded-2xl border text-center ${scoreGaugeColor}`}>
                      <span className="text-[10px] uppercase font-bold tracking-wider block">Risk Score</span>
                      <p className="text-lg font-black">{riskScore} <span className="text-xs font-medium opacity-70">/ 100</span></p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => setInspectedCattle(item)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Full Medical Dossier</span>
                      </button>

                      {latestAssessment && (
                        <button
                          onClick={() => onViewAssessment(latestAssessment)}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Latest Scan Report</span>
                        </button>
                      )}

                      {latestAssessment && (riskTier === 'Critical' || riskTier === 'High') && (
                        <button
                          onClick={() => onIssuePrescription(latestAssessment)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Issue Rx</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Risk Reasons & Primary Clinical Diagnosis Banner */}
                <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Primary Clinical Diagnosis:
                      </span>
                      <strong className="text-slate-900 font-bold text-xs sm:text-sm">
                        {latestAssessment ? latestAssessment.primaryDiagnosis : 'Healthy baseline profile (No acute lesions recorded)'}
                      </strong>
                    </div>

                    {latestAssessment && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        Last AI Scan: {new Date(latestAssessment.timestamp).toLocaleDateString()} at {new Date(latestAssessment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {/* Triage Assessment Reasons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Risk Factors:</span>
                    {riskReasons.map((reason, idx) => (
                      <span
                        key={idx}
                        className="bg-white text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1 shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sub-grid of detailed biometrics, reproduction, lactation & vaccination */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  
                  {/* Reproduction & Gestation */}
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                    <span className="text-[10px] font-bold text-purple-900 uppercase flex items-center gap-1">
                      <Baby className="w-3 h-3 text-purple-600" />
                      Pregnancy / Gestation
                    </span>
                    <p className="font-bold text-slate-900 mt-1">
                      {animal.pregnancyStatus || 'Non-Pregnant (Open)'}
                    </p>
                    {animal.expectedCalvingDate && (
                      <p className="text-[10px] text-purple-700 mt-0.5">Calving: {animal.expectedCalvingDate}</p>
                    )}
                  </div>

                  {/* Lactation & Daily Milk Yield */}
                  <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-100">
                    <span className="text-[10px] font-bold text-cyan-900 uppercase flex items-center gap-1">
                      <Milk className="w-3 h-3 text-cyan-600" />
                      Lactation & Milk Yield
                    </span>
                    <p className="font-bold text-slate-900 mt-1">
                      {animal.dailyMilkYieldLiters ? `${animal.dailyMilkYieldLiters} L/day` : 'N/A / Dry'}
                    </p>
                    <p className="text-[10px] text-cyan-700 mt-0.5">
                      {animal.lactationStatus || 'Dry / Non-lactating'}
                    </p>
                  </div>

                  {/* Vaccination Status */}
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-900 uppercase flex items-center gap-1">
                      <Syringe className="w-3 h-3 text-emerald-600" />
                      Vaccination Schedule
                    </span>
                    <p className="font-bold text-slate-900 mt-1">
                      {animal.vaccinations.length > 0 ? `${animal.vaccinations.length} Recorded` : 'No Record'}
                    </p>
                    {hasOverdueVaccine ? (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                        Booster Overdue!
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700">Schedule Active</span>
                    )}
                  </div>

                  {/* Scan History Count */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
                      <Activity className="w-3 h-3 text-slate-600" />
                      Diagnostic Sessions
                    </span>
                    <p className="font-bold text-slate-900 mt-1">
                      {allAssessments.length} AI Scans
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      GPS Accuracy ±{animal.gpsLocation.accuracyMeters || 4.5}m
                    </p>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Comprehensive Cattle Medical Dossier & Diagnostic History Inspector Modal */}
      <AnimatePresence>
        {inspectedCattle && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
            >
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {inspectedCattle.animal.name || inspectedCattle.animal.breed}
                      </h2>
                      <span className="font-mono text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {inspectedCattle.animal.earTagNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        inspectedCattle.riskTier === 'Critical'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : inspectedCattle.riskTier === 'High'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {inspectedCattle.riskTier.toUpperCase()} RISK ({inspectedCattle.riskScore}/100)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Official Veterinary Patient Dossier & Epidemiological Timeline
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setInspectedCattle(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                
                {/* Animal Bio & Owner Details */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-4 aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
                    <img
                      src={inspectedCattle.animal.thumbnailUrl}
                      alt={inspectedCattle.animal.breed}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="sm:col-span-8 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Breed / Species</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{inspectedCattle.animal.breed} ({inspectedCattle.animal.species})</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Body Condition (BCS)</span>
                        <p className="text-xs font-bold text-emerald-700 mt-0.5">{inspectedCattle.animal.bodyConditionScore} / 5.0</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Weight & Age</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{inspectedCattle.animal.weightKg} kg • {inspectedCattle.animal.estimatedAgeMonths}m</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Gender</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{inspectedCattle.animal.gender}</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Quarantine Status</span>
                        <p className={`text-xs font-bold mt-0.5 ${inspectedCattle.isQuarantined ? 'text-purple-700' : 'text-slate-700'}`}>
                          {inspectedCattle.animal.quarantineStatus || 'None'}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Risk Assessment</span>
                        <p className="text-xs font-bold text-rose-700 mt-0.5">{inspectedCattle.riskScore} / 100 Score</p>
                      </div>
                    </div>

                    {/* Farmer Contact Info */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Registered Farmer & Farmstead</span>
                        <p className="font-bold text-slate-900">{inspectedCattle.animal.ownerName} ({inspectedCattle.animal.ownerContact})</p>
                        <p className="text-[11px] text-slate-500">{inspectedCattle.animal.ownerVillage}, {inspectedCattle.animal.district}, {inspectedCattle.animal.state}</p>
                      </div>
                      <div className="font-mono text-[11px] text-slate-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
                        📍 {inspectedCattle.animal.gpsLocation.lat.toFixed(4)}°N, {inspectedCattle.animal.gpsLocation.lng.toFixed(4)}°E
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reproduction & Lactation Summary */}
                {(inspectedCattle.animal.pregnancyStatus || inspectedCattle.animal.lactationStatus || inspectedCattle.animal.dailyMilkYieldLiters) && (
                  <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center space-x-1.5">
                      <Baby className="w-4 h-4 text-purple-600" />
                      <span>Reproductive, Gestation & Lactation Profile (NDLM Dairy Track)</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-purple-100">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Gestation Stage</span>
                        <p className="font-bold text-slate-900 mt-0.5">{inspectedCattle.animal.pregnancyStatus || 'Open'}</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-purple-100">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Lactation Stage</span>
                        <p className="font-bold text-slate-900 mt-0.5">{inspectedCattle.animal.lactationStatus || 'Dry'}</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-purple-100">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Daily Milk Yield</span>
                        <p className="font-bold text-slate-900 mt-0.5">{inspectedCattle.animal.dailyMilkYieldLiters ? `${inspectedCattle.animal.dailyMilkYieldLiters} L/day` : 'N/A'}</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-purple-100">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Expected Calving</span>
                        <p className="font-bold text-emerald-700 mt-0.5">{inspectedCattle.animal.expectedCalvingDate || 'Not Applicable'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Official Cattle Health Reports Section (NDLM Synchronized) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>Official Cattle Health Reports ({inspectedCattle.animal.reports?.length || 0} Reports Synchronized)</span>
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      NDLM Field Dossier
                    </span>
                  </div>

                  {!inspectedCattle.animal.reports || inspectedCattle.animal.reports.length === 0 ? (
                    <div className="p-4 bg-white rounded-xl border border-slate-200/80 text-center text-xs text-slate-500">
                      No separate formal reports filed for this animal yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {inspectedCattle.animal.reports.map((report) => (
                        <div
                          key={report.id}
                          className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-emerald-500/80 transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                #{report.reportNumber}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                report.severityGrade === 'Emergency Quarantine'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                                  : report.severityGrade === 'Severe'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : report.severityGrade === 'Moderate'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {report.severityGrade}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                Issued by {report.authorName} ({report.authorRole}) • {new Date(report.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <h5 className="text-xs font-bold text-slate-900">{report.title}</h5>
                            <p className="text-[11px] text-slate-600 line-clamp-1">{report.primaryDiagnosis}</p>
                          </div>

                          <button
                            onClick={() => setSelectedFormalReport(report)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold border border-slate-200 hover:border-emerald-300 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Full Dossier</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chronological Diagnostic History & AI Scans Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>Diagnostic Scan History & Pathological Progression ({inspectedCattle.allAssessments.length} Records)</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">Multimodal AI Lesion Timeline</span>
                  </div>

                  {inspectedCattle.allAssessments.length === 0 ? (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                      No previous scans recorded for this animal yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inspectedCattle.allAssessments.map((assessment, index) => (
                        <div
                          key={assessment.id}
                          className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs hover:border-emerald-500/80 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <div className="flex items-center space-x-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                assessment.severityGrade === 'Emergency Quarantine'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                                  : assessment.severityGrade === 'Severe'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {assessment.severityGrade}
                              </span>
                              <span className="font-mono text-xs font-bold text-slate-700">{assessment.id}</span>
                              <span className="text-xs font-bold text-slate-900">• {assessment.primaryDiagnosis}</span>
                            </div>

                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{new Date(assessment.timestamp).toLocaleDateString()} {new Date(assessment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>

                          {/* Lesions & Clinical Observations */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-500">Detected Lesions</span>
                              <p className="font-bold text-slate-900 mt-0.5">{assessment.lesions?.length || 0} Lesions Identified</p>
                              {assessment.lesions && assessment.lesions.length > 0 && (
                                <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">
                                  {assessment.lesions.map((l) => l.label).join(', ')}
                                </p>
                              )}
                            </div>

                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-500">Posture & Gait</span>
                              <p className="font-bold text-slate-900 mt-0.5">
                                {assessment.postureAssessment?.weightBearing || 'Equal on all 4 limbs'}
                              </p>
                              <p className="text-[10px] text-slate-600 mt-1">
                                Spine: {assessment.postureAssessment?.spineCurvature || 'Normal'}
                              </p>
                            </div>

                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-500">Milk Impact / Yield</span>
                              <p className="font-bold text-slate-900 mt-0.5">
                                {assessment.milkYieldImpact ? 'Reported Impact' : 'Normal'}
                              </p>
                              <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">
                                {assessment.milkYieldImpact || 'No adverse milk reduction detected.'}
                              </p>
                            </div>
                          </div>

                          {/* Reviewed by Officer note if available */}
                          {assessment.reviewedByOfficer && (
                            <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start space-x-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Verified by {assessment.reviewedByOfficer.officerName} ({assessment.reviewedByOfficer.officerBadge})</span>
                                <p className="text-[11px] text-emerald-800 mt-0.5">{assessment.reviewedByOfficer.officialRemarks}</p>
                              </div>
                            </div>
                          )}

                          {/* Action to view full report */}
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => {
                                setInspectedCattle(null);
                                onViewAssessment(assessment);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                            >
                              <span>Open Full AI Scan Analysis</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vaccination Registry */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Syringe className="w-4 h-4 text-emerald-600" />
                    <span>National Vaccination & Immunization Record (NDLM)</span>
                  </h4>

                  <div className="space-y-2">
                    {inspectedCattle.animal.vaccinations.map((vac, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
                        <div>
                          <h5 className="font-bold text-slate-900">{vac.name}</h5>
                          <p className="text-[11px] text-slate-500">
                            Administered: {vac.date} • Batch: <span className="font-mono text-emerald-700 font-bold">{vac.batchNo}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Next Booster Due</span>
                          <p className="font-bold text-amber-700">{vac.nextDueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/90">
                <button
                  onClick={() => setInspectedCattle(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Close Dossier
                </button>

                <div className="flex items-center space-x-2">
                  {inspectedCattle.latestAssessment && (
                    <button
                      onClick={() => {
                        const targetAssessment = inspectedCattle.latestAssessment!;
                        setInspectedCattle(null);
                        onIssuePrescription(targetAssessment);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Issue Rx & Quarantine</span>
                    </button>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Selected Cattle Formal Report Modal */}
      <AnimatePresence>
        {selectedFormalReport && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedFormalReport.title}</h3>
                    <p className="text-xs text-slate-500 font-mono">
                      #{selectedFormalReport.reportNumber} • {new Date(selectedFormalReport.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFormalReport(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Animal</span>
                    <p className="font-bold text-slate-900">{selectedFormalReport.animalEarTag} - {selectedFormalReport.breed}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Severity</span>
                    <p className="font-bold text-emerald-800">{selectedFormalReport.severityGrade}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Primary Diagnosis</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedFormalReport.primaryDiagnosis}</p>
                  <p className="text-slate-600">{selectedFormalReport.summaryObservations}</p>
                </div>

                {selectedFormalReport.customNotes && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-amber-900 uppercase">Field Notes & Observations</span>
                    <p className="text-slate-800">{selectedFormalReport.customNotes}</p>
                  </div>
                )}

                {selectedFormalReport.immediateRemedies && selectedFormalReport.immediateRemedies.length > 0 && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-900 uppercase">Prescribed Immediate Remedies</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {selectedFormalReport.immediateRemedies.map((rem, i) => (
                        <li key={i}>{rem}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-slate-600">
                  <span>Issued By: <strong className="text-slate-900">{selectedFormalReport.authorName}</strong> ({selectedFormalReport.authorRole})</span>
                  <span className="font-mono text-emerald-700 font-bold">{selectedFormalReport.ndlmSyncStatus}</span>
                </div>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => setSelectedFormalReport(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print Formal Report</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
