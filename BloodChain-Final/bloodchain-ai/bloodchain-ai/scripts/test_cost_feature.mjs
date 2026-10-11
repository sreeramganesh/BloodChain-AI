import {
  calculateEstimatedCostRange,
  INITIAL_INVENTORY,
  addInventoryStock,
  updateInventoryStock
} from "../src/services/bloodService.js";
import {
  findSourceCandidates,
  generateAndSaveRecommendationsForRequest,
  calculateRecommendationScore
} from "../src/services/recommendationEngine.js";

console.log("====================================================");
console.log("DYNAMIC ESTIMATED BLOOD COMPONENT COST TEST SUITE");
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

// ----------------------------------------------------
// TEST 1: O+ + 2 units -> Dynamic range based on available O+ sources
// ----------------------------------------------------
console.log("\n--- TEST 1: O+ + 2 units ---");
const test1Res = await calculateEstimatedCostRange({
  bloodGroup: "O+",
  units: 2,
  inventory: INITIAL_INVENTORY
});
assert(test1Res !== null, "Test 1: Result is not null");
assert(test1Res.status === "range", `Test 1: Status is 'range' (${test1Res.status})`);
assert(test1Res.minCost === 2800, `Test 1: minCost is ₹2,800 (${test1Res.minCost})`);
assert(test1Res.maxCost === 3200, `Test 1: maxCost is ₹3,200 (${test1Res.maxCost})`);
assert(test1Res.count === 2, `Test 1: Exactly 2 suitable sources found (${test1Res.count})`);
assert(test1Res.displayCost.includes("2,800") && test1Res.displayCost.includes("3,200"), `Test 1: Display cost formatted correctly (${test1Res.displayCost})`);

// ----------------------------------------------------
// TEST 2: Change units 2 -> 4 -> Updates automatically
// ----------------------------------------------------
console.log("\n--- TEST 2: Units 2 -> 4 ---");
const test2Res = await calculateEstimatedCostRange({
  bloodGroup: "O+",
  units: 4,
  inventory: INITIAL_INVENTORY
});
assert(test2Res !== null, "Test 2: Result is not null");
assert(test2Res.minCost === 5600, `Test 2: Min cost scaled 2x: ₹${test2Res.minCost} (expected ₹5,600)`);
assert(test2Res.maxCost === 6400, `Test 2: Max cost scaled 2x: ₹${test2Res.maxCost} (expected ₹6,400)`);
assert(test2Res.displayCost.includes("5,600") && test2Res.displayCost.includes("6,400"), `Test 2: Display cost updated (${test2Res.displayCost})`);

// ----------------------------------------------------
// TEST 3: Change O+ -> A+ -> Cost updates using A+ prices
// ----------------------------------------------------
console.log("\n--- TEST 3: O+ -> A+ with 2 units ---");
const test3Res = await calculateEstimatedCostRange({
  bloodGroup: "A+",
  units: 2,
  inventory: INITIAL_INVENTORY
});
assert(test3Res !== null, "Test 3: Result is not null");
assert(test3Res.minCost === 2600, `Test 3: A+ minCost is ₹2,600 (got ₹${test3Res.minCost})`);
assert(test3Res.maxCost === 2900, `Test 3: A+ maxCost is ₹2,900 (got ₹${test3Res.maxCost})`);
assert(test3Res.displayCost.includes("2,600") && test3Res.displayCost.includes("2,900"), `Test 3: Display cost is A+ range (${test3Res.displayCost})`);

// ----------------------------------------------------
// TEST 4: Only 1 suitable source -> "From ₹X"
// ----------------------------------------------------
console.log("\n--- TEST 4: Single suitable source ---");
// B+ has only 1 record in INITIAL_INVENTORY (Kauvery Hospital: available: 28, cost_per_unit: 1350)
const test4Res = await calculateEstimatedCostRange({
  bloodGroup: "B+",
  units: 2,
  inventory: INITIAL_INVENTORY
});
assert(test4Res !== null, "Test 4: Result is not null");
assert(test4Res.status === "single", `Test 4: Status is 'single' (${test4Res.status})`);
assert(test4Res.count === 1, `Test 4: Exactly 1 source found (${test4Res.count})`);
assert(test4Res.displayCost.startsWith("From ₹"), `Test 4: Single source displays 'From ₹X' (${test4Res.displayCost})`);
assert(test4Res.minCost === 2700, `Test 4: Total ₹2,700 for 2 units @ ₹1,350`);

// ----------------------------------------------------
// TEST 5: No suitable source -> "Estimated cost unavailable"
// ----------------------------------------------------
console.log("\n--- TEST 5: No suitable source ---");
// Requesting 9999 units exceeds any source's available stock
const test5ResExcessive = await calculateEstimatedCostRange({
  bloodGroup: "O+",
  units: 9999,
  inventory: INITIAL_INVENTORY
});
assert(test5ResExcessive.status === "unavailable", `Test 5a: Status is 'unavailable' when stock insufficient`);
assert(test5ResExcessive.displayCost === "Unavailable", `Test 5a: Display cost is 'Unavailable'`);
assert(test5ResExcessive.message.includes("No suitable blood source"), `Test 5a: Helpful message returned`);

// Unknown blood group
const test5ResUnknown = await calculateEstimatedCostRange({
  bloodGroup: "Z+",
  units: 2,
  inventory: INITIAL_INVENTORY
});
assert(test5ResUnknown.status === "unavailable", "Test 5b: Status is unavailable for non-existent group");

