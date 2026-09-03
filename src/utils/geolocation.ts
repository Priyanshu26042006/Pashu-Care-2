/**
 * Gausehat AI - Geolocation & Real-Time Reverse Geocoding Utility
 * Accurately tracks, geocodes, and displays where cattle scans are performed.
 */

export interface GeocodedLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  district: string;
  state: string;
  country: string;
  locationName: string;
  formattedAddress?: string;
  city?: string;
  isLiveLocation: boolean;
  timestamp: string;
}

const GPS_CACHE_KEY = 'gausehat_live_gps_cache';

/**
 * Reverse geocode latitude and longitude to administrative district, state, country, and location name.
 */
export async function reverseGeocodeCoordinates(lat: number, lng: number): Promise<{
  district: string;
  state: string;
  country: string;
  locationName: string;
  city: string;
  formattedAddress?: string;
}> {
  // 1. Try server-side reverse geocode endpoint first
  try {
    const res = await fetch(`/api/reverse-geocode?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.district || data.locationName || data.city)) {
        return {
          district: data.district || data.city || 'Field District',
          state: data.state || '',
          country: data.country || '',
          locationName: data.locationName || [data.district, data.state, data.country].filter(Boolean).join(', '),
          city: data.city || data.district || '',
          formattedAddress: data.formattedAddress,
        };
      }
    }
  } catch (err) {
    console.debug('Server reverse geocode unavailable, trying client-side provider:', err);
  }

  // 2. Direct client-side BigDataCloud reverse geocode (fast, free, no key required)
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (bdcRes.ok) {
      const bdc = await bdcRes.json();
      const city = bdc.locality || bdc.city || '';
      const district = bdc.city || bdc.locality || bdc.principalSubdivision || 'Field Region';
      const state = bdc.principalSubdivision || '';
      const country = bdc.countryName || '';
      
      const parts = [city, district !== city ? district : '', state, country].filter(Boolean);
      const uniqueParts = Array.from(new Set(parts));
      const locationName = uniqueParts.join(', ') || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;

      return {
        district,
        state,
        country,
        locationName,
        city,
        formattedAddress: locationName,
      };
    }
  } catch (err) {
    console.debug('BigDataCloud reverse geocode fallback notice:', err);
  }

  // 3. OpenStreetMap Nominatim fallback
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (nomRes.ok) {
      const nom = await nomRes.json();
      const addr = nom.address || {};
      const district = addr.state_district || addr.county || addr.city || addr.town || addr.village || 'Field Region';
      const state = addr.state || '';
      const country = addr.country || '';
      const locationName = [district, state, country].filter(Boolean).join(', ') || nom.display_name;

      return {
        district,
        state,
        country,
        locationName,
        city: addr.city || addr.town || addr.village || district,
        formattedAddress: nom.display_name,
      };
    }
  } catch (err) {
    console.debug('Nominatim reverse geocode fallback notice:', err);
  }

  // 4. Default fallback: formatted coordinates
  return {
    district: `GPS ${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
    state: 'Live Geotag',
    country: '',
    locationName: `Field Location (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`,
    city: '',
  };
}

/**
 * Retrieve cached GPS location from session if valid
 */
export function getStoredLiveLocation(): GeocodedLocation | null {
  try {
    const raw = sessionStorage.getItem(GPS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        return parsed;
      }
    }
  } catch {
    // Ignore storage parse errors
  }
  return null;
}

/**
 * Store live location in session storage
 */
export function setStoredLiveLocation(location: GeocodedLocation): void {
  try {
    sessionStorage.setItem(GPS_CACHE_KEY, JSON.stringify(location));
  } catch {
    // Ignore storage write errors
  }
}

/**
 * Actively acquire real browser GPS position and reverse-geocode to real district/state/location
 */
export async function acquireLiveScannedLocation(): Promise<GeocodedLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        const accuracy = Number(pos.coords.accuracy.toFixed(1)) || 5.0;

        try {
          const geocoded = await reverseGeocodeCoordinates(lat, lng);
          const fullLocation: GeocodedLocation = {
            lat,
            lng,
            accuracy,
            district: geocoded.district,
            state: geocoded.state,
            country: geocoded.country,
            locationName: geocoded.locationName,
            city: geocoded.city,
            formattedAddress: geocoded.formattedAddress,
            isLiveLocation: true,
            timestamp: new Date().toISOString(),
          };

          setStoredLiveLocation(fullLocation);
          resolve(fullLocation);
        } catch {
          // If geocoding failed, return raw coordinates with live status
          const fallbackLocation: GeocodedLocation = {
            lat,
            lng,
            accuracy,
            district: `Sector ${lat.toFixed(2)}°`,
            state: 'Geotag Fixed',
            country: '',
            locationName: `Live Field GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
            isLiveLocation: true,
            timestamp: new Date().toISOString(),
          };
          setStoredLiveLocation(fallbackLocation);
          resolve(fallbackLocation);
        }
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
}
