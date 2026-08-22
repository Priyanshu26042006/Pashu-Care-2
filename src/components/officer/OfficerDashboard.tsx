import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  Radio, 
  Download, 
  Database,
  ChevronRight,
  Sparkles,
  Layers,
  X,
  Check
} from 'lucide-react';
import { AnimalProfile, DiagnosticAssessment, OutbreakAlert } from '../../types';
import { MOCK_OUTBREAK_ALERTS, INITIAL_ASSESSMENTS } from '../../data/mockLivestockData';
import { RagKnowledgeWorkbench } from './RagKnowledgeWorkbench';
import { OutbreakGisMap } from '../maps/OutbreakGisMap';

interface OfficerDashboardProps {
  animals: AnimalProfile[];
  assessments: DiagnosticAssessment[];
  onViewAssessment: (assessment: DiagnosticAssessment) => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  animals,
  assessments,
  onViewAssessment,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'triage' | 'gis' | 'radar' | 'rag'>('gis');
  const [outbreaks, setOutbreaks] = useState<OutbreakAlert[]>(MOCK_OUTBREAK_ALERTS);
  const [selectedCaseForRx, setSelectedCaseForRx] = useState<DiagnosticAssessment | null>(null);

  // Digital Prescription form state
  const [rxOfficerName, setRxOfficerName] = useState('Dr. Arvind Shastri (BVSc & AH)');
  const [rxBadge, setRxBadge] = useState('VET-GJ-9042');
  const [rxDrugs, setRxDrugs] = useState('Inj. Meloxicam (15ml IM OD x 3d)\nInj. Oxytetracycline LA (20ml IM stat)\nTopical Neem-Turmeric ointment');
  const [rxQuarantineEnforced, setRxQuarantineEnforced] = useState(true);
  const [rxSubmitted, setRxSubmitted] = useState(false);

  // High priority flagged cases
  const highPriorityCases = assessments.filter(
    (a) => a.severityGrade === 'Severe' || a.severityGrade === 'Emergency Quarantine' || a.severityGrade === 'Moderate'
  );

