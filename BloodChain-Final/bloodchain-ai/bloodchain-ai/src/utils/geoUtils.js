/**
 * ====================================================================
 * BLOODCHAIN AI — GEOSPATIAL UTILITIES
 * Pure mathematical calculations for straight-line geographic distances.
 * Zero external API calls (No Google Places, No Google Routes).
 * ====================================================================
 */

/**
 * Default nearby search radius in kilometers
 */
export const DEFAULT_NEARBY_RADIUS_KM = 25;

/**
 * Supported nearby radius filter options (in km)
 */
export const NEARBY_RADIUS_OPTIONS = [10, 25, 50, 100];

/**
 * Calculate Great-Circle straight-line distance between two geographic coordinates
 * using the Haversine formula.
 *
 * Earth's mean radius: R ≈ 6371 km
 *
 * @param {number} lat1 Latitude of point 1 in decimal degrees
 * @param {number} lon1 Longitude of point 1 in decimal degrees
 * @param {number} lat2 Latitude of point 2 in decimal degrees
 * @param {number} lon2 Longitude of point 2 in decimal degrees
 * @returns {number|null} Straight-line distance in kilometers, or null if coordinates are invalid
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const p1Lat = Number(lat1);
  const p1Lon = Number(lon1);
  const p2Lat = Number(lat2);
  const p2Lon = Number(lon2);

  // Exclude invalid or missing coordinates
  if (
    lat1 === null ||
    lon1 === null ||
    lat2 === null ||
    lon2 === null ||
    isNaN(p1Lat) ||
    isNaN(p1Lon) ||
    isNaN(p2Lat) ||
    isNaN(p2Lon)
  ) {
    return null;
  }

  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(p2Lat - p1Lat);
  const dLon = toRad(p2Lon - p1Lon);
  const radLat1 = toRad(p1Lat);
  const radLat2 = toRad(p2Lat);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const R = 6371; // Earth's radius in kilometers

  return R * c;
}

/**
 * Format numeric distance in kilometers for clean UI presentation.
 * Returns formatted string like "1.24 km", "3.80 km", "12.45 km".
 *
 * @param {number|null} distanceKm Distance in kilometers
 * @returns {string} Formatted distance string or "N/A"
 */
export function formatDistance(distanceKm) {
  if (distanceKm === null || typeof distanceKm !== "number" || isNaN(distanceKm)) {
    return "N/A";
  }

  return `${distanceKm.toFixed(2)} km`;
}

/**
 * Filter and sort facilities by straight-line distance from user's GPS coordinates.
 * Excludes facilities lacking verified coordinates.
 * Sorts ascending by proximity (nearest first).
 *
 * @param {Object} params
 * @param {number} params.userLat User latitude
 * @param {number} params.userLng User longitude
 * @param {Array} params.facilities Array of facility objects
 * @param {number} [params.radiusKm=25] Proximity boundary radius in kilometers
 * @param {string} [params.facilityType="All"] Optional facility type filter
 * @returns {Array} Filtered facilities sorted by distance ascending with distanceKm and distanceDisplay attached
 */
export function findNearbyFacilities({
  userLat,
  userLng,
  facilities = [],
  radiusKm = DEFAULT_NEARBY_RADIUS_KM,
  facilityType = "All",
}) {
  if (userLat == null || userLng == null || !Array.isArray(facilities)) {
    return [];
  }

  const results = [];

  for (const facility of facilities) {
    // Exclude facilities without verified coordinates
    if (!facility.hasCoordinates && (facility.latitude == null || facility.longitude == null)) {
      continue;
    }

    const facLat = Number(facility.latitude);
    const facLng = Number(facility.longitude);

    if (isNaN(facLat) || isNaN(facLng)) {
      continue;
    }

    // Respect facility type filter if active
    if (facilityType && facilityType !== "All") {
      const type = (facility.type || facility.facility_type || "").toLowerCase();
      const filterType = facilityType.toLowerCase();

      if (filterType === "hospital") {
        if (!type.includes("hospital")) continue;
      } else if (!type.includes(filterType)) {
        continue;
      }
    }

    // Calculate Haversine straight-line distance
    const distanceKm = calculateHaversineDistance(userLat, userLng, facLat, facLng);

    if (distanceKm !== null && distanceKm <= radiusKm) {
      results.push({
        ...facility,
        distanceKm,
        distanceDisplay: formatDistance(distanceKm),
        distanceType: "Straight-line",
      });
    }
  }

  // Sort ascending by distance (nearest first)
  results.sort((a, b) => a.distanceKm - b.distanceKm);

  return results;
}

/**
 * Standard Clinical Blood Compatibility Table (Universal Red Blood Cells)
 */
