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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const res1 = await supabase.from('demand_predictions').select('*');
  console.log('demand_predictions:', res1.error ? res1.error : res1.data.length);

  const res2 = await supabase.from('shortage_risks').select('*');
  console.log('shortage_risks:', res2.error ? res2.error : res2.data.length);

  const res3 = await supabase.from('expiry_risks').select('*');
  console.log('expiry_risks:', res3.error ? res3.error : res3.data.length);

  const res4 = await supabase.from('ai_recommendations').select('*');
  console.log('ai_recommendations:', res4.error ? res4.error : res4.data.length);

  const res5 = await supabase.from('historical_demand').select('*');
  console.log('historical_demand:', res5.error ? res5.error : res5.data.length);
}

check();
