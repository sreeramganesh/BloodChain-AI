import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import { calculateHaversineDistance, formatDistance, DEFAULT_NEARBY_RADIUS_KM } from "../utils/geoUtils.js";
import { getAllVerifiedFacilities } from "./facilityService.js";
import { getBloodInventory } from "./bloodService.js";
import { getShortageRisks, getExpiryRisks } from "./predictiveService.js";
import { getBatchRoutes, getRoute, MAX_ROUTE_CANDIDATES } from "./routesService.js";

/**
 * ====================================================================
 * BLOODCHAIN AI — PHASE 4 & PHASE 5: INTELLIGENT SOURCE SELECTION ENGINE
 *
 * Core Capabilities:
 * 1. Strict clinical blood group compatibility matrix (O- universal donor, AB+ universal recipient)
 * 2. Unreserved inventory availability check (usable stock = available_units)
 * 3. Proximity pre-filter via Haversine straight-line distance (R = 6371 km)
 * 4. Shortage risk integration (preserves safety stock buffer at candidate facility)
 * 5. Expiry risk integration (prioritizes near-expiry units to prevent clinical wastage)
 * 6. Phase 5: Google Routes API road distance, travel duration/ETA, and route polyline
 * 7. Phase 5: Transport-aware 100-point scoring model (score_version = "v2-routes")
 * 8. Candidate shortlist limiting (default MAX_ROUTE_CANDIDATES = 5)
 * 9. Human review mandatory (advisory only; zero auto-transfer, zero auto-deduction)
 * 10. Idempotent duplicate-prevention for request-tied recommendations
 * ====================================================================
 */

/**
 * Scoring Version identifier for Phase 5
 */
export const SCORE_VERSION = "v2-routes";

/**
 * Safe local storage accessor with Node.js in-memory fallback
 */
const _memoryCache = new Map();

function safeGetStorage(key) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (_e) {
    void _e;
  }
  return _memoryCache.get(key) || null;
}

function safeSetStorage(key, value) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch (_e) {
    void _e;
  }
  _memoryCache.set(key, value);
}

/**
 * Strict Clinical Blood Compatibility Matrix (Red Blood Cells)
 * Recipient blood group -> Array of compatible donor blood groups
 */
