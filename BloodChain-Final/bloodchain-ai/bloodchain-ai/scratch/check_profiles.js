import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iaaidwwrjpgpktcqynva.supabase.co';
const supabaseKey = 'sb_publishable_9ft466dKS3I1O4Bx_9-97g_smz2vd8i';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
  const { data, error } = await supabase.from('profiles').select('*');
  console.log('Profiles:', data);
}

checkProfiles();