export const BLOOD_COMPATIBILITY_TABLE = {
  "O-": ["O-"],
  "O+": ["O+", "O-"],
  "A-": ["A-", "O-"],
  "A+": ["A+", "A-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "AB-": ["AB-", "A-", "B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
};

/**
 * Approximate Locality Centroids for Privacy-Preserving Donor Maps
 * Strict privacy protection: Zero house numbers, zero street addresses.
 */
export const APPROXIMATE_LOCATION_CENTROIDS = {
  // Tiruchirappalli localities
  "trichy": { latitude: 10.8035, longitude: 78.6872 },
  "tiruchirappalli": { latitude: 10.8035, longitude: 78.6872 },
  "srirangam": { latitude: 10.8622, longitude: 78.6983 },
  "thuvakudi": { latitude: 10.7589, longitude: 78.8001 },
  "lalgudi": { latitude: 10.8687, longitude: 78.8167 },
  "thillai nagar": { latitude: 10.8291, longitude: 78.6860 },
  "mannachanallur": { latitude: 10.9080, longitude: 78.6983 },
  "manapparai": { latitude: 10.6074, longitude: 78.4168 },
  "musiri": { latitude: 10.9392, longitude: 78.4485 },
  // Major District and State Centers
  "chennai": { latitude: 13.0827, longitude: 80.2707 },
  "coimbatore": { latitude: 11.0168, longitude: 76.9558 },
  "madurai": { latitude: 9.9252, longitude: 78.1198 },
  "salem": { latitude: 11.6643, longitude: 78.1460 },
  "thiruvananthapuram": { latitude: 8.5241, longitude: 76.9366 },
  "kollam": { latitude: 8.8932, longitude: 76.6141 },
  "ernakulam": { latitude: 9.9816, longitude: 76.2999 },
  "thrissur": { latitude: 10.5276, longitude: 76.2144 },
  "kozhikode": { latitude: 11.2588, longitude: 75.7804 },
  "bengaluru": { latitude: 12.9716, longitude: 77.5946 },
  "bengaluru urban": { latitude: 12.9716, longitude: 77.5946 },
  "mysuru": { latitude: 12.2958, longitude: 76.6394 },
  "visakhapatnam": { latitude: 17.6868, longitude: 83.2185 },
  "vijayawada": { latitude: 16.5062, longitude: 80.6480 },
  "guntur": { latitude: 16.3067, longitude: 80.4365 },
  "delhi": { latitude: 28.6139, longitude: 77.2090 },
  "new delhi": { latitude: 28.6139, longitude: 77.2090 },
  "puducherry": { latitude: 11.9416, longitude: 79.8083 },
};

/**
 * Resolves approximate area-level coordinates for a donor record.
 * Protects donor privacy by never using or exposing exact home addresses.
 *
 * @param {Object} donor Donor object
 * @returns {{latitude: number, longitude: number} | null}
 */
export function getApproximateDonorCoordinates(donor) {
  if (!donor) return null;

  // 1. If valid coordinates are already attached
  if (
    donor.latitude != null &&
    donor.longitude != null &&
    !isNaN(Number(donor.latitude)) &&
    !isNaN(Number(donor.longitude)) &&
    Number(donor.latitude) !== 0 &&
    Number(donor.longitude) !== 0
  ) {
    return {
      latitude: Number(donor.latitude),
      longitude: Number(donor.longitude),
    };
  }

  // 2. Resolve approximate locality/area centroid
  const loc = (donor.location || "").toLowerCase().trim();
  const dist = (donor.district || "").toLowerCase().trim();

  // Match area location first, then district
  for (const [key, coords] of Object.entries(APPROXIMATE_LOCATION_CENTROIDS)) {
    if (loc === key || loc.includes(key) || dist === key || dist.includes(key)) {
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
    }
  }

  return null;
}

/**
 * Filter and sort volunteer blood donors by straight-line distance from user GPS.
 * Sorts ascending by proximity (nearest first).
 *
 * @param {Object} params
 * @param {number} params.userLat User latitude
 * @param {number} params.userLng User longitude
 * @param {Array} params.donors Array of donor objects
 * @param {number} [params.radiusKm=25] Proximity radius boundary in kilometers
 * @param {string} [params.bloodGroup="All"] Required blood group or "All"
 * @param {boolean} [params.compatibleOnly=false] Whether to apply clinical compatibility
 * @returns {Array} Filtered donors sorted by distance ascending with distanceKm and distanceDisplay
 */
export function findNearbyDonors({
  userLat,
  userLng,
  donors = [],
  radiusKm = DEFAULT_NEARBY_RADIUS_KM,
  bloodGroup = "All",
  compatibleOnly = false,
}) {
  if (userLat == null || userLng == null || !Array.isArray(donors)) {
    return [];
  }

  const results = [];

  for (const donor of donors) {
    const coords = getApproximateDonorCoordinates(donor);
    if (!coords) continue;

    const donorGroup = (donor.blood_group || donor.bloodGroup || "").trim();

    // Respect blood group / compatibility filter
    if (bloodGroup && bloodGroup !== "All") {
      const targetBg = bloodGroup.trim().toUpperCase();
      if (compatibleOnly) {
        const allowed = BLOOD_COMPATIBILITY_TABLE[targetBg];
        if (!allowed || !allowed.includes(donorGroup.toUpperCase())) {
          continue;
        }
      } else {
        if (donorGroup.toUpperCase() !== targetBg) {
          continue;
        }
      }
    }

    const distanceKm = calculateHaversineDistance(
      userLat,
      userLng,
      coords.latitude,
      coords.longitude
    );

    if (distanceKm !== null && distanceKm <= radiusKm) {
      results.push({
        ...donor,
        latitude: coords.latitude,
        longitude: coords.longitude,
        hasCoordinates: true,
        isDonor: true,
        markerType: "donor",
        distanceKm,
        distanceDisplay: formatDistance(distanceKm),
        distanceType: "Straight-line",
      });
    }
  }

  // Sort ascending by distance (nearest first)
  results.sort((a, b) => a.distanceKm - b.distanceKm);

  return results;
}
