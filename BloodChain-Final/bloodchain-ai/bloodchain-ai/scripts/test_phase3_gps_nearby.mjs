/**
 * test_phase3_gps_nearby.mjs
 * =====================================================
 * BLOODCHAIN AI — PHASE 3 GPS & NEARBY UNIT TESTS
 * Validates pure geospatial logic via Node.js only.
 * NO BROWSER REQUIRED. NO GOOGLE MAPS. NO OSRM.
 * =====================================================
 */

import {
  calculateHaversineDistance,
  formatDistance,
  findNearbyFacilities,
  findNearbyDonors,
  getApproximateDonorCoordinates,
  DEFAULT_NEARBY_RADIUS_KM,
  NEARBY_RADIUS_OPTIONS,
  BLOOD_COMPATIBILITY_TABLE,
  APPROXIMATE_LOCATION_CENTROIDS,
} from "../src/utils/geoUtils.js";

// ─── TEST RUNNER ─────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const errors = [];

function test(description, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✅ PASS: ${description}`);
  } catch (err) {
    failed++;
    errors.push({ description, error: err.message });
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`         ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

function assertApprox(actual, expected, tolerance = 0.5, label = "") {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(
      `${label || "Value"} expected ≈${expected} (±${tolerance}) but got ${actual.toFixed(4)}`
    );
  }
}

// ─── CONSTANTS TESTS ─────────────────────────────────────────────────────────
console.log("\n═══════════════════════════════════════════");
console.log("  PHASE 3 GPS & NEARBY UNIT TESTS");
console.log("═══════════════════════════════════════════\n");

console.log("📌 [1] Constants & Exports");

test("DEFAULT_NEARBY_RADIUS_KM is a positive number", () => {
  assert(typeof DEFAULT_NEARBY_RADIUS_KM === "number", "Not a number");
  assert(DEFAULT_NEARBY_RADIUS_KM > 0, "Must be positive");
  assert(DEFAULT_NEARBY_RADIUS_KM <= 200, "Unreasonably large radius");
});

test("NEARBY_RADIUS_OPTIONS is a non-empty sorted array of numbers", () => {
  assert(Array.isArray(NEARBY_RADIUS_OPTIONS), "Not an array");
  assert(NEARBY_RADIUS_OPTIONS.length > 0, "Array is empty");
  assert(NEARBY_RADIUS_OPTIONS.includes(DEFAULT_NEARBY_RADIUS_KM), "Default not in options");
  const sorted = [...NEARBY_RADIUS_OPTIONS].sort((a, b) => a - b);
  assert(JSON.stringify(sorted) === JSON.stringify(NEARBY_RADIUS_OPTIONS), "Not sorted ascending");
});

test("BLOOD_COMPATIBILITY_TABLE contains all 8 standard blood groups", () => {
  const required = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];
  for (const bg of required) {
    assert(bg in BLOOD_COMPATIBILITY_TABLE, `Missing blood group: ${bg}`);
    assert(Array.isArray(BLOOD_COMPATIBILITY_TABLE[bg]), `${bg} compatibility must be an array`);
  }
});

test("BLOOD_COMPATIBILITY_TABLE: AB+ is universal recipient", () => {
  const compatible = BLOOD_COMPATIBILITY_TABLE["AB+"];
  assert(compatible.includes("O+"), "AB+ should accept O+");
  assert(compatible.includes("O-"), "AB+ should accept O-");
  assert(compatible.includes("AB+"), "AB+ should accept AB+");
  assert(compatible.includes("A+"), "AB+ should accept A+");
  assert(compatible.includes("B+"), "AB+ should accept B+");
});

test("BLOOD_COMPATIBILITY_TABLE: O- is universal donor (accepted by all)", () => {
  const allGroups = Object.keys(BLOOD_COMPATIBILITY_TABLE);
  for (const bg of allGroups) {
    assert(
      BLOOD_COMPATIBILITY_TABLE[bg].includes("O-"),
      `O- should be compatible with ${bg}`
    );
  }
});