  const handleIssueRx = (e: React.FormEvent) => {
    e.preventDefault();
    setRxSubmitted(true);
    setTimeout(() => {
      setRxSubmitted(false);
      setSelectedCaseForRx(null);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-rose-50 text-rose-700 text-xs font-semibold px-3 py-0.5 rounded-full border border-rose-200 flex items-center gap-1.5 shadow-xs">
                <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                Live District Epidemiological Surveillance
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
              Veterinary & Agriculture Officer Command Center
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              National Livestock Disease Surveillance, Triage Queue & Digital Quarantine Endorsements
            </p>
          </div>

          {/* Sub-module switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-semibold self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab('gis')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeSubTab === 'gis'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Live Google Maps GIS</span>
            </button>

            <button
              onClick={() => setActiveSubTab('triage')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeSubTab === 'triage'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Priority Triage Queue ({highPriorityCases.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('radar')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeSubTab === 'radar'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Outbreak Clusters ({outbreaks.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('rag')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeSubTab === 'rag'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>RAG Knowledge Base</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-view 0: Live Google Maps GIS Outbreak Radar */}
      {activeSubTab === 'gis' && (
        <OutbreakGisMap
          outbreaks={outbreaks}
          assessments={assessments}
          animals={animals}
          onSelectAssessment={onViewAssessment}
          onIssueQuarantine={(assessment) => setSelectedCaseForRx(assessment)}
        />
      )}

      {/* Sub-view 1: Triage Queue */}
      {activeSubTab === 'triage' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>High-Priority Triage Queue (Flagged by AI Scanner)</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Sorted by Severity Grade</span>
          </div>

          <div className="space-y-3">
            {highPriorityCases.map((assessment) => (
              <div
                key={assessment.id}
                className="bg-white border border-slate-200 hover:border-emerald-500/80 rounded-2xl p-4 transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={assessment.imageUrl}
                    alt={assessment.predictedBreed}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                  />
                  <div className="space-y-1">
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
                      <span className="font-mono text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{assessment.id}</span>
                      <span className="text-xs text-slate-500 font-medium">• {assessment.predictedBreed}</span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      {assessment.primaryDiagnosis}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        {assessment.gpsMetadata.district}, {assessment.gpsMetadata.state}
                      </span>
                      <span>Lesions: <strong className="text-slate-800">{assessment.lesions.length} detected</strong></span>
                      <span>BCS: <strong className="text-slate-800">{assessment.bodyConditionScore}/5.0</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end md:self-center">
                  <button
                    onClick={() => onViewAssessment(assessment)}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    View Diagnostic Scan
                  </button>

                  <button
                    onClick={() => setSelectedCaseForRx(assessment)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Issue Rx & Quarantine</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-view 2: Regional Outbreak Radar */}
      {activeSubTab === 'radar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-600" />
              <span>Active Outbreak Containment Clusters (Geographic Radar)</span>
            </h3>
            <span className="text-xs text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Automated PostGIS Clustering</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {outbreaks.map((outbreak) => (
              <div
                key={outbreak.id}
                className="bg-white border border-slate-200 hover:border-cyan-400 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      outbreak.riskLevel === 'Severe Epidemic'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                        : outbreak.riskLevel === 'High'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {outbreak.riskLevel}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-medium">{outbreak.lastUpdated}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{outbreak.diseaseName}</h4>
                  <p className="text-xs text-slate-500">Breed: <strong className="text-slate-800">{outbreak.affectedBreed}</strong></p>
                  
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cluster Center:</span>
                      <span className="font-bold text-slate-900">{outbreak.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Field Cases:</span>
                      <span className="font-bold text-rose-600">{outbreak.activeCasesCount} Bovines</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Quarantine Cordon:</span>
                      <span className="font-bold text-cyan-700">{outbreak.radiusKm} km Radius</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="text-[11px] text-amber-800 leading-snug">
                    <strong>Action:</strong> {outbreak.actionRequired}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-view 3: RAG Vector Knowledge Workbench */}
      {activeSubTab === 'rag' && <RagKnowledgeWorkbench />}

      {/* Digital Prescription & Quarantine Order Modal */}
      {selectedCaseForRx && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-xl p-5 sm:p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Issue Digital Prescription & Quarantine</h3>
              </div>
              <button onClick={() => setSelectedCaseForRx(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueRx} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-800">Target Patient Bovine</span>
                <p className="font-bold text-slate-900 text-sm">{selectedCaseForRx.primaryDiagnosis}</p>
                <p className="text-slate-500">Case ID: {selectedCaseForRx.id} • {selectedCaseForRx.gpsMetadata.district}, {selectedCaseForRx.gpsMetadata.state}</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase">Officer Name</label>
                  <input
                    type="text"
                    value={rxOfficerName}
                    onChange={(e) => setRxOfficerName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 mt-1 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase">Officer Badge / NDLM ID</label>
                  <input
                    type="text"
                    value={rxBadge}
                    onChange={(e) => setRxBadge(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 mt-1 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase">Prescribed Drug Regimen & Dosage</label>
                <textarea
                  rows={3}
                  value={rxDrugs}
                  onChange={(e) => setRxDrugs(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 mt-1 font-mono text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center space-x-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <input
                  type="checkbox"
                  id="quarantine-check"
                  checked={rxQuarantineEnforced}
                  onChange={(e) => setRxQuarantineEnforced(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <label htmlFor="quarantine-check" className="text-xs text-rose-800 cursor-pointer font-semibold">
                  Enforce Official 5 km Livestock Movement Quarantine Cordon
                </label>
              </div>

              {rxSubmitted && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 font-bold flex items-center gap-2 shadow-xs">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Prescription recorded in NDLM Registry & SMS sent to farmer.</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCaseForRx(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sign & Endorse Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
