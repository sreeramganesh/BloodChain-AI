import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iaaidwwrjpgpktcqynva.supabase.co';
const supabaseKey = 'sb_publishable_9ft466dKS3I1O4Bx_9-97g_smz2vd8i';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const tables = [
    'facilities',
    'blood_inventory',
    'historical_demand',
    'demand_predictions',
    'shortage_risks',
    'expiry_risks',
    'ai_recommendations',
    'blood_requests',
    'transfers',
    'profiles',
    'notifications'
  ];

  console.log('=== SUPABASE TABLE AUDIT ===');
  for (const table of tables) {
    try {
      const { data, count, error } = await supabase.from(table).select('*', { count: 'exact' }).limit(3);
      if (error) {
        console.log(`Table [${table}]: ERROR ${error.code} - ${error.message}`);
      } else {
        console.log(`Table [${table}]: COUNT = ${count}`);
        if (data && data.length > 0) {
          console.log(`  Columns: ${Object.keys(data[0]).join(', ')}`);
          console.log(`  Sample row: ${JSON.stringify(data[0])}`);
        }
      }
    } catch (e) {
      console.log(`Table [${table}]: EXCEPTION ${e.message}`);
    }
  }
}

inspect();
