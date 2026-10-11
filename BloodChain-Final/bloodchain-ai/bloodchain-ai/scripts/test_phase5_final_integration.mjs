/**
 * ====================================================================
 * BLOODCHAIN AI — PHASE 5 FINAL MAP INTEGRATION & VERIFICATION SUITE
 * Test Script: scripts/test_phase5_final_integration.mjs
 *
 * Verifies all 27 required architectural and behavioral criteria:
 * 1. Leaflet architecture (LeafletMapView, CSS, React-Leaflet components)
 * 2. OSM tile configuration (OpenStreetMap endpoint + attribution)
 * 3. 740 authoritative facilities dataset integrity
 * 4. State filtering (Tamil Nadu, Kerala, Karnataka, All States)
 * 5. District filtering & dependent district dropdown resolution
 * 6. Coordinates Pending status handling (no fake coordinates plotted)
 * 7. Browser Geolocation service (one-time query, no tracking, error handling)
 * 8. Haversine straight-line distance calculations
 * 9. Radius-based nearby facility filtering & sorting
 * 10. Clinical blood compatibility & donor matching
 * 11. Donor privacy preservation (centroid snapping, no private coords in popups)
 * 12. OSRM road routing service (driving profile, [lng, lat] coordinate order)
 * 13. In-memory session route caching (prevents duplicate requests)
 * 14. Real road distance parsing and formatting
 * 15. Real driving duration parsing & ETA formatting (no synthetic ETA)
 * 16. GeoJSON geometry conversion to Leaflet format
 * 17. Graceful route fallback when route unavailable (preserves straight-line)
 * 18. Blood Request page & modal integration with Leaflet
 * 19. Source selection and route candidate synchronization
 * 20. Map / List bidirectional synchronization
 * 21. Mandatory human review preservation (strictly advisory, no auto-approval)
 * 22. Strict read-only database safety (zero inventory deductions on route/recommend)
 * 23. Zero fake coordinates across national dataset
 * 24. Zero fake ETA claims when road route is unavailable
 * 25. Complete absence of active Google Maps dependencies or required API keys
 * 26. Candidate shortlist capping (MAX_ROUTE_CANDIDATES = 5, no mass routing)
 * 27. Responsive map layout & container properties
 * ====================================================================
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Auto-load environment variables from .env.local or .env if present
for (const envFile of [".env.local", ".env"]) {
  const envPath = path.join(projectRoot, envFile);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedCount++;
  }
}

async function runFinalMapIntegrationTests() {
  console.log("\n=======================================================");
  console.log("  BLOODCHAIN AI — PHASE 5 FINAL MAP INTEGRATION SUITE");
  console.log("=======================================================\n");

  // Load modules
  const {
    DEFAULT_MAP_CENTER,
    OSM_TILE_URL,
    OSM_ATTRIBUTION,
  } = await import("../src/components/maps/mapConstants.js");

  const {
    getAllAuthoritativeFacilities,
    getFilteredMasterFacilities,
    getAllVerifiedFacilities,
    VERIFIED_COORDINATES,
  } = await import("../src/services/facilityService.js");

  const {
    STATES_LIST,
    STATE_DISTRICTS,
    getDistrictsForState,
  } = await import("../src/constants/locationData.js");

  const {
    getCurrentUserLocation,
    GEOLOCATION_ERRORS,
  } = await import("../src/services/geolocationService.js");

  const {
    calculateHaversineDistance,
    formatDistance,
    findNearbyFacilities,
    findNearbyDonors,
    getApproximateDonorCoordinates,
    BLOOD_COMPATIBILITY_TABLE,
    DEFAULT_NEARBY_RADIUS_KM,
    NEARBY_RADIUS_OPTIONS,
  } = await import("../src/utils/geoUtils.js");

  const {
    getRoute,
    getBatchRoutes,
    formatDuration,
    formatRoadDistance,
    isValidCoordinate,
    clearRouteCache,
    getRouteCacheSize,
    isRouteSuccess,
    MAX_ROUTE_CANDIDATES,
  } = await import("../src/services/routesService.js");

  const {
    calculateRecommendationScore,
    findSourceCandidates,
    checkBloodCompatibility,
  } = await import("../src/services/recommendationEngine.js");

  // -------------------------------------------------------------------------
  // 1. LEAFLET ARCHITECTURE
  // -------------------------------------------------------------------------
  console.log("[Section 1] Leaflet Architecture Verification");
  const leafletMapViewPath = path.join(projectRoot, "src/components/maps/LeafletMapView.jsx");
  assert(fs.existsSync(leafletMapViewPath), "LeafletMapView.jsx exists in src/components/maps/");
  const leafletMapCode = fs.readFileSync(leafletMapViewPath, "utf8");
  assert(leafletMapCode.includes("from \"react-leaflet\"") || leafletMapCode.includes("from 'react-leaflet'"), "Imports from react-leaflet");
  assert(leafletMapCode.includes("leaflet/dist/leaflet.css"), "Imports standard leaflet/dist/leaflet.css");
  assert(leafletMapCode.includes("<MapContainer"), "Renders react-leaflet MapContainer");
  assert(leafletMapCode.includes("<TileLayer"), "Renders react-leaflet TileLayer");
  assert(leafletMapCode.includes("<Polyline"), "Supports Polyline rendering for road routing");

  // -------------------------------------------------------------------------
  // 2. OSM TILE CONFIGURATION
  // -------------------------------------------------------------------------
  console.log("\n[Section 2] OpenStreetMap Tile Configuration");
  assert(OSM_TILE_URL === "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", "OSM_TILE_URL points to standard OpenStreetMap tile endpoint");
  assert(OSM_ATTRIBUTION.includes("OpenStreetMap") && OSM_ATTRIBUTION.includes("contributors"), "OSM_ATTRIBUTION provides legally required attribution");
  assert(DEFAULT_MAP_CENTER.lat === 10.7905 && DEFAULT_MAP_CENTER.lng === 78.7047, "Default fallback center is Tiruchirappalli coordinates (10.7905, 78.7047)");

  // -------------------------------------------------------------------------
  // 3. 740 AUTHORITATIVE FACILITY DATASET
  // -------------------------------------------------------------------------
  console.log("\n[Section 3] 740 Authoritative Facility Dataset Integrity");
  const allFacilities = getAllAuthoritativeFacilities();
  assert(Array.isArray(allFacilities), "getAllAuthoritativeFacilities returns an array");
  assert(allFacilities.length === 740, `Authoritative dataset contains exactly 740 facilities (actual: ${allFacilities.length})`);
  assert(allFacilities.every((f) => f.name && f.state && f.district), "All 740 facilities have name, state, and district fields");

  // -------------------------------------------------------------------------
  // 4. STATE FILTERING
  // -------------------------------------------------------------------------
  console.log("\n[Section 4] State Filtering Verification");
  const tnRes = getFilteredMasterFacilities({ state: "Tamil Nadu", district: "All" });
  assert(tnRes.facilities.length > 0 && tnRes.facilities.every((f) => f.state === "Tamil Nadu"), "Tamil Nadu state filter returns only TN facilities");
  const keralaRes = getFilteredMasterFacilities({ state: "Kerala", district: "All" });
  assert(keralaRes.facilities.length === 140, `Kerala state filter returns exactly 140 facilities (actual: ${keralaRes.facilities.length})`);
  const allStatesRes = getFilteredMasterFacilities({ state: "All", district: "All" });
  assert(allStatesRes.facilities.length >= 740, "All States filter returns complete national facility pool");

  // -------------------------------------------------------------------------
  // 5. DISTRICT FILTERING & DEPENDENT DISTRICT LIST
  // -------------------------------------------------------------------------
  console.log("\n[Section 5] District Filtering & Dependent Dropdowns");
  const trichyRes = getFilteredMasterFacilities({ state: "Tamil Nadu", district: "Tiruchirappalli" });
  assert(trichyRes.facilities.length > 0 && trichyRes.facilities.every((f) => f.district === "Tiruchirappalli"), "Trichy district filter strictly matches district");
  const tnDistricts = getDistrictsForState("Tamil Nadu");
  assert(tnDistricts.includes("Tiruchirappalli") && tnDistricts.includes("Chennai"), "Tamil Nadu districts include Trichy and Chennai");
  assert(!tnDistricts.includes("Ernakulam"), "Tamil Nadu districts do not include Kerala districts");
  const keralaDistricts = getDistrictsForState("Kerala");
  assert(keralaDistricts.includes("Ernakulam") && !keralaDistricts.includes("Tiruchirappalli"), "Kerala districts include Ernakulam and exclude Trichy");

  // -------------------------------------------------------------------------
  // 6. COORDINATES PENDING STATUS HANDLING
  // -------------------------------------------------------------------------
  console.log("\n[Section 6] Coordinates Pending Status Handling");
  const verifiedInMaster = allFacilities.filter((f) => f.hasCoordinates);
  const pendingFacilities = allFacilities.filter((f) => !f.hasCoordinates || f.latitude == null || f.longitude == null);
  assert(verifiedInMaster.length + pendingFacilities.length === 740, "Sum of verified and pending facilities equals exactly 740");
  assert(pendingFacilities.every((f) => f.latitude === null && f.longitude === null), "All unverified facilities have strictly null coordinates (no fake markers)");
  assert(pendingFacilities.every((f) => f.hasCoordinates === false), "All unverified facilities explicitly marked hasCoordinates: false");

  // -------------------------------------------------------------------------
  // 7. BROWSER GEOLOCATION SERVICE
  // -------------------------------------------------------------------------
  console.log("\n[Section 7] Browser Geolocation Service");
  assert(typeof getCurrentUserLocation === "function", "getCurrentUserLocation is exported as a function");
  assert(GEOLOCATION_ERRORS.PERMISSION_DENIED === "PERMISSION_DENIED", "GEOLOCATION_ERRORS.PERMISSION_DENIED defined");
  assert(GEOLOCATION_ERRORS.POSITION_UNAVAILABLE === "POSITION_UNAVAILABLE", "GEOLOCATION_ERRORS.POSITION_UNAVAILABLE defined");
  assert(GEOLOCATION_ERRORS.TIMEOUT === "TIMEOUT", "GEOLOCATION_ERRORS.TIMEOUT defined");
  const geoServiceCode = fs.readFileSync(path.join(projectRoot, "src/services/geolocationService.js"), "utf8");
  assert(!geoServiceCode.includes("watchPosition"), "Strictly one-time position query (zero continuous tracking / watchPosition)");

  // -------------------------------------------------------------------------
  // 8. HAVERSINE CALCULATION
  // -------------------------------------------------------------------------
  console.log("\n[Section 8] Haversine Distance Calculation");
  const dSelf = calculateHaversineDistance(10.8041, 78.6853, 10.8041, 78.6853);
  assert(dSelf === 0, "Distance between identical coordinates is 0 km");
  const dTrichySrirangam = calculateHaversineDistance(10.8041, 78.6853, 10.8622, 78.6983);
  assert(dTrichySrirangam >= 6 && dTrichySrirangam <= 8, `Trichy GH to Srirangam distance is ~6-8 km (got: ${dTrichySrirangam.toFixed(2)} km)`);
  const dTrichyChennai = calculateHaversineDistance(10.8041, 78.6853, 13.0827, 80.2707);
  assert(dTrichyChennai >= 290 && dTrichyChennai <= 340, `Trichy to Chennai distance is ~300-330 km (got: ${dTrichyChennai.toFixed(2)} km)`);
  assert(calculateHaversineDistance(null, 78.68, 10.80, 78.69) === null, "Returns null for null coordinate");

  // -------------------------------------------------------------------------
  // 9. RADIUS FILTERING
  // -------------------------------------------------------------------------
  console.log("\n[Section 9] Proximity Radius Filtering");
  assert(DEFAULT_NEARBY_RADIUS_KM === 25, "Default nearby radius is 25 km");
  assert(JSON.stringify(NEARBY_RADIUS_OPTIONS) === "[10,25,50,100]", "Radius options are [10, 25, 50, 100]");
  const trichyLat = 10.8041;
  const trichyLng = 78.6853;
  const nearby10 = findNearbyFacilities({ userLat: trichyLat, userLng: trichyLng, facilities: allFacilities, radiusKm: 10 });
  const nearby50 = findNearbyFacilities({ userLat: trichyLat, userLng: trichyLng, facilities: allFacilities, radiusKm: 50 });
  assert(nearby10.length <= nearby50.length, "Larger radius returns equal or greater facilities count");
  assert(nearby10.every((f) => f.distanceKm <= 10), "All facilities in 10km radius are within 10 km");
  assert(nearby10[0].distanceKm <= nearby10[nearby10.length - 1].distanceKm, "Nearby facilities are sorted nearest-first");

  // -------------------------------------------------------------------------
  // 10. DONOR COMPATIBILITY
  // -------------------------------------------------------------------------
  console.log("\n[Section 10] Clinical Blood Compatibility");
  assert(BLOOD_COMPATIBILITY_TABLE["AB+"].length === 8, "AB+ is universal recipient (accepts all 8 blood groups)");
  assert(BLOOD_COMPATIBILITY_TABLE["O-"].length === 1 && BLOOD_COMPATIBILITY_TABLE["O-"][0] === "O-", "O- recipient only accepts O-");
  for (const [recipient, donors] of Object.entries(BLOOD_COMPATIBILITY_TABLE)) {
    assert(donors.includes("O-"), `${recipient} accepts universal donor O-`);
  }

  // -------------------------------------------------------------------------
  // 11. DONOR PRIVACY PRESERVATION
  // -------------------------------------------------------------------------
  console.log("\n[Section 11] Donor Privacy Preservation");
  const testDonor = { name: "R. Kumar", blood_group: "O+", location: "Thillai Nagar", district: "Tiruchirappalli" };
  const approxCoords = getApproximateDonorCoordinates(testDonor);
  assert(approxCoords !== null && approxCoords.latitude != null, "Resolves approximate locality centroid for donor");
  assert(leafletMapCode.includes("leaflet-donor-popup"), "LeafletMapView has dedicated donor privacy popup structure");
  const findDonorsCode = fs.readFileSync(path.join(projectRoot, "src/pages/FindDonors.jsx"), "utf8");
  assert(
    leafletMapCode.includes("Approx. Area:") ||
    findDonorsCode.includes("Pins show approximate locality only"),
    "Contains privacy notice in donor popup & page"
  );

  // -------------------------------------------------------------------------
  // 12. OSRM ROUTE SERVICE
  // -------------------------------------------------------------------------
  console.log("\n[Section 12] OSRM Road Routing Service");
  const routesServiceCode = fs.readFileSync(path.join(projectRoot, "src/services/routesService.js"), "utf8");
  assert(routesServiceCode.includes("router.project-osrm.org"), "Uses OSRM public demo endpoint");
  assert(routesServiceCode.includes("/route/v1/driving/"), "Uses driving profile");
  assert(routesServiceCode.includes("overview=full&geometries=geojson"), "Requests full GeoJSON geometry");
  assert(routesServiceCode.includes("${oLng.toFixed(6)},${oLat.toFixed(6)}"), "Uses longitude,latitude coordinate order for OSRM URL");

  // -------------------------------------------------------------------------
  // 13. ROUTE CACHE
  // -------------------------------------------------------------------------
  console.log("\n[Section 13] In-Memory Route Cache");
  clearRouteCache();
  assert(getRouteCacheSize() === 0, "Route cache clears cleanly");
  const oTrichy = { lat: 10.8041, lng: 78.6853 };
  const dApollo = { lat: 10.8354, lng: 78.6948 };
  const r1 = await getRoute(oTrichy, dApollo);
  assert(getRouteCacheSize() === 1, "Cache size increases to 1 after computing route");
  const r2 = await getRoute(oTrichy, dApollo);
  assert(r2.fromCache === true, "Subsequent identical route call served from in-memory cache");
  assert(getRouteCacheSize() === 1, "Cache prevents duplicate route entries");

  // -------------------------------------------------------------------------
  // 14. ROUTE DISTANCE
  // -------------------------------------------------------------------------
  console.log("\n[Section 14] Real Road Distance Formatting");
  assert(formatRoadDistance(850) === "850 m", "Formats meters under 1km cleanly (850 m)");
  assert(formatRoadDistance(12400) === "12.4 km", "Formats meters over 1km as kilometers (12.4 km)");
  assert(formatRoadDistance(null) === "N/A", "Returns N/A for null distance");
  if (r1.status === "success") {
    assert(typeof r1.distanceKm === "number" && r1.distanceKm > 0, `Road distance returned from OSRM: ${r1.distanceDisplay}`);
  }

  // -------------------------------------------------------------------------
  // 15. ROUTE DURATION & ETA
  // -------------------------------------------------------------------------
  console.log("\n[Section 15] Driving Duration & ETA Formatting");
  assert(formatDuration(900) === "15 min", "900 seconds formats to '15 min'");
  assert(formatDuration(4500) === "1 hr 15 min", "4500 seconds formats to '1 hr 15 min'");
  assert(formatDuration(7200) === "2 hr", "7200 seconds formats to '2 hr'");
  assert(formatDuration(null) === "N/A", "Null duration formats to 'N/A'");

  // -------------------------------------------------------------------------
  // 16. ROUTE GEOMETRY
  // -------------------------------------------------------------------------
  console.log("\n[Section 16] Route Geometry Conversion for Leaflet");
  if (r1.status === "success" && r1.coordinates?.length > 0) {
    const firstPt = r1.coordinates[0];
    assert(typeof firstPt.lat === "number" && typeof firstPt.lng === "number", "OSRM coordinates converted to Leaflet { lat, lng } format");
    assert(firstPt.lat >= 10 && firstPt.lat <= 11, "Leaflet latitude is in expected Tamil Nadu range");
  } else {
    assert(Array.isArray(r1.coordinates), "Coordinates is an array even on fallback");
  }

  // -------------------------------------------------------------------------
  // 17. ROUTE FALLBACK
  // -------------------------------------------------------------------------
  console.log("\n[Section 17] Graceful Route Fallback");
  const fallbackRoute = await getRoute(oTrichy, dApollo, { bypassCache: true, forceUnavailable: true });
  assert(fallbackRoute.status === "unavailable", "Fallback route status is 'unavailable'");
  assert(fallbackRoute.distanceKm === null, "distanceKm is null when route unavailable");
  assert(fallbackRoute.durationMinutes === null, "durationMinutes is null when route unavailable");
  assert(fallbackRoute.straightLineKm > 0, "Preserves Haversine straight-line distance on fallback");
  assert(fallbackRoute.distanceDisplay.includes("Straight-line"), "Clearly labels fallback distance as 'Straight-line'");

  // -------------------------------------------------------------------------
  // 18. BLOOD REQUEST INTEGRATION
  // -------------------------------------------------------------------------
  console.log("\n[Section 18] Blood Request Integration with Leaflet");
  const bloodReqCode = fs.readFileSync(path.join(projectRoot, "src/pages/BloodRequest.jsx"), "utf8");
  assert(bloodReqCode.includes("import LeafletMapView"), "BloodRequest.jsx imports LeafletMapView");
  assert(bloodReqCode.includes("<LeafletMapView"), "BloodRequest.jsx renders LeafletMapView");
  const modalCode = fs.readFileSync(path.join(projectRoot, "src/components/predictive/RequestRecommendationModal.jsx"), "utf8");
  assert(modalCode.includes("import LeafletMapView"), "RequestRecommendationModal imports LeafletMapView");
  assert(modalCode.includes("activeRoute"), "RequestRecommendationModal tracks activeRoute state");

  // -------------------------------------------------------------------------
  // 19. SOURCE SELECTION & ROUTE SYNC
  // -------------------------------------------------------------------------
  console.log("\n[Section 19] Source Selection & Route Synchronization");
  assert(modalCode.includes("setSelectedCandidate"), "Modal allows user to select recommendation candidate");
  assert(modalCode.includes("setActiveRoute"), "Modal updates activeRoute when candidate selection changes");

  // -------------------------------------------------------------------------
  // 20. MAP / LIST SYNCHRONIZATION
  // -------------------------------------------------------------------------
  console.log("\n[Section 20] Map / List Bidirectional Synchronization");
  assert(leafletMapCode.includes("selectedFacilityId"), "LeafletMapView accepts selectedFacilityId prop");
  assert(leafletMapCode.includes("onMarkerClick"), "LeafletMapView triggers onMarkerClick on marker tap");
  const hospitalsPageCode = fs.readFileSync(path.join(projectRoot, "src/pages/HospitalsBloodBanks.jsx"), "utf8");
  assert(hospitalsPageCode.includes("selectedHospitalId"), "HospitalsBloodBanks maintains selectedHospitalId state");

  // -------------------------------------------------------------------------
  // 21. HUMAN REVIEW PRESERVATION
  // -------------------------------------------------------------------------
  console.log("\n[Section 21] Human Review Mandatory Safeguard");
  const sampleRequest = {
    id: "BRQ001",
    patient: "R. Karthik",
    group: "O+",
    units: 2,
    hospital: "Trichy GH",
    district: "Tiruchirappalli",
    state: "Tamil Nadu",
    urgency: "Critical",
  };
  const candidatesRes = await findSourceCandidates({ request: sampleRequest, radiusKm: 25 });
  assert(candidatesRes.candidates.length > 0, "Found source candidates for blood request");
  assert(candidatesRes.candidates.every((c) => c.status === "Pending"), "All generated recommendations are marked strictly 'Pending' (Human review mandatory)");
  assert(!modalCode.includes("autoApprove"), "No automatic transfer approval in recommendation modal");

  // -------------------------------------------------------------------------
  // 22. INVENTORY READ-ONLY BEHAVIOR
  // -------------------------------------------------------------------------
  console.log("\n[Section 22] Inventory Read-Only Safety");
  const recEngineCode = fs.readFileSync(path.join(projectRoot, "src/services/recommendationEngine.js"), "utf8");
  assert(!recEngineCode.includes(".update(") && !recEngineCode.includes(".delete("), "recommendationEngine contains zero database update/delete calls");
  assert(!routesServiceCode.includes(".update(") && !routesServiceCode.includes(".insert("), "routesService contains zero database writes");

  // -------------------------------------------------------------------------
  // 23. NO FAKE COORDINATES
  // -------------------------------------------------------------------------
  console.log("\n[Section 23] Zero Fake Coordinates Across National Dataset");
  const allVerified = getAllVerifiedFacilities();
  for (const fac of allVerified) {
    const lat = Number(fac.latitude);
    const lng = Number(fac.longitude);
    assert(!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0, `Facility ${fac.name} has valid non-zero coordinates`);
    assert(lat >= 8 && lat <= 38 && lng >= 68 && lng <= 98, `Coordinates for ${fac.name} are within geographic India bounds`);
  }

  // -------------------------------------------------------------------------
  // 24. NO FAKE ETA
  // -------------------------------------------------------------------------
  console.log("\n[Section 24] Zero Fake ETA Claims");
  const invalidOriginRoute = await getRoute(null, dApollo);
  assert(invalidOriginRoute.durationMinutes === null, "Duration minutes is strictly null when origin is invalid");
  assert(invalidOriginRoute.durationText === "N/A" || invalidOriginRoute.durationText === "Road route unavailable", "ETA reports unavailable when coordinates are missing (no synthetic ETA)");

  // -------------------------------------------------------------------------
  // 25. NO GOOGLE MAPS DEPENDENCY
  // -------------------------------------------------------------------------
  console.log("\n[Section 25] Zero Google Maps Dependencies");
  const pkgJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));
  assert(!pkgJson.dependencies["@googlemaps/js-api-loader"], "@googlemaps/js-api-loader not in package dependencies");
  assert(!pkgJson.devDependencies?.["@googlemaps/js-api-loader"], "@googlemaps/js-api-loader not in devDependencies");
  assert(!fs.existsSync(path.join(projectRoot, "src/components/maps/GoogleMapView.jsx")), "Obsolete GoogleMapView.jsx adapter cleanly removed");
  assert(!leafletMapCode.includes("google.maps"), "LeafletMapView has zero google.maps references");

  // -------------------------------------------------------------------------
  // 26. NO MASS ROUTING / OSRM RATE PROTECTION
  // -------------------------------------------------------------------------
  console.log("\n[Section 26] Candidate Shortlist Limit & OSRM Protection");
  assert(MAX_ROUTE_CANDIDATES === 5, "MAX_ROUTE_CANDIDATES is strictly capped at 5");
  const mockCandidates = Array.from({ length: 12 }, (_, i) => ({
    facilityName: `Test Facility ${i + 1}`,
    latitude: 10.8 + i * 0.01,
    longitude: 78.6 + i * 0.01,
  }));
  const batchResult = await getBatchRoutes(oTrichy, mockCandidates);
  const routedCount = batchResult.filter((c) => c.routeStatus === "success" || c.routeStatus === "unavailable").length;
  assert(routedCount <= 5, `Strictly routes maximum 5 candidate facilities (actual routed: ${routedCount})`);

  // -------------------------------------------------------------------------
  // 27. RESPONSIVE MAP BEHAVIOR
  // -------------------------------------------------------------------------
  console.log("\n[Section 27] Responsive Map Behavior");
  assert(leafletMapCode.includes("invalidateSize"), "LeafletMapView includes invalidateSize to prevent grey tiles on resize");
  assert(leafletMapCode.includes("height = \"320px\""), "LeafletMapView accepts responsive height prop");
  assert(leafletMapCode.includes("width = \"100%\""), "LeafletMapView defaults to 100% responsive width");

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`  PHASE 5 INTEGRATION RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runFinalMapIntegrationTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
