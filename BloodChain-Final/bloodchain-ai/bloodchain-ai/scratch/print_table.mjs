import { HOSPITAL_MASTER } from '../src/constants/hospitalMasterData.js';

console.log('| State | District | Hospital Count | Inventory Records |');
console.log('|---|---|---|---|');

let totalHosps = 0;
let totalInv = 0;

for (const [state, districts] of Object.entries(HOSPITAL_MASTER)) {
  for (const [dist, hosps] of Object.entries(districts)) {
    const hCount = hosps.length;
    const invCount = hCount * 24;
    totalHosps += hCount;
    totalInv += invCount;
    console.log(`| ${state} | ${dist} | ${hCount} | ${invCount} |`);
  }
}

console.log(`\nTotal Hospitals: ${totalHosps}, Total Inventory Records: ${totalInv}`);
