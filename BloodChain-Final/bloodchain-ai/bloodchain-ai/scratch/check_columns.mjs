import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkColumns() {
  // Let's test inserting a dummy row into blood_inventory to see what happens
  console.log('Testing insert with total_units...');
  const test1 = await supabase.from('blood_inventory').insert({
    hospital: 'Test Hospital',
    blood_group: 'A+',
    available_units: 10,
    reserved_units: 2,
    total_units: 12,
    expiry_date: '2026-10-30',
    status: 'Sufficient',
    location: 'Test'
  }).select();

  console.log('test1 result with total_units:', test1.error ? test1.error : test1.data);

  if (test1.error && test1.error.message.includes('generated column')) {
    console.log('total_units is a GENERATED ALWAYS column in PostgreSQL!');
  }

  // Check if test1 inserted without total_units
  const test2 = await supabase.from('blood_inventory').insert({
    hospital: 'Test Hospital',
    blood_group: 'A+',
    available_units: 10,
    reserved_units: 2,
    expiry_date: '2026-10-30',
    status: 'Sufficient',
    location: 'Test'
  }).select();

  console.log('test2 result without total_units:', test2.error ? test2.error : test2.data);

  // If test2 succeeded, clean it up immediately
  if (test2.data && test2.data.length > 0) {
    const id = test2.data[0].id;
    await supabase.from('blood_inventory').delete().eq('id', id);
    console.log('Cleaned up test row', id);
  }

  // Check if batch_id or data_type column exists
  const test3 = await supabase.from('blood_inventory').insert({
    hospital: 'Test Hospital',
    blood_group: 'A+',
    available_units: 10,
    reserved_units: 2,
    expiry_date: '2026-10-30',
    status: 'Sufficient',
    location: 'Test',
    batch_id: 'BATCH-001',
    data_type: 'Synthetic/Demo'
  }).select();

  console.log('test3 result with batch_id & data_type:', test3.error ? test3.error.message : 'Columns exist!');
  if (test3.data && test3.data.length > 0) {
    await supabase.from('blood_inventory').delete().eq('id', test3.data[0].id);
  }
}

checkColumns();
