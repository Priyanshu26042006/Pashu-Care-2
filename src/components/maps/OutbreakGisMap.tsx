// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import {
  Radio,
  MapPin,
  AlertTriangle,
  ShieldAlert,
  Layers,
  Sparkles,
  Info,
  Key,
  ExternalLink,
  RefreshCw,
  Eye,
  CheckCircle2,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  Activity,
  Filter,
  Search,
  Check
} from 'lucide-react';
import { DiagnosticAssessment, OutbreakAlert, AnimalProfile } from '../../types';

interface OutbreakGisMapProps {
  outbreaks: OutbreakAlert[];
  assessments: DiagnosticAssessment[];
  animals?: AnimalProfile[];
  onSelectAssessment?: (assessment: DiagnosticAssessment) => void;
  onIssueQuarantine?: (assessment: DiagnosticAssessment) => void;
}

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

// Helper component for drawing geodesic outbreak quarantine circles on Google Maps
const QuarantineCordonCircle: React.FC<{
  center: { lat: number; lng: number };
  radiusKm: number;
  riskLevel: string;
}> = ({ center, radiusKm, riskLevel }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');

  useEffect(() => {
    if (!map || !mapsLib) return;

    const fillColor =
      riskLevel === 'Severe Epidemic'
        ? '#ef4444'
        : riskLevel === 'High'
        ? '#f59e0b'
        : '#3b82f6';

    const strokeColor =
      riskLevel === 'Severe Epidemic'
        ? '#dc2626'
        : riskLevel === 'High'
        ? '#d97706'
        : '#2563eb';

    const circle = new google.maps.Circle({
      strokeColor: strokeColor,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: fillColor,
      fillOpacity: 0.15,
      map: map,
      center: center,
      radius: radiusKm * 1000,
    });

    return () => {
      circle.setMap(null);
    };
  }, [map, mapsLib, center, radiusKm, riskLevel]);

  return null;
};

// Map Pan Controller for Google Maps
const MapController: React.FC<{ targetCenter: { lat: number; lng: number } | null; zoom?: number }> = ({
  targetCenter,
  zoom = 7
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !targetCenter) return;
    map.panTo(targetCenter);
    if (zoom) {
      map.setZoom(zoom);
    }
  }, [map, targetCenter, zoom]);

  return null;
};

// Geographic Coordinate projection for SVG National GIS Radar
// India Bounding Box: Latitude 7.5°N - 36.5°N, Longitude 68.0°E - 96.5°E
function projectGeoCoords(lat: number, lng: number, width: number, height: number) {
  const minLat = 7.5;
  const maxLat = 36.5;
  const minLng = 68.0;
  const maxLng = 96.5;

  const padding = 35;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  const x = padding + ((lng - minLng) / (maxLng - minLng)) * usableWidth;
  const y = padding + usableHeight - ((lat - minLat) / (maxLat - minLat)) * usableHeight;

  return { x, y };
}

