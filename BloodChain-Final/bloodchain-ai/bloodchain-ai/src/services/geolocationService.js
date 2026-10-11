/**
 * ====================================================================
 * BLOODCHAIN AI — BROWSER GEOLOCATION SERVICE
 * One-time client-side GPS location retrieval.
 * Zero database storage, zero external GPS tracking, 100% privacy-compliant.
 * ====================================================================
 */

export const GEOLOCATION_ERRORS = {
  NOT_SUPPORTED: "NOT_SUPPORTED",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  POSITION_UNAVAILABLE: "POSITION_UNAVAILABLE",
  TIMEOUT: "TIMEOUT",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

/**
 * Standard configuration options for navigator.geolocation.getCurrentPosition
 */
const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
};

/**
 * Requests the user's current GPS position via the standard browser Geolocation API.
 * Performs a single one-time location retrieval only (never continuous tracking).
 *
 * @param {PositionOptions} [customOptions] Optional custom geolocation options
 * @returns {Promise<{success: boolean, coords?: {latitude: number, longitude: number, accuracy: number}, error?: string, code?: string}>}
 */
export function getCurrentUserLocation(customOptions = {}) {
  return new Promise((resolve) => {
    // 1. Check if Geolocation API is supported by the browser
    if (typeof window === "undefined" || !navigator.geolocation) {
      resolve({
        success: false,
        code: GEOLOCATION_ERRORS.NOT_SUPPORTED,
        error: "Location services are not supported by this browser.",
      });
      return;
    }

    const options = { ...DEFAULT_OPTIONS, ...customOptions };

    // 2. Perform one-time position request
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy || 0),
          },
        });
      },
      (error) => {
        let message = "An error occurred while retrieving your location.";
        let code;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            code = GEOLOCATION_ERRORS.PERMISSION_DENIED;
            message = "Location permission was denied. Allow location access to find nearby facilities.";
            break;
          case error.POSITION_UNAVAILABLE:
            code = GEOLOCATION_ERRORS.POSITION_UNAVAILABLE;
            message = "Unable to determine your current location.";
            break;
          case error.TIMEOUT:
            code = GEOLOCATION_ERRORS.TIMEOUT;
            message = "Location request timed out. Please try again.";
            break;
          default:
            code = GEOLOCATION_ERRORS.UNKNOWN_ERROR;
            message = error.message || message;
            break;
        }

        resolve({
          success: false,
          code,
          error: message,
        });
      },
      options
    );
  });
}
