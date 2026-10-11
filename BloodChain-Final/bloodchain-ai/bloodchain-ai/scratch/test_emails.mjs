import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testEmails() {
  const emails = [
    'admin@apollo.org',
    'staff@bloodbank.org',
    'donor@bloodchain.ai',
    'admin@bloodchain.ai',
    'keerthiga@bloodchain.ai'
  ];

  for (const email of emails) {
    const res = await supabase.auth.signInWithPassword({
      email,
      password: 'password123'
    });
    console.log(`SignIn ${email}:`, res.error ? res.error.message : 'SUCCESS');
  }
}

testEmails();