// Edge case: Empty group returns null (hide cost card completely)
const test5ResEmptyGroup = await calculateEstimatedCostRange({
  bloodGroup: "",
  units: 2,
  inventory: INITIAL_INVENTORY
});
assert(test5ResEmptyGroup === null, "Test 5c: Returns null when blood group is empty (card hidden)");

// Edge case: Units <= 0 returns null (hide calculation)
const test5ResZero = await calculateEstimatedCostRange({
  bloodGroup: "O+",
  units: 0,
  inventory: INITIAL_INVENTORY
});
assert(test5ResZero === null, "Test 5d: Returns null when units = 0 (calculation hidden)");

const test5ResNeg = await calculateEstimatedCostRange({
  bloodGroup: "O+",
  units: -3,
  inventory: INITIAL_INVENTORY
});
assert(test5ResNeg === null, "Test 5e: Returns null when units is negative (calculation hidden)");

// ----------------------------------------------------
// TEST 6 & 7: Recommendation engine includes cost per unit and total cost
// ----------------------------------------------------
console.log("\n--- TEST 6 & 7: Recommendation candidate cost details ---");
const mockReq = {
  id: "req-cost-test-01",
  group: "O+",
  units: 2,
  hospital: "Cauvery Medical Center",
  urgency: "High",
  state: "Tamil Nadu",
  district: "Tiruchirappalli"
};

const candidateRes = await findSourceCandidates({
  request: mockReq,
  radiusKm: 50
});

const candidates = candidateRes.candidates;
assert(candidates && candidates.length > 0, `Test 6: Found ${candidates?.length} candidates`);
candidates.forEach((cand, idx) => {
  assert(typeof cand.costPerUnit === "number" && cand.costPerUnit > 0, `Test 6: Candidate #${idx + 1} (${cand.facilityName}) has costPerUnit: ₹${cand.costPerUnit}`);
  assert(typeof cand.totalEstimatedCost === "number" && cand.totalEstimatedCost > 0, `Test 6: Candidate #${idx + 1} has totalEstimatedCost: ₹${cand.totalEstimatedCost}`);
  
  // TEST 7: Check calculation: cost_per_unit * requested_units = total estimated cost
  const expectedTotal = cand.costPerUnit * mockReq.units;
  assert(cand.totalEstimatedCost === expectedTotal, `Test 7: Calculation exact: ${cand.costPerUnit} * ${mockReq.units} = ₹${cand.totalEstimatedCost}`);
});

// ----------------------------------------------------
// TEST 8: Full recommendation generation workflow continues working
// ----------------------------------------------------
console.log("\n--- TEST 8: Full recommendation generation workflow ---");
const recResults = await generateAndSaveRecommendationsForRequest(mockReq, {
  forceRegenerate: true,
  radiusKm: 50
});
assert(recResults.success === true, `Test 8: Recommendation generation succeeded`);
assert(recResults.candidates && recResults.candidates.length > 0, `Test 8: Generated ${recResults.candidates.length} recommendations`);
assert(recResults.candidates[0].costPerUnit > 0, `Test 8: Top recommendation costPerUnit is ₹${recResults.candidates[0].costPerUnit}`);
assert(recResults.candidates[0].totalEstimatedCost === recResults.candidates[0].costPerUnit * 2, `Test 8: Top recommendation totalEstimatedCost is ₹${recResults.candidates[0].totalEstimatedCost}`);

// ----------------------------------------------------
// TEST 9: Source ranking logic is unaffected by cost
// ----------------------------------------------------
console.log("\n--- TEST 9: Source ranking invariance ---");
// calculateRecommendationScore should strictly depend on clinical factors, NOT price
const scoreLowPrice = calculateRecommendationScore({
  compatibilityStatus: "Exact Match",
  requiredUnits: 2,
  availableUnits: 50,
  shortageRiskLevel: "Low",
  expiryRiskLevel: "Low",
  distanceKm: 5,
  travelTimeMinutes: 15
});

const scoreHighPrice = calculateRecommendationScore({
  compatibilityStatus: "Exact Match",
  requiredUnits: 2,
  availableUnits: 50,
  shortageRiskLevel: "Low",
  expiryRiskLevel: "Low",
  distanceKm: 5,
  travelTimeMinutes: 15,
  costPerUnit: 99999 // Cost passed in should NOT alter score
});

assert(typeof scoreLowPrice === "number" && scoreLowPrice > 0, `Test 9: Valid numerical score produced (${scoreLowPrice})`);
assert(scoreLowPrice === scoreHighPrice, `Test 9: Total score unchanged despite price differences (${scoreLowPrice} vs ${scoreHighPrice})`);

// ----------------------------------------------------
// TEST 10: Inventory Add / Update persists cost_per_unit
// ----------------------------------------------------
console.log("\n--- TEST 10: Inventory add/update persists cost_per_unit ---");
const newStock = {
  bloodBankId: "demo-bb-999",
  bloodBankName: "Test Metro Blood Bank",
  group: "AB-",
  units: 15,
  expiryDays: 28,
  costPerUnit: 1750
};
const addedItem = await addInventoryStock(newStock);
assert(addedItem.cost_per_unit === 1750, `Test 10a: addInventoryStock saved cost_per_unit: ₹${addedItem.cost_per_unit}`);

const updateRes = await updateInventoryStock(addedItem.id, {
  units: 20,
  cost_per_unit: 1850
});
const updatedItem = updateRes.data;
assert(updatedItem && updatedItem.cost_per_unit === 1850, `Test 10b: updateInventoryStock updated cost_per_unit: ₹${updatedItem?.cost_per_unit}`);
assert(updatedItem && updatedItem.available === 20, `Test 10c: updateInventoryStock updated units to 20`);

console.log("\n====================================================");
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log("====================================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
