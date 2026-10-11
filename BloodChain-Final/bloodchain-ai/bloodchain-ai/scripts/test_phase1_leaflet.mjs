/**
 * BLOODCHAIN AI — PHASE 1 LEAFLET & OPENSTREETMAP VERIFICATION SUITE
 * Script: scripts/test_phase1_leaflet.mjs
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

async function runPhase1Tests() {
  console.log("=======================================================");
  console.log("  BLOODCHAIN AI — PHASE 1 LEAFLET FOUNDATION TESTS");
  console.log("=======================================================\n");

  const pkgJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package.json"), "utf8")
  );

  // 1. Leaflet dependency exists
  console.log("[Test 1] Leaflet Dependency");
  assert(Boolean(pkgJson.dependencies?.leaflet), "leaflet is declared in dependencies");

  // 2. react-leaflet dependency exists
  console.log("\n[Test 2] React-Leaflet Dependency");
  assert(Boolean(pkgJson.dependencies?.["react-leaflet"]), "react-leaflet is declared in dependencies");

  // 3. LeafletMapView exists
  console.log("\n[Test 3] LeafletMapView Component");
  const leafletMapPath = path.join(projectRoot, "src/components/maps/LeafletMapView.jsx");
  assert(fs.existsSync(leafletMapPath), "src/components/maps/LeafletMapView.jsx exists");
  const leafletMapSrc = fs.readFileSync(leafletMapPath, "utf8");
  assert(leafletMapSrc.includes("export default function LeafletMapView"), "exports default LeafletMapView component");

  // 4. Leaflet CSS is imported
  console.log("\n[Test 4] Leaflet CSS Import");
  assert(leafletMapSrc.includes("leaflet/dist/leaflet.css"), "Leaflet CSS is imported in LeafletMapView.jsx");

  // 5. OpenStreetMap tile layer is configured
  console.log("\n[Test 5] OpenStreetMap Tile Layer");
  const mapConstantsPath = path.join(projectRoot, "src/components/maps/mapConstants.js");
  assert(fs.existsSync(mapConstantsPath), "mapConstants.js exists");
  const constantsSrc = fs.readFileSync(mapConstantsPath, "utf8");
  assert(
    constantsSrc.includes("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
    "Tile URL is standard OpenStreetMap tile endpoint"
  );
  assert(leafletMapSrc.includes("TileLayer"), "MapContainer includes TileLayer component");

  // 6. OSM attribution exists
  console.log("\n[Test 6] OSM Attribution");
  assert(
    constantsSrc.includes("OpenStreetMap") && constantsSrc.includes("contributors"),
    "OpenStreetMap attribution is defined with contributors credit"
  );
  assert(leafletMapSrc.includes("attribution={OSM_ATTRIBUTION}"), "TileLayer binds OSM attribution");

  // 7. Google Maps API key is not required by LeafletMapView
  console.log("\n[Test 7] No Google Maps API Key Requirement");
  assert(!leafletMapSrc.includes("VITE_GOOGLE_MAPS_API_KEY"), "LeafletMapView does NOT reference VITE_GOOGLE_MAPS_API_KEY");
  assert(!leafletMapSrc.includes("missing_key"), "LeafletMapView does not enforce Google Maps API key");
  assert(!leafletMapSrc.includes("Google Maps API Key Not Configured"), "No 'Google Maps API Key Not Configured' error banner in LeafletMapView");

  // 8. Existing geoUtils still exists
  console.log("\n[Test 8] Existing geoUtils Preservation");
  const geoUtilsModule = await import("../src/utils/geoUtils.js");
  assert(typeof geoUtilsModule.calculateHaversineDistance === "function", "calculateHaversineDistance is intact");
  assert(typeof geoUtilsModule.formatDistance === "function", "formatDistance is intact");
  assert(typeof geoUtilsModule.findNearbyFacilities === "function", "findNearbyFacilities is intact");

  // 9. Existing geolocationService still exists
  console.log("\n[Test 9] Existing geolocationService Preservation");
  const geoServiceModule = await import("../src/services/geolocationService.js");
  assert(typeof geoServiceModule.getCurrentUserLocation === "function", "getCurrentUserLocation is intact");
  assert(Boolean(geoServiceModule.GEOLOCATION_ERRORS), "GEOLOCATION_ERRORS constant is intact");

  // 10. Existing facility dataset still exists
  console.log("\n[Test 10] 740 Authoritative Facilities Preservation");
  const facServiceModule = await import("../src/services/facilityService.js");
  const allFacilities = facServiceModule.getAllAuthoritativeFacilities();
  assert(Array.isArray(allFacilities), "Authoritative facilities list is an array");
  assert(allFacilities.length === 740, `Authoritative facilities count is exactly 740 (actual: ${allFacilities.length})`);

  // 11. Existing recommendation engine still exists
  console.log("\n[Test 11] Existing Recommendation Engine Preservation");
  const recEngineModule = await import("../src/services/recommendationEngine.js");
  assert(typeof recEngineModule.calculateRecommendationScore === "function", "calculateRecommendationScore is intact");
  assert(typeof recEngineModule.checkBloodCompatibility === "function", "checkBloodCompatibility is intact");
  assert(typeof recEngineModule.findSourceCandidates === "function", "findSourceCandidates is intact");
  assert(recEngineModule.SCORE_VERSION === "v2-routes", "score_version remains 'v2-routes'");

  // 12. Existing routes remain intact
  console.log("\n[Test 12] Existing routesService Preservation (Phase 4 routing prerequisite)");
  const routesServiceModule = await import("../src/services/routesService.js");
  assert(typeof routesServiceModule.getRoute === "function", "getRoute is intact");
  assert(typeof routesServiceModule.getBatchRoutes === "function", "getBatchRoutes is intact");
  assert(typeof routesServiceModule.decodePolyline === "function", "decodePolyline is intact");

  // 13. No Google Maps package remains unnecessarily imported
  console.log("\n[Test 13] Google Maps Package Safely Removed");
  assert(!pkgJson.dependencies?.["@googlemaps/js-api-loader"], "@googlemaps/js-api-loader removed from dependencies");
  assert(!pkgJson.devDependencies?.["@googlemaps/js-api-loader"], "@googlemaps/js-api-loader not in devDependencies");

  // 14. No Google Maps API key is hardcoded
  console.log("\n[Test 14] Zero Hardcoded API Keys");
  const allSrcFiles = [];
  function scanDir(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(full);
      } else if (entry.name.endsWith(".js") || entry.name.endsWith(".jsx")) {
        allSrcFiles.push(full);
      }
    }
  }
  scanDir(path.join(projectRoot, "src"));

  let foundHardcodedKey = false;
  for (const f of allSrcFiles) {
    const content = fs.readFileSync(f, "utf8");
    // Look for AIzaSy... pattern typical of Google API keys
    if (/AIzaSy[0-9A-Za-z-_]{33}/.test(content)) {
      foundHardcodedKey = true;
      console.error(`Found hardcoded key pattern in: ${f}`);
    }
  }
  assert(!foundHardcodedKey, "Zero hardcoded Google API keys in src/");

  // 15. No fake coordinates were introduced
  console.log("\n[Test 15] Coordinates Integrity (No Fake Coordinates)");
  const verifiedFacilities = allFacilities.filter(
    (f) => f.latitude !== null && f.longitude !== null
  );
  const pendingFacilities = allFacilities.filter(
    (f) => f.latitude === null || f.longitude === null
  );
  assert(verifiedFacilities.length + pendingFacilities.length === 740, "Sum of verified and pending equals 740");
  const hasInvalidCoords = verifiedFacilities.some(
    (f) => isNaN(Number(f.latitude)) || isNaN(Number(f.longitude)) || f.latitude === 0 || f.longitude === 0
  );
  assert(!hasInvalidCoords, "Zero (0,0) or invalid non-numeric coordinates in verified facilities");

  // 16. Fallback development center
  console.log("\n[Test 16] Fallback Development Center");
  const { DEFAULT_MAP_CENTER } = await import("../src/components/maps/mapConstants.js");
  assert(DEFAULT_MAP_CENTER.lat === 10.7905, "Default fallback center latitude is 10.7905");
  assert(DEFAULT_MAP_CENTER.lng === 78.7047, "Default fallback center longitude is 78.7047");

  // Summary
  console.log("\n=======================================================");
  console.log(`  PHASE 1 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase1Tests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
