import { HOSPITAL_MASTER } from "../src/constants/hospitalMasterData.js";
import { STATE_DISTRICTS } from "../src/constants/locationData.js";

function analyzeMasterData() {
  console.log("=== ANALYZING HOSPITAL MASTER DATA ===");
  const states = Object.keys(HOSPITAL_MASTER);
  console.log("States in Master:", states);

  let totalFacilities = 0;
  let stateCounts = {};
  let typeCounts = {};
  let allFacilitiesList = [];
  let duplicates = 0;

  for (const st of states) {
    stateCounts[st] = 0;
    const districts = Object.keys(HOSPITAL_MASTER[st]);
    console.log(`- ${st}: ${districts.length} districts`);

    for (const dist of districts) {
      const hospitals = HOSPITAL_MASTER[st][dist];
      stateCounts[st] += hospitals.length;
      totalFacilities += hospitals.length;

      for (const h of hospitals) {
        // Classify type based on facility name
        let type = "Hospital";
        const lower = h.toLowerCase();
        if (lower.includes("blood bank") || lower.includes("blood center")) {
          type = "Blood Bank";
        } else if (lower.includes("primary health centre") || lower.includes("phc")) {
          type = "PHC";
        } else if (lower.includes("community health centre") || lower.includes("chc")) {
          type = "CHC";
        } else if (lower.includes("medical college")) {
          type = "Medical College Hospital";
        } else if (lower.includes("government") || lower.includes("district headquarters")) {
          type = "Government Hospital";
        }

        typeCounts[type] = (typeCounts[type] || 0) + 1;

        allFacilitiesList.push({
          name: h,
          state: st,
          district: dist,
          type,
        });
      }
    }
  }

  console.log(`\nTotal Facilities found: ${totalFacilities}`);
  console.log("State-wise counts:", stateCounts);
  console.log("Facility Type distribution:", typeCounts);

  // Check unique key (name + district + state)
  const uniqueKeys = new Set();
  let duplicateCount = 0;
  for (const f of allFacilitiesList) {
    const key = `${f.name.toLowerCase()}:::${f.district.toLowerCase()}:::${f.state.toLowerCase()}`;
    if (uniqueKeys.has(key)) {
      duplicateCount++;
    } else {
      uniqueKeys.add(key);
    }
  }
  console.log(`Duplicate (name + district + state) occurrences: ${duplicateCount}`);
  console.log(`Unique facilities count: ${uniqueKeys.size}`);
}

analyzeMasterData();
