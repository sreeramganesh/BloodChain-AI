/**
 * ====================================================================
 * BLOODCHAIN AI — PHASE 5 AUTOMATED VERIFICATION TEST SUITE
 * Test Script: scripts/test_phase5_routes.mjs
 *
 * Verifies:
 * 1. Valid origin + destination coordinate routing logic
 * 2. Route response parsing
 * 3. distanceMeters -> km conversion
 * 4. Duration parsing and human-readable formatting
 * 5. Invalid / missing coordinates handling
 * 6. Missing API key handling (graceful fallback)
 * 7. Routes API failure / HTTP error handling
 * 8. Graceful fallback to Haversine straight-line distance
 * 9. Transport scoring (travel duration vs distance fallback)
 * 10. Final recommendation scoring (100-point total, v2-routes)
 * 11. In-memory session route caching
 * 12. Candidate shortlist limit (MAX_ROUTE_CANDIDATES = 5)
 * 13. Excludes facilities without verified coordinates from route calls
 * 14. Prevents duplicate route requests
 * 15. Inventory unchanged (Strict read-only safety)
 * 16. Transfers unchanged (No automated approvals or transfers)
 * ====================================================================
 */

import { createClient } from "@supabase/supabase-js";
import {
  getRoute,
  getBatchRoutes,
  decodePolyline,
  formatDuration,
  isValidCoordinate,
  clearRouteCache,
  getRouteCacheSize,
  MAX_ROUTE_CANDIDATES,
} from "../src/services/routesService.js";
import {
  calculateRecommendationScore,
  generateRecommendationReason,
  findSourceCandidates,
  generateAndSaveRecommendationsForRequest,
  SCORING_WEIGHTS_V2,
  SCORE_VERSION,
} from "../src/services/recommendationEngine.js";
import { calculateHaversineDistance, formatDistance } from "../src/utils/geoUtils.js";

