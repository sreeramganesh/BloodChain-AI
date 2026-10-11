import fs from 'fs';

// Load synthetic operational data
let syntheticData = null;

export function loadSyntheticData() {
  if (!syntheticData) {
    try {
      // In Vite / browser this can be bundled or imported
      const raw = fs.readFileSync('src/constants/syntheticOperationalData.json', 'utf-8');
      syntheticData = JSON.parse(raw);
    } catch {
      syntheticData = { facilities: [], inventory: [], requests: [] };
    }
  }
  return syntheticData;
}
