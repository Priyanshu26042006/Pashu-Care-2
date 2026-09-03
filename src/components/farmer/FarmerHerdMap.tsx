import React, { useState, useEffect, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps';
import {
  AnimalProfile,
  OutbreakAlert,
  SupportedLanguage
} from '../../types';
import {
  GOOGLE_MAPS_ATTRIBUTION_ID,
  GOOGLE_MAPS_DEMO_KEY_URL,
  NEARBY_VETERINARY_CLINICS,
  VeterinaryClinicLocation,
  getStoredGoogleMapsApiKey,
  isValidGoogleMapsKey,
  setStoredGoogleMapsApiKey
} from '../../utils/googleMaps';
import {
  MapPin,
  ShieldAlert,
  Phone,
  Crosshair,
  Key,
  ExternalLink,
  Layers,
  Sparkles,
  Camera,
  Activity,
  AlertTriangle,
  Compass,
  CheckCircle2,
  X,
  Stethoscope,
  Info
} from 'lucide-react';

interface FarmerHerdMapProps {
  animals: AnimalProfile[];
  outbreaks?: OutbreakAlert[];
  onSelectAnimal: (animal: AnimalProfile) => void;
  onOpenScan: (animal?: AnimalProfile) => void;
  language: SupportedLanguage;
}

// Controller to smoothly pan & zoom Google Maps programmatically
const CameraController: React.FC<{
  target: { lat: number; lng: number } | null;
  zoom?: number;
}> = ({ target, zoom = 13 }) => {
  const map = useMap();
  useEffect(() => {
    if (map && target) {
      map.panTo(target);
      if (zoom) map.setZoom(zoom);
    }
  }, [map, target, zoom]);
  return null;
};

// Geodesic circle for veterinary outbreak buffer zones
const OutbreakCircle: React.FC<{
  center: { lat: number; lng: number };
  radiusKm: number;
  riskLevel: OutbreakAlert['riskLevel'];
}> = ({ center, radiusKm, riskLevel }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;

    const strokeColor =
      riskLevel === 'Severe Epidemic'
        ? '#dc2626'
        : riskLevel === 'High'
        ? '#ea580c'
        : '#2563eb';

    const fillColor =
      riskLevel === 'Severe Epidemic'
        ? '#ef4444'
        : riskLevel === 'High'
        ? '#f97316'
        : '#3b82f6';

    const circle = new google.maps.Circle({
      strokeColor,
      strokeOpacity: 0.85,
      strokeWeight: 2,
      fillColor,
      fillOpacity: 0.15,
      map,
      center,
      radius: radiusKm * 1000,
    });

    return () => {
      circle.setMap(null);
    };
  }, [map, center, radiusKm, riskLevel]);

  return null;
};

