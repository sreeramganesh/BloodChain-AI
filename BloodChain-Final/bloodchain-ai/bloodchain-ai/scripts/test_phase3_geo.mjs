import { calculateHaversineDistance, formatDistance, findNearbyFacilities, DEFAULT_NEARBY_RADIUS_KM } from '../src/utils/geoUtils.js';
import { getAllAuthoritativeFacilities, getAllVerifiedFacilities } from '../src/services/facilityService.js';

console.log('====================================================');
console.log('PHASE 3 — GEOLOCATION & HAVERSINE VERIFICATION SUITE');
console.log('====================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    testsFailed++;
  }
}

// 1. Haversine Calculation with Known Coordinates
// MGM Healthcare Chennai (13.0112, 80.2195) to Apollo Children's Thousand Lights (13.0604, 80.2508)
// Straight-line distance is approx 6.4 - 6.6 km
const distMGMtoApollo = calculateHaversineDistance(13.0112, 80.2195, 13.0604, 80.2508);
assert(distMGMtoApollo !== null, 'Haversine returned numeric value for valid coordinates');
assert(distMGMtoApollo >= 6.0 && distMGMtoApollo <= 7.0, `Calculated distance MGM to Apollo is ${distMGMtoApollo.toFixed(2)} km (expected ~6.5 km)`);

// Test Trichy GH (10.8065, 78.6923) to Trichy Airport (10.7654, 78.7126) approx 5.0 - 5.5 km
const distTrichy = calculateHaversineDistance(10.8065, 78.6923, 10.7654, 78.7126);
assert(distTrichy >= 4.8 && distTrichy <= 5.5, `Calculated distance Trichy GH to Airport is ${distTrichy.toFixed(2)} km (expected ~5.1 km)`);

// 2. Same Point Distance is 0 km
const distSame = calculateHaversineDistance(13.0112, 80.2195, 13.0112, 80.2195);
assert(distSame === 0, 'Distance between identical coordinates is 0.00 km');

// 3. Null / Invalid Coordinates Handling
assert(calculateHaversineDistance(null, 80.2195, 13.0604, 80.2508) === null, 'Returns null when user latitude is null');
assert(calculateHaversineDistance(13.0112, undefined, 13.0604, 80.2508) === null, 'Returns null when user longitude is undefined');
assert(calculateHaversineDistance(13.0112, 80.2195, null, 80.2508) === null, 'Returns null when facility latitude is null');
assert(calculateHaversineDistance(13.0112, 80.2195, 13.0604, 'invalid') === null, 'Returns null when facility coordinate is non-numeric');

// 4. formatDistance Test
assert(formatDistance(1.2435) === '1.24 km', 'formatDistance formats 1.2435 to "1.24 km"');
assert(formatDistance(12.456) === '12.46 km', 'formatDistance formats 12.456 to "12.46 km"');
assert(formatDistance(0.05) === '0.05 km', 'formatDistance formats 0.05 to "0.05 km"');
assert(formatDistance(null) === 'N/A', 'formatDistance handles null gracefully with "N/A"');

// 5. Test findNearbyFacilities Filtering and Ascending Sorting
const mockUser = { lat: 10.8041, lng: 78.6853 }; // Trichy central coords
const mockFacilities = [
  { id: '1', name: 'Far Facility', latitude: 13.0827, longitude: 80.2707, facility_type: 'Hospital' }, // Chennai (~300 km)
  { id: '2', name: 'Near Facility A (Kauvery)', latitude: 10.8285, longitude: 78.6872, facility_type: 'Hospital' }, // ~2.7 km
  { id: '3', name: 'Near Facility B (Trichy GH)', latitude: 10.8065, longitude: 78.6923, facility_type: 'Government Hospital' }, // ~0.8 km
  { id: '4', name: 'Pending Facility', latitude: null, longitude: null, facility_type: 'Blood Bank' }, // null coords
  { id: '5', name: 'Medium Facility (Manapparai)', latitude: 10.6074, longitude: 78.4987, facility_type: 'CHC' }, // ~30 km
];

const nearby25 = findNearbyFacilities({
  userLat: mockUser.lat,
  userLng: mockUser.lng,
  facilities: mockFacilities,
  radiusKm: 25,
});

assert(nearby25.length === 2, `Found exactly 2 facilities within 25 km (found ${nearby25.length})`);
assert(nearby25[0].id === '3', `Nearest facility is Near Facility B (Trichy GH) at index 0`);
assert(nearby25[1].id === '2', `Second nearest facility is Near Facility A (Kauvery) at index 1`);
assert(nearby25[0].distanceKm < nearby25[1].distanceKm, 'Facilities are sorted in strict ascending distance order');
assert(!nearby25.some(f => f.id === '4'), 'Pending facility with null coordinates was completely excluded from distance calculations');
assert(!nearby25.some(f => f.id === '1'), 'Far facility (Chennai, ~300km) was excluded from 25 km radius');

// Test Radius Expansion to 50 km
const nearby50 = findNearbyFacilities({
  userLat: mockUser.lat,
  userLng: mockUser.lng,
  facilities: mockFacilities,
  radiusKm: 50,
});
assert(nearby50.length === 3, `Expanding radius to 50 km includes Manapparai facility (found ${nearby50.length})`);

// 6. Dataset Statistics Verification
const allMaster = getAllAuthoritativeFacilities();
const totalFacilities = allMaster.length;
const verifiedFacilities = allMaster.filter(f => f.latitude !== null && f.longitude !== null && !isNaN(Number(f.latitude)) && !isNaN(Number(f.longitude)));
const pendingFacilities = allMaster.filter(f => f.latitude === null || f.longitude === null);
const verifiedList = getAllVerifiedFacilities();

console.log('\n--- DATASET GEOSPATIAL METRICS ---');
console.log(`Total Facilities in Master: ${totalFacilities}`);
console.log(`Eligible in Master (Verified Coordinates): ${verifiedFacilities.length}`);
console.log(`Total Verified Facilities (Master + DB/Registry): ${verifiedList.length}`);
console.log(`Coordinates Pending in Master: ${pendingFacilities.length}`);
console.log(`Default Radius: ${DEFAULT_NEARBY_RADIUS_KM} km`);

assert(totalFacilities === 740, `Total authoritative facilities is exactly 740 (actual: ${totalFacilities})`);
assert(verifiedFacilities.length > 0, `Verified facilities count is positive (${verifiedFacilities.length})`);
assert(totalFacilities === (verifiedFacilities.length + pendingFacilities.length), 'Verified + Pending equals total dataset');

console.log('\n====================================================');
console.log(`TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log('====================================================\n');

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