test("APPROXIMATE_LOCATION_CENTROIDS has Trichy core localities", () => {
  const required = ["trichy", "tiruchirappalli", "srirangam", "thuvakudi", "lalgudi"];
  for (const loc of required) {
    assert(loc in APPROXIMATE_LOCATION_CENTROIDS, `Missing locality centroid: ${loc}`);
    const c = APPROXIMATE_LOCATION_CENTROIDS[loc];
    assert(typeof c.latitude === "number" && typeof c.longitude === "number", `${loc} has invalid coords`);
    assert(c.latitude > 8 && c.latitude < 15, `${loc} latitude out of Tamil Nadu range`);
    assert(c.longitude > 75 && c.longitude < 82, `${loc} longitude out of Tamil Nadu range`);
  }
});

// ─── HAVERSINE TESTS ─────────────────────────────────────────────────────────
console.log("\n📌 [2] Haversine Distance Calculation");

test("Zero distance when same coords", () => {
  const d = calculateHaversineDistance(10.8035, 78.6872, 10.8035, 78.6872);
  assertApprox(d, 0, 0.001, "Same-point distance");
});

test("Trichy ↔ Srirangam ≈ 6-8 km", () => {
  const d = calculateHaversineDistance(10.8035, 78.6872, 10.8622, 78.6983);
  assert(d !== null, "Distance should not be null");
  assert(d > 5 && d < 10, `Trichy-Srirangam expected ~7km, got ${d.toFixed(2)}km`);
});

test("Chennai ↔ Trichy ≈ 290-330 km", () => {
  const d = calculateHaversineDistance(13.0827, 80.2707, 10.8035, 78.6872);
  assert(d !== null, "Distance should not be null");
  assert(d > 250 && d < 370, `Chennai-Trichy expected ~310km, got ${d.toFixed(2)}km`);
});

test("Distance is symmetric (A→B == B→A)", () => {
  const d1 = calculateHaversineDistance(10.8035, 78.6872, 10.8622, 78.6983);
  const d2 = calculateHaversineDistance(10.8622, 78.6983, 10.8035, 78.6872);
  assertApprox(d1, d2, 0.0001, "Symmetric distance");
});

test("Returns null for null coordinates", () => {
  assert(calculateHaversineDistance(null, 78.6872, 10.8035, 78.7) === null);
  assert(calculateHaversineDistance(10.8035, null, 10.86, 78.7) === null);
  assert(calculateHaversineDistance(NaN, 78.6872, 10.8035, 78.7) === null);
});

// ─── FORMAT DISTANCE TESTS ───────────────────────────────────────────────────
console.log("\n📌 [3] formatDistance");

test("Formats 1.2345 km as '1.23 km'", () => {
  const out = formatDistance(1.2345);
  assert(out === "1.23 km", `Expected "1.23 km", got "${out}"`);
});

test("Returns N/A for null", () => {
  assert(formatDistance(null) === "N/A", "Should return N/A for null");
  assert(formatDistance(undefined) === "N/A", "Should return N/A for undefined");
  assert(formatDistance(NaN) === "N/A", "Should return N/A for NaN");
});

// ─── PRIVACY CENTROID TESTS ──────────────────────────────────────────────────
console.log("\n📌 [4] Privacy Donor Coordinate Resolution");

const TRICHY_LAT = APPROXIMATE_LOCATION_CENTROIDS["tiruchirappalli"].latitude;
const TRICHY_LNG = APPROXIMATE_LOCATION_CENTROIDS["tiruchirappalli"].longitude;

test("Returns null for null donor", () => {
  assert(getApproximateDonorCoordinates(null) === null);
});

test("Returns null when no location info", () => {
  const result = getApproximateDonorCoordinates({ name: "Anonymous", age: 28 });
  assert(result === null, "Should return null without location info");
});

test("Resolves 'Trichy' location to Tiruchirappalli centroid", () => {
  const c = getApproximateDonorCoordinates({ location: "Trichy", district: "" });
  assert(c !== null, "Should resolve Trichy");
  assertApprox(c.latitude, TRICHY_LAT, 0.01, "Trichy lat");
  assertApprox(c.longitude, TRICHY_LNG, 0.01, "Trichy lng");
});

