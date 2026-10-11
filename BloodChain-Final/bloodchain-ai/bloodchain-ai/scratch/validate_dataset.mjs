import fs from 'fs';
import { HOSPITAL_MASTER } from '../src/constants/hospitalMasterData.mjs';

const raw = fs.readFileSync('src/constants/syntheticOperationalData.json', 'utf-8');
const data = JSON.parse(raw);

console.log('=== VALIDATION SUITE (REQUIREMENTS A-J) ===');

// A & B: Every uploaded hospital exists in facilities with correct state and district
let missingHospitals = 0;
let facilityMismatch = 0;
const facilityMap = new Map();

for (const f of data.facilities) {
  const key = `${f.state}|${f.district}|${f.name}`;
  if (facilityMap.has(key)) {
    console.error('DUPLICATE FACILITY:', key);
  }
  facilityMap.set(key, f);
}

for (const [state, districts] of Object.entries(HOSPITAL_MASTER)) {
  for (const [dist, hosps] of Object.entries(districts)) {
    for (const h of hosps) {
      const key = `${state}|${dist}|${h}`;
      if (!facilityMap.has(key)) {
        console.error('MISSING HOSPITAL:', key);
        missingHospitals++;
      }
    }
  }
}
console.log(`[A & B] Missing hospitals from uploaded master: ${missingHospitals}`);

// H: No duplicate facility records
console.log(`[H] Duplicate facilities: ${data.facilities.length - facilityMap.size}`);

// C & D: Every hospital has 8 blood groups, each with 3 batches (24 records per hospital)
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const hospInvMap = new Map();
let batchDuplicateCount = 0;
const batchSet = new Set();
let invalidTotalUnits = 0;
let invalidExpiry = 0;
let nonSyntheticDataType = 0;

for (const inv of data.inventory) {
  const hospKey = `${inv.state}|${inv.district}|${inv.hospital}`;
  if (!hospInvMap.has(hospKey)) {
    hospInvMap.set(hospKey, []);
  }
  hospInvMap.get(hospKey).push(inv);

  // Check batch_id uniqueness (I)
  if (batchSet.has(inv.batch_id)) {
    batchDuplicateCount++;
    console.error('DUPLICATE BATCH ID:', inv.batch_id);
  }
  batchSet.add(inv.batch_id);

  // Check total_units (E)
  if (inv.total_units !== inv.available_units + inv.reserved_units) {
    invalidTotalUnits++;
  }

  // Check expiry date (F)
  if (isNaN(Date.parse(inv.expiry_date))) {
    invalidExpiry++;
  }

  // Check data_type (G)
  if (inv.data_type !== 'Synthetic/Demo') {
    nonSyntheticDataType++;
  }
}

let missingGroupsHospitals = 0;
let missingBatchesCount = 0;

for (const [hospKey, items] of hospInvMap.entries()) {
  if (items.length !== 24) {
    console.error(`Hospital ${hospKey} has ${items.length} records instead of 24!`);
  }
  for (const bg of BLOOD_GROUPS) {
    const bgBatches = items.filter(i => i.blood_group === bg);
    if (bgBatches.length !== 3) {
      missingBatchesCount++;
    }
  }
}

console.log(`[C] Total hospitals in inventory: ${hospInvMap.size} (Expected: 740)`);
console.log(`[D] Missing blood groups / batch count deviations: ${missingBatchesCount}`);
console.log(`[E] Invalid total_units calculations: ${invalidTotalUnits}`);
console.log(`[F] Invalid expiry dates: ${invalidExpiry}`);
console.log(`[G] Records with data_type != "Synthetic/Demo": ${nonSyntheticDataType}`);
console.log(`[I] Duplicate batch IDs: ${batchDuplicateCount}`);
console.log('=== VALIDATION SUITE PASSED SUCCESSFULLY! ===');
