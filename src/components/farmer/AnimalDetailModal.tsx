import React, { useState, useEffect } from 'react';
import { 
  X, 
  Camera, 
  MapPin, 
  Calendar, 
  Syringe, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Phone, 
  User,
  Heart,
  Scale,
  Baby,
  Milk,
  Droplet,
  Clock,
  Compass,
  Navigation,
  ExternalLink,
  FileText,
  Eye,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimalProfile, SupportedLanguage, CattleFormalReport } from '../../types';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

function isValidGoogleMapsKey(key: string | undefined): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (
    trimmed === '' ||
    trimmed === 'YOUR_GOOGLE_MAPS_API_KEY' ||
    trimmed === 'MY_GOOGLE_MAPS_API_KEY' ||
    trimmed.includes('YOUR_') ||
    trimmed.length < 15
  ) {
    return false;
  }
  return true;
}

interface AnimalDetailModalProps {
  animal: AnimalProfile | null;
  onClose: () => void;
  onScanThisAnimal: (animal: AnimalProfile) => void;
  onViewDiagnosticReport: (assessmentId?: string) => void;
  language: SupportedLanguage;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  animal,
  onClose,
  onScanThisAnimal,
  onViewDiagnosticReport,
  language,
}) => {
  const [selectedReport, setSelectedReport] = useState<CattleFormalReport | null>(null);

  if (!animal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{animal.name || 'Livestock Profile'}</span>
                <span className="font-mono text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {animal.earTagNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {animal.species} • {animal.breed} • Owner: {animal.ownerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Top Hero: Photo + Core Biometrics */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4 aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
              <img
                src={animal.thumbnailUrl}
                alt={animal.breed}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="sm:col-span-8 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Breed Specimen</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{animal.breed}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Body Condition (BCS)</span>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">{animal.bodyConditionScore} / 5.0</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Estimated Weight</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{animal.weightKg} kg</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Age</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{animal.estimatedAgeMonths} Months</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Gender</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{animal.gender}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Status</span>
                  <p className="text-xs font-bold text-amber-700 mt-0.5">{animal.currentStatus}</p>
                </div>
              </div>

              {/* Owner & Farm Details */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Registered Farmer & Farmstead</span>
                  <p className="font-bold text-slate-900">{animal.ownerName} ({animal.ownerContact})</p>
                  <p className="text-[11px] text-slate-500">{animal.ownerVillage}, {animal.district}, {animal.state}</p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200">
                  {animal.gpsLocation.lat.toFixed(4)}° N, {animal.gpsLocation.lng.toFixed(4)}° E
                </div>
              </div>
            </div>
          </div>

          {/* Reproductive & Lactation Metric Registry */}
          {(animal.pregnancyStatus || animal.lactationStatus || animal.dailyMilkYieldLiters) && (
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center space-x-1.5">
                  <Baby className="w-4 h-4 text-purple-600" />
                  <span>Reproductive, Gestation & Lactation Profile (NDLM Dairy Track)</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Breeding Module
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                    <Heart className="w-3 h-3 text-purple-600" />
                    Pregnancy Status
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-1">{animal.pregnancyStatus || 'Not Recorded'}</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                    <Milk className="w-3 h-3 text-cyan-600" />
                    Lactation Status
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-1">{animal.lactationStatus || 'Not Recorded'}</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                    <Droplet className="w-3 h-3 text-sky-500" />
                    Daily Milk Yield
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    {animal.dailyMilkYieldLiters ? `${animal.dailyMilkYieldLiters} L/day` : 'N/A'}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    Lactation Days
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    {animal.lactationStageDays ? `Day ${animal.lactationStageDays}` : 'Dry / Non-Lactating'}
                  </p>
                </div>
              </div>

              {(animal.inseminationDate || animal.expectedCalvingDate) && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-purple-100 text-xs font-medium text-purple-950">
                  {animal.inseminationDate && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 text-[11px]">Last Insemination / Mating:</span>
                      <strong className="text-purple-900">{animal.inseminationDate}</strong>
                    </div>
                  )}
                  {animal.expectedCalvingDate && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 text-[11px]">Expected Calving Date:</span>
                      <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {animal.expectedCalvingDate}
                      </strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Google Maps Livestock GPS Pinning & Geo-Fence */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Google Maps GPS Tag & Pasture Coordinates</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                Accuracy ±{animal.gpsLocation.accuracyMeters || 4.2}m
              </span>
            </div>

            <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 relative shadow-xs bg-slate-900">
              {isValidGoogleMapsKey(import.meta.env.VITE_GOOGLE_MAPS_API_KEY) ? (
                <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                  <Map
                    defaultCenter={{ lat: animal.gpsLocation.lat, lng: animal.gpsLocation.lng }}
                    defaultZoom={13}
                    mapId="DEMO_MAP_ID"
                    disableDefaultUI={true}
                    zoomControl={true}
                    className="w-full h-full"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  >
                    <AdvancedMarker
                      position={{ lat: animal.gpsLocation.lat, lng: animal.gpsLocation.lng }}
                      title={`${animal.earTagNumber} - ${animal.name || animal.breed}`}
                    >
                      <Pin
                        background={animal.currentStatus.includes('Flagged') || animal.currentStatus.includes('Critical') ? '#dc2626' : '#059669'}
                        borderColor="#ffffff"
                        glyphColor="#ffffff"
                        scale={1.1}
                      />
                    </AdvancedMarker>
                  </Map>
                </APIProvider>
              ) : (
                <div className="w-full h-full p-4 flex flex-col justify-between relative overflow-hidden bg-radial from-slate-800 to-slate-950 text-white">
                  {/* Background GIS Gridlines & Radar Circles */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border border-emerald-500 rounded-full animate-ping duration-1000" />
                    <div className="w-48 h-48 border border-cyan-500/50 rounded-full" />
                    <div className="w-32 h-32 border border-slate-600 rounded-full" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:16px_16px]" />
                  </div>

                  {/* Top GPS Status bar */}
                  <div className="relative z-10 flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                      <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      <span className="text-emerald-300 font-bold">GPS Geotag Fixed</span>
                    </div>
                    <span className="text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      Geo-Fence: Valid
                    </span>
                  </div>

                  {/* Center Marker Info */}
                  <div className="relative z-10 text-center my-auto">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/30 mb-1.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-100">
                      {animal.district}, {animal.state}
                    </p>
                    <p className="text-[11px] font-mono text-emerald-400">
                      {animal.gpsLocation.lat.toFixed(4)}°N, {animal.gpsLocation.lng.toFixed(4)}°E
                    </p>
                  </div>

                  {/* Bottom Coordinates & Link */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-1.5">
                    <span>Pasture Boundary: Zone A-4</span>
                    <a
                      href={`https://www.google.com/maps?q=${animal.gpsLocation.lat},${animal.gpsLocation.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
                    >
                      <span>Open in Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Official Cattle Health Reports Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Official Cattle Health Reports ({animal.reports?.length || 0} Reports Attached)</span>
              </h4>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                NDLM Verified
              </span>
            </div>

            {!animal.reports || animal.reports.length === 0 ? (
              <div className="p-4 bg-white rounded-xl border border-slate-200/80 text-center text-xs text-slate-500">
                No formal reports created for this animal yet. After scanning, click "Create Separate Cattle Report" to attach an official dossier.
              </div>
            ) : (
              <div className="space-y-2.5">
                {animal.reports.map((report) => (
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
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-slate-900">{report.title}</h5>
                      <p className="text-[11px] text-slate-600 line-clamp-1">{report.primaryDiagnosis}</p>
                    </div>

                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold border border-slate-200 hover:border-emerald-300 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Dossier</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vaccination Schedule Registry */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Syringe className="w-4 h-4 text-emerald-600" />
              <span>National Vaccination & Immunization Record (NDLM)</span>
            </h4>

            <div className="space-y-2">
              {animal.vaccinations.map((vac, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs shadow-xs">
                  <div>
                    <h5 className="font-bold text-slate-900">{vac.name}</h5>
                    <p className="text-[11px] text-slate-500">
                      Administered: {vac.date} • Batch: <span className="font-mono text-emerald-700 font-bold">{vac.batchNo}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Next Booster</span>
                    <p className="font-bold text-amber-700">{vac.nextDueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/90">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onViewDiagnosticReport();
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs cursor-pointer"
            >
              Latest Clinical Report
            </button>

            <button
              onClick={() => {
                onClose();
                onScanThisAnimal(animal);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Perform New Scan</span>
            </button>
          </div>
        </div>

        {/* Selected Cattle Formal Report Modal */}
        <AnimatePresence>
          {selectedReport && (
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
                      <h3 className="text-base font-bold text-slate-900">{selectedReport.title}</h3>
                      <p className="text-xs text-slate-500 font-mono">
                        #{selectedReport.reportNumber} • {new Date(selectedReport.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Animal</span>
                      <p className="font-bold text-slate-900">{selectedReport.animalEarTag} - {selectedReport.breed}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Severity</span>
                      <p className="font-bold text-emerald-800">{selectedReport.severityGrade}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Primary Diagnosis</span>
                    <p className="font-bold text-slate-900 text-sm">{selectedReport.primaryDiagnosis}</p>
                    <p className="text-slate-600">{selectedReport.summaryObservations}</p>
                  </div>

                  {selectedReport.customNotes && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-amber-900 uppercase">Field Notes & Observations</span>
                      <p className="text-slate-800">{selectedReport.customNotes}</p>
                    </div>
                  )}

                  {selectedReport.immediateRemedies && selectedReport.immediateRemedies.length > 0 && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                      <span className="text-[10px] font-bold text-emerald-900 uppercase">Prescribed Immediate Remedies</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-700">
                        {selectedReport.immediateRemedies.map((rem, i) => (
                          <li key={i}>{rem}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-slate-600">
                    <span>Issued By: <strong className="text-slate-900">{selectedReport.authorName}</strong> ({selectedReport.authorRole})</span>
                    <span className="font-mono text-emerald-700 font-bold">{selectedReport.ndlmSyncStatus}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                  <button
                    onClick={() => setSelectedReport(null)}
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

      </motion.div>
    </div>
  );
};