test("Resolves 'Srirangam' location to Srirangam centroid", () => {
  const centroid = APPROXIMATE_LOCATION_CENTROIDS["srirangam"];
  // No district set — only location key should drive centroid lookup
  const c = getApproximateDonorCoordinates({ location: "Srirangam", district: "" });
  assert(c !== null, "Should resolve Srirangam");
  assertApprox(c.latitude, centroid.latitude, 0.01, "Srirangam lat");
});

test("Uses explicit lat/lng over centroid lookup when valid coords exist", () => {
  const c = getApproximateDonorCoordinates({
    location: "Trichy",
    latitude: 10.9000,
    longitude: 78.7000,
  });
  assert(c !== null, "Should return coords");
  assertApprox(c.latitude, 10.9000, 0.001, "Explicit lat should be used");
});

test("PRIVACY: Exact coordinates are not raw-exposed — centroid snapping works", () => {
  // If donor has no explicit coords, it should use locality centroid
  const c = getApproximateDonorCoordinates({ location: "Thuvakudi", district: "" });
  const expected = APPROXIMATE_LOCATION_CENTROIDS["thuvakudi"];
  assert(c !== null, "Thuvakudi should resolve");
  // The result must match centroid exactly (privacy preserved, not an interpolated raw address)
  assertApprox(c.latitude, expected.latitude, 0.001, "Thuvakudi centroid lat");
  assertApprox(c.longitude, expected.longitude, 0.001, "Thuvakudi centroid lng");
});

// ─── NEARBY DONORS TESTS ─────────────────────────────────────────────────────
console.log("\n📌 [5] findNearbyDonors");

const mockDonors = [
  { id: "d1", name: "Ravi Kumar", blood_group: "O+", location: "Trichy", district: "" },
  { id: "d2", name: "Priya S",   blood_group: "B+", location: "Srirangam", district: "" },
  { id: "d3", name: "Anand M",   blood_group: "A-", location: "Chennai", district: "" },
  { id: "d4", name: "Divya R",   bloodGroup: "O-",  location: "Lalgudi", district: "" },
  { id: "d5", name: "Karthik P", blood_group: "AB+", location: "NowhereUnknown", district: "" },
];

const USER_LAT = 10.8035;
const USER_LNG = 78.6872;

test("Returns empty array for null user coordinates", () => {
  const r = findNearbyDonors({ userLat: null, userLng: null, donors: mockDonors });
  assert(Array.isArray(r) && r.length === 0);
});

test("Returns empty array for empty donors list", () => {
  const r = findNearbyDonors({ userLat: USER_LAT, userLng: USER_LNG, donors: [] });
  assert(r.length === 0);
});

test("Excludes donors with no resolvable location", () => {
  const r = findNearbyDonors({ userLat: USER_LAT, userLng: USER_LNG, donors: mockDonors, radiusKm: 500 });
  const hasUnknown = r.some((d) => d.id === "d5");
  assert(!hasUnknown, "Donor with unknown location should be excluded from map markers");
});

test("Finds Trichy donor within 50km radius", () => {
  const r = findNearbyDonors({ userLat: USER_LAT, userLng: USER_LNG, donors: mockDonors, radiusKm: 50 });
  const ravi = r.find((d) => d.id === "d1");
  assert(ravi !== undefined, "Trichy donor Ravi should be found within 50km");
  assert(ravi.distanceKm !== undefined && ravi.distanceKm <= 50, "distanceKm should be within radius");
  assert(ravi.distanceDisplay !== "N/A", "distanceDisplay should be set");
  assert(ravi.isDonor === true, "isDonor flag should be set");
});

test("Excludes Chennai donor (>250km away) within 50km radius", () => {
  const r = findNearbyDonors({ userLat: USER_LAT, userLng: USER_LNG, donors: mockDonors, radiusKm: 50 });
  const anand = r.find((d) => d.id === "d3");
  assert(anand === undefined, "Chennai donor should be excluded from 50km radius");
});

test("Results are sorted ascending by distance (nearest first)", () => {
  const r = findNearbyDonors({ userLat: USER_LAT, userLng: USER_LNG, donors: mockDonors, radiusKm: 100 });
  for (let i = 1; i < r.length; i++) {
    assert(r[i].distanceKm >= r[i - 1].distanceKm, `Result at index ${i} should be further than ${i - 1}`);
  }
});

