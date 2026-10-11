import { createClient } from '@supabase/supabase-js';
import { fitHoltLinearModel, generateDemandPredictions } from '../scripts/phase5_forecasting_engine.js';
import fs from 'fs';

const sb = createClient('https://iaaidwwrjpgpktcqynva.supabase.co', 'sb_publishable_9ft466dKS3I1O4Bx_9-97g_smz2vd8i');

async function main() {
  const { data: facs } = await sb.from('facilities').select('id, name').order('name');
  const monitored = facs.filter(f => ['Trichy Government Hospital', 'Apollo Hospital', 'Kauvery Hospital', 'SRM Hospital', 'Trichy Blood Bank'].includes(f.name));

  const weights = {
    'Trichy Government Hospital': 7,
    'Apollo Hospital': 5,
    'Kauvery Hospital': 4,
    'SRM Hospital': 3,
    'Trichy Blood Bank': 6
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const months = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const dates = [
    '2025-10-01', '2025-11-01', '2025-12-01',
    '2026-01-01', '2026-02-01', '2026-03-01',
    '2026-04-01', '2026-05-01', '2026-06-01',
    '2026-07-01', '2026-08-01', '2026-09-01'
  ];

  const historicalRecords = [];
  for (const fac of monitored) {
    const w = weights[fac.name];
    for (const bg of bloodGroups) {
      for (let i = 0; i < 12; i++) {
        const m = months[i];
        let units = 0;
        if (['O+', 'A+'].includes(bg)) units = 18 + ((m * 3 + w) % 15);
        else if (['B+', 'O-'].includes(bg)) units = 10 + ((m * 2 + w) % 10);
        else if (['A-', 'B-'].includes(bg)) units = 6 + ((m + w) % 6);
        else units = 4 + ((m + w) % 4);

        historicalRecords.push({
          facility_id: fac.id,
          facility_name: fac.name,
          blood_group: bg,
          demand_date: dates[i],
          units_requested: units
        });
      }
    }
  }

  const result = generateDemandPredictions(historicalRecords);
  
  const valuesSql = result.predictions.map(p => 
    `  ('${p.facility_id}', '${p.blood_group}', '${p.prediction_date}', ${p.forecast_horizon_days}, ${p.predicted_units}, ${p.lower_bound}, ${p.upper_bound}, '${p.model_name}', '${p.model_version}', ${p.confidence})`
  ).join(',\n');

  console.log(`Computed ${result.predictions.length} Holt Linear predictions.`);
  fs.writeFileSync('scratch/predictions_sql_values.txt', valuesSql);
}

main();
