import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testAuthInsert() {
  const login = await supabase.auth.signInWithPassword({
    email: 'admin@apollo.org',
    password: 'password123'
  });
  console.log('Login status:', login.error ? login.error.message : 'Logged in!');

  if (!login.error) {
    const test = await supabase.from('facilities').insert({
      name: 'Test Temp Facility',
      facility_type: 'Hospital',
      district: 'Trichy',
      state: 'Tamil Nadu'
    }).select();
    console.log('Insert facility:', test.error ? test.error.message : test.data);

    if (test.data && test.data.length > 0) {
      await supabase.from('facilities').delete().eq('id', test.data[0].id);
      console.log('Cleaned up test facility');
    }
  }
}

testAuthInsert();
