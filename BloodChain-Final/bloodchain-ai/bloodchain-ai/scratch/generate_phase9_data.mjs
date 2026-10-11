import fs from 'fs';
import { HOSPITAL_MASTER } from '../src/constants/hospitalMasterData.mjs';

// Deterministic Pseudo-Random Number Generator (PRNG) based on string hash
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

// Group availability factors (O- and AB- lower; A+, B+, O+ higher)
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

// Facility size categories based on index in district (0-1: Large, 2-5: Medium, 6-9: Small)
function getFacilityCategory(index) {
  if (index <= 1) return { type: 'Large', baseUnitsMin: 8, baseUnitsMax: 16 };
  if (index <= 5) return { type: 'Medium', baseUnitsMin: 4, baseUnitsMax: 9 };
  return { type: 'Small', baseUnitsMin: 2, baseUnitsMax: 5 };
}

// Generate state code and district code for stable batch IDs
function getCode(name) {
  return name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
}

function generateDataset() {
  const facilities = [];
  const inventory = [];
  const requests = [];

  let reqIdCounter = 100;
  let globalDistIdx = 0;

  for (const [state, districts] of Object.entries(HOSPITAL_MASTER)) {
    const stateCode = getCode(state);

    for (const [district, hospitals] of Object.entries(districts)) {
      globalDistIdx++;
      const distCode = `D${String(globalDistIdx).padStart(2, '0')}`;

      hospitals.forEach((hospName, hospIdx) => {
        const hospIdCode = `H${String(hospIdx + 1).padStart(2, '0')}`;
        const facilityCat = getFacilityCategory(hospIdx);

        // Facility record
        facilities.push({
          name: hospName,
          facility_type: 'Hospital',
          district: district,
          state: state,
          category: facilityCat.type
        });

        // Generate 8 blood groups * 3 batches = 24 inventory records
        BLOOD_GROUPS.forEach((bg) => {
          const bgCode = bg.replace('+', 'P').replace('-', 'N');
          const groupWeight = GROUP_WEIGHTS[bg];

          for (let batchNum = 1; batchNum <= 3; batchNum++) {
            const seed = stringHash(`${state}-${district}-${hospName}-${bg}-${batchNum}`);
            const rng = mulberry32(seed);

            // Deterministic available units
            const base = facilityCat.baseUnitsMin + rng() * (facilityCat.baseUnitsMax - facilityCat.baseUnitsMin);
            const availableUnits = Math.max(1, Math.round(base * groupWeight));

            // Reserved units: 0 to ~25% of available
            const reservedPercent = 0.05 + rng() * 0.20;
            const reservedUnits = Math.floor(availableUnits * reservedPercent);
            const totalUnits = availableUnits + reservedUnits;

            // Expiry dates based on batch
            // Base reference date: 2026-09-28
            let daysUntilExpiry;
            if (batchNum === 1) {
              // Critical / High expiry: 2 to 5 days
              daysUntilExpiry = 2 + Math.floor(rng() * 4); // 2, 3, 4, 5
            } else if (batchNum === 2) {
              // Medium expiry: 8 to 20 days
              daysUntilExpiry = 8 + Math.floor(rng() * 13); // 8-20
            } else {
              // Low expiry: 21 to 40 days
              daysUntilExpiry = 21 + Math.floor(rng() * 20); // 21-40
            }

            const expiryDateObj = new Date(2026, 8, 28); // Month is 0-indexed: 8 is September
            expiryDateObj.setDate(expiryDateObj.getDate() + daysUntilExpiry);
            const expiryDateStr = expiryDateObj.toISOString().split('T')[0];

            // Status determination matching check constraint:
            // ('Sufficient', 'Moderate', 'Low Stock', 'Expiring Soon')
            let status;
            if (daysUntilExpiry <= 4) {
              status = 'Expiring Soon';
            } else if (availableUnits < 4) {
              status = 'Low Stock';
            } else if (availableUnits < 8) {
              status = 'Moderate';
            } else {
              status = 'Sufficient';
            }

            const batchId = `SYN-${stateCode}-${distCode}-${hospIdCode}-${bgCode}-B${batchNum}`;

            inventory.push({
              hospital: hospName,
              district: district,
              state: state,
              blood_group: bg,
              available_units: availableUnits,
              reserved_units: reservedUnits,
              total_units: totalUnits,
              expiry_date: expiryDateStr,
              days_until_expiry: daysUntilExpiry,
              status: status,
              batch_id: batchId,
              data_type: 'Synthetic/Demo'
            });
          }
        });

        // Sample synthetic blood request (for ~25% of hospitals to provide realistic activity across districts)
        const hospSeed = stringHash(`${state}-${district}-${hospName}-req`);
        const hospRng = mulberry32(hospSeed);
        if (hospRng() < 0.25) {
          reqIdCounter++;
          const reqBg = BLOOD_GROUPS[Math.floor(hospRng() * BLOOD_GROUPS.length)];
          const unitsNeeded = 1 + Math.floor(hospRng() * 4);
          const urgencies = ['Emergency', 'High', 'Medium', 'Low'];
          const statuses = ['Pending', 'In Progress', 'In Review'];
          const reasons = [
            'Elective surgery support & scheduled surgical procedure',
            'Emergency trauma care blood reserves',
            'Cardiovascular bypass procedure',
            'Oncology treatment transfusion therapy',
            'Severe anemia critical replenishment'
          ];

          requests.push({
            id: `BRQ-SYN-${String(reqIdCounter).padStart(4, '0')}`,
            patient_name: `Patient S-${reqIdCounter}`,
            hospital: hospName,
            blood_group: reqBg,
            units_needed: unitsNeeded,
            request_type: 'Facility',
            urgency: urgencies[Math.floor(hospRng() * urgencies.length)],
            status: statuses[Math.floor(hospRng() * statuses.length)],
            reason: reasons[Math.floor(hospRng() * reasons.length)],
            district: district,
            requested_by: `${hospName} Clinical Duty Officer`,
            created_at: '2026-09-28T09:00:00Z',
            data_type: 'Synthetic/Demo'
          });
        }
      });
    }
  }

  return { facilities, inventory, requests };
}

const { facilities, inventory, requests } = generateDataset();

console.log('=== GENERATION SUMMARY ===');
console.log(`Facilities: ${facilities.length}`);
console.log(`Inventory records: ${inventory.length}`);
console.log(`Requests: ${requests.length}`);
console.log(`Expected (740 * 24): ${740 * 24}`);

// Save JSON for frontend and verification
fs.writeFileSync('src/constants/syntheticOperationalData.json', JSON.stringify({ facilities, inventory, requests }, null, 2));
console.log('Saved to src/constants/syntheticOperationalData.json');
