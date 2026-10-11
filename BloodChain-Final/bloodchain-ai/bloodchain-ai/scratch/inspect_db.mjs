import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
}

const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log('Connecting to:', supabaseUrl);

  const tables = [
    'facilities',
    'blood_inventory',
    'blood_requests',
    'donors',
    'transfers',
    'demand_predictions',
    'shortage_risks',
    'expiry_risks',
    'ai_recommendations',
    'historical_demand'
  ];

  for (const table of tables) {
    const { data, count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: false })
      .limit(2);
    
    if (error) {
      console.log(`Table [${table}]: ERROR ->`, error.message);
    } else {
      console.log(`Table [${table}]: Count = ${count}`);
      if (data && data.length > 0) {
        console.log(`  Sample keys for [${table}]:`, Object.keys(data[0]));
        console.log(`  Sample row:`, JSON.stringify(data[0]));
      }
    }
  }
}

inspect().catch(console.error);