export const BLOOD_COMPATIBILITY_MATRIX = {
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
 * Validates clinical compatibility between recipient and donor blood groups.
 *
 * @param {string} recipientGroup Blood group needed by recipient
 * @param {string} sourceGroup Blood group held in donor/facility inventory
 * @returns {"Exact Match" | "Compatible Alternate" | null} Compatibility classification or null if incompatible
 */
export function checkBloodCompatibility(recipientGroup, sourceGroup) {
  if (!recipientGroup || !sourceGroup) return null;
  const rGroup = recipientGroup.trim().toUpperCase();
  const sGroup = sourceGroup.trim().toUpperCase();

  const allowedSources = BLOOD_COMPATIBILITY_MATRIX[rGroup];
  if (!allowedSources || !allowedSources.includes(sGroup)) {
    return null; // Incompatible — strictly excluded
  }

  if (rGroup === sGroup) {
    return "Exact Match";
  }
  return "Compatible Alternate";
}

/**
 * Normalizes units needed into a clean integer.
 * Handles strings like "2 Units", "2", 2.
 */
export function parseUnitsNeeded(val) {
  if (typeof val === "number") return val > 0 ? val : 1;
  if (!val) return 1;
  const match = String(val).match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
}

/**
 * Phase 4 Scoring Constants (Total 100 points maximum) — Kept for backward compatibility
 */
export const SCORING_WEIGHTS = {
  COMPATIBILITY: {
    EXACT_MATCH: 25,
    COMPATIBLE_ALTERNATE: 18,
  },
  AVAILABILITY: {
    FULL_FULFILLMENT_BASE: 25,
    BUFFER_BONUS_MAX: 5,
    PARTIAL_MAX: 15,
  },
  SHORTAGE_RISK: {
    LOW: 20,
    MEDIUM: 14,
    HIGH: 7,
    CRITICAL: 0,
  },
  EXPIRY_RISK: {
    HIGH_CRITICAL_EXPIRY: 10,
    MEDIUM_EXPIRY: 7,
    LOW_EXPIRY: 5,
  },
  DISTANCE: {
    UNDER_2_KM: 15,
    UNDER_5_KM: 13,
    UNDER_10_KM: 10,
    UNDER_25_KM: 6,
    OVER_25_KM: 2,
    UNVERIFIED_COORDS: 0,
  },
};

/**
 * Phase 5 Multi-Factor Scoring Constants (Total 100 points maximum)
 *
 * Rebalanced Weights (Step 16):
 * - Compatibility: 25 pts (Exact Match: 25, Alternate: 18)
 * - Availability / Capacity: 30 pts (Full fulfillment: 25-30, Partial: 0-15)
 * - Shortage Risk at Source: 15 pts (Low: 15, Med: 10, High: 5, Critical: 0)
 * - Expiry Risk / Wastage: 10 pts (Near-expiry bonus: 10, Med: 7, Low: 5)
 * - Road Distance / Travel Time (Transport): 20 pts
 *   - Travel Duration (primary):
 *     <= 10 min: 20 pts
 *     <= 20 min: 16 pts
 *     <= 35 min: 12 pts
 *     <= 60 min: 7 pts
 *     > 60 min: 3 pts
 *   - Distance Fallback (when travel time is unavailable):
 *     < 5 km: 20 pts
 *     < 10 km: 16 pts
 *     < 25 km: 12 pts
 *     < 50 km: 7 pts
 *     >= 50 km: 3 pts
 *     Unverified coordinates: 0 pts
 *
 * TOTAL: 25 + 30 + 15 + 10 + 20 = 100 points
 */
export const SCORING_WEIGHTS_V2 = {
  COMPATIBILITY: {
    EXACT_MATCH: 25,
    COMPATIBLE_ALTERNATE: 18,
  },
  AVAILABILITY: {
    FULL_FULFILLMENT_BASE: 25,
    BUFFER_BONUS_MAX: 5,
    PARTIAL_MAX: 15,
  },
  SHORTAGE_RISK: {
    LOW: 15,
    MEDIUM: 10,
    HIGH: 5,
    CRITICAL: 0,
  },
  EXPIRY_RISK: {
    HIGH_CRITICAL_EXPIRY: 10,
    MEDIUM_EXPIRY: 7,
    LOW_EXPIRY: 5,
  },
  TRANSPORT_TIME: {
    UNDER_10_MIN: 20,
    UNDER_20_MIN: 16,
    UNDER_35_MIN: 12,
    UNDER_60_MIN: 7,
    OVER_60_MIN: 3,
  },
  TRANSPORT_DISTANCE_FALLBACK: {
    UNDER_5_KM: 20,
    UNDER_10_KM: 16,
    UNDER_25_KM: 12,
    UNDER_50_KM: 7,
    OVER_50_KM: 3,
    UNVERIFIED_COORDS: 0,
  },
};

/**
 * Calculates explainable recommendation score (0 - 100) based on clinical factors.
 * Supports Phase 5 "v2-routes" scoring with road travel duration and Phase 4 "v1-haversine".
 */
export function calculateRecommendationScore({
  compatibilityStatus,
  availableUnits,
  requiredUnits,
  shortageRiskLevel,
  expiryRiskLevel,
  distanceKm,
  roadDistanceKm = null,
  durationMinutes = null,
  scoreVersion = SCORE_VERSION,
}) {
  // Support Phase 4 backward compatibility if requested
  if (scoreVersion === "v1-haversine") {
    let score = 0;
    if (compatibilityStatus === "Exact Match") {
      score += SCORING_WEIGHTS.COMPATIBILITY.EXACT_MATCH;
    } else if (compatibilityStatus === "Compatible Alternate") {
      score += SCORING_WEIGHTS.COMPATIBILITY.COMPATIBLE_ALTERNATE;
    }

    if (availableUnits >= requiredUnits) {
      score += SCORING_WEIGHTS.AVAILABILITY.FULL_FULFILLMENT_BASE;
      const bufferRatio = availableUnits / Math.max(requiredUnits, 1);
      score += Math.min(SCORING_WEIGHTS.AVAILABILITY.BUFFER_BONUS_MAX, bufferRatio);
    } else {
      const ratio = Math.max(0, availableUnits) / Math.max(requiredUnits, 1);
      score += ratio * SCORING_WEIGHTS.AVAILABILITY.PARTIAL_MAX;
    }

    const sRisk = (shortageRiskLevel || "low").toLowerCase();
    if (sRisk === "low") score += SCORING_WEIGHTS.SHORTAGE_RISK.LOW;
    else if (sRisk === "medium") score += SCORING_WEIGHTS.SHORTAGE_RISK.MEDIUM;
    else if (sRisk === "high") score += SCORING_WEIGHTS.SHORTAGE_RISK.HIGH;
    else score += SCORING_WEIGHTS.SHORTAGE_RISK.CRITICAL;

    const eRisk = (expiryRiskLevel || "low").toLowerCase();
    if (eRisk === "high" || eRisk === "critical") score += SCORING_WEIGHTS.EXPIRY_RISK.HIGH_CRITICAL_EXPIRY;
    else if (eRisk === "medium") score += SCORING_WEIGHTS.EXPIRY_RISK.MEDIUM_EXPIRY;
    else score += SCORING_WEIGHTS.EXPIRY_RISK.LOW_EXPIRY;

    if (distanceKm !== null && !isNaN(distanceKm)) {
      if (distanceKm < 2) score += SCORING_WEIGHTS.DISTANCE.UNDER_2_KM;
      else if (distanceKm < 5) score += SCORING_WEIGHTS.DISTANCE.UNDER_5_KM;
      else if (distanceKm < 10) score += SCORING_WEIGHTS.DISTANCE.UNDER_10_KM;
      else if (distanceKm <= 25) score += SCORING_WEIGHTS.DISTANCE.UNDER_25_KM;
      else score += SCORING_WEIGHTS.DISTANCE.OVER_25_KM;
    }
    return Math.min(100, Math.max(10, Math.round(score * 10) / 10));
  }

  // Phase 5: v2-routes Scoring Model (Total 100 points maximum)
  let score = 0;

  // 1. Compatibility Factor (Max 25)
  if (compatibilityStatus === "Exact Match") {
    score += SCORING_WEIGHTS_V2.COMPATIBILITY.EXACT_MATCH;
  } else if (compatibilityStatus === "Compatible Alternate") {
    score += SCORING_WEIGHTS_V2.COMPATIBILITY.COMPATIBLE_ALTERNATE;
  }

  // 2. Availability Factor (Max 30)
  // Semantics: usable stock = availableUnits (reserved stock is already excluded from availableUnits)
  if (availableUnits >= requiredUnits) {
    score += SCORING_WEIGHTS_V2.AVAILABILITY.FULL_FULFILLMENT_BASE;
    const bufferRatio = availableUnits / Math.max(requiredUnits, 1);
    const bonus = Math.min(SCORING_WEIGHTS_V2.AVAILABILITY.BUFFER_BONUS_MAX, bufferRatio);
    score += bonus;
  } else {
    // Partial fulfillment
    const ratio = Math.max(0, availableUnits) / Math.max(requiredUnits, 1);
    score += ratio * SCORING_WEIGHTS_V2.AVAILABILITY.PARTIAL_MAX;
  }

  // 3. Shortage Risk Factor (Max 15)
  const sRisk = (shortageRiskLevel || "low").toLowerCase();
  if (sRisk === "low") {
    score += SCORING_WEIGHTS_V2.SHORTAGE_RISK.LOW;
  } else if (sRisk === "medium") {
    score += SCORING_WEIGHTS_V2.SHORTAGE_RISK.MEDIUM;
  } else if (sRisk === "high") {
    score += SCORING_WEIGHTS_V2.SHORTAGE_RISK.HIGH;
  } else {
    score += SCORING_WEIGHTS_V2.SHORTAGE_RISK.CRITICAL;
  }

  // 4. Expiry Risk Factor (Max 10)
  const eRisk = (expiryRiskLevel || "low").toLowerCase();
  if (eRisk === "high" || eRisk === "critical") {
    score += SCORING_WEIGHTS_V2.EXPIRY_RISK.HIGH_CRITICAL_EXPIRY;
  } else if (eRisk === "medium") {
    score += SCORING_WEIGHTS_V2.EXPIRY_RISK.MEDIUM_EXPIRY;
  } else {
    score += SCORING_WEIGHTS_V2.EXPIRY_RISK.LOW_EXPIRY;
  }

  // 5. Road Distance / Travel Time (Transport) Factor (Max 20)
  if (durationMinutes !== null && !isNaN(durationMinutes) && durationMinutes > 0) {
    // Primary: Routes API actual duration
    if (durationMinutes <= 10) {
      score += SCORING_WEIGHTS_V2.TRANSPORT_TIME.UNDER_10_MIN;
    } else if (durationMinutes <= 20) {
      score += SCORING_WEIGHTS_V2.TRANSPORT_TIME.UNDER_20_MIN;
    } else if (durationMinutes <= 35) {
      score += SCORING_WEIGHTS_V2.TRANSPORT_TIME.UNDER_35_MIN;
    } else if (durationMinutes <= 60) {
      score += SCORING_WEIGHTS_V2.TRANSPORT_TIME.UNDER_60_MIN;
    } else {
      score += SCORING_WEIGHTS_V2.TRANSPORT_TIME.OVER_60_MIN;
    }
  } else {
    // Fallback: Road distance if available, otherwise Haversine distance
    const effectiveDistance = roadDistanceKm ?? distanceKm;
    if (effectiveDistance !== null && !isNaN(effectiveDistance)) {
      if (effectiveDistance < 5) {
        score += SCORING_WEIGHTS_V2.TRANSPORT_DISTANCE_FALLBACK.UNDER_5_KM;
      } else if (effectiveDistance < 10) {
        score += SCORING_WEIGHTS_V2.TRANSPORT_DISTANCE_FALLBACK.UNDER_10_KM;
      } else if (effectiveDistance < 25) {
        score += SCORING_WEIGHTS_V2.TRANSPORT_DISTANCE_FALLBACK.UNDER_25_KM;
      } else if (effectiveDistance < 50) {
        score += SCORING_WEIGHTS_V2.TRANSPORT_DISTANCE_FALLBACK.UNDER_50_KM;
      } else {
        score += SCORING_WEIGHTS_V2.TRANSPORT_DISTANCE_FALLBACK.OVER_50_KM;
      }
    } else {
      score += SCORING_WEIGHTS_V2.TRANSPORT_DISTANCE_FALLBACK.UNVERIFIED_COORDS;
    }
  }

  return Math.min(100, Math.max(10, Math.round(score * 10) / 10));
}

/**
 * Determines clinical priority tag based on score and urgency.
 */
export function determinePriority(score, urgency = "Medium") {
  const urg = (urgency || "").toLowerCase();
  if (urg === "critical" || score >= 90) return "Critical";
  if (urg === "high" || score >= 75) return "High";
  if (score >= 60) return "Medium";
  return "Low";
}

/**
 * Generates transparent, human-readable clinical reason explaining WHY a source is recommended.
 * Distinguishes road distance & travel time from straight-line Haversine distance.
 */
export function generateRecommendationReason({
  facilityName,
  sourceBloodGroup,
  recipientBloodGroup,
  compatibilityStatus,
  availableUnits,
  requiredUnits,
  shortageRiskLevel,
  expiryRiskLevel,
  distanceKm,
  roadDistanceKm = null,
  durationMinutes = null,
  durationText = null,
  routeStatus = null,
}) {
  const parts = [];

  // Compatibility detail
  if (compatibilityStatus === "Exact Match") {
    parts.push(`Exact blood group match (${recipientBloodGroup}).`);
  } else {
    parts.push(`Clinically compatible donor group (${sourceBloodGroup}) for ${recipientBloodGroup} recipient.`);
  }

  // Availability & sufficiency detail
  if (availableUnits >= requiredUnits) {
    const postTransferBuffer = availableUnits - requiredUnits;
    parts.push(
      `Source holds ${availableUnits} available units (satisfies ${requiredUnits} needed, preserving safety buffer of ${postTransferBuffer} units).`
    );
  } else {
    const shortfall = requiredUnits - availableUnits;
    parts.push(
      `Partial fulfillment: ${availableUnits} available units (${shortfall} unit shortfall; supplementary sources or donor match required).`
    );
  }

  // Shortage risk detail
  const sRisk = (shortageRiskLevel || "low").toLowerCase();
  if (sRisk === "low") {
    parts.push("Low projected shortage risk at source facility.");
  } else if (sRisk === "medium") {
    parts.push("Moderate source demand forecast; monitor reserve buffer.");
  } else {
    parts.push(`Notice: Source facility has ${shortageRiskLevel} shortage risk; clinical review advised before transfer approval.`);
  }

  // Expiry risk detail
  const eRisk = (expiryRiskLevel || "low").toLowerCase();
  if (eRisk === "high" || eRisk === "critical") {
    parts.push("Priority allocation: Contains near-expiry units suitable for rapid transfusion to prevent wastage.");
  }

  // Phase 5: Road Distance vs Straight-line distance
  if (roadDistanceKm !== null && !isNaN(roadDistanceKm)) {
    const timeDisplay = durationText || (durationMinutes ? `${durationMinutes} min` : null);
    if (timeDisplay) {
      parts.push(`Road distance: ${roadDistanceKm.toFixed(1)} km • Estimated travel time: ${timeDisplay}.`);
    } else {
      parts.push(`Road distance: ${roadDistanceKm.toFixed(1)} km.`);
    }
    if (distanceKm !== null && !isNaN(distanceKm)) {
      parts.push(`(Straight-line: ${formatDistance(distanceKm)}).`);
    }
  } else if (distanceKm !== null && !isNaN(distanceKm)) {
    if (routeStatus === "unavailable") {
      parts.push(`Approx. straight-line distance: ${formatDistance(distanceKm)} (Road route unavailable).`);
    } else {
      parts.push(`Approx. straight-line distance: ${formatDistance(distanceKm)}.`);
    }
  } else {
    parts.push("Geographic distance pending verified coordinates.");
  }

  return parts.join(" ");
}

/**
 * Finds all candidate blood sources for a given blood request.
 * Evaluates compatibility, usable inventory, shortage risk, expiry risk, and straight-line distance.
 *
 * @param {Object} params
 * @param {Object} params.request Blood request object
 * @param {Object} [params.userLocation] Optional user GPS coordinates { latitude, longitude }
 * @param {number} [params.radiusKm=25] Proximity boundary radius in kilometers
 * @param {Array} [params.customFacilities] Optional additional facilities
 * @returns {Promise<{candidates: Array, resultState: string, message: string}>}
 */
export async function findSourceCandidates({
  request,
  userLocation = null,
  radiusKm = DEFAULT_NEARBY_RADIUS_KM,
  customFacilities = [],
}) {
  if (!request) {
    return {
      candidates: [],
      resultState: "NO_REQUEST",
      message: "No blood request provided.",
    };
  }

  const recipientBloodGroup = request.group || request.bloodGroup || request.blood_group || "O+";
  const requiredUnits = parseUnitsNeeded(request.units || request.unitsNeeded || request.units_needed);
  const destinationHospital = (request.hospital || "").trim();

  // 1. Fetch live inventory and verified facility metadata in parallel
  const [allInventory, allShortages, allExpiries] = await Promise.all([
    getBloodInventory({ state: request.state, district: request.district }),
    getShortageRisks(),
    getExpiryRisks(),
  ]);

  const verifiedFacilities = getAllVerifiedFacilities(customFacilities);

  // 2. Identify destination facility coordinates
  let destCoords = null;
  if (destinationHospital) {
    const destFacilityMatch = verifiedFacilities.find(
      (f) => f.name.toLowerCase().includes(destinationHospital.toLowerCase()) ||
             destinationHospital.toLowerCase().includes(f.name.toLowerCase())
    );
    if (destFacilityMatch && destFacilityMatch.latitude != null && destFacilityMatch.longitude != null) {
      destCoords = {
        lat: Number(destFacilityMatch.latitude),
        lng: Number(destFacilityMatch.longitude),
      };
    }
  }

  // Fallback to user location if destination facility coordinates are pending
  const referenceCoords = destCoords || (userLocation?.latitude != null ? { lat: userLocation.latitude, lng: userLocation.longitude } : null);

  // 3. Evaluate each inventory record across all facilities
  const candidateMap = new Map();

  for (const inv of allInventory) {
    const sourceHospital = inv.hospital || inv.facility_name;
    const sourceBloodGroup = inv.group || inv.blood_group;
    // Usable stock = available units (do not subtract reserved units again!)
    const availableUnits = Number(inv.available || inv.available_units || 0);

    // Rule: Exclude the requesting facility itself from source recommendations
    if (destinationHospital && sourceHospital && sourceHospital.toLowerCase() === destinationHospital.toLowerCase()) {
      continue;
    }

    // Rule: Check blood group compatibility strictly
    const compatibilityStatus = checkBloodCompatibility(recipientBloodGroup, sourceBloodGroup);
    if (!compatibilityStatus) {
      continue; // Incompatible — strictly excluded
    }

    // Find facility metadata & coordinates
    const facMetadata = verifiedFacilities.find(
      (f) => f.name.toLowerCase().includes(sourceHospital.toLowerCase()) ||
             sourceHospital.toLowerCase().includes(f.name.toLowerCase())
    );

    const hasCoords = facMetadata && facMetadata.latitude != null && facMetadata.longitude != null;
    let distanceKm = null;

    if (hasCoords && referenceCoords) {
      distanceKm = calculateHaversineDistance(
        referenceCoords.lat,
        referenceCoords.lng,
        facMetadata.latitude,
        facMetadata.longitude
      );
    }

    // Filter by radius if coordinates exist
    if (distanceKm !== null && distanceKm > radiusKm) {
      continue; // Beyond radius
    }

    // Shortage risk lookup for this facility + blood group
    const sRiskMatch = allShortages.find(
      (s) =>
        (s.facility_name?.toLowerCase().includes(sourceHospital.toLowerCase()) ||
         sourceHospital.toLowerCase().includes(s.facility_name?.toLowerCase())) &&
        s.blood_group === sourceBloodGroup
    );
    const shortageRiskScore = sRiskMatch ? sRiskMatch.risk_score : 10;
    const shortageRiskLevel = sRiskMatch ? sRiskMatch.risk_level : "Low";
    const shortageUnits = sRiskMatch ? sRiskMatch.shortage_units : 0;

    // Expiry risk lookup for this facility + blood group
    const eRiskMatch = allExpiries.find(
      (e) =>
        (e.facility_name?.toLowerCase().includes(sourceHospital.toLowerCase()) ||
         sourceHospital.toLowerCase().includes(e.facility_name?.toLowerCase())) &&
        e.blood_group === sourceBloodGroup
    );
    const expiryRiskScore = eRiskMatch ? eRiskMatch.risk_score : 15;
    const expiryRiskLevel = eRiskMatch ? eRiskMatch.risk_level : "Low";

    // Recommendation score calculation
    const recommendationScore = calculateRecommendationScore({
      compatibilityStatus,
      availableUnits,
      requiredUnits,
      shortageRiskLevel,
      expiryRiskLevel,
      distanceKm,
    });

    const priority = determinePriority(recommendationScore, request.urgency);

    const reason = generateRecommendationReason({
      facilityName: sourceHospital,
      sourceBloodGroup,
      recipientBloodGroup,
      compatibilityStatus,
      availableUnits,
      requiredUnits,
      shortageRiskLevel,
      expiryRiskLevel,
      distanceKm,
    });

    const candidateId = `cand-${(sourceHospital || "fac").replace(/\s+/g, "").toLowerCase()}-${sourceBloodGroup}`;

    const candidate = {
      candidateId,
      facilityId: facMetadata?.id || `fac-${sourceHospital.replace(/\s+/g, "")}`,
      facilityName: sourceHospital,
      facilityType: facMetadata?.type || "Hospital",
      state: facMetadata?.state || request.state || "Tamil Nadu",
      district: facMetadata?.district || request.district || "Tiruchirappalli",
      latitude: facMetadata?.latitude || null,
      longitude: facMetadata?.longitude || null,
      hasCoordinates: hasCoords,
      bloodGroup: sourceBloodGroup,
      recipientBloodGroup,
      availableUnits,
      requiredUnits,
      shortageUnits,
      canFulfill: availableUnits >= requiredUnits,
      compatibilityStatus,
      shortageRiskScore,
      shortageRiskLevel,
      expiryRiskScore,
      expiryRiskLevel,
      distanceKm,
      distanceDisplay: formatDistance(distanceKm),
      costPerUnit: inv.cost_per_unit != null ? Number(inv.cost_per_unit) : 1400,
      totalEstimatedCost: (inv.cost_per_unit != null ? Number(inv.cost_per_unit) : 1400) * requiredUnits,
      recommendationScore,
      priority,
      reason,
      status: "Pending", // Advisory only; awaits human review
    };

    // If multiple batches exist for the same facility + blood group, retain highest scoring
    if (!candidateMap.has(candidateId) || candidateMap.get(candidateId).recommendationScore < recommendationScore) {
      candidateMap.set(candidateId, candidate);
    }
  }

  const candidates = Array.from(candidateMap.values());

  // Sort candidates by initial recommendation score descending, then by distance ascending
  candidates.sort((a, b) => {
    if (b.recommendationScore !== a.recommendationScore) {
      return b.recommendationScore - a.recommendationScore;
    }
    if (a.distanceKm !== null && b.distanceKm !== null) {
      return a.distanceKm - b.distanceKm;
    }
    return 0;
  });

  // Determine Result States according to Step 18
  if (candidates.length === 0) {
    const anyVerifiedNearby = verifiedFacilities.some((f) => f.hasCoordinates);
    if (!anyVerifiedNearby && !destCoords) {
      return {
        candidates: [],
        origin: referenceCoords,
        originFacilityName: destCoords ? destinationHospital : (userLocation ? "User GPS Location" : null),
        originType: destCoords ? "facility" : (userLocation ? "user_gps" : null),
        resultState: "NO_VERIFIED_COORDINATES",
        message: "No geographically verified sources available.",
      };
    }
    return {
      candidates: [],
      origin: referenceCoords,
      originFacilityName: destCoords ? destinationHospital : (userLocation ? "User GPS Location" : null),
      originType: destCoords ? "facility" : (userLocation ? "user_gps" : null),
      resultState: "NO_COMPATIBLE_NEARBY",
      message: `No compatible blood source found within the selected ${radiusKm} km radius.`,
    };
  }

  // ====================================================================
  // PHASE 5: GOOGLE ROUTES API ROAD DISTANCE + TRAVEL TIME INTEGRATION
  //
  // Security & Performance:
  // - Priority 1: Requesting Facility Coordinates (destCoords)
  // - Priority 2: User GPS Coordinates (userLocation)
  // - Shortlist top candidates first (default MAX_ROUTE_CANDIDATES = 5)
  // - NEVER call Routes API for all facilities
  // - Gracefully fall back to Haversine if Routes API fails or key is missing
  // ====================================================================
  let finalCandidates = candidates;
  const routeOrigin = referenceCoords; // destCoords ?? userLocation
  const maxRouteCandidates = Math.min(candidates.length, MAX_ROUTE_CANDIDATES);

  if (routeOrigin && routeOrigin.lat != null && routeOrigin.lng != null && candidates.length > 0) {
    const shortlist = candidates.slice(0, maxRouteCandidates);
    const remainder = candidates.slice(maxRouteCandidates);

    // Call getBatchRoutes only for top shortlist with verified coordinates
    const routedShortlist = await getBatchRoutes(
      { lat: routeOrigin.lat, lng: routeOrigin.lng },
      shortlist,
      { maxCandidates: maxRouteCandidates }
    );

    // Re-evaluate candidate scores, priorities, and reasons using Phase 5 v2-routes model
    const reEvaluatedShortlist = routedShortlist.map((cand) => {
      const roadDist = cand.roadDistanceKm != null ? cand.roadDistanceKm : null;
      const durationMins = cand.durationMinutes != null ? cand.durationMinutes : null;

      const updatedScore = calculateRecommendationScore({
        compatibilityStatus: cand.compatibilityStatus,
        availableUnits: cand.availableUnits,
        requiredUnits: cand.requiredUnits,
        shortageRiskLevel: cand.shortageRiskLevel,
        expiryRiskLevel: cand.expiryRiskLevel,
        distanceKm: cand.distanceKm,
        roadDistanceKm: roadDist,
        durationMinutes: durationMins,
        scoreVersion: SCORE_VERSION,
      });

      const updatedPriority = determinePriority(updatedScore, request.urgency);

      const updatedReason = generateRecommendationReason({
        facilityName: cand.facilityName,
        sourceBloodGroup: cand.bloodGroup,
        recipientBloodGroup: cand.recipientBloodGroup,
        compatibilityStatus: cand.compatibilityStatus,
        availableUnits: cand.availableUnits,
        requiredUnits: cand.requiredUnits,
        shortageRiskLevel: cand.shortageRiskLevel,
        expiryRiskLevel: cand.expiryRiskLevel,
        distanceKm: cand.distanceKm,
        roadDistanceKm: roadDist,
        durationMinutes: durationMins,
        durationText: cand.durationText,
        routeStatus: cand.routeStatus,
      });

      return {
        ...cand,
        recommendationScore: updatedScore,
        priority: updatedPriority,
        reason: updatedReason,
      };
    });

    // Re-sort the shortlist by updated score descending, then distance ascending
    reEvaluatedShortlist.sort((a, b) => {
      if (b.recommendationScore !== a.recommendationScore) {
        return b.recommendationScore - a.recommendationScore;
      }
      const distA = a.roadDistanceKm ?? a.distanceKm ?? 999;
      const distB = b.roadDistanceKm ?? b.distanceKm ?? 999;
      return distA - distB;
    });

    finalCandidates = [...reEvaluatedShortlist, ...remainder];
  }

  const anyCanFulfill = finalCandidates.some((c) => c.canFulfill);
  if (!anyCanFulfill) {
    return {
      candidates: finalCandidates,
      origin: routeOrigin ? { latitude: routeOrigin.lat, longitude: routeOrigin.lng } : null,
      originFacilityName: destCoords ? destinationHospital : (userLocation ? "User GPS Location" : null),
      originType: destCoords ? "facility" : (userLocation ? "user_gps" : null),
      resultState: "INSUFFICIENT_QUANTITY",
      message: "Compatible sources found, but available units are insufficient.",
    };
  }

  return {
    candidates: finalCandidates,
    origin: routeOrigin ? { latitude: routeOrigin.lat, longitude: routeOrigin.lng } : null,
    originFacilityName: destCoords ? destinationHospital : (userLocation ? "User GPS Location" : null),
    originType: destCoords ? "facility" : (userLocation ? "user_gps" : null),
    resultState: "SUITABLE_FOUND",
    message: "Suitable sources found",
  };
}

/**
 * Retrieves existing active recommendations for a request from Supabase or localStorage.
 * Prevents duplicate insertions.
 */
export async function getExistingRecommendationsForRequest(requestId) {
  if (!requestId) return [];

  // 1. Try Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("ai_recommendations")
        .select(`
          id,
          request_id,
          source_facility_id,
          destination_facility_id,
          blood_group,
          recommended_units,
          compatibility_status,
          shortage_risk_score,
          expiry_risk_score,
          distance_km,
          estimated_transport_minutes,
          recommendation_score,
          priority,
          recommendation_reason,
          recommendation_type,
          status,
          source:source_facility_id(name, facility_type, district, latitude, longitude),
          destination:destination_facility_id(name)
        `)
        .eq("request_id", requestId)
        .order("recommendation_score", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((d) => {
          const distVal = d.distance_km != null ? Number(d.distance_km) : null;
          const durVal = d.estimated_transport_minutes != null ? Number(d.estimated_transport_minutes) : null;
          return {
            id: d.id,
            requestId: d.request_id,
            facilityId: d.source_facility_id,
            facilityName: d.source?.name || "Source Facility",
            facilityType: d.source?.facility_type || "Hospital",
            latitude: d.source?.latitude || null,
            longitude: d.source?.longitude || null,
            hasCoordinates: d.source?.latitude != null && d.source?.longitude != null,
            bloodGroup: d.blood_group,
            recommendedUnits: d.recommended_units,
            compatibilityStatus: d.compatibility_status,
            shortageRiskScore: Number(d.shortage_risk_score),
            expiryRiskScore: Number(d.expiry_risk_score),
            distanceKm: distVal,
            distanceDisplay: formatDistance(distVal),
            roadDistanceKm: durVal ? distVal : null,
            roadDistanceDisplay: durVal && distVal ? `${distVal.toFixed(1)} km` : null,
            durationMinutes: durVal,
            durationText: durVal ? `${durVal} min` : "Road route unavailable",
            costPerUnit: d.cost_per_unit != null ? Number(d.cost_per_unit) : 1400,
            totalEstimatedCost: (d.cost_per_unit != null ? Number(d.cost_per_unit) : 1400) * Number(d.recommended_units || 1),
            recommendationScore: Number(d.recommendation_score),
            priority: d.priority,
            reason: d.recommendation_reason,
            status: d.status || "Pending",
          };
        });
      }
    } catch (err) {
      console.warn("Supabase query existing recommendations error:", err);
    }
  }

  // 2. Try localStorage / memory storage fallback
  try {
    const local = safeGetStorage("bloodchain_ai_recommendations");
    if (local) {
      const parsed = JSON.parse(local);
      const matches = parsed.filter((r) => r.requestId === requestId || r.request_id === requestId);
      if (matches.length > 0) return matches;
    }
  } catch (e) {
    // Ignore storage parse error
  }

  return [];
}

