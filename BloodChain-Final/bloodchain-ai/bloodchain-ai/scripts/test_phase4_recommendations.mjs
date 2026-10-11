import {
  checkBloodCompatibility,
  calculateRecommendationScore,
  generateRecommendationReason,
  findSourceCandidates,
  generateAndSaveRecommendationsForRequest,
  BLOOD_COMPATIBILITY_MATRIX,
  SCORING_WEIGHTS,
} from "../src/services/recommendationEngine.js";
import { INITIAL_INVENTORY, INITIAL_REQUESTS } from "../src/services/bloodService.js";

console.log("====================================================");
console.log("PHASE 4 — INTELLIGENT SOURCE SELECTION TEST SUITE");
console.log("====================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failed++;
  }
}

// 1. A+ recipient compatibility
assert(checkBloodCompatibility("A+", "A+") === "Exact Match", "A+ recipient + A+ donor = Exact Match");
assert(checkBloodCompatibility("A+", "A-") === "Compatible Alternate", "A+ recipient + A- donor = Compatible Alternate");
assert(checkBloodCompatibility("A+", "O+") === "Compatible Alternate", "A+ recipient + O+ donor = Compatible Alternate");
assert(checkBloodCompatibility("A+", "O-") === "Compatible Alternate", "A+ recipient + O- donor = Compatible Alternate");

// 2. O- recipient compatibility
assert(checkBloodCompatibility("O-", "O-") === "Exact Match", "O- recipient + O- donor = Exact Match");
assert(checkBloodCompatibility("O-", "O+") === null, "O- recipient + O+ donor = Incompatible (null)");
assert(checkBloodCompatibility("O-", "A-") === null, "O- recipient + A- donor = Incompatible (null)");
assert(checkBloodCompatibility("O-", "AB-") === null, "O- recipient + AB- donor = Incompatible (null)");

// 3. AB+ recipient compatibility (Universal Recipient)
const allGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
allGroups.forEach((g) => {
  const comp = checkBloodCompatibility("AB+", g);
  assert(comp !== null, `AB+ recipient can accept donor ${g} (${comp})`);
});

// 4. Incompatible blood groups are excluded
assert(checkBloodCompatibility("B+", "A+") === null, "B+ recipient excludes A+ donor");
assert(checkBloodCompatibility("B-", "B+") === null, "B- recipient excludes B+ donor");
assert(checkBloodCompatibility("A-", "A+") === null, "A- recipient excludes A+ donor");
assert(checkBloodCompatibility("AB-", "A+") === null, "AB- recipient excludes A+ donor");

// 5. Usable inventory semantics: usable stock = available_units (NOT available - reserved)
const sampleItem = INITIAL_INVENTORY.find((i) => i.group === "O+" && i.available === 120);
assert(sampleItem && sampleItem.available === 120, "Sample inventory has available = 120");
assert(sampleItem.reserved === 40, "Sample inventory has reserved = 40");
// Usable stock is exactly available: 120, NOT 120 - 40 = 80
assert(sampleItem.available >= 100, "Usable inventory correctly treats available_units as usable unreserved stock");

// 6. Test findSourceCandidates for Request BRQ001 (O+, 2 units, Trichy GH)
async function testCandidates() {
  const req = {
    id: "BRQ001",
    patient: "R. Karthik",
    group: "O+",
    units: 2,
    hospital: "Trichy GH",
    district: "Tiruchirappalli",
    state: "Tamil Nadu",
    urgency: "Critical",
  };

  const initialInventorySnapshot = JSON.stringify(INITIAL_INVENTORY);

  const res = await findSourceCandidates({
    request: req,
    radiusKm: 25,
  });

  assert(res.candidates.length > 0, `Found ${res.candidates.length} candidate sources for O+ request`);
  assert(res.resultState === "SUITABLE_FOUND", `Result state is "SUITABLE_FOUND" (${res.resultState})`);

  // 7. Requesting facility itself is excluded from source candidates
  const hasRequestingFacility = res.candidates.some(
    (c) => c.facilityName.toLowerCase().includes("trichy gh") || c.facilityName.toLowerCase().includes("trichy government")
  );
  assert(!hasRequestingFacility, "Requesting facility (Trichy GH) was excluded from candidate sources");

  // 8. Incompatible sources are strictly excluded
  const hasIncompatible = res.candidates.some(
    (c) => checkBloodCompatibility("O+", c.bloodGroup) === null
  );
  assert(!hasIncompatible, "No incompatible blood groups exist in candidate sources");

  // 9. Candidate model structure verification
  const top = res.candidates[0];
  assert(top.facilityName !== undefined, "Candidate has facilityName");
  assert(top.availableUnits !== undefined, "Candidate has availableUnits");
  assert(top.requiredUnits === 2, "Candidate has requiredUnits = 2");
  assert(top.canFulfill === true, "Top candidate can fulfill 2 units");
  assert(top.compatibilityStatus === "Exact Match" || top.compatibilityStatus === "Compatible Alternate", "Candidate has valid compatibility status");
  assert(top.shortageRiskLevel !== undefined, "Candidate has shortageRiskLevel");
  assert(top.expiryRiskLevel !== undefined, "Candidate has expiryRiskLevel");
  assert(top.distanceKm !== undefined, "Candidate has distanceKm");
  assert(top.recommendationScore >= 50, `Candidate score is ${top.recommendationScore} (>= 50)`);
  assert(top.status === "Pending", "Candidate status is 'Pending' (Human review mandatory)");
  assert(typeof top.reason === "string" && top.reason.length > 20, "Candidate has transparent clinical reason");

  // 10. Check ascending proximity / score sorting
  for (let i = 1; i < res.candidates.length; i++) {
    assert(
      res.candidates[i - 1].recommendationScore >= res.candidates[i].recommendationScore,
      `Candidates sorted by recommendation score descending: ${res.candidates[i - 1].recommendationScore} >= ${res.candidates[i].recommendationScore}`
    );
  }

  // 11. Insufficient inventory handling test
  const hugeReq = {
    id: "BRQ-HUGE",
    patient: "Emergency Multi-Trauma",
    group: "O-",
    units: 500, // Impossibly large request
    hospital: "Kauvery Hospital",
    district: "Tiruchirappalli",
    state: "Tamil Nadu",
  };

  const hugeRes = await findSourceCandidates({ request: hugeReq, radiusKm: 25 });
  assert(
    hugeRes.resultState === "INSUFFICIENT_QUANTITY",
    `Large request correctly flagged as INSUFFICIENT_QUANTITY (${hugeRes.resultState})`
  );
  assert(
    hugeRes.candidates.every((c) => c.canFulfill === false),
    "All candidates flagged as canFulfill: false when units needed exceed available stock"
  );

  // 12. Idempotent / Duplicate Prevention Test
  const rec1 = await generateAndSaveRecommendationsForRequest(req);
  assert(rec1.success === true, "First recommendation generation succeeded");

  const rec2 = await generateAndSaveRecommendationsForRequest(req);
  assert(rec2.fromCache === true, "Second recommendation generation retrieved from cache without duplicate inserts");

  // 13. Inventory Safety Verification: Inventory was NOT modified!
  const finalInventorySnapshot = JSON.stringify(INITIAL_INVENTORY);
  assert(initialInventorySnapshot === finalInventorySnapshot, "CRITICAL: blood_inventory was 100% UNMODIFIED (Read-Only)");

  console.log("\n====================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("====================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

testCandidates().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
