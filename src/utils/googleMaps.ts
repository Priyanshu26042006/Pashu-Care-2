/**
 * Google Maps Platform key validation, storage, and configuration helper.
 * Strictly complies with Google Maps Platform guidelines and attribution rules.
 */

export const GOOGLE_MAPS_DEMO_KEY_URL =
  'https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio';

export const GOOGLE_MAPS_ATTRIBUTION_ID = 'gmp_mcp_codeassist_v1_aistudio';

export const STORAGE_KEY_MAPS_API_KEY = 'gausehat_google_maps_api_key';

export interface VeterinaryClinicLocation {
  id: string;
  name: string;
  type: 'Poly-Clinic' | 'Dispensary' | 'Mobile Clinic' | 'Research Center';
  district: string;
  state: string;
  lat: number;
  lng: number;
  contactNumber: string;
  emergency24x7: boolean;
  officerInCharge: string;
}

export const NEARBY_VETERINARY_CLINICS: VeterinaryClinicLocation[] = [
  {
    id: 'vet-jnd-01',
    name: 'Junagadh District Veterinary Poly-Clinic & Referral Hospital',
    type: 'Poly-Clinic',
    district: 'Junagadh',
    state: 'Gujarat',
    lat: 21.5222,
    lng: 70.4579,
    contactNumber: '+91 285 2670123',
    emergency24x7: true,
    officerInCharge: 'Dr. Arvind Shastri (BVSc & AH)'
  },
  {
    id: 'vet-amr-02',
    name: 'Amreli Taluka Veterinary Dispensary & AI Center',
    type: 'Dispensary',
    district: 'Amreli',
    state: 'Gujarat',
    lat: 21.6032,
    lng: 71.2221,
    contactNumber: '+91 2792 223450',
    emergency24x7: false,
    officerInCharge: 'Dr. Meena Patel'
  },
  {
    id: 'vet-hsr-03',
    name: 'Hisar LUVAS Central Veterinary Clinical Complex',
    type: 'Research Center',
    district: 'Hisar',
    state: 'Haryana',
    lat: 29.1492,
    lng: 75.7217,
    contactNumber: '+91 1662 256001',
    emergency24x7: true,
    officerInCharge: 'Dr. Rajesh Deshmukh'
  },
  {
    id: 'vet-and-04',
    name: 'Anand NDDB Mobile Veterinary Emergency Squad',
    type: 'Mobile Clinic',
    district: 'Anand',
    state: 'Gujarat',
    lat: 22.5645,
    lng: 72.9289,
    contactNumber: '1962 (Toll Free)',
    emergency24x7: true,
    officerInCharge: 'Dr. Ketan Solanki'
  },
  {
    id: 'vet-chb-05',
    name: 'Sambhajinagar Rural Veterinary Hospital',
    type: 'Dispensary',
    district: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    lat: 19.8762,
    lng: 75.3433,
    contactNumber: '+91 240 2331189',
    emergency24x7: false,
    officerInCharge: 'Dr. Sunita Kulkarni'
  }
];

export function isValidGoogleMapsKey(key: string | undefined | null): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (
    trimmed === '' ||
    trimmed === 'YOUR_GOOGLE_MAPS_API_KEY' ||
    trimmed === 'MY_GOOGLE_MAPS_API_KEY' ||
    trimmed.startsWith('YOUR_') ||
    trimmed.startsWith('MY_') ||
    trimmed.length < 15
  ) {
    return false;
  }
  return true;
}

export function getStoredGoogleMapsApiKey(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MAPS_API_KEY);
    if (saved && saved.trim().length >= 15) {
      return saved.trim();
    }
  } catch (e) {
    // Ignore localStorage failures
  }

  const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  if (isValidGoogleMapsKey(envKey)) {
    return envKey.trim();
  }

  return '';
}

export function setStoredGoogleMapsApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY_MAPS_API_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_MAPS_API_KEY);
    }
  } catch (e) {
    // Ignore localStorage failures
  }
}
