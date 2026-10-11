import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testRpc() {
  const rpcs = ['exec_sql', 'execute_sql', 'sql', 'run_sql', 'exec'];
  for (const rpc of rpcs) {
    const res = await supabase.rpc(rpc, { sql: 'SELECT 1;' });
    console.log(`RPC ${rpc}:`, res.error ? res.error.message : 'EXISTS!');
  }
}

testRpc();
