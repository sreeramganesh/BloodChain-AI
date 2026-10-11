import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iaaidwwrjpgpktcqynva.supabase.co';
const supabaseKey = 'sb_publishable_9ft466dKS3I1O4Bx_9-97g_smz2vd8i';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuthRead() {
  console.log('Testing authentication...');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@apollo.org',
    password: 'password123'
  });

  if (authErr) {
    console.log('Auth error:', authErr.message);
  } else {
    console.log('Auth success for:', authData.user.email);
    const tables = ['historical_demand', 'demand_predictions', 'shortage_risks', 'expiry_risks', 'ai_recommendations'];
    for (const t of tables) {
      const { data, count, error } = await supabase.from(t).select('*', { count: 'exact' });
      if (error) {
        console.log(`Table [${t}] with AUTH: ERROR ${error.message}`);
      } else {
        console.log(`Table [${t}] with AUTH: COUNT = ${count}`);
        if (data && data.length > 0) {
          console.log(`  Sample row: ${JSON.stringify(data[0])}`);
        }
      }
    }
  }
}

checkAuthRead();
