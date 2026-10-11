/**
 * ====================================================================
 * BLOODCHAIN AI — PHASE 4: OSRM ROAD ROUTING SERVICE
 *
 * Core Capabilities:
 * 1. OSRM (Open Source Routing Machine) public demo server for real road
 *    distance & travel time — zero Google Maps, zero API keys required
 * 2. Fast in-memory session route caching to prevent redundant requests
 * 3. Candidate shortlist limiting (default MAX_ROUTE_CANDIDATES = 5)
 * 4. Graceful fallback to Haversine straight-line distance if OSRM fails/unavailable
 * 5. GeoJSON polyline (OSRM returns [lng, lat]) correctly converted to
 *    Leaflet [lat, lng] format
 * 6. Zero random/fake distances or synthetic traffic claims
 *
 * OSRM Public Demo: https://router.project-osrm.org
 * Endpoint: /route/v1/driving/{lng1,lat1;lng2,lat2}
 *   ?overview=full&geometries=geojson&steps=false
 *
 * IMPORTANT — OSRM coordinate order:
 *   longitude FIRST, then latitude  (opposite of Leaflet)
 *
 * DISCLAIMER:
 *   The public OSRM demo server is used for development / hackathon
 *   demonstration. It may have usage and rate limitations. Production
 *   deployment should use a dedicated routing provider or self-hosted
 *   OSRM / Valhalla infrastructure.
 * ====================================================================
 */

import { calculateHaversineDistance, formatDistance } from "../utils/geoUtils.js";
import { VERIFIED_COORDINATES } from "./facilityService.js";

/**
 * Flatten all district-keyed VERIFIED_COORDINATES into a single lookup array
 * for O(n) fuzzy name matching in getBatchRoutes coordinate enrichment.
 * Built once at module load — not recalculated per route call.
 */
const _verifiedCoordsList = Object.values(VERIFIED_COORDINATES)
  .flatMap((districtMap) =>
    Object.entries(districtMap).map(([name, coords]) => ({ name, ...coords }))
  );

/**
 * OSRM public demo routing endpoint.
 * Production: replace with self-hosted OSRM or dedicated routing provider.
 */
const OSRM_BASE_URL = "https://router.project-osrm.org";

/**
 * Default maximum number of candidate facilities to route via OSRM.
 * Prevents unnecessary network calls and respects the public demo server.
 */
export const MAX_ROUTE_CANDIDATES = 5;

/**
 * In-memory session cache for computed routes.
 * Key: "route:<originLat>,<originLng>:<destLat>,<destLng>" -> Route object
 */
const routeCache = new Map();

/**
 * Generates a consistent, rounded cache key from origin and destination.
 * Coordinates are rounded to 4 decimal places (~11 m precision).
 */
function getCacheKey(origin, destination) {
  const oLat = Number(origin?.latitude ?? origin?.lat).toFixed(4);
  const oLng = Number(origin?.longitude ?? origin?.lng).toFixed(4);
  const dLat = Number(destination?.latitude ?? destination?.lat).toFixed(4);
  const dLng = Number(destination?.longitude ?? destination?.lng).toFixed(4);
  return `route:${oLat},${oLng}:${dLat},${dLng}`;
}

/**
 * Formats distance in meters to clean UI-ready string.
 *
 * < 1000 m  → "850 m"
 * >= 1000 m → "12.4 km"
 *
 * @param {number} meters Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatRoadDistance(meters) {
  if (meters === null || meters === undefined || isNaN(Number(meters))) {
    return "N/A";
  }
  const m = Number(meters);
  if (m < 1000) {
    return `${Math.round(m)} m`;
  }
  const km = m / 1000;
  return `${km.toFixed(1)} km`;
}

/**
 * Formats OSRM duration in seconds to clean human-readable text.
 *
 * Examples:
 *   2040s → "34 min"
 *   4320s → "1 hr 12 min"
 *   7500s → "2 hr 5 min"
 *
 * STRICT RULE: Only use actual OSRM-returned duration.
 * DO NOT estimate ETA from Haversine distance / fixed speed.
 *
 * @param {number|string} duration  Duration in seconds (or "900s" string style)
 * @param {boolean} isMinutes       If true, input is already in minutes
 * @returns {string} Formatted duration string e.g. "34 min"
 */
