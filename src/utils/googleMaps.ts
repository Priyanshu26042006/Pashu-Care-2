/**
 * Google Maps Platform key validation and configuration helper.
 * Prevents InvalidKeyMapError by guarding against empty or placeholder keys.
 */

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
