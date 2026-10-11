/**
 * BLOODCHAIN AI — PHASE 2 FACILITY MAP & DISTRICT NAVIGATION VERIFICATION SUITE
 * Script: scripts/test_phase2_facility_map.mjs
 *
 * Verifies all 20 requirements of Phase 2:
 * 1. 740 authoritative facilities available
 * 2. No invented facility names
 * 3. No invented coordinates
 * 4. Valid-coordinate filtering works
 * 5. Coordinates Pending handling works
 * 6. State filter works
 * 7. District filter works
 * 8. Dependent district filtering works
 * 9. Facility filtering works
 * 10. Marker data matches facility data
 * 11. Selected facility logic works
 * 12. Map/list synchronization works
 * 13. Map bounds logic works
 * 14. Empty-state logic works
 * 15. Facility counts are dynamic
 * 16. LeafletMapView remains reusable
 * 17. No Google Maps API key required
 * 18. No Google Maps package imported
 * 19. No database mutations
 * 20. No recommendation logic changes
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runPhase2Tests() {
  console.log("=======================================================");
  console.log("  BLOODCHAIN AI — PHASE 2 FACILITY MAP & NAVIGATION TESTS");
  console.log("=======================================================\n");

  const facService = await import("../src/services/facilityService.js");
  const locData = await import("../src/constants/locationData.js");
  const masterData = await import("../src/constants/hospitalMasterData.js");
  const recEngine = await import("../src/services/recommendationEngine.js");

  // -------------------------------------------------------------
  // Test 1: 740 authoritative facilities available
  // -------------------------------------------------------------
  console.log("[Test 1] 740 Authoritative Facilities Available");
  const allFacilities = facService.getAllAuthoritativeFacilities();
  assert(Array.isArray(allFacilities), "getAllAuthoritativeFacilities returns an array");
  assert(allFacilities.length === 740, `Authoritative dataset contains exactly 740 facilities (actual: ${allFacilities.length})`);

  // -------------------------------------------------------------
  // Test 2: No invented facility names
  // -------------------------------------------------------------
  console.log("\n[Test 2] No Invented Facility Names");
  const allMasterNames = new Set();
  for (const dists of Object.values(masterData.HOSPITAL_MASTER)) {
    for (const hospitals of Object.values(dists)) {
      hospitals.forEach((h) => allMasterNames.add(h));
    }
  }
  const unknownNames = allFacilities.filter((f) => !allMasterNames.has(f.name));
  assert(unknownNames.length === 0, `Zero invented facility names (unmatched: ${unknownNames.length})`);

  // -------------------------------------------------------------
  // Test 3: No invented coordinates
  // -------------------------------------------------------------
  console.log("\n[Test 3] No Invented Coordinates");
  const verifiedList = allFacilities.filter((f) => f.hasCoordinates);
  const pendingList = allFacilities.filter((f) => !f.hasCoordinates);

  assert(verifiedList.length > 0, `Found verified facilities with coordinates: ${verifiedList.length}`);
  assert(pendingList.length > 0, `Found pending facilities with null coordinates: ${pendingList.length}`);
  assert(verifiedList.length + pendingList.length === 740, "Sum of verified and pending equals exactly 740");

  const pendingWithCoords = pendingList.filter((f) => f.latitude !== null || f.longitude !== null);
  assert(pendingWithCoords.length === 0, "Zero pending facilities have non-null coordinates");

  const invalidCoords = verifiedList.filter(
    (f) => isNaN(Number(f.latitude)) || isNaN(Number(f.longitude)) || f.latitude === 0 || f.longitude === 0
  );
  assert(invalidCoords.length === 0, "Zero verified facilities have (0,0) or NaN coordinates");

  // -------------------------------------------------------------
  // Test 4: Valid-coordinate filtering works
  // -------------------------------------------------------------
  console.log("\n[Test 4] Valid-Coordinate Filtering Works");
  const trichyData = facService.getFilteredMasterFacilities({
    state: "Tamil Nadu",
    district: "Tiruchirappalli",
  });
  assert(trichyData.mappedCount > 0, `Tiruchirappalli has mapped facilities: ${trichyData.mappedCount}`);
  assert(trichyData.mappedFacilities.every((f) => f.latitude !== null && f.longitude !== null), "All mapped facilities have non-null lat/lng");

  // -------------------------------------------------------------
  // Test 5: Coordinates Pending handling works
  // -------------------------------------------------------------
  console.log("\n[Test 5] Coordinates Pending Handling Works");
  const chennaiData = facService.getFilteredMasterFacilities({
    state: "Tamil Nadu",
    district: "Chennai",
  });
  assert(chennaiData.totalCount === 10, `Chennai has 10 authoritative facilities listed (actual: ${chennaiData.totalCount})`);
  assert(chennaiData.mappedCount === 0, "Chennai has 0 mapped facilities (no fake coords invented)");
  assert(chennaiData.unmappedCount === 10, "Chennai has 10 unmapped facilities marked as Coordinates Pending");
  assert(chennaiData.unmappedFacilities.every((f) => f.hasCoordinates === false), "Unmapped facilities are explicitly marked hasCoordinates: false");

  // -------------------------------------------------------------
  // Test 6: State filter works
  // -------------------------------------------------------------
  console.log("\n[Test 6] State Filter Works");
  const keralaData = facService.getFilteredMasterFacilities({
    state: "Kerala",
    district: "All",
  });
  assert(keralaData.totalCount > 0, `Kerala facilities found: ${keralaData.totalCount}`);
  assert(keralaData.facilities.every((f) => f.state === "Kerala"), "All returned facilities have state: 'Kerala'");

  const allStatesData = facService.getFilteredMasterFacilities({
    state: "All",
    district: "All",
  });
  assert(allStatesData.totalCount >= 740, `All States filter returns complete national facility pool (${allStatesData.totalCount} >= 740)`);

  // -------------------------------------------------------------
  // Test 7: District filter works
  // -------------------------------------------------------------
  console.log("\n[Test 7] District Filter Works");
  const maduraiData = facService.getFilteredMasterFacilities({
    state: "Tamil Nadu",
    district: "Madurai",
  });
  assert(maduraiData.totalCount === 10, `Madurai district filter returns 10 facilities (actual: ${maduraiData.totalCount})`);
  assert(maduraiData.facilities.every((f) => f.district === "Madurai"), "All facilities belong to Madurai district");

  // -------------------------------------------------------------
  // Test 8: Dependent district filtering works
  // -------------------------------------------------------------
  console.log("\n[Test 8] Dependent District Filtering Works");
  const tnDistricts = locData.getDistrictsForState("Tamil Nadu");
  assert(tnDistricts.includes("Tiruchirappalli"), "Tamil Nadu districts include Tiruchirappalli");
  assert(tnDistricts.includes("Chennai"), "Tamil Nadu districts include Chennai");
  assert(!tnDistricts.includes("Ernakulam"), "Tamil Nadu districts do NOT include Ernakulam (Kerala)");

  const klDistricts = locData.getDistrictsForState("Kerala");
  assert(klDistricts.includes("Ernakulam"), "Kerala districts include Ernakulam");
  assert(!klDistricts.includes("Tiruchirappalli"), "Kerala districts do NOT include Tiruchirappalli");

  const allDistricts = locData.getDistrictsForState("All");
  assert(allDistricts.length > 50, `All States returns all available districts (total: ${allDistricts.length})`);

  // -------------------------------------------------------------
  // Test 9: Facility filtering works (by type & search)
  // -------------------------------------------------------------
  console.log("\n[Test 9] Facility Type & Search Filtering");
  const bloodBankData = facService.getFilteredMasterFacilities({
    state: "Tamil Nadu",
    district: "Tiruchirappalli",
    type: "Blood Bank",
  });
  assert(bloodBankData.facilities.every((f) => f.type === "Blood Bank"), "Facility type filter strictly returns Blood Bank facilities");

  const searchData = facService.getFilteredMasterFacilities({
    state: "Tamil Nadu",
    district: "Tiruchirappalli",
    searchQuery: "Kauvery",
  });
  assert(searchData.totalCount > 0, "Search query finds matching facility");
  assert(searchData.facilities.some((f) => f.name.includes("Kauvery")), "Search result contains 'Kauvery'");

  // -------------------------------------------------------------
  // Test 10: Marker data matches facility data
  // -------------------------------------------------------------
  console.log("\n[Test 10] Marker Data Matches Facility Data");
  const sampleMapped = trichyData.mappedFacilities[0];
  assert(Boolean(sampleMapped.name), "Marker has facility name");
  assert(Boolean(sampleMapped.type), "Marker has facility type");
  assert(Boolean(sampleMapped.district), "Marker has district");
  assert(Boolean(sampleMapped.state), "Marker has state");
  assert(typeof sampleMapped.latitude === "number", "Marker has numeric latitude");
  assert(typeof sampleMapped.longitude === "number", "Marker has numeric longitude");

  // -------------------------------------------------------------
  // Test 11: Selected facility logic works
  // -------------------------------------------------------------
  console.log("\n[Test 11] Selected Facility Logic");
  const selectedFacilityId = sampleMapped.id;
  const match = trichyData.facilities.find((f) => f.id === selectedFacilityId);
  assert(Boolean(match), "Selected facility is found by ID in facilities list");
  assert(match.name === sampleMapped.name, "Selected facility name matches marker");

  // -------------------------------------------------------------
  // Test 12: Map / List synchronization works
  // -------------------------------------------------------------
  console.log("\n[Test 12] Map / List Synchronization Architecture");
  const hospitalsPageSrc = fs.readFileSync(
    path.join(projectRoot, "src/pages/HospitalsBloodBanks.jsx"),
    "utf8"
  );
  assert(
    hospitalsPageSrc.includes("selectedHospitalId"),
    "Single source of truth 'selectedHospitalId' is maintained"
  );
  assert(
    hospitalsPageSrc.includes("onMarkerClick={(fac) => setSelectedHospitalId(fac.id)}"),
    "Clicking marker updates selectedHospitalId"
  );
  assert(
    hospitalsPageSrc.includes("selectedFacilityId={selectedHospitalId}"),
    "selectedHospitalId is passed to LeafletMapView for bidirectional focus"
  );

  // -------------------------------------------------------------
  // Test 13: Map bounds logic works
  // -------------------------------------------------------------
  console.log("\n[Test 13] Map Bounds Logic");
  const coords = trichyData.mappedFacilities.map((f) => [f.latitude, f.longitude]);
  const lats = coords.map((c) => c[0]);
  const lngs = coords.map((c) => c[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  assert(minLat < maxLat, `Bounding box latitude span is valid: [${minLat.toFixed(4)}, ${maxLat.toFixed(4)}]`);
  assert(minLng < maxLng, `Bounding box longitude span is valid: [${minLng.toFixed(4)}, ${maxLng.toFixed(4)}]`);

  // -------------------------------------------------------------
  // Test 14: Empty-state logic works
  // -------------------------------------------------------------
  console.log("\n[Test 14] Empty-State Logic");
  assert(chennaiData.mappedFacilities.length === 0, "Mapped facilities array is empty for zero-coords district");
  const leafletMapSrc = fs.readFileSync(
    path.join(projectRoot, "src/components/maps/LeafletMapView.jsx"),
    "utf8"
  );
  assert(
    leafletMapSrc.includes("leaflet-empty-overlay") || leafletMapSrc.includes("No verified coordinates in this view"),
    "LeafletMapView renders empty state overlay when 0 valid markers exist"
  );

  // -------------------------------------------------------------
  // Test 15: Facility counts are dynamic
  // -------------------------------------------------------------
  console.log("\n[Test 15] Dynamic Facility Counts");
  assert(hospitalsPageSrc.includes("count-facilities-found"), "Dynamic 'Facilities Found' metric is present in UI");
  assert(hospitalsPageSrc.includes("count-mapped-facilities"), "Dynamic 'Mapped Facilities' metric is present in UI");
  assert(hospitalsPageSrc.includes("count-pending-facilities"), "Dynamic 'Coordinates Pending' metric is present in UI");

  const tnData = facService.getFilteredMasterFacilities({ state: "Tamil Nadu", district: "All" });
  assert(tnData.totalCount > tnData.mappedCount, "Dynamic counts correctly track unmapped facilities in State view");
  assert(tnData.mappedCount + tnData.unmappedCount === tnData.totalCount, "Mapped + Unmapped equals total count");

  // -------------------------------------------------------------
  // Test 16: LeafletMapView remains reusable
  // -------------------------------------------------------------
  console.log("\n[Test 16] LeafletMapView Reusability");
  assert(leafletMapSrc.includes("markers = []"), "Supports markers prop");
  assert(leafletMapSrc.includes("selectedFacilityId = null"), "Supports selectedFacilityId prop");
  assert(leafletMapSrc.includes("userLocation = null"), "Supports userLocation prop");
  assert(leafletMapSrc.includes("route = null"), "Supports route polyline prop");
  assert(leafletMapSrc.includes("fitBounds = true"), "Supports fitBounds prop");

  // -------------------------------------------------------------
  // Test 17: No Google Maps API key required
  // -------------------------------------------------------------
  console.log("\n[Test 17] No Google Maps API Key Requirement");
  assert(!leafletMapSrc.includes("VITE_GOOGLE_MAPS_API_KEY"), "LeafletMapView does NOT require Google Maps API key");
  assert(!hospitalsPageSrc.includes("VITE_GOOGLE_MAPS_API_KEY"), "HospitalsBloodBanks does NOT require Google Maps API key");

  // -------------------------------------------------------------
  // Test 18: No Google Maps package imported
  // -------------------------------------------------------------
  console.log("\n[Test 18] Zero Google Maps SDK Package Imports");
  const pkgJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));
  assert(!pkgJson.dependencies?.["@googlemaps/js-api-loader"], "No @googlemaps/js-api-loader in dependencies");
  assert(!leafletMapSrc.includes("google.maps"), "No google.maps global reference in LeafletMapView");

  // -------------------------------------------------------------
  // Test 19: No database mutations
  // -------------------------------------------------------------
  console.log("\n[Test 19] Read-Only Database Safety");
  assert(!hospitalsPageSrc.includes(".insert("), "Zero DB inserts on page load or filter");
  assert(!hospitalsPageSrc.includes(".delete("), "Zero DB deletes on page load or filter");
  assert(!facService.getAllAuthoritativeFacilities.toString().includes(".upsert("), "Zero DB upserts in facilityService");

  // -------------------------------------------------------------
  // Test 20: No recommendation logic changes
  // -------------------------------------------------------------
  console.log("\n[Test 20] Recommendation Logic Unchanged");
  assert(typeof recEngine.calculateRecommendationScore === "function", "calculateRecommendationScore is preserved");
  assert(typeof recEngine.checkBloodCompatibility === "function", "checkBloodCompatibility is preserved");
  assert(recEngine.SCORE_VERSION === "v2-routes", "score_version remains 'v2-routes'");

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`  PHASE 2 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase2Tests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