export const OutbreakGisMap: React.FC<OutbreakGisMapProps> = ({
  outbreaks,
  assessments,
  animals = [],
  onSelectAssessment,
  onIssueQuarantine
}) => {
  // Environment API key
  const envApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const [apiKey, setApiKey] = useState<string>(envApiKey);
  const [customKeyInput, setCustomKeyInput] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [hasAuthError, setHasAuthError] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'vector_gis' | 'google_maps'>('vector_gis');

  // Vector GIS interactive camera state (pan & zoom)
  const [gisZoom, setGisZoom] = useState<number>(1);
  const [gisPan, setGisPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter States
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Emergency' | 'Severe' | 'Moderate'>('All');
  const [showQuarantineCordons, setShowQuarantineCordons] = useState<boolean>(true);
  const [showOutbreakEpicenters, setShowOutbreakEpicenters] = useState<boolean>(true);
  const [showTriageCases, setShowTriageCases] = useState<boolean>(true);
  const [searchDistrict, setSearchDistrict] = useState<string>('');

  // Selected Marker / Outbreak Drawer & InfoWindows
  const [selectedAssessment, setSelectedAssessment] = useState<DiagnosticAssessment | null>(null);
  const [selectedOutbreak, setSelectedOutbreak] = useState<OutbreakAlert | null>(null);

  // Target camera center for Google Maps
  const defaultCenter = { lat: 23.5937, lng: 74.9629 };
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(defaultCenter);
  const [mapZoom, setMapZoom] = useState<number>(6);

  // Catch Google Maps JavaScript API auth failures gracefully
  useEffect(() => {
    const prevAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps Authentication Failed (InvalidKeyMapError). Switching seamlessly to High-Definition Vector GIS Radar.');
      setHasAuthError(true);
      setViewMode('vector_gis');
      if (typeof prevAuthFailure === 'function') {
        prevAuthFailure();
      }
    };

    return () => {
      (window as any).gm_authFailure = prevAuthFailure;
    };
  }, []);

  const isKeyValid = isValidGoogleMapsKey(apiKey) && !hasAuthError;

  // Sync viewMode on valid key change
  useEffect(() => {
    if (isKeyValid) {
      setViewMode('google_maps');
    } else {
      setViewMode('vector_gis');
    }
  }, [apiKey, hasAuthError]);

  // Filtered Assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      if (severityFilter === 'Emergency' && a.severityGrade !== 'Emergency Quarantine') return false;
      if (severityFilter === 'Severe' && a.severityGrade !== 'Severe') return false;
      if (severityFilter === 'Moderate' && a.severityGrade !== 'Moderate') return false;
      if (searchDistrict.trim()) {
        const query = searchDistrict.toLowerCase();
        const dist = a.gpsMetadata.district.toLowerCase();
        const state = a.gpsMetadata.state.toLowerCase();
        const diag = a.primaryDiagnosis.toLowerCase();
        if (!dist.includes(query) && !state.includes(query) && !diag.includes(query)) return false;
      }
      return true;
    });
  }, [assessments, severityFilter, searchDistrict]);

  const filteredOutbreaks = useMemo(() => {
    return outbreaks.filter((o) => {
      if (searchDistrict.trim()) {
        const query = searchDistrict.toLowerCase();
        const dist = o.district.toLowerCase();
        const state = o.state.toLowerCase();
        const disease = o.diseaseName.toLowerCase();
        if (!dist.includes(query) && !state.includes(query) && !disease.includes(query)) return false;
      }
      return true;
    });
  }, [outbreaks, searchDistrict]);

  const handleJumpToDistrict = (lat: number, lng: number, zoomLevel = 9) => {
    setMapCenter({ lat, lng });
    setMapZoom(zoomLevel);

    // Also pan and zoom the Vector GIS map
    const { x, y } = projectGeoCoords(lat, lng, 800, 520);
    const targetPanX = 400 - x * 1.8;
    const targetPanY = 260 - y * 1.8;
    setGisZoom(1.8);
    setGisPan({ x: targetPanX, y: targetPanY });
  };

  const handleResetView = () => {
    setMapCenter(defaultCenter);
    setMapZoom(6);
    setGisZoom(1);
    setGisPan({ x: 0, y: 0 });
    setSelectedAssessment(null);
    setSelectedOutbreak(null);
  };

  const handleSaveCustomKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (customKeyInput.trim()) {
      setApiKey(customKeyInput.trim());
      setHasAuthError(false);
      setShowKeyModal(false);
      setViewMode('google_maps');
    }
  };

  // SVG Pan drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - gisPan.x, y: e.clientY - gisPan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setGisPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Map Action Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                Live Epidemiological GIS Radar
              </span>
              <span className="text-xs text-slate-500 font-mono font-medium hidden sm:inline">
                National Veterinary Health Grid
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Interactive National Livestock Disease Surveillance Map
            </h2>
            <p className="text-xs text-slate-500 font-medium max-w-2xl">
              Geospatial monitoring of quarantine cordons, active epidemic epicenters, and individual bovine AI triage scans across state boundaries.
            </p>
          </div>

          {/* Quick Focus Hotspots & Layer View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle Button */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('vector_gis')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
                  viewMode === 'vector_gis'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Vector GIS Radar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isKeyValid) {
                    setShowKeyModal(true);
                  } else {
                    setViewMode('google_maps');
                  }
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
                  viewMode === 'google_maps' && isKeyValid
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Google Maps {isKeyValid ? 'Active' : ''}</span>
              </button>
            </div>

            {/* Quick Hotspot Jumps */}
            <div className="flex items-center space-x-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 text-xs font-semibold">
              <span className="text-slate-500 text-[11px] px-1.5 hidden sm:inline">Hotspots:</span>
              <button
                type="button"
                onClick={() => handleJumpToDistrict(21.5222, 70.4579, 9)}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] transition-colors cursor-pointer shadow-xs"
              >
                Junagadh (LSD)
              </button>
              <button
                type="button"
                onClick={() => handleJumpToDistrict(29.0588, 76.0856, 9)}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] transition-colors cursor-pointer shadow-xs"
              >
                Hisar (FMD)
              </button>
              <button
                type="button"
                onClick={() => handleJumpToDistrict(19.8762, 75.3433, 9)}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] transition-colors cursor-pointer shadow-xs"
              >
                Sambhajinagar
              </button>
              <button
                type="button"
                onClick={handleResetView}
                className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              className="px-3 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span>{isKeyValid ? 'Google Key Configured' : 'Maps Key Settings'}</span>
            </button>
          </div>
        </div>

        {/* Map Interactive Layer & Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-600">Filters:</span>

            {/* Severity Chip Filters */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(['All', 'Emergency', 'Severe', 'Moderate'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    severityFilter === sev
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {sev === 'All' ? 'All Severities' : sev}
                </button>
              ))}
            </div>

            {/* District Search Filter */}
            <div className="relative">
              <input
                type="text"
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                placeholder="Search district/state..."
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 pl-7 text-[11px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 w-36 sm:w-44"
              />
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
              {searchDistrict && (
                <button
                  type="button"
                  onClick={() => setSearchDistrict('')}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Layer Toggles */}
            <label className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer text-[11px] font-medium text-slate-700">
              <input
                type="checkbox"
                checked={showQuarantineCordons}
                onChange={(e) => setShowQuarantineCordons(e.target.checked)}
                className="w-3.5 h-3.5 text-emerald-600 rounded"
              />
              <span>Quarantine Cordons ({filteredOutbreaks.length})</span>
            </label>

            <label className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer text-[11px] font-medium text-slate-700">
              <input
                type="checkbox"
                checked={showOutbreakEpicenters}
                onChange={(e) => setShowOutbreakEpicenters(e.target.checked)}
                className="w-3.5 h-3.5 text-emerald-600 rounded"
              />
              <span>Epidemic Epicenters</span>
            </label>

            <label className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer text-[11px] font-medium text-slate-700">
              <input
                type="checkbox"
                checked={showTriageCases}
                onChange={(e) => setShowTriageCases(e.target.checked)}
                className="w-3.5 h-3.5 text-emerald-600 rounded"
              />
              <span>Bovine Scans ({filteredAssessments.length})</span>
            </label>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              Emergency Cordon
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              High Alert
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Bovine Triage
            </span>
          </div>
        </div>
      </div>

      {/* Map Container Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-2 shadow-sm overflow-hidden relative">
        <div className="w-full h-[520px] rounded-2xl overflow-hidden relative bg-slate-900 select-none">
          {/* Conditional Rendering: Live Google Maps (if valid key) OR High-Definition Vector GIS Radar */}
          {viewMode === 'google_maps' && isKeyValid ? (
            <APIProvider apiKey={apiKey}>
              <Map
                defaultCenter={defaultCenter}
                defaultZoom={6}
                mapId="DEMO_MAP_ID"
                gestureHandling="greedy"
                disableDefaultUI={false}
                className="w-full h-full"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              >
                <MapController targetCenter={mapCenter} zoom={mapZoom} />

                {/* Draw Quarantine Cordon Circles */}
                {showQuarantineCordons &&
                  filteredOutbreaks.map((outbreak) => (
                    <QuarantineCordonCircle
                      key={`cordon-${outbreak.id}`}
                      center={outbreak.centerCoords}
                      radiusKm={outbreak.radiusKm}
                      riskLevel={outbreak.riskLevel}
                    />
                  ))}

                {/* Outbreak Epicenter Markers */}
                {showOutbreakEpicenters &&
                  filteredOutbreaks.map((outbreak) => (
                    <AdvancedMarker
                      key={`epicenter-${outbreak.id}`}
                      position={outbreak.centerCoords}
                      onClick={() => {
                        setSelectedOutbreak(outbreak);
                        setSelectedAssessment(null);
                      }}
                      title={`${outbreak.diseaseName} - ${outbreak.district}`}
                    >
                      <div className="relative group cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <span
                            className={`animate-ping absolute inline-flex h-10 w-10 rounded-full opacity-60 ${
                              outbreak.riskLevel === 'Severe Epidemic'
                                ? 'bg-rose-500'
                                : outbreak.riskLevel === 'High'
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`}
                          />
                          <div
                            className={`relative px-2.5 py-1 rounded-xl text-[11px] font-bold text-white shadow-lg border border-white flex items-center space-x-1 ${
                              outbreak.riskLevel === 'Severe Epidemic'
                                ? 'bg-rose-600'
                                : outbreak.riskLevel === 'High'
                                ? 'bg-amber-600'
                                : 'bg-blue-600'
                            }`}
                          >
                            <Radio className="w-3 h-3 animate-pulse" />
                            <span>{outbreak.diseaseName.split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>
                    </AdvancedMarker>
                  ))}

                {/* Flagged Bovine Patient Markers */}
                {showTriageCases &&
                  filteredAssessments.map((assessment) => (
                    <AdvancedMarker
                      key={`bovine-${assessment.id}`}
                      position={{
                        lat: assessment.gpsMetadata.lat,
                        lng: assessment.gpsMetadata.lng
                      }}
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        setSelectedOutbreak(null);
                      }}
                      title={`${assessment.id} - ${assessment.primaryDiagnosis}`}
                    >
                      <div className="cursor-pointer transition-transform hover:scale-110">
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
                          scale={1.05}
                        />
                      </div>
                    </AdvancedMarker>
                  ))}

                {/* InfoWindow for Selected Outbreak Epicenter */}
                {selectedOutbreak && (
                  <InfoWindow
                    position={selectedOutbreak.centerCoords}
                    onCloseClick={() => setSelectedOutbreak(null)}
                    maxWidth={320}
                  >
                    <div className="p-2 space-y-2 text-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            selectedOutbreak.riskLevel === 'Severe Epidemic'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {selectedOutbreak.riskLevel}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {selectedOutbreak.lastUpdated}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900">
                        {selectedOutbreak.diseaseName}
                      </h4>

                      <div className="text-xs space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <div className="flex justify-between">
                          <span className="text-slate-500">District:</span>
                          <span className="font-semibold text-slate-800">
                            {selectedOutbreak.district}, {selectedOutbreak.state}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Affected Breed:</span>
                          <span className="font-semibold text-slate-800">
                            {selectedOutbreak.affectedBreed}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Active Cases:</span>
                          <span className="font-bold text-rose-600">
                            {selectedOutbreak.activeCasesCount} Bovines
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Quarantine Cordon:</span>
                          <span className="font-bold text-cyan-700">
                            {selectedOutbreak.radiusKm} km Radius
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-200 leading-snug">
                        <strong>Directive:</strong> {selectedOutbreak.actionRequired}
                      </p>
                    </div>
                  </InfoWindow>
                )}

                {/* InfoWindow for Selected Bovine Triage Case */}
                {selectedAssessment && (
                  <InfoWindow
                    position={{
                      lat: selectedAssessment.gpsMetadata.lat,
                      lng: selectedAssessment.gpsMetadata.lng
                    }}
                    onCloseClick={() => setSelectedAssessment(null)}
                    maxWidth={340}
                  >
                    <div className="p-2 space-y-2.5 text-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            selectedAssessment.severityGrade === 'Emergency Quarantine'
                              ? 'bg-rose-100 text-rose-800 font-bold'
                              : selectedAssessment.severityGrade === 'Severe'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {selectedAssessment.severityGrade}
                        </span>
                        <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {selectedAssessment.id}
                        </span>
                      </div>

                      <div className="flex gap-2.5 items-center">
                        <img
                          src={selectedAssessment.imageUrl}
                          alt={selectedAssessment.predictedBreed}
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 leading-snug">
                            {selectedAssessment.primaryDiagnosis}
                          </h4>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Breed: <strong>{selectedAssessment.predictedBreed}</strong>
                          </p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 text-rose-500" />
                            {selectedAssessment.gpsMetadata.district}, {selectedAssessment.gpsMetadata.state}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <div>
                          <span className="text-slate-500">BCS Score:</span>{' '}
                          <strong>{selectedAssessment.bodyConditionScore}/5.0</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Lesions:</span>{' '}
                          <strong>{selectedAssessment.lesions.length} Detected</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        {onSelectAssessment && (
                          <button
                            type="button"
                            onClick={() => onSelectAssessment(selectedAssessment)}
                            className="flex-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Scan</span>
                          </button>
                        )}

                        {onIssueQuarantine && (
                          <button
                            type="button"
                            onClick={() => onIssueQuarantine(selectedAssessment)}
                            className="flex-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-xs cursor-pointer"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            <span>Issue Rx</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          ) : (
            /* HIGH-DEFINITION INTERACTIVE VECTOR GIS RADAR */
            <div
              className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* GIS Satellite Radar Grid Canvas */}
              <svg
                className="w-full h-full"
                viewBox="0 0 800 520"
                preserveAspectRatio="xMidYMid meet"
                style={{
                  transform: `translate(${gisPan.x}px, ${gisPan.y}px) scale(${gisZoom})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.25s ease-out'
                }}
              >
                <defs>
                  {/* Grid Pattern */}
                  <pattern id="gisGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" opacity="0.6" />
                  </pattern>

                  <radialGradient id="radarPulseGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                    <stop offset="70%" stopColor="#ef4444" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </radialGradient>

                  <radialGradient id="cordonAmberGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
                  </radialGradient>
                </defs>

                {/* Dark GIS Ocean Background */}
                <rect width="800" height="520" fill="#0b1329" />
                <rect width="800" height="520" fill="url(#gisGrid)" />

                {/* India Subcontinent Stylized Topographic Silhouette */}
                <g className="fill-slate-800/80 stroke-slate-700" strokeWidth="1.5">
                  {/* Stylized Northern Himalayan Ridge & Kashmir */}
                  <path d="M 330 40 L 370 50 L 400 70 L 380 110 L 340 100 L 320 80 Z" fill="#1e293b" stroke="#334155" />
                  
                  {/* Main Continental India Landmass */}
                  <path
                    d="M 230 150 
                       L 310 120 
                       L 440 130 
                       L 520 180 
                       L 630 190 
                       L 680 170 
                       L 710 200 
                       L 660 250 
                       L 560 250 
                       L 500 290 
                       L 460 380 
                       L 410 490 
                       L 380 490 
                       L 340 370 
                       L 270 300 
                       L 190 240 
                       L 160 210 
                       L 210 170 Z"
                    fill="#151f38"
                    stroke="#2e3e60"
                    strokeWidth="1.75"
                  />

                  {/* Gujarat Saurashtra Peninsula Accent */}
                  <path d="M 160 210 L 210 210 L 230 250 L 180 260 L 150 230 Z" fill="#182645" stroke="#384f7a" />
                </g>

                {/* Coordinate Latitude & Longitude Guidelines */}
                <g stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6">
                  <line x1="0" y1="130" x2="800" y2="130" />
                  <text x="15" y="125" fill="#64748b" fontSize="9" fontFamily="monospace">30° N (Punjab / Haryana)</text>

                  <line x1="0" y1="260" x2="800" y2="260" />
                  <text x="15" y="255" fill="#64748b" fontSize="9" fontFamily="monospace">22° N (Tropic of Cancer)</text>

                  <line x1="0" y1="390" x2="800" y2="390" />
                  <text x="15" y="385" fill="#64748b" fontSize="9" fontFamily="monospace">14° N (Deccan / Karnataka)</text>

                  <line x1="280" y1="0" x2="280" y2="520" />
                  <text x="285" y="25" fill="#64748b" fontSize="9" fontFamily="monospace">74° E</text>

                  <line x1="480" y1="0" x2="480" y2="520" />
                  <text x="485" y="25" fill="#64748b" fontSize="9" fontFamily="monospace">82° E</text>
                </g>

                {/* State Label Landmarks */}
                <g fill="#475569" fontSize="9" fontWeight="600" textAnchor="middle">
                  <text x="310" y="145">PUNJAB / HARYANA</text>
                  <text x="340" y="200">RAJASTHAN</text>
                  <text x="210" y="235">GUJARAT</text>
                  <text x="380" y="260">MADHYA PRADESH</text>
                  <text x="320" y="320">MAHARASHTRA</text>
                  <text x="540" y="230">WEST BENGAL / BIHAR</text>
                  <text x="400" y="380">TELANGANA / AP</text>
                  <text x="350" y="440">KARNATAKA</text>
                  <text x="390" y="470">TAMIL NADU</text>
                </g>

                {/* Quarantine Cordons (Geodesic Circles) */}
                {showQuarantineCordons &&
                  filteredOutbreaks.map((outbreak) => {
                    const { x, y } = projectGeoCoords(outbreak.centerCoords.lat, outbreak.centerCoords.lng, 800, 520);
                    const radiusPx = Math.max(25, outbreak.radiusKm * 1.8);
                    const isSevere = outbreak.riskLevel === 'Severe Epidemic';

                    return (
                      <g key={`gis-cordon-${outbreak.id}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r={radiusPx}
                          fill={isSevere ? 'url(#radarPulseGrad)' : 'url(#cordonAmberGrad)'}
                          stroke={isSevere ? '#ef4444' : '#f59e0b'}
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                          opacity="0.85"
                        />
                        <text
                          x={x}
                          y={y + radiusPx + 12}
                          fill={isSevere ? '#fca5a5' : '#fde68a'}
                          fontSize="9"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {outbreak.radiusKm} km Cordon
                        </text>
                      </g>
                    );
                  })}

                {/* Epidemic Outbreak Epicenters */}
                {showOutbreakEpicenters &&
                  filteredOutbreaks.map((outbreak) => {
                    const { x, y } = projectGeoCoords(outbreak.centerCoords.lat, outbreak.centerCoords.lng, 800, 520);
                    const isSevere = outbreak.riskLevel === 'Severe Epidemic';
                    const isSelected = selectedOutbreak?.id === outbreak.id;

                    return (
                      <g
                        key={`gis-epicenter-${outbreak.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOutbreak(outbreak);
                          setSelectedAssessment(null);
                        }}
                        className="cursor-pointer"
                      >
                        {/* Animated Radar Pulse Wave */}
                        <circle
                          cx={x}
                          cy={y}
                          r="16"
                          fill="none"
                          stroke={isSevere ? '#ef4444' : '#f59e0b'}
                          strokeWidth="1.5"
                          opacity="0.75"
                          className="animate-ping"
                        />

                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? "9" : "7"}
                          fill={isSevere ? '#dc2626' : '#d97706'}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />

                        {/* District Badge */}
                        <rect
                          x={x - 42}
                          y={y - 24}
                          width="84"
                          height="16"
                          rx="4"
                          fill={isSevere ? '#991b1b' : '#92400e'}
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                        <text
                          x={x}
                          y={y - 13}
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {outbreak.district} ({outbreak.diseaseName.split(' ')[0]})
                        </text>
                      </g>
                    );
                  })}

                {/* Individual Bovine Triage Patient Pins */}
                {showTriageCases &&
                  filteredAssessments.map((assessment) => {
                    const { x, y } = projectGeoCoords(assessment.gpsMetadata.lat, assessment.gpsMetadata.lng, 800, 520);
                    const isEmergency = assessment.severityGrade === 'Emergency Quarantine';
                    const isSevere = assessment.severityGrade === 'Severe';
                    const isSelected = selectedAssessment?.id === assessment.id;

                    const pinColor = isEmergency ? '#dc2626' : isSevere ? '#e11d48' : '#d97706';

                    return (
                      <g
                        key={`gis-bovine-${assessment.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAssessment(assessment);
                          setSelectedOutbreak(null);
                        }}
                        className="cursor-pointer group"
                      >
                        {/* Pin Dot & Ring */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? "8" : "5.5"}
                          fill={pinColor}
                          stroke="#ffffff"
                          strokeWidth="1.75"
                          className="transition-transform group-hover:scale-125"
                        />

                        {isSelected && (
                          <circle
                            cx={x}
                            cy={y}
                            r="14"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                          />
                        )}
                      </g>
                    );
                  })}
              </svg>

              {/* Vector GIS Zoom & Pan Navigation Controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-1.5 bg-slate-900/80 backdrop-blur-xs border border-slate-700 p-1.5 rounded-xl shadow-lg z-10">
                <button
                  type="button"
                  onClick={() => setGisZoom((prev) => Math.min(3.5, prev + 0.3))}
                  className="p-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setGisZoom((prev) => Math.max(0.8, prev - 0.3))}
                  className="p-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetView}
                  className="p-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Reset Position"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Interactive Vector GIS Info Overlay Drawer (when a marker is clicked) */}
              {selectedOutbreak && (
                <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-slate-100 p-4 rounded-2xl shadow-2xl max-w-sm z-20 space-y-2.5 animate-in fade-in slide-in-from-left-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        selectedOutbreak.riskLevel === 'Severe Epidemic'
                          ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                          : 'bg-amber-900/80 text-amber-200 border border-amber-700'
                      }`}
                    >
                      {selectedOutbreak.riskLevel}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedOutbreak(null)}
                      className="text-slate-400 hover:text-white text-xs font-bold px-1.5"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white">{selectedOutbreak.diseaseName}</h4>
                    <p className="text-xs text-slate-400">
                      Epicenter: <strong className="text-slate-200">{selectedOutbreak.district}, {selectedOutbreak.state}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Active Cases:</span>
                      <strong className="text-rose-400 font-mono text-sm">{selectedOutbreak.activeCasesCount} Bovines</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Cordon Radius:</span>
                      <strong className="text-cyan-400 font-mono text-sm">{selectedOutbreak.radiusKm} km</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-300 bg-amber-950/60 p-2 rounded-lg border border-amber-800/60 leading-snug">
                    <strong>Surveillance Directive:</strong> {selectedOutbreak.actionRequired}
                  </p>
                </div>
              )}

              {selectedAssessment && (
                <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-slate-100 p-4 rounded-2xl shadow-2xl max-w-sm z-20 space-y-2.5 animate-in fade-in slide-in-from-left-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        selectedAssessment.severityGrade === 'Emergency Quarantine'
                          ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                          : 'bg-amber-900/80 text-amber-200 border border-amber-700'
                      }`}
                    >
                      {selectedAssessment.severityGrade}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedAssessment(null)}
                      className="text-slate-400 hover:text-white text-xs font-bold px-1.5"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex gap-3 items-center">
                    <img
                      src={selectedAssessment.imageUrl}
                      alt={selectedAssessment.predictedBreed}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-white leading-snug">
                        {selectedAssessment.primaryDiagnosis}
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Breed: <strong>{selectedAssessment.predictedBreed}</strong>
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-rose-400" />
                        {selectedAssessment.gpsMetadata.district}, {selectedAssessment.gpsMetadata.state}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
                    <div>
                      <span className="text-slate-400 text-[11px] block">BCS Score:</span>
                      <strong className="text-emerald-400">{selectedAssessment.bodyConditionScore}/5.0</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Lesions:</span>
                      <strong className="text-rose-400">{selectedAssessment.lesions.length} Detected</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                    {onSelectAssessment && (
                      <button
                        type="button"
                        onClick={() => onSelectAssessment(selectedAssessment)}
                        className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Scan</span>
                      </button>
                    )}

                    {onIssueQuarantine && (
                      <button
                        type="button"
                        onClick={() => onIssueQuarantine(selectedAssessment)}
                        className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-xs cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Issue Rx</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map Legend Overlay in bottom corner */}
        <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-xs border border-slate-200 p-2.5 rounded-2xl shadow-md text-[11px] space-y-1.5 max-w-[240px] pointer-events-auto">
          <div className="flex items-center space-x-1.5 font-bold text-slate-900 border-b border-slate-100 pb-1">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>GIS Surveillance Layers</span>
          </div>
          <div className="space-y-1 text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/30 border border-rose-600 shrink-0"></span>
              <span>Quarantine Cordon (15-30 km)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600 text-white flex items-center justify-center text-[8px] font-bold shrink-0">
                •
              </span>
              <span>Flagged Bovine Triage Location</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-amber-500 text-white flex items-center justify-center text-[8px] font-bold shrink-0">
                ▲
              </span>
              <span>Epidemic Cluster Center</span>
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg p-5 sm:p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Google Maps Platform Credentials</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Zero-Cost Maps Demo Key Quickstart
                </span>
                <p className="text-emerald-800 text-[11px]">
                  For testing satellite tiles without configuring Google Cloud billing, generate a free Maps Demo Key from Google Maps Platform:
                </p>
                <a
                  href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline mt-1 text-[11px]"
                >
                  Generate Maps Demo Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <form onSubmit={handleSaveCustomKey} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Enter Google Maps API Key or Demo Key
                  </label>
                  <input
                    type="text"
                    value={customKeyInput}
                    onChange={(e) => setCustomKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Key can also be defined in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">.env.example</code> as <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">VITE_GOOGLE_MAPS_API_KEY</code>.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                  >
                    Apply Key & Connect
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