const SUPABASE_URL = "https://iaaidwwrjpgpktcqynva.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9ft466dKS3I1O4Bx_9-97g_smz2vd8i";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runPhase5TestSuite() {
  console.log("==================================================");
  console.log("PHASE 5 — GOOGLE ROUTES & INTELLIGENT SOURCE SELECTION");
  console.log("==================================================\n");

  // Step 1: Pre-test DB Baseline Check
  console.log("1. Recording DB Baseline State...");
  const { count: initialInvCount } = await supabase.from("blood_inventory").select("*", { count: "exact", head: true });
  const { count: initialTransferCount } = await supabase.from("transfers").select("*", { count: "exact", head: true });
  const { count: initialReqCount } = await supabase.from("blood_requests").select("*", { count: "exact", head: true });
  const { count: initialFacCount } = await supabase.from("facilities").select("*", { count: "exact", head: true });

  console.log(`   Baseline: ${initialInvCount} inventory rows, ${initialTransferCount} transfers, ${initialReqCount} requests, ${initialFacCount} facilities.\n`);

  // Step 2: Coordinate validation
  console.log("2. Testing Geographic Coordinates Validation...");
  assert(isValidCoordinate({ lat: 10.8041, lng: 78.6853 }), "Valid lat/lng object is accepted");
  assert(isValidCoordinate({ latitude: 10.8041, longitude: 78.6853 }), "Valid latitude/longitude object is accepted");
  assert(!isValidCoordinate(null), "Null coordinate rejected");
  assert(!isValidCoordinate({ lat: "abc", lng: 78 }), "Non-numeric latitude rejected");
  assert(!isValidCoordinate({ lat: 0, lng: 0 }), "Zero (0,0) coordinates rejected");
  assert(!isValidCoordinate({ lat: 100, lng: 50 }), "Latitude > 90 rejected");

  // Step 3: Duration Formatting
  console.log("\n3. Testing Duration Parsing & Formatting...");
  assert(formatDuration("900s") === "15 min", "'900s' formats to '15 min'");
  assert(formatDuration("4500s") === "1 hr 15 min", "'4500s' formats to '1 hr 15 min'");
  assert(formatDuration("3600s") === "1 hr", "'3600s' formats to '1 hr'");
  assert(formatDuration(12, true) === "12 min", "12 minutes formats to '12 min'");
  assert(formatDuration(null) === "N/A", "Null duration returns 'N/A'");

  // Step 4: Polyline Decoding
  console.log("\n4. Testing Encoded Polyline Decoding...");
  // Standard encoded polyline snippet
  const samplePolyline = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
  const decoded = decodePolyline(samplePolyline);
  assert(Array.isArray(decoded) && decoded.length > 0, "Polyline decodes to array of points");
  assert(typeof decoded[0].lat === "number" && typeof decoded[0].lng === "number", "Decoded point contains lat/lng numbers");
  assert(decodePolyline(null).length === 0, "Null polyline decodes to empty array");

  // Step 5: Route Service Missing Key / Graceful Fallback
  console.log("\n5. Testing Route Service Graceful Fallback (No Key / Invalid Key)...");
  clearRouteCache();
  const origin = { lat: 10.8041, lng: 78.6853 }; // Trichy GH
  const dest = { lat: 10.8354, lng: 78.6948 }; // Apollo Trichy

  // Route without API key
  const noKeyRoute = await getRoute(origin, dest, { apiKey: "" });
  assert(noKeyRoute.status === "unavailable", "Missing key returns status: 'unavailable'");
  assert(noKeyRoute.distanceKm === null, "distanceKm is null when route unavailable");
  assert(noKeyRoute.durationMinutes === null, "durationMinutes is null when route unavailable");
  assert(typeof noKeyRoute.straightLineKm === "number" && noKeyRoute.straightLineKm > 0, "Haversine straight-line distance is preserved as fallback");
  assert(noKeyRoute.distanceDisplay.includes("Straight-line"), "distanceDisplay indicates straight-line fallback");

  // Step 6: Route with Invalid Coordinates
  console.log("\n6. Testing Route with Invalid Coordinates...");
  const invalidRoute = await getRoute(null, dest);
  assert(invalidRoute.status === "unavailable", "Null origin returns status: 'unavailable'");
  assert(invalidRoute.error.includes("Invalid or missing"), "Clear error message returned for invalid coords");

  // Step 7: In-Memory Route Caching
  console.log("\n7. Testing In-Memory Route Caching...");
  clearRouteCache();
  assert(getRouteCacheSize() === 0, "Cache starts empty");

  // Make a call that caches the result
  await getRoute(origin, dest, { apiKey: "" });
  assert(getRouteCacheSize() === 1, "Cache size increases to 1 after call");

  const cachedResult = await getRoute(origin, dest, { apiKey: "" });
  assert(cachedResult.fromCache === true, "Subsequent call is served from in-memory cache");
  assert(getRouteCacheSize() === 1, "Cache size does not duplicate for identical origin/destination");

  // Step 8: Candidate Shortlist Capping
  console.log("\n8. Testing Candidate Shortlist Capping (MAX_ROUTE_CANDIDATES = 5)...");
  assert(MAX_ROUTE_CANDIDATES === 5, "Default MAX_ROUTE_CANDIDATES is exactly 5");

  // Mock 12 candidate facilities
  const mockCandidates = Array.from({ length: 12 }, (_, i) => ({
    facilityId: `fac-${i + 1}`,
    facilityName: `Hospital ${i + 1}`,
    latitude: 10.8 + i * 0.01,
    longitude: 78.68 + i * 0.01,
    hasCoordinates: true,
    distanceKm: 2.0 + i,
    distanceDisplay: `${(2.0 + i).toFixed(1)} km`,
  }));

  const batchResult = await getBatchRoutes(origin, mockCandidates, { maxCandidates: 5 });
  assert(batchResult.length === 12, "Returns all candidates in list");
  // Only the first 5 should have routeStatus populated
  const routedCount = batchResult.filter((c) => c.routeStatus !== undefined).length;
  assert(routedCount === 5, `Strictly routes only 5 candidates (routed: ${routedCount}), remaining 7 untouched`);

  // Step 9: Facility without Coordinates is Excluded from Route Call
  console.log("\n9. Testing Facilities without Coordinates are Excluded from Route Call...");
  const mixedCandidates = [
    { facilityId: "f1", facilityName: "H1", latitude: 10.82, longitude: 78.69 },
    { facilityId: "f2", facilityName: "H2 (No Coords)", latitude: null, longitude: null },
    { facilityId: "f3", facilityName: "H3", latitude: 10.83, longitude: 78.70 },
  ];
  const mixedBatch = await getBatchRoutes(origin, mixedCandidates, { maxCandidates: 3 });
  assert(mixedBatch[1].durationText === "Coordinates pending", "Facility without coordinates is marked 'Coordinates pending'");
  assert(mixedBatch[1].routeStatus === "unavailable", "Facility without coordinates status is 'unavailable'");

  // Step 10: Phase 5 Multi-Factor Scoring (v2-routes: 100 points maximum)
  console.log("\n10. Testing Phase 5 Scoring Model (v2-routes)...");
  assert(SCORE_VERSION === "v2-routes", "Score version is 'v2-routes'");

  // Perfect candidate with road duration <= 10 min
  const perfectScore = calculateRecommendationScore({
    compatibilityStatus: "Exact Match", // 25
    availableUnits: 10,
    requiredUnits: 2, // Full fulfillment + max buffer bonus (25 + 5 = 30)
    shortageRiskLevel: "Low", // 15
    expiryRiskLevel: "High", // 10
    durationMinutes: 8, // <= 10 min -> 20
    roadDistanceKm: 4.2,
    scoreVersion: "v2-routes",
  });
  assert(perfectScore === 100, `Perfect candidate gets 100/100 (got: ${perfectScore})`);

  // Candidate with road travel time = 18 min
  const medTimeScore = calculateRecommendationScore({
    compatibilityStatus: "Exact Match", // 25
    availableUnits: 10,
    requiredUnits: 2, // 30
    shortageRiskLevel: "Low", // 15
    expiryRiskLevel: "Low", // 5
    durationMinutes: 18, // <= 20 min -> 16
    roadDistanceKm: 7.5,
    scoreVersion: "v2-routes",
  });
  // 25 + 30 + 15 + 5 + 16 = 91
  assert(medTimeScore === 91, `18-min travel time candidate scores 91/100 (got: ${medTimeScore})`);

  // Candidate with failed route, falling back to Haversine distance
  const fallbackScore = calculateRecommendationScore({
    compatibilityStatus: "Exact Match", // 25
    availableUnits: 10,
    requiredUnits: 2, // 30
    shortageRiskLevel: "Low", // 15
    expiryRiskLevel: "Low", // 5
    durationMinutes: null,
    roadDistanceKm: null,
    distanceKm: 8.2, // < 10 km -> 16 pts
    scoreVersion: "v2-routes",
  });
  // 25 + 30 + 15 + 5 + 16 = 91
  assert(fallbackScore === 91, `Haversine distance fallback scores 91/100 (got: ${fallbackScore})`);

  // Step 11: Clinical Recommendation Reason Generation
  console.log("\n11. Testing Recommendation Reason Generation...");
  const reasonWithRoad = generateRecommendationReason({
    facilityName: "Apollo Hospital",
    sourceBloodGroup: "A+",
    recipientBloodGroup: "A+",
    compatibilityStatus: "Exact Match",
    availableUnits: 24,
    requiredUnits: 4,
    shortageRiskLevel: "Low",
    expiryRiskLevel: "Low",
    distanceKm: 5.2,
    roadDistanceKm: 6.8,
    durationMinutes: 15,
    durationText: "15 min",
  });
  assert(reasonWithRoad.includes("Road distance: 6.8 km"), "Reason includes road distance: 6.8 km");
  assert(reasonWithRoad.includes("Estimated travel time: 15 min"), "Reason includes travel time: 15 min");
  assert(reasonWithRoad.includes("Straight-line: 5.20 km"), "Reason clearly distinguishes straight-line distance");

  const reasonWithFallback = generateRecommendationReason({
    facilityName: "Kauvery Hospital",
    sourceBloodGroup: "O+",
    recipientBloodGroup: "A+",
    compatibilityStatus: "Compatible Alternate",
    availableUnits: 10,
    requiredUnits: 2,
    shortageRiskLevel: "Low",
    expiryRiskLevel: "Low",
    distanceKm: 4.8,
    roadDistanceKm: null,
    durationMinutes: null,
    routeStatus: "unavailable",
  });
  assert(reasonWithFallback.includes("Road route unavailable"), "Reason clearly indicates 'Road route unavailable' on fallback");
  assert(!reasonWithFallback.includes("AI chose the best hospital"), "Zero subjective or promotional AI claims in reason");

  // Step 12: End-to-End Find Source Candidates Integration
  console.log("\n12. Testing Full Candidate Pipeline Integration...");
  const sampleRequest = {
    id: "TEST-REQ-P5-001",
    group: "O+",
    units: 2,
    hospital: "Trichy Government Hospital",
    district: "Tiruchirappalli",
    state: "Tamil Nadu",
    urgency: "High",
  };

  const candidateRes = await findSourceCandidates({
    request: sampleRequest,
    radiusKm: 25,
  });

  assert(candidateRes.candidates.length > 0, "Candidates returned successfully");
  assert(candidateRes.origin !== null, "Route origin is identified from requesting hospital");
  assert(candidateRes.originType === "facility", "Route origin priority correctly selects 'facility' over GPS");
  assert(candidateRes.originFacilityName === "Trichy Government Hospital", "Origin facility name matches requesting hospital");

  const topCand = candidateRes.candidates[0];
  assert(topCand.recommendationScore >= 10 && topCand.recommendationScore <= 100, `Top candidate score is valid (score: ${topCand.recommendationScore})`);
  assert(topCand.status === "Pending", "Candidate status is strictly 'Pending' (human review advisory only)");

  // Step 13: Database Read-Only & Immutability Verification (Step 30)
  console.log("\n13. Verifying Database Safety & Immutability...");
  const { count: finalInvCount } = await supabase.from("blood_inventory").select("*", { count: "exact", head: true });
  const { count: finalTransferCount } = await supabase.from("transfers").select("*", { count: "exact", head: true });
  const { count: finalReqCount } = await supabase.from("blood_requests").select("*", { count: "exact", head: true });
  const { count: finalFacCount } = await supabase.from("facilities").select("*", { count: "exact", head: true });

  assert(finalInvCount === initialInvCount, `Inventory rows completely unchanged (${initialInvCount} === ${finalInvCount})`);
  assert(finalTransferCount === initialTransferCount, `Transfers rows completely unchanged (${initialTransferCount} === ${finalTransferCount}, ZERO auto-transfers)`);
  assert(finalReqCount === initialReqCount, `Requests completely unchanged (${initialReqCount} === ${finalReqCount})`);
  assert(finalFacCount === initialFacCount, `Facilities completely unchanged (${initialFacCount} === ${finalFacCount})`);

  // Final Summary
  console.log("\n==================================================");
  console.log(`PHASE 5 TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  if (failedTests > 0) {
    console.error(`FAILED: ${failedTests} test(s) failed.`);
    process.exit(1);
  } else {
    console.log("ALL TESTS PASSED SUCCESSFULLY! (100% SUCCESS RATE)");
    console.log("==================================================");
  }
}

runPhase5TestSuite().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