/**
 * Generates and idempotently saves advisory AI recommendations for a blood request.
 * Strictly READ-ONLY with respect to inventory (zero stock deduction, zero auto-transfer).
 *
 * @param {Object} request Blood request object
 * @param {Object} [options]
 * @param {boolean} [options.forceRegenerate=false] Whether to re-run generation
 * @returns {Promise<{success: boolean, candidates: Array, message: string, fromCache: boolean, origin: Object}>}
 */
export async function generateAndSaveRecommendationsForRequest(request, options = {}) {
  if (!request || !request.id) {
    return {
      success: false,
      candidates: [],
      origin: null,
      message: "Valid request with ID is required to generate recommendations.",
      fromCache: false,
    };
  }

  const { forceRegenerate = false, userLocation = null, radiusKm = DEFAULT_NEARBY_RADIUS_KM } = options;

  // Step 1: Check for existing recommendations (Duplicate Prevention)
  if (!forceRegenerate) {
    const existing = await getExistingRecommendationsForRequest(request.id);
    if (existing.length > 0) {
      return {
        success: true,
        candidates: existing,
        origin: null,
        message: "Loaded existing AI source recommendations.",
        fromCache: true,
      };
    }
  }

  // Step 2: Compute candidate recommendations
  const { candidates, origin, originType, originFacilityName, resultState, message } = await findSourceCandidates({
    request,
    userLocation,
    radiusKm,
  });

  if (candidates.length === 0) {
    return {
      success: false,
      candidates: [],
      origin,
      originType,
      originFacilityName,
      resultState,
      message,
      fromCache: false,
    };
  }

  // Step 3: Persist top recommendations into Supabase ai_recommendations if configured
  const topCandidates = candidates.slice(0, 5); // Store top 5 recommendations

  if (isSupabaseConfigured() && supabase) {
    try {
      // Find facility UUIDs if available
      const { data: dbFacs } = await supabase.from("facilities").select("id, name");
      const facMap = new Map();
      if (dbFacs) {
        dbFacs.forEach((f) => facMap.set(f.name.toLowerCase(), f.id));
      }

      const destFacId = request.hospital ? facMap.get(request.hospital.toLowerCase()) : null;

      const rowsToInsert = topCandidates.map((c) => {
        const srcFacId = facMap.get(c.facilityName.toLowerCase());
        // Phase 5: distance_km is road distance if route succeeded, else straight-line distance
        const finalDistanceKm = c.roadDistanceKm != null ? c.roadDistanceKm : c.distanceKm;
        // Phase 5: estimated_transport_minutes is actual Routes API duration in minutes, else NULL
        const finalTransportMins = c.durationMinutes != null ? c.durationMinutes : null;

        return {
          request_id: request.id,
          source_facility_id: srcFacId || null,
          destination_facility_id: destFacId || null,
          blood_group: c.bloodGroup,
          recommended_units: c.canFulfill ? c.requiredUnits : c.availableUnits,
          compatibility_status: c.compatibilityStatus,
          shortage_risk_score: c.shortageRiskScore,
          expiry_risk_score: c.expiryRiskScore,
          distance_km: finalDistanceKm,
          estimated_transport_minutes: finalTransportMins,
          recommendation_score: c.recommendationScore,
          priority: c.priority,
          recommendation_reason: c.reason,
          recommendation_type: "TRANSFER",
          status: "Pending", // Advisory only; awaits human review
        };
      });

      // Filter out rows without source_facility_id if DB has foreign key constraint
      const validRows = rowsToInsert.filter((r) => r.source_facility_id);
      if (validRows.length > 0) {
        const { error: insertErr } = await supabase.from("ai_recommendations").insert(validRows);
        if (insertErr) {
          console.warn("Notice: Supabase insert ai_recommendations warning:", insertErr.message);
        }
      }
    } catch (e) {
      console.warn("Supabase recommendation persistence exception:", e);
    }
  }

  // Always cache in localStorage / memory storage for fast UI retrieval
  try {
    const local = safeGetStorage("bloodchain_ai_recommendations");
    const current = local ? JSON.parse(local) : [];
    // Remove previous entries for this request
    const filtered = current.filter((r) => r.requestId !== request.id);
    const toSave = topCandidates.map((c) => ({
      ...c,
      requestId: request.id,
      patientName: request.patient || request.patientName || "Patient",
      destinationHospital: request.hospital,
      origin,
    }));
    filtered.unshift(...toSave);
    safeSetStorage("bloodchain_ai_recommendations", JSON.stringify(filtered));
  } catch (e) {
    console.error("Local storage error:", e);
  }

  return {
    success: true,
    candidates: topCandidates,
    origin,
    originType,
    originFacilityName,
    resultState,
    message,
    fromCache: false,
  };
}

export default {
  checkBloodCompatibility,
  calculateRecommendationScore,
  generateRecommendationReason,
  findSourceCandidates,
  getExistingRecommendationsForRequest,
  generateAndSaveRecommendationsForRequest,
  BLOOD_COMPATIBILITY_MATRIX,
  SCORING_WEIGHTS,
  SCORING_WEIGHTS_V2,
  SCORE_VERSION,
  MAX_ROUTE_CANDIDATES,
};
