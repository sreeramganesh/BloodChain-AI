import fs from 'fs';
import { HOSPITAL_MASTER } from '../src/constants/hospitalMasterData.mjs';

function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GROUP_WEIGHTS = {
  'O+': 1.35,
  'A+': 1.25,
  'B+': 1.20,
  'A-': 0.85,
  'B-': 0.80,
  'O-': 0.55,
  'AB+': 0.75,
  'AB-': 0.45
};

function getFacilityCategory(index) {
  if (index <= 1) return { type: 'Large', baseUnitsMin: 8, baseUnitsMax: 16 };
  if (index <= 5) return { type: 'Medium', baseUnitsMin: 4, baseUnitsMax: 9 };
  return { type: 'Small', baseUnitsMin: 2, baseUnitsMax: 5 };
}

function getCode(name) {
  return name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
}

// Global district index lookup
const DISTRICT_INDICES = {};
let gIdx = 0;
for (const [st, dists] of Object.entries(HOSPITAL_MASTER)) {
  for (const d of Object.keys(dists)) {
    gIdx++;
    DISTRICT_INDICES[`${st}|${d}`] = gIdx;
  }
}

export function getSyntheticInventoryForDistrict(state, district) {
  const hospitals = HOSPITAL_MASTER[state]?.[district];
  if (!hospitals) return [];

  const stateCode = getCode(state);
  const globalDistIdx = DISTRICT_INDICES[`${state}|${district}`] || 1;
  const distCode = `D${String(globalDistIdx).padStart(2, '0')}`;

  const rows = [];
  hospitals.forEach((hospName, hospIdx) => {
    const hospIdCode = `H${String(hospIdx + 1).padStart(2, '0')}`;
    const facilityCat = getFacilityCategory(hospIdx);

    BLOOD_GROUPS.forEach((bg) => {
      const bgCode = bg.replace('+', 'P').replace('-', 'N');
      const groupWeight = GROUP_WEIGHTS[bg];

      for (let batchNum = 1; batchNum <= 3; batchNum++) {
        const seed = stringHash(`${state}-${district}-${hospName}-${bg}-${batchNum}`);
        const rng = mulberry32(seed);

        const base = facilityCat.baseUnitsMin + rng() * (facilityCat.baseUnitsMax - facilityCat.baseUnitsMin);
        const availableUnits = Math.max(1, Math.round(base * groupWeight));

        const reservedPercent = 0.05 + rng() * 0.20;
        const reservedUnits = Math.floor(availableUnits * reservedPercent);
        const totalUnits = availableUnits + reservedUnits;

        let daysUntilExpiry;
        if (batchNum === 1) daysUntilExpiry = 2 + Math.floor(rng() * 4);
        else if (batchNum === 2) daysUntilExpiry = 8 + Math.floor(rng() * 13);
        else daysUntilExpiry = 21 + Math.floor(rng() * 20);

        const expiryDateObj = new Date(2026, 8, 28);
        expiryDateObj.setDate(expiryDateObj.getDate() + daysUntilExpiry);
        const expiryDateStr = expiryDateObj.toISOString().split('T')[0];

        let status;
        if (daysUntilExpiry <= 4) status = 'Expiring Soon';
        else if (availableUnits < 4) status = 'Low Stock';
        else if (availableUnits < 8) status = 'Moderate';
        else status = 'Sufficient';

        const batchId = `SYN-${stateCode}-${distCode}-${hospIdCode}-${bgCode}-B${batchNum}`;

        rows.push({
          id: `inv-${batchId}`,
          hospital: hospName,
          group: bg,
          blood_group: bg,
          available: availableUnits,
          available_units: availableUnits,
          reserved: reservedUnits,
          reserved_units: reservedUnits,
          total: totalUnits,
          total_units: totalUnits,
          expiry: new Date(expiryDateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          expiry_date: expiryDateStr,
          status: status,
          location: district,
          batch_id: batchId,
          data_type: 'Synthetic/Demo'
        });
      }
    });
  });

  return rows;
}

// Compare generated district data with JSON file
const raw = fs.readFileSync('src/constants/syntheticOperationalData.json', 'utf-8');
const fileData = JSON.parse(raw);

const sampleGen = getSyntheticInventoryForDistrict("Tamil Nadu", "Chennai");
console.log(`Generated for Tamil Nadu -> Chennai: ${sampleGen.length} records (Expected: 240)`);

const fileChennai = fileData.inventory.filter(i => i.state === "Tamil Nadu" && i.district === "Chennai");
console.log(`File records for Tamil Nadu -> Chennai: ${fileChennai.length} records`);

let mismatch = 0;
for (let i = 0; i < sampleGen.length; i++) {
  const g = sampleGen[i];
  const f = fileChennai[i];
  if (g.batch_id !== f.batch_id || g.available !== f.available_units || g.reserved !== f.reserved_units || g.expiry_date !== f.expiry_date) {
    mismatch++;
    console.error(`Mismatch at ${i}:`, g, f);
  }
}
console.log(`Mismatches between on-demand generator and JSON/SQL: ${mismatch}`);