export function formatDuration(duration, isMinutes = false) {
  if (duration === null || duration === undefined) {
    return "N/A";
  }

  let totalMinutes;
  if (isMinutes) {
    if (isNaN(Number(duration))) return "N/A";
    totalMinutes = Math.round(Number(duration));
  } else {
    // Handle string format like "900s" (legacy Google compat) or plain numeric seconds
    const secStr = String(duration).replace(/s$/i, "").trim();
    const seconds = parseInt(secStr, 10);
    if (isNaN(seconds)) return "N/A";
    totalMinutes = Math.max(1, Math.round(seconds / 60));
  }

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  if (remainingMins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMins} min`;
}

/**
 * Legacy alias kept for backward compatibility with recommendation engine.
 * @deprecated Prefer formatRoadDistance for meters-based input.
 */
export function decodePolyline(encoded) {
  // Google encoded polyline decoder — kept for backward compatibility.
  // OSRM returns GeoJSON geometry directly; this function is no longer
  // used in the OSRM routing path but remains available.
  if (!encoded || typeof encoded !== "string") return [];
  const points = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

/**
 * Validates a coordinate pair object.
 * Accepts { latitude, longitude } or { lat, lng }.
 * Rejects null/NaN/zero/out-of-range values.
 */
export function isValidCoordinate(coord) {
  if (!coord || typeof coord !== "object") return false;
  const lat = Number(coord.latitude ?? coord.lat);
  const lng = Number(coord.longitude ?? coord.lng);
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    lat !== 0 &&
    lng !== 0
  );
}

/**
 * Converts OSRM GeoJSON coordinates [lng, lat] to Leaflet-compatible
 * {lat, lng} objects for polyline rendering.
 *
 * OSRM returns GeoJSON format: [[longitude, latitude], ...]
 * Leaflet expects:             [{lat, lng}, ...] or [[lat, lng], ...]
 *
 * @param {Array} geojsonCoords  Array of [longitude, latitude] pairs from OSRM
 * @returns {Array<{lat: number, lng: number}>}
 */
function osrmGeoJsonToLeaflet(geojsonCoords) {
  if (!Array.isArray(geojsonCoords)) return [];
  return geojsonCoords
    .filter((pt) => Array.isArray(pt) && pt.length >= 2)
    .map(([lng, lat]) => ({ lat: Number(lat), lng: Number(lng) }));
}

/**
 * Builds a normalized failure response object (no fake values).
 */
function buildFailureResult({ oLat, oLng, dLat, dLng, straightLineKm, error, status }) {
  return {
    success: false,
    origin: { latitude: oLat, longitude: oLng },
    destination: { latitude: dLat, longitude: dLng },
    straightLineKm,
    distanceMeters: null,
    distanceKm: null,
    distanceDisplay: straightLineKm != null ? `${straightLineKm.toFixed(1)} km (Straight-line)` : "N/A",
    durationSeconds: null,
    durationMinutes: null,
    durationText: "Road route unavailable",
    encodedPolyline: null,
    geometry: null,
    coordinates: [],
    source: "osrm",
    provider: "OSRM",  // backward compat alias
    status: status || "unavailable",
    error,
  };
}

/**
 * Fetches real road route between origin and destination using the OSRM
 * public demo routing engine.
 *
 * Never throws an uncaught error; gracefully returns failure result on any error.
 *
 * Coordinate convention:
 *   OSRM request: longitude,latitude (GeoJSON order)
 *   Leaflet output: { lat, lng } objects
 *
 * @param {Object} origin      { latitude/lat, longitude/lng }
 * @param {Object} destination { latitude/lat, longitude/lng }
 * @param {Object} [options]
 * @param {boolean} [options.bypassCache=false] Force fresh request from OSRM
 * @returns {Promise<Object>} Normalized route response object
 */
export async function getRoute(origin, destination, options = {}) {
  const { bypassCache = false, apiKey, forceUnavailable = false } = options;

  // 1. Validate inputs
  if (!isValidCoordinate(origin) || !isValidCoordinate(destination)) {
    return {
      success: false,
      origin: origin
        ? { latitude: Number(origin.latitude ?? origin.lat), longitude: Number(origin.longitude ?? origin.lng) }
        : null,
      destination: destination
        ? { latitude: Number(destination.latitude ?? destination.lat), longitude: Number(destination.longitude ?? destination.lng) }
        : null,
      distanceKm: null,
      distanceDisplay: "N/A",
      durationMinutes: null,
      durationText: "N/A",
      encodedPolyline: null,
      geometry: null,
      coordinates: [],
      source: "osrm",
      provider: "OSRM",
      status: "unavailable",
      error: "Route unavailable — Invalid or missing location coordinates.",
    };
  }

  const oLat = Number(origin.latitude ?? origin.lat);
  const oLng = Number(origin.longitude ?? origin.lng);
  const dLat = Number(destination.latitude ?? destination.lat);
  const dLng = Number(destination.longitude ?? destination.lng);

  // Calculate straight-line Haversine distance as verified baseline
  const straightLineKm = calculateHaversineDistance(oLat, oLng, dLat, dLng);

  // 2. Check in-memory cache
  const cacheKey = getCacheKey({ lat: oLat, lng: oLng }, { lat: dLat, lng: dLng });
  if (!bypassCache && routeCache.has(cacheKey)) {
    return { ...routeCache.get(cacheKey), fromCache: true };
  }

  // Graceful fallback simulation when route is explicitly marked unavailable or missing legacy key
  if (apiKey === "" || forceUnavailable) {
    const failResult = buildFailureResult({
      oLat, oLng, dLat, dLng, straightLineKm,
      error: "Road route temporarily unavailable.",
      status: "unavailable",
    });
    routeCache.set(cacheKey, failResult);
    return failResult;
  }

  // 3. Build OSRM request URL
  // CRITICAL: OSRM uses longitude,latitude order (NOT latitude,longitude)
  // Example: /route/v1/driving/80.2707,13.0827;78.7047,10.7905
  const coords = `${oLng.toFixed(6)},${oLat.toFixed(6)};${dLng.toFixed(6)},${dLat.toFixed(6)}`;
  const url = `${OSRM_BASE_URL}/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined, // 10s timeout
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      const failResult = buildFailureResult({
        oLat, oLng, dLat, dLng, straightLineKm,
        error: `Road route temporarily unavailable. (HTTP ${response.status})`,
        status: "unavailable",
      });
      routeCache.set(cacheKey, failResult);
      return failResult;
    }

    const data = await response.json();

    // OSRM returns { code, routes, waypoints }
    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      const failResult = buildFailureResult({
        oLat, oLng, dLat, dLng, straightLineKm,
        error: "No drivable route found.",
        status: "no_route",
      });
      routeCache.set(cacheKey, failResult);
      return failResult;
    }

    const primaryRoute = data.routes[0];

    // Parse OSRM distance (meters) and duration (seconds)
    const distanceMeters = Number(primaryRoute.distance) || 0;
    const durationSeconds = Number(primaryRoute.duration) || 0;
    const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
    const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));
    const durationText = formatDuration(durationSeconds, false);
    const distanceDisplay = formatRoadDistance(distanceMeters);

    // Parse OSRM GeoJSON geometry
    // OSRM GeoJSON coordinate order: [longitude, latitude]
    // Must convert to Leaflet's { lat, lng } order
    const geojsonGeometry = primaryRoute.geometry || null;
    const geojsonCoords = geojsonGeometry?.coordinates || [];
    const leafletCoords = osrmGeoJsonToLeaflet(geojsonCoords);

    const successResult = {
      success: true,
      origin: { latitude: oLat, longitude: oLng },
      destination: { latitude: dLat, longitude: dLng },
      straightLineKm,
      distanceMeters,
      distanceKm,
      distanceDisplay,
      durationSeconds,
      durationMinutes,
      durationText,
      // GeoJSON geometry (OSRM native format, [lng,lat] pairs)
      geometry: geojsonGeometry,
      // Leaflet-ready coordinates ({lat, lng} objects)
      coordinates: leafletCoords,
      // Legacy field (no encoded polyline from OSRM, just GeoJSON)
      encodedPolyline: null,
      source: "osrm",
      provider: "OSRM",
      status: "success",
      error: null,
    };

    routeCache.set(cacheKey, successResult);
    return successResult;

  } catch (netErr) {
    const failResult = buildFailureResult({
      oLat, oLng, dLat, dLng, straightLineKm,
      error: netErr?.name === "TimeoutError"
        ? "Road route temporarily unavailable. (Request timed out)"
        : `Unable to calculate road route. (${netErr?.message || "Network error"})`,
      status: "unavailable",
    });
    routeCache.set(cacheKey, failResult);
    return failResult;
  }
}

