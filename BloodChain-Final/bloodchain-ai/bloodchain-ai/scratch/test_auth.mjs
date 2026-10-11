import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testAuth() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@apollo.org',
    password: 'password123'
  });
  console.log('signIn admin@apollo.org:', error ? error.message : 'SUCCESS! User: ' + data.user?.id);

  // Let's also check if any user exists or if signup works
  if (error) {
    const signup = await supabase.auth.signUp({
      email: 'admin@apollo.org',
      password: 'password123'
    });
    console.log('signUp admin@apollo.org:', signup.error ? signup.error.message : 'SUCCESS! User: ' + signup.data.user?.id);
  }
}

testAuth();