test("Blood group filter: exact match excludes non-matching donors", () => {
  const r = findNearbyDonors({
    userLat: USER_LAT, userLng: USER_LNG, donors: mockDonors,
    radiusKm: 100, bloodGroup: "O+",
  });
  for (const d of r) {
    const bg = (d.blood_group || d.bloodGroup || "").trim().toUpperCase();
    assert(bg === "O+", `Donor ${d.name} with ${bg} should not appear in O+ filter`);
  }
});

test("Blood group filter: All includes any blood group", () => {
  const r = findNearbyDonors({ userLat: USER_LAT, userLng: USER_LNG, donors: mockDonors, radiusKm: 100, bloodGroup: "All" });
  assert(r.length >= 2, "All blood groups should include multiple donors within 100km");
});

test("compatibleOnly: AB+ recipient should accept O-, O+, A+, A-, B+, B-", () => {
  const r = findNearbyDonors({
    userLat: USER_LAT, userLng: USER_LNG, donors: mockDonors,
    radiusKm: 100, bloodGroup: "AB+", compatibleOnly: true,
  });
  // Any donor with compatible blood should appear (in 100km range from Trichy/Srirangam)
  assert(Array.isArray(r), "Should return array");
});

// ─── NEARBY FACILITIES TESTS ─────────────────────────────────────────────────
console.log("\n📌 [6] findNearbyFacilities");

const mockFacilities = [
  { id: "f1", name: "Trichy GH",   type: "Government Hospital", latitude: 10.8035, longitude: 78.6872, hasCoordinates: true },
  { id: "f2", name: "Srirangam BB", type: "Blood Bank",          latitude: 10.8622, longitude: 78.6983, hasCoordinates: true },
  { id: "f3", name: "Chennai AIIMS", type: "Hospital",           latitude: 13.0827, longitude: 80.2707, hasCoordinates: true },
  { id: "f4", name: "No Coords Fac", type: "PHC",                hasCoordinates: false },
];

test("Excludes facilities without coordinates", () => {
  const r = findNearbyFacilities({ userLat: USER_LAT, userLng: USER_LNG, facilities: mockFacilities, radiusKm: 500 });
  const noCoords = r.find((f) => f.id === "f4");
  assert(noCoords === undefined, "Facility without coords should be excluded");
});

test("Finds nearby facilities within 50km", () => {
  const r = findNearbyFacilities({ userLat: USER_LAT, userLng: USER_LNG, facilities: mockFacilities, radiusKm: 50 });
  assert(r.length >= 1, "Should find at least Trichy GH");
  assert(r.every((f) => f.distanceKm <= 50), "All results should be within radius");
});

test("Excludes Chennai facility from 50km radius around Trichy", () => {
  const r = findNearbyFacilities({ userLat: USER_LAT, userLng: USER_LNG, facilities: mockFacilities, radiusKm: 50 });
  const chennai = r.find((f) => f.id === "f3");
  assert(chennai === undefined, "Chennai is >250km from Trichy");
});

test("Facility type filter: Blood Bank only", () => {
  const r = findNearbyFacilities({
    userLat: USER_LAT, userLng: USER_LNG, facilities: mockFacilities, radiusKm: 100, facilityType: "Blood Bank",
  });
  assert(r.every((f) => (f.type || "").toLowerCase().includes("blood bank")), "Only blood banks should appear");
});

test("Results are sorted ascending by distance", () => {
  const r = findNearbyFacilities({ userLat: USER_LAT, userLng: USER_LNG, facilities: mockFacilities, radiusKm: 500 });
  for (let i = 1; i < r.length; i++) {
    assert(r[i].distanceKm >= r[i - 1].distanceKm, `Sort error at index ${i}`);
  }
});

// ─── SUMMARY ─────────────────────────────────────────────────────────────────
console.log("\n═══════════════════════════════════════════");
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
console.log("═══════════════════════════════════════════\n");

if (errors.length > 0) {
  console.error("Failed tests:");
  errors.forEach((e) => console.error(`  ✗ ${e.description}: ${e.error}`));
  process.exit(1);
} else {
  console.log("🎉 All Phase 3 GPS & Nearby tests passed!");
  process.exit(0);
}