/**
 * Computes road routes for candidate facilities up to MAX_ROUTE_CANDIDATES.
 *
 * CRITICAL PERFORMANCE & RATE PROTECTION:
 * - Only candidates with verified coordinates are routed.
 * - Never requests OSRM for more than maxCandidates (default 5).
 * - Never calculates routes for all facilities at once.
 * - Uses cache to avoid duplicate OSRM requests.
 *
 * @param {Object} origin        Route origin { latitude/lat, longitude/lng }
 * @param {Array<Object>} candidates  Candidate facilities with latitude & longitude
 * @param {Object} [options]
 * @param {number} [options.maxCandidates=MAX_ROUTE_CANDIDATES]
 * @returns {Promise<Array<Object>>} Candidates with attached route data
 */
export async function getBatchRoutes(origin, candidates = [], options = {}) {
  const { maxCandidates = MAX_ROUTE_CANDIDATES } = options;

  if (!isValidCoordinate(origin) || !Array.isArray(candidates) || candidates.length === 0) {
    return candidates;
  }

  // Take only up to maxCandidates — strictly cap OSRM calls
  const shortlist = candidates.slice(0, maxCandidates);
  const remaining = candidates.slice(maxCandidates);

  // Route each shortlisted candidate concurrently (cache prevents duplicate OSRM calls)
  const routedShortlist = await Promise.all(
    shortlist.map(async (cand) => {
      // Must have verified coordinates to route.
      // If missing, attempt a fuzzy-match enrichment from VERIFIED_COORDINATES
      // before giving up — covers cases where Supabase inventory stores facility
      // names that don't exactly match facilityService lookup strings.
      let lat = cand.latitude;
      let lng = cand.longitude;

      if ((!lat || !lng) && cand.facilityName) {
        const lower = cand.facilityName.toLowerCase();
        const match = _verifiedCoordsList.find(
          (v) =>
            v.name.toLowerCase().includes(lower) ||
            lower.includes(v.name.toLowerCase())
        );
        if (match) {
          lat = match.lat;
          lng = match.lng;
        }
      }

      if (!lat || !lng) {
        return {
          ...cand,
          roadDistanceKm: null,
          roadDistanceDisplay: null,
          durationMinutes: null,
          durationText: "Coordinates pending",
          routeStatus: "unavailable",
          routeData: null,
          coordinates: [],
          encodedPolyline: null,
        };
      }

      const routeResult = await getRoute(
        origin,
        { lat, lng },
        options
      );

      if (routeResult.status === "success") {
        return {
          ...cand,
          roadDistanceKm: routeResult.distanceKm,
          roadDistanceDisplay: routeResult.distanceDisplay,
          durationMinutes: routeResult.durationMinutes,
          durationText: routeResult.durationText,
          routeStatus: "success",
          encodedPolyline: null, // OSRM returns GeoJSON, not encoded polyline
          routeCoordinates: routeResult.coordinates,
          routeData: routeResult,
        };
      }

      // Graceful fallback — never invent road distances or ETA
      return {
        ...cand,
        roadDistanceKm: null,
        roadDistanceDisplay: null,
        durationMinutes: null,
        durationText: routeResult.error || "Road route unavailable",
        routeStatus: "unavailable",
        encodedPolyline: null,
        routeCoordinates: [],
        routeData: routeResult,
      };
    })
  );

  return [...routedShortlist, ...remaining];
}

/**
 * Clears the in-memory session route cache.
 * Useful for test isolation and user session resets.
 */
export function clearRouteCache() {
  routeCache.clear();
}

/**
 * Returns current cache size. Useful for debugging and test assertions.
 */
export function getRouteCacheSize() {
  return routeCache.size;
}

/**
 * Checks if a route response indicates a successful OSRM result.
 * A successful route has actual road distance + duration from OSRM.
 *
 * @param {Object} routeResult Result from getRoute()
 * @returns {boolean}
 */
export function isRouteSuccess(routeResult) {
  return (
    routeResult &&
    routeResult.status === "success" &&
    routeResult.distanceKm !== null &&
    routeResult.durationMinutes !== null &&
    routeResult.source === "osrm"
  );
}

export default {
  getRoute,
  getBatchRoutes,
  decodePolyline,
  formatDuration,
  formatRoadDistance,
  isValidCoordinate,
  isRouteSuccess,
  clearRouteCache,
  getRouteCacheSize,
  osrmGeoJsonToLeaflet,
  MAX_ROUTE_CANDIDATES,
  OSRM_BASE_URL,
};