export const FarmerHerdMap: React.FC<FarmerHerdMapProps> = ({
  animals,
  outbreaks = [],
  onSelectAnimal,
  onOpenScan,
  language,
}) => {
  const [apiKey, setApiKey] = useState<string>(() => getStoredGoogleMapsApiKey());
  const [keyInput, setKeyInput] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [authFailed, setAuthFailed] = useState<boolean>(false);

  // Selected entities for popups
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalProfile | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<VeterinaryClinicLocation | null>(null);
  const [selectedOutbreak, setSelectedOutbreak] = useState<OutbreakAlert | null>(null);

  // Filter toggles
  const [filterSpecies, setFilterSpecies] = useState<'All' | 'Cattle' | 'Buffalo'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Critical' | 'Healthy'>('All');
  const [showClinics, setShowClinics] = useState<boolean>(true);
  const [showOutbreakCordons, setShowOutbreakCordons] = useState<boolean>(true);

  // Focus target
  const initialCenter = useMemo(() => {
    if (animals.length > 0) {
      return { lat: animals[0].gpsLocation.lat, lng: animals[0].gpsLocation.lng };
    }
    return { lat: 21.5222, lng: 70.4579 }; // Default Junagadh, Gujarat
  }, [animals]);

  const [cameraTarget, setCameraTarget] = useState<{ lat: number; lng: number } | null>(initialCenter);
  const [cameraZoom, setCameraZoom] = useState<number>(12);

  // Listen for Google Maps auth failures gracefully
  useEffect(() => {
    const prevAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps Authentication Failed in FarmerHerdMap. Falling back to High-Precision GIS Radar.');
      setAuthFailed(true);
      if (typeof prevAuthFailure === 'function') {
        prevAuthFailure();
      }
    };

    return () => {
      (window as any).gm_authFailure = prevAuthFailure;
    };
  }, []);

  const isKeyUsable = isValidGoogleMapsKey(apiKey) && !authFailed;

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = keyInput.trim();
    if (cleanKey) {
      setStoredGoogleMapsApiKey(cleanKey);
      setApiKey(cleanKey);
      setAuthFailed(false);
      setShowKeyModal(false);
    }
  };

  const handleClearKey = () => {
    setStoredGoogleMapsApiKey('');
    setApiKey('');
    setAuthFailed(false);
  };

  const filteredAnimals = useMemo(() => {
    return animals.filter((a) => {
      if (filterSpecies !== 'All' && a.species !== filterSpecies) return false;
      if (filterStatus === 'Critical' && !a.currentStatus.includes('Flagged') && !a.currentStatus.includes('Critical')) return false;
      if (filterStatus === 'Healthy' && (a.currentStatus.includes('Flagged') || a.currentStatus.includes('Critical') || a.currentStatus.includes('Moderate'))) return false;
      return true;
    });
  }, [animals, filterSpecies, filterStatus]);

  // Center on herd bounding average
  const handleCenterOnHerd = () => {
    if (filteredAnimals.length === 0) return;
    const avgLat = filteredAnimals.reduce((acc, a) => acc + a.gpsLocation.lat, 0) / filteredAnimals.length;
    const avgLng = filteredAnimals.reduce((acc, a) => acc + a.gpsLocation.lng, 0) / filteredAnimals.length;
    setCameraTarget({ lat: avgLat, lng: avgLng });
    setCameraZoom(13);
  };

  return (
    <div className="space-y-4">
      {/* Top Map Action & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Species filters */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['All', 'Cattle', 'Buffalo'] as const).map((spec) => (
              <button
                key={spec}
                onClick={() => setFilterSpecies(spec)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterSpecies === spec
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          {/* Status filters */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['All', 'Critical', 'Healthy'] as const).map((stat) => (
              <button
                key={stat}
                onClick={() => setFilterStatus(stat)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterStatus === stat
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {stat === 'Critical' ? '⚠️ Flagged Cases' : stat === 'Healthy' ? '✓ Optimal' : 'All Status'}
              </button>
            ))}
          </div>

          {/* Toggle Clinics & Outbreaks */}
          <button
            onClick={() => setShowClinics(!showClinics)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showClinics
                ? 'bg-blue-50 text-blue-800 border-blue-200 font-bold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
            <span>Vet Clinics</span>
          </button>

          <button
            onClick={() => setShowOutbreakCordons(!showOutbreakCordons)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showOutbreakCordons
                ? 'bg-rose-50 text-rose-800 border-rose-200 font-bold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Disease Cordons</span>
          </button>
        </div>

        {/* Center Button & Key Management */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={handleCenterOnHerd}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Recenter Camera on Herd Coordinates"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
            <span>Recenter Herd</span>
          </button>

          <button
            onClick={() => setShowKeyModal(true)}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isKeyUsable ? 'Maps Key Active' : 'Configure Google Maps'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Stage (Explicit CSS Height avoids CF2 Map Height Collapse) */}
      <div className="w-full h-[540px] rounded-3xl overflow-hidden border border-slate-200 shadow-md relative bg-slate-900 select-none">
        {isKeyUsable ? (
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={initialCenter}
              defaultZoom={12}
              mapId="DEMO_MAP_ID"
              gestureHandling="greedy"
              disableDefaultUI={false}
              zoomControl={true}
              mapTypeControl={true}
              streetViewControl={false}
              className="w-full h-full"
              internalUsageAttributionIds={[GOOGLE_MAPS_ATTRIBUTION_ID]}
            >
              <CameraController target={cameraTarget} zoom={cameraZoom} />

              {/* Disease Outbreak Containment Circles */}
              {showOutbreakCordons &&
                outbreaks.map((outbreak) => (
                  <OutbreakCircle
                    key={`cordon-${outbreak.id}`}
                    center={outbreak.centerCoords}
                    radiusKm={outbreak.radiusKm}
                    riskLevel={outbreak.riskLevel}
                  />
                ))}

              {/* Disease Outbreak Epicenter Markers */}
              {showOutbreakCordons &&
                outbreaks.map((outbreak) => (
                  <AdvancedMarker
                    key={`outbreak-${outbreak.id}`}
                    position={outbreak.centerCoords}
                    onClick={() => {
                      setSelectedOutbreak(outbreak);
                      setSelectedAnimal(null);
                      setSelectedClinic(null);
                    }}
                    title={`Outbreak: ${outbreak.diseaseName}`}
                  >
                    <div className="relative group cursor-pointer">
                      <span className="animate-ping absolute -inset-1 rounded-full bg-rose-500 opacity-60" />
                      <div className="relative w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center border-2 border-white shadow-lg">
                        <AlertTriangle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </AdvancedMarker>
                ))}

              {/* Government Veterinary Dispensaries & Mobile Clinics */}
              {showClinics &&
                NEARBY_VETERINARY_CLINICS.map((clinic) => (
                  <AdvancedMarker
                    key={clinic.id}
                    position={{ lat: clinic.lat, lng: clinic.lng }}
                    onClick={() => {
                      setSelectedClinic(clinic);
                      setSelectedAnimal(null);
                      setSelectedOutbreak(null);
                    }}
                    title={clinic.name}
                  >
                    <Pin
                      background="#2563eb"
                      borderColor="#ffffff"
                      glyphColor="#ffffff"
                      scale={0.95}
                    />
                  </AdvancedMarker>
                ))}

              {/* Farmer Bovine Cattle & Buffalo Pins */}
              {filteredAnimals.map((animal, idx) => {
                const isCritical =
                  animal.currentStatus.includes('Flagged') || animal.currentStatus.includes('Critical');
                const isModerate = animal.currentStatus.includes('Moderate');
                const pinColor = isCritical ? '#dc2626' : isModerate ? '#d97706' : '#059669';

                return (
                  <AdvancedMarker
                    key={`herd-marker-${animal.id}-${idx}`}
                    position={{ lat: animal.gpsLocation.lat, lng: animal.gpsLocation.lng }}
                    onClick={() => {
                      setSelectedAnimal(animal);
                      setSelectedClinic(null);
                      setSelectedOutbreak(null);
                    }}
                    title={`${animal.earTagNumber} - ${animal.name || animal.breed}`}
                  >
                    <Pin
                      background={pinColor}
                      borderColor="#ffffff"
                      glyphColor="#ffffff"
                      scale={1.15}
                    />
                  </AdvancedMarker>
                );
              })}

              {/* InfoWindow for Selected Animal */}
              {selectedAnimal && (
                <InfoWindow
                  position={{
                    lat: selectedAnimal.gpsLocation.lat,
                    lng: selectedAnimal.gpsLocation.lng,
                  }}
                  onCloseClick={() => setSelectedAnimal(null)}
                >
                  <div className="p-1 max-w-[260px] text-slate-800 space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={selectedAnimal.thumbnailUrl}
                        alt={selectedAnimal.breed}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {selectedAnimal.earTagNumber}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 truncate mt-0.5">
                          {selectedAnimal.name || selectedAnimal.breed}
                        </h4>
                        <p className="text-[10px] text-slate-500">{selectedAnimal.breed}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg text-[11px] space-y-1 border border-slate-200/80">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <span
                          className={`font-bold ${
                            selectedAnimal.currentStatus.includes('Flagged') ||
                            selectedAnimal.currentStatus.includes('Critical')
                              ? 'text-rose-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {selectedAnimal.currentStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Body Condition:</span>
                        <span className="font-bold text-slate-800">
                          BCS {selectedAnimal.bodyConditionScore} / 5.0
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">GPS Location:</span>
                        <span className="font-mono text-[10px] text-slate-700">
                          {selectedAnimal.district}, {selectedAnimal.state}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 pt-1">
                      <button
                        onClick={() => {
                          onSelectAnimal(selectedAnimal);
                          setSelectedAnimal(null);
                        }}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-2 rounded-lg text-[10px] text-center transition-colors cursor-pointer"
                      >
                        View Dossier
                      </button>
                      <button
                        onClick={() => {
                          onOpenScan(selectedAnimal);
                          setSelectedAnimal(null);
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-lg text-[10px] text-center transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Camera className="w-3 h-3" />
                        <span>AI Scan</span>
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}

              {/* InfoWindow for Selected Veterinary Clinic */}
              {selectedClinic && (
                <InfoWindow
                  position={{ lat: selectedClinic.lat, lng: selectedClinic.lng }}
                  onCloseClick={() => setSelectedClinic(null)}
                >
                  <div className="p-1 max-w-[260px] text-slate-800 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-blue-700 uppercase">
                          {selectedClinic.type}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 leading-snug">
                          {selectedClinic.name}
                        </h4>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg text-[11px] space-y-1 border border-slate-200/80">
                      <p className="text-slate-600">
                        <strong>Doctor:</strong> {selectedClinic.officerInCharge}
                      </p>
                      <p className="text-slate-600">
                        <strong>District:</strong> {selectedClinic.district}, {selectedClinic.state}
                      </p>
                      <div className="flex items-center justify-between text-blue-700 font-bold pt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {selectedClinic.contactNumber}
                        </span>
                        {selectedClinic.emergency24x7 && (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                            24x7 Emergency
                          </span>
                        )}
                      </div>
                    </div>

                    <a
                      href={`tel:${selectedClinic.contactNumber.replace(/[^0-9+]/g, '')}`}
                      className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded-lg text-[10px] transition-colors"
                    >
                      Call Veterinary Helpline
                    </a>
                  </div>
                </InfoWindow>
              )}

              {/* InfoWindow for Selected Outbreak Alert */}
              {selectedOutbreak && (
                <InfoWindow
                  position={selectedOutbreak.centerCoords}
                  onCloseClick={() => setSelectedOutbreak(null)}
                >
                  <div className="p-1 max-w-[260px] text-slate-800 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-rose-700 uppercase">
                          Outbreak Cordon ({selectedOutbreak.riskLevel})
                        </span>
                        <h4 className="font-bold text-xs text-slate-900">
                          {selectedOutbreak.diseaseName}
                        </h4>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600">
                      Quarantine buffer zone: <strong>{selectedOutbreak.radiusKm} km radius</strong> around{' '}
                      <strong>{selectedOutbreak.district}</strong>. Active cases:{' '}
                      <strong className="text-rose-600">{selectedOutbreak.activeCasesCount} bovines</strong>.
                    </p>

                    <p className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                      <strong>Advisory:</strong> {selectedOutbreak.actionRequired}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* High-Precision GIS Satellite Radar Fallback when key is not configured */
          <div className="w-full h-full p-6 flex flex-col justify-between relative overflow-hidden bg-radial from-slate-800 via-slate-900 to-slate-950 text-white">
            {/* Background Radar Rings & Hex Grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
              <div className="w-96 h-96 border border-emerald-500/40 rounded-full animate-ping duration-1000" />
              <div className="w-72 h-72 border border-cyan-500/50 rounded-full" />
              <div className="w-48 h-48 border border-emerald-500/60 rounded-full" />
              <div className="w-24 h-24 border border-slate-600 rounded-full" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
                <Compass className="w-4 h-4 text-emerald-400 animate-spin" />
                <span className="text-xs font-bold text-emerald-300">
                  NDLM Georeferenced Herd Telemetry
                </span>
              </div>

              <button
                onClick={() => setShowKeyModal(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Connect Google Maps Key</span>
              </button>
            </div>

            {/* Center Content: Herd Overview */}
            <div className="relative z-10 text-center max-w-md mx-auto my-auto space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-xl shadow-emerald-500/30">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {animals.length} Bovines Georeferenced on Bharat Pashudhan Network
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Connect your Google Maps Platform API key or free Maps Demo Key to view live high-resolution satellite imagery, nearby veterinary dispensaries, and real-time disease containment cordons.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-1">
                <a
                  href={GOOGLE_MAPS_DEMO_KEY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl border border-white/20 flex items-center gap-1.5 transition-colors"
                >
                  <span>Get Free Maps Demo Key</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                </a>

                <button
                  onClick={() => setShowKeyModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Enter Key
                </button>
              </div>
            </div>

            {/* Bottom Herd Coordinates Status */}
            <div className="relative z-10 flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-3 gap-2">
              <span>
                Focal District: <strong className="text-slate-200">Junagadh, Gujarat</strong> (21.5222°N, 70.4579°E)
              </span>
              <span>GPS Fix Precision: ±4.2m • Altitude: ~312m</span>
            </div>
          </div>
        )}
      </div>

      {/* Google Maps API Key Setup Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Google Maps Platform Configuration</h3>
                  <p className="text-[11px] text-slate-500">Live Satellite & Advanced Marker Rendering</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center space-x-1.5 font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Prototyping with Zero-Cost Google Maps Demo Key</span>
                </div>
                <p className="text-emerald-800">
                  No billing setup or Google Cloud project is required for prototyping. You can mint a free Maps Demo Key in under 60 seconds:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-emerald-900 font-medium">
                  <li>
                    Open the{' '}
                    <a
                      href={GOOGLE_MAPS_DEMO_KEY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-0.5"
                    >
                      Google Maps Demo Key Portal
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Sign in with your Google account and accept the Maps Demo terms.</li>
                  <li>Click to generate the key, then copy and paste it into the field below.</li>
                </ol>
              </div>

              <form onSubmit={handleSaveKey} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Google Maps API Key (or Demo Key)
                  </label>
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Stored securely in your local browser session for this app.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {apiKey && (
                    <button
                      type="button"
                      onClick={handleClearKey}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                    >
                      Clear Saved Key
                    </button>
                  )}
                  <div className="flex items-center space-x-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setShowKeyModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!keyInput.trim()}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      Save & Activate Map
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
